"use client";

import { Search } from "lucide-react";

import { Input } from "../ui/input";
import { ProfileChip } from "./profile-chip";

export function Header() {
  return (
    <header className="relative z-40 bg-transparent">
      <div className="flex items-center gap-4 px-4 py-3 pl-16 md:px-6 md:py-4 lg:pl-6">
        <div className="relative mx-auto w-full max-w-xl flex-1">
          <Input
            type="search"
            placeholder="Search gear, musicians, communities..."
            className="w-full rounded-lg border-transparent bg-card/60 py-2 pl-4 pr-10 backdrop-blur placeholder:text-muted-foreground hover:bg-card/80 focus:border-border focus:bg-card"
            tabIndex={-1}
          />
          <Search className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
        </div>

        <div className="flex-shrink-0">
          <ProfileChip />
        </div>
      </div>
    </header>
  );
}
