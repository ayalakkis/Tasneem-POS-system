import { Tags, Package, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import StatCard from "@/components/layout/StatCard";
import { PageHeader } from "@/components/ui";
import { getI18n } from "@/i18n/server";
import CategoriesManager from "./CategoriesManager";

export default async function CategoriesPage() {
  const { t, n } = await getI18n();
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { items: true } } },
  });

  const totalItems = categories.reduce((sum, c) => sum + c._count.items, 0);
  const topCategory = [...categories].sort((a, b) => b._count.items - a._count.items)[0];

  return (
    <div>
      <PageHeader eyebrow={t.nav.catalog} title={t.categories.title} description={t.categories.description} />

      <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-3">
        <StatCard label={t.categories.count} value={categories.length} icon={Tags} />
        <StatCard label={t.categories.itemsAcross} value={totalItems} icon={Package} tone="info" />
        <StatCard
          label={t.categories.largest}
          value={topCategory ? topCategory.name : t.common.none}
          icon={Star}
          tone="accent"
          hint={topCategory ? n(t.units, topCategory._count.items) : undefined}
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
