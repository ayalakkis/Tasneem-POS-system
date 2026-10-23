import type { Prisma } from "@prisma/client";

/**
 * `deliveryStatus` is null for ordinary walk-in sales. SQL's NULL semantics mean
 * a plain `NOT: { deliveryStatus: "CANCELLED" }` (or `{ not: "CANCELLED" }`) filters
 * those rows out too, since `NULL = 'CANCELLED'` is neither true nor false. Spelling
 * out the null case explicitly is required to include ordinary sales.
 */
export const notCancelled: Prisma.SalesInvoiceWhereInput = {
  OR: [{ deliveryStatus: null }, { deliveryStatus: { not: "CANCELLED" } }],
};
