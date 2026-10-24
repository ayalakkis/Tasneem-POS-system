"use client";

import { ChartNoAxesColumn } from "lucide-react";
import { EmptyState } from "@/components/ui";

type Row = { category: string; revenue: number };

/**
 * Horizontal bars, sorted, one hue: length carries the amount and the label
 * carries the category, so color would only add noise. Every bar is
 * direct-labelled, so there is no value axis, grid or tooltip.
 *
 * Plain HTML rather than Recharts: a ranked bar list needs no chart engine,
 * and flex layout mirrors on its own in Arabic (names on the right, bars
 * growing leftwards), which Recharts can't do for this layout.
 */
export default function CategoryRevenueChart({ data }: { data: Row[] }) {
  if (data.length === 0) {
    return <EmptyState icon={ChartNoAxesColumn} title="No sales yet" description="Revenue by category shows up after the first sale." className="py-8" />;
  }

  const sorted = [...data].sort((a, b) => b.revenue - a.revenue);
  const max = Math.max(...sorted.map((r) => r.revenue), 0);

  return (
    <ul className="space-y-2.5">
      {sorted.map((row) => {
        const share = max > 0 ? Math.max((row.revenue / max) * 100, 0) : 0;
        return (
          <li key={row.category} className="group flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-end text-xs text-fg-muted sm:w-32" title={row.category}>
              {row.category}
            </span>
            <div className="h-[22px] min-w-0 flex-1">
              <div
                className="h-full rounded-e bg-chart-series transition-opacity group-hover:opacity-85"
                style={{ width: `${share}%` }}
              />
            </div>
            <span className="w-16 shrink-0 text-xs font-medium tabular-nums text-fg">{row.revenue.toFixed(2)}</span>
          </li>
        );
      })}
    </ul>
  );
}
