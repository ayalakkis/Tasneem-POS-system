"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Item = { id: string; name: string; costPrice: number };

const NEW_SUPPLIER = "__new__";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function PurchaseForm({
  items,
  knownSuppliers,
}: {
  items: Item[];
  knownSuppliers: string[];
}) {
  const router = useRouter();
  const [itemId, setItemId] = useState(items[0]?.id ?? "");
  const [quantity, setQuantity] = useState("1");
  const [unitCost, setUnitCost] = useState(items[0] ? String(items[0].costPrice) : "");
  const [totalPaid, setTotalPaid] = useState("");
  const [totalPaidTouched, setTotalPaidTouched] = useState(false);
  const [supplier, setSupplier] = useState("");
  const [supplierMode, setSupplierMode] = useState<"select" | "custom">(
    knownSuppliers.length > 0 ? "select" : "custom"
  );
  const [date, setDate] = useState(today());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const computedTotal = (Number(quantity) || 0) * (Number(unitCost) || 0);

  function handleItemChange(id: string) {
    setItemId(id);
    const item = items.find((i) => i.id === id);
    if (item) {
      setUnitCost(String(item.costPrice));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = {
      itemId,
      quantity: Number(quantity),
      unitCost: Number(unitCost),
      totalPaid: totalPaidTouched && totalPaid !== "" ? Number(totalPaid) : computedTotal,
      supplier: supplier || null,
      date,
    };

    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to record purchase");
        return;
      }

      setQuantity("1");
      setTotalPaid("");
      setTotalPaidTouched(false);
      setSupplier("");
      setSupplierMode(knownSuppliers.length > 0 ? "select" : "custom");
      router.refresh();
    } catch {
      setError("Failed to record purchase — check your connection and try again");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return <p className="text-sm text-gray-600">Add an item first before recording a purchase.</p>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      {error && (
        <div className="mb-4 rounded-lg bg-beige-100 px-3 py-2 text-sm text-beige-900">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="col-span-2 sm:col-span-1">
          <label className="mb-1 block text-sm font-medium text-gray-700">Item</label>
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-babyblue-500"
            value={itemId}
            onChange={(e) => handleItemChange(e.target.value)}
          >
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            min="1"
            step="1"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-babyblue-500"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Unit cost</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-babyblue-500"
            value={unitCost}
            onChange={(e) => setUnitCost(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Total paid</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-babyblue-500"
            placeholder={computedTotal.toFixed(2)}
            value={totalPaid}
            onChange={(e) => {
              setTotalPaid(e.target.value);
              setTotalPaidTouched(true);
            }}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Supplier / origin</label>
          {supplierMode === "select" ? (
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-babyblue-500"
              value={supplier}
              onChange={(e) => {
                if (e.target.value === NEW_SUPPLIER) {
                  setSupplierMode("custom");
                  setSupplier("");
                } else {
                  setSupplier(e.target.value);
                }
              }}
            >
              <option value="">None</option>
              {knownSuppliers.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
              <option value={NEW_SUPPLIER}>+ Add new supplier…</option>
            </select>
          ) : (
            <div className="flex gap-1">
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-babyblue-500"
                placeholder="New supplier name"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                autoFocus={knownSuppliers.length > 0}
              />
              {knownSuppliers.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSupplierMode("select");
                    setSupplier("");
                  }}
                  className="shrink-0 rounded-lg border border-gray-300 px-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  List
                </button>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-babyblue-500"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 rounded-lg bg-babyblue-600 px-4 py-2 text-sm font-medium text-white hover:bg-babyblue-700 disabled:opacity-50"
      >
        {submitting ? "Recording..." : "Record purchase"}
      </button>
    </form>
  );
}
