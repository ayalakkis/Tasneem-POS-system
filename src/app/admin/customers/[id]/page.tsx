import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

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

  return (
    <div>
      <Link href="/admin/customers" className="text-sm text-gray-500 hover:underline">
        ← Back to customers
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-gray-900">{customer.name}</h1>
      <p className="mt-1 text-sm text-gray-500">{customer.phone}</p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {customer.salesInvoices.map((inv) => (
              <tr key={inv.id}>
                <td className="px-4 py-3 text-gray-600">{inv.date.toLocaleDateString()}</td>
                <td className="px-4 py-3 text-gray-600">
                  {inv.items.reduce((sum, i) => sum + i.quantity, 0)} item(s)
                </td>
                <td className="px-4 py-3 text-gray-600">{inv.totalAmount.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/invoices/${inv.id}`} className="text-gray-600 hover:underline">
                    View invoice
                  </Link>
                </td>
              </tr>
            ))}
            {customer.salesInvoices.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  No invoices yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
