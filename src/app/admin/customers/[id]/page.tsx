import { notFound } from "next/navigation";
import { ArrowLeft, Phone, ReceiptText, Receipt, Wallet, CalendarClock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import StatCard from "@/components/layout/StatCard";
import { EmptyState, LinkButton, PageHeader, Table, TBody, TD, TH, THead, TR } from "@/components/ui";
import { getI18n } from "@/i18n/server";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { t, f } = await getI18n();
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      salesInvoices: {
        orderBy: { date: "desc" },
        include: { items: true },
      },
    },
  });

  if (!customer) notFound();

  const invoices = customer.salesInvoices;
  const lifetime = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  return (
    <div>
      <PageHeader
        eyebrow={t.customers.eyebrow}
        title={customer.name}
        description={
          <span className="inline-flex items-center gap-1.5 tabular-nums">
            <Phone className="size-3.5" aria-hidden />
            {customer.phone}
          </span>
        }
        actions={
          <LinkButton href="/admin/customers" variant="ghost" icon={ArrowLeft}>
            {t.customers.allCustomers}
          </LinkButton>
        }
      />

      <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-3">
        <StatCard label={t.customers.invoiceCount} value={invoices.length} icon={Receipt} />
        <StatCard label={t.customers.lifetime} value={f.money(lifetime)} icon={Wallet} tone="accent" />
        <StatCard
          label={t.customers.lastVisit}
          value={invoices[0] ? f.date(invoices[0].date) : t.customers.never}
          icon={CalendarClock}
          tone="info"
        />
      </div>

      <h2 className="mb-3 mt-10 text-sm font-semibold text-fg">{t.customers.history}</h2>
      {invoices.length === 0 ? (
        <div className="border-t border-border">
          <EmptyState icon={ReceiptText} title={t.customers.noInvoices} />
        </div>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>{t.customers.colDate}</TH>
              <TH numeric>{t.customers.colItems}</TH>
              <TH numeric>{t.customers.colTotal}</TH>
              <TH>
                <span className="sr-only">{t.common.actions}</span>
              </TH>
            </TR>
          </THead>
          <TBody>
            {invoices.map((inv) => (
              <TR key={inv.id}>
                <TD className="tabular-nums">{f.date(inv.date)}</TD>
                <TD numeric>{inv.items.reduce((sum, i) => sum + i.quantity, 0)}</TD>
                <TD numeric className="font-medium text-fg">
                  {f.money(inv.totalAmount)}
                </TD>
                <TD className="w-px text-end">
                  <LinkButton href={`/invoices/${inv.id}`} variant="ghost" size="sm" icon={ReceiptText}>
                    {t.customers.invoice}
                  </LinkButton>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
