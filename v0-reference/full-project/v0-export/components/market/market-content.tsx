"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SlidersHorizontal, ArrowUpDown, Check, ArrowLeftRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDiscoverFilters } from "@/hooks/use-discover-filters"
import { DiscoverFilterSidebar } from "@/components/discover/discover-filter-sidebar"
import { DiscoverListingCard } from "@/components/discover/discover-listing-card"
import { ActiveFiltersBar } from "@/components/discover/active-filters-bar"
import { TradeInterestCard } from "@/components/trade/trade-interest-card"
import { TradeItemSelector } from "@/components/trade/trade-item-selector"
import { OnboardingTooltip } from "@/components/collection/onboarding-tooltip"
import { demoListings, demoCommunities } from "@/lib/demo-data"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useGridDensity } from "@/hooks/use-grid-density"
import { GridDensitySelector } from "@/components/grid-density-selector"
import type { Listing, Community, PerfectMatch, InboundInterest } from "@/lib/types"
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

// Trade mock data
const MOCK_PERFECT_MATCHES: PerfectMatch[] = [
  {
    id: "pm-1",
    my_item: {
      id: "my-1",
      type: "listing",
      title: "Fender American Pro II Stratocaster",
      images: ["/fender-stratocaster-sunburst-electric-guitar.jpg"],
      price: 1749,
      condition: "Excellent",
    },
    their_item: {
      id: "demo-listing-1",
      type: "listing",
      title: "Gibson Les Paul Standard '50s",
      subtitle: "Gold Top - 2023",
      images: ["/gibson-les-paul-gold-top-electric-guitar.jpg"],
      price: 2499,
      condition: "Mint",
      user: {
        username: "vintagetone",
        avatar_url: "/male-guitarist-avatar.jpg",
        location: "Austin, TX",
      },
      niche: { name: "Austin Guitar Traders", icon: "🎸" },
    },
    my_criteria: {
      target_category: "Electric Guitars",
      target_subcategories: ["Les Paul", "SG"],
    },
    their_criteria: {
      target_category: "Electric Guitars",
      target_subcategories: ["Stratocaster", "Telecaster"],
    },
    match_score: 9.0,
  },
  {
    id: "pm-2",
    my_item: {
      id: "my-2",
      type: "listing",
      title: "Martin D-28 Acoustic Guitar",
      images: ["/martin-d28-acoustic-guitar-natural.jpg"],
      price: 3199,
      condition: "Excellent",
    },
    their_item: {
      id: "demo-listing-2",
      type: "listing",
      title: "Taylor 814ce Builder's Edition",
      subtitle: "V-Class Bracing - Natural",
      images: ["/taylor-814ce-acoustic-guitar.jpg"],
      price: 3999,
      condition: "Mint",
      user: {
        username: "acousticpro",
        avatar_url: "/female-musician-avatar.jpg",
        location: "Nashville, TN",
      },
      niche: { name: "Nashville Acoustics", icon: "🪕" },
    },
    my_criteria: {
      target_category: "Acoustic Guitars",
      target_subcategories: ["Taylor", "Grand Auditorium"],
    },
    their_criteria: {
      target_category: "Acoustic Guitars",
      target_subcategories: ["Martin", "Dreadnought"],
    },
    match_score: 8.0,
  },
  {
    id: "pm-3",
    my_item: {
      id: "my-3",
      type: "collection_item",
      title: "Mesa Boogie Dual Rectifier",
      images: ["/mesa-boogie-dual-rectifier-amp-head.jpg"],
      price: 1800,
      condition: "Good",
    },
    their_item: {
      id: "demo-listing-1",
      type: "listing",
      title: "Fender '65 Twin Reverb Reissue",
      subtitle: "85W Tube Combo",
      images: ["/fender-twin-reverb-amp.jpg"],
      price: 1699,
      condition: "Excellent",
      user: {
        username: "tubetown",
        avatar_url: "/older-man-avatar.png",
        location: "Los Angeles, CA",
      },
      niche: { name: "SoCal Amp Exchange", icon: "🔊" },
    },
    my_criteria: {
      target_category: "Amplifiers",
      target_subcategories: ["Fender", "Clean Amps"],
    },
    their_criteria: {
      target_category: "Amplifiers",
      target_subcategories: ["Mesa Boogie", "High Gain"],
    },
    match_score: 6.0,
  },
]

