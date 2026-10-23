import { requirePageRole } from "@/lib/auth";
import { getTheme } from "@/lib/theme-server";
import AppShell from "@/components/layout/AppShell";
import type { NavItem, NavSection } from "@/components/layout/Sidebar";

const SECTIONS: NavSection[] = [
  {
    title: "Point of sale",
    items: [
      { href: "/pos", label: "New Sale", icon: "newSale" },
      { href: "/pos/deliveries", label: "Deliveries", icon: "deliveries" },
      { href: "/pos/today", label: "Today's Invoices", icon: "todaysInvoices" },
    ],
  },
];

export default async function PosLayout({ children }: { children: React.ReactNode }) {
  const [session, theme] = await Promise.all([requirePageRole("ADMIN", "EMPLOYEE"), getTheme()]);

  const footer: NavItem[] =
    session.role === "ADMIN" ? [{ href: "/admin", label: "Admin dashboard", icon: "dashboard" }] : [];

  return (
    <AppShell
      sections={SECTIONS}
      footer={footer}
      user={{ username: session.username, role: session.role }}
      theme={theme}
    >
      {children}
    </AppShell>
  );
}
