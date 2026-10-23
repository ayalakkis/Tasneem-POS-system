"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

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

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      {error && (
        <div className="rounded-lg bg-beige-100 px-3 py-2 text-sm text-beige-900">{error}</div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
        <input
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-babyblue-500"
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
        <select
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-babyblue-500"
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
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Barcode (optional)</label>
        <input
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-babyblue-500"
          value={values.barcode}
          onChange={(e) => update("barcode", e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Origin / source (optional)
        </label>
        <input
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-babyblue-500"
          value={values.origin}
          onChange={(e) => update("origin", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Cost price</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-babyblue-500"
            value={values.costPrice}
            onChange={(e) => update("costPrice", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Selling price</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-babyblue-500"
            value={values.sellingPrice}
            onChange={(e) => update("sellingPrice", e.target.value)}
            required
          />
        </div>
      </div>

      {quantityInStock !== undefined && (
        <p className="text-sm text-gray-500">
          Current stock: <span className="font-medium text-gray-700">{quantityInStock}</span>{" "}
          (adjust via purchase invoices)
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-babyblue-600 px-4 py-2 text-sm font-medium text-white hover:bg-babyblue-700 disabled:opacity-50"
        >
          {submitting ? "Saving..." : itemId ? "Save changes" : "Add item"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/items")}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
