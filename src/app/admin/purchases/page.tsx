import { ShoppingCart, PackagePlus, Wallet, ReceiptText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import StatCard from "@/components/layout/StatCard";
import { EmptyState, PageHeader, Table, TBody, TD, TH, THead, TR } from "@/components/ui";
import { getI18n } from "@/i18n/server";
import PurchaseForm from "./PurchaseForm";

export default async function PurchasesPage() {
  const [purchases, items, supplierRows, { t, f }] = await Promise.all([
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
    getI18n(),
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
        eyebrow={t.nav.catalog}
        title={t.purchases.title}
        description={t.purchases.description}
      />

      <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-3">
        <StatCard label={t.purchases.thisMonth} value={thisMonth.length} icon={ShoppingCart} />
        <StatCard label={t.purchases.unitsThisMonth} value={unitsThisMonth} icon={PackagePlus} tone="info" />
        <StatCard label={t.purchases.spentThisMonth} value={f.money(spentThisMonth)} icon={Wallet} tone="accent" />
      </div>

      <div className="mt-8">
        <PurchaseForm
          items={items.map((i) => ({ id: i.id, name: i.name, costPrice: i.costPrice }))}
          knownSuppliers={knownSuppliers}
        />
      </div>

      <h2 className="mb-3 mt-10 text-sm font-semibold text-fg">{t.purchases.history}</h2>
      {purchases.length === 0 ? (
        <div className="border-t border-border">
          <EmptyState
            icon={ReceiptText}
            title={t.purchases.emptyTitle}
            description={t.purchases.emptyDescription}
          />
        </div>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>{t.purchases.colDate}</TH>
              <TH>{t.purchases.colItem}</TH>
              <TH numeric>{t.purchases.colQty}</TH>
              <TH numeric>{t.purchases.colUnitCost}</TH>
              <TH numeric>{t.purchases.colTotalPaid}</TH>
              <TH>{t.purchases.colSupplier}</TH>
              <TH>{t.purchases.colRecordedBy}</TH>
            </TR>
          </THead>
          <TBody>
            {purchases.map((p) => (
              <TR key={p.id}>
                <TD className="whitespace-nowrap tabular-nums">{f.date(p.date)}</TD>
                <TD className="font-medium text-fg">{p.item.name}</TD>
                <TD numeric>{p.quantity}</TD>
                <TD numeric>{f.money(p.unitCost)}</TD>
                <TD numeric className="font-medium text-fg">
                  {f.money(p.totalPaid)}
                </TD>
                <TD>{p.supplier ?? ""}</TD>
                <TD>{p.createdBy.username}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
