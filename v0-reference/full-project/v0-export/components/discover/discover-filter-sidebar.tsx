"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, SlidersHorizontal, X, Search, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { categoryConfig, getFiltersForSelection } from "@/lib/filter-config"
import type { FilterState } from "@/hooks/use-discover-filters"
import { PriceHistogramSlider } from "./price-histogram-slider"
import { TriStateCheckbox, type TriState } from "@/components/ui/tri-state-checkbox"

interface DiscoverFilterSidebarProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterState
  onUpdateFilters: (updates: Partial<FilterState>) => void
  onToggleArrayFilter: (key: keyof FilterState, value: string) => void
  onSetConditionState: (condition: string, state: TriState) => void
  onClearAll: () => void
  activeFilterCount: number
}

const getCategoryCount = (categoryId: string) => {
  const counts: Record<string, number> = {
    discs: 1247,
    accessories: 342,
    apparel: 189,
  }
  return counts[categoryId] || 0
}

const getSubcategoryCount = (categoryId: string, subcategoryId: string) => {
  const counts: Record<string, Record<string, number>> = {
    discs: {
      "distance-drivers": 423,
      "fairway-drivers": 312,
      midranges: 287,
      putters: 225,
    },
    accessories: {
      bags: 156,
      "markers-minis": 89,
      "towels-gear": 54,
      carts: 43,
    },
    apparel: {
      shirts: 98,
      hats: 67,
      footwear: 24,
    },
  }
  return counts[categoryId]?.[subcategoryId] || 0
}

