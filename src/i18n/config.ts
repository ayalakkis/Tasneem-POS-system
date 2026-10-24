// Shared by the server (reads the cookie) and the language switch (writes it).
export const LOCALES = ["ar", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ar";
// Namespaced like the theme cookie: cookies are shared across localhost ports.
export const LOCALE_COOKIE = "pos-locale";

export function parseLocale(value: string | undefined): Locale {
  return value === "en" || value === "ar" ? value : DEFAULT_LOCALE;
}

export const dirOf = (locale: Locale) => (locale === "ar" ? "rtl" : "ltr");

/**
 * BCP 47 tag for Intl. Arabic uses the Lebanese region (Levantine month names,
 * e.g. تشرين الأول) with Western digits, as agreed for prices and barcodes.
 */
export const intlLocale = (locale: Locale) => (locale === "ar" ? "ar-LB-u-nu-latn" : "en-GB");
