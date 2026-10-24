"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LockKeyhole, User } from "lucide-react";
import { Alert, Button, Field, Input } from "@/components/ui";
import { useI18n } from "@/i18n/I18nProvider";

export default function LoginForm() {
  const router = useRouter();
  const { t } = useI18n();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? t.login.failed);
      setSubmitting(false);
      return;
    }

    const data = await res.json();
    router.push(data.role === "ADMIN" ? "/admin" : "/pos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <Alert tone="danger">{error}</Alert>}

      <Field label={t.login.username} htmlFor="username">
        <Input
          id="username"
          size="lg"
          icon={User}
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          invalid={!!error}
          autoFocus
          required
        />
      </Field>

      <Field label={t.login.password} htmlFor="password">
        <div className="relative">
          <Input
            id="password"
            size="lg"
            icon={LockKeyhole}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            invalid={!!error}
            className="[&_input]:pe-12"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? t.login.hidePassword : t.login.showPassword}
            aria-pressed={showPassword}
            className="absolute end-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-fg-subtle hover:bg-surface-3 hover:text-fg"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>

      <Button
        type="submit"
        size="lg"
        loading={submitting}
        trailingIcon={submitting ? undefined : ArrowRight}
        // The arrow points forward: right in English, left in Arabic.
        className="w-full [&_svg:last-child]:rtl:-scale-x-100"
      >
        {submitting ? t.login.signingIn : t.login.signIn}
      </Button>
    </form>
  );
}
