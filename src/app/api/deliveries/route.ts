import { NextRequest, NextResponse } from "next/server";
import { getI18n } from "@/i18n/server";
import { fill } from "@/i18n/plural";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth";

export async function GET() {
  const auth = await requireApiRole("ADMIN", "EMPLOYEE");
  if ("error" in auth) return auth.error;

  const deliveries = await prisma.salesInvoice.findMany({
    where: { isDelivery: true },
    include: {
      customer: true,
      items: { include: { item: { select: { name: true } } } },
      createdBy: { select: { username: true } },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(deliveries);
}

export async function POST(request: NextRequest) {
  const { t } = await getI18n();
  const auth = await requireApiRole("ADMIN", "EMPLOYEE");
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const customerId = typeof body?.customerId === "string" ? body.customerId : "";
  const deliveryAddress =
    typeof body?.deliveryAddress === "string" ? body.deliveryAddress.trim() : "";
  const lines = Array.isArray(body?.items) ? body.items : [];

  if (!customerId || !deliveryAddress) {
    return NextResponse.json(
      { error: t.errors.customerAndAddressRequired },
      { status: 400 }
    );
  }
  if (lines.length === 0) {
    return NextResponse.json({ error: t.errors.itemsRequired }, { status: 400 });
  }

  const parsedLines: { itemId: string; quantity: number }[] = [];
  for (const line of lines) {
    const itemId = typeof line?.itemId === "string" ? line.itemId : "";
    const quantity = Number(line?.quantity);
    if (!itemId || !Number.isInteger(quantity) || quantity <= 0) {
      return NextResponse.json(
        { error: t.errors.invalidLine },
        { status: 400 }
      );
    }
    parsedLines.push({ itemId, quantity });
  }

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) {
    return NextResponse.json({ error: t.errors.customerNotFound }, { status: 404 });
  }

  const itemIds = parsedLines.map((l) => l.itemId);
  const items = await prisma.item.findMany({ where: { id: { in: itemIds } } });
  const itemById = new Map(items.map((i) => [i.id, i]));

  for (const line of parsedLines) {
    const item = itemById.get(line.itemId);
    if (!item) {
      return NextResponse.json({ error: t.errors.itemGone }, { status: 404 });
    }
    if (item.quantityInStock < line.quantity) {
      return NextResponse.json(
        { error: fill(t.errors.notEnoughStock, { name: item.name, count: item.quantityInStock }) },
        { status: 409 }
      );
    }
  }

  const invoiceItemsData = parsedLines.map((line) => {
    const item = itemById.get(line.itemId)!;
    return {
      itemId: item.id,
      quantity: line.quantity,
      unitPrice: item.sellingPrice,
      unitCost: item.costPrice,
      subtotal: item.sellingPrice * line.quantity,
    };
  });
  const totalAmount = invoiceItemsData.reduce((sum, l) => sum + l.subtotal, 0);

  const invoice = await prisma.$transaction(async (tx) => {
    const created = await tx.salesInvoice.create({
      data: {
        customerId,
        totalAmount,
        createdById: auth.session.userId,
        isDelivery: true,
        deliveryAddress,
        deliveryStatus: "PENDING",
        items: { create: invoiceItemsData },
      },
    });

    for (const line of parsedLines) {
      await tx.item.update({
        where: { id: line.itemId },
        data: { quantityInStock: { decrement: line.quantity } },
      });
    }

    return created;
  });

  return NextResponse.json({ id: invoice.id }, { status: 201 });
}
