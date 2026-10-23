import { Tags, Package, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import StatCard from "@/components/layout/StatCard";
import CategoriesManager from "./CategoriesManager";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { items: true } } },
  });

  const totalItems = categories.reduce((sum, c) => sum + c._count.items, 0);
  const topCategory = [...categories].sort((a, b) => b._count.items - a._count.items)[0];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
      <p className="mt-1 text-sm text-gray-500">Organize items into categories.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Categories" value={categories.length} icon={Tags} />
        <StatCard
          label="Items across categories"
          value={totalItems}
          icon={Package}
          color="bg-beige-100 text-beige-700"
        />
        <StatCard
          label="Largest category"
          value={topCategory ? topCategory.name : "—"}
          icon={Star}
          color="bg-babyblue-200 text-babyblue-800"
        />
      </div>

      <div className="mt-6">
        <CategoriesManager
          initialCategories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            itemCount: c._count.items,
          }))}
        />
      </div>
    </div>
  );
}
