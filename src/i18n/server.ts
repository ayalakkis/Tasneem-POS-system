import { cookies } from "next/headers";
import { LOCALE_COOKIE, dirOf, parseLocale, type Locale } from "./config";
import { getDictionary } from "./dictionaries";
import { formatters } from "./format";
import { plural, type Plural } from "./plural";

/** The language the user picked, or the default (Arabic). Server only. */
export async function getLocale(): Promise<Locale> {
  return parseLocale((await cookies()).get(LOCALE_COOKIE)?.value);
}

/**
 * Everything a server component or route handler needs to speak the user's
 * language:
 *
 *   const { t, f, n } = await getI18n();
 *   t.nav.items           // "Items" / "الأصناف"
 *   f.date(invoice.date)  // locale-formatted, Western digits
 *   n(t.units, 3)         // "3 items" / "3 أصناف"
 */
export async function getI18n() {
  const locale = await getLocale();
  return {
    locale,
    dir: dirOf(locale),
    t: getDictionary(locale),
    f: formatters(locale),
    n: (forms: Plural, count: number, vars?: Record<string, string | number>) => plural(locale, forms, count, vars),
  };
}
