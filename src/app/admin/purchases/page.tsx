import { ShoppingCart, PackagePlus, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import StatCard from "@/components/layout/StatCard";
import PurchaseForm from "./PurchaseForm";

export default async function PurchasesPage() {
  const [purchases, items, supplierRows] = await Promise.all([
    prisma.purchaseInvoice.findMany({
      include: { item: true, createdBy: true },
      orderBy: { date: "desc" },
    }),
    prisma.item.findMany({ orderBy: { name: "asc" } }),
    prisma.purchaseInvoice.findMany({
      where: { supplier: { not: null } },
      select: { supplier: true },
      distinct: ["supplier"],
    }),
  ]);

  const knownSuppliers = supplierRows
    .map((r) => r.supplier)
    .filter((s): s is string => Boolean(s))
    .sort((a, b) => a.localeCompare(b));

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const thisMonth = purchases.filter((p) => p.date >= startOfMonth);
  const unitsThisMonth = thisMonth.reduce((sum, p) => sum + p.quantity, 0);
  const spentThisMonth = thisMonth.reduce((sum, p) => sum + p.totalPaid, 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Purchase invoices</h1>
      <p className="mt-1 text-sm text-gray-500">
        Recording a purchase increases stock and updates the item&apos;s cost price.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Purchases this month" value={thisMonth.length} icon={ShoppingCart} />
        <StatCard
          label="Units received this month"
          value={unitsThisMonth}
          icon={PackagePlus}
          color="bg-beige-100 text-beige-700"
        />
        <StatCard
          label="Spent this month"
          value={spentThisMonth.toFixed(2)}
          icon={Wallet}
          color="bg-babyblue-200 text-babyblue-800"
        />
      </div>

      <div className="mt-6">
        <PurchaseForm
          items={items.map((i) => ({ id: i.id, name: i.name, costPrice: i.costPrice }))}
          knownSuppliers={knownSuppliers}
        />
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Unit cost</th>
              <th className="px-4 py-3">Total paid</th>
              <th className="px-4 py-3">Supplier</th>
              <th className="px-4 py-3">Recorded by</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {purchases.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 text-gray-600">{p.date.toLocaleDateString()}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{p.item.name}</td>
                <td className="px-4 py-3 text-gray-600">{p.quantity}</td>
                <td className="px-4 py-3 text-gray-600">{p.unitCost.toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-600">{p.totalPaid.toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-600">{p.supplier ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{p.createdBy.username}</td>
              </tr>
            ))}
            {purchases.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                  No purchase invoices yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
