import { Receipt, Coins, ShoppingBasket, ReceiptText, ShoppingBag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import StatCard from "@/components/layout/StatCard";
import { EmptyState, LinkButton, PageHeader, Table, TBody, TD, TH, THead, TR } from "@/components/ui";
import { getI18n } from "@/i18n/server";

export default async function TodaysInvoicesPage() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { t, f } = await getI18n();
  const invoices = await prisma.salesInvoice.findMany({
    where: { date: { gte: startOfDay } },
    select: {
      id: true,
      date: true,
      totalAmount: true,
      customer: { select: { name: true } },
      createdBy: { select: { username: true } },
      items: { select: { quantity: true } },
    },
    orderBy: { date: "desc" },
  });

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalItemsSold = invoices.reduce(
    (sum, inv) => sum + inv.items.reduce((s, i) => s + i.quantity, 0),
    0
  );

  return (
    <div>
      <PageHeader eyebrow={t.nav.pointOfSale} title={t.today.title} description={t.today.description} />

      <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-3">
        <StatCard hero label={t.today.revenue} value={f.money(totalRevenue)} icon={Coins} />
        <StatCard label={t.today.sales} value={invoices.length} icon={Receipt} />
        <StatCard label={t.today.itemsSold} value={totalItemsSold} icon={ShoppingBasket} tone="info" />
      </div>

      <div className="mt-8">
        {invoices.length === 0 ? (
          <div className="border-t border-border">
            <EmptyState
              icon={ReceiptText}
              title={t.today.emptyTitle}
              description={t.today.emptyDescription}
              action={
                <LinkButton href="/pos" icon={ShoppingBag}>
                  {t.today.start}
                </LinkButton>
              }
            />
          </div>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>{t.today.colTime}</TH>
                <TH>{t.today.colCustomer}</TH>
                <TH numeric>{t.today.colItems}</TH>
                <TH numeric>{t.today.colTotal}</TH>
                <TH>{t.today.colBy}</TH>
                <TH>
                  <span className="sr-only">{t.common.actions}</span>
                </TH>
              </TR>
            </THead>
            <TBody>
              {invoices.map((inv) => (
                <TR key={inv.id}>
                  <TD className="tabular-nums">{f.time(inv.date)}</TD>
                  <TD className={inv.customer ? "font-medium text-fg" : "text-fg-subtle"}>
                    {inv.customer?.name ?? t.common.guest}
                  </TD>
                  <TD numeric>{inv.items.reduce((sum, i) => sum + i.quantity, 0)}</TD>
                  <TD numeric className="font-medium text-fg">
                    {f.money(inv.totalAmount)}
                  </TD>
                  <TD>{inv.createdBy.username}</TD>
                  <TD className="w-px text-end">
                    <LinkButton href={`/invoices/${inv.id}`} variant="ghost" size="sm" icon={ReceiptText}>
                      {t.today.view}
                    </LinkButton>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </div>
    </div>
  );
}
