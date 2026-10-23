import { ShoppingCart, PackagePlus, Wallet, ReceiptText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import StatCard from "@/components/layout/StatCard";
import { EmptyState, PageHeader, Table, TBody, TD, TH, THead, TR } from "@/components/ui";
import PurchaseForm from "./PurchaseForm";

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

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
      <PageHeader
        eyebrow="Catalog"
        title="Purchases"
        description="Recording a purchase increases stock and updates the item's cost price."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Purchases this month" value={thisMonth.length} icon={ShoppingCart} />
        <StatCard label="Units received this month" value={unitsThisMonth} icon={PackagePlus} tone="info" />
        <StatCard label="Spent this month" value={spentThisMonth.toFixed(2)} icon={Wallet} tone="accent" />
      </div>

      <div className="mt-8">
        <PurchaseForm
          items={items.map((i) => ({ id: i.id, name: i.name, costPrice: i.costPrice }))}
          knownSuppliers={knownSuppliers}
        />
      </div>

      <h2 className="mb-3 mt-10 text-sm font-semibold text-fg">History</h2>
      {purchases.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface shadow-sm">
          <EmptyState
            icon={ReceiptText}
            title="No purchases yet"
            description="Purchases you record above will be listed here."
          />
        </div>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Date</TH>
              <TH>Item</TH>
              <TH numeric>Qty</TH>
              <TH numeric>Unit cost</TH>
              <TH numeric>Total paid</TH>
              <TH>Supplier</TH>
              <TH>Recorded by</TH>
            </TR>
          </THead>
          <TBody>
            {purchases.map((p) => (
              <TR key={p.id}>
                <TD className="whitespace-nowrap tabular-nums">{dateFormat.format(p.date)}</TD>
                <TD className="font-medium text-fg">{p.item.name}</TD>
                <TD numeric>{p.quantity}</TD>
                <TD numeric>{p.unitCost.toFixed(2)}</TD>
                <TD numeric className="font-medium text-fg">
                  {p.totalPaid.toFixed(2)}
                </TD>
                <TD>{p.supplier ?? <span className="text-fg-subtle">—</span>}</TD>
                <TD>{p.createdBy.username}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
