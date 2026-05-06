"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, SlidersHorizontal, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { PriceHistogramSlider } from "@/components/shared/price-histogram-slider"
import { useIsNavCollapseRequested } from "@/hooks/use-nav-collapse-request"
import {
  marketBrands,
  marketCategories,
  marketConditions,
} from "@/lib/market-data"

export interface MarketFilterState {
  category: string | null
  subcategory: string | null
  brands: string[]
  conditions: string[]
  minPrice: number
  maxPrice: number
  forTrade: boolean
}

export const initialMarketFilters: MarketFilterState = {
  category: null,
  subcategory: null,
  brands: [],
  conditions: [],
  minPrice: 0,
  maxPrice: 5000,
  forTrade: false,
}

interface MarketFilterSidebarProps {
  isOpen: boolean
  onClose: () => void
  filters: MarketFilterState
  onUpdateFilters: (updates: Partial<MarketFilterState>) => void
  onToggleArrayFilter: (key: "brands" | "conditions", value: string) => void
  onClearAll: () => void
  activeFilterCount: number
}

export function MarketFilterSidebar({
  isOpen,
  onClose,
  filters,
  onUpdateFilters,
  onToggleArrayFilter,
  onClearAll,
  activeFilterCount,
}: MarketFilterSidebarProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    category: true,
    brand: true,
    condition: true,
    price: true,
    type: true,
  })

  const navCollapsed = useIsNavCollapseRequested()

  const toggleSection = (section: string) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const selectedCategory = marketCategories.find(
    (c) => c.id === filters.category,
  )

  return (
    <>
      {isOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={cn(
          "fixed top-0 z-50 flex h-screen w-[280px] flex-col overflow-hidden border-r border-border bg-background will-change-transform motion-reduce:transition-none",
          "left-0",
          navCollapsed ? "lg:left-[72px]" : "lg:left-[220px]",
          "transition-[transform,opacity,left] duration-300 ease-out",
          isOpen
            ? "translate-x-0 opacity-100"
            : "-translate-x-full opacity-0 pointer-events-none",
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Filters</span>
            {activeFilterCount > 0 ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                {activeFilterCount}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            aria-label="Close filters"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-border px-4 py-3">
          <button
            type="button"
            onClick={onClearAll}
            disabled={activeFilterCount === 0}
            className="w-full rounded-lg bg-card py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            Clear all filters
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <FilterSection
            label="Category"
            expanded={expanded.category}
            onToggle={() => toggleSection("category")}
          >
            <button
              type="button"
              onClick={() =>
                onUpdateFilters({ category: null, subcategory: null })
              }
              className={cn(
                "-mx-2 block w-full rounded-sm px-2 py-1 text-left text-sm font-semibold transition-colors",
                !filters.category
                  ? "font-bold text-primary"
                  : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground",
              )}
            >
              All categories
            </button>
            {marketCategories.map((cat) => (
              <div key={cat.id}>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateFilters({
                      category: filters.category === cat.id ? null : cat.id,
                      subcategory: null,
                    })
                  }
                  className={cn(
                    "group flex w-full items-center justify-between py-1 text-sm font-semibold transition-colors",
                    filters.category === cat.id
                      ? "font-bold text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "-ml-2 mr-2 flex-1 rounded-sm px-2 text-left transition-colors",
                      filters.category === cat.id
                        ? ""
                        : "group-hover:bg-foreground/[0.04]",
                    )}
                  >
                    {cat.label}
                  </span>
                  <span
                    className={cn(
                      "text-xs",
                      filters.category === cat.id
                        ? "font-bold text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    {cat.count.toLocaleString('en-US')}
                  </span>
                </button>
                {filters.category === cat.id ? (
                  <div className="ml-3 border-l border-border/60 pl-3">
                    {cat.subcategories.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() =>
                          onUpdateFilters({
                            subcategory:
                              filters.subcategory === sub.id ? null : sub.id,
                          })
                        }
                        className={cn(
                          "group flex w-full items-center justify-between py-0.5 text-sm transition-colors",
                          filters.subcategory === sub.id
                            ? "font-bold text-primary"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <span
                          className={cn(
                            "-ml-2 mr-2 flex-1 rounded-sm px-2 text-left transition-colors",
                            filters.subcategory === sub.id
                              ? ""
                              : "group-hover:bg-foreground/[0.04]",
                          )}
                        >
                          {sub.label}
                        </span>
                        <span
                          className={cn(
                            "text-xs",
                            filters.subcategory === sub.id
                              ? "font-bold text-primary"
                              : "text-muted-foreground",
                          )}
                        >
                          {sub.count}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </FilterSection>

          {selectedCategory || filters.brands.length > 0 ? (
            <FilterSection
              label="Brands"
              expanded={expanded.brand}
              onToggle={() => toggleSection("brand")}
            >
              {marketBrands.map((brand) => (
                <label
                  key={brand.value}
                  className="group flex cursor-pointer items-center gap-2 py-[3px]"
                >
                  <Checkbox
                    checked={filters.brands.includes(brand.value)}
                    onCheckedChange={() =>
                      onToggleArrayFilter("brands", brand.value)
                    }
                    className="bg-transparent transition-colors group-hover:border-foreground/60 dark:bg-transparent data-[state=checked]:bg-transparent data-[state=checked]:text-primary data-[state=checked]:border-primary dark:data-[state=checked]:bg-transparent"
                  />
                  <span className="flex-1 text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                    {brand.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {brand.count}
                  </span>
                </label>
              ))}
            </FilterSection>
          ) : null}

          <FilterSection
            label="Condition"
            expanded={expanded.condition}
            onToggle={() => toggleSection("condition")}
          >
            {marketConditions.map((c) => (
              <label
                key={c.value}
                className="group flex cursor-pointer items-center gap-2 py-[3px]"
              >
                <Checkbox
                  checked={filters.conditions.includes(c.value)}
                  onCheckedChange={() =>
                    onToggleArrayFilter("conditions", c.value)
                  }
                  className="bg-transparent transition-colors group-hover:border-foreground/60 dark:bg-transparent data-[state=checked]:bg-transparent data-[state=checked]:text-primary data-[state=checked]:border-primary dark:data-[state=checked]:bg-transparent"
                />
                <span className="flex-1 text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                  {c.label}
                </span>
                <span className="text-xs text-muted-foreground">{c.count}</span>
              </label>
            ))}
          </FilterSection>

          <FilterSection
            label="Price"
            expanded={expanded.price}
            onToggle={() => toggleSection("price")}
          >
            <div className="pt-1">
              <PriceHistogramSlider
                min={0}
                max={5000}
                step={50}
                value={[filters.minPrice, filters.maxPrice]}
                onChange={([min, max]) =>
                  onUpdateFilters({ minPrice: min, maxPrice: max })
                }
              />
            </div>
          </FilterSection>

          <FilterSection
            label="Show only"
            expanded={expanded.type}
            onToggle={() => toggleSection("type")}
          >
            <label className="group flex cursor-pointer items-center gap-2 py-[3px]">
              <Checkbox
                checked={filters.forTrade}
                onCheckedChange={(checked) =>
                  onUpdateFilters({ forTrade: checked === true })
                }
                className="bg-transparent transition-colors group-hover:border-foreground/60 dark:bg-transparent data-[state=checked]:bg-transparent data-[state=checked]:text-primary data-[state=checked]:border-primary dark:data-[state=checked]:bg-transparent"
              />
              <span className="flex-1 text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                Open to trade
              </span>
            </label>
          </FilterSection>
        </div>
      </aside>
    </>
  )
}

function FilterSection({
  label,
  expanded,
  onToggle,
  children,
}: {
  label: string
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-card/50"
      >
        <span>{label}</span>
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {expanded ? <div className="px-4 pb-3">{children}</div> : null}
    </div>
  )
}
