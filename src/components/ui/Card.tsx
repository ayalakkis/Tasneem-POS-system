import type { ComponentProps, ReactNode } from "react";
import { cn } from "./cn";

/**
 * A titled section of a page. Deliberately unboxed: sections are separated by
 * their headings and spacing, not frames. Boxes are kept for things that are
 * objects in their own right (checkout panel, dialogs, the invoice paper).
 */
export function Card({ className, ...props }: ComponentProps<"section">) {
  return <section className={cn("min-w-0", className)} {...props} />;
}

export function CardHeader({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4 border-b border-border pb-3", className)}>
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-fg">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-fg-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CardBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("pt-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center justify-end gap-2 border-t border-border pt-4", className)}
      {...props}
    />
  );
}
