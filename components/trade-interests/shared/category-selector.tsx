"use client"

/**
 * Shared CategorySelector — pill-based category + subcategory chooser.
 *
 * Visual pattern matches the create-listing flow: category pills, then once
 * a category is picked the chevron + subcategory pills appear.
 *
 * Single source of truth: TRADE_CATEGORIES + SUBCATEGORIES_BY_CATEGORY from
 * lib/trade-specs.ts. Used by both /create-listing and the trade-interest
 * editor sidebar so the taxonomy never drifts.
 */

import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  SUBCATEGORIES_BY_CATEGORY,
  TRADE_CATEGORIES,
  type TradeCategory,
} from "@/lib/trade-specs"

interface CategorySelectorProps {
  category: string
  subcategory: string
  onCategoryChange: (c: string) => void
  onSubcategoryChange: (s: string) => void
  /** Hide the heading label (caller renders its own) */
  showLabel?: boolean
  className?: string
}

export function CategorySelector({
  category,
  subcategory,
  onCategoryChange,
  onSubcategoryChange,
  showLabel = true,
  className,
}: CategorySelectorProps) {
  const subcategories = category
    ? SUBCATEGORIES_BY_CATEGORY[category as TradeCategory] ?? []
    : []

  return (
    <div className={cn("space-y-2", className)}>
      {showLabel && (
        <label className="text-xs font-medium text-foreground">
          Category
        </label>
      )}

      <div className="rounded-lg border border-border bg-card p-3">
        {!category ? (
          // No category selected → show all categories as pills
          <div className="flex flex-wrap gap-2">
            {TRADE_CATEGORIES.map((cat) => (
              <CategoryPill
                key={cat}
                label={cat}
                active={false}
                onClick={() => onCategoryChange(cat)}
              />
            ))}
          </div>
        ) : (
          // Category selected → show selected pill + subcategory pills
          <div className="flex flex-wrap items-center gap-2">
            <CategoryPill
              label={category}
              active
              onClick={() => {
                onCategoryChange("")
                onSubcategoryChange("")
              }}
            />
            {subcategories.length > 0 && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                {subcategories.map((sub) => {
                  const isActive = subcategory === sub
                  return (
                    <SubcategoryPill
                      key={sub}
                      label={sub}
                      active={isActive}
                      onClick={() =>
                        onSubcategoryChange(isActive ? "" : sub)
                      }
                    />
                  )
                })}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground hover:border-primary/40",
      )}
    >
      {label}
    </button>
  )
}

function SubcategoryPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {label}
    </button>
  )
}
