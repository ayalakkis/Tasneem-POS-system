import { requirePageRole } from "@/lib/auth";
import Sidebar, { type NavItem } from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

export default async function PosLayout({ children }: { children: React.ReactNode }) {
  const session = await requirePageRole("ADMIN", "EMPLOYEE");

  const navItems: NavItem[] = [
    { href: "/pos", label: "New Sale", icon: "newSale" },
    { href: "/pos/deliveries", label: "Deliveries", icon: "deliveries" },
    { href: "/pos/today", label: "Today's Invoices", icon: "todaysInvoices" },
    ...(session.role === "ADMIN"
      ? [{ href: "/admin", label: "Admin", icon: "dashboard" as const }]
      : []),
  ];

  return (
    <div className="flex h-screen bg-beige-50">
      <Sidebar items={navItems} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar username={session.username} />
        <main className="flex-1 overflow-y-auto px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
