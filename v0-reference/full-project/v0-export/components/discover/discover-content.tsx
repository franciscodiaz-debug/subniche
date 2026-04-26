"use client"

import { useState, useMemo } from "react"
import { SlidersHorizontal, ArrowUpDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDiscoverFilters } from "@/hooks/use-discover-filters"
import { DiscoverFilterSidebar } from "./discover-filter-sidebar"
import { DiscoverListingCard } from "./discover-listing-card"
import { ActiveFiltersBar } from "./active-filters-bar"
import { demoListings, demoCommunities } from "@/lib/demo-data"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useGridDensity } from "@/hooks/use-grid-density"
import { GridDensitySelector } from "@/components/grid-density-selector"
import { DiscoverModeToggle } from "@/components/discover-mode-toggle"
import type { Listing, Community } from "@/lib/types"
import { gridDensityConfig } from "@/hooks/use-grid-density"

type SortOption = "newest" | "oldest" | "price-low" | "price-high" | "distance"

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
  { value: "distance", label: "Distance: nearest" },
]

interface DiscoverListing extends Listing {
  for_trade?: boolean
  is_private?: boolean
  published_groups?: Community[]
}

interface DiscoverContentProps {
  onFilterSidebarChange: (isOpen: boolean) => void
}

export function DiscoverContent({ onFilterSidebarChange }: DiscoverContentProps) {
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false)
  const { gridDensity } = useGridDensity()
  const [sortBy, setSortBy] = useState<SortOption>("newest")

  const {
    filters,
    updateFilters,
    toggleArrayFilter,
    setConditionState,
    clearAllFilters,
    hasActiveFilters,
    activeFilterCount,
  } = useDiscoverFilters()

  const enhancedListings: DiscoverListing[] = useMemo(() => {
    const baseListings = [...demoListings]

    const additionalListings: DiscoverListing[] = [
      {
        id: "discover-1",
        seller_id: "demo-seller-1",
        title: "Discraft Z Luna",
        subtitle: "Paul McBeth Signature Putter",
        description: "Great throwing putter",
        price: 18,
        category: "Discs",
        subcategory: "Putters",
        condition: "New",
        payment_methods: ["Cash", "Venmo"],
        logistics: "Shipping available",
        images: ["/blue-discraft-luna-putter-disc.jpg"],
        location: "Dallas, TX",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        updated_at: new Date().toISOString(),
        for_trade: true,
        published_groups: [demoCommunities[0], demoCommunities[2]],
      },
      {
        id: "discover-2",
        seller_id: "demo-user-3",
        title: "MVP Axiom Envy",
        subtitle: "Eclipse Glow - 175g",
        description: "Great approach disc",
        price: 22,
        category: "Discs",
        subcategory: "Putters",
        condition: "Like New",
        payment_methods: ["Cash"],
        logistics: "Local pickup",
        images: ["/glow-mvp-envy-disc-golf-disc.jpg"],
        location: "Houston, TX",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        updated_at: new Date().toISOString(),
        for_trade: false,
        published_groups: [demoCommunities[1], demoCommunities[3], demoCommunities[4]],
      },
      {
        id: "discover-3",
        seller_id: "demo-buyer-1",
        title: "GRIPeq BX3 Bag",
        subtitle: "30+ Disc Capacity",
        description: "Premium disc golf bag",
        price: 280,
        category: "Accessories",
        subcategory: "Bags",
        condition: "Used",
        payment_methods: ["Cash", "PayPal"],
        logistics: "Shipping available",
        images: ["/gripeq-disc-golf-bag-backpack.jpg"],
        location: "Austin, TX",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        updated_at: new Date().toISOString(),
        for_trade: true,
        published_groups: [demoCommunities[0]],
      },
      {
        id: "discover-4",
        seller_id: "demo-seller-1",
        title: "Kastaplast K1 Lots",
        subtitle: "Fairway Driver - 174g",
        description: "Great fairway driver for beginners",
        price: 16,
        category: "Discs",
        subcategory: "Fairway Drivers",
        condition: "New",
        payment_methods: ["Cash"],
        logistics: "Local pickup",
        images: ["/kastaplast-lots-fairway-driver-disc.jpg"],
        location: "Austin, TX",
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        updated_at: new Date().toISOString(),
        for_trade: false,
        published_groups: [demoCommunities[2], demoCommunities[4]],
      },
      {
        id: "discover-5",
        seller_id: "demo-user-3",
        title: "Innova Star Wraith",
        subtitle: "Distance Driver - 170g",
        description: "Reliable high-speed driver",
        price: 14,
        category: "Discs",
        subcategory: "Distance Drivers",
        condition: "Used",
        payment_methods: ["Venmo"],
        logistics: "Shipping available",
        images: ["/innova-star-wraith-disc-golf.jpg"],
        location: "Houston, TX",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        updated_at: new Date().toISOString(),
        for_trade: true,
        is_private: true,
        published_groups: [demoCommunities[3]],
      },
      {
        id: "discover-6",
        seller_id: "demo-buyer-1",
        title: "Discmania Tournament Hat",
        subtitle: "Snapback - Black/Gold",
        description: "Official Discmania tournament hat",
        price: 28,
        category: "Apparel",
        subcategory: "Hats",
        condition: "New",
        payment_methods: ["Cash", "Venmo"],
        logistics: "Shipping available",
        images: ["/discmania-snapback-hat-black-gold.jpg"],
        location: "Dallas, TX",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        updated_at: new Date().toISOString(),
        for_trade: false,
        published_groups: [demoCommunities[1], demoCommunities[2]],
      },
    ]

    const enhancedBase = baseListings.map((listing, index) => ({
      ...listing,
      for_trade: Math.random() > 0.5,
      published_groups: demoCommunities.slice(0, Math.floor(Math.random() * 3) + 1),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * (index * 6 + 1)).toISOString(),
    }))

    return [...enhancedBase, ...additionalListings]
  }, [])

  const filteredListings = useMemo(() => {
    return enhancedListings.filter((listing) => {
      if (filters.category && listing.category?.toLowerCase() !== filters.category) {
        return false
      }

      if (filters.subcategory) {
        const listingSubcat = listing.subcategory?.toLowerCase().replace(/\s+/g, "-")
        if (listingSubcat !== filters.subcategory) {
          return false
        }
      }

      if (filters.conditions.length > 0) {
        const listingCondition = listing.condition?.toLowerCase().replace(/\s+/g, "-")
        if (!filters.conditions.includes(listingCondition || "")) {
          return false
        }
      }

      if (filters.excludeConditions.length > 0) {
        const listingCondition = listing.condition?.toLowerCase().replace(/\s+/g, "-")
        if (filters.excludeConditions.includes(listingCondition || "")) {
          return false
        }
      }

      if (filters.minPrice !== null && listing.price < filters.minPrice) {
        return false
      }
      if (filters.maxPrice !== null && listing.price > filters.maxPrice) {
        return false
      }

      if (filters.forTrade === true && !listing.for_trade) {
        return false
      }
      if (filters.forTrade === false && listing.for_trade) {
        return false
      }

      return true
    })
  }, [enhancedListings, filters])

  const sortedListings = useMemo(() => {
    const listings = [...filteredListings]

    const getDistanceScore = (location: string | undefined) => {
      if (!location) return 999
      if (location.includes("Austin")) return 1
      if (location.includes("Dallas")) return 2
      if (location.includes("Houston")) return 3
      return 4
    }

    switch (sortBy) {
      case "newest":
        return listings.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      case "oldest":
        return listings.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())
      case "price-low":
        return listings.sort((a, b) => (a.price || 0) - (b.price || 0))
      case "price-high":
        return listings.sort((a, b) => (b.price || 0) - (a.price || 0))
      case "distance":
        return listings.sort((a, b) => getDistanceScore(a.location) - getDistanceScore(b.location))
      default:
        return listings
    }
  }, [filteredListings, sortBy])

  const handleRemoveFilter = (key: string, value?: string) => {
    if (key === "category") {
      updateFilters({ category: null, subcategory: null })
    } else if (key === "subcategory") {
      updateFilters({ subcategory: null })
    } else if (key === "price") {
      updateFilters({ minPrice: null, maxPrice: null })
    } else if (key === "forTrade") {
      updateFilters({ forTrade: null })
    } else if (value) {
      toggleArrayFilter(key as keyof typeof filters, value)
    }
  }

  const handleToggleFilterSidebar = (isOpen: boolean) => {
    setFilterSidebarOpen(isOpen)
    onFilterSidebarChange(isOpen)
  }

  const currentSortLabel = sortOptions.find((opt) => opt.value === sortBy)?.label || "Sort"

  return (
    <div className="flex min-h-screen w-full">
      <DiscoverFilterSidebar
        isOpen={filterSidebarOpen}
        onClose={() => handleToggleFilterSidebar(false)}
        filters={filters}
        onUpdateFilters={updateFilters}
        onToggleArrayFilter={toggleArrayFilter}
        onSetConditionState={setConditionState}
        onClearAll={clearAllFilters}
        activeFilterCount={activeFilterCount}
      />

      <div className="flex-1 transition-all duration-300 min-h-screen w-full">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="p-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-3 items-center">
                <button
                  onClick={() => handleToggleFilterSidebar(!filterSidebarOpen)}
                  className={cn(
                    "relative flex items-center justify-center h-9 w-9 rounded-lg transition-colors shrink-0 border border-border",
                    filterSidebarOpen
                      ? "bg-primary/10 text-primary border-primary/50"
                      : "bg-card hover:bg-muted hover:border-primary/30",
                  )}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[14px] h-[14px] px-0.5 text-[9px] font-bold bg-primary text-primary-foreground rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <div className="lg:hidden">
                  <DiscoverModeToggle showLabels={true} />
                </div>
                <h1 className="hidden lg:block font-semibold text-foreground text-2xl">Browse</h1>
                <span className="text-sm text-muted-foreground pt-1.5">{sortedListings.length} listings</span>
              </div>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg hover:bg-muted transition-colors text-sm">
                      <ArrowUpDown className="h-4 w-4" />
                      <span className="hidden sm:inline">{currentSortLabel}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {sortOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setSortBy(option.value)}
                        className="flex items-center justify-between"
                      >
                        {option.label}
                        {sortBy === option.value && <Check className="h-4 w-4 text-primary" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <GridDensitySelector />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-3">
                <ActiveFiltersBar filters={filters} onRemoveFilter={handleRemoveFilter} onClearAll={clearAllFilters} />
              </div>
            )}
          </div>
        </div>

        <div className="px-4 py-4">
          {sortedListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mb-4">
                <SlidersHorizontal className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No listings found</h3>
              <p className="text-muted-foreground max-w-md">Try adjusting your filters to see more results.</p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="mt-4 px-4 py-2 bg-card border border-border rounded-lg text-sm hover:border-primary/50 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className={cn("grid gap-3", gridDensityConfig[gridDensity].cols)}>
              {sortedListings.map((listing) => (
                <DiscoverListingCard key={listing.id} listing={listing} viewMode="grid" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
