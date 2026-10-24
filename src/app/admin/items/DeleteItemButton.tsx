"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button, ConfirmDialog } from "@/components/ui";
import { useI18n } from "@/i18n/I18nProvider";
import { fill } from "@/i18n/plural";

export default function DeleteItemButton({
  itemId,
  itemName,
}: {
  itemId: string;
  itemName: string;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    const res = await fetch(`/api/items/${itemId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? t.items.deleteFailed);
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
        aria-label={fill(t.items.deleteNamed, { name: itemName })}
        title={t.common.delete}
        onClick={() => setOpen(true)}
      />
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        title={fill(t.items.deleteTitle, { name: itemName })}
        description={t.items.deleteDescription}
        confirmLabel={t.items.deleteConfirm}
      />
    </>
  );
}
