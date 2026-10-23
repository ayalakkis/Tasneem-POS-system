"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { List, PackagePlus } from "lucide-react";
import { Alert, Button, Card, CardBody, CardHeader, Field, Input, Select } from "@/components/ui";

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
  const [success, setSuccess] = useState<string | null>(null);
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
    setSuccess(null);
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

      const itemName = items.find((i) => i.id === itemId)?.name ?? "item";
      setSuccess(`Recorded ${payload.quantity} × ${itemName}. Stock and cost price are updated.`);
      setQuantity("1");
      setTotalPaid("");
      setTotalPaidTouched(false);
      setSupplier("");
      setSupplierMode(knownSuppliers.length > 0 ? "select" : "custom");
      router.refresh();
    } catch {
      setError("Failed to record purchase. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return <Alert tone="info">Add an item first before recording a purchase.</Alert>;
  }

  return (
    <Card>
      <CardHeader title="Record a purchase" description="Total paid defaults to quantity × unit cost." />
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <Alert tone="danger">{error}</Alert>}
          {success && <Alert tone="success">{success}</Alert>}

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <Field label="Item" htmlFor="purchase-item" className="col-span-2 sm:col-span-3 lg:col-span-2">
              <Select id="purchase-item" value={itemId} onChange={(e) => handleItemChange(e.target.value)}>
                {items.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Quantity" htmlFor="purchase-qty">
              <Input
                id="purchase-qty"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </Field>

            <Field label="Unit cost" htmlFor="purchase-cost">
              <Input
                id="purchase-cost"
                type="number"
                min="0"
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                required
              />
            </Field>

            <Field label="Total paid" htmlFor="purchase-total">
              <Input
                id="purchase-total"
                type="number"
                min="0"
                step="0.01"
                placeholder={computedTotal.toFixed(2)}
                value={totalPaid}
                onChange={(e) => {
                  setTotalPaid(e.target.value);
                  setTotalPaidTouched(true);
                }}
              />
            </Field>

            <Field label="Date" htmlFor="purchase-date">
              <Input id="purchase-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </Field>

            <Field label="Supplier / origin" htmlFor="purchase-supplier" optional className="col-span-2 sm:col-span-3">
              {supplierMode === "select" ? (
                <Select
                  id="purchase-supplier"
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
                </Select>
              ) : (
                <div className="flex gap-2">
                  <Input
                    id="purchase-supplier"
                    className="flex-1"
                    placeholder="New supplier name"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    autoFocus={knownSuppliers.length > 0}
                  />
                  {knownSuppliers.length > 0 && (
                    <Button
                      variant="secondary"
                      icon={List}
                      onClick={() => {
                        setSupplierMode("select");
                        setSupplier("");
                      }}
                    >
                      Pick existing
                    </Button>
                  )}
                </div>
              )}
            </Field>

            <div className="col-span-2 flex items-end sm:col-span-3">
              <Button type="submit" icon={PackagePlus} loading={submitting} className="w-full sm:ml-auto sm:w-auto">
                Record purchase
              </Button>
            </div>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
