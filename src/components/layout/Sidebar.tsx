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

const EXACT_MATCH_ROOTS = new Set(["/admin", "/pos"]);

export default function Sidebar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center gap-2 px-6 py-5">
        <LogoMark className="h-11 w-auto text-primary" />
        {SHOP_NAME && <span className="text-sm font-semibold text-gray-900">{SHOP_NAME}</span>}
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const active = EXACT_MATCH_ROOTS.has(item.href)
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = ICONS[item.icon];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-babyblue-100 text-babyblue-700"
                  : "text-gray-600 hover:bg-beige-50 hover:text-gray-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