export function DiscoverFilterSidebar({
  isOpen,
  onClose,
  filters,
  onUpdateFilters,
  onToggleArrayFilter,
  onSetConditionState,
  onClearAll,
  activeFilterCount,
}: DiscoverFilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    category: true,
    brand: true,
    condition: true,
    price: true,
    listingType: true,
  })
  const [showMoreBrands, setShowMoreBrands] = useState(false)
  const [showMoreConditions, setShowMoreConditions] = useState(false)
  const [keywordFilter, setKeywordFilter] = useState("")

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Get available filters based on current category/subcategory selection
  const availableFilters = getFiltersForSelection(filters.category, filters.subcategory)

  const getBrandsForCategory = () => {
    const brandFilter = availableFilters.find((f) => f.id === "brand")
    return brandFilter?.options || []
  }

  const brands = getBrandsForCategory()
  const visibleBrands = showMoreBrands ? brands : brands.slice(0, 5)

  const conditions = [
    { value: "new", label: "New", count: 523 },
    { value: "like-new", label: "Like New", count: 312 },
    { value: "used", label: "Used", count: 267 },
    { value: "well-used", label: "Well Used", count: 89 },
  ]
  const visibleConditions = showMoreConditions ? conditions : conditions.slice(0, 4)

  const getConditionState = (value: string): TriState => {
    return filters.conditionStates[value] || "neutral"
  }

  const handlePriceChange = (value: [number, number]) => {
    onUpdateFilters({ minPrice: value[0], maxPrice: value[1] })
  }

  const handleCategorySelect = (categoryId: string | null) => {
    if (categoryId === filters.category) {
      // Deselect
      onUpdateFilters({ category: null, subcategory: null })
    } else {
      onUpdateFilters({ category: categoryId, subcategory: null })
    }
  }

  const handleSubcategorySelect = (subcategoryId: string) => {
    if (subcategoryId === filters.subcategory) {
      onUpdateFilters({ subcategory: null })
    } else {
      onUpdateFilters({ subcategory: subcategoryId })
    }
  }

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 h-screen bg-background border-r border-border flex flex-col z-50 transition-all duration-300 overflow-hidden",
          "left-[72px]",
          isOpen ? "w-[260px] opacity-100" : "w-0 opacity-0 pointer-events-none",
        )}
      >
        {/* Header with collapse button */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm text-foreground">Filters</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-card rounded-md transition-colors"
            title="Collapse filters"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Trade Matches Button */}
        {activeFilterCount > 0 && (
          <div className="p-3 border-b border-border">
            <button
              onClick={onClearAll}
              className="w-full py-2 text-xs text-muted-foreground hover:text-foreground bg-card rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Scrollable filter content */}
        <div className="flex-1 overflow-y-auto">
          {/* Categories Section - Hierarchical Tree */}
          <div className="border-b border-border">
            <button
              onClick={() => toggleSection("category")}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-card/50 transition-colors"
            >
              <span className="font-medium text-sm text-foreground">Category</span>
              {expandedSections.category ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {expandedSections.category && (
              <div className="px-3 pb-2">
                {/* All Categories option */}
                <button
                  onClick={() => handleCategorySelect(null)}
                  className={cn(
                    "w-full text-left py-1 text-sm transition-colors",
                    !filters.category ? "text-primary font-bold" : "text-foreground hover:text-primary",
                  )}
                >
                  All
                </button>

                {/* Category tree */}
                {categoryConfig.map((category) => (
                  <div key={category.id}>
                    <button
                      onClick={() => handleCategorySelect(category.id)}
                      className={cn(
                        "w-full text-left py-1 text-sm transition-colors flex items-center justify-between",
                        filters.category === category.id
                          ? "text-primary font-bold"
                          : "text-foreground hover:text-primary",
                      )}
                    >
                      <span>{category.label}</span>
                      <span className="text-xs text-muted-foreground">
                        ({getCategoryCount(category.id).toLocaleString()})
                      </span>
                    </button>

                    {/* Subcategories - only show when category is selected */}
                    {filters.category === category.id && (
                      <div className="ml-3 border-l border-border/50 pl-3">
                        {category.subcategories.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => handleSubcategorySelect(sub.id)}
                            className={cn(
                              "w-full text-left py-0.5 text-sm transition-colors flex items-center justify-between",
                              filters.subcategory === sub.id
                                ? "text-primary font-bold"
                                : "text-muted-foreground hover:text-foreground",
                            )}
                          >
                            <span>{sub.label}</span>
                            <span className="text-xs text-muted-foreground">
                              ({getSubcategoryCount(category.id, sub.id).toLocaleString()})
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Filter by Keyword */}
          <div className="px-3 py-2 border-b border-border">
            <label className="text-sm font-medium text-foreground block mb-1.5">Filter by Keyword</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={keywordFilter}
                onChange={(e) => setKeywordFilter(e.target.value)}
                placeholder="Search..."
                className="flex-1 px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              />
              <button className="px-3 py-2 bg-card border border-border rounded-lg hover:bg-card/80 transition-colors">
                <Search className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Brands Section */}
          {filters.category && brands.length > 0 && (
            <div className="border-b border-border">
              <button
                onClick={() => toggleSection("brand")}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-card/50 transition-colors"
              >
                <span className="font-medium text-sm text-foreground">Brands</span>
                {expandedSections.brand ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {expandedSections.brand && (
                <div className="px-3 pb-2">
                  {visibleBrands.map((brand) => (
                    <label key={brand.value} className="flex items-center gap-2 py-0 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={filters.brands.includes(brand.value)}
                          onChange={() => onToggleArrayFilter("brands", brand.value)}
                          className="peer appearance-none w-4 h-4 rounded border-2 border-muted-foreground/30 bg-transparent cursor-pointer transition-colors hover:border-muted-foreground/50 checked:border checked:border-yellow-500 checked:bg-transparent"
                        />
                        <Check className="absolute inset-0 -top-1 m-auto h-3 w-3 text-yellow-500 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                      </div>
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex-1">
                        {brand.label}
                      </span>
                      {brand.count && (
                        <span className="text-xs text-muted-foreground">({brand.count.toLocaleString()})</span>
                      )}
                    </label>
                  ))}
                  {brands.length > 5 && (
                    <button
                      onClick={() => setShowMoreBrands(!showMoreBrands)}
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors mt-1"
                    >
                      <span>{showMoreBrands ? "Show Less" : "Show More"}</span>
                      <ChevronDown className={cn("h-3 w-3 transition-transform", showMoreBrands && "rotate-180")} />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="border-b border-border">
            <button
              onClick={() => toggleSection("condition")}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-card/50 transition-colors"
            >
              <span className="font-medium text-sm text-foreground">Condition</span>
              {expandedSections.condition ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {expandedSections.condition && (
              <div className="px-3 pb-2 space-y-0.5">
                {/* Hint text */}
                
                {visibleConditions.map((condition) => (
                  <TriStateCheckbox
                    key={condition.value}
                    state={getConditionState(condition.value)}
                    onChange={(state) => onSetConditionState(condition.value, state)}
                    label={condition.label}
                    count={condition.count}
                  />
                ))}
                {conditions.length > 4 && (
                  <button
                    onClick={() => setShowMoreConditions(!showMoreConditions)}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors mt-1"
                  >
                    <span>{showMoreConditions ? "Show Less" : "Show More"}</span>
                    <ChevronDown className={cn("h-3 w-3 transition-transform", showMoreConditions && "rotate-180")} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Price Section */}
          <div className="border-b border-border">
            <button
              onClick={() => toggleSection("price")}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-card/50 transition-colors"
            >
              <span className="font-medium text-sm text-foreground">Price</span>
              {expandedSections.price ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {expandedSections.price && (
              <div className="px-3 pb-2">
                <PriceHistogramSlider
                  min={0}
                  max={500}
                  value={[filters.minPrice ?? 0, filters.maxPrice ?? 500]}
                  onChange={handlePriceChange}
                />
              </div>
            )}
          </div>

          {/* Listing Type Section */}
          <div className="border-b border-border">
            <button
              onClick={() => toggleSection("listingType")}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-card/50 transition-colors"
            >
              <span className="font-medium text-sm text-foreground">Show Only</span>
              {expandedSections.listingType ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {expandedSections.listingType && (
              <div className="px-3 pb-2">
                <label className="flex items-center gap-2 py-0 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={filters.forTrade === true}
                      onChange={() => onUpdateFilters({ forTrade: filters.forTrade === true ? null : true })}
                      className="peer appearance-none w-4 h-4 rounded border-2 border-muted-foreground/30 bg-transparent cursor-pointer transition-colors hover:border-muted-foreground/50 checked:border checked:border-yellow-500 checked:bg-transparent"
                    />
                    <Check className="absolute inset-0 -top-1 m-auto h-3 w-3 text-yellow-500 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                  </div>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    Open to Trade
                  </span>
                </label>
                <label className="flex items-center gap-2 py-0 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => {}}
                      className="peer appearance-none w-4 h-4 rounded border-2 border-muted-foreground/30 bg-transparent cursor-pointer transition-colors hover:border-muted-foreground/50 checked:border checked:border-yellow-500 checked:bg-transparent"
                    />
                    <Check className="absolute inset-0 -top-1 m-auto h-3 w-3 text-yellow-500 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                  </div>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    Free Shipping
                  </span>
                </label>
                <label className="flex items-center gap-2 py-0 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => {}}
                      className="peer appearance-none w-4 h-4 rounded border-2 border-muted-foreground/30 bg-transparent cursor-pointer transition-colors hover:border-muted-foreground/50 checked:border checked:border-yellow-500 checked:bg-transparent"
                    />
                    <Check className="absolute inset-0 -top-1 m-auto h-3 w-3 text-yellow-500 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                  </div>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    Verified Sellers
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
