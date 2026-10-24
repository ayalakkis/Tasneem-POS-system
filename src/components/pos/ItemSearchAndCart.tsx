"use client";

import { useState, type RefObject, type KeyboardEvent } from "react";
import { Minus, Plus, ScanBarcode, Search, Trash2 } from "lucide-react";
import { Badge, Button, EmptyState, cn } from "@/components/ui";
import { useI18n } from "@/i18n/I18nProvider";
import { fill } from "@/i18n/plural";
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
  const { t, f, n } = useI18n();
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
          className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-fg-subtle"
        />
        <input
          ref={searchInputRef}
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls="pos-search-results"
          aria-activedescendant={active >= 0 ? `pos-result-${active}` : undefined}
          aria-label={t.pos.searchLabel}
          className="h-14 w-full rounded-xl border border-border-strong bg-surface ps-12 pe-28 text-base text-fg shadow-sm transition-[border-color,box-shadow] placeholder:text-fg-subtle focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
          placeholder={t.pos.searchPlaceholder}
          value={query}
          onChange={(e) => {
            setActive(-1);
            onSearch(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoFocus
        />
        <kbd className="pointer-events-none absolute font-sans end-4 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-border bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-fg-subtle sm:flex">
          {t.pos.enterHint}
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
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start text-sm disabled:cursor-not-allowed disabled:opacity-55",
                      active === i && !out && "bg-primary-soft",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-fg">{item.name}</span>
                      {/* Flex gap, not a margin: two LTR runs in an Arabic line merge into one,
                          which moves a margin to the wrong end. */}
                      <span className="flex min-w-0 gap-3 text-xs text-fg-subtle">
                        <span className="truncate">{item.category.name}</span>
                        {item.barcode && <span className="shrink-0 tabular-nums">{item.barcode}</span>}
                      </span>
                    </span>
                    {out ? (
                      <Badge tone="danger">{t.pos.outOfStock}</Badge>
                    ) : (
                      <span className="text-xs tabular-nums text-fg-subtle">{fill(t.pos.left, { count: item.quantityInStock })}</span>
                    )}
                    <span className="w-16 text-end font-semibold tabular-nums text-fg">
                      {f.money(item.sellingPrice)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {open && results.length === 0 && (
          <p className="mt-2 px-1 text-sm text-fg-subtle">{t.pos.noMatch}</p>
        )}
      </div>

      <section aria-label="Cart" className="pt-2">
        <div className="flex items-center justify-between border-b border-border-strong pb-3">
          <h2 className="text-sm font-semibold text-fg">{t.pos.cart}</h2>
          {cart.length > 0 && (
            <span className="text-xs tabular-nums text-fg-muted">
              {fill(t.pos.cartSummary, { units: n(t.pos.unitCount, units), lines: n(t.pos.lineCount, cart.length) })}
            </span>
          )}
        </div>

        {cart.length === 0 ? (
          <EmptyState
            icon={ScanBarcode}
            title={t.pos.emptyTitle}
            description={t.pos.emptyDescription}
            className="py-12"
          />
        ) : (
          <ul className="divide-y divide-border">
            {cart.map((line) => (
              <li key={line.itemId} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                <div className="min-w-0 flex-1 basis-40">
                  <p className="truncate font-medium text-fg">{line.name}</p>
                  <p className="text-xs tabular-nums text-fg-subtle">{fill(t.pos.each, { price: f.money(line.sellingPrice) })}</p>
                </div>

                <div className="flex items-center rounded-lg border border-border-strong bg-surface shadow-sm">
                  <button
                    type="button"
                    aria-label={fill(t.pos.decrease, { name: line.name })}
                    onClick={() => onUpdateQuantity(line.itemId, line.quantity - 1)}
                    disabled={line.quantity <= 1}
                    className="flex size-10 items-center justify-center rounded-s-lg text-fg-muted hover:bg-surface-2 hover:text-fg disabled:opacity-40"
                  >
                    <Minus className="size-4" />
                  </button>
                  <input
                    type="number"
                    aria-label={fill(t.pos.quantityOf, { name: line.name })}
                    min={1}
                    max={line.quantityInStock}
                    value={line.quantity}
                    onChange={(e) => onUpdateQuantity(line.itemId, Number(e.target.value))}
                    className="h-10 w-12 border-x border-border bg-transparent text-center text-sm font-semibold tabular-nums text-fg focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    aria-label={fill(t.pos.increase, { name: line.name })}
                    onClick={() => onUpdateQuantity(line.itemId, line.quantity + 1)}
                    disabled={line.quantity >= line.quantityInStock}
                    title={line.quantity >= line.quantityInStock ? t.pos.noMore : undefined}
                    className="flex size-10 items-center justify-center rounded-e-lg text-fg-muted hover:bg-surface-2 hover:text-fg disabled:opacity-40"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>

                <p className="w-20 text-end font-semibold tabular-nums text-fg">
                  {f.money(line.sellingPrice * line.quantity)}
                </p>

                <Button
                  variant="danger-ghost"
                  iconOnly
                  icon={Trash2}
                  aria-label={fill(t.pos.removeNamed, { name: line.name })}
                  title={t.pos.remove}
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
