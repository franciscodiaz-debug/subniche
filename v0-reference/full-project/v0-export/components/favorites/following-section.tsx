"use client"

import { useEffect } from "react"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowUpDown, Check, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { DiscoverListingCard } from "@/components/discover/discover-listing-card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FeedTab } from "./feed-tab"
import { SearchesTab } from "./searches-tab"
import type { Listing, Community } from "@/lib/types"

type SortOption = "newest" | "recent-updates" | "price-low" | "price-high"
type CollectionSortOption = "newest" | "recent-updates" | "value-high" | "items-high" | "avg-value-high"
type UserSortOption = "newest" | "items-high" | "followers-high"

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Date Added: Newest" },
  { value: "recent-updates", label: "Most Recent Activity" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
]

const collectionSortOptions: { value: CollectionSortOption; label: string }[] = [
  { value: "newest", label: "Date Added: Newest" },
  { value: "recent-updates", label: "Most Recent Activity" },
  { value: "value-high", label: "Value: High to Low" },
  { value: "items-high", label: "# Items: Most to Least" },
  { value: "avg-value-high", label: "Highest Avg. Item Value" },
]

const userSortOptions: { value: UserSortOption; label: string }[] = [
  { value: "newest", label: "Date Added: Newest" },
  { value: "items-high", label: "Items: Most to Least" },
  { value: "followers-high", label: "Followers: Most to Least" },
]

interface DiscoverListing extends Listing {
  for_trade?: boolean
  is_private?: boolean
  published_groups?: Community[]
}

// Demo data - following items (converted to DiscoverListing format)
const demoItems: DiscoverListing[] = [
  {
    id: "1",
    seller_id: "user1",
    title: "Gibson Les Paul '59",
    subtitle: "Price dropped",
    description: null,
    price: 4500,
    category: "Guitars",
    subcategory: null,
    condition: "Excellent",
    payment_methods: [],
    logistics: null,
    images: ["/gibson-les-paul-1959-vintage-sunburst-guitar.jpg"],
    location: "Nashville, TN",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    for_trade: true,
    published_groups: [
      { id: "g1", name: "Gibson Guild", slug: "gibson-guild", description: null, icon: "🎸", member_count: 2800 },
      { id: "g2", name: "Vintage Gear", slug: "vintage-gear", description: null, icon: "🎼", member_count: 980 },
    ],
  },
  {
    id: "2",
    seller_id: "user2",
    title: "Fender Telecaster '72 Thinline",
    subtitle: null,
    description: null,
    price: 1100,
    category: "Guitars",
    subcategory: null,
    condition: "Very Good",
    payment_methods: [],
    logistics: null,
    images: ["/fender-telecaster-1972-thinline-semi-hollow.jpg"],
    location: "Nashville, TN",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    for_trade: true,
    published_groups: [
      { id: "g3", name: "Fender Fans", slug: "fender-fans", description: null, icon: "🎸", member_count: 3400 },
    ],
  },
  {
    id: "3",
    seller_id: "user3",
    title: "Klon Centaur Gold",
    subtitle: null,
    description: null,
    price: 5200,
    category: "Pedals",
    subcategory: null,
    condition: "Mint",
    payment_methods: [],
    logistics: null,
    images: ["/klon-centaur-overdrive-pedal.jpg"],
    location: "Portland, OR",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    for_trade: false,
    published_groups: [
      { id: "g4", name: "Pedal Traders", slug: "pedal-traders", description: null, icon: "🎛️", member_count: 1200 },
    ],
  },
  {
    id: "4",
    seller_id: "user4",
    title: "Marshall JCM800 2203",
    subtitle: "Price dropped",
    description: null,
    price: 2200,
    category: "Amps",
    subcategory: null,
    condition: "Good",
    payment_methods: [],
    logistics: null,
    images: ["/marshall-jcm800-tube-amplifier.jpg"],
    location: "Chicago, IL",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    for_trade: false,
    published_groups: [
      { id: "g5", name: "Amp Collectors", slug: "amp-collectors", description: null, icon: "🔊", member_count: 1850 },
    ],
  },
  {
    id: "5",
    seller_id: "user5",
    title: "1963 Fender Stratocaster",
    subtitle: null,
    description: null,
    price: 32000,
    category: "Guitars",
    subcategory: null,
    condition: "Very Good",
    payment_methods: [],
    logistics: null,
    images: ["/vintage-fender-stratocaster-guitar.jpg"],
    location: "Austin, TX",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    for_trade: true,
    published_groups: [
      { id: "g3", name: "Fender Fans", slug: "fender-fans", description: null, icon: "🎸", member_count: 3400 },
      { id: "g2", name: "Vintage Gear", slug: "vintage-gear", description: null, icon: "🎼", member_count: 980 },
    ],
  },
  {
    id: "6",
    seller_id: "user6",
    title: "Boss DD-500 Digital Delay",
    subtitle: null,
    description: null,
    price: 280,
    category: "Pedals",
    subcategory: null,
    condition: "Excellent",
    payment_methods: [],
    logistics: null,
    images: ["/boss-dd-500-digital-delay-pedal.jpg"],
    location: "Seattle, WA",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    for_trade: true,
    published_groups: [
      { id: "g4", name: "Pedal Traders", slug: "pedal-traders", description: null, icon: "🎛️", member_count: 1200 },
    ],
  },
]

