import type { Locale } from "../config";
import { ar } from "./ar";
import { en, type Dictionary } from "./en";

const DICTIONARIES: Record<Locale, Dictionary> = { ar, en };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

export type { Dictionary };
