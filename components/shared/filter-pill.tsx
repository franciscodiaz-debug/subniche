"use client"

/**
 * FilterPill — shared filter/toggle pill used across the app.
 *
 * Used by:
 *   - /market (For Sale): radio-style sort pills (All / Trending / etc.)
 *   - /trade-interests (hub): multi-toggle (Global / Individual)
 *
 * Single source of truth for the rounded-full filter visual. If we need a new
 * variant for a third surface, add it here, not inline in the consumer.
 */

import * as React from "react"
import { cn } from "@/lib/utils"

type FilterPillTone = "primary" | "info"

interface FilterPillProps {
  active: boolean
  onClick: () => void
  /** Lucide icon component, optional. */
  icon?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  /** Optional trailing slot — used for counts / badges. */
  trailing?: React.ReactNode
  /** Active color tone. Defaults to primary. */
  tone?: FilterPillTone
  className?: string
  ariaPressed?: boolean
}

const TONE_ACTIVE: Record<FilterPillTone, string> = {
  primary: "border-primary bg-primary/10 text-primary",
  info: "border-info bg-info/10 text-info",
}

const TONE_INACTIVE_HOVER: Record<FilterPillTone, string> = {
  primary: "hover:border-primary/40",
  info: "hover:border-info/40",
}

export function FilterPill({
  active,
  onClick,
  icon: Icon,
  children,
  trailing,
  tone = "primary",
  className,
  ariaPressed,
}: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ariaPressed ?? active}
      className={cn(
        "inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? TONE_ACTIVE[tone]
          : cn(
              "border-border bg-card text-muted-foreground hover:text-foreground",
              TONE_INACTIVE_HOVER[tone],
            ),
        className,
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
      {trailing}
    </button>
  )
}
