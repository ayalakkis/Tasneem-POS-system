import Link from "next/link";
import { Users, Receipt, Repeat, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import StatCard from "@/components/layout/StatCard";
import { Badge, EmptyState, PageHeader, Table, TBody, TD, TH, THead, TR } from "@/components/ui";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { salesInvoices: true } } },
  });

  const totalInvoices = customers.reduce((sum, c) => sum + c._count.salesInvoices, 0);
  const returningCustomers = customers.filter((c) => c._count.salesInvoices > 1).length;

  return (
    <div>
      <PageHeader
        eyebrow="People & orders"
        title="Customers"
        description="Customers are added from the POS screen during checkout."
      />

      <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-3">
        <StatCard label="Total customers" value={customers.length} icon={Users} />
        <StatCard label="Total invoices" value={totalInvoices} icon={Receipt} tone="info" />
        <StatCard
          label="Returning customers"
          value={returningCustomers}
          icon={Repeat}
          tone="accent"
          hint="More than one invoice"
        />
      </div>

      <div className="mt-8">
        {customers.length === 0 ? (
          <div className="border-t border-border">
            <EmptyState
              icon={Users}
              title="No customers yet"
              description="Enter a phone number at checkout to save a customer."
            />
          </div>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Name</TH>
                <TH>Phone</TH>
                <TH numeric>Invoices</TH>
                <TH>
                  <span className="sr-only">Open</span>
                </TH>
              </TR>
            </THead>
            <TBody>
              {customers.map((c) => (
                <TR key={c.id} className="relative">
                  <TD>
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold uppercase text-primary-soft-fg"
                      >
                        {c.name.charAt(0)}
                      </span>
                      {/* The link covers the whole row (see the after: overlay). */}
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="font-medium text-fg after:absolute after:inset-0 after:content-['']"
                      >
                        {c.name}
                      </Link>
                    </div>
                  </TD>
                  <TD className="tabular-nums">{c.phone}</TD>
                  <TD numeric>
                    {c._count.salesInvoices > 1 ? (
                      <Badge tone="accent">{c._count.salesInvoices}</Badge>
                    ) : (
                      c._count.salesInvoices
                    )}
                  </TD>
                  <TD className="w-px text-end">
                    <ChevronRight className="ms-auto size-4 text-fg-subtle rtl:-scale-x-100" aria-hidden />
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