const MOCK_INBOUND_INTERESTS: InboundInterest[] = [
  {
    id: "ib-1",
    my_item: {
      id: "my-1",
      type: "listing",
      title: "Fender American Pro II Stratocaster",
      images: ["/fender-stratocaster-sunburst-electric-guitar.jpg"],
      price: 1749,
      condition: "Excellent",
    },
    their_item: {
      id: "demo-listing-2",
      type: "listing",
      title: "PRS Custom 24 10-Top",
      subtitle: "Pattern Neck - Cobalt Blue",
      images: ["/prs-custom-24-blue-electric-guitar.jpg"],
      price: 3899,
      condition: "Mint",
      user: {
        username: "prsaddict",
        avatar_url: "/young-musician-avatar.jpg",
        location: "Seattle, WA",
      },
      niche: { name: "PNW Guitar Club", icon: "🌲" },
    },
    their_criteria: {
      target_category: "Electric Guitars",
      target_subcategories: ["Stratocaster"],
    },
    match_score: 7.0,
  },
  {
    id: "ib-2",
    my_item: {
      id: "my-1",
      type: "listing",
      title: "Fender American Pro II Stratocaster",
      images: ["/fender-stratocaster-sunburst-electric-guitar.jpg"],
      price: 1749,
      condition: "Excellent",
    },
    their_item: {
      id: "demo-listing-1",
      type: "listing",
      title: "Gretsch G6120T-55 Vintage Select",
      subtitle: "Hollow Body - Orange Stain",
      images: ["/gretsch-orange-hollow-body-guitar.jpg"],
      price: 3299,
      condition: "Excellent",
      user: {
        username: "rockabillykid",
        avatar_url: "/rockabilly-musician-avatar.jpg",
        location: "Memphis, TN",
      },
      niche: { name: "Rockabilly Gear Swap", icon: "🎶" },
    },
    their_criteria: {
      target_category: "Electric Guitars",
      target_subcategories: ["Fender", "Stratocaster", "Telecaster"],
    },
    match_score: 5.0,
  },
]

// Combined type for unified list
type TradeInterestItem =
  | { type: "perfect"; data: PerfectMatch; sortKey: number }
  | { type: "inbound"; data: InboundInterest; sortKey: number }

interface MarketContentProps {
  initialTab: "for-sale" | "trade-matches"
  onFilterSidebarChange: (isOpen: boolean) => void
}

