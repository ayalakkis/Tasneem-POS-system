import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  LogOut,
  type LucideIcon,
} from "lucide-react";

/**
 * Icons whose meaning depends on reading direction ("back", "forward",
 * "open"). In Arabic they are mirrored so "forward" still points the way the
 * text reads. Icons with no direction (search, trash, plus…) are left alone.
 */
const DIRECTIONAL = new Set<LucideIcon>([ArrowLeft, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, LogOut]);

/** Class that mirrors `icon` in right-to-left pages, or "" if it has no direction. */
export function rtlFlip(icon: LucideIcon | undefined) {
  return icon && DIRECTIONAL.has(icon) ? "rtl:-scale-x-100" : "";
}
