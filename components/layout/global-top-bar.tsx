"use client";

import { ChevronDown, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function GlobalTopBar() {
  return (
    <div className="hidden h-20 grid-cols-[minmax(0,1fr)_minmax(22rem,36rem)_minmax(0,1fr)] items-center gap-6 px-8 lg:grid lg:px-10 xl:px-12">
      <div />
      <label className="relative block lg:-translate-x-20">
        <span className="sr-only">Search SubNiche</span>
        <input
          type="search"
          placeholder="Search gear, musicians, communities..."
          className="h-11 w-full rounded-lg border border-transparent bg-card px-4 pr-12 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/55 focus:ring-2 focus:ring-primary/15"
        />
        <Search
          className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-primary"
          aria-hidden="true"
        />
      </label>
      <button
        type="button"
        className="justify-self-end rounded-lg px-2 py-1 text-left transition hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
      >
        <span className="flex items-center gap-3">
          <Avatar className="size-10 rounded-full">
            <AvatarImage src="/avatar-jordan.jpg" alt="" />
            <AvatarFallback>JM</AvatarFallback>
          </Avatar>
          <span className="hidden min-w-0 xl:block">
            <span className="block text-sm font-semibold leading-5 text-foreground">
              JillMusic
            </span>
            <span className="block text-xs text-muted-foreground">u/jek116</span>
          </span>
          <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
        </span>
      </button>
    </div>
  );
}
