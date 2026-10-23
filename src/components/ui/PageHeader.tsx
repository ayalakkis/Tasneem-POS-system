import type { ReactNode } from "react";
import { Diamond } from "@/components/brand/Motifs";
import { cn } from "./cn";

/** Page title block: optional eyebrow, title, description, and actions on the right. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-8 flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-accent-soft-fg">
            <Diamond />
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-[28px] sm:leading-9">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-fg-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
