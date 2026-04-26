"use client"

import React from "react"

import { useState, useMemo } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { 
  Heart, 
  ChevronDown,
  Check,
  ArrowUpDown,
  Search,
  Tag,
  User,
  FolderOpen,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DiscoverListingCard } from "@/components/discover/discover-listing-card"
import type { Listing, Community } from "@/lib/types"

type FeedItemType = "search_match" | "price_drop" | "collection_update" | "user_listing"

interface DiscoverListing extends Listing {
  for_trade?: boolean
  is_private?: boolean
  published_groups?: Community[]
  matched_saved_search?: string
  // Feed-specific metadata
  feedType?: FeedItemType
  feedContext?: string
  feedTimestamp?: Date
}

type FilterType = "all" | "searches" | "price_drops" | "collections" | "users"
type SortType = "newest" | "oldest" | "price_high" | "price_low"

const filterOptions: { value: FilterType; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "All Activity", icon: null },
  { value: "searches", label: "Search Matches", icon: <Search className="h-4 w-4" /> },
  { value: "price_drops", label: "Price Drops", icon: <Tag className="h-4 w-4" /> },
  { value: "collections", label: "Collection Updates", icon: <FolderOpen className="h-4 w-4" /> },
  { value: "users", label: "User Listings", icon: <User className="h-4 w-4" /> },
]

const sortOptions: { value: SortType; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price_high", label: "Price: Highest" },
  { value: "price_low", label: "Price: Lowest" },
]

// Demo feed data - items with context about why they're in the feed
const demoFeedItems: DiscoverListing[] = [
  {
    id: "feed-1",
    seller_id: "user1",
    title: "1959 Gibson Les Paul Standard",
    subtitle: 'Matches "vintage les paul"',
    description: null,
    price: 185000,
    category: "Guitars",
    subcategory: null,
    condition: "Excellent",
    payment_methods: [],
    logistics: null,
    images: ["/gibson-les-paul-1959-vintage-electric-guitar.jpg"],
    location: "Nashville, TN",
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    for_trade: true,
    feedType: "search_match",
    feedContext: 'Matches "vintage les paul"',
    feedTimestamp: new Date(Date.now() - 1000 * 60 * 15),
    published_groups: [
      { id: "g1", name: "Gibson Guild", slug: "gibson-guild", description: null, icon: "🎸", member_count: 2800 },
    ],
  },
  {
    id: "feed-2",
    seller_id: "user2",
    title: "Marshall JCM800 2203",
    subtitle: "Price dropped from $2,800",
    description: null,
    price: 2200,
    category: "Amps",
    subcategory: null,
    condition: "Good",
    payment_methods: [],
    logistics: null,
    images: ["/marshall-jcm800-tube-amplifier.jpg"],
    location: "Chicago, IL",
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    for_trade: false,
    feedType: "price_drop",
    feedContext: "Price dropped from $2,800",
    feedTimestamp: new Date(Date.now() - 1000 * 60 * 45),
    published_groups: [
      { id: "g5", name: "Amp Collectors", slug: "amp-collectors", description: null, icon: "🔊", member_count: 1850 },
    ],
  },
  {
    id: "feed-3",
    seller_id: "user3",
    title: "Strymon BigSky Reverb",
    subtitle: "New from pedal_collector",
    description: null,
    price: 450,
    category: "Pedals",
    subcategory: null,
    condition: "Excellent",
    payment_methods: [],
    logistics: null,
    images: ["/strymon-bigsky-reverb-pedal.jpg"],
    location: "Portland, OR",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    for_trade: true,
    feedType: "user_listing",
    feedContext: "New from pedal_collector",
    feedTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    published_groups: [
      { id: "g4", name: "Pedal Traders", slug: "pedal-traders", description: null, icon: "🎛️", member_count: 1200 },
    ],
  },
  {
    id: "feed-4",
    seller_id: "user4",
    title: "Klon Centaur Silver",
    subtitle: 'Matches "klon centaur"',
    description: null,
    price: 4800,
    category: "Pedals",
    subcategory: null,
    condition: "Mint",
    payment_methods: [],
    logistics: null,
    images: ["/klon-centaur-gold-overdrive-pedal.jpg"],
    location: "Austin, TX",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    for_trade: false,
    feedType: "search_match",
    feedContext: 'Matches "klon centaur"',
    feedTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
    published_groups: [
      { id: "g4", name: "Pedal Traders", slug: "pedal-traders", description: null, icon: "🎛️", member_count: 1200 },
    ],
  },
  {
    id: "feed-5",
    seller_id: "user5",
    title: "Gibson Les Paul '59",
    subtitle: "Price dropped from $5,200",
    description: null,
    price: 4500,
    category: "Guitars",
    subcategory: null,
    condition: "Excellent",
    payment_methods: [],
    logistics: null,
    images: ["/gibson-les-paul-1959-vintage-sunburst-guitar.jpg"],
    location: "Nashville, TN",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    for_trade: true,
    feedType: "price_drop",
    feedContext: "Price dropped from $5,200",
    feedTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
    published_groups: [
      { id: "g1", name: "Gibson Guild", slug: "gibson-guild", description: null, icon: "🎸", member_count: 2800 },
      { id: "g2", name: "Vintage Gear", slug: "vintage-gear", description: null, icon: "🎼", member_count: 980 },
    ],
  },
  {
    id: "feed-6",
    seller_id: "user6",
    title: "Fender Twin Reverb '65",
    subtitle: "New from amp_collector",
    description: null,
    price: 3200,
    category: "Amps",
    subcategory: null,
    condition: "Very Good",
    payment_methods: [],
    logistics: null,
    images: ["/fender-twin-reverb-amp.jpg"],
    location: "Seattle, WA",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    for_trade: false,
    feedType: "user_listing",
    feedContext: "New from amp_collector",
    feedTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
    published_groups: [
      { id: "g5", name: "Amp Collectors", slug: "amp-collectors", description: null, icon: "🔊", member_count: 1850 },
    ],
  },
  {
    id: "feed-7",
    seller_id: "user7",
    title: "1962 Fender Stratocaster",
    subtitle: "Added to Vintage Guitars",
    description: null,
    price: 28000,
    category: "Guitars",
    subcategory: null,
    condition: "Very Good",
    payment_methods: [],
    logistics: null,
    images: ["/vintage-fender-stratocaster-guitar.jpg"],
    location: "Los Angeles, CA",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    for_trade: true,
    feedType: "collection_update",
    feedContext: "Added to Vintage Guitars",
    feedTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    published_groups: [
      { id: "g3", name: "Fender Fans", slug: "fender-fans", description: null, icon: "🎸", member_count: 3400 },
      { id: "g2", name: "Vintage Gear", slug: "vintage-gear", description: null, icon: "🎼", member_count: 980 },
    ],
  },
  {
    id: "feed-8",
    seller_id: "user8",
    title: "Eventide H9 Max",
    subtitle: "New from pedal_collector",
    description: null,
    price: 550,
    category: "Pedals",
    subcategory: null,
    condition: "Mint",
    payment_methods: [],
    logistics: null,
    images: ["/eventide-h9-max-pedal.jpg"],
    location: "Denver, CO",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    for_trade: true,
    feedType: "user_listing",
    feedContext: "New from pedal_collector",
    feedTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 36),
    published_groups: [
      { id: "g4", name: "Pedal Traders", slug: "pedal-traders", description: null, icon: "🎛️", member_count: 1200 },
    ],
  },
  {
    id: "feed-9",
    seller_id: "user9",
    title: "Fender Precision Bass '75",
    subtitle: 'Matches "vintage fender bass"',
    description: null,
    price: 4200,
    category: "Bass",
    subcategory: null,
    condition: "Good",
    payment_methods: [],
    logistics: null,
    images: ["/fender-precision-bass-1975-vintage.jpg"],
    location: "Philadelphia, PA",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    for_trade: false,
    feedType: "search_match",
    feedContext: 'Matches "vintage fender bass"',
    feedTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    published_groups: [
      { id: "g3", name: "Fender Fans", slug: "fender-fans", description: null, icon: "🎸", member_count: 3400 },
    ],
  },
  {
    id: "feed-10",
    seller_id: "user10",
    title: "Boss DD-500 Digital Delay",
    subtitle: "Price dropped from $350",
    description: null,
    price: 280,
    category: "Pedals",
    subcategory: null,
    condition: "Excellent",
    payment_methods: [],
    logistics: null,
    images: ["/boss-dd-500-digital-delay-pedal.jpg"],
    location: "Miami, FL",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    for_trade: true,
    feedType: "price_drop",
    feedContext: "Price dropped from $350",
    feedTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
    published_groups: [
      { id: "g4", name: "Pedal Traders", slug: "pedal-traders", description: null, icon: "🎛️", member_count: 1200 },
    ],
  },
]

