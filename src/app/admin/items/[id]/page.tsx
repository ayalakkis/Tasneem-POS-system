import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { LinkButton, PageHeader } from "@/components/ui";
import { getI18n } from "@/i18n/server";
import ItemForm from "../ItemForm";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [item, categories, { t }] = await Promise.all([
    prisma.item.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    getI18n(),
  ]);

  if (!item) notFound();

  return (
    <div>
      <PageHeader
        eyebrow={t.nav.catalog}
        title={item.name}
        description={t.items.editDescription}
        actions={
          <LinkButton href="/admin/items" variant="ghost" icon={ArrowLeft}>
            {t.items.backToItems}
          </LinkButton>
        }
      />
      <ItemForm
        categories={categories}
        itemId={item.id}
        quantityInStock={item.quantityInStock}
        initialValues={{
          name: item.name,
          categoryId: item.categoryId,
          barcode: item.barcode ?? "",
          origin: item.origin ?? "",
          costPrice: String(item.costPrice),
          sellingPrice: String(item.sellingPrice),
        }}
      />
    </div>
  );
}
