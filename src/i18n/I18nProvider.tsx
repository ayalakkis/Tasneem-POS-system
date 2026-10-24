"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { dirOf, type Locale } from "./config";
import { getDictionary } from "./dictionaries";
import { formatters } from "./format";
import { plural, type Plural } from "./plural";

const LocaleContext = createContext<Locale | null>(null);

/** Set once in the root layout from the locale cookie. */
export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

/** Client counterpart of `getI18n()`: `const { t, f, n } = useI18n()`. */
export function useI18n() {
  const locale = useContext(LocaleContext);
  if (!locale) throw new Error("useI18n must be used inside <I18nProvider>");
  return useMemo(
    () => ({
      locale,
      dir: dirOf(locale),
      t: getDictionary(locale),
      f: formatters(locale),
      n: (forms: Plural, count: number, vars?: Record<string, string | number>) => plural(locale, forms, count, vars),
    }),
    [locale],
  );
}
