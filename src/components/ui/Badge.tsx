import type { ReactNode } from "react";
import { cn } from "./cn";

export type BadgeTone = "neutral" | "primary" | "accent" | "danger" | "info";

const TONES: Record<BadgeTone, { badge: string; dot: string }> = {
  neutral: { badge: "bg-surface-3 text-fg-muted", dot: "bg-fg-subtle" },
  primary: { badge: "bg-primary-soft text-primary-soft-fg", dot: "bg-primary" },
  accent: { badge: "bg-accent-soft text-accent-soft-fg", dot: "bg-accent" },
  danger: { badge: "bg-danger-soft text-danger-soft-fg", dot: "bg-danger" },
  info: { badge: "bg-info-soft text-info-soft-fg", dot: "bg-info" },
};

/** Small status pill. `dot` adds a leading status dot. */
export function Badge({
  tone = "neutral",
  dot = false,
  className,
  children,
}: {
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
        TONES[tone].badge,
        className,
      )}
    >
      {dot && <span aria-hidden className={cn("size-1.5 rounded-full", TONES[tone].dot)} />}
      {children}
    </span>
  );
}
