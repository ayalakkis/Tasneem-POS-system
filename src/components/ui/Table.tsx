import type { ComponentProps, ReactNode } from "react";
import { cn } from "./cn";

/**
 * Data table inside a card. Compose with THead/TH/TBody/TR/TD:
 *
 *   <Table>
 *     <THead><TR><TH>Name</TH><TH numeric>Price</TH></TR></THead>
 *     <TBody>...</TBody>
 *   </Table>
 */
export function Table({
  className,
  children,
  ...props
}: ComponentProps<"table">) {
  return (
    // `relative` contains sr-only header labels (absolutely positioned) so they
    // don't stretch the document past a scrolling parent.
    <div className={cn("relative overflow-hidden rounded-xl border border-border bg-surface shadow-sm", className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm" {...props}>
          {children}
        </table>
      </div>
    </div>
  );
}

export function THead(props: ComponentProps<"thead">) {
  return <thead className="bg-surface-2" {...props} />;
}

export function TBody(props: ComponentProps<"tbody">) {
  return <tbody className="[&>tr:last-child>td]:border-b-0" {...props} />;
}

export function TR({ className, ...props }: ComponentProps<"tr">) {
  return <tr className={cn("transition-colors [tbody>&]:hover:bg-surface-2/70", className)} {...props} />;
}

export function TH({
  numeric,
  className,
  ...props
}: ComponentProps<"th"> & { numeric?: boolean }) {
  return (
    <th
      scope="col"
      className={cn(
        "h-10 border-b border-border px-4 text-left align-middle text-[11px] font-medium uppercase tracking-[0.06em] text-fg-subtle whitespace-nowrap",
        numeric && "text-right",
        className,
      )}
      {...props}
    />
  );
}

export function TD({
  numeric,
  className,
  ...props
}: ComponentProps<"td"> & { numeric?: boolean }) {
  return (
    <td
      className={cn(
        "border-b border-border px-4 py-3 align-middle text-fg-muted",
        numeric && "text-right tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

/** Full-width row for "no results" inside a table body. */
export function TableEmpty({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-fg-subtle">
        {children}
      </td>
    </tr>
  );
}
