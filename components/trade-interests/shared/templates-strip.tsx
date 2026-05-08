"use client"

/**
 * Quick-start templates for new users.
 *
 * Surfaces pre-shaped trade interests so users with no existing interests
 * have a one-click on-ramp instead of a blank form. Each template is a
 * partial `SavedTradeInterest` shape — the parent decides whether to
 * persist it (Trade Hub) or use it as a starting point in an editor.
 */

import * as React from "react"
import { Guitar, Plus, Speaker, Sparkles, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SavedTradeInterest } from "@/lib/saved-trade-interests-context"

export type InterestTemplate = Partial<
  Omit<SavedTradeInterest, "id" | "appliedTo">
> & {
  /** Visual icon (lucide). */
  icon: React.ComponentType<{ className?: string }>
  /** Short tagline shown under the title. */
  tagline: string
}

export const DEFAULT_TEMPLATES: InterestTemplate[] = [
  {
    name: "Vintage electric guitars",
    tagline: "Pre-1985, original finish preferred",
    icon: Guitar,
    mode: "advanced",
    category: "Guitars",
    subcategory: "Electric",
    condition: "Used — Excellent",
    valueMin: "2000",
    valueMax: "8000",
    notes: "Original pickups, clean fretboard.",
    simpleText: "",
    brand: "",
    model: "",
    specs: {},
  },
  {
    name: "Tube amplifiers",
    tagline: "Combos or heads, recently serviced",
    icon: Speaker,
    mode: "advanced",
    category: "Audio Equipment",
    subcategory: "Amps",
    condition: "Used — Excellent",
    valueMin: "500",
    valueMax: "3000",
    notes: "All-tube preferred, no SS preamp.",
    simpleText: "",
    brand: "",
    model: "",
    specs: {},
  },
  {
    name: "Boutique pedals",
    tagline: "Hand-built, low-volume runs",
    icon: Sparkles,
    mode: "advanced",
    category: "Audio Equipment",
    subcategory: "Pedals",
    condition: "Used — Excellent",
    valueMin: "150",
    valueMax: "800",
    notes: "Original box & velcro removable.",
    simpleText: "",
    brand: "",
    model: "",
    specs: {},
  },
  {
    name: "Studio gear",
    tagline: "Mics, interfaces, monitors",
    icon: Wand2,
    mode: "advanced",
    category: "Audio Equipment",
    subcategory: "Studio",
    condition: "Used — Excellent",
    valueMin: "300",
    valueMax: "2500",
    notes: "Working condition, no DOA.",
    simpleText: "",
    brand: "",
    model: "",
    specs: {},
  },
]

interface TemplatesStripProps {
  templates?: InterestTemplate[]
  onPick: (template: InterestTemplate) => void
  className?: string
}

export function TemplatesStrip({
  templates = DEFAULT_TEMPLATES,
  onPick,
  className,
}: TemplatesStripProps) {
  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Quick-start templates
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {templates.map((tpl) => {
          const Icon = tpl.icon
          return (
            <button
              key={tpl.name}
              type="button"
              onClick={() => onPick(tpl)}
              className={cn(
                "group flex w-full items-start gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all",
                "hover:border-primary/40 hover:bg-card/80 hover:shadow-sm",
              )}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {tpl.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {tpl.tagline}
                </p>
              </div>
              <Plus className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
