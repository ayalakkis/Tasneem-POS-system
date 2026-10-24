"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Tags,
  Package,
  ShoppingCart,
  Users,
  Truck,
  UserCog,
  Store,
  ShoppingBag,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import { SHOP_NAME } from "@/lib/config";
import { LogoMark } from "@/components/brand/Logo";
import LogoutButton from "@/components/LogoutButton";
import { cn } from "@/components/ui";
import { useI18n } from "@/i18n/I18nProvider";

export const ICONS = {
  dashboard: LayoutDashboard,
  categories: Tags,
  items: Package,
  purchases: ShoppingCart,
  customers: Users,
  deliveries: Truck,
  users: UserCog,
  store: Store,
  newSale: ShoppingBag,
  todaysInvoices: ClipboardList,
} satisfies Record<string, LucideIcon>;

export type IconKey = keyof typeof ICONS;
export type NavItem = { href: string; label: string; icon: IconKey };
/** A titled group of links. */
export type NavSection = { title: string; items: NavItem[] };

const EXACT_MATCH_ROOTS = new Set(["/admin", "/pos"]);

export function isActive(pathname: string, href: string) {
  return EXACT_MATCH_ROOTS.has(href) ? pathname === href : pathname.startsWith(href);
}

export default function Sidebar({
  sections,
  footer = [],
  user,
  onNavigate,
}: {
  sections: NavSection[];
  footer?: NavItem[];
  user: { username: string; role: string };
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-fg">
      <div className="flex items-center gap-3 px-6 pb-6 pt-7">
        <LogoMark title={t.shell.logo} className="h-12 w-auto text-sidebar-fg" />
        {SHOP_NAME && <span className="text-sm font-semibold">{SHOP_NAME}</span>}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3" aria-label={t.nav.main}>
        {sections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-sidebar-muted/80">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.href}>
                  <SidebarLink item={item} active={isActive(pathname, item.href)} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {footer.length > 0 && (
        <ul className="space-y-0.5 px-3 pb-3">
          {footer.map((item) => (
            <li key={item.href}>
              <SidebarLink item={item} active={isActive(pathname, item.href)} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-3 border-t border-sidebar-border px-5 py-4">
        <div
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-active text-sm font-semibold uppercase text-sidebar-fg ring-1 ring-white/10"
        >
          {user.username.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user.username}</p>
          <p className="truncate text-xs text-sidebar-muted">{t.roles[user.role as keyof typeof t.roles] ?? user.role}</p>
        </div>
        <LogoutButton />
      </div>
    </div>
  );
}

function SidebarLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = ICONS[item.icon];
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-active text-sidebar-fg"
          : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-fg",
      )}
    >
      {/* The logo's diamond marks the current page. */}
      <span
        aria-hidden
        className={cn(
          "absolute -start-[3px] size-1.5 rotate-45 bg-accent transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
      />
      <Icon className={cn("size-[18px] shrink-0", active ? "text-accent" : "")} strokeWidth={1.75} />
      {item.label}
    </Link>
  );
}
