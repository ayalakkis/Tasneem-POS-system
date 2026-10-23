"use client";

import { useState } from "react";
import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { THEME_COOKIE, THEMES, type Theme } from "@/lib/theme";

const OPTIONS: Record<Theme, { icon: LucideIcon; label: string }> = {
  system: { icon: Monitor, label: "System theme" },
  light: { icon: Sun, label: "Light theme" },
  dark: { icon: Moon, label: "Dark theme" },
};

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") {
    delete root.dataset.theme;
    document.cookie = `${THEME_COOKIE}=; path=/; max-age=0; samesite=lax`;
  } else {
    root.dataset.theme = theme;
    document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=31536000; samesite=lax`;
  }
}

/**
 * Three-way segmented control: follow the OS, or force light / dark.
 * `initial` comes from the server, which reads the theme cookie (see getTheme).
 */
export default function ThemeToggle({
  initial,
  className = "",
}: {
  initial: Theme;
  className?: string;
}) {
  const [theme, setTheme] = useState<Theme>(initial);

  function choose(next: Theme) {
    applyTheme(next);
    setTheme(next);
  }

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className={`inline-flex items-center gap-0.5 rounded-full border border-border bg-surface-2 p-0.5 ${className}`}
    >
      {THEMES.map((value) => {
        const { icon: Icon, label } = OPTIONS[value];
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => choose(value)}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
              active
                ? "bg-surface text-fg shadow-sm"
                : "text-fg-subtle hover:text-fg"
            }`}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        );
      })}
    </div>
  );
}
