"use client";

import { useRef, useState } from "react";

export type Customer = { id: string; name: string; phone: string };

export function useCustomerLookup() {
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [matchedCustomer, setMatchedCustomer] = useState<Customer | null>(null);
  const [lookupDone, setLookupDone] = useState(false);

  function runPhoneLookup(value: string) {
    setPhone(value);
    setMatchedCustomer(null);
    setLookupDone(false);
    setName("");
    if (debounce.current) clearTimeout(debounce.current);
    if (!value.trim()) return;
    debounce.current = setTimeout(async () => {
      const res = await fetch(`/api/customers?phone=${encodeURIComponent(value.trim())}`);
      const data: Customer[] = await res.json();
      const exact = data.find((c) => c.phone === value.trim());
      setMatchedCustomer(exact ?? null);
      if (exact) setName(exact.name);
      setLookupDone(true);
    }, 300);
  }

  return { phone, name, setName, matchedCustomer, lookupDone, runPhoneLookup };
}
