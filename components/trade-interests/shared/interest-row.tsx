"use client"

/**
 * Hybrid Interest Row.
 *
 * Two visual states:
 *   - Collapsed: a compact row showing the interest name + summary chips.
 *   - Expanded: the row stays as a header but reveals a card body below
 *     with detail content (passed in as `children`).
 *
 * Used by both the create-listing trade section and the /trade hub so the
 * visual language is shared. The component is purely presentational —
 * mounting/unmounting the editor body is the parent's job.
 */

import * as React from "react"
import { ChevronDown, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface InterestRowProps {
  title: string
  /** Compact summary shown collapsed. Already-formatted string OR chips array. */
  summary?: string | string[]
  /** Optional reach/scope label (e.g. "Global", "3 listings"). */
  reachLabel?: string
  expanded?: boolean
  onToggleExpand?: () => void
  onEdit?: () => void
  onDelete?: () => void
  /** Highlight the row (e.g. "you match"). Adds a primary border. */
  highlighted?: boolean
  /** Body shown when expanded — usually a detail view or edit form. */
  children?: React.ReactNode
  /** Leading icon — guitar emoji, category icon, etc. */
  leadingIcon?: React.ReactNode
  className?: string
}

export function InterestRow({
  title,
  summary,
  reachLabel,
  expanded = false,
  onToggleExpand,
  onEdit,
  onDelete,
  highlighted = false,
  children,
  leadingIcon,
  className,
}: InterestRowProps) {
  const summaryChips = Array.isArray(summary)
    ? summary.filter(Boolean)
    : summary
      ? [summary]
      : []

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-card transition-colors",
        highlighted ? "border-primary/40 bg-primary/[0.04]" : "border-border",
        className,
      )}
    >
      {/* Collapsed header — always visible */}
      <button
        type="button"
        onClick={onToggleExpand}
        className={cn(
          "flex w-full items-start gap-3 px-3.5 py-3 text-left transition-colors",
          "hover:bg-secondary/30",
          expanded && "bg-secondary/20",
        )}
      >
        {leadingIcon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/40 text-base">
            {leadingIcon}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-foreground">
              {title}
            </p>
            {reachLabel && (
              <span className="shrink-0 rounded-full border border-border/60 bg-background/40 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {reachLabel}
              </span>
            )}
          </div>

          {summaryChips.length > 0 && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {summaryChips.join(" · ")}
            </p>
          )}
        </div>

        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 self-center text-muted-foreground transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>

      {/* Action row — only when collapsed and edit/delete handlers are wired */}
      {!expanded && (onEdit || onDelete) && (
        <div className="flex items-center gap-1 border-t border-border/40 px-3 py-1.5">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Edit interest"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="ml-auto inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
              aria-label="Delete interest"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          )}
        </div>
      )}

      {/* Expanded body — card-style content slot */}
      {expanded && children && (
        <div className="border-t border-border/40 bg-background/30 px-3.5 py-3.5">
          {children}
        </div>
      )}
    </div>
  )
}
