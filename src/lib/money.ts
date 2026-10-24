/**
 * Sale arithmetic shared by the POS screen and the API, so the total a cashier
 * sees is exactly the total the server records. Pure functions, no I/O.
 *
 * All amounts are rounded to cents at each step that produces a stored value.
 */

export type Discount = { type: "percent" | "amount"; value: number };

export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Money value of a discount on `base`, clamped to 0..base. */
export function discountValue(discount: Discount | null | undefined, base: number) {
  if (!discount || !(discount.value > 0) || base <= 0) return 0;
  const raw = discount.type === "percent" ? (base * Math.min(discount.value, 100)) / 100 : discount.value;
  return round2(Math.min(Math.max(raw, 0), base));
}

export type PricedLine = { unitPrice: number; quantity: number; discount?: Discount | null };

export type SaleTotals = {
  lines: Array<{ gross: number; discountAmount: number; subtotal: number }>;
  /** Before any discount. */
  gross: number;
  /** After line discounts, before the whole-sale discount. */
  itemsTotal: number;
  saleDiscountAmount: number;
  /** What the customer pays. */
  total: number;
  /** Line + sale discounts as a share of `gross`, 0..100. */
  discountPercent: number;
};

export function computeSaleTotals(lines: PricedLine[], saleDiscount?: Discount | null): SaleTotals {
  const priced = lines.map((l) => {
    const gross = round2(l.unitPrice * l.quantity);
    const discountAmount = discountValue(l.discount, gross);
    return { gross, discountAmount, subtotal: round2(gross - discountAmount) };
  });
  const gross = round2(priced.reduce((s, l) => s + l.gross, 0));
  const itemsTotal = round2(priced.reduce((s, l) => s + l.subtotal, 0));
  const saleDiscountAmount = discountValue(saleDiscount, itemsTotal);
  const total = round2(itemsTotal - saleDiscountAmount);
  const discountPercent = gross > 0 ? round2(((gross - total) / gross) * 100) : 0;
  return { lines: priced, gross, itemsTotal, saleDiscountAmount, total, discountPercent };
}

/** Change due for a cash payment; null when the cash doesn't cover the total. */
export function changeDue(total: number, cashReceived: number) {
  const change = round2(cashReceived - total);
  return change >= 0 ? change : null;
}

/**
 * What one unit of a sale line is worth after both discounts, i.e. what to
 * refund per returned unit. The whole-sale discount is spread over lines in
 * proportion to their subtotals.
 */
export function refundPerUnit(
  line: { subtotal: number; quantity: number },
  invoice: { totalAmount: number; discountAmount: number },
) {
  const itemsTotal = invoice.totalAmount + invoice.discountAmount;
  const share = itemsTotal > 0 ? line.subtotal / itemsTotal : 0;
  const lineNet = line.subtotal - invoice.discountAmount * share;
  return line.quantity > 0 ? lineNet / line.quantity : 0;
}
