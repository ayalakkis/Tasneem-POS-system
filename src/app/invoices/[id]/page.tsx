import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePageUser } from "@/lib/auth";
import { SHOP_NAME } from "@/lib/config";
import InvoiceToolbar from "./InvoiceToolbar";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePageUser();
  const { id } = await params;

  const invoice = await prisma.salesInvoice.findUnique({
    where: { id },
    select: {
      id: true,
      date: true,
      totalAmount: true,
      isDelivery: true,
      deliveryAddress: true,
      deliveryStatus: true,
      customer: { select: { name: true, phone: true } },
      createdBy: { select: { username: true } },
      items: {
        select: {
          id: true,
          quantity: true,
          unitPrice: true,
          subtotal: true,
          item: { select: { name: true } },
        },
      },
    },
  });

  if (!invoice) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <InvoiceToolbar />

      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="mb-6 border-b border-gray-200 pb-5 text-center">
          <h1 className="min-h-[1.75rem] text-xl font-semibold text-gray-900">{SHOP_NAME}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {invoice.isDelivery ? "Delivery Order" : "Sales Invoice"}
          </p>
        </div>

        {invoice.isDelivery && (
          <div className="mb-6 flex items-center justify-between rounded-lg bg-babyblue-50 px-4 py-3 text-sm">
            <div>
              <p className="font-medium text-babyblue-900">Deliver to</p>
              <p className="text-babyblue-700">{invoice.deliveryAddress}</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-babyblue-700">
              {invoice.deliveryStatus?.replace(/_/g, " ") ?? "PENDING"}
            </span>
          </div>
        )}

        <div className="mb-6 flex items-start justify-between gap-6 text-sm text-gray-600">
          <div>
            <p className="font-medium text-gray-900">
              Invoice #{invoice.id.slice(-8).toUpperCase()}
            </p>
            <p className="mt-0.5">{invoice.date.toLocaleString()}</p>
          </div>
          <div className="text-right">
            {invoice.customer ? (
              <>
                <p className="font-medium text-gray-900">{invoice.customer.name}</p>
                <p className="mt-0.5">{invoice.customer.phone}</p>
              </>
            ) : (
              <p className="font-medium text-gray-900">Walk-in customer</p>
            )}
          </div>
        </div>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="py-2 pr-3">Item</th>
              <th className="w-16 py-2 pr-3 text-right">Qty</th>
              <th className="w-24 py-2 pr-3 text-right">Price</th>
              <th className="w-24 py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((line) => (
              <tr key={line.id} className="border-b border-gray-100">
                <td className="py-3 pr-3">{line.item.name}</td>
                <td className="py-3 pr-3 text-right tabular-nums text-gray-600">
                  {line.quantity}
                </td>
                <td className="py-3 pr-3 text-right tabular-nums text-gray-600">
                  {line.unitPrice.toFixed(2)}
                </td>
                <td className="py-3 text-right tabular-nums font-medium text-gray-900">
                  {line.subtotal.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <div className="w-56 rounded-lg bg-beige-50 px-4 py-3">
            <div className="flex justify-between text-sm font-semibold text-gray-900">
              <span>Total</span>
              <span className="tabular-nums">{invoice.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          Served by {invoice.createdBy.username}
        </p>
      </div>
    </div>
  );
}
