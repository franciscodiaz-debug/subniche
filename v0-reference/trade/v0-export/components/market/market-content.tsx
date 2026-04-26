"use client"

import { useMemo, useState } from "react"
import { ArrowUpDown, Check, SlidersHorizontal, Telescope, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { DiscoverListingCard } from "@/components/discover-listing-card"
import { GridDensitySelector } from "@/components/shared/grid-density-selector"
import { MarketTabs } from "@/components/shared/market-tabs"
import {
  OnboardingTooltip,
  type OnboardingStep,
} from "@/components/shared/onboarding-tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  gridDensityConfig,
  useGridDensity,
} from "@/hooks/use-grid-density"
import { useRequestNavCollapse } from "@/hooks/use-nav-collapse-request"
import {
  marketBrands,
  marketCategories,
  marketConditions,
  marketListings,
} from "@/lib/market-data"
import {
  MarketFilterSidebar,
  initialMarketFilters,
  type MarketFilterState,
} from "./market-filter-sidebar"

const marketOnboardingSteps: OnboardingStep[] = [
  {
    id: "market-intro",
    targetSelector: "[data-onboarding-id='market-tabs']",
    title: "For Sale or Trade",
    description:
      "Switch between For Sale listings and Trade matches on items you're open to swapping.",
    position: "bottom",
  },
  {
    id: "market-filters",
    targetSelector: "[data-onboarding-id='market-filters-button']",
    title: "Refine your search",
    description:
      "Open the sidebar to filter by category, brand, condition, price, and more.",
    position: "bottom",
  },
  {
    id: "market-density",
    targetSelector: "[data-onboarding-id='market-density']",
    title: "Adjust grid density",
    description:
      "Compact to scan many at once, or spacious when you want to focus on fewer items.",
    position: "bottom",
  },
]

type SortOption = "newest" | "price-low" | "price-high" | "distance"

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
  { value: "distance", label: "Distance: nearest" },
]