export function FeedTab() {
  const [filter, setFilter] = useState<FilterType>("all")
  const [sortBy, setSortBy] = useState<SortType>("newest")

  const filteredAndSortedItems = useMemo(() => {
    let items = [...demoFeedItems]

    // Filter
    if (filter !== "all") {
      items = items.filter((item) => {
        if (filter === "searches") return item.feedType === "search_match"
        if (filter === "price_drops") return item.feedType === "price_drop"
        if (filter === "collections") return item.feedType === "collection_update"
        if (filter === "users") return item.feedType === "user_listing"
        return true
      })
    }

    // Sort
    switch (sortBy) {
      case "newest":
        items.sort((a, b) => (b.feedTimestamp?.getTime() || 0) - (a.feedTimestamp?.getTime() || 0))
        break
      case "oldest":
        items.sort((a, b) => (a.feedTimestamp?.getTime() || 0) - (b.feedTimestamp?.getTime() || 0))
        break
      case "price_high":
        items.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case "price_low":
        items.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
    }

    return items
  }, [filter, sortBy])

  const currentFilterLabel = filterOptions.find((opt) => opt.value === filter)?.label || "All Activity"
  const currentSortLabel = sortOptions.find((opt) => opt.value === sortBy)?.label || "Sort"

  return (
    <div>
      {/* Filter and Sort Controls */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{filteredAndSortedItems.length} updates</span>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors text-sm">
                <span>{currentFilterLabel}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {filterOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    {option.icon}
                    {option.label}
                  </span>
                  {filter === option.value && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            
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
        </div>
      </div>

      {/* Feed Items Grid */}
      {filteredAndSortedItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAndSortedItems.map((item) => (
            <DiscoverListingCard 
              key={item.id} 
              listing={item} 
              viewMode="grid" 
              isFollowing={item.feedType === "price_drop"}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No activity yet</h3>
          <p className="text-sm text-muted-foreground">
            Follow items, collections, users, or save searches to see updates here
          </p>
        </div>
      )}
    </div>
  )
}
