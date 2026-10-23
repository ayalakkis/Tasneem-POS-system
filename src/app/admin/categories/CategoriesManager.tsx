"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Tag, Check, X } from "lucide-react";

type Category = { id: string; name: string; itemCount: number };

const BADGE_COLORS = [
  "bg-babyblue-100 text-babyblue-700",
  "bg-beige-100 text-beige-700",
  "bg-babyblue-200 text-babyblue-800",
  "bg-beige-200 text-beige-800",
];

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

  async function handleSaveEdit(id: string) {
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
    if (!confirm("Delete this category?")) return;
    setError(null);

    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? "Failed to delete category");
      return;
    }

    setCategories((prev) => prev.filter((c) => c.id !== id));
    router.refresh();
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg bg-beige-100 px-3 py-2 text-sm text-beige-900">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((category, i) => (
          <div
            key={category.id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            {editingId === category.id ? (
              <div className="space-y-3">
                <input
                  className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-babyblue-500"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(category.id)}
                    className="flex items-center gap-1 rounded-lg bg-babyblue-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-babyblue-700"
                  >
                    <Check className="h-3.5 w-3.5" /> Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    <X className="h-3.5 w-3.5" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${BADGE_COLORS[i % BADGE_COLORS.length]}`}
                  >
                    <Tag className="h-5 w-5" />
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(category)}
                      aria-label="Edit category"
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      aria-label="Delete category"
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-beige-100 hover:text-beige-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-sm font-semibold text-gray-900">{category.name}</p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {category.itemCount} item{category.itemCount === 1 ? "" : "s"}
                </p>
              </>
            )}
          </div>
        ))}

        {adding ? (
          <form
            onSubmit={handleAdd}
            className="flex flex-col justify-center rounded-xl border-2 border-dashed border-babyblue-300 bg-babyblue-50/40 p-4"
          >
            <input
              className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-babyblue-500"
              placeholder="Category name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
              required
            />
            <div className="mt-3 flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-babyblue-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-babyblue-700 disabled:opacity-50"
              >
                {submitting ? "Adding..." : "Add"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdding(false);
                  setNewName("");
                }}
                className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-white"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex min-h-[128px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-babyblue-300 hover:bg-babyblue-50/40 hover:text-babyblue-600"
          >
            <Plus className="h-6 w-6" />
            <span className="text-sm font-medium">Add category</span>
          </button>
        )}
      </div>
    </div>
  );
}
