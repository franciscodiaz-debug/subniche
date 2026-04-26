"use client";

import Link from "next/link";
import { Search } from "lucide-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";

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

        <div className="flex flex-shrink-0 items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="rounded-lg text-muted-foreground hover:text-foreground"
          >
            <Link href="/login">Sign in</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="rounded-lg border border-primary/50 bg-card text-foreground hover:bg-card/80 hover:text-foreground"
          >
            <Link href="/signup">Sign up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