// Demo data - following collections
const demoCollections = [
  {
    id: "1",
    name: "Vintage Guitars",
    description: "Pre-1970 American classics",
    itemCount: 8,
    totalValue: 185000,
    owner: { name: "vintage_collector", avatar: "/vintage-collector-avatar.jpg" },
    images: [
      "/vintage-fender-stratocaster-guitar.jpg",
      "/gibson-les-paul-sunburst-guitar.jpg",
      "/fender-telecaster-1972-thinline-semi-hollow.jpg",
      "/prs-mccarty-guitar-charcoal-burst.jpg",
    ],
    newItems: 2,
  },
  {
    id: "2",
    name: "Effects Pedals",
    description: "Boutique and vintage",
    itemCount: 12,
    totalValue: 8400,
    owner: { name: "pedal_collector", avatar: "/pedal-collector.jpg" },
    images: [
      "/klon-centaur-overdrive-pedal.jpg",
      "/strymon-timeline-delay-pedal.jpg",
      "/boss-tuner-pedal.jpg",
      "/big-muff-fuzz-pedal.jpg",
    ],
    newItems: 0,
  },
  {
    id: "3",
    name: "Tube Amplifiers",
    description: "Fender, Marshall, Vox",
    itemCount: 5,
    totalValue: 24500,
    owner: { name: "amp_collector", avatar: "/amp-collector.jpg" },
    images: [
      "/fender-twin-reverb-amp.jpg",
      "/marshall-jcm800-amp-head.jpg",
      "/vox-ac30-hand-wired-amp.jpg",
      "/orange-rockerverb-50-amp.jpg",
    ],
    newItems: 1,
  },
]

// Demo data - following users
const demoUsers = [
  {
    id: "1",
    username: "vintage_collector",
    name: "Marcus Chen",
    avatar: "/vintage-collector-avatar.jpg",
    bio: "Specializing in pre-CBS Fender and vintage Gibson. Always happy to talk shop.",
    itemsCount: 24,
    collectionsCount: 5,
    followersCount: 342,
    recentItems: [
      "/gibson-les-paul-1959-vintage-electric-guitar.jpg",
      "/fender-precision-bass-1975-vintage.jpg",
      "/1960-gibson-es-335.jpg",
    ],
  },
  {
    id: "2",
    username: "pedal_collector",
    name: "Sarah Martinez",
    avatar: "/pedal-collector.jpg",
    bio: "Boutique pedal enthusiast. Building the perfect board.",
    itemsCount: 48,
    collectionsCount: 3,
    followersCount: 189,
    recentItems: [
      "/klon-centaur-gold-overdrive-pedal.jpg",
      "/strymon-bigsky-reverb-pedal.jpg",
      "/eventide-h9-max-pedal.jpg",
    ],
  },
  {
    id: "3",
    username: "amp_collector",
    name: "David Thompson",
    avatar: "/amp-collector.jpg",
    bio: "Vintage tube amp restoration and collecting since 1995.",
    itemsCount: 16,
    collectionsCount: 2,
    followersCount: 521,
    recentItems: [
      "/fender-twin-reverb-amp.jpg",
      "/marshall-jcm800-tube-amplifier.jpg",
      "/vox-ac30-hand-wired-amp.jpg",
    ],
  },
]

interface FollowingSectionProps {
  tab?: string
}

