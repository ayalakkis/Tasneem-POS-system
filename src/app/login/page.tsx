"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { SHOP_NAME } from "@/lib/config";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
      setError(data.error ?? "Login failed");
      setSubmitting(false);
      return;
    }

    const data = await res.json();
    router.push(data.role === "ADMIN" ? "/admin" : "/pos");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-beige-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow-sm"
      >
        <h1 className="mb-1 min-h-[1.75rem] text-xl font-semibold text-gray-900">
          {SHOP_NAME}
        </h1>
        <p className="mb-6 text-sm text-gray-500">Sign in to continue</p>

        {error && (
          <div className="mb-4 rounded-lg bg-beige-100 px-3 py-2 text-sm text-beige-900">
            {error}
          </div>
        )}

        <label htmlFor="username" className="mb-1 block text-sm font-medium text-gray-700">
          Username
        </label>
        <input
          id="username"
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-babyblue-500"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          required
        />

        <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="mb-6 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-babyblue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-babyblue-600 py-2 text-sm font-medium text-white hover:bg-babyblue-700 disabled:opacity-50"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
