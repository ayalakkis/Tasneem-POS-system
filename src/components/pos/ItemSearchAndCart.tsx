"use client";

import type { RefObject, KeyboardEvent } from "react";
import type { SearchItem, CartLine } from "./useItemCart";

export default function ItemSearchAndCart({
  searchInputRef,
  query,
  results,
  cart,
  onSearch,
  onSearchKeyDown,
  onSelectResult,
  onUpdateQuantity,
  onRemoveLine,
}: {
  searchInputRef: RefObject<HTMLInputElement | null>;
  query: string;
  results: SearchItem[];
  cart: CartLine[];
  onSearch: (value: string) => void;
  onSearchKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onSelectResult: (item: SearchItem) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveLine: (itemId: string) => void;
}) {
  return (
    <div>
      <div className="relative">
        <input
          ref={searchInputRef}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-babyblue-500"
          placeholder="Scan barcode or search by name"
          value={query}
          onChange={(e) => onSearch(e.target.value)}
          onKeyDown={onSearchKeyDown}
          autoFocus
        />
        {query && results.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-md">
            {results.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelectResult(item)}
                  disabled={item.quantityInStock === 0}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>
                    {item.name}
                    {item.barcode && (
                      <span className="ml-2 text-xs text-gray-400">{item.barcode}</span>
                    )}
                  </span>
                  <span className="text-gray-500">
                    {item.sellingPrice.toFixed(2)} · {item.quantityInStock} in stock
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {query && results.length === 0 && (
          <p className="mt-1 text-sm text-gray-400">No matching items.</p>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Subtotal</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cart.map((line) => (
              <tr key={line.itemId}>
                <td className="px-4 py-3 font-medium text-gray-900">{line.name}</td>
                <td className="px-4 py-3 text-gray-600">{line.sellingPrice.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={1}
                    max={line.quantityInStock}
                    value={line.quantity}
                    onChange={(e) => onUpdateQuantity(line.itemId, Number(e.target.value))}
                    className="w-16 rounded-lg border border-gray-300 px-2 py-1 text-sm"
                  />
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {(line.sellingPrice * line.quantity).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onRemoveLine(line.itemId)}
                    className="text-beige-700 hover:underline"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {cart.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  Cart is empty. Search or scan an item to add it.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
