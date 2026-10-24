import { intlLocale, type Locale } from "./config";

/**
 * Plural forms per CLDR. English needs `one`/`other`; Arabic also uses
 * `zero`, `two`, `few` and `many`. Missing forms fall back to `other`.
 */
export type Plural = {
  zero?: string;
  one: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
};

/** Fills `{name}` placeholders. */
export function fill(template: string, vars: Record<string, string | number> = {}) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match));
}

const rulesCache = new Map<Locale, Intl.PluralRules>();

/** Picks the right plural form for `count` and fills `{count}` plus any vars. */
export function plural(locale: Locale, forms: Plural, count: number, vars: Record<string, string | number> = {}) {
  let rules = rulesCache.get(locale);
  if (!rules) rulesCache.set(locale, (rules = new Intl.PluralRules(intlLocale(locale))));
  const category = rules.select(count) as keyof Plural;
  // Arabic CLDR: 0 is "zero", but many apps read better with an explicit zero form.
  const form = (count === 0 && forms.zero) || forms[category] || forms.other;
  return fill(form, { count, ...vars });
}
