import { CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "./cn";

export type AlertTone = "danger" | "warning" | "success" | "info";

const TONES: Record<AlertTone, { box: string; icon: LucideIcon }> = {
  danger: { box: "border-danger/25 bg-danger-soft text-danger-soft-fg", icon: CircleAlert },
  warning: { box: "border-accent/25 bg-accent-soft text-accent-soft-fg", icon: TriangleAlert },
  success: { box: "border-primary/20 bg-primary-soft text-primary-soft-fg", icon: CircleCheck },
  info: { box: "border-info/25 bg-info-soft text-info-soft-fg", icon: Info },
};

/** Inline message, e.g. a form error. Errors are announced to screen readers. */
export function Alert({
  tone = "danger",
  title,
  className,
  children,
}: {
  tone?: AlertTone;
  title?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  const { box, icon: Icon } = TONES[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("flex gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm", box, className)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={cn(title != null && "mt-0.5 opacity-90")}>{children}</div>}
      </div>
    </div>
  );
}
