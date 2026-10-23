import { requirePageRole } from "@/lib/auth";
import Sidebar, { type NavItem } from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/categories", label: "Categories", icon: "categories" },
  { href: "/admin/items", label: "Items", icon: "items" },
  { href: "/admin/purchases", label: "Purchases", icon: "purchases" },
  { href: "/admin/customers", label: "Customers", icon: "customers" },
  { href: "/admin/deliveries", label: "Deliveries", icon: "deliveries" },
  { href: "/admin/users", label: "Users", icon: "users" },
  { href: "/pos", label: "POS", icon: "store" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requirePageRole("ADMIN");

  return (
    <div className="flex h-screen bg-beige-50">
      <Sidebar items={NAV_ITEMS} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar username={session.username} />
        <main className="flex-1 overflow-y-auto px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
