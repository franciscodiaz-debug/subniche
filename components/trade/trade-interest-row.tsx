"use client"

import { useState, type ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SavedTradeInterest } from "@/lib/saved-trade-interests-context"

// ── Shared data type ──────────────────────────────────────────────────────────

export interface TradeInterestChip {
  label: string
  value: string
}

// ── Chip normaliser for SavedTradeInterest ────────────────────────────────────
// Converts the structured fields of a SavedTradeInterest into the flat
// label/value chip array used by the shared row component.

export function savedInterestToChips(interest: SavedTradeInterest): TradeInterestChip[] {
  const chips: TradeInterestChip[] = []
  const push = (label: string, value: string | undefined) => {
    const v = value?.trim()
    if (v) chips.push({ label, value: v })
  }

  if (interest.mode === "simple") {
    const text = interest.simpleText.trim()
    if (text) chips.push({ label: "Description", value: text.length > 80 ? text.slice(0, 80).trimEnd() + "…" : text })
    return chips
  }

  push("Category", interest.category)
  push("Subcategory", interest.subcategory)
  push("Brand", interest.brand)
  push("Model", interest.model)
  push("Condition", interest.condition)

  const min = interest.valueMin?.trim()
  const max = interest.valueMax?.trim()
  if (min || max) {
    const fmt = (v: string) => `$${Number(v).toLocaleString()}`
    const value =
      min && max ? `${fmt(min)} – ${fmt(max)}`
      : min ? `From ${fmt(min)}`
      : `Up to ${fmt(max!)}`
    chips.push({ label: "Budget", value })
  }

  if (interest.specs) {
    for (const [k, v] of Object.entries(interest.specs)) {
      if (typeof v === "string" && v.trim()) chips.push({ label: k, value: v })
    }
  }

  return chips
}

// ── Shared one-line description from SavedTradeInterest ───────────────────────

export function savedInterestDescription(interest: SavedTradeInterest): string {
  if (interest.mode === "simple" && interest.simpleText.trim()) {
    const clean = interest.simpleText.trim().replace(/\s+/g, " ")
    return clean.length > 80 ? clean.slice(0, 80).trimEnd() + "…" : clean
  }
  const brandModel = [interest.brand, interest.model].filter(Boolean).join(" ")
  if (brandModel) return brandModel
  return [interest.category, interest.subcategory].filter(Boolean).join(" · ") || ""
}

// ── Shared row component ──────────────────────────────────────────────────────

interface TradeInterestRowProps {
  name: string
  description?: string
  chips: TradeInterestChip[]
  /** Optional count shown in parens next to the name, e.g. number of matches. */
  count?: number
  /** Management-screen action buttons (pencil, delete, etc.) rendered before
   *  the expand chevron. Omit for read-only profile view. */
  actions?: ReactNode
  /** Inline editor (e.g. SavedInterestEditor) rendered below the row when
   *  the management screen opens the edit form. */
  inlineEditor?: ReactNode
  /** When true, another row is expanded — dim this one for focus. */
  dimmed?: boolean
  /** Controlled expand — pass when the parent manages state (management screen). */
  expanded?: boolean
  /** Required when `expanded` is provided. */
  onToggle?: () => void
  /** No-criteria fallback text for the management screen's empty state. */
  emptyChipsLabel?: string
  /** Extra classes applied to the outer wrapper (e.g. bg-secondary/30 when editing). */
  className?: string
}

export function TradeInterestRow({
  name,
  description,
  chips,
  count,
  actions,
  inlineEditor,
  dimmed,
  expanded: controlledExpanded,
  onToggle,
  emptyChipsLabel = "No criteria saved yet.",
  className,
}: TradeInterestRowProps) {
  const [localExpanded, setLocalExpanded] = useState(false)
  const isControlled = controlledExpanded !== undefined
  const expanded = isControlled ? controlledExpanded : localExpanded
  const toggle = isControlled ? onToggle! : () => setLocalExpanded((v) => !v)

  return (
    <div
      className={cn(
        "group/row overflow-hidden rounded-xl border border-border bg-card transition-all duration-200",
        dimmed && "opacity-30 hover:opacity-100",
        className,
      )}
    >
      {/* Compact row */}
      <div className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-secondary/20">

        <button
          type="button"
          onClick={toggle}
          aria-expanded={expanded}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                "truncate text-sm font-semibold transition-colors",
                !name
                  ? "italic text-muted-foreground"
                  : "text-foreground group-hover/row:text-primary",
                expanded && name && "text-primary",
              )}
            >
              {name || "Untitled interest"}
            </span>
            {count != null && (
              <span
                className="flex-shrink-0 text-xs tabular-nums text-muted-foreground"
                aria-label={`${count} listing${count === 1 ? "" : "s"}`}
              >
                ({count})
              </span>
            )}
          </div>
          {description ? (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{description}</p>
          ) : null}
        </button>

        {/* Right-side controls: optional management actions + always-visible chevron */}
        <div className="flex shrink-0 items-center gap-1.5">
          {actions}
          <button
            type="button"
            onClick={toggle}
            aria-label={expanded ? "Hide details" : "Show details"}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}
            />
          </button>
        </div>
      </div>

      {/* Expanded criteria chips */}
      {expanded ? (
        <div className="px-3 pb-3">
          {chips.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {chips.map((chip, i) => (
                <span
                  key={`${chip.label}-${i}`}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-2.5 py-1 text-xs"
                >
                  <span className="text-muted-foreground">{chip.label}</span>
                  <span className="font-medium text-foreground">{chip.value}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs italic text-muted-foreground">{emptyChipsLabel}</p>
          )}
        </div>
      ) : null}

      {/* Inline editor slot */}
      {inlineEditor ?? null}
    </div>
  )
}
