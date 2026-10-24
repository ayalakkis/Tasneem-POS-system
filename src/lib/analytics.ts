import { prisma } from "./prisma";
import { notCancelled } from "./salesFilters";
import { getProfitEvents } from "./profit";
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

  const events = await getProfitEvents(start, end);

  const dayKeys: string[] = [];
  const totals = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = localDateKey(d);
    dayKeys.push(key);
    totals.set(key, 0);
  }

  for (const event of events) {
    const key = localDateKey(event.date);
    totals.set(key, (totals.get(key) ?? 0) + event.profit);
  }

  return dayKeys.map((key) => ({
    /** Local calendar day, "YYYY-MM-DD"; formatted for display by the chart. */
    day: key,
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

/**
 * Net revenue per category: line subtotals with the whole-sale discount spread
 * over lines in proportion to their size, minus refunds made in the range.
 */
export async function getRevenueByCategory(start: Date, end: Date) {
  const category = { item: { select: { category: { select: { name: true } } } } } as const;
  const [items, returned] = await Promise.all([
    prisma.salesInvoiceItem.findMany({
      where: {
        salesInvoice: {
          date: { gte: start, lt: end },
          ...notCancelled,
        },
      },
      select: {
        subtotal: true,
        salesInvoice: { select: { totalAmount: true, discountAmount: true } },
        ...category,
      },
    }),
    prisma.salesReturnItem.findMany({
      where: { salesReturn: { date: { gte: start, lt: end }, salesInvoice: notCancelled } },
      select: { refundAmount: true, salesInvoiceItem: { select: category } },
    }),
  ]);

  const byCategory = new Map<string, number>();
  const add = (name: string, amount: number) => byCategory.set(name, (byCategory.get(name) ?? 0) + amount);
  for (const line of items) {
    const { totalAmount, discountAmount } = line.salesInvoice;
    const itemsTotal = totalAmount + discountAmount;
    const share = itemsTotal > 0 ? line.subtotal / itemsTotal : 0;
    add(line.item.category.name, line.subtotal - discountAmount * share);
  }
  for (const r of returned) add(r.salesInvoiceItem.item.category.name, -r.refundAmount);

  return Array.from(byCategory.entries())
    .map(([category, revenue]) => ({ category, revenue: Math.round(revenue * 100) / 100 }))
    .sort((a, b) => b.revenue - a.revenue);
}
