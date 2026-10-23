import { cn } from "@/components/ui/cn";

/** The diamond "dot" from the logo, used as a marker and bullet. */
export function Diamond({ className }: { className?: string }) {
  return <span aria-hidden className={cn("inline-block size-1.5 rotate-45 rounded-[1px] bg-accent", className)} />;
}

/**
 * The logo's arch as a frame. Draws only the outline; put content inside with
 * absolute positioning or use it as a backdrop.
 */
export function ArchFrame({ className, strokeWidth = 1.25 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 80 96" fill="none" aria-hidden className={className}>
      <path
        d="M4 95V40a36 36 0 0 1 72 0v55"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
