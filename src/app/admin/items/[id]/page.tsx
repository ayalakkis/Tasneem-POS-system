import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
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
      <h1 className="text-2xl font-semibold text-gray-900">Edit item</h1>
      <div className="mt-6">
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
    </div>
  );
}
