import Link from "next/link";
import { Users, Receipt, Repeat } from "lucide-react";
import { prisma } from "@/lib/prisma";
import StatCard from "@/components/layout/StatCard";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { salesInvoices: true } } },
  });

  const totalInvoices = customers.reduce((sum, c) => sum + c._count.salesInvoices, 0);
  const returningCustomers = customers.filter((c) => c._count.salesInvoices > 1).length;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
      <p className="mt-1 text-sm text-gray-500">
        Customers are added from the POS screen during checkout.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total customers" value={customers.length} icon={Users} />
        <StatCard
          label="Total invoices"
          value={totalInvoices}
          icon={Receipt}
          color="bg-beige-100 text-beige-700"
        />
        <StatCard
          label="Returning customers"
          value={returningCustomers}
          icon={Repeat}
          color="bg-babyblue-200 text-babyblue-800"
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Invoices</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {customers.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                <td className="px-4 py-3 text-gray-600">{c._count.salesInvoices}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/customers/${c.id}`} className="text-gray-600 hover:underline">
                    View history
                  </Link>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
