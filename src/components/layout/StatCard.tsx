import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn, type BadgeTone } from "@/components/ui";

const ICON_TONES: Record<BadgeTone, string> = {
  neutral: "text-fg-subtle",
  primary: "text-primary",
  accent: "text-accent",
  danger: "text-danger",
  info: "text-info",
};

/**
 * KPI figure, drawn without a box: a hairline on the left, a small label and
 * a large number. Lay several out in a grid; the rules line them up as columns.
 * `hero` marks the one number that matters most (green rule, green figure).
 */
export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
  hint,
  hero = false,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: BadgeTone;
  /** Small line under the value, e.g. "At cost price". */
  hint?: ReactNode;
  hero?: boolean;
}) {
  return (
    <div className={cn("min-w-0 border-l-2 py-1 pl-4", hero ? "border-primary" : "border-border")}>
      <p className="flex items-center gap-1.5 text-[13px] font-medium text-fg-muted">
        <Icon className={cn("size-3.5 shrink-0", ICON_TONES[hero ? "primary" : tone])} strokeWidth={2} aria-hidden />
        <span className="truncate">{label}</span>
      </p>
      <p
        className={cn(
          "mt-2 truncate text-[28px] font-semibold leading-none tracking-tight tabular-nums",
          hero ? "text-primary" : "text-fg",
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1.5 truncate text-xs text-fg-subtle">{hint}</p>}
    </div>
  );
}
