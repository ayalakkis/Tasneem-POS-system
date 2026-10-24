"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Tag, ArrowUpRight } from "lucide-react";
import { Alert, Button, ConfirmDialog, Input } from "@/components/ui";

type Category = { id: string; name: string; itemCount: number };

export default function CategoriesManager({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const router = useRouter();
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
      setError(data.error ?? "Failed to add category");
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
      setError(data.error ?? "Failed to update category");
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
    if (!res.ok) throw new Error(data.error ?? "Failed to delete category");

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
                  aria-label="Category name"
                  className="min-w-48 flex-1 sm:max-w-sm"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => e.key === "Escape" && setEditingId(null)}
                  autoFocus
                  required
                />
                <Button type="submit" size="sm">
                  Save
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                  Cancel
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
                  <span className="tabular-nums">{category.itemCount}</span>
                  item{category.itemCount === 1 ? "" : "s"}
                  <ArrowUpRight className="size-3.5 rtl:-scale-x-100" aria-hidden />
                </Link>
                <div className="flex gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      icon={Pencil}
                      aria-label={`Rename ${category.name}`}
                      title="Rename"
                      onClick={() => startEdit(category)}
                    />
                    <Button
                      variant="danger-ghost"
                      size="sm"
                      iconOnly
                      icon={Trash2}
                      aria-label={`Delete ${category.name}`}
                      title={category.itemCount > 0 ? "Move or delete its items first" : "Delete"}
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
                aria-label="New category name"
                className="min-w-48 flex-1 sm:max-w-sm"
                placeholder="Category name"
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
                Add
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAdding(false);
                  setNewName("");
                }}
              >
                Cancel
              </Button>
            </form>
          ) : (
            <Button variant="ghost" icon={Plus} onClick={() => setAdding(true)} className="-ms-3 text-primary">
              Add category
            </Button>
          )}
        </li>
      </ul>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => handleDelete(deleting!.id)}
        title={`Delete “${deleting?.name ?? ""}”?`}
        description="This can't be undone."
        confirmLabel="Delete category"
      />
    </div>
  );
}
