import { UserCog, ShieldCheck, UsersRound } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageUser } from "@/lib/auth";
import StatCard from "@/components/layout/StatCard";
import { PageHeader } from "@/components/ui";
import { getI18n } from "@/i18n/server";
import UsersManager from "./UsersManager";

export default async function UsersPage() {
  const [session, { t }] = await Promise.all([requirePageUser(), getI18n()]);
  const users = await prisma.user.findMany({
    select: { id: true, name: true, username: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const employeeCount = users.filter((u) => u.role === "EMPLOYEE").length;

  return (
    <div>
      <PageHeader eyebrow={t.nav.peopleOrders} title={t.users.title} description={t.users.description} />

      <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-3">
        <StatCard label={t.users.total} value={users.length} icon={UsersRound} />
        <StatCard label={t.users.admins} value={adminCount} icon={ShieldCheck} tone="accent" />
        <StatCard label={t.users.employees} value={employeeCount} icon={UserCog} tone="info" />
      </div>

      <div className="mt-8">
        <UsersManager
          initialUsers={users.map((u) => ({
            id: u.id,
            name: u.name,
            username: u.username,
            role: u.role,
          }))}
          currentUserId={session.userId}
        />
      </div>
    </div>
  );
}
