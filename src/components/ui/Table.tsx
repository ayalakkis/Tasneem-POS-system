import type { ComponentProps, ReactNode } from "react";
import { cn } from "./cn";

/**
 * Data table without an outer frame: only a header rule and row lines.
 * Compose with THead/TH/TBody/TR/TD:
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
    <div className={cn("relative overflow-x-auto", className)}>
      <table className="w-full border-collapse text-sm" {...props}>
        {children}
      </table>
    </div>
  );
}

export function THead(props: ComponentProps<"thead">) {
  return <thead {...props} />;
}

export function TBody(props: ComponentProps<"tbody">) {
  return <tbody {...props} />;
}

export function TR({ className, ...props }: ComponentProps<"tr">) {
  return <tr className={cn("transition-colors [tbody>&]:hover:bg-surface-3/50", className)} {...props} />;
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
        "h-10 border-b border-border-strong px-3 text-left align-middle text-[11px] font-medium uppercase tracking-[0.06em] text-fg-subtle whitespace-nowrap first:pl-0 last:pr-0",
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
        "border-b border-border px-3 py-3 align-middle text-fg-muted first:pl-0 last:pr-0",
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
      <td colSpan={colSpan} className="border-b border-border py-12 text-center text-sm text-fg-subtle">
        {children}
      </td>
    </tr>
  );
}
