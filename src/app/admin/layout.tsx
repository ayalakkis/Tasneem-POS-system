import { requirePageRole } from "@/lib/auth";
import { getTheme } from "@/lib/theme-server";
import { getI18n } from "@/i18n/server";
import AppShell from "@/components/layout/AppShell";
import type { NavItem, NavSection } from "@/components/layout/Sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [session, theme, { t }] = await Promise.all([requirePageRole("ADMIN"), getTheme(), getI18n()]);

  const sections: NavSection[] = [
    {
      title: t.nav.overview,
      items: [{ href: "/admin", label: t.nav.dashboard, icon: "dashboard" }],
    },
    {
      title: t.nav.catalog,
      items: [
        { href: "/admin/items", label: t.nav.items, icon: "items" },
        { href: "/admin/categories", label: t.nav.categories, icon: "categories" },
        { href: "/admin/purchases", label: t.nav.purchases, icon: "purchases" },
      ],
    },
    {
      title: t.nav.peopleOrders,
      items: [
        { href: "/admin/customers", label: t.nav.customers, icon: "customers" },
        { href: "/admin/deliveries", label: t.nav.deliveries, icon: "deliveries" },
        { href: "/admin/users", label: t.nav.users, icon: "users" },
      ],
    },
  ];

  const footer: NavItem[] = [{ href: "/pos", label: t.nav.openPos, icon: "store" }];

  return (
    <AppShell
      sections={sections}
      footer={footer}
      user={{ username: session.username, role: session.role }}
      theme={theme}
    >
      {children}
    </AppShell>
  );
}
