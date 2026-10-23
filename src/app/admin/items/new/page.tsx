import { ArrowLeft, Tags } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, LinkButton, PageHeader } from "@/components/ui";
import ItemForm from "../ItemForm";

export default async function NewItemPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader
        eyebrow="Catalog"
        title="Add item"
        description="New items start with zero stock. Record a purchase to add units."
        actions={
          <LinkButton href="/admin/items" variant="ghost" icon={ArrowLeft}>
            Back to items
          </LinkButton>
        }
      />
      {categories.length === 0 ? (
        <Card>
          <EmptyState
            icon={Tags}
            title="Create a category first"
            description="Every item belongs to a category, so you need at least one before adding items."
            action={<LinkButton href="/admin/categories">Go to categories</LinkButton>}
          />
        </Card>
      ) : (
        <ItemForm categories={categories} />
      )}
    </div>
  );
}
