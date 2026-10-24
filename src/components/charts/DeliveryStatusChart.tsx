import { PackageCheck, Timer, Truck, XCircle, type LucideIcon } from "lucide-react";
import { cn } from "@/components/ui";

export type DeliveryCounts = {
  PENDING: number;
  OUT_FOR_DELIVERY: number;
  DELIVERED: number;
  CANCELLED: number;
};

// Fixed order and colors (validated chart status tokens). Every status also
// carries an icon and a label, so color never carries the meaning alone.
const STATUSES: Array<{ key: keyof DeliveryCounts; label: string; icon: LucideIcon; bar: string; text: string }> = [
  { key: "PENDING", label: "Pending", icon: Timer, bar: "bg-chart-pending", text: "text-chart-pending" },
  { key: "OUT_FOR_DELIVERY", label: "Out for delivery", icon: Truck, bar: "bg-chart-transit", text: "text-chart-transit" },
  { key: "DELIVERED", label: "Delivered", icon: PackageCheck, bar: "bg-chart-delivered", text: "text-chart-delivered" },
  { key: "CANCELLED", label: "Cancelled", icon: XCircle, bar: "bg-chart-cancelled", text: "text-chart-cancelled" },
];

/** Proportion bar plus a labelled breakdown: one view instead of a donut and a list. */
export default function DeliveryStatusChart({ counts }: { counts: DeliveryCounts }) {
  const total = STATUSES.reduce((sum, s) => sum + counts[s.key], 0);

  return (
    <div>
      <p className="flex items-baseline gap-2 text-[28px] font-semibold leading-none tracking-tight tabular-nums text-fg">
        {total}
        <span className="text-sm font-normal tracking-normal text-fg-muted">orders</span>
      </p>

      {/* gap-0.5 is the 2px surface spacer between segments */}
      <div
        className="mt-4 flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-surface-3"
        role="img"
        aria-label={STATUSES.map((s) => `${s.label}: ${counts[s.key]}`).join(", ")}
      >
        {total > 0 &&
          STATUSES.filter((s) => counts[s.key] > 0).map((s) => (
            <div
              key={s.key}
              className={cn("h-full first:rounded-s-full last:rounded-e-full", s.bar)}
              style={{ width: `${(counts[s.key] / total) * 100}%` }}
              title={`${s.label}: ${counts[s.key]}`}
            />
          ))}
      </div>

      <ul className="mt-5 space-y-1">
        {STATUSES.map((s) => {
          const share = total ? Math.round((counts[s.key] / total) * 100) : 0;
          return (
            <li key={s.key} className="flex items-center gap-3 rounded-lg px-2 py-2 -mx-2 hover:bg-surface-2">
              <s.icon className={cn("size-4 shrink-0", s.text)} strokeWidth={1.75} aria-hidden />
              <span className="flex-1 text-sm text-fg-muted">{s.label}</span>
              <span className="w-10 text-end text-xs tabular-nums text-fg-subtle">{share}%</span>
              <span className="w-8 text-end text-sm font-semibold tabular-nums text-fg">{counts[s.key]}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
