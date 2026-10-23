"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, ShieldCheck, UserRound, UserPlus } from "lucide-react";
import type { Role } from "@prisma/client";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ConfirmDialog,
  Field,
  Input,
  cn,
} from "@/components/ui";

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
  const [deleting, setDeleting] = useState<UserRow | null>(null);

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
      setError("Failed to create employee. Check your connection and try again.");
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

  async function handleSaveEdit(e: FormEvent, id: string) {
    e.preventDefault();
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
      setError("Failed to update user. Check your connection and try again.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(id: string) {
    let res: Response;
    try {
      res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    } catch {
      throw new Error("Failed to delete user. Check your connection and try again.");
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Failed to delete user");

    setUsers((prev) => prev.filter((u) => u.id !== id));
    router.refresh();
  }

  return (
    <div className="grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
      <Card>
        <CardHeader title="New employee" description="Employees can use the POS only. They never see cost or profit." />
        <CardBody>
          <form onSubmit={handleCreate} className="space-y-4" autoComplete="off">
            <Field label="Full name" htmlFor="new-name">
              <Input id="new-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </Field>
            <Field label="Username" htmlFor="new-username" hint="Used to sign in.">
              <Input
                id="new-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoCapitalize="none"
                spellCheck={false}
                required
              />
            </Field>
            <Field label="Temporary password" htmlFor="new-password" hint="At least 6 characters. Share it with the employee.">
              <Input
                id="new-password"
                type="text"
                autoComplete="new-password"
                spellCheck={false}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </Field>
            <Button type="submit" icon={UserPlus} loading={submitting} className="w-full">
              Create employee
            </Button>
          </form>
        </CardBody>
      </Card>

      <div className="space-y-4">
        {error && <Alert tone="danger">{error}</Alert>}

        <Card>
          <CardHeader title="Team" description={`${users.length} account${users.length === 1 ? "" : "s"}`} />
          <ul className="divide-y divide-border">
            {users.map((u) => {
              const isAdmin = u.role === "ADMIN";
              const isSelf = u.id === currentUserId;

              if (editingId === u.id) {
                return (
                  <li key={u.id} className="-mx-3 rounded-lg bg-surface-2 px-3 py-4">
                    <form onSubmit={(e) => handleSaveEdit(e, u.id)} className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Full name" htmlFor={`edit-name-${u.id}`}>
                          <Input
                            id={`edit-name-${u.id}`}
                            size="sm"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => e.key === "Escape" && setEditingId(null)}
                            autoFocus
                          />
                        </Field>
                        <Field label="Username" htmlFor={`edit-username-${u.id}`}>
                          <Input
                            id={`edit-username-${u.id}`}
                            size="sm"
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value)}
                            onKeyDown={(e) => e.key === "Escape" && setEditingId(null)}
                          />
                        </Field>
                      </div>
                      <Field label="New password" htmlFor={`edit-password-${u.id}`} optional hint="Leave blank to keep the current one.">
                        <Input
                          id={`edit-password-${u.id}`}
                          size="sm"
                          autoComplete="new-password"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          onKeyDown={(e) => e.key === "Escape" && setEditingId(null)}
                          minLength={6}
                        />
                      </Field>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                        <Button type="submit" size="sm" loading={savingEdit}>
                          Save changes
                        </Button>
                      </div>
                    </form>
                  </li>
                );
              }

              return (
                <li key={u.id} className="flex items-center gap-3 py-3.5">
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full",
                      isAdmin ? "bg-accent-soft text-accent-soft-fg" : "bg-primary-soft text-primary-soft-fg",
                    )}
                  >
                    {isAdmin ? (
                      <ShieldCheck className="size-4" aria-hidden />
                    ) : (
                      <UserRound className="size-4" aria-hidden />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate text-sm font-medium text-fg">
                      {u.name || u.username}
                      {isSelf && <Badge tone="neutral">You</Badge>}
                    </p>
                    <p className="truncate text-xs text-fg-subtle">@{u.username}</p>
                  </div>
                  <Badge tone={isAdmin ? "accent" : "primary"}>{isAdmin ? "Admin" : "Employee"}</Badge>
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      icon={Pencil}
                      aria-label={`Edit ${u.name || u.username}`}
                      title="Edit"
                      onClick={() => startEdit(u)}
                    />
                    <Button
                      variant="danger-ghost"
                      size="sm"
                      iconOnly
                      icon={Trash2}
                      aria-label={`Delete ${u.name || u.username}`}
                      title={isSelf ? "You can't delete your own account" : "Delete"}
                      disabled={isSelf}
                      onClick={() => setDeleting(u)}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => handleDelete(deleting!.id)}
        title={`Delete ${deleting?.name || deleting?.username || "user"}?`}
        description="They will no longer be able to sign in. This can't be undone."
        confirmLabel="Delete user"
      />
    </div>
  );
}
