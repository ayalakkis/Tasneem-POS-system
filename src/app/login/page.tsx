import { LogoMark } from "@/components/brand/Logo";
import { ArchFrame, Diamond } from "@/components/brand/Motifs";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitch from "@/components/LanguageSwitch";
import { getI18n } from "@/i18n/server";
import { getTheme } from "@/lib/theme-server";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const [theme, { t }] = await Promise.all([getTheme(), getI18n()]);

  return (
    <div className="grid min-h-dvh bg-bg lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Brand panel: the sign on its wall, lit from behind. */}
      <aside className="relative hidden overflow-hidden bg-sidebar lg:flex lg:flex-col lg:items-center lg:justify-center">
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 size-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/25 blur-[120px]"
        />
        <ArchFrame className="absolute left-1/2 top-1/2 h-[78%] w-auto -translate-x-1/2 -translate-y-[46%] text-sidebar-fg/10" />
        <ArchFrame className="absolute left-1/2 top-1/2 h-[64%] w-auto -translate-x-1/2 -translate-y-[44%] text-sidebar-fg/[0.06]" />
        <LogoMark
          title={t.shell.logo}
          className="relative h-56 w-auto text-sidebar-fg drop-shadow-[0_18px_40px_rgb(0_0_0/0.35)]"
        />
        <p className="absolute bottom-10 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-sidebar-muted">
          <Diamond />
          {t.login.tagline}
          <Diamond />
        </p>
      </aside>

      <main className="relative flex flex-col px-6 py-8 sm:px-10">
        <div className="flex justify-end">
          <div className="flex items-center gap-2">
            <LanguageSwitch />
            <ThemeToggle initial={theme} />
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <LogoMark title={t.shell.logo} className="mb-10 h-16 w-auto self-start text-primary lg:hidden" />
          <h1 className="text-[28px] font-semibold leading-9 tracking-tight text-fg">{t.login.welcome}</h1>
          <p className="mb-8 mt-1.5 text-sm text-fg-muted">{t.login.subtitle}</p>
          <LoginForm />
        </div>

        <p className="text-center text-xs text-fg-subtle">{t.login.forgot}</p>
      </main>
    </div>
  );
}
