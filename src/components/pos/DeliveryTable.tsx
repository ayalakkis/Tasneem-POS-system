"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ReceiptText, Truck, X } from "lucide-react";
import type { DeliveryStatus } from "@prisma/client";
import type { DeliveryListItem } from "@/lib/deliveries";
import DeliveryStatusBadge, { DELIVERY_STATUS_LABELS } from "@/components/DeliveryStatusBadge";
import {
  Alert,
  Button,
  ConfirmDialog,
  EmptyState,
  LinkButton,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui";

const NEXT_STATUS: Partial<Record<DeliveryStatus, DeliveryStatus>> = {
  PENDING: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
};

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default function DeliveryTable({ deliveries }: { deliveries: DeliveryListItem[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<DeliveryListItem | null>(null);

  async function requestStatus(id: string, status: DeliveryStatus) {
    const res = await fetch(`/api/deliveries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Failed to update status");
    router.refresh();
  }

  async function advance(id: string, status: DeliveryStatus) {
    setError(null);
    setUpdatingId(id);
    try {
      await requestStatus(id, status);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUpdatingId(null);
    }
  }

  if (deliveries.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface shadow-sm">
        <EmptyState
          icon={Truck}
          title="No delivery orders yet"
          description="Sales marked for delivery at the POS will appear here."
        />
      </div>
    );
  }

  return (
    <div>
      {error && (
        <Alert tone="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Table>
        <THead>
          <TR>
            <TH>Date</TH>
            <TH>Customer</TH>
            <TH>Address</TH>
            <TH numeric>Items</TH>
            <TH numeric>Total</TH>
            <TH>Status</TH>
            <TH>
              <span className="sr-only">Actions</span>
            </TH>
          </TR>
        </THead>
        <TBody>
          {deliveries.map((d) => {
            const status = d.deliveryStatus ?? "PENDING";
            const next = NEXT_STATUS[status];
            const busy = updatingId === d.id;
            const units = d.items.reduce((sum, i) => sum + i.quantity, 0);
            return (
              <TR key={d.id}>
                <TD className="whitespace-nowrap tabular-nums">{dateFormat.format(d.date)}</TD>
                <TD>
                  <p className="font-medium text-fg">{d.customer?.name ?? "—"}</p>
                  {d.customer?.phone && <p className="text-xs tabular-nums text-fg-subtle">{d.customer.phone}</p>}
                </TD>
                <TD className="max-w-[16rem] truncate" title={d.deliveryAddress ?? undefined}>
                  {d.deliveryAddress}
                </TD>
                <TD numeric>{units}</TD>
                <TD numeric className="font-medium text-fg">
                  {d.totalAmount.toFixed(2)}
                </TD>
                <TD>
                  <DeliveryStatusBadge status={status} />
                </TD>
                <TD className="w-px whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    {next && (
                      <Button
                        size="sm"
                        variant="secondary"
                        trailingIcon={ArrowRight}
                        loading={busy}
                        onClick={() => advance(d.id, next)}
                      >
                        {DELIVERY_STATUS_LABELS[next]}
                      </Button>
                    )}
                    <LinkButton
                      href={`/invoices/${d.id}`}
                      variant="ghost"
                      size="sm"
                      iconOnly
                      icon={ReceiptText}
                      aria-label="View invoice"
                      title="View invoice"
                    />
                    {status !== "CANCELLED" && status !== "DELIVERED" && (
                      <Button
                        variant="danger-ghost"
                        size="sm"
                        iconOnly
                        icon={X}
                        aria-label="Cancel delivery"
                        title="Cancel delivery"
                        disabled={busy}
                        onClick={() => setCancelling(d)}
                      />
                    )}
                  </div>
                </TD>
              </TR>
            );
          })}
        </TBody>
      </Table>

      <ConfirmDialog
        open={cancelling !== null}
        onClose={() => setCancelling(null)}
        onConfirm={() => requestStatus(cancelling!.id, "CANCELLED")}
        title="Cancel this delivery?"
        description={
          cancelling
            ? `Order for ${cancelling.customer?.name ?? "this customer"} (${cancelling.totalAmount.toFixed(2)}). This can't be undone.`
            : undefined
        }
        confirmLabel="Cancel delivery"
      />
    </div>
  );
}
