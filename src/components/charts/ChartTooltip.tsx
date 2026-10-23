"use client";

/** Themed tooltip body for Recharts (pass as `content`). */
export default function ChartTooltip({
  active,
  label,
  payload,
  valueLabel,
  format = (v) => v.toFixed(2),
}: {
  active?: boolean;
  label?: string | number;
  payload?: ReadonlyArray<{ value?: unknown }>;
  valueLabel: string;
  format?: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const value = Number(payload[0].value ?? 0);
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-md">
      <p className="text-fg-subtle">{label}</p>
      <p className="mt-0.5 flex items-baseline gap-2">
        <span className="text-fg-muted">{valueLabel}</span>
        <span className="ml-auto font-semibold tabular-nums text-fg">{format(value)}</span>
      </p>
    </div>
  );
}
