"use client";

import { Menu } from "lucide-react";

interface MobileMenuButtonProps {
  onClick: () => void;
}

export function MobileMenuButton({ onClick }: MobileMenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed left-4 top-4 z-30 rounded-lg border border-border bg-background p-2 transition-colors hover:bg-card lg:hidden"
      aria-label="Open menu"
    >
      <Menu className="h-6 w-6" />
    </button>
  );
}
