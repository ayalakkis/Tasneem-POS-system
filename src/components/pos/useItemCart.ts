"use client";

import { useRef, useState, type KeyboardEvent } from "react";

export type SearchItem = {
  id: string;
  name: string;
  barcode: string | null;
  sellingPrice: number;
  quantityInStock: number;
  category: { name: string };
};

export type CartLine = {
  itemId: string;
  name: string;
  sellingPrice: number;
  quantity: number;
  quantityInStock: number;
};

export function useItemCart() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartError, setCartError] = useState<string | null>(null);

  function addToCart(item: SearchItem) {
    if (item.quantityInStock === 0) {
      setCartError(`"${item.name}" is out of stock`);
      return;
    }
    setCartError(null);
    setCart((prev) => {
      const existing = prev.find((l) => l.itemId === item.id);
      if (existing) {
        if (existing.quantity >= item.quantityInStock) return prev;
        return prev.map((l) =>
          l.itemId === item.id ? { ...l, quantity: l.quantity + 1 } : l
        );
      }
      return [
        ...prev,
        {
          itemId: item.id,
          name: item.name,
          sellingPrice: item.sellingPrice,
          quantity: 1,
          quantityInStock: item.quantityInStock,
        },
      ];
    });
  }

  function runSearch(value: string) {
    setQuery(value);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    searchDebounce.current = setTimeout(async () => {
      const res = await fetch(`/api/items/search?q=${encodeURIComponent(value)}`);
      const data = await res.json();
      setResults(data);
    }, 200);
  }

  function handleSearchKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (results.length === 0) return;
    const exactBarcode = results.find((r) => r.barcode === query.trim());
    const chosen = exactBarcode ?? (results.length === 1 ? results[0] : null);
    if (!chosen) return;
    selectResult(chosen);
  }

  function selectResult(item: SearchItem) {
    addToCart(item);
    setQuery("");
    setResults([]);
    searchInputRef.current?.focus();
  }

  function updateQuantity(itemId: string, quantity: number) {
    setCart((prev) =>
      prev.map((l) =>
        l.itemId === itemId
          ? { ...l, quantity: Math.max(1, Math.min(quantity, l.quantityInStock)) }
          : l
      )
    );
  }

  function removeLine(itemId: string) {
    setCart((prev) => prev.filter((l) => l.itemId !== itemId));
  }

  const total = cart.reduce((sum, l) => sum + l.sellingPrice * l.quantity, 0);

  return {
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
    resetCart: () => setCart([]),
  };
}
