import Link from "next/link";
import { Package, Boxes, AlertTriangle, DollarSign } from "lucide-react";
import { prisma } from "@/lib/prisma";
import StatCard from "@/components/layout/StatCard";
import ItemsFilterBar from "./ItemsFilterBar";
import DeleteItemButton from "./DeleteItemButton";

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoryId?: string }>;
}) {
  const { q = "", categoryId = "" } = await searchParams;

  const [items, categories, allItems] = await Promise.all([
    prisma.item.findMany({
      where: {
        ...(categoryId ? { categoryId } : {}),
        ...(q ? { OR: [{ name: { contains: q } }, { barcode: { contains: q } }] } : {}),
      },
      include: { category: true },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.item.findMany({ select: { costPrice: true, quantityInStock: true } }),
  ]);

  const totalStock = allItems.reduce((sum, i) => sum + i.quantityInStock, 0);
  const lowStockCount = allItems.filter((i) => i.quantityInStock < 5).length;
  const inventoryValue = allItems.reduce((sum, i) => sum + i.costPrice * i.quantityInStock, 0);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Items</h1>
          <p className="mt-1 text-sm text-gray-500">Manage products, pricing, and barcodes.</p>
        </div>
        <Link
          href="/admin/items/new"
          className="rounded-lg bg-babyblue-600 px-4 py-2 text-sm font-medium text-white hover:bg-babyblue-700"
        >
          Add item
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total items" value={allItems.length} icon={Package} />
        <StatCard
          label="Total stock units"
          value={totalStock}
          icon={Boxes}
          color="bg-beige-100 text-beige-700"
        />
        <StatCard
          label="Low stock (< 5)"
          value={lowStockCount}
          icon={AlertTriangle}
          color="bg-babyblue-200 text-babyblue-800"
        />
        <StatCard
          label="Inventory value"
          value={inventoryValue.toFixed(2)}
          icon={DollarSign}
          color="bg-beige-200 text-beige-800"
        />
      </div>

      <div className="mt-6">
        <ItemsFilterBar categories={categories} initialQuery={q} initialCategoryId={categoryId} />
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Barcode</th>
              <th className="px-4 py-3">Cost</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                <td className="px-4 py-3 text-gray-600">{item.category.name}</td>
                <td className="px-4 py-3 text-gray-600">{item.barcode ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{item.costPrice.toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-600">{item.sellingPrice.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      item.quantityInStock < 5
                        ? "bg-beige-200 text-beige-800"
                        : "bg-gray-50 text-gray-600"
                    }`}
                  >
                    {item.quantityInStock}
                  </span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Link href={`/admin/items/${item.id}`} className="text-gray-600 hover:underline">
                    Edit
                  </Link>
                  <DeleteItemButton itemId={item.id} itemName={item.name} />
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                  No items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
