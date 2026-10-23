import { ChevronDown, type LucideIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "./cn";

export type ControlSize = "sm" | "md" | "lg";

/** Shared look for every text-like control. Invalid state comes from aria-invalid. */
const CONTROL =
  "w-full min-w-0 rounded-lg border border-border-strong bg-surface text-fg shadow-sm " +
  "placeholder:text-fg-subtle transition-[border-color,box-shadow] duration-150 " +
  "hover:border-fg-subtle/60 " +
  "focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 " +
  "aria-invalid:border-danger aria-invalid:focus:ring-danger/15 " +
  "disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-fg-subtle";

const SIZES: Record<ControlSize, string> = {
  sm: "h-8 text-xs",
  md: "h-10 text-sm",
  lg: "h-12 text-base",
};

// Left/right padding are set separately (never px-*) so an icon or chevron
// can widen one side without two utilities fighting over the same property.
const PAD_LEFT: Record<ControlSize, string> = { sm: "pl-2.5", md: "pl-3", lg: "pl-4" };
const PAD_RIGHT: Record<ControlSize, string> = { sm: "pr-2.5", md: "pr-3", lg: "pr-4" };
const ICON_PAD: Record<ControlSize, string> = { sm: "pl-8", md: "pl-9", lg: "pl-11" };
const ICON_POS: Record<ControlSize, string> = {
  sm: "left-2.5 size-3.5",
  md: "left-3 size-4",
  lg: "left-4 size-[18px]",
};

export function Input({
  size = "md",
  icon: Icon,
  invalid,
  className,
  ...props
}: Omit<ComponentProps<"input">, "size"> & {
  size?: ControlSize;
  /** Leading icon, e.g. Search. */
  icon?: LucideIcon;
  invalid?: boolean;
}) {
  const input = (
    <input
      aria-invalid={invalid || undefined}
      className={cn(
        CONTROL,
        SIZES[size],
        Icon ? ICON_PAD[size] : PAD_LEFT[size],
        PAD_RIGHT[size],
        props.type === "number" && "tabular-nums",
        !Icon && className,
      )}
      {...props}
    />
  );
  if (!Icon) return input;
  return (
    <div className={cn("relative", className)}>
      <Icon
        aria-hidden
        className={cn("pointer-events-none absolute top-1/2 -translate-y-1/2 text-fg-subtle", ICON_POS[size])}
      />
      {input}
    </div>
  );
}

export function Select({
  size = "md",
  invalid,
  className,
  children,
  ...props
}: Omit<ComponentProps<"select">, "size"> & { size?: ControlSize; invalid?: boolean }) {
  return (
    <div className={cn("relative", className)}>
      <select
        aria-invalid={invalid || undefined}
        className={cn(CONTROL, SIZES[size], PAD_LEFT[size], "appearance-none pr-9")}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle"
      />
    </div>
  );
}

export function Textarea({
  invalid,
  className,
  ...props
}: ComponentProps<"textarea"> & { invalid?: boolean }) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cn(CONTROL, "min-h-20 pl-3 pr-3 py-2 text-sm leading-relaxed", className)}
      {...props}
    />
  );
}

/** Label + control + hint/error. Pass the control's id as `htmlFor`. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  optional,
  className,
  children,
}: {
  label: ReactNode;
  htmlFor: string;
  hint?: ReactNode;
  error?: ReactNode;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="flex items-baseline justify-between text-sm font-medium text-fg">
        {label}
        {optional && <span className="text-xs font-normal text-fg-subtle">Optional</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-fg-subtle">{hint}</p>
      )}
    </div>
  );
}
