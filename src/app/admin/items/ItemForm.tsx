"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Alert, Badge, Button, Card, CardBody, CardFooter, CardHeader, Field, Input, Select, cn } from "@/components/ui";

type Category = { id: string; name: string };

type ItemFormValues = {
  name: string;
  categoryId: string;
  barcode: string;
  origin: string;
  costPrice: string;
  sellingPrice: string;
};

export default function ItemForm({
  categories,
  itemId,
  initialValues,
  quantityInStock,
}: {
  categories: Category[];
  itemId?: string;
  initialValues?: ItemFormValues;
  quantityInStock?: number;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ItemFormValues>(
    initialValues ?? {
      name: "",
      categoryId: categories[0]?.id ?? "",
      barcode: "",
      origin: "",
      costPrice: "",
      sellingPrice: "",
    }
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof ItemFormValues>(key: K, value: ItemFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = {
      name: values.name,
      categoryId: values.categoryId,
      barcode: values.barcode || null,
      origin: values.origin || null,
      costPrice: Number(values.costPrice),
      sellingPrice: Number(values.sellingPrice),
    };

    const res = await fetch(itemId ? `/api/items/${itemId}` : "/api/items", {
      method: itemId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to save item");
      return;
    }

    router.push("/admin/items");
    router.refresh();
  }

  const cost = Number(values.costPrice);
  const price = Number(values.sellingPrice);
  const hasPrices = values.costPrice !== "" && values.sellingPrice !== "" && price > 0;
  const margin = price - cost;
  const marginPct = hasPrices ? (margin / price) * 100 : 0;

  return (
    <form onSubmit={handleSubmit} className="grid max-w-4xl gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      {error && <Alert tone="danger" className="lg:col-span-2">{error}</Alert>}

      <Card>
        <CardHeader title="Details" description="How the item appears at the POS and on receipts." />
        <CardBody className="space-y-5">
          <Field label="Name" htmlFor="item-name">
            <Input id="item-name" value={values.name} onChange={(e) => update("name", e.target.value)} required />
          </Field>

          <Field label="Category" htmlFor="item-category">
            <Select
              id="item-category"
              value={values.categoryId}
              onChange={(e) => update("categoryId", e.target.value)}
              required
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Barcode" htmlFor="item-barcode" optional hint="Scan it straight into this field.">
              <Input
                id="item-barcode"
                inputMode="numeric"
                className="tabular-nums"
                value={values.barcode}
                onChange={(e) => update("barcode", e.target.value)}
              />
            </Field>
            <Field label="Origin / source" htmlFor="item-origin" optional>
              <Input id="item-origin" value={values.origin} onChange={(e) => update("origin", e.target.value)} />
            </Field>
          </div>
        </CardBody>
      </Card>

      <Card className="self-start">
        <CardHeader title="Pricing" description="Cost is never shown to cashiers." />
        <CardBody className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Cost price" htmlFor="item-cost">
              <Input
                id="item-cost"
                type="number"
                step="0.01"
                min="0"
                value={values.costPrice}
                onChange={(e) => update("costPrice", e.target.value)}
                required
              />
            </Field>
            <Field label="Selling price" htmlFor="item-price">
              <Input
                id="item-price"
                type="number"
                step="0.01"
                min="0"
                value={values.sellingPrice}
                onChange={(e) => update("sellingPrice", e.target.value)}
                required
              />
            </Field>
          </div>

          <dl className="space-y-2 rounded-lg bg-surface-2 px-4 py-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-fg-muted">Margin per unit</dt>
              <dd className={cn("font-semibold tabular-nums", hasPrices && margin < 0 ? "text-danger" : "text-fg")}>
                {hasPrices ? margin.toFixed(2) : "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-fg-muted">Margin</dt>
              <dd>
                {hasPrices ? (
                  <Badge tone={margin < 0 ? "danger" : marginPct < 15 ? "accent" : "primary"}>
                    {marginPct.toFixed(0)}%
                  </Badge>
                ) : (
                  <span className="text-fg-subtle">—</span>
                )}
              </dd>
            </div>
            {quantityInStock !== undefined && (
              <div className="flex items-center justify-between border-t border-border pt-2">
                <dt className="text-fg-muted">In stock</dt>
                <dd className="font-semibold tabular-nums text-fg">{quantityInStock}</dd>
              </div>
            )}
          </dl>
          {quantityInStock !== undefined && (
            <p className="text-xs text-fg-subtle">Stock changes through purchase invoices and sales.</p>
          )}
        </CardBody>
      </Card>

      <CardFooter className="rounded-xl border lg:col-span-2">
        <Button variant="ghost" onClick={() => router.push("/admin/items")}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {itemId ? "Save changes" : "Add item"}
        </Button>
      </CardFooter>
    </form>
  );
}
