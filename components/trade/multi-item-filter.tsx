"use client"

/**
 * Multi-select filter for the user's tradeable items.
 *
 * Used on the /trade tab to let the user narrow the matches grid by one or
 * more of their tradeable items. Empty selection = "All items".
 *
 * Renders as:
 *   - A fixed-width trigger ("All items" / "1 item" / "N items").
 *   - A popover with search + checkboxes.
 *   - Selected items are surfaced as removable chips by the parent, not here.
 */

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Check, ChevronDown, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import type { TradeableItemSummary } from "@/lib/market-data"

interface MultiItemFilterProps {
  items: TradeableItemSummary[]
  /** Selected item ids. Empty array = "All items". */
  selectedIds: string[]
  onChange: (ids: string[]) => void
  className?: string
}

export function MultiItemFilter({
  items,
  selectedIds,
  onChange,
  className,
}: MultiItemFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  const toggleItem = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  const clearAll = () => {
    onChange([])
  }

  const triggerLabel =
    selectedIds.length === 0
      ? "All items"
      : `${selectedIds.length} item${selectedIds.length === 1 ? "" : "s"}`

  const isAllSelected = selectedIds.length === 0

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          "flex h-9 w-56 items-center gap-2 rounded-lg border bg-card px-3 text-left text-sm transition-colors",
          "border-border hover:border-primary/40 hover:bg-secondary",
          isOpen && "border-primary/50 bg-secondary",
        )}
      >
        <span className="flex-1 truncate font-medium text-foreground">
          <span className="text-muted-foreground">Matches for </span>
          {triggerLabel}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-[60] mt-1 w-80 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          {items.length > 5 && (
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
          )}

          {!search && (
            <button
              type="button"
              onClick={clearAll}
              className={cn(
                "flex w-full items-center gap-2.5 border-b border-border px-3 py-2 text-left transition-colors",
                isAllSelected ? "bg-primary/10" : "hover:bg-secondary",
              )}
            >
              <span className="flex-1 text-sm font-medium text-foreground">
                All items
              </span>
              {isAllSelected && (
                <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
              )}
            </button>
          )}

          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                {search ? `No items matching "${search}"` : "No tradeable items"}
              </div>
            ) : (
              filtered.map((item) => {
                const checked = selectedIds.includes(item.id)
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors",
                      checked ? "bg-primary/[0.07]" : "hover:bg-secondary",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors",
                        checked
                          ? "border-primary bg-primary"
                          : "border-border",
                      )}
                    >
                      {checked && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-secondary">
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
                      {item.matchCount > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {item.matchCount}{" "}
                          {item.matchCount === 1 ? "match" : "matches"}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
