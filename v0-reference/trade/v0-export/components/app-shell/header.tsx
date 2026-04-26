"use client";

import { Search } from "lucide-react";

import { useIsNavCollapseRequested } from "../../hooks/use-nav-collapse-request";
import { Input } from "../ui/input";
import { ProfileChip } from "./profile-chip";

export function Header() {
  // The same signal that collapses the main nav is raised when the market
  // filter panel is open. Shift the header content right so the filter (280px
  // wide) doesn't overlap the search input.
  const filterOpen = useIsNavCollapseRequested();

  return (
    <header className="relative z-40 bg-transparent">
      <div
        className={`flex items-center gap-4 px-4 py-3 pl-16 transition-[padding] duration-300 ease-out motion-reduce:transition-none md:px-6 md:py-4 lg:pl-6 ${
          filterOpen ? "lg:pl-[296px]" : ""
        }`}
      >
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
