"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Check, ChevronDown, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import type { TradeableItemSummary } from "@/lib/market-data"
import { useSavedTradeInterests } from "@/lib/saved-trade-interests-context"

interface TradeItemSelectorProps {
  items: TradeableItemSummary[]
  selectedItemId: string
  onSelect: (id: string) => void
  totalMatches: number
  /** Trigger styling.
   *   - "default" (Trade grid context): card-shaped button with border/bg-card,
   *     reads as a discrete filter widget alongside other grid controls.
   *   - "subtle" (Trade Interests header): no border/no bg, larger text,
   *     reads as emphasized inline copy that clusters with the page title.
   *     Use when the selector is acting as the page's contextual subject
   *     ("Trade Interests / For [All items ▾]"), not as a sidebar filter. */
  variant?: "default" | "subtle"
  /** Prefix shown before the selected value in the trigger ("Matches for", "Applied to", etc.). */
  triggerPrefix?: string
}

export function TradeItemSelector({
  items,
  selectedItemId,
  onSelect,
  totalMatches,
  variant = "default",
  triggerPrefix = "Matches for",
}: TradeItemSelectorProps) {
  // Interests drive matches, so make them the primary badge per item. The
  // selector is the closest surface to the user's mental model of "what am I
  // looking for on behalf of this item" — showing "3 interests" there is more
  // actionable than another raw match count.
  const { getInterestCountFor, interests } = useSavedTradeInterests()
  const totalInterests = interests.length
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
          "flex items-center gap-1.5 text-left transition-colors",
          variant === "default" && [
            "gap-2 rounded-lg border border-border bg-card px-3 py-1.5",
            "hover:border-primary/50 hover:bg-secondary",
            isOpen && "border-primary/50 bg-secondary",
          ],
          variant === "subtle" && [
            "-mx-1.5 rounded-md px-1.5 py-0.5",
            "hover:bg-secondary/60",
            isOpen && "bg-secondary/60",
          ],
        )}
      >
        <span
          className={cn(
            "font-medium text-foreground",
            variant === "default" ? "text-sm" : "text-base",
          )}
        >
          <span className="text-muted-foreground">{triggerPrefix}</span>{" "}
          {selected ? selected.title : "all items"}
        </span>
        <ChevronDown
          className={cn(
            "text-muted-foreground transition-transform",
            variant === "default" ? "h-3.5 w-3.5" : "h-4 w-4",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {/* The gear button that used to sit here has moved to the "For" row
          in TradeContent — it now opens the full Trade Interests management
          surface (not a per-item preferences popover). The selector is
          strictly a filter control again. */}

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
                selectedItemId === "all" ? "bg-primary/10" : "hover:bg-secondary",
              )}
            >
              <span className="flex-1 text-sm font-medium text-foreground">
                All items
              </span>
              <span className="text-xs text-muted-foreground">
                {totalInterests}{" "}
                {totalInterests === 1 ? "interest" : "interests"}
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
                    {/* "Fender Strat · 3 interests" per the spec. We keep
                        match/perfect counts in a secondary dot-separated
                        clause so the dropdown still surfaces momentum without
                        burying it. */}
                    <span className="text-xs text-muted-foreground">
                      {(() => {
                        const interestCount = getInterestCountFor(item.id)
                        return `${interestCount} ${
                          interestCount === 1 ? "interest" : "interests"
                        }`
                      })()}
                      {item.matchCount > 0
                        ? ` · ${item.matchCount} ${
                            item.matchCount === 1 ? "match" : "matches"
                          }`
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
