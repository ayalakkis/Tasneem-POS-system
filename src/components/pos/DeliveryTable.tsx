"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { DeliveryStatus } from "@prisma/client";
import type { DeliveryListItem } from "@/lib/deliveries";

const STATUS_STYLES: Record<DeliveryStatus, string> = {
  PENDING: "bg-beige-100 text-beige-800",
  OUT_FOR_DELIVERY: "bg-babyblue-100 text-babyblue-800",
  DELIVERED: "bg-babyblue-600 text-white",
  CANCELLED: "bg-beige-600 text-white",
};

const STATUS_LABELS: Record<DeliveryStatus, string> = {
  PENDING: "Pending",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const NEXT_STATUS: Partial<Record<DeliveryStatus, DeliveryStatus>> = {
  PENDING: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
};

export default function DeliveryTable({ deliveries }: { deliveries: DeliveryListItem[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function updateStatus(id: string, status: DeliveryStatus) {
    setError(null);
    setUpdatingId(id);
    const res = await fetch(`/api/deliveries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json().catch(() => ({}));
    setUpdatingId(null);
    if (!res.ok) {
      setError(data.error ?? "Failed to update status");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg bg-beige-100 px-3 py-2 text-sm text-beige-900">{error}</div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {deliveries.map((d) => {
              const status = d.deliveryStatus ?? "PENDING";
              const next = NEXT_STATUS[status];
              const busy = updatingId === d.id;
              return (
                <tr key={d.id}>
                  <td className="px-4 py-3 text-gray-600">{d.date.toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {d.customer?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{d.customer?.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{d.deliveryAddress}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {d.items.reduce((sum, i) => sum + i.quantity, 0)} item(s)
                  </td>
                  <td className="px-4 py-3 text-gray-600">{d.totalAmount.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}
                    >
                      {STATUS_LABELS[status]}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link href={`/invoices/${d.id}`} className="text-gray-600 hover:underline">
                      View
                    </Link>
                    {next && (
                      <button
                        disabled={busy}
                        onClick={() => updateStatus(d.id, next)}
                        className="ml-3 text-babyblue-600 hover:underline disabled:opacity-50"
                      >
                        {STATUS_LABELS[next]}
                      </button>
                    )}
                    {status !== "CANCELLED" && status !== "DELIVERED" && (
                      <button
                        disabled={busy}
                        onClick={() => updateStatus(d.id, "CANCELLED")}
                        className="ml-3 text-beige-700 hover:underline disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {deliveries.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-400">
                  No delivery orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
