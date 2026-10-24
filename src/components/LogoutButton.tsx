"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

export default function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const { t } = useI18n();

  async function handleLogout() {
    setPending(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const Icon = pending ? Loader2 : LogOut;
  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      aria-label={t.shell.logOut}
      title={t.shell.logOut}
      className="flex size-9 shrink-0 items-center justify-center rounded-lg text-sidebar-muted transition-colors hover:bg-sidebar-hover hover:text-sidebar-fg disabled:opacity-60"
    >
      <Icon className={pending ? "size-4 animate-spin" : "size-4 rtl:-scale-x-100"} strokeWidth={1.75} />
    </button>
  );
}
