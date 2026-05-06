"use client";

import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type DialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error("Dialog components must be used inside <Dialog>.");
  }

  return context;
}

export function Dialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);

  return (
    <DialogContext.Provider value={value}>{children}</DialogContext.Provider>
  );
}

export function DialogTrigger({
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useDialogContext();

  return (
    <button
      type="button"
      onClick={(event) => {
        onClick?.(event);
        setOpen(true);
      }}
      {...props}
    />
  );
}

export function DialogContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const { open, setOpen } = useDialogContext();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen]);

  if (!open) {
    return null;
  }

  return (
    <div
      data-testid="dialog-backdrop"
      className="fixed inset-0 z-50 grid place-items-center bg-background/80 px-4 backdrop-blur-sm"
      onMouseDown={() => setOpen(false)}
    >
      <div
        className={cn(
          "relative w-full max-w-lg rounded-xl border border-border bg-card p-5 shadow-overlay",
          className,
        )}
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
        {...props}
      >
        <button
          type="button"
          className="absolute right-3 top-3 grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          aria-label="Close dialog"
          onClick={() => setOpen(false)}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1.5 pr-8", className)} {...props} />;
}

export function DialogTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("text-lg font-semibold", className)} {...props} />
  );
}

export function DialogDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm leading-6 text-muted-foreground", className)}
      {...props}
    />
  );
}

export function DialogFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-5 flex justify-end gap-2", className)}
      {...props}
    />
  );
}
