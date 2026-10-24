"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LOCALES, LOCALE_COOKIE, dirOf, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/components/ui";

function applyLocale(next: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  document.documentElement.lang = next;
  document.documentElement.dir = dirOf(next);
}

/**
 * Two-way segmented control: العربية / English. Writes the cookie, flips
 * lang/dir straight away so the layout mirrors instantly, then re-renders the
 * server components in the new language.
 */
export default function LanguageSwitch({ className = "" }: { className?: string }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(next: Locale) {
    if (next === locale) return;
    applyLocale(next);
    startTransition(() => router.refresh());
  }

  return (
    <div
      role="radiogroup"
      aria-label={t.language.label}
      aria-busy={pending || undefined}
      className={cn("inline-flex items-center gap-0.5 rounded-full border border-border bg-surface-2 p-0.5", className)}
    >
      {LOCALES.map((value) => {
        const active = locale === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            lang={value}
            onClick={() => choose(value)}
            className={cn(
              "h-7 rounded-full px-2.5 text-xs font-medium transition-colors",
              active ? "bg-surface text-fg shadow-sm" : "text-fg-subtle hover:text-fg",
            )}
          >
            {t.language[value]}
          </button>
        );
      })}
    </div>
  );
}
