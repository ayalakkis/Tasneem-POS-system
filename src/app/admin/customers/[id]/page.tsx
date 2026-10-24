import { notFound } from "next/navigation";
import { ArrowLeft, Phone, ReceiptText, Receipt, Wallet, CalendarClock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import StatCard from "@/components/layout/StatCard";
import { EmptyState, LinkButton, PageHeader, Table, TBody, TD, TH, THead, TR } from "@/components/ui";

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
        eyebrow="Customer"
        title={customer.name}
        description={
          <span className="inline-flex items-center gap-1.5 tabular-nums">
            <Phone className="size-3.5" aria-hidden />
            {customer.phone}
          </span>
        }
        actions={
          <LinkButton href="/admin/customers" variant="ghost" icon={ArrowLeft}>
            All customers
          </LinkButton>
        }
      />

      <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-3">
        <StatCard label="Invoices" value={invoices.length} icon={Receipt} />
        <StatCard label="Lifetime spend" value={lifetime.toFixed(2)} icon={Wallet} tone="accent" />
        <StatCard
          label="Last visit"
          value={invoices[0] ? dateFormat.format(invoices[0].date) : "Never"}
          icon={CalendarClock}
          tone="info"
        />
      </div>

      <h2 className="mb-3 mt-10 text-sm font-semibold text-fg">Purchase history</h2>
      {invoices.length === 0 ? (
        <div className="border-t border-border">
          <EmptyState icon={ReceiptText} title="No invoices yet" />
        </div>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Date</TH>
              <TH numeric>Items</TH>
              <TH numeric>Total</TH>
              <TH>
                <span className="sr-only">Actions</span>
              </TH>
            </TR>
          </THead>
          <TBody>
            {invoices.map((inv) => (
              <TR key={inv.id}>
                <TD className="tabular-nums">{dateFormat.format(inv.date)}</TD>
                <TD numeric>{inv.items.reduce((sum, i) => sum + i.quantity, 0)}</TD>
                <TD numeric className="font-medium text-fg">
                  {inv.totalAmount.toFixed(2)}
                </TD>
                <TD className="w-px text-end">
                  <LinkButton href={`/invoices/${inv.id}`} variant="ghost" size="sm" icon={ReceiptText}>
                    Invoice
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
