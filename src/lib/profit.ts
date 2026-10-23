import { prisma } from "./prisma";
import { notCancelled } from "./salesFilters";

export async function getProfitForRange(start: Date, end: Date): Promise<number> {
  const items = await prisma.salesInvoiceItem.findMany({
    where: {
      salesInvoice: {
        date: { gte: start, lt: end },
        ...notCancelled,
      },
    },
    select: { unitPrice: true, unitCost: true, quantity: true },
  });
  return items.reduce((sum, i) => sum + (i.unitPrice - i.unitCost) * i.quantity, 0);
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