export function MarketContent() {
  const [filters, setFilters] = useState<MarketFilterState>(initialMarketFilters)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const { gridDensity } = useGridDensity()

  // When the filter sidebar is open, collapse the main nav to icon-only
  // so the filter panel can expand into the vacated space.
  useRequestNavCollapse("market-filters", sidebarOpen)

  const updateFilters = (updates: Partial<MarketFilterState>) =>
    setFilters((prev) => ({ ...prev, ...updates }))

  const toggleArrayFilter = (key: "brands" | "conditions", value: string) =>
    setFilters((prev) => {
      const arr = prev[key]
      return {
        ...prev,
        [key]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      }
    })

  const clearAll = () => setFilters(initialMarketFilters)

  const activeFilterCount =
    (filters.category ? 1 : 0) +
    (filters.subcategory ? 1 : 0) +
    filters.brands.length +
    filters.conditions.length +
    (filters.minPrice > 0 || filters.maxPrice < 5000 ? 1 : 0) +
    (filters.forTrade ? 1 : 0)

  const filteredListings = useMemo(() => {
    return marketListings.filter((listing) => {
      // very lightweight filtering for the prototype
      if (
        filters.minPrice > 0 &&
        (typeof listing.price !== "number" || listing.price < filters.minPrice)
      ) {
        return false
      }
      if (
        filters.maxPrice < 5000 &&
        (typeof listing.price !== "number" || listing.price > filters.maxPrice)
      ) {
        return false
      }
      if (filters.forTrade && !listing.for_trade) return false
      return true
    })
  }, [filters])

  const sortedListings = useMemo(() => {
    const list = [...filteredListings]
    switch (sortBy) {
      case "price-low":
        return list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
      case "price-high":
        return list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
      case "distance":
        return list.sort((a, b) =>
          (a.location ?? "").localeCompare(b.location ?? ""),
        )
      default:
        return list
    }
  }, [filteredListings, sortBy])

  const currentSortLabel =
    sortOptions.find((o) => o.value === sortBy)?.label ?? "Sort"

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = []

    if (filters.category) {
      const cat = marketCategories.find((c) => c.id === filters.category)
      chips.push({
        key: `cat-${filters.category}`,
        label: cat?.label ?? filters.category,
        onRemove: () =>
          updateFilters({ category: null, subcategory: null }),
      })
    }
    if (filters.subcategory) {
      const cat = marketCategories.find((c) => c.id === filters.category)
      const sub = cat?.subcategories.find((s) => s.id === filters.subcategory)
      chips.push({
        key: `sub-${filters.subcategory}`,
        label: sub?.label ?? filters.subcategory,
        onRemove: () => updateFilters({ subcategory: null }),
      })
    }
    filters.brands.forEach((b) => {
      const brand = marketBrands.find((x) => x.value === b)
      chips.push({
        key: `brand-${b}`,
        label: brand?.label ?? b,
        onRemove: () => toggleArrayFilter("brands", b),
      })
    })
    filters.conditions.forEach((c) => {
      const cond = marketConditions.find((x) => x.value === c)
      chips.push({
        key: `cond-${c}`,
        label: cond?.label ?? c,
        onRemove: () => toggleArrayFilter("conditions", c),
      })
    })
    if (filters.minPrice > 0 || filters.maxPrice < 5000) {
      chips.push({
        key: "price",
        label: `$${filters.minPrice} – $${filters.maxPrice}`,
        onRemove: () => updateFilters({ minPrice: 0, maxPrice: 5000 }),
      })
    }
    if (filters.forTrade) {
      chips.push({
        key: "trade",
        label: "Open to trade",
        onRemove: () => updateFilters({ forTrade: false }),
      })
    }

    return chips
  }, [filters])

  return (
    <div className="flex w-full">
      <MarketFilterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        filters={filters}
        onUpdateFilters={updateFilters}
        onToggleArrayFilter={toggleArrayFilter}
        onClearAll={clearAll}
        activeFilterCount={activeFilterCount}
      />

      <div
        className={cn(
          "min-w-0 flex-1 transition-[margin] duration-300 ease-out motion-reduce:transition-none",
          sidebarOpen ? "lg:ml-[280px]" : "lg:ml-0",
        )}
      >
        <div className="px-4 pb-6 pt-3 md:px-8">
          {/* Page title */}
          <div className="mb-4 flex items-center gap-2">
            <Telescope className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Market</h1>
          </div>

          {/* Section tabs */}
          <MarketTabs id="market-tabs" className="mb-5" />

          {/* Controls — Filters, active chips, and sort/density are all
              direct flex siblings so `order` + `ml-auto` can rearrange them
              cleanly at each breakpoint.
              Mobile (flex-wrap): [Filters .... Sort+Density] / [Chips full-width]
              Desktop (flex-nowrap): [Filters] [Chips flex-1] [Sort+Density] */}
          <div className="mb-2 flex flex-wrap items-start gap-2 md:flex-nowrap md:gap-3">
            {!sidebarOpen ? (
              <button
                type="button"
                data-onboarding-id="market-filters-button"
                onClick={() => setSidebarOpen(true)}
                className="order-1 inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm text-foreground transition-colors hover:bg-secondary"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
                {activeFilterCount > 0 ? (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                    {activeFilterCount}
                  </span>
                ) : null}
              </button>
            ) : null}

            {/* Sort + density: right-aligned on mobile (same row as
                Filters via ml-auto), then slide to the far end on md+ */}
            <div className="order-2 ml-auto flex shrink-0 items-center gap-2 md:order-3 md:ml-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm text-foreground transition-colors hover:bg-secondary">
                    <ArrowUpDown className="h-4 w-4" />
                    <span className="hidden sm:inline">{currentSortLabel}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {sortOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className="flex items-center justify-between"
                    >
                      <span>{option.label}</span>
                      {sortBy === option.value ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : null}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <GridDensitySelector id="market-density" />
            </div>

            {/* Chips: full-width second row on mobile (basis-full), then
                grow into the middle gap between buttons on md+ */}
            <div className="order-3 flex min-w-0 basis-full flex-wrap items-center gap-x-2 gap-y-2 md:order-2 md:basis-auto md:flex-1 md:py-1">
              {sidebarOpen && activeChips.length === 0 ? (
                <span className="text-sm text-muted-foreground">
                  No active filters
                </span>
              ) : (
                <>
                  {activeChips.map((chip) => (
                    <button
                      key={chip.key}
                      type="button"
                      onClick={chip.onRemove}
                      className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 text-xs text-foreground transition-colors hover:bg-primary/20"
                    >
                      <span>{chip.label}</span>
                      <X className="h-3 w-3" />
                    </button>
                  ))}
                  {activeChips.length > 0 ? (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="shrink-0 text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                    >
                      Clear all
                    </button>
                  ) : null}
                </>
              )}
            </div>
          </div>

          {/* Result count — sits below the chips */}
          <div className="mb-4 text-sm text-muted-foreground">
            {sortedListings.length} listings
          </div>

          {/* Results grid */}
          {sortedListings.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <p className="text-sm text-muted-foreground">
                No listings match your current filters.
              </p>
              <button
                type="button"
                onClick={clearAll}
                className="mt-3 text-sm font-medium text-primary hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className={gridDensityConfig[gridDensity].gridClass}>
              {sortedListings.map((listing) => (
                <DiscoverListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </div>

      <OnboardingTooltip
        steps={marketOnboardingSteps}
        storageKey="subniche.onboarding.market.v1"
      />
    </div>
  )
}
