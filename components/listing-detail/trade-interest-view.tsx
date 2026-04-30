"use client"

/**
 * Read-only render of the lister's trade interests.
 *
 * Accepts either a free-text "simple" string or a list of structured items.
 * Mirrors the chip-list visual language from the Create Listing authoring
 * UI so the published page feels continuous with the form the owner just
 * submitted. Match-context (e.g. "you already match item 2") is emitted
 * by the parent via `highlightedItemIds` so this file stays data-agnostic.
 */

import { Repeat2 } from "lucide-react"

import type { MockTradeInterest } from "@/lib/mock-listing-detail"
import { cn } from "@/lib/utils"
import { SectionHeading } from "./info-sections"

interface TradeInterestViewProps {
  data: MockTradeInterest | null
  /** Item ids the current viewer already has a match on (renders gold ring). */
  highlightedItemIds?: string[]
}

export function TradeInterestView({
  data,
  highlightedItemIds = [],
}: TradeInterestViewProps) {
  if (!data) return null

  return (
    <section aria-label="Trade interests">
      <SectionHeading icon={Repeat2} title="Open to trade for" />

      <div className="rounded-card border border-border bg-card p-4 md:p-5">
        {data.mode === "simple" ? (
          <p className="text-sm leading-relaxed text-foreground/90 text-pretty">
            {data.text}
          </p>
        ) : (
          <ul className="space-y-3">
            {(data.items ?? []).map((item) => {
              const highlighted = highlightedItemIds.includes(item.id)
              return (
                <li
                  key={item.id}
                  className={cn(
                    "rounded-md border bg-background/40 p-3 transition-colors",
                    highlighted
                      ? "border-primary/60 bg-primary/5"
                      : "border-border",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {item.label}
                    </span>
                    {highlighted ? (
                      <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                        You match
                      </span>
                    ) : null}
                  </div>
                  {item.notes ? (
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {item.notes}
                    </p>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
