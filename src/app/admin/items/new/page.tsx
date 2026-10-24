import { ArrowLeft, Tags } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, LinkButton, PageHeader } from "@/components/ui";
import { getI18n } from "@/i18n/server";
import ItemForm from "../ItemForm";

export default async function NewItemPage() {
  const [categories, { t }] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    getI18n(),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow={t.nav.catalog}
        title={t.items.newTitle}
        description={t.items.newDescription}
        actions={
          <LinkButton href="/admin/items" variant="ghost" icon={ArrowLeft}>
            {t.items.backToItems}
          </LinkButton>
        }
      />
      {categories.length === 0 ? (
        <Card>
          <EmptyState
            icon={Tags}
            title={t.items.needCategoryTitle}
            description={t.items.needCategoryDescription}
            action={<LinkButton href="/admin/categories">{t.items.goToCategories}</LinkButton>}
          />
        </Card>
      ) : (
        <ItemForm categories={categories} />
      )}
    </div>
  );
}
