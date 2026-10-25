import { NextRequest, NextResponse } from "next/server";
import { getI18n } from "@/i18n/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth";
import { isUniqueConstraintError } from "@/lib/prisma-errors";

export async function GET(request: NextRequest) {
  const auth = await requireApiRole("ADMIN");
  if ("error" in auth) return auth.error;

  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q")?.trim() ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";

  const items = await prisma.item.findMany({
    where: {
      ...(categoryId ? { categoryId } : {}),
      ...(q ? { OR: [{ name: { contains: q } }, { barcode: { contains: q } }] } : {}),
    },
    include: { category: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const { t } = await getI18n();
  const auth = await requireApiRole("ADMIN");
  if ("error" in auth) return auth.error;

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
      { error: t.errors.itemFieldsRequired },
      { status: 400 }
    );
  }
  if (costPrice < 0 || sellingPrice < 0) {
    return NextResponse.json({ error: t.errors.negativePrice }, { status: 400 });
  }

  try {
    const item = await prisma.item.create({
      data: { name, categoryId, barcode, origin, costPrice, sellingPrice },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    if (isUniqueConstraintError(e)) {
      return NextResponse.json(
        { error: t.errors.barcodeExists },
        { status: 409 }
      );
    }
    throw e;
  }
}
