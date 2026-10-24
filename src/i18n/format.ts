import { intlLocale, type Locale } from "./config";

/**
 * Locale-aware formatting. Digits are Western in both languages (agreed for
 * prices, barcodes and phone numbers); only words like month names change.
 */
export function formatters(locale: Locale) {
  const tag = intlLocale(locale);
  const date = new Intl.DateTimeFormat(tag, { day: "numeric", month: "short", year: "numeric" });
  const longDate = new Intl.DateTimeFormat(tag, { weekday: "long", day: "numeric", month: "long" });
  const dateTime = new Intl.DateTimeFormat(tag, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const shortDateTime = new Intl.DateTimeFormat(tag, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const time = new Intl.DateTimeFormat(tag, { hour: "2-digit", minute: "2-digit" });
  const dayMonth = new Intl.DateTimeFormat(tag, { day: "numeric", month: "short" });

  return {
    /** 1234.5 → "1234.50". Same in both languages. */
    money: (n: number) => n.toFixed(2),
    date: (d: Date) => date.format(d),
    longDate: (d: Date) => longDate.format(d),
    dateTime: (d: Date) => dateTime.format(d),
    shortDateTime: (d: Date) => shortDateTime.format(d),
    time: (d: Date) => time.format(d),
    dayMonth: (d: Date) => dayMonth.format(d),
  };
}

export type Formatters = ReturnType<typeof formatters>;
