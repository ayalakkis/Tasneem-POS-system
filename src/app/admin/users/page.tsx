import { UserCog, ShieldCheck, UsersRound } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageUser } from "@/lib/auth";
import StatCard from "@/components/layout/StatCard";
import UsersManager from "./UsersManager";

export default async function UsersPage() {
  const session = await requirePageUser();
  const users = await prisma.user.findMany({
    select: { id: true, name: true, username: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const employeeCount = users.filter((u) => u.role === "EMPLOYEE").length;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
      <p className="mt-1 text-sm text-gray-500">Create, edit, and remove employee accounts.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total users" value={users.length} icon={UsersRound} />
        <StatCard
          label="Admins"
          value={adminCount}
          icon={ShieldCheck}
          color="bg-beige-100 text-beige-700"
        />
        <StatCard
          label="Employees"
          value={employeeCount}
          icon={UserCog}
          color="bg-babyblue-200 text-babyblue-800"
        />
      </div>

      <div className="mt-6">
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
