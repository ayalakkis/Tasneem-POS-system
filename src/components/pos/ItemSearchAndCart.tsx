"use client";

import { useState, type RefObject, type KeyboardEvent } from "react";
import { Minus, Plus, ScanBarcode, Search, Trash2 } from "lucide-react";
import { Badge, Button, EmptyState, cn } from "@/components/ui";
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
  // Keyboard highlight in the results list. -1 = nothing highlighted, so Enter
  // falls through to the hook's barcode / single-match behavior.
  const [active, setActive] = useState(-1);
  const open = query.length > 0;

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (open && results.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => (i + 1) % results.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
        return;
      }
      if (e.key === "Enter" && active >= 0 && results[active]) {
        e.preventDefault();
        if (results[active].quantityInStock > 0) select(results[active]);
        return;
      }
    }
    if (e.key === "Escape" && query) {
      e.preventDefault();
      onSearch("");
      setActive(-1);
      return;
    }
    onSearchKeyDown(e);
  }

  function select(item: SearchItem) {
    setActive(-1);
    onSelectResult(item);
  }

  const units = cart.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-fg-subtle"
        />
        <input
          ref={searchInputRef}
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls="pos-search-results"
          aria-activedescendant={active >= 0 ? `pos-result-${active}` : undefined}
          aria-label="Scan barcode or search items"
          className="h-14 w-full rounded-xl border border-border-strong bg-surface pl-12 pr-28 text-base text-fg shadow-sm transition-[border-color,box-shadow] placeholder:text-fg-subtle focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
          placeholder="Scan a barcode or type a name"
          value={query}
          onChange={(e) => {
            setActive(-1);
            onSearch(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoFocus
        />
        <kbd className="pointer-events-none absolute font-sans right-4 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-border bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-fg-subtle sm:flex">
          Enter ↵ to add
        </kbd>

        {open && results.length > 0 && (
          <ul
            id="pos-search-results"
            role="listbox"
            className="absolute z-20 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-border bg-surface p-1.5 shadow-lg"
          >
            {results.map((item, i) => {
              const out = item.quantityInStock === 0;
              return (
                <li key={item.id} id={`pos-result-${i}`} role="option" aria-selected={active === i} aria-disabled={out}>
                  <button
                    type="button"
                    tabIndex={-1}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => select(item)}
                    disabled={out}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm disabled:cursor-not-allowed disabled:opacity-55",
                      active === i && !out && "bg-primary-soft",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-fg">{item.name}</span>
                      <span className="block truncate text-xs text-fg-subtle">
                        {item.category.name}
                        {item.barcode && <span className="ml-3 tabular-nums">{item.barcode}</span>}
                      </span>
                    </span>
                    {out ? (
                      <Badge tone="danger">Out of stock</Badge>
                    ) : (
                      <span className="text-xs tabular-nums text-fg-subtle">{item.quantityInStock} left</span>
                    )}
                    <span className="w-16 text-right font-semibold tabular-nums text-fg">
                      {item.sellingPrice.toFixed(2)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {open && results.length === 0 && (
          <p className="mt-2 px-1 text-sm text-fg-subtle">No matching items.</p>
        )}
      </div>

      <section aria-label="Cart" className="pt-2">
        <div className="flex items-center justify-between border-b border-border-strong pb-3">
          <h2 className="text-sm font-semibold text-fg">Cart</h2>
          {cart.length > 0 && (
            <span className="text-xs tabular-nums text-fg-muted">
              {units} unit{units === 1 ? "" : "s"} in {cart.length} line{cart.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {cart.length === 0 ? (
          <EmptyState
            icon={ScanBarcode}
            title="Cart is empty"
            description="Scan a barcode or search above to add the first item."
            className="py-12"
          />
        ) : (
          <ul className="divide-y divide-border">
            {cart.map((line) => (
              <li key={line.itemId} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                <div className="min-w-0 flex-1 basis-40">
                  <p className="truncate font-medium text-fg">{line.name}</p>
                  <p className="text-xs tabular-nums text-fg-subtle">{line.sellingPrice.toFixed(2)} each</p>
                </div>

                <div className="flex items-center rounded-lg border border-border-strong bg-surface shadow-sm">
                  <button
                    type="button"
                    aria-label={`Decrease ${line.name}`}
                    onClick={() => onUpdateQuantity(line.itemId, line.quantity - 1)}
                    disabled={line.quantity <= 1}
                    className="flex size-10 items-center justify-center rounded-l-lg text-fg-muted hover:bg-surface-2 hover:text-fg disabled:opacity-40"
                  >
                    <Minus className="size-4" />
                  </button>
                  <input
                    type="number"
                    aria-label={`Quantity of ${line.name}`}
                    min={1}
                    max={line.quantityInStock}
                    value={line.quantity}
                    onChange={(e) => onUpdateQuantity(line.itemId, Number(e.target.value))}
                    className="h-10 w-12 border-x border-border bg-transparent text-center text-sm font-semibold tabular-nums text-fg focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    aria-label={`Increase ${line.name}`}
                    onClick={() => onUpdateQuantity(line.itemId, line.quantity + 1)}
                    disabled={line.quantity >= line.quantityInStock}
                    title={line.quantity >= line.quantityInStock ? "No more in stock" : undefined}
                    className="flex size-10 items-center justify-center rounded-r-lg text-fg-muted hover:bg-surface-2 hover:text-fg disabled:opacity-40"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>

                <p className="w-20 text-right font-semibold tabular-nums text-fg">
                  {(line.sellingPrice * line.quantity).toFixed(2)}
                </p>

                <Button
                  variant="danger-ghost"
                  iconOnly
                  icon={Trash2}
                  aria-label={`Remove ${line.name}`}
                  title="Remove"
                  onClick={() => onRemoveLine(line.itemId)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
