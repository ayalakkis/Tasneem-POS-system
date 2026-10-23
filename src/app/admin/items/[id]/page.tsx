import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { LinkButton, PageHeader } from "@/components/ui";
import ItemForm from "../ItemForm";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [item, categories] = await Promise.all([
    prisma.item.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!item) notFound();

  return (
    <div>
      <PageHeader
        eyebrow="Catalog"
        title={item.name}
        description="Edit details and pricing."
        actions={
          <LinkButton href="/admin/items" variant="ghost" icon={ArrowLeft}>
            Back to items
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
