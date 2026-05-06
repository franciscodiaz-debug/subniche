"use client";

import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type SheetContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const SheetContext = createContext<SheetContextValue | null>(null);

function useSheetContext() {
  const context = useContext(SheetContext);

  if (!context) {
    throw new Error("Sheet components must be used inside <Sheet>.");
  }

  return context;
}

export function Sheet({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);

  return <SheetContext.Provider value={value}>{children}</SheetContext.Provider>;
}

export function SheetTrigger({
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useSheetContext();

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

export function SheetContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const { open, setOpen } = useSheetContext();

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
      data-testid="sheet-backdrop"
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      onMouseDown={() => setOpen(false)}
    >
      <div
        className={cn(
          "fixed inset-y-0 right-0 w-[calc(100%-2rem)] max-w-md border-l border-border bg-card p-5 shadow-overlay",
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
          aria-label="Close sheet"
          onClick={() => setOpen(false)}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1.5 pr-8", className)} {...props} />;
}

export function SheetTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("text-lg font-semibold", className)} {...props} />
  );
}

export function SheetDescription({
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
