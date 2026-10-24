"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Alert, Badge, Button, Card, CardBody, CardFooter, CardHeader, Field, Input, Select, cn } from "@/components/ui";
import { useI18n } from "@/i18n/I18nProvider";

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
  const { t, f } = useI18n();
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
      setError(data.error ?? t.itemForm.saveFailed);
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
    <form onSubmit={handleSubmit} className="grid max-w-4xl gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      {error && <Alert tone="danger" className="lg:col-span-2">{error}</Alert>}

      <Card>
        <CardHeader title={t.itemForm.detailsTitle} description={t.itemForm.detailsDescription} />
        <CardBody className="space-y-5">
          <Field label={t.itemForm.name} htmlFor="item-name">
            <Input id="item-name" value={values.name} onChange={(e) => update("name", e.target.value)} required />
          </Field>

          <Field label={t.itemForm.category} htmlFor="item-category">
            <Select
              id="item-category"
              value={values.categoryId}
              onChange={(e) => update("categoryId", e.target.value)}
              required
            >
              <option value="" disabled>
                {t.itemForm.selectCategory}
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t.itemForm.barcode} htmlFor="item-barcode" optional={t.common.optional} hint={t.itemForm.barcodeHint}>
              <Input
                id="item-barcode"
                inputMode="numeric"
                className="tabular-nums"
                value={values.barcode}
                onChange={(e) => update("barcode", e.target.value)}
              />
            </Field>
            <Field label={t.itemForm.origin} htmlFor="item-origin" optional={t.common.optional}>
              <Input id="item-origin" value={values.origin} onChange={(e) => update("origin", e.target.value)} />
            </Field>
          </div>
        </CardBody>
      </Card>

      <Card className="self-start">
        <CardHeader title={t.itemForm.pricingTitle} description={t.itemForm.pricingDescription} />
        <CardBody className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label={t.itemForm.costPrice} htmlFor="item-cost">
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
            <Field label={t.itemForm.sellingPrice} htmlFor="item-price">
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

          <dl className="space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-fg-muted">{t.itemForm.marginPerUnit}</dt>
              <dd className={cn("font-semibold tabular-nums", hasPrices && margin < 0 ? "text-danger" : "text-fg")}>
                {hasPrices ? f.money(margin) : <span className="font-normal text-fg-subtle">{t.common.notSet}</span>}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-fg-muted">{t.itemForm.margin}</dt>
              <dd>
                {hasPrices ? (
                  <Badge tone={margin < 0 ? "danger" : marginPct < 15 ? "accent" : "primary"}>
                    {marginPct.toFixed(0)}%
                  </Badge>
                ) : (
                  <span className="text-fg-subtle">{t.common.notSet}</span>
                )}
              </dd>
            </div>
            {quantityInStock !== undefined && (
              <div className="flex items-center justify-between border-t border-border pt-2">
                <dt className="text-fg-muted">{t.itemForm.inStock}</dt>
                <dd className="font-semibold tabular-nums text-fg">{quantityInStock}</dd>
              </div>
            )}
          </dl>
          {quantityInStock !== undefined && (
            <p className="text-xs text-fg-subtle">{t.itemForm.stockHint}</p>
          )}
        </CardBody>
      </Card>

      <CardFooter className="lg:col-span-2">
        <Button variant="ghost" onClick={() => router.push("/admin/items")}>
          {t.common.cancel}
        </Button>
        <Button type="submit" loading={submitting}>
          {itemId ? t.common.saveChanges : t.itemForm.add}
        </Button>
      </CardFooter>
    </form>
  );
}
