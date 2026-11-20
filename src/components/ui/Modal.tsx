"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: Size;
  closeOnBackdrop?: boolean;
}

const sizeStyles: Record<Size, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnBackdrop = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Open or close the real <dialog> when the "open" prop changes
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose} // fires on Escape, close button, and dialog.close()
      onClick={(e) => {
        // A click on the dimmed area targets the dialog itself
        if (closeOnBackdrop && e.target === dialogRef.current) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100%-2rem)] rounded-xl border border-border bg-surface p-0 text-foreground",
        "max-h-[85vh] overflow-y-auto backdrop:bg-black/50",
        sizeStyles[size]
      )}
    >
      {open && (
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-md p-1 text-muted transition-colors hover:bg-surface-secondary hover:text-foreground"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-5 py-4">{children}</div>

          {footer && (
            <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
              {footer}
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}