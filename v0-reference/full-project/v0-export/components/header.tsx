"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function Header() {
  return (
    <header className="z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex items-center justify-center pl-16 pr-6 lg:px-6 py-4">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search"
              className="w-full bg-card border-border pl-4 pr-10 py-2 rounded-lg"
              tabIndex={-1}
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
          </div>
        </div>
      </div>
    </header>
  )
}
