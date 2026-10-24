import { requirePageRole } from "@/lib/auth";
import { getTheme } from "@/lib/theme-server";
import { getI18n } from "@/i18n/server";
import AppShell from "@/components/layout/AppShell";
import type { NavItem, NavSection } from "@/components/layout/Sidebar";

export default async function PosLayout({ children }: { children: React.ReactNode }) {
  const [session, theme, { t }] = await Promise.all([
    requirePageRole("ADMIN", "EMPLOYEE"),
    getTheme(),
    getI18n(),
  ]);

  const sections: NavSection[] = [
    {
      title: t.nav.pointOfSale,
      items: [
        { href: "/pos", label: t.nav.newSale, icon: "newSale" },
        { href: "/pos/deliveries", label: t.nav.deliveries, icon: "deliveries" },
        { href: "/pos/today", label: t.nav.todaysInvoices, icon: "todaysInvoices" },
      ],
    },
  ];

  const footer: NavItem[] =
    session.role === "ADMIN" ? [{ href: "/admin", label: t.nav.adminDashboard, icon: "dashboard" }] : [];

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
