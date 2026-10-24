"use client";

import { useI18n } from "@/i18n/I18nProvider";

/** Themed tooltip body for Recharts (pass as `content`). */
export default function ChartTooltip({
  active,
  label,
  payload,
  valueLabel,
  formatLabel = (l) => String(l),
  format = (v) => v.toFixed(2),
}: {
  active?: boolean;
  label?: string | number;
  payload?: ReadonlyArray<{ value?: unknown }>;
  valueLabel: string;
  formatLabel?: (label: string | number) => string;
  format?: (value: number) => string;
}) {
  const { dir } = useI18n();
  if (!active || !payload?.length) return null;
  const value = Number(payload[0].value ?? 0);
  return (
    // The chart box is forced LTR; the tooltip text follows the page language.
    <div dir={dir} className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-md">
      <p className="text-fg-subtle">{label !== undefined && formatLabel(label)}</p>
      <p className="mt-0.5 flex items-baseline gap-2">
        <span className="text-fg-muted">{valueLabel}</span>
        <span className="ms-auto font-semibold tabular-nums text-fg">{format(value)}</span>
      </p>
    </div>
  );
}
