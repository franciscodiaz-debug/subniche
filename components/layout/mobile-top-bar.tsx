"use client";

import { Menu, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function MobileTopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-transparent bg-background/95 px-4 py-4 backdrop-blur lg:hidden">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <button
          type="button"
          aria-label="Open navigation menu"
          className="grid size-10 place-items-center rounded-lg border border-border bg-card text-foreground transition hover:border-primary/45 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
        <label className="relative block min-w-0">
          <span className="sr-only">Search SubNiche</span>
          <input
            type="search"
            placeholder="Search gear, musicians..."
            className="h-10 w-full rounded-lg border border-transparent bg-card px-4 pr-10 text-sm text-foreground outline-none transition placeholder:text-muted-foreground hover:border-primary/35 focus:border-primary/55 focus:ring-2 focus:ring-primary/15"
          />
          <Search
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-primary"
            aria-hidden="true"
          />
        </label>
        <Avatar className="size-9 rounded-full">
          <AvatarImage src="/avatar-jordan.jpg" alt="" />
          <AvatarFallback>JM</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
