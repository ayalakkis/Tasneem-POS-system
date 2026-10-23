import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui";

/** Right-hand order panel: details form, total, and the one primary action. */
export default function CheckoutPanel({
  title,
  description,
  children,
  lineCount,
  total,
  actionLabel,
  actionIcon,
  onAction,
  submitting,
  disabled,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  lineCount: number;
  total: number;
  actionLabel: string;
  actionIcon: LucideIcon;
  onAction: () => void;
  submitting: boolean;
  disabled: boolean;
}) {
  return (
    <aside className="rounded-xl border border-border bg-surface shadow-sm lg:sticky lg:top-0">
      <div className="space-y-4 p-5">
        <div>
          <h2 className="text-sm font-semibold text-fg">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-fg-muted">{description}</p>}
        </div>
        {children}
      </div>

      <div className="rounded-b-xl border-t border-border bg-surface-2 p-5">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-fg-muted">
            Total
            {lineCount > 0 && (
              <span className="text-fg-subtle"> · {lineCount} item{lineCount === 1 ? "" : "s"}</span>
            )}
          </span>
          <span className="text-[32px] font-semibold leading-none tracking-tight tabular-nums text-fg" aria-live="polite">
            {total.toFixed(2)}
          </span>
        </div>
        <Button
          size="lg"
          icon={actionIcon}
          className="mt-5 w-full"
          onClick={onAction}
          loading={submitting}
          disabled={disabled}
        >
          {actionLabel}
        </Button>
      </div>
    </aside>
  );
}
