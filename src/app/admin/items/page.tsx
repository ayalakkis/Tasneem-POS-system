import { Package, Boxes, AlertTriangle, Coins, Plus, Pencil, PackageSearch } from "lucide-react";
import { prisma } from "@/lib/prisma";
import StatCard from "@/components/layout/StatCard";
import {
  Badge,
  EmptyState,
  LinkButton,
  PageHeader,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  TableEmpty,
} from "@/components/ui";
import ItemsFilterBar from "./ItemsFilterBar";
import DeleteItemButton from "./DeleteItemButton";

const LOW_STOCK = 5;

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
  const lowStockCount = allItems.filter((i) => i.quantityInStock < LOW_STOCK).length;
  const inventoryValue = allItems.reduce((sum, i) => sum + i.costPrice * i.quantityInStock, 0);
  const filtering = Boolean(q || categoryId);

  return (
    <div>
      <PageHeader
        eyebrow="Catalog"
        title="Items"
        description="Manage products, pricing and barcodes."
        actions={
          <LinkButton href="/admin/items/new" icon={Plus}>
            Add item
          </LinkButton>
        }
      />

      <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
        <StatCard label="Total items" value={allItems.length} icon={Package} />
        <StatCard label="Units in stock" value={totalStock} icon={Boxes} tone="info" />
        <StatCard
          label={`Low stock (under ${LOW_STOCK})`}
          value={lowStockCount}
          icon={AlertTriangle}
          tone={lowStockCount > 0 ? "danger" : "neutral"}
        />
        <StatCard label="Inventory value" value={inventoryValue.toFixed(2)} icon={Coins} tone="accent" hint="At cost price" />
      </div>

      {allItems.length === 0 ? (
        <div className="mt-6 border-t border-border">
          <EmptyState
            icon={Package}
            title="No items yet"
            description="Add your first product to start selling it at the POS."
            action={
              <LinkButton href="/admin/items/new" icon={Plus}>
                Add item
              </LinkButton>
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-8">
            <ItemsFilterBar categories={categories} initialQuery={q} initialCategoryId={categoryId} />
          </div>

          <Table className="mt-4">
            <THead>
              <TR>
                <TH>Name</TH>
                <TH>Category</TH>
                <TH>Barcode</TH>
                <TH numeric>Cost</TH>
                <TH numeric>Price</TH>
                <TH numeric>Stock</TH>
                <TH>
                  <span className="sr-only">Actions</span>
                </TH>
              </TR>
            </THead>
            <TBody>
              {items.map((item) => (
                <TR key={item.id}>
                  <TD className="font-medium text-fg">{item.name}</TD>
                  <TD>{item.category.name}</TD>
                  <TD className="tabular-nums text-fg-subtle">{item.barcode ?? ""}</TD>
                  <TD numeric>{item.costPrice.toFixed(2)}</TD>
                  <TD numeric className="font-medium text-fg">
                    {item.sellingPrice.toFixed(2)}
                  </TD>
                  <TD numeric>
                    <Badge
                      tone={
                        item.quantityInStock === 0 ? "danger" : item.quantityInStock < LOW_STOCK ? "accent" : "neutral"
                      }
                    >
                      {item.quantityInStock}
                    </Badge>
                  </TD>
                  <TD className="w-px whitespace-nowrap text-end">
                    <div className="flex justify-end gap-1">
                      <LinkButton
                        href={`/admin/items/${item.id}`}
                        variant="ghost"
                        size="sm"
                        iconOnly
                        icon={Pencil}
                        aria-label={`Edit ${item.name}`}
                        title="Edit"
                      />
                      <DeleteItemButton itemId={item.id} itemName={item.name} />
                    </div>
                  </TD>
                </TR>
              ))}
              {items.length === 0 && (
                <TableEmpty colSpan={7}>
                  <PackageSearch className="mx-auto mb-2 size-5 text-fg-subtle" aria-hidden />
                  {filtering ? "No items match these filters." : "No items found."}
                </TableEmpty>
              )}
            </TBody>
          </Table>
        </>
      )}
    </div>
  );
}
