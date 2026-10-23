"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button, ConfirmDialog } from "@/components/ui";

export default function DeleteItemButton({
  itemId,
  itemName,
}: {
  itemId: string;
  itemName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    const res = await fetch(`/api/items/${itemId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to delete item");
    }
    router.refresh();
  }

  return (
    <>
      <Button
        variant="danger-ghost"
        size="sm"
        iconOnly
        icon={Trash2}
        aria-label={`Delete ${itemName}`}
        title="Delete"
        onClick={() => setOpen(true)}
      />
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        title={`Delete “${itemName}”?`}
        description="This can't be undone. Items with purchase or sales history can't be deleted."
        confirmLabel="Delete item"
      />
    </>
  );
}
