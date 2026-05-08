"use client"

/**
 * Picker for loading saved trade interests into a listing.
 *
 * Renders as a button that opens a popover with the user's saved interests.
 * The user picks one, the parent receives the full SavedTradeInterest record
 * and decides how to apply it (typically: copy fields into a new
 * TradeInterestItem, or add to the appliedInterestIds set).
 */

import * as React from "react"
import { Bookmark, Check, FolderOpen, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { SavedTradeInterest } from "@/lib/saved-trade-interests-context"

interface LoadSavedPickerProps {
  saved: SavedTradeInterest[]
  /** IDs already applied to this listing (shown with a check, can't re-add). */
  appliedIds?: string[]
  onPick: (interest: SavedTradeInterest) => void
  /** Custom trigger label/icon. */
  triggerLabel?: string
  triggerVariant?: "outline" | "ghost" | "default"
  triggerSize?: "sm" | "default" | "lg"
  className?: string
}

export function LoadSavedPicker({
  saved,
  appliedIds = [],
  onPick,
  triggerLabel = "Load from saved",
  triggerVariant = "outline",
  triggerSize = "sm",
  className,
}: LoadSavedPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  const filtered = React.useMemo(() => {
    if (!query.trim()) return saved
    const q = query.toLowerCase()
    return saved.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.simpleText.toLowerCase().includes(q) ||
        s.brand.toLowerCase().includes(q) ||
        s.model.toLowerCase().includes(q),
    )
  }, [saved, query])

  if (saved.length === 0) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={triggerVariant}
          size={triggerSize}
          className={cn("gap-1.5", className)}
        >
          <FolderOpen className="h-3.5 w-3.5" />
          {triggerLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="border-b border-border p-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search saved interests..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              No saved interests match.
            </p>
          ) : (
            filtered.map((interest) => {
              const applied = appliedIds.includes(interest.id)
              return (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => {
                    if (!applied) {
                      onPick(interest)
                      setOpen(false)
                    }
                  }}
                  disabled={applied}
                  className={cn(
                    "flex w-full items-start gap-2.5 px-3 py-2 text-left transition-colors",
                    applied
                      ? "cursor-not-allowed opacity-60"
                      : "hover:bg-secondary/50",
                  )}
                >
                  <Bookmark
                    className={cn(
                      "mt-0.5 h-3.5 w-3.5 shrink-0",
                      applied ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {interest.name || "Untitled interest"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {summarize(interest)}
                    </p>
                  </div>
                  {applied && (
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  )}
                </button>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function summarize(interest: SavedTradeInterest): string {
  if (interest.mode === "simple") {
    return interest.simpleText || "—"
  }
  const parts: string[] = []
  if (interest.subcategory) parts.push(interest.subcategory)
  const bm = [interest.brand, interest.model].filter(Boolean).join(" ")
  if (bm) parts.push(bm)
  if (interest.condition) parts.push(interest.condition)
  if (interest.valueMin && interest.valueMax) {
    parts.push(`$${interest.valueMin}-$${interest.valueMax}`)
  }
  return parts.join(" · ") || "—"
}
