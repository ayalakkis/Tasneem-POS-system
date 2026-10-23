"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck } from "lucide-react";
import { useItemCart } from "@/components/pos/useItemCart";
import ItemSearchAndCart from "@/components/pos/ItemSearchAndCart";
import { useCustomerLookup } from "@/components/pos/useCustomerLookup";
import CustomerFields from "@/components/pos/CustomerFields";
import CheckoutPanel from "@/components/pos/CheckoutPanel";
import { Alert, PageHeader } from "@/components/ui";

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
      <PageHeader eyebrow="Point of sale" title="New sale" className="mb-6" />

      {(error || cartError) && (
        <Alert tone="danger" className="mb-6">
          {error ?? cartError}
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
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

        <CheckoutPanel
          title="Customer"
          description="Optional. Leave blank for a walk-in sale."
          lineCount={cart.reduce((sum, l) => sum + l.quantity, 0)}
          total={total}
          actionLabel="Complete sale"
          actionIcon={CircleCheck}
          onAction={handleCompleteSale}
          submitting={submitting}
          disabled={cart.length === 0}
        >
          <CustomerFields
            idPrefix="sale"
            phone={phone}
            name={name}
            onPhoneChange={runPhoneLookup}
            onNameChange={setName}
            matchedCustomer={matchedCustomer}
            lookupDone={lookupDone}
          />
        </CheckoutPanel>
      </div>
    </div>
  );
}
