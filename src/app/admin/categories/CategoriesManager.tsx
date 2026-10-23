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

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((category) => (
          <li
            key={category.id}
            className="group flex min-h-[148px] flex-col rounded-xl border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            {editingId === category.id ? (
              <form onSubmit={(e) => handleSaveEdit(e, category.id)} className="flex flex-1 flex-col gap-3">
                <Input
                  aria-label="Category name"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => e.key === "Escape" && setEditingId(null)}
                  autoFocus
                  required
                />
                <div className="mt-auto flex gap-2">
                  <Button type="submit" size="sm" className="flex-1">
                    Save
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-fg">
                    <Tag className="size-[18px]" strokeWidth={1.75} aria-hidden />
                  </div>
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
                </div>
                <p className="mt-4 font-semibold text-fg">{category.name}</p>
                <Link
                  href={`/admin/items?categoryId=${category.id}`}
                  className="mt-auto inline-flex items-center gap-1 self-start pt-1 text-sm text-fg-muted hover:text-primary"
                >
                  <span className="tabular-nums">{category.itemCount}</span>
                  item{category.itemCount === 1 ? "" : "s"}
                  <ArrowUpRight className="size-3.5" aria-hidden />
                </Link>
              </>
            )}
          </li>
        ))}

        <li>
          {adding ? (
            <form
              onSubmit={handleAdd}
              className="flex h-full min-h-[148px] flex-col gap-3 rounded-xl border border-dashed border-primary/40 bg-primary-soft/40 p-5"
            >
              <Input
                aria-label="New category name"
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
              <div className="mt-auto flex gap-2">
                <Button type="submit" size="sm" loading={submitting} className="flex-1">
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
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex h-full min-h-[148px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong text-fg-subtle transition-colors hover:border-primary/50 hover:bg-primary-soft/40 hover:text-primary"
            >
              <Plus className="size-5" aria-hidden />
              <span className="text-sm font-medium">Add category</span>
            </button>
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
