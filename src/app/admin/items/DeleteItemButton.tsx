"use client";

import { useRouter } from "next/navigation";

export default function DeleteItemButton({
  itemId,
  itemName,
}: {
  itemId: string;
  itemName: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete "${itemName}"?`)) return;

    const res = await fetch(`/api/items/${itemId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Failed to delete item");
      return;
    }

    router.refresh();
  }

  return (
    <button onClick={handleDelete} className="ml-3 text-beige-700 hover:underline">
      Delete
    </button>
  );
}
