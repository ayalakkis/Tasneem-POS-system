import { ArrowLeft } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { ArchFrame } from "@/components/brand/Motifs";
import { LinkButton } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-bg px-6 text-center">
      <div className="relative mb-8 flex h-44 w-36 items-end justify-center pb-6">
        <ArchFrame className="absolute inset-0 h-full w-full text-primary/30" />
        <LogoMark className="relative h-20 w-auto text-primary" />
      </div>
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent-soft-fg">Error 404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-fg">This page doesn&apos;t exist</h1>
      <p className="mt-2 max-w-sm text-sm text-fg-muted">
        The link may be old, or the record may have been removed.
      </p>
      <LinkButton href="/" icon={ArrowLeft} className="mt-8">
        Back to the app
      </LinkButton>
    </main>
  );
}
