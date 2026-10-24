/**
 * Sanity checks for sale arithmetic and the profit/revenue queries.
 *
 *   npm run check:money
 *
 * Read-only: it never writes to the database.
 */
import { PrismaClient } from "@prisma/client";
import { changeDue, computeSaleTotals, discountValue, refundPerUnit, round2 } from "../src/lib/money";
import { getProfitForRange, getDateRanges } from "../src/lib/profit";
import { getRevenueByCategory } from "../src/lib/analytics";
import { notCancelled } from "../src/lib/salesFilters";

const prisma = new PrismaClient();
let failures = 0;

function check(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `\n      expected ${JSON.stringify(expected)}\n      actual   ${JSON.stringify(actual)}`}`);
}

async function main() {
  console.log("Money maths");
  check("percent discount", discountValue({ type: "percent", value: 10 }, 55), 5.5);
  check("amount discount", discountValue({ type: "amount", value: 7 }, 55), 7);
  check("discount never exceeds the price", discountValue({ type: "amount", value: 80 }, 55), 55);
  check("percent capped at 100", discountValue({ type: "percent", value: 150 }, 20), 20);
  check("negative discount ignored", discountValue({ type: "amount", value: -5 }, 20), 0);
  check("no discount", discountValue(null, 20), 0);

  const t = computeSaleTotals(
    [
      { unitPrice: 30, quantity: 3, discount: { type: "percent", value: 10 } }, // 90 - 9 = 81
      { unitPrice: 40, quantity: 1 }, // 40
      { unitPrice: 8, quantity: 2, discount: { type: "amount", value: 1 } }, // 16 - 1 = 15
    ],
    { type: "amount", value: 6 },
  );
  check("line subtotals", t.lines.map((l) => l.subtotal), [81, 40, 15]);
  check("items total", t.itemsTotal, 136);
  check("sale discount", t.saleDiscountAmount, 6);
  check("total", t.total, 130);
  check("overall discount %", t.discountPercent, round2((16 / 146) * 100));

  const thirds = computeSaleTotals([{ unitPrice: 10, quantity: 3 }], { type: "percent", value: 33.333 });
  check("rounding to cents", thirds.total, 20);

  check("change due", changeDue(130, 150), 20);
  check("exact cash", changeDue(130, 130), 0);
  check("not enough cash", changeDue(130, 100), null);

  // Refunding every unit of every line must give back exactly what was paid.
  const invoice = { totalAmount: t.total, discountAmount: t.saleDiscountAmount };
  const lines = [
    { subtotal: 81, quantity: 3 },
    { subtotal: 40, quantity: 1 },
    { subtotal: 15, quantity: 2 },
  ];
  const fullRefund = lines.reduce((s, l) => s + refundPerUnit(l, invoice) * l.quantity, 0);
  check("full refund equals what was paid", round2(fullRefund), t.total);

  console.log("\nQueries against the current database");
  const { year } = getDateRanges();
  const discounted = await prisma.salesInvoice.count({ where: { discountAmount: { gt: 0 } } });
  const returns = await prisma.salesReturn.count();
  console.log(`      (${discounted} discounted sales, ${returns} returns in the database)`);

  // The old formula: (price - cost) x quantity per line. Identical while there
  // are no discounts or returns.
  const oldLines = await prisma.salesInvoiceItem.findMany({
    where: { salesInvoice: { date: { gte: year.start, lt: year.end }, ...notCancelled } },
    select: { unitPrice: true, unitCost: true, quantity: true, subtotal: true },
  });
  const oldProfit = round2(oldLines.reduce((s, l) => s + (l.unitPrice - l.unitCost) * l.quantity, 0));
  const newProfit = round2(await getProfitForRange(year.start, year.end));
  if (discounted === 0 && returns === 0) {
    check("profit this year matches the old formula", newProfit, oldProfit);
  } else {
    console.log(`      profit this year: ${newProfit} (old formula, ignoring discounts/returns: ${oldProfit})`);
  }

  const revenue = await getRevenueByCategory(year.start, year.end);
  const revenueSum = round2(revenue.reduce((s, r) => s + r.revenue, 0));
  const invoiceSum = await prisma.salesInvoice.aggregate({
    where: { date: { gte: year.start, lt: year.end }, ...notCancelled },
    _sum: { totalAmount: true },
  });
  const refunds = await prisma.salesReturn.aggregate({
    where: { date: { gte: year.start, lt: year.end }, salesInvoice: notCancelled },
    _sum: { refundAmount: true },
  });
  check(
    "revenue by category adds up to sales minus refunds",
    revenueSum,
    round2((invoiceSum._sum.totalAmount ?? 0) - (refunds._sum.refundAmount ?? 0)),
  );

  console.log(failures ? `\n${failures} check(s) failed.` : "\nAll checks passed.");
  process.exitCode = failures ? 1 : 0;
}

main().finally(() => prisma.$disconnect());
