import { NextRequest, NextResponse } from "next/server";
import { getI18n } from "@/i18n/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth";

export async function GET() {
  const auth = await requireApiRole("ADMIN");
  if ("error" in auth) return auth.error;

  const purchases = await prisma.purchaseInvoice.findMany({
    include: { item: true, createdBy: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(purchases);
}

export async function POST(request: NextRequest) {
  const { t } = await getI18n();
  const auth = await requireApiRole("ADMIN");
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const itemId = typeof body?.itemId === "string" ? body.itemId : "";
  const quantity = Number(body?.quantity);
  const unitCost = Number(body?.unitCost);
  const totalPaid = Number(body?.totalPaid);
  const supplier =
    typeof body?.supplier === "string" && body.supplier.trim() ? body.supplier.trim() : null;
  const date = typeof body?.date === "string" && body.date ? new Date(body.date) : new Date();

  if (
    !itemId ||
    !Number.isInteger(quantity) ||
    quantity <= 0 ||
    !Number.isFinite(unitCost) ||
    unitCost < 0 ||
    !Number.isFinite(totalPaid) ||
    totalPaid < 0 ||
    Number.isNaN(date.getTime())
  ) {
    return NextResponse.json(
      { error: t.errors.purchaseFieldsRequired },
      { status: 400 }
    );
  }

  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) {
    return NextResponse.json({ error: t.errors.itemNotFound }, { status: 404 });
  }

  const [purchase] = await prisma.$transaction([
    prisma.purchaseInvoice.create({
      data: {
        itemId,
        quantity,
        unitCost,
        totalPaid,
        supplier,
        date,
        createdById: auth.session.userId,
      },
    }),
    prisma.item.update({
      where: { id: itemId },
      data: {
        quantityInStock: { increment: quantity },
        costPrice: unitCost,
      },
    }),
  ]);

  return NextResponse.json(purchase, { status: 201 });
}
