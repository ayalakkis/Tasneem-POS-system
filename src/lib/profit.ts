import { prisma } from "./prisma";
import { notCancelled } from "./salesFilters";

/**
 * One profit-affecting event. A sale adds what the customer paid minus the
 * cost of what they took; a return removes the refund and puts the cost back.
 * Each is dated by when it happened, so a refund today lowers today's profit
 * even if the sale was last month.
 */
export type ProfitEvent = { date: Date; profit: number };

export async function getProfitEvents(start: Date, end: Date): Promise<ProfitEvent[]> {
  const [sales, returns] = await Promise.all([
    prisma.salesInvoice.findMany({
      where: { date: { gte: start, lt: end }, ...notCancelled },
      select: { date: true, totalAmount: true, items: { select: { unitCost: true, quantity: true } } },
    }),
    prisma.salesReturn.findMany({
      where: { date: { gte: start, lt: end }, salesInvoice: notCancelled },
      select: { date: true, refundAmount: true, items: { select: { unitCost: true, quantity: true } } },
    }),
  ]);

  const cost = (lines: { unitCost: number; quantity: number }[]) =>
    lines.reduce((sum, l) => sum + l.unitCost * l.quantity, 0);

  return [
    ...sales.map((s) => ({ date: s.date, profit: s.totalAmount - cost(s.items) })),
    ...returns.map((r) => ({ date: r.date, profit: -(r.refundAmount - cost(r.items)) })),
  ];
}

export async function getProfitForRange(start: Date, end: Date): Promise<number> {
  const events = await getProfitEvents(start, end);
  return events.reduce((sum, e) => sum + e.profit, 0);
}

export function getDateRanges(now: Date = new Date()) {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  return {
    today: { start: startOfToday, end: endOfToday },
    week: { start: startOfWeek, end: endOfToday },
    month: { start: startOfMonth, end: endOfToday },
    year: { start: startOfYear, end: endOfToday },
  };
}
