"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ReceiptText, Truck, X } from "lucide-react";
import type { DeliveryStatus } from "@prisma/client";
import type { DeliveryListItem } from "@/lib/deliveries";
import DeliveryStatusBadge from "@/components/DeliveryStatusBadge";
import { useI18n } from "@/i18n/I18nProvider";
import { fill } from "@/i18n/plural";
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

export default function DeliveryTable({ deliveries }: { deliveries: DeliveryListItem[] }) {
  const router = useRouter();
  const { t, f } = useI18n();
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
    if (!res.ok) throw new Error(data.error ?? t.deliveries.updateFailed);
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
      <div className="border-t border-border">
        <EmptyState
          icon={Truck}
          title={t.deliveries.emptyTitle}
          description={t.deliveries.emptyDescription}
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
            <TH>{t.deliveries.colDate}</TH>
            <TH>{t.deliveries.colCustomer}</TH>
            <TH>{t.deliveries.colAddress}</TH>
            <TH numeric>{t.deliveries.colItems}</TH>
            <TH numeric>{t.deliveries.colTotal}</TH>
            <TH>{t.deliveries.colStatus}</TH>
            <TH>
              <span className="sr-only">{t.common.actions}</span>
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
                <TD className="whitespace-nowrap tabular-nums">{f.shortDateTime(d.date)}</TD>
                <TD>
                  <p className="font-medium text-fg">{d.customer?.name ?? t.common.guest}</p>
                  {d.customer?.phone && <p className="text-xs tabular-nums text-fg-subtle">{d.customer.phone}</p>}
                </TD>
                <TD className="max-w-[16rem] truncate" title={d.deliveryAddress ?? undefined}>
                  {d.deliveryAddress}
                </TD>
                <TD numeric>{units}</TD>
                <TD numeric className="font-medium text-fg">
                  {f.money(d.totalAmount)}
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
                        {t.deliveryStatus[next]}
                      </Button>
                    )}
                    <LinkButton
                      href={`/invoices/${d.id}`}
                      variant="ghost"
                      size="sm"
                      iconOnly
                      icon={ReceiptText}
                      aria-label={t.deliveries.viewInvoice}
                      title={t.deliveries.viewInvoice}
                    />
                    {status !== "CANCELLED" && status !== "DELIVERED" && (
                      <Button
                        variant="danger-ghost"
                        size="sm"
                        iconOnly
                        icon={X}
                        aria-label={t.deliveries.cancel}
                        title={t.deliveries.cancel}
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
        title={t.deliveries.cancelTitle}
        description={
          cancelling
            ? fill(t.deliveries.cancelDescription, {
                name: cancelling.customer?.name ?? t.deliveries.thisCustomer,
                total: f.money(cancelling.totalAmount),
              })
            : undefined
        }
        confirmLabel={t.deliveries.cancel}
      />
    </div>
  );
}
