import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import type { DeliveryStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePageUser } from "@/lib/auth";
import { SHOP_NAME } from "@/lib/config";
import { LogoMark } from "@/components/brand/Logo";
import { DELIVERY_STATUS_LABELS } from "@/components/DeliveryStatusBadge";
import InvoiceToolbar from "./InvoiceToolbar";

// The receipt is a printed document, so the "paper" uses fixed light brand
// colors (raw stone/green scales) instead of theme tokens: it looks the same
// on screen in dark mode as it does on paper.
const STATUS_PILL: Record<DeliveryStatus, string> = {
  PENDING: "bg-brass-100 text-brass-800",
  OUT_FOR_DELIVERY: "bg-[#e2ecf2] text-[#2c536b]",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-[#f6e2de] text-[#8e3328]",
};

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function DiamondRule() {
  return (
    <div aria-hidden className="my-6 flex items-center gap-3 text-brass-400">
      <span className="h-px flex-1 bg-stone-200" />
      <span className="size-1.5 rotate-45 bg-current" />
      <span className="size-1.5 rotate-45 bg-current" />
      <span className="h-px flex-1 bg-stone-200" />
    </div>
  );
}

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

  const number = invoice.id.slice(-8).toUpperCase();
  const status = invoice.deliveryStatus ?? "PENDING";
  const units = invoice.items.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <div className="min-h-dvh bg-bg print:min-h-0 print:bg-white">
      <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 print:max-w-none print:p-0">
        <InvoiceToolbar />

        <article className="relative overflow-hidden rounded-2xl bg-[#fffdf9] px-7 py-9 text-stone-900 shadow-lg ring-1 ring-black/5 sm:px-10 print:rounded-none print:bg-white print:px-0 print:py-0 print:shadow-none print:ring-0">
          {/* Brand band along the top edge */}
          <div aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-green-800 print:hidden" />

          <header className="flex flex-col items-center text-center">
            <LogoMark title="Shop logo" className="h-20 w-auto text-green-800" />
            {SHOP_NAME && <p className="mt-3 text-lg font-semibold">{SHOP_NAME}</p>}
            <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.2em] text-brass-600">
              {invoice.isDelivery ? "Delivery order" : "Sales invoice"}
            </p>
            <p className="mt-1 text-sm tabular-nums text-stone-500">No. {number}</p>
          </header>

          <DiamondRule />

          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt className="text-xs text-stone-500">Date</dt>
              <dd className="mt-0.5 font-medium tabular-nums">{dateFormat.format(invoice.date)}</dd>
            </div>
            <div className="text-right">
              <dt className="text-xs text-stone-500">Customer</dt>
              <dd className="mt-0.5 font-medium">{invoice.customer?.name ?? "Walk-in customer"}</dd>
              {invoice.customer && <dd className="tabular-nums text-stone-600">{invoice.customer.phone}</dd>}
            </div>
          </dl>

          {invoice.isDelivery && (
            <div className="mt-5 flex items-start gap-3 rounded-xl bg-stone-100 px-4 py-3 text-sm print:border print:border-stone-300 print:bg-transparent">
              <MapPin className="mt-0.5 size-4 shrink-0 text-green-700" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-stone-500">Deliver to</p>
                <p className="font-medium">{invoice.deliveryAddress}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_PILL[status]}`}>
                {DELIVERY_STATUS_LABELS[status]}
              </span>
            </div>
          )}

          <table className="mt-7 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-stone-300 text-[11px] uppercase tracking-[0.08em] text-stone-500">
                <th scope="col" className="pb-2 pr-3 text-left font-medium">Item</th>
                <th scope="col" className="w-12 pb-2 pr-3 text-right font-medium">Qty</th>
                <th scope="col" className="w-20 pb-2 pr-3 text-right font-medium">Price</th>
                <th scope="col" className="w-24 pb-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((line) => (
                <tr key={line.id} className="border-b border-dashed border-stone-200">
                  <td className="py-3 pr-3 font-medium">{line.item.name}</td>
                  <td className="py-3 pr-3 text-right tabular-nums text-stone-600">{line.quantity}</td>
                  <td className="py-3 pr-3 text-right tabular-nums text-stone-600">{line.unitPrice.toFixed(2)}</td>
                  <td className="py-3 text-right font-medium tabular-nums">{line.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-5 flex items-end justify-between gap-4">
            <p className="text-xs text-stone-500 tabular-nums">
              {units} item{units === 1 ? "" : "s"}
            </p>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.12em] text-stone-500">Total</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-green-800">
                {invoice.totalAmount.toFixed(2)}
              </p>
            </div>
          </div>

          <DiamondRule />

          <footer className="text-center">
            <p lang="ar" dir="rtl" className="text-base font-medium text-green-800">
              شكراً لزيارتكم
            </p>
            <p className="mt-1 text-xs text-stone-500">Thank you for your visit</p>
            <p className="mt-4 text-[11px] text-stone-400">Served by {invoice.createdBy.username}</p>
          </footer>
        </article>
      </div>
    </div>
  );
}
