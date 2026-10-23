import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth";
import {
  isUniqueConstraintError,
  isForeignKeyConstraintError,
  isNotFoundError,
} from "@/lib/prisma-errors";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiRole("ADMIN");
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const item = await prisma.item.findUnique({ where: { id }, include: { category: true } });
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiRole("ADMIN");
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const categoryId = typeof body?.categoryId === "string" ? body.categoryId : "";
  const barcode =
    typeof body?.barcode === "string" && body.barcode.trim() ? body.barcode.trim() : null;
  const origin =
    typeof body?.origin === "string" && body.origin.trim() ? body.origin.trim() : null;
  const costPrice = Number(body?.costPrice);
  const sellingPrice = Number(body?.sellingPrice);

  if (!name || !categoryId || !Number.isFinite(costPrice) || !Number.isFinite(sellingPrice)) {
    return NextResponse.json(
      { error: "Name, category, cost price, and selling price are required" },
      { status: 400 }
    );
  }
  if (costPrice < 0 || sellingPrice < 0) {
    return NextResponse.json({ error: "Prices cannot be negative" }, { status: 400 });
  }

  try {
    const item = await prisma.item.update({
      where: { id },
      data: { name, categoryId, barcode, origin, costPrice, sellingPrice },
    });
    return NextResponse.json(item);
  } catch (e) {
    if (isUniqueConstraintError(e)) {
      return NextResponse.json(
        { error: "An item with this barcode already exists" },
        { status: 409 }
      );
    }
    if (isNotFoundError(e)) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    throw e;
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiRole("ADMIN");
  if ("error" in auth) return auth.error;
  const { id } = await params;

  try {
    await prisma.item.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (isForeignKeyConstraintError(e)) {
      return NextResponse.json(
        { error: "Cannot delete an item that has purchase or sales history." },
        { status: 409 }
      );
    }
    if (isNotFoundError(e)) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    throw e;
  }
}
