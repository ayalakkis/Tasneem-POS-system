"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Tag, ArrowUpRight } from "lucide-react";
import { Alert, Button, ConfirmDialog, Input } from "@/components/ui";
import { useI18n } from "@/i18n/I18nProvider";
import { fill } from "@/i18n/plural";

type Category = { id: string; name: string; itemCount: number };

export default function CategoriesManager({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const router = useRouter();
  const { t, n } = useI18n();
  const [categories, setCategories] = useState(initialCategories);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleting, setDeleting] = useState<Category | null>(null);

  function sortByName(list: Category[]) {
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error ?? t.categories.addFailed);
      return;
    }

    setNewName("");
    setAdding(false);
    setCategories((prev) => sortByName([...prev, { id: data.id, name: data.name, itemCount: 0 }]));
    router.refresh();
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setEditingName(category.name);
    setError(null);
  }

  async function handleSaveEdit(e: FormEvent, id: string) {
    e.preventDefault();
    setError(null);
    const res = await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingName }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? t.categories.updateFailed);
      return;
    }

    setCategories((prev) =>
      sortByName(prev.map((c) => (c.id === id ? { ...c, name: data.name } : c)))
    );
    setEditingId(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? t.categories.deleteFailed);

    setCategories((prev) => prev.filter((c) => c.id !== id));
    router.refresh();
  }

  return (
    <div>
      {error && (
        <Alert tone="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <ul className="divide-y divide-border border-y border-border">
        {categories.map((category) => (
          <li key={category.id} className="group flex min-h-16 items-center gap-4 py-3">
            {editingId === category.id ? (
              <form onSubmit={(e) => handleSaveEdit(e, category.id)} className="flex flex-1 flex-wrap items-center gap-2">
                <Input
                  aria-label={t.categories.nameLabel}
                  className="min-w-48 flex-1 sm:max-w-sm"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => e.key === "Escape" && setEditingId(null)}
                  autoFocus
                  required
                />
                <Button type="submit" size="sm">
                  {t.common.save}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                  {t.common.cancel}
                </Button>
              </form>
            ) : (
              <>
                <Tag className="size-[18px] shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
                <p className="min-w-0 flex-1 truncate font-medium text-fg">{category.name}</p>
                <Link
                  href={`/admin/items?categoryId=${category.id}`}
                  className="inline-flex items-center gap-1 text-sm text-fg-muted hover:text-primary"
                >
                  <span className="tabular-nums">{n(t.units, category.itemCount)}</span>
                  <ArrowUpRight className="size-3.5 rtl:-scale-x-100" aria-hidden />
                </Link>
                <div className="flex gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      icon={Pencil}
                      aria-label={fill(t.categories.renameNamed, { name: category.name })}
                      title={t.common.rename}
                      onClick={() => startEdit(category)}
                    />
                    <Button
                      variant="danger-ghost"
                      size="sm"
                      iconOnly
                      icon={Trash2}
                      aria-label={fill(t.categories.deleteNamed, { name: category.name })}
                      title={category.itemCount > 0 ? t.categories.hasItems : t.common.delete}
                      disabled={category.itemCount > 0}
                      onClick={() => setDeleting(category)}
                    />
                </div>
              </>
            )}
          </li>
        ))}

        <li className="py-3">
          {adding ? (
            <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-2">
              <Input
                aria-label={t.categories.newNameLabel}
                className="min-w-48 flex-1 sm:max-w-sm"
                placeholder={t.categories.placeholder}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setAdding(false);
                    setNewName("");
                  }
                }}
                autoFocus
                required
              />
              <Button type="submit" size="sm" loading={submitting}>
                {t.common.add}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAdding(false);
                  setNewName("");
                }}
              >
                {t.common.cancel}
              </Button>
            </form>
          ) : (
            <Button variant="ghost" icon={Plus} onClick={() => setAdding(true)} className="-ms-3 text-primary">
              {t.categories.add}
            </Button>
          )}
        </li>
      </ul>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => handleDelete(deleting!.id)}
        title={fill(t.categories.deleteTitle, { name: deleting?.name ?? "" })}
        description={t.categories.deleteDescription}
        confirmLabel={t.categories.deleteConfirm}
      />
    </div>
  );
}
