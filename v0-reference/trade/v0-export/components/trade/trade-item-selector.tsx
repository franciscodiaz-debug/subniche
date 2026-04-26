"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Check, ChevronDown, Search, Settings } from "lucide-react"

import { cn } from "@/lib/utils"
import type { TradeableItemSummary } from "@/lib/market-data"

interface TradeItemSelectorProps {
  items: TradeableItemSummary[]
  selectedItemId: string
  onSelect: (id: string) => void
  totalMatches: number
}

export function TradeItemSelector({
  items,
  selectedItemId,
  onSelect,
  totalMatches,
}: TradeItemSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected =
    selectedItemId === "all"
      ? null
      : items.find((item) => item.id === selectedItemId) ?? null

  const filtered = items.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()),
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  return (
    <div className="relative flex items-center gap-2" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-left transition-colors",
          "hover:border-primary/50 hover:bg-secondary",
          isOpen && "border-primary/50 bg-secondary",
        )}
      >
        {selected ? (
          <span className="max-w-[180px] truncate text-sm font-medium text-foreground">
            {selected.title}
          </span>
        ) : (
          <span className="text-sm font-medium text-foreground">All items</span>
        )}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {selected ? (
        <button
          type="button"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          title="Trade preferences"
        >
          <Settings className="h-4 w-4" />
        </button>
      ) : null}

      {isOpen ? (
        <div className="absolute left-0 top-full z-[60] mt-1 w-72 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          {items.length > 5 ? (
            <div className="border-b border-border p-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-md border border-border bg-card py-1.5 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          ) : null}

          {!search ? (
            <button
              type="button"
              onClick={() => {
                onSelect("all")
                setIsOpen(false)
                setSearch("")
              }}
              className={cn(
                "flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors",
                selectedItemId === "all"
                  ? "bg-primary/10"
                  : "hover:bg-secondary",
              )}
            >
              <span className="flex-1 text-sm font-medium text-foreground">
                All items
              </span>
              <span className="text-xs text-muted-foreground">
                {totalMatches} matches
              </span>
              {selectedItemId === "all" ? (
                <Check className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
              ) : null}
            </button>
          ) : null}

          <div className="max-h-64 overflow-y-auto border-t border-border">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                {search ? `No items matching "${search}"` : "No tradeable items"}
              </div>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect(item.id)
                    setIsOpen(false)
                    setSearch("")
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors",
                    selectedItemId === item.id
                      ? "bg-primary/10"
                      : "hover:bg-secondary",
                  )}
                >
                  <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded bg-secondary">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.title}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {item.matchCount}{" "}
                      {item.matchCount === 1 ? "match" : "matches"}
                      {item.perfectCount > 0
                        ? ` · ${item.perfectCount} perfect`
                        : ""}
                    </span>
                  </div>
                  {selectedItemId === item.id ? (
                    <Check className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                  ) : null}
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
