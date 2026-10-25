import { ArrowLeft } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { ArchFrame } from "@/components/brand/Motifs";
import { LinkButton } from "@/components/ui";
import { getI18n } from "@/i18n/server";

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-bg px-6 text-center">
      <div className="relative mb-8 flex h-44 w-36 items-end justify-center pb-6">
        <ArchFrame className="absolute inset-0 h-full w-full text-primary/30" />
        <LogoMark title={t.shell.logo} className="relative h-20 w-auto text-primary" />
      </div>
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent-soft-fg">{t.notFound.label}</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-fg">{t.notFound.title}</h1>
      <p className="mt-2 max-w-sm text-sm text-fg-muted">
        {t.notFound.description}
      </p>
      <LinkButton href="/" icon={ArrowLeft} className="mt-8">
        {t.notFound.back}
      </LinkButton>
    </main>
  );
}
