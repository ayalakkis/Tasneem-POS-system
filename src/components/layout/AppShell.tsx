"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Sidebar, { isActive, type NavItem, type NavSection } from "@/components/layout/Sidebar";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitch from "@/components/LanguageSwitch";
import { useI18n } from "@/i18n/I18nProvider";
import { LogoMark } from "@/components/brand/Logo";
import type { Theme } from "@/lib/theme";
import { cn } from "@/components/ui";

/**
 * App frame: green sidebar (a drawer below lg), slim top bar with the current
 * section and theme switch, and a scrolling content area.
 */
export default function AppShell({
  sections,
  footer,
  user,
  theme,
  children,
}: {
  sections: NavSection[];
  footer?: NavItem[];
  user: { username: string; role: string };
  theme: Theme;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { t } = useI18n();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  // Longest matching href wins, so /admin/items beats /admin.
  const current = [...sections.flatMap((s) => s.items), ...(footer ?? [])]
    .filter((item) => isActive(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0];

  const sidebar = (
    <Sidebar sections={sections} footer={footer} user={user} onNavigate={() => setDrawerOpen(false)} />
  );

  return (
    <div className="flex h-dvh bg-bg">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">{sidebar}</aside>

      {/* Mobile drawer */}
      <div
        className={cn("fixed inset-0 z-40 lg:hidden", !drawerOpen && "pointer-events-none")}
        aria-hidden={!drawerOpen}
      >
        <div
          onClick={() => setDrawerOpen(false)}
          className={cn(
            "absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200",
            drawerOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          id="app-drawer"
          inert={!drawerOpen}
          className={cn(
            "absolute inset-y-0 start-0 w-72 max-w-[85vw] shadow-lg transition-transform duration-200 ease-out",
            // Slides in from the reading start: left in English, right in Arabic.
            drawerOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full",
          )}
        >
          {sidebar}
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label={t.shell.closeMenu}
            className="absolute end-3 top-3 flex size-9 items-center justify-center rounded-lg text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-fg"
          >
            <X className="size-5" />
          </button>
        </aside>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-surface/70 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label={t.shell.openMenu}
            aria-controls="app-drawer"
            aria-expanded={drawerOpen}
            className="-ms-1 flex size-10 items-center justify-center rounded-lg text-fg-muted hover:bg-surface-3 hover:text-fg lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <LogoMark title={t.shell.logo} className="h-8 w-auto text-primary lg:hidden" />
          {current && (
            <p className="hidden truncate text-sm font-medium text-fg-muted sm:block lg:text-fg">
              {current.label}
            </p>
          )}
          <div className="ms-auto flex items-center gap-2">
            <LanguageSwitch />
            <ThemeToggle initial={theme} />
          </div>
        </header>

        <main className="relative flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
