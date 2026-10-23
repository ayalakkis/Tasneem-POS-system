import { prisma } from "./prisma";

export function getDeliveries() {
  return prisma.salesInvoice.findMany({
    where: { isDelivery: true },
    select: {
      id: true,
      date: true,
      totalAmount: true,
      deliveryAddress: true,
      deliveryStatus: true,
      customer: { select: { name: true, phone: true } },
      items: { select: { quantity: true } },
    },
    orderBy: { date: "desc" },
  });
}

export type DeliveryListItem = Awaited<ReturnType<typeof getDeliveries>>[number];
