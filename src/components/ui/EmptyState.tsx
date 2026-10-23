import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ArchFrame } from "@/components/brand/Motifs";
import { cn } from "./cn";

/** Centered placeholder for empty lists: the logo's arch framing an icon. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-14 text-center", className)}>
      <div className="relative mb-5 h-[72px] w-[60px]">
        <ArchFrame className="absolute inset-0 h-full w-full text-primary/35" />
        <div className="absolute inset-x-0 bottom-3 flex justify-center">
          <Icon className="size-6 text-primary" strokeWidth={1.75} aria-hidden />
        </div>
      </div>
      <h3 className="text-sm font-semibold text-fg">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-fg-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
