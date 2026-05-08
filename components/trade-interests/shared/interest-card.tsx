"use client"

/**
 * InterestCard — visual card for a saved trade interest.
 *
 * Shows everything inline (no expand-to-see-pills). Replaces the older
 * row-based InterestRow that required clicking to peek at criteria.
 *
 * Title composition:
 *   1. Brand + Model + Year/Era (from specs) when available
 *   2. Fallback: Category + Subcategory
 *   3. Last fallback: the user-given `name`
 */

import * as React from "react"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SavedTradeInterest } from "@/lib/saved-trade-interests-context"

interface InterestCardProps {
  interest: SavedTradeInterest
  /** Reach label rendered as a badge in the card header. */
  reachLabel: string
  /** Tone of the reach badge. */
  reachTone?: "global" | "individual" | "template"
  onEdit: () => void
  onRequestRemove: () => void
  /** Inline confirm-remove flow: when true, the actions row swaps to confirm. */
  confirming?: boolean
  onCancelRemove?: () => void
  onConfirmRemove?: () => void
  className?: string
}

export function InterestCard({
  interest,
  reachLabel,
  reachTone = "individual",
  onEdit,
  onRequestRemove,
  confirming,
  onCancelRemove,
  onConfirmRemove,
  className,
}: InterestCardProps) {
  const title = composeTitle(interest)
  const breadcrumb = [interest.category, interest.subcategory]
    .filter(Boolean)
    .join(" · ")

  // Spec chips: every non-empty spec value as a compact pill.
  const specChips: string[] = []
  if (interest.condition && interest.condition !== "Any") {
    specChips.push(interest.condition)
  }
  if (interest.specs) {
    for (const [, v] of Object.entries(interest.specs)) {
      if (typeof v === "string" && v.trim() && v !== "Any") {
        specChips.push(v)
      }
    }
  }

  const valueRange = formatValueRange(interest.valueMin, interest.valueMax)

  // Simple-mode interest with no structured fields filled — show the prose
  // so the card never looks empty.
  const simplePreview =
    interest.mode === "simple" && interest.simpleText.trim()
      ? interest.simpleText.trim()
      : null

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30",
        className,
      )}
    >
      {/* Header — title + reach badge */}
      <div className="mb-1 flex items-start justify-between gap-2">
        <h3 className="min-w-0 truncate text-sm font-semibold text-foreground">
          {title}
        </h3>
        <ReachBadge label={reachLabel} tone={reachTone} />
      </div>

      {/* Category breadcrumb */}
      {breadcrumb && (
        <p className="mb-3 text-xs text-muted-foreground">{breadcrumb}</p>
      )}

      {/* Simple-mode prose (when no structured fields) */}
      {simplePreview && !specChips.length && !valueRange && (
        <p className="mb-3 text-sm leading-relaxed text-foreground/80">
          {simplePreview}
        </p>
      )}

      {/* Specs chips */}
      {specChips.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {specChips.map((chip, i) => (
            <span
              key={`${chip}-${i}`}
              className="inline-flex items-center rounded-md bg-secondary/40 px-2 py-0.5 text-xs font-medium text-foreground/80"
            >
              {chip}
            </span>
          ))}
        </div>
      )}

      {/* Value range */}
      {valueRange && (
        <p className="mb-3 text-sm font-semibold tabular-nums text-primary">
          {valueRange}
        </p>
      )}

      {/* Notes */}
      {interest.notes?.trim() && (
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
          {interest.notes}
        </p>
      )}

      {/* Actions */}
      <div className="mt-auto flex items-center gap-2 border-t border-border/40 pt-3">
        {confirming ? (
          <>
            <span className="flex-1 text-xs text-muted-foreground">
              Remove this interest?
            </span>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onConfirmRemove}
              className="h-7 px-2.5 text-xs"
            >
              Remove
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancelRemove}
              className="h-7 px-2 text-xs"
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-7 gap-1 px-2 text-xs"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRequestRemove}
              className="ml-auto h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
              Remove
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

function composeTitle(interest: SavedTradeInterest): string {
  // Try Brand + Model + Year/Era from specs
  const brandModel = [interest.brand, interest.model].filter(Boolean).join(" ")
  const year =
    interest.specs?.year ||
    interest.specs?.Year ||
    interest.specs?.era ||
    interest.specs?.Era ||
    ""
  const composed = [brandModel, year].filter(Boolean).join(" ")
  if (composed) return composed

  // Fallback: Category / Subcategory
  const catSub = [interest.category, interest.subcategory]
    .filter(Boolean)
    .join(" / ")
  if (catSub) return catSub

  // Last fallback: user-given name
  return interest.name || "Untitled interest"
}

function formatValueRange(min: string, max: string): string | null {
  const m = min.trim()
  const M = max.trim()
  const fmt = (v: string) => `$${Number(v).toLocaleString("en-US")}`
  if (m && M) return `${fmt(m)} – ${fmt(M)}`
  if (m) return `From ${fmt(m)}`
  if (M) return `Up to ${fmt(M)}`
  return null
}

function ReachBadge({
  label,
  tone,
}: {
  label: string
  tone: "global" | "individual" | "template"
}) {
  const toneClass = {
    global: "border-primary/30 bg-primary/10 text-primary",
    individual: "border-info/30 bg-info/10 text-info",
    template: "border-dashed border-border bg-transparent text-muted-foreground",
  }[tone]

  return (
    <span
      className={cn(
        "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        toneClass,
      )}
    >
      {label}
    </span>
  )
}