export function FollowingSection({ tab = "feed" }: FollowingSectionProps) {
  const [activeTab, setActiveTab] = useState(tab)
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [collectionSortBy, setCollectionSortBy] = useState<CollectionSortOption>("newest")
  const [userSortBy, setUserSortBy] = useState<UserSortOption>("newest")

  // Sync activeTab with prop changes
  useEffect(() => {
    setActiveTab(tab)
  }, [tab])
  const [isFollowingCollection1, setIsFollowingCollection1] = useState(true)
  const [isFollowingCollection2, setIsFollowingCollection2] = useState(true)
  const [isFollowingCollection3, setIsFollowingCollection3] = useState(true)

  const sortedItems = useMemo(() => {
    const items = [...demoItems]
    switch (sortBy) {
      case "newest":
        return items.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      case "recent-updates":
        return items.sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime())
      case "price-low":
        return items.sort((a, b) => (a.price || 0) - (b.price || 0))
      case "price-high":
        return items.sort((a, b) => (b.price || 0) - (a.price || 0))
      default:
        return items
    }
  }, [sortBy])

  const sortedCollections = useMemo(() => {
    const collections = [...demoCollections]
    switch (collectionSortBy) {
      case "newest":
      case "recent-updates":
        // In a real implementation, these would sort by actual dates
        return collections
      case "value-high":
        return collections.sort((a, b) => b.totalValue - a.totalValue)
      case "items-high":
        return collections.sort((a, b) => b.itemCount - a.itemCount)
      case "avg-value-high":
        return collections.sort((a, b) => (b.totalValue / b.itemCount) - (a.totalValue / a.itemCount))
      default:
        return collections
    }
  }, [collectionSortBy])

  const sortedUsers = useMemo(() => {
    const users = [...demoUsers]
    switch (userSortBy) {
      case "newest":
        return users
      case "items-high":
        return users.sort((a, b) => b.itemsCount - a.itemsCount)
      case "followers-high":
        return users.sort((a, b) => b.followersCount - a.followersCount)
      default:
        return users
    }
  }, [userSortBy])

  const currentSortLabel = sortOptions.find((opt) => opt.value === sortBy)?.label || "Sort"
  const currentCollectionSortLabel = collectionSortOptions.find((opt) => opt.value === collectionSortBy)?.label || "Sort"
  const currentUserSortLabel = userSortOptions.find((opt) => opt.value === userSortBy)?.label || "Sort"

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto mt-0 lg:py-4">
      {/* Page Title */}
      <h1 className="font-bold text-foreground text-2xl mb-5">Following</h1>

      {/* Simple Tab Navigation - matching profile page style */}
      <div className="mb-4">
        <div className="flex items-center gap-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("feed")}
            className={cn(
              "text-xl font-semibold transition-colors whitespace-nowrap pb-2",
              activeTab === "feed" ? "text-foreground border-b-2 border-b-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Updates
          </button>
          <div className="h-6 bg-border w-0.5" />
          <button
            onClick={() => setActiveTab("items")}
            className={cn(
              "text-xl font-semibold transition-colors whitespace-nowrap pb-2",
              activeTab === "items" ? "text-foreground border-b-2 border-b-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Items
          </button>
          <button
            onClick={() => setActiveTab("collections")}
            className={cn(
              "text-xl font-semibold transition-colors whitespace-nowrap pb-2",
              activeTab === "collections" ? "text-foreground border-b-2 border-b-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Collections
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={cn(
              "text-xl font-semibold transition-colors whitespace-nowrap pb-2",
              activeTab === "users" ? "text-foreground border-b-2 border-b-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("searches")}
            className={cn(
              "text-xl font-semibold transition-colors whitespace-nowrap pb-2",
              activeTab === "searches" ? "text-foreground border-b-2 border-b-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Searches
          </button>
        </div>
      </div>

      {/* Items Tab Content */}
      {activeTab === "items" && (
        <>
          {/* Sort Controls */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm text-muted-foreground">Following {sortedItems.length} items</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors text-sm">
                  <ArrowUpDown className="h-4 w-4" />
                  <span>{currentSortLabel}</span>
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
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedItems.map((item) => (
              <DiscoverListingCard key={item.id} listing={item} viewMode="grid" isFollowing={true} />
            ))}
          </div>
        </>
      )}

      {/* Collections Tab Content */}
      {activeTab === "collections" && (
        <>
          {/* Sort Controls */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm text-muted-foreground">Following {sortedCollections.length} collections</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors text-sm">
                  <ArrowUpDown className="h-4 w-4" />
                  <span>{currentCollectionSortLabel}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {collectionSortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setCollectionSortBy(option.value)}
                    className="flex items-center justify-between"
                  >
                    {option.label}
                    {collectionSortBy === option.value && <Check className="h-4 w-4 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Collections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedCollections.map((collection, index) => (
              <div key={collection.id} className="group bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors">
                <Link href={`/collection/${collection.id}`}>
                  {/* Image Grid */}
                  <div className="aspect-[16/10] bg-secondary overflow-hidden relative">
                    <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-0.5">
                      {[0, 1, 2, 3].map((imgIndex) => (
                        <div key={imgIndex} className="bg-secondary overflow-hidden">
                          {collection.images[imgIndex] ? (
                            <img
                              src={collection.images[imgIndex] || "/placeholder.svg"}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-secondary/50" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Follow button - upper right */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (index === 0) setIsFollowingCollection1(!isFollowingCollection1)
                        if (index === 1) setIsFollowingCollection2(!isFollowingCollection2)
                        if (index === 2) setIsFollowingCollection3(!isFollowingCollection3)
                      }}
                      className={cn(
                        "absolute top-2 right-2 p-1.5 rounded-full transition-all z-10",
                        "bg-background/80 backdrop-blur-sm hover:bg-background/90",
                        (index === 0 && isFollowingCollection1) || (index === 1 && isFollowingCollection2) || (index === 2 && isFollowingCollection3) ? "text-chart-5" : "text-muted-foreground hover:text-foreground"
                      )}
                      title={(index === 0 && isFollowingCollection1) || (index === 1 && isFollowingCollection2) || (index === 2 && isFollowingCollection3) ? "Unfollow collection" : "Follow collection"}
                    >
                      <Heart className={cn("h-4 w-4", ((index === 0 && isFollowingCollection1) || (index === 1 && isFollowingCollection2) || (index === 2 && isFollowingCollection3)) && "fill-current")} />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="font-medium text-foreground truncate">{collection.name}</h3>
                    {collection.description && (
                      <p className="text-sm text-muted-foreground truncate mt-0.5">{collection.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-muted-foreground">{collection.itemCount} items</p>
                      <p className="text-sm font-medium text-foreground">${collection.totalValue.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                      <img
                        src={collection.owner.avatar || "/placeholder.svg"}
                        alt={collection.owner.name}
                        className="w-5 h-5 rounded-full"
                      />
                      <span className="text-xs text-muted-foreground truncate">{collection.owner.name}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Users Tab Content */}
      {activeTab === "users" && (
        <>
          {/* Sort Controls */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm text-muted-foreground">Following {sortedUsers.length} users</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors text-sm">
                  <ArrowUpDown className="h-4 w-4" />
                  <span>{currentUserSortLabel}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {userSortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setUserSortBy(option.value)}
                    className="flex items-center justify-between"
                  >
                    {option.label}
                    {userSortBy === option.value && <Check className="h-4 w-4 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedUsers.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.id}`}
                className="group bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
              >
                <div className="h-24 bg-secondary overflow-hidden relative flex">
                  {user.recentItems.map((img, idx) => (
                    <div key={idx} className="flex-1 relative">
                      <Image
                        src={img || "/placeholder.svg"}
                        alt=""
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <Image
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.username}
                      width={48}
                      height={48}
                      className="rounded-full border-2 border-card"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{user.name || user.username}</h3>
                      <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                    </div>
                  </div>
                  {user.bio && <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{user.bio}</p>}
                  <div className="flex gap-4 mt-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{user.itemsCount}</p>
                      <p className="text-xs text-muted-foreground">Items</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{user.collectionsCount}</p>
                      <p className="text-xs text-muted-foreground">Collections</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{user.followersCount}</p>
                      <p className="text-xs text-muted-foreground">Followers</p>
                    </div>
                  </div>
                </div>
            </Link>
          ))}
        </div>
        </>
      )}

      {/* Feed Tab Content */}
      {activeTab === "feed" && <FeedTab />}

      {/* Searches Tab Content */}
      {activeTab === "searches" && <SearchesTab />}
    </div>
  )
}
