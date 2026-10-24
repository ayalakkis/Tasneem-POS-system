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

// Start/end padding are set separately (never px-*) so an icon or chevron
// can widen one side without two utilities fighting over the same property.
// Logical sides (start/end) mirror automatically in Arabic.
const PAD_START: Record<ControlSize, string> = { sm: "ps-2.5", md: "ps-3", lg: "ps-4" };
const PAD_END: Record<ControlSize, string> = { sm: "pe-2.5", md: "pe-3", lg: "pe-4" };
const ICON_PAD: Record<ControlSize, string> = { sm: "ps-8", md: "ps-9", lg: "ps-11" };
const ICON_POS: Record<ControlSize, string> = {
  sm: "start-2.5 size-3.5",
  md: "start-3 size-4",
  lg: "start-4 size-[18px]",
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
        Icon ? ICON_PAD[size] : PAD_START[size],
        PAD_END[size],
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
        className={cn(CONTROL, SIZES[size], PAD_START[size], "appearance-none pe-9")}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle"
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
      className={cn(CONTROL, "min-h-20 ps-3 pe-3 py-2 text-sm leading-relaxed", className)}
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
