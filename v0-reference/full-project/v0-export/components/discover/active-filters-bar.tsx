"use client"

import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FilterState } from "@/hooks/use-discover-filters"
import { categoryConfig } from "@/lib/filter-config"

interface ActiveFiltersBarProps {
  filters: FilterState
  onRemoveFilter: (key: string, value?: string) => void
  onClearAll: () => void
}

export function ActiveFiltersBar({ filters, onRemoveFilter, onClearAll }: ActiveFiltersBarProps) {
  const activeChips: { key: string; label: string; value?: string }[] = []

  // Category & subcategory
  if (filters.category) {
    const cat = categoryConfig.find((c) => c.id === filters.category)
    activeChips.push({
      key: "category",
      label: cat?.label || filters.category,
    })

    if (filters.subcategory) {
      const subcat = cat?.subcategories.find((s) => s.id === filters.subcategory)
      activeChips.push({
        key: "subcategory",
        label: subcat?.label || filters.subcategory,
      })
    }
  }

  // Brands
  filters.brands.forEach((brand) => {
    activeChips.push({ key: "brands", label: brand, value: brand })
  })

  // Plastics
  filters.plastics.forEach((plastic) => {
    activeChips.push({ key: "plastics", label: plastic, value: plastic })
  })

  // Conditions
  filters.conditions.forEach((condition) => {
    activeChips.push({ key: "conditions", label: condition, value: condition })
  })

  // Price range
  if (filters.minPrice !== null || filters.maxPrice !== null) {
    const min = filters.minPrice ?? 0
    const max = filters.maxPrice ?? "∞"
    activeChips.push({ key: "price", label: `$${min} - $${max}` })
  }

  // For trade
  if (filters.forTrade === true) {
    activeChips.push({ key: "forTrade", label: "Open to Trade" })
  }

  if (activeChips.length === 0) return null

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground">Active:</span>
      {activeChips.map((chip, i) => (
        <button
          key={`${chip.key}-${chip.value || i}`}
          onClick={() => onRemoveFilter(chip.key, chip.value)}
          className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs",
            "bg-primary/20 text-foreground border border-primary/30",
            "hover:bg-primary/30 transition-colors",
          )}
        >
          <span>{chip.label}</span>
          <X className="h-3 w-3" />
        </button>
      ))}
      {activeChips.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  )
}
