import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth";
import type { DeliveryStatus } from "@prisma/client";

const VALID_STATUSES: DeliveryStatus[] = [
  "PENDING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiRole("ADMIN", "EMPLOYEE");
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const status = typeof body?.status === "string" ? body.status : "";
  if (!VALID_STATUSES.includes(status as DeliveryStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const invoice = await prisma.salesInvoice.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!invoice || !invoice.isDelivery) {
    return NextResponse.json({ error: "Delivery order not found" }, { status: 404 });
  }

  if (invoice.deliveryStatus === "CANCELLED") {
    return NextResponse.json({ error: "This order is already cancelled" }, { status: 409 });
  }

  const shouldRestoreStock = status === "CANCELLED";

  const updated = await prisma.$transaction(async (tx) => {
    if (shouldRestoreStock) {
      for (const line of invoice.items) {
        await tx.item.update({
          where: { id: line.itemId },
          data: { quantityInStock: { increment: line.quantity } },
        });
      }
    }
    return tx.salesInvoice.update({
      where: { id },
      data: { deliveryStatus: status as DeliveryStatus },
    });
  });

  return NextResponse.json(updated);
}
