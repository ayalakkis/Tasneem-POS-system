"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Truck } from "lucide-react";
import { useItemCart } from "@/components/pos/useItemCart";
import ItemSearchAndCart from "@/components/pos/ItemSearchAndCart";
import { useCustomerLookup } from "@/components/pos/useCustomerLookup";
import CustomerFields from "@/components/pos/CustomerFields";
import CheckoutPanel from "@/components/pos/CheckoutPanel";
import { Alert, Field, Textarea } from "@/components/ui";
import { useI18n } from "@/i18n/I18nProvider";

export default function DeliveryScreen() {
  const router = useRouter();
  const { t } = useI18n();
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
    resetCart,
  } = useItemCart();

  const { phone, name, setName, matchedCustomer, lookupDone, runPhoneLookup } =
    useCustomerLookup();
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);

    if (cart.length === 0) {
      setError(t.deliveries.needItems);
      return;
    }
    if (!phone.trim() || !name.trim()) {
      setError(t.deliveries.needCustomer);
      return;
    }
    if (!address.trim()) {
      setError(t.deliveries.needAddress);
      return;
    }

    setSubmitting(true);
    try {
      let customerId = matchedCustomer?.id ?? null;

      if (!customerId) {
        const res = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? t.pos.customerFailed);
          return;
        }
        customerId = data.id;
      }

      const res = await fetch("/api/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          deliveryAddress: address.trim(),
          items: cart.map((l) => ({ itemId: l.itemId, quantity: l.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t.deliveries.createFailed);
        return;
      }

      resetCart();
      router.push(`/invoices/${data.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section aria-labelledby="new-delivery-title">
      <h2 id="new-delivery-title" className="mb-4 text-base font-semibold text-fg">
        {t.deliveries.newOrder}
      </h2>

      {(error || cartError) && (
        <Alert tone="danger" className="mb-4">
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
          title={t.deliveries.detailsTitle}
          description={t.deliveries.detailsDescription}
          lineCount={cart.reduce((sum, l) => sum + l.quantity, 0)}
          total={total}
          actionLabel={t.deliveries.create}
          actionIcon={Truck}
          onAction={handleSubmit}
          submitting={submitting}
          disabled={cart.length === 0}
        >
          <CustomerFields
            idPrefix="delivery"
            phone={phone}
            name={name}
            onPhoneChange={runPhoneLookup}
            onNameChange={setName}
            matchedCustomer={matchedCustomer}
            lookupDone={lookupDone}
          />
          <Field label={t.deliveries.address} htmlFor="delivery-address">
            <Textarea
              id="delivery-address"
              rows={3}
              placeholder={t.deliveries.addressPlaceholder}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </Field>
        </CheckoutPanel>
      </div>
    </section>
  );
}
