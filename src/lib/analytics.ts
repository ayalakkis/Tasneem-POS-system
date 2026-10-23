import { prisma } from "./prisma";
import { notCancelled } from "./salesFilters";
import type { DeliveryStatus } from "@prisma/client";

/**
 * A local-calendar-day key (not `toISOString().slice(0, 10)`, which is UTC-based
 * and shifts to the wrong day whenever the server's local timezone isn't UTC).
 */
function localDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function getProfitByDay(days: number) {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() + 1);
  const start = new Date(end);
  start.setDate(start.getDate() - days);

  const items = await prisma.salesInvoiceItem.findMany({
    where: {
      salesInvoice: {
        date: { gte: start, lt: end },
        ...notCancelled,
      },
    },
    select: {
      unitPrice: true,
      unitCost: true,
      quantity: true,
      salesInvoice: { select: { date: true } },
    },
  });

  const dayKeys: string[] = [];
  const labels = new Map<string, string>();
  const totals = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = localDateKey(d);
    dayKeys.push(key);
    labels.set(key, d.toLocaleDateString(undefined, { month: "short", day: "numeric" }));
    totals.set(key, 0);
  }

  for (const line of items) {
    const key = localDateKey(line.salesInvoice.date);
    const profit = (line.unitPrice - line.unitCost) * line.quantity;
    totals.set(key, (totals.get(key) ?? 0) + profit);
  }

  return dayKeys.map((key) => ({
    label: labels.get(key)!,
    profit: Math.round((totals.get(key) ?? 0) * 100) / 100,
  }));
}

export async function getDeliveryStatusCounts(): Promise<Record<DeliveryStatus, number>> {
  const rows = await prisma.salesInvoice.groupBy({
    by: ["deliveryStatus"],
    where: { isDelivery: true },
    _count: { _all: true },
  });

  const counts: Record<DeliveryStatus, number> = {
    PENDING: 0,
    OUT_FOR_DELIVERY: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  };
  for (const row of rows) {
    if (row.deliveryStatus) counts[row.deliveryStatus] = row._count._all;
  }
  return counts;
}

export async function getRevenueByCategory(start: Date, end: Date) {
  const items = await prisma.salesInvoiceItem.findMany({
    where: {
      salesInvoice: {
        date: { gte: start, lt: end },
        ...notCancelled,
      },
    },
    select: {
      subtotal: true,
      item: { select: { category: { select: { name: true } } } },
    },
  });

  const byCategory = new Map<string, number>();
  for (const line of items) {
    const name = line.item.category.name;
    byCategory.set(name, (byCategory.get(name) ?? 0) + line.subtotal);
  }

  return Array.from(byCategory.entries())
    .map(([category, revenue]) => ({ category, revenue: Math.round(revenue * 100) / 100 }))
    .sort((a, b) => b.revenue - a.revenue);
}
