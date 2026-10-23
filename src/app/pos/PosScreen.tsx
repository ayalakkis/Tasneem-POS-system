"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useItemCart } from "@/components/pos/useItemCart";
import ItemSearchAndCart from "@/components/pos/ItemSearchAndCart";
import { useCustomerLookup } from "@/components/pos/useCustomerLookup";

export default function PosScreen() {
  const router = useRouter();
  const {
    searchInputRef,
    query,
    results,
    cart,
    cartError,
    total,
    runSearch,
    handleSearchKeyDown,
    selectResult,
    updateQuantity,
    removeLine,
  } = useItemCart();

  const { phone, name, setName, matchedCustomer, lookupDone, runPhoneLookup } =
    useCustomerLookup();

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCompleteSale() {
    setError(null);

    if (cart.length === 0) {
      setError("Add at least one item to the cart");
      return;
    }

    setSubmitting(true);
    try {
      let customerId: string | null = matchedCustomer?.id ?? null;

      if (!customerId && phone.trim()) {
        if (!name.trim()) {
          setError("Enter a name for the new customer");
          return;
        }
        const res = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to create customer");
          return;
        }
        customerId = data.id;
      }

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          items: cart.map((l) => ({ itemId: l.itemId, quantity: l.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to complete sale");
        return;
      }

      router.push(`/invoices/${data.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">New sale</h1>

      {(error || cartError) && (
        <div className="mt-4 rounded-lg bg-beige-100 px-3 py-2 text-sm text-beige-900">
          {error ?? cartError}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ItemSearchAndCart
            searchInputRef={searchInputRef}
            query={query}
            results={results}
            cart={cart}
            onSearch={runSearch}
            onSearchKeyDown={handleSearchKeyDown}
            onSelectResult={selectResult}
            onUpdateQuantity={updateQuantity}
            onRemoveLine={removeLine}
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Customer (optional)</h2>
          <div className="mt-3 space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-babyblue-500"
                value={phone}
                onChange={(e) => runPhoneLookup(e.target.value)}
                placeholder="Leave blank for walk-in"
              />
            </div>
            {phone.trim() && lookupDone && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-babyblue-500 disabled:bg-gray-50"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={Boolean(matchedCustomer)}
                />
                <p className="mt-1 text-xs text-gray-400">
                  {matchedCustomer ? "Existing customer" : "New customer — will be added"}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between text-lg font-semibold text-gray-900">
              <span>Total</span>
              <span>{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCompleteSale}
            disabled={submitting || cart.length === 0}
            className="mt-4 w-full rounded-lg bg-babyblue-600 py-2 text-sm font-medium text-white hover:bg-babyblue-700 disabled:opacity-50"
          >
            {submitting ? "Completing..." : "Complete sale"}
          </button>
        </div>
      </div>
    </div>
  );
}
