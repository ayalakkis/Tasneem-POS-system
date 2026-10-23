import { Tags, Package, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import StatCard from "@/components/layout/StatCard";
import { PageHeader } from "@/components/ui";
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
      <PageHeader eyebrow="Catalog" title="Categories" description="Group items so they're easy to find and report on." />

      <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-3">
        <StatCard label="Categories" value={categories.length} icon={Tags} />
        <StatCard label="Items across categories" value={totalItems} icon={Package} tone="info" />
        <StatCard
          label="Largest category"
          value={topCategory ? topCategory.name : "None"}
          icon={Star}
          tone="accent"
          hint={topCategory ? `${topCategory._count.items} items` : undefined}
        />
      </div>

      <div className="mt-8">
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
