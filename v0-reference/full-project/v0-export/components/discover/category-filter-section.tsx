"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import type { FilterDefinition } from "@/lib/filter-config"
import { FilterChip } from "./filter-chip"
import { PriceRangeSlider } from "./price-range-slider"

interface CategoryFilterSectionProps {
  title: string
  filters: FilterDefinition[]
  activeFilters: Record<string, string[] | number | null>
  onToggleChip: (filterId: string, value: string) => void
  onRangeChange: (filterId: string, min: number | null, max: number | null) => void
  defaultExpanded?: boolean
}

export function CategoryFilterSection({
  title,
  filters,
  activeFilters,
  onToggleChip,
  onRangeChange,
  defaultExpanded = false,
}: CategoryFilterSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  if (filters.length === 0) return null

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full py-3 text-left text-sm font-medium text-foreground hover:text-primary transition-colors"
      >
        <span>{title}</span>
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="pb-4 space-y-4">
          {filters.map((filter) => (
            <div key={filter.id} className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">{filter.label}</label>

              {filter.type === "chips" && filter.options && (
                <div className="flex flex-wrap gap-2">
                  {filter.options.map((option) => {
                    const currentValues = (activeFilters[filter.id] as string[]) || []
                    const isSelected = currentValues.includes(option.value)
                    return (
                      <FilterChip
                        key={option.value}
                        label={option.label}
                        selected={isSelected}
                        onClick={() => onToggleChip(filter.id, option.value)}
                        count={option.count}
                      />
                    )
                  })}
                </div>
              )}

              {filter.type === "range" && (
                <PriceRangeSlider
                  min={filter.min ?? 0}
                  max={filter.max ?? 100}
                  step={filter.step ?? 1}
                  minValue={activeFilters[`min${capitalize(filter.id)}`] as number | null}
                  maxValue={activeFilters[`max${capitalize(filter.id)}`] as number | null}
                  onChange={(min, max) => onRangeChange(filter.id, min, max)}
                  formatValue={(v) => (filter.unit ? `${v}${filter.unit}` : String(v))}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
