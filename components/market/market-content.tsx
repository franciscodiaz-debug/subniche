"use client"

import { useMemo, useState, type ComponentType } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Heart,
  SlidersHorizontal,
  Sparkles,
  Telescope,
  TrendingUp,
  Zap,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { exploreItems, type ExploreItem } from "@/lib/explore-data"
import { ItemCard } from "@/components/item-card"
import { MarketTabs } from "@/components/shared/market-tabs"
import { useRequestNavCollapse } from "@/hooks/use-nav-collapse-request"
import {
  MarketFilterSidebar,
  initialMarketFilters,
  type MarketFilterState,
} from "./market-filter-sidebar"

type SortMode = "all" | "trending" | "just-listed" | "following"
type SecondarySort = "default" | "recent" | "price-low" | "price-high"

const sortPills: {
  value: SortMode
  label: string
  icon: ComponentType<{ className?: string }>
}[] = [
  { value: "all", label: "All", icon: Sparkles },
  { value: "trending", label: "Trending", icon: TrendingUp },
  { value: "just-listed", label: "Just Listed", icon: Zap },
  { value: "following", label: "Following", icon: Heart },
]

const VALID_SORTS: SortMode[] = ["all", "trending", "just-listed", "following"]

function isSortMode(value: string | null | undefined): value is SortMode {
  return !!value && (VALID_SORTS as string[]).includes(value)
}

export function MarketContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const rawSort = searchParams?.get("sort")
  const initialSort: SortMode = isSortMode(rawSort) ? rawSort : "all"
  const queryFromUrl = (searchParams?.get("q") ?? "").trim()

  const [sort, setSort] = useState<SortMode>(initialSort)
  const [secondarySort, setSecondarySort] = useState<SecondarySort>("default")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filters, setFilters] = useState<MarketFilterState>(initialMarketFilters)

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

  const items = useMemo(() => {
    let list: ExploreItem[] = [...exploreItems]

    switch (sort) {
      case "trending":
        list.sort((a, b) => (b.trendingScore ?? 0) - (a.trendingScore ?? 0))
        break
      case "just-listed":
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        break
      case "following":
        list = list.filter((item) => item.isFollowed)
        break
    }

    if (queryFromUrl) {
      const needle = queryFromUrl.toLowerCase()
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(needle) ||
          item.subtitle?.toLowerCase().includes(needle),
      )
    }

    if (filters.minPrice > 0) {
      list = list.filter((item) => item.price != null && item.price >= filters.minPrice)
    }
    if (filters.maxPrice < 5000) {
      list = list.filter((item) => item.price != null && item.price <= filters.maxPrice)
    }

    switch (secondarySort) {
      case "recent":
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        break
      case "price-low":
        list.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
        break
      case "price-high":
        list.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity))
        break
    }

    return list
  }, [sort, secondarySort, queryFromUrl, filters])

  const updateSort = (next: SortMode) => {
    setSort(next)
    const params = new URLSearchParams(searchParams?.toString() ?? "")
    if (next === "all") {
      params.delete("sort")
    } else {
      params.set("sort", next)
    }
    const qs = params.toString()
    router.replace(`/market${qs ? `?${qs}` : ""}`, { scroll: false })
  }

  const heading = queryFromUrl ? `Results for "${queryFromUrl}"` : "Market"
  const subheading = queryFromUrl
    ? `${items.length} item${items.length === 1 ? "" : "s"} matching your search`
    : "Discover items across the marketplace"

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
        <div className="mx-auto max-w-7xl p-6 lg:p-8">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <Telescope className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">{heading}</h1>
            </div>
            {queryFromUrl ? (
              <p className="mt-1 text-sm text-muted-foreground">{subheading}</p>
            ) : null}
          </div>

          <MarketTabs className="mb-5" />

          <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-border pb-4">
            {!sidebarOpen ? (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters
                {activeFilterCount > 0 ? (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                    {activeFilterCount}
                  </span>
                ) : null}
              </button>
            ) : null}

            <div className="scrollbar-hide flex gap-2 overflow-x-auto">
              {sortPills.map(({ value, label, icon: Icon }) => {
                const active = sort === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updateSort(value)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                )
              })}
            </div>

            <div className="ml-auto">
              <label className="sr-only" htmlFor="market-secondary-sort">
                Sort
              </label>
              <select
                id="market-secondary-sort"
                value={secondarySort}
                onChange={(e) => setSecondarySort(e.target.value as SecondarySort)}
                className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:border-primary/40"
              >
                <option value="default">Sort: best match</option>
                <option value="recent">Sort: most recent</option>
                <option value="price-low">Sort: price low to high</option>
                <option value="price-high">Sort: price high to low</option>
              </select>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card/40 p-12 text-center">
              <p className="font-medium text-foreground">No items match your filters</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try removing a filter or switching the sort mode.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  subtitle={item.subtitle}
                  image={item.image}
                  price={item.price}
                  location={item.location}
                  forSale={item.forSale}
                  forTrade={item.forTrade}
                  collections={item.collections}
                  match={
                    item.match
                      ? {
                          score: item.match.score,
                          matchedItems: item.match.matchedItems,
                          fallbackItemTitle: item.match.matchedItems[0]?.title,
                        }
                      : undefined
                  }
                  href={`/listings/${item.id}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

