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

import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { exploreItems, type ExploreItem } from "@/lib/explore-data"
import { searchCollections, searchUsers } from "@/lib/search-data"
import { ItemCard } from "@/components/item-card"
import { GridDensitySelector } from "@/components/shared/grid-density-selector"
import { MarketTabs } from "@/components/shared/market-tabs"
import { gridDensityConfig, useGridDensity } from "@/hooks/use-grid-density"
import { useRequestNavCollapse } from "@/hooks/use-nav-collapse-request"
import {
  MarketFilterSidebar,
  initialMarketFilters,
  type MarketFilterState,
} from "./market-filter-sidebar"

type SearchResultTab = "items" | "collections" | "users"

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
  const rawType = searchParams?.get("type")
  const searchTab: SearchResultTab =
    rawType === "collections" || rawType === "users" ? rawType : "items"

  const [sort, setSort] = useState<SortMode>(initialSort)
  const [secondarySort, setSecondarySort] = useState<SecondarySort>("default")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { gridDensity } = useGridDensity()
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

  const collectionResults = useMemo(() => {
    if (!queryFromUrl) return []
    const needle = queryFromUrl.toLowerCase()
    return searchCollections.filter((c) => c.name.toLowerCase().includes(needle))
  }, [queryFromUrl])

  const userResults = useMemo(() => {
    if (!queryFromUrl) return []
    const needle = queryFromUrl.toLowerCase()
    return searchUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(needle) ||
        u.username.toLowerCase().includes(needle),
    )
  }, [queryFromUrl])

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

  const updateType = (next: SearchResultTab) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "")
    if (next === "items") {
      params.delete("type")
    } else {
      params.set("type", next)
    }
    const qs = params.toString()
    router.replace(`/market${qs ? `?${qs}` : ""}`, { scroll: false })
  }

  const heading = queryFromUrl ? `Results for "${queryFromUrl}"` : "Market"
  const subheading = queryFromUrl
    ? searchTab === "collections"
      ? `${collectionResults.length} collection${collectionResults.length === 1 ? "" : "s"} matching your search`
      : searchTab === "users"
      ? `${userResults.length} user${userResults.length === 1 ? "" : "s"} matching your search`
      : `${items.length} item${items.length === 1 ? "" : "s"} matching your search`
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
        <div className="mx-auto max-w-7xl px-4 pb-8 pt-3 md:px-8">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <Telescope className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">{heading}</h1>
            </div>
            {queryFromUrl ? (
              <p className="mt-1 text-sm text-muted-foreground">{subheading}</p>
            ) : null}
          </div>

          {queryFromUrl ? (
            <div className="mb-5 flex gap-1 border-b border-border">
              {(["items", "collections", "users"] as SearchResultTab[]).map((tab) => {
                const count =
                  tab === "items"
                    ? items.length
                    : tab === "collections"
                    ? collectionResults.length
                    : userResults.length
                const label =
                  tab === "items" ? "Items" : tab === "collections" ? "Collections" : "Users"
                const active = searchTab === tab
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => updateType(tab)}
                    className={cn(
                      "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {label}
                    {count > 0 ? (
                      <span
                        className={cn(
                          "ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium",
                          active
                            ? "bg-primary/10 text-primary"
                            : "bg-secondary text-muted-foreground",
                        )}
                      >
                        {count}
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          ) : (
            <MarketTabs className="mb-5" />
          )}

          {(!queryFromUrl || searchTab === "items") && (
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

            <div className="ml-auto flex items-center gap-2">
              <GridDensitySelector />
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
          )}

          {(!queryFromUrl || searchTab === "items") && (
            items.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-card/40 p-12 text-center">
                <p className="font-medium text-foreground">No items match your filters</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try removing a filter or switching the sort mode.
                </p>
              </div>
            ) : (
              <div className={gridDensityConfig[gridDensity].gridClass}>
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
            )
          )}

          {queryFromUrl && searchTab === "collections" && (
            collectionResults.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-card/40 p-12 text-center">
                <p className="font-medium text-foreground">No collections found</p>
                <p className="mt-1 text-sm text-muted-foreground">Try a different search term.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {collectionResults.map((c) => (
                  <Link
                    key={c.id}
                    href={`/collection/${c.id}`}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40 hover:bg-card/80"
                  >
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary text-xl">
                      {c.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.memberCount.toLocaleString()} members
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )
          )}

          {queryFromUrl && searchTab === "users" && (
            userResults.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-card/40 p-12 text-center">
                <p className="font-medium text-foreground">No users found</p>
                <p className="mt-1 text-sm text-muted-foreground">Try a different search term.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {userResults.map((u) => (
                  <Link
                    key={u.id}
                    href={`/profile/${u.username}`}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40 hover:bg-card/80"
                  >
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-secondary">
                      <Image src={u.avatar} alt={u.name} fill sizes="40px" className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{u.name}</p>
                      <p className="text-xs text-muted-foreground">@{u.username}</p>
                      {u.location ? (
                        <p className="text-xs text-muted-foreground">{u.location}</p>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

