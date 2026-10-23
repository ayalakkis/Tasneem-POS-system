"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, ShieldCheck, UserRound, Check, X } from "lucide-react";
import type { Role } from "@prisma/client";

type UserRow = { id: string; name: string | null; username: string; role: Role };

export default function UsersManager({
  initialUsers,
  currentUserId,
}: {
  initialUsers: UserRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Failed to create employee");
        return;
      }

      setName("");
      setUsername("");
      setPassword("");
      setUsers((prev) => [...prev, data]);
      router.refresh();
    } catch {
      setError("Failed to create employee — check your connection and try again");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(user: UserRow) {
    setError(null);
    setEditingId(user.id);
    setEditName(user.name ?? "");
    setEditUsername(user.username);
    setEditPassword("");
  }

  async function handleSaveEdit(id: string) {
    setError(null);
    setSavingEdit(true);

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          username: editUsername,
          ...(editPassword ? { password: editPassword } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Failed to update user");
        return;
      }

      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
      setEditingId(null);
      router.refresh();
    } catch {
      setError("Failed to update user — check your connection and try again");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    setError(null);
    setDeletingId(id);

    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Failed to delete user");
        return;
      }

      setUsers((prev) => prev.filter((u) => u.id !== id));
      router.refresh();
    } catch {
      setError("Failed to delete user — check your connection and try again");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {error && <div className="rounded-lg bg-beige-100 px-3 py-2 text-sm text-beige-900">{error}</div>}

      <form
        onSubmit={handleCreate}
        className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-4"
      >
        <input
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-babyblue-500"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-babyblue-500"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-babyblue-500"
          placeholder="Password"
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-babyblue-600 px-4 py-2 text-sm font-medium text-white hover:bg-babyblue-700 disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create employee"}
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <ul className="divide-y divide-gray-200">
          {users.map((u) => {
            const isAdmin = u.role === "ADMIN";
            const isSelf = u.id === currentUserId;
            const isEditing = editingId === u.id;

            if (isEditing) {
              return (
                <li key={u.id} className="px-4 py-3">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                    <input
                      className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-babyblue-500"
                      placeholder="Name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                    />
                    <input
                      className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-babyblue-500"
                      placeholder="Username"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                    />
                    <input
                      className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-babyblue-500"
                      placeholder="New password (leave blank to keep)"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      minLength={6}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(u.id)}
                        disabled={savingEdit}
                        className="flex items-center gap-1 rounded-lg bg-babyblue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-babyblue-700 disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5" /> Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                      >
                        <X className="h-3.5 w-3.5" /> Cancel
                      </button>
                    </div>
                  </div>
                </li>
              );
            }

            return (
              <li key={u.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      isAdmin ? "bg-beige-100 text-beige-700" : "bg-babyblue-100 text-babyblue-700"
                    }`}
                  >
                    {isAdmin ? (
                      <ShieldCheck className="h-4 w-4" />
                    ) : (
                      <UserRound className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{u.name || u.username}</p>
                    <p className="text-xs text-gray-400">
                      {u.username} · <span className="uppercase tracking-wide">{u.role}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => startEdit(u)}
                    aria-label="Edit user"
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  {!isSelf && (
                    <button
                      onClick={() => handleDelete(u.id)}
                      disabled={deletingId === u.id}
                      aria-label="Delete user"
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-beige-100 hover:text-beige-800 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
