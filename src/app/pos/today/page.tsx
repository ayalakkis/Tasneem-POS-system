import Link from "next/link";
import { Receipt, Coins, ShoppingBasket } from "lucide-react";
import { prisma } from "@/lib/prisma";
import StatCard from "@/components/layout/StatCard";

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
      <h1 className="text-2xl font-semibold text-gray-900">Today&apos;s invoices</h1>
      <p className="mt-1 text-sm text-gray-500">Sales rung up today.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Sales today" value={invoices.length} icon={Receipt} />
        <StatCard
          label="Revenue today"
          value={totalRevenue.toFixed(2)}
          icon={Coins}
          color="bg-beige-100 text-beige-700"
        />
        <StatCard
          label="Items sold"
          value={totalItemsSold}
          icon={ShoppingBasket}
          color="bg-babyblue-200 text-babyblue-800"
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Rung up by</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="px-4 py-3 text-gray-600">
                  {inv.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="px-4 py-3 text-gray-600">{inv.customer?.name ?? "Walk-in"}</td>
                <td className="px-4 py-3 text-gray-600">
                  {inv.items.reduce((sum, i) => sum + i.quantity, 0)} item(s)
                </td>
                <td className="px-4 py-3 text-gray-600">{inv.totalAmount.toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-600">{inv.createdBy.username}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/invoices/${inv.id}`} className="text-gray-600 hover:underline">
                    View / print
                  </Link>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  No sales yet today.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
