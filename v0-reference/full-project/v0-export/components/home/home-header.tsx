"use client"

import { Search } from "lucide-react"

export function HomeHeader() {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="px-4 lg:px-6 py-3 max-w-6xl mx-auto">
        <div className="flex items-center bg-card border border-border rounded-lg">
          <Search className="ml-3 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search items, trades, communities..."
            className="w-full h-10 bg-transparent border-0 pl-3 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-0"
          />
        </div>
      </div>
    </header>
  )
}
