import { requirePageRole } from "@/lib/auth";
import { getTheme } from "@/lib/theme-server";
import AppShell from "@/components/layout/AppShell";
import type { NavItem, NavSection } from "@/components/layout/Sidebar";

const SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: "dashboard" }],
  },
  {
    title: "Catalog",
    items: [
      { href: "/admin/items", label: "Items", icon: "items" },
      { href: "/admin/categories", label: "Categories", icon: "categories" },
      { href: "/admin/purchases", label: "Purchases", icon: "purchases" },
    ],
  },
  {
    title: "People & orders",
    items: [
      { href: "/admin/customers", label: "Customers", icon: "customers" },
      { href: "/admin/deliveries", label: "Deliveries", icon: "deliveries" },
      { href: "/admin/users", label: "Users", icon: "users" },
    ],
  },
];

const FOOTER: NavItem[] = [{ href: "/pos", label: "Open POS", icon: "store" }];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [session, theme] = await Promise.all([requirePageRole("ADMIN"), getTheme()]);

  return (
    <AppShell
      sections={SECTIONS}
      footer={FOOTER}
      user={{ username: session.username, role: session.role }}
      theme={theme}
    >
      {children}
    </AppShell>
  );
}
