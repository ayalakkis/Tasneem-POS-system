import { Receipt, Coins, ShoppingBasket, ReceiptText, ShoppingBag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import StatCard from "@/components/layout/StatCard";
import { EmptyState, LinkButton, PageHeader, Table, TBody, TD, TH, THead, TR } from "@/components/ui";

const timeFormat = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });

export default async function TodaysInvoicesPage() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

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
      <PageHeader eyebrow="Point of sale" title="Today's invoices" description="Every sale rung up since midnight." />

      <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-3">
        <StatCard hero label="Revenue today" value={totalRevenue.toFixed(2)} icon={Coins} />
        <StatCard label="Sales today" value={invoices.length} icon={Receipt} />
        <StatCard label="Items sold" value={totalItemsSold} icon={ShoppingBasket} tone="info" />
      </div>

      <div className="mt-8">
        {invoices.length === 0 ? (
          <div className="border-t border-border">
            <EmptyState
              icon={ReceiptText}
              title="No sales yet today"
              description="Completed sales show up here so you can reprint a receipt."
              action={
                <LinkButton href="/pos" icon={ShoppingBag}>
                  Start a sale
                </LinkButton>
              }
            />
          </div>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Time</TH>
                <TH>Customer</TH>
                <TH numeric>Items</TH>
                <TH numeric>Total</TH>
                <TH>Rung up by</TH>
                <TH>
                  <span className="sr-only">Actions</span>
                </TH>
              </TR>
            </THead>
            <TBody>
              {invoices.map((inv) => (
                <TR key={inv.id}>
                  <TD className="tabular-nums">{timeFormat.format(inv.date)}</TD>
                  <TD className={inv.customer ? "font-medium text-fg" : "text-fg-subtle"}>
                    {inv.customer?.name ?? "Guest"}
                  </TD>
                  <TD numeric>{inv.items.reduce((sum, i) => sum + i.quantity, 0)}</TD>
                  <TD numeric className="font-medium text-fg">
                    {inv.totalAmount.toFixed(2)}
                  </TD>
                  <TD>{inv.createdBy.username}</TD>
                  <TD className="w-px text-end">
                    <LinkButton href={`/invoices/${inv.id}`} variant="ghost" size="sm" icon={ReceiptText}>
                      View / print
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
