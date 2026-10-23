import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn, type BadgeTone } from "@/components/ui";

const ICON_TONES: Record<BadgeTone, string> = {
  neutral: "bg-surface-3 text-fg-muted",
  primary: "bg-primary-soft text-primary-soft-fg",
  accent: "bg-accent-soft text-accent-soft-fg",
  danger: "bg-danger-soft text-danger-soft-fg",
  info: "bg-info-soft text-info-soft-fg",
};

/**
 * KPI tile. `hero` renders it on the brand green for the one number that
 * matters most on a page.
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
  /** Small line under the value, e.g. "vs. last week". */
  hint?: ReactNode;
  hero?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-5",
        hero
          ? // Brand green in both themes (the sidebar token goes near-black in dark).
            "border-transparent bg-green-800 text-stone-50 shadow-md"
          : "border-border bg-surface text-fg shadow-sm",
      )}
    >
      {hero && (
        <div aria-hidden className="absolute -right-10 -top-12 size-40 rounded-full bg-accent/25 blur-3xl" />
      )}
      <div className="relative flex items-center justify-between gap-3">
        <p className={cn("text-[13px] font-medium", hero ? "text-green-100/75" : "text-fg-muted")}>{label}</p>
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            hero ? "bg-white/10 text-accent" : ICON_TONES[tone],
          )}
        >
          <Icon className="size-4" strokeWidth={1.75} aria-hidden />
        </div>
      </div>
      <p className="relative mt-3 text-[28px] font-semibold leading-none tracking-tight tabular-nums">{value}</p>
      {hint && (
        <p className={cn("relative mt-2 text-xs", hero ? "text-green-100/75" : "text-fg-subtle")}>{hint}</p>
      )}
    </div>
  );
}
