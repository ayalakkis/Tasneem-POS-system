import Link from "next/link";
import { Loader2, type LucideIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "./cn";
import { rtlFlip } from "./directional";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "danger-ghost";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-150 active:translate-y-px " +
  "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-fg shadow-sm hover:bg-primary-hover",
  secondary: "border border-border-strong bg-surface text-fg shadow-sm hover:bg-surface-2",
  ghost: "text-fg-muted hover:bg-surface-3 hover:text-fg",
  danger: "bg-danger text-danger-fg shadow-sm hover:bg-danger-hover",
  "danger-ghost": "text-fg-subtle hover:bg-danger-soft hover:text-danger-soft-fg",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 text-xs [&_svg]:size-3.5",
  md: "h-10 text-sm [&_svg]:size-4",
  lg: "h-12 text-[15px] [&_svg]:size-[18px]",
};

// Kept apart from SIZES: two padding utilities on one element don't override
// each other predictably, so a button gets exactly one of these.
const PADDING: Record<ButtonSize, string> = { sm: "px-3", md: "px-4", lg: "px-5" };
const ICON_ONLY: Record<ButtonSize, string> = { sm: "w-8", md: "w-10", lg: "w-12" };

type StyleProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Square button that only shows `icon`; pass `aria-label`. */
  iconOnly?: boolean;
  className?: string;
};

/** Class string for anything that should look like a button. */
export function buttonClasses({
  variant = "primary",
  size = "md",
  iconOnly = false,
  className,
}: StyleProps = {}) {
  return cn(BASE, VARIANTS[variant], SIZES[size], iconOnly ? ICON_ONLY[size] : PADDING[size], className);
}

type ContentProps = {
  icon?: LucideIcon;
  /** Icon after the label, e.g. an arrow. */
  trailingIcon?: LucideIcon;
  loading?: boolean;
  children?: ReactNode;
};

function Content({ icon: Icon, trailingIcon: Trailing, loading, children }: ContentProps) {
  return (
    <>
      {loading ? <Loader2 className="animate-spin" aria-hidden /> : Icon && <Icon className={rtlFlip(Icon)} aria-hidden />}
      {children}
      {Trailing && <Trailing className={rtlFlip(Trailing)} aria-hidden />}
    </>
  );
}

export function Button({
  variant,
  size,
  iconOnly,
  className,
  icon,
  trailingIcon,
  loading = false,
  disabled,
  type = "button",
  children,
  ...props
}: StyleProps & ContentProps & ComponentProps<"button">) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, iconOnly, className })}
      {...props}
    >
      <Content icon={icon} trailingIcon={trailingIcon} loading={loading}>
        {children}
      </Content>
    </button>
  );
}

/** A Next.js link styled as a button. */
export function LinkButton({
  variant,
  size,
  iconOnly,
  className,
  icon,
  trailingIcon,
  children,
  ...props
}: StyleProps & Omit<ContentProps, "loading"> & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonClasses({ variant, size, iconOnly, className })} {...props}>
      <Content icon={icon} trailingIcon={trailingIcon}>
        {children}
      </Content>
    </Link>
  );
}
