import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ItemForm from "../ItemForm";

export default async function NewItemPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Add item</h1>
      {categories.length === 0 ? (
        <p className="mt-4 text-sm text-gray-600">
          You need at least one category before adding items.{" "}
          <Link href="/admin/categories" className="underline">
            Create one here
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6">
          <ItemForm categories={categories} />
        </div>
      )}
    </div>
  );
}