export function MarketContent({ initialTab, onFilterSidebarChange }: MarketContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<"for-sale" | "trade-matches">(initialTab)
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false)
  const { gridDensity } = useGridDensity()
  const [sortBy, setSortBy] = useState<SortOption>("newest")

  // For Sale tab state
  const {
    filters,
    updateFilters,
    toggleArrayFilter,
    setConditionState,
    clearAllFilters,
    hasActiveFilters,
    activeFilterCount,
  } = useDiscoverFilters()

  // Trade Matches tab state
  const [filterMyItem, setFilterMyItem] = useState<string>("all")
  const [showOnboarding, setShowOnboarding] = useState(false)

  const perfectMatches = MOCK_PERFECT_MATCHES
  const inboundInterests = MOCK_INBOUND_INTERESTS
  const isLoading = false

  // Sync activeTab state with URL searchParams
  useEffect(() => {
    const tabParam = searchParams?.get("tab")
    const newTab = tabParam === "trade-matches" ? "trade-matches" : "for-sale"
    if (newTab !== activeTab) {
      setActiveTab(newTab)
    }
  }, [searchParams, activeTab])

  // Update URL when tab changes
  const handleTabChange = (tab: "for-sale" | "trade-matches") => {
    setActiveTab(tab)
    router.push(`/market?tab=${tab}`, { scroll: false })
  }

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("trade-center-onboarding-complete")
    if (!hasSeenOnboarding && activeTab === "trade-matches") {
      const timer = setTimeout(() => setShowOnboarding(true), 500)
      return () => clearTimeout(timer)
    }
  }, [activeTab])

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

  const combinedInterests = useMemo(() => {
    const combined: TradeInterestItem[] = [
      ...perfectMatches.map((match) => ({
        type: "perfect" as const,
        data: match,
        sortKey: 100 + match.match_score,
      })),
      ...inboundInterests.map((interest) => ({
        type: "inbound" as const,
        data: interest,
        sortKey: interest.match_score,
      })),
    ]

    return combined.sort((a, b) => b.sortKey - a.sortKey)
  }, [perfectMatches, inboundInterests])

  const myItems = useMemo(() => {
    const itemsMap = new Map<
      string,
      {
        id: string
        title: string
        image?: string
        price?: number | null
        type: "listing" | "collection_item"
        matchCount: number
        perfectCount: number
      }
    >()

    perfectMatches.forEach((match) => {
      const existing = itemsMap.get(match.my_item.id)
      if (existing) {
        existing.matchCount++
        existing.perfectCount++
      } else {
        itemsMap.set(match.my_item.id, {
          id: match.my_item.id,
          title: match.my_item.title,
          image: match.my_item.images[0],
          price: match.my_item.price,
          type: match.my_item.type,
          matchCount: 1,
          perfectCount: 1,
        })
      }
    })

    inboundInterests.forEach((interest) => {
      const existing = itemsMap.get(interest.my_item.id)
      if (existing) {
        existing.matchCount++
      } else {
        itemsMap.set(interest.my_item.id, {
          id: interest.my_item.id,
          title: interest.my_item.title,
          image: interest.my_item.images[0],
          price: interest.my_item.price,
          type: interest.my_item.type,
          matchCount: 1,
          perfectCount: 0,
        })
      }
    })

    return Array.from(itemsMap.values())
  }, [perfectMatches, inboundInterests])

  const filteredInterests = useMemo(() => {
    let filtered = combinedInterests

    if (filterMyItem !== "all") {
      filtered = filtered.filter((item) => {
        const myItemId = item.type === "perfect" ? item.data.my_item.id : item.data.my_item.id
        return myItemId === filterMyItem
      })
    }

    return filtered
  }, [combinedInterests, filterMyItem])

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

  const onboardingSteps = [
    {
      id: "trade-intro",
      targetSelector: "[data-onboarding='trade-intro']",
      title: "Welcome to Trade Matches",
      description:
        "Discover trade opportunities for your items. Browse who's interested in what you have and find perfect matches.",
      position: "center" as const,
    },
    {
      id: "item-selector",
      targetSelector: "[data-onboarding='item-selector']",
      title: "Filter by Item",
      description:
        "Select a specific item to see only its matches, or view all matches at once. You can also access trade preferences for each item from here.",
      position: "bottom" as const,
    },
  ]

  return (
    <div className="flex min-h-screen w-full">
      {activeTab === "for-sale" && (
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
      )}

      <div className="flex-1 transition-all duration-300 min-h-screen w-full">
        {showOnboarding && activeTab === "trade-matches" && (
          <OnboardingTooltip
            steps={onboardingSteps}
            storageKey="trade-center-onboarding-complete"
            onComplete={() => setShowOnboarding(false)}
          />
        )}

        <div className="p-6 lg:p-8 max-w-7xl mx-auto mt-0 lg:py-4">
          {/* Title */}
          <h1 className="font-bold text-foreground text-2xl mb-5">Market</h1>

          {/* Tabs */}
          <div className="mb-4">
            <div className="flex items-center gap-8 overflow-x-auto">
              <button
                onClick={() => handleTabChange("for-sale")}
                className={cn(
                  "text-xl font-semibold transition-colors whitespace-nowrap pb-2",
                  activeTab === "for-sale"
                    ? "text-foreground border-b-2 border-b-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                For Sale
              </button>
              
              <button
                onClick={() => handleTabChange("trade-matches")}
                className={cn(
                  "text-xl font-semibold transition-colors whitespace-nowrap pb-2",
                  activeTab === "trade-matches"
                    ? "text-foreground border-b-2 border-b-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Trade
              </button>
            </div>
          </div>

          {/* Tab-specific controls */}
          {activeTab === "for-sale" ? (
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleFilterSidebar(!filterSidebarOpen)}
                    className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg hover:bg-muted transition-colors text-sm"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="hidden sm:inline">Filters</span>
                    {activeFilterCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                  <span className="text-sm text-muted-foreground">{sortedListings.length} listings</span>
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
                <div className="mb-6">
                  <ActiveFiltersBar filters={filters} onRemoveFilter={handleRemoveFilter} />
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div data-onboarding="item-selector">
                    <TradeItemSelector
                      items={myItems}
                      selectedItemId={filterMyItem}
                      onSelect={setFilterMyItem}
                      totalMatches={perfectMatches.length + inboundInterests.length}
                      totalPerfect={perfectMatches.length}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {filteredInterests.length} matches
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <GridDensitySelector />
                </div>
              </div>
            </div>
          )}

          {/* Content Grid */}
          <div data-onboarding="trade-intro">
            {activeTab === "for-sale" ? (
              sortedListings.length === 0 ? (
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
              )
            ) : (
              filteredInterests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mb-4">
                    <ArrowLeftRight className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No trade matches found</h3>
                  <p className="text-muted-foreground max-w-md">
                    When someone expresses interest in trading for your items, they'll appear here.
                  </p>
                </div>
              ) : (
                <div className={cn("grid gap-3", gridDensityConfig[gridDensity].cols)}>
                  {filteredInterests.map((interest) => (
                    <TradeInterestCard key={interest.data.id} type={interest.type} data={interest.data} />
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
