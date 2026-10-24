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
import { useI18n } from "@/i18n/I18nProvider";
import { fill } from "@/i18n/plural";

type UserRow = { id: string; name: string | null; username: string; role: Role };

export default function UsersManager({
  initialUsers,
  currentUserId,
}: {
  initialUsers: UserRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const { t, n } = useI18n();
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
        setError(data.error ?? t.users.createFailed);
        return;
      }

      setName("");
      setUsername("");
      setPassword("");
      setUsers((prev) => [...prev, data]);
      router.refresh();
    } catch {
      setError(t.users.createConnection);
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
        setError(data.error ?? t.users.updateFailed);
        return;
      }

      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
      setEditingId(null);
      router.refresh();
    } catch {
      setError(t.users.updateConnection);
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(id: string) {
    let res: Response;
    try {
      res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    } catch {
      throw new Error(t.users.deleteConnection);
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? t.users.deleteFailed);

    setUsers((prev) => prev.filter((u) => u.id !== id));
    router.refresh();
  }

  return (
    <div className="grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
      <Card>
        <CardHeader title={t.users.newTitle} description={t.users.newDescription} />
        <CardBody>
          <form onSubmit={handleCreate} className="space-y-4" autoComplete="off">
            <Field label={t.users.fullName} htmlFor="new-name">
              <Input id="new-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </Field>
            <Field label={t.users.username} htmlFor="new-username" hint={t.users.usernameHint}>
              <Input
                id="new-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoCapitalize="none"
                spellCheck={false}
                required
              />
            </Field>
            <Field label={t.users.tempPassword} htmlFor="new-password" hint={t.users.tempPasswordHint}>
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
              {t.users.create}
            </Button>
          </form>
        </CardBody>
      </Card>

      <div className="space-y-4">
        {error && <Alert tone="danger">{error}</Alert>}

        <Card>
          <CardHeader title={t.users.team} description={n(t.users.accounts, users.length)} />
          <ul className="divide-y divide-border">
            {users.map((u) => {
              const isAdmin = u.role === "ADMIN";
              const isSelf = u.id === currentUserId;

              if (editingId === u.id) {
                return (
                  <li key={u.id} className="-mx-3 rounded-lg bg-surface-2 px-3 py-4">
                    <form onSubmit={(e) => handleSaveEdit(e, u.id)} className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label={t.users.fullName} htmlFor={`edit-name-${u.id}`}>
                          <Input
                            id={`edit-name-${u.id}`}
                            size="sm"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => e.key === "Escape" && setEditingId(null)}
                            autoFocus
                          />
                        </Field>
                        <Field label={t.users.username} htmlFor={`edit-username-${u.id}`}>
                          <Input
                            id={`edit-username-${u.id}`}
                            size="sm"
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value)}
                            onKeyDown={(e) => e.key === "Escape" && setEditingId(null)}
                          />
                        </Field>
                      </div>
                      <Field
                        label={t.users.newPassword}
                        htmlFor={`edit-password-${u.id}`}
                        optional={t.common.optional}
                        hint={t.users.newPasswordHint}
                      >
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
                          {t.common.cancel}
                        </Button>
                        <Button type="submit" size="sm" loading={savingEdit}>
                          {t.common.saveChanges}
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
                      {isSelf && <Badge tone="neutral">{t.users.you}</Badge>}
                    </p>
                    {/* dir="ltr" keeps "@" in front of the handle inside Arabic text. */}
                    <p className="truncate text-xs text-fg-subtle">
                      <span dir="ltr">@{u.username}</span>
                    </p>
                  </div>
                  <Badge tone={isAdmin ? "accent" : "primary"}>{isAdmin ? t.users.admin : t.users.employee}</Badge>
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      icon={Pencil}
                      aria-label={fill(t.users.editNamed, { name: u.name || u.username })}
                      title={t.common.edit}
                      onClick={() => startEdit(u)}
                    />
                    <Button
                      variant="danger-ghost"
                      size="sm"
                      iconOnly
                      icon={Trash2}
                      aria-label={fill(t.users.deleteNamed, { name: u.name || u.username })}
                      title={isSelf ? t.users.cantDeleteSelf : t.common.delete}
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
        title={fill(t.users.deleteTitle, { name: deleting?.name || deleting?.username || t.users.fallbackName })}
        description={t.users.deleteDescription}
        confirmLabel={t.users.deleteConfirm}
      />
    </div>
  );
}
