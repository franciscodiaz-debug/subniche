"use client";

import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
  RefObject,
} from "react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

type DropdownContextValue = {
  menuRef: RefObject<HTMLDivElement | null>;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdownContext() {
  const context = useContext(DropdownContext);

  if (!context) {
    throw new Error("DropdownMenu components must be used together.");
  }

  return context;
}

export function DropdownMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const value = useMemo(() => ({ menuRef, open, setOpen }), [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <DropdownContext.Provider value={value}>
      <div ref={menuRef} className="relative inline-block">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen } = useDropdownContext();

  return (
    <button
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={(event) => {
        onClick?.(event);
        setOpen(!open);
      }}
      {...props}
    />
  );
}

export function DropdownMenuContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const { open } = useDropdownContext();

  if (!open) {
    return null;
  }

  return (
    <div
      className={cn(
        "absolute right-0 z-40 mt-2 min-w-44 rounded-lg border border-border bg-card p-1 shadow-card",
        className,
      )}
      role="menu"
      {...props}
    />
  );
}

export function DropdownMenuItem({
  className,
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useDropdownContext();

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:text-foreground focus-visible:outline-none",
        className,
      )}
      role="menuitem"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          setOpen(false);
        }
      }}
      {...props}
    />
  );
}
