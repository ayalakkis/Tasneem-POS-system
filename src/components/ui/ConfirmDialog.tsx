"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { Alert } from "./Alert";
import { Button } from "./Button";

/**
 * Modal confirmation built on <dialog>, which gives focus trapping, Escape to
 * close and an inert page behind it for free.
 *
 * `onConfirm` may be async; throw an Error to keep the dialog open and show
 * its message.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  tone = "danger",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  tone?: "danger" | "primary";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  async function confirm() {
    setPending(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  function close() {
    if (pending) return;
    setError(null);
    onClose();
  }

  return (
    <dialog
      ref={ref}
      onClose={close}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => e.target === ref.current && close()}
      // Reset inherited text styles: the dialog is often rendered inside a
      // right-aligned, nowrap table cell.
      className="m-auto w-[calc(100%-2rem)] max-w-md whitespace-normal text-start rounded-2xl border border-border bg-surface p-0 text-fg shadow-lg backdrop:bg-black/45 backdrop:backdrop-blur-[2px] open:animate-[dialog-in_160ms_ease-out]"
    >
      <div className="flex gap-4 p-6">
        {tone === "danger" && (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger-soft-fg">
            <TriangleAlert className="size-5" aria-hidden />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-fg">{title}</h2>
          {description && <p className="mt-1.5 text-sm text-fg-muted">{description}</p>}
          {error && (
            <Alert tone="danger" className="mt-4">
              {error}
            </Alert>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2 rounded-b-2xl border-t border-border bg-surface-2 px-6 py-3">
        <Button variant="ghost" onClick={close} disabled={pending}>
          Cancel
        </Button>
        <Button variant={tone === "danger" ? "danger" : "primary"} onClick={confirm} loading={pending} autoFocus>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
