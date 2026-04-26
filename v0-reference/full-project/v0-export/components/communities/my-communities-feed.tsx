"use client"

import React from "react"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Package, Repeat2, MessageSquare, Megaphone, Clock, TrendingUp, ChevronDown, DollarSign, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { demoCommunitiesEnhanced } from "@/lib/demo-data"

type FeedItemType = "listing" | "trade" | "reply" | "announcement"
type SortOption = "newest" | "trending"

interface FeedItem {
  id: string
  type: FeedItemType
  communityId: string
  communityName: string
  communitySlug: string
  communityIcon?: string
  title: string
  preview: string
  timestamp: Date
  image?: string
  price?: number
  engagement?: number
  user?: {
    name: string
    avatar?: string
  }
}

// Demo feed data
const demoFeedItems: FeedItem[] = [
  {
    id: "feed-1",
    type: "listing",
    communityId: "1",
    communityName: "Vintage Guitars NYC",
    communitySlug: "vintage-guitars-nyc",
    communityIcon: "🎸",
    title: "1965 Fender Stratocaster - Sunburst Original",
    preview: "All original electronics, nitro finish in excellent condition. Comes with original hardshell case.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    image: "/vintage-fender-stratocaster-guitar.jpg",
    price: 12500,
    engagement: 24,
  },
  {
    id: "feed-2",
    type: "announcement",
    communityId: "1",
    communityName: "Vintage Guitars NYC",
    communitySlug: "vintage-guitars-nyc",
    communityIcon: "🎸",
    title: "Community Meetup This Saturday",
    preview: "Join us at the Brooklyn Guitar Show - booth 42 for live demos and gear trading.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    engagement: 47,
  },
  {
    id: "feed-3",
    type: "listing",
    communityId: "2",
    communityName: "Pedal Traders",
    communitySlug: "pedal-traders",
    communityIcon: "🎛️",
    title: "Strymon Timeline - Mint Condition",
    preview: "Includes original box, power supply, and manual. Used only in smoke-free home studio.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    image: "/strymon-bigsky-reverb-pedal.jpg",
    price: 425,
    engagement: 12,
  },
  {
    id: "feed-4",
    type: "reply",
    communityId: "3",
    communityName: "Amp Enthusiasts",
    communitySlug: "amp-enthusiasts",
    communityIcon: "🔊",
    title: "Best tubes for Fender amps?",
    preview: "tube_guru: JJ 6L6GC tubes have been incredible in my Twin Reverb. Warm tone without being muddy.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    engagement: 31,
  },
  {
    id: "feed-5",
    type: "trade",
    communityId: "1",
    communityName: "Vintage Guitars NYC",
    communitySlug: "vintage-guitars-nyc",
    communityIcon: "🎸",
    title: "Trade Completed: '72 Telecaster for '68 Les Paul Jr",
    preview: "After months of searching, found the perfect trade partner. Fair deal all around.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
    image: "/gibson-les-paul-1959-vintage-electric-guitar.jpg",
    engagement: 89,
  },
  {
    id: "feed-6",
    type: "listing",
    communityId: "2",
    communityName: "Pedal Traders",
    communitySlug: "pedal-traders",
    communityIcon: "🎛️",
    title: "Boss CE-1 Chorus Ensemble - Vintage 1976",
    preview: "The original rack chorus. Fully serviced by Analog Man last year with new caps.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10),
    image: "/boss-dd-500-digital-delay-pedal.jpg",
    price: 1800,
    engagement: 56,
  },
]

function formatTimestamp(date: Date) {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

// Type config for badges and placeholder icons
const typeConfig: Record<FeedItemType, { label: string; icon: React.ReactNode; metaIcon: React.ReactNode; bgClass: string; iconColor: string }> = {
  listing: { 
    label: "Listing", 
    icon: <Package className="h-6 w-6" />, 
    metaIcon: <DollarSign className="h-3.5 w-3.5" />,
    bgClass: "bg-green-500/10 text-green-500",
    iconColor: "text-green-600"
  },
  trade: { 
    label: "Trade", 
    icon: <Repeat2 className="h-6 w-6" />, 
    metaIcon: <Repeat2 className="h-3.5 w-3.5" />,
    bgClass: "bg-blue-500/10 text-blue-500",
    iconColor: "text-blue-600"
  },
  reply: { 
    label: "Discussion", 
    icon: <MessageSquare className="h-6 w-6" />, 
    metaIcon: <MessageSquare className="h-3.5 w-3.5" />,
    bgClass: "bg-purple-500/10 text-purple-500",
    iconColor: "text-purple-600"
  },
  announcement: { 
    label: "Announcement", 
    icon: <Megaphone className="h-6 w-6" />, 
    metaIcon: <Megaphone className="h-3.5 w-3.5" />,
    bgClass: "bg-amber-500/10 text-amber-500",
    iconColor: "text-amber-600"
  },
}

// Minimal feed card emphasizing content
function FeedCard({ item }: { item: FeedItem }) {
  const hasImage = item.image
  const config = typeConfig[item.type]

  return (
    <Link
      href={`/communities/${item.communitySlug}`}
      className="group block py-4 border-b border-border hover:bg-muted/30 transition-colors"
    >
      <div className="flex gap-4">
        {/* Thumbnail - always present for visual balance */}
        <div className="relative w-20 h-20 shrink-0 rounded-md overflow-hidden">
          {hasImage ? (
            <Image
              src={item.image || "/placeholder.svg"}
              alt=""
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className={cn("w-full h-full flex items-center justify-center", config.bgClass)}>
              {config.icon}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Community & Meta */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span>{item.communityIcon}</span>
            <span className="font-medium">{item.communityName}</span>
            <span>·</span>
            <span>{formatTimestamp(item.timestamp)}</span>
          </div>

          {/* Title with Type Icon */}
          <div className="flex items-center gap-2 mb-1">
            {(item.type === "listing" || item.type === "trade") && (
              <span className={cn("inline-flex shrink-0", config.iconColor)} title={config.label}>
                {config.metaIcon}
              </span>
            )}
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {item.title}
            </h3>
          </div>

          {/* Preview */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {item.preview}
          </p>

          {/* Footer */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {item.price && (
              <span className="font-semibold text-foreground">${item.price.toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

type UpdateTypeFilter = "all" | "listing" | "trade" | "reply" | "announcement"

export function MyCommunitiesFeed() {
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null)
  const [showAllCommunities, setShowAllCommunities] = useState(false)
  const [updateTypeFilter, setUpdateTypeFilter] = useState<UpdateTypeFilter>("all")

  const myCommunities = demoCommunitiesEnhanced.filter((c) => c.is_member)
  const displayedCommunities = showAllCommunities ? myCommunities : myCommunities.slice(0, 6)
  const hasMoreCommunities = myCommunities.length > 6

  const filteredFeed = useMemo(() => {
    let items = [...demoFeedItems]

    if (selectedCommunity) {
      items = items.filter((item) => item.communityId === selectedCommunity)
    }

    if (updateTypeFilter !== "all") {
      items = items.filter((item) => item.type === updateTypeFilter)
    }

    if (sortBy === "newest") {
      return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    } else {
      return items.sort((a, b) => (b.engagement || 0) - (a.engagement || 0))
    }
  }, [sortBy, selectedCommunity, updateTypeFilter])

  if (myCommunities.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No communities yet</h3>
        <p className="text-sm text-muted-foreground mb-4">Join some communities to see activity here</p>
        <Link
          href="/communities?tab=discover"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Discover communities
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Community Filter Pills */}
      <div className="mb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCommunity(null)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors",
              selectedCommunity === null
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border hover:border-primary/50"
            )}
          >
            All
          </button>

          {displayedCommunities.map((community) => (
            <button
              key={community.id}
              onClick={() => setSelectedCommunity(community.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors",
                selectedCommunity === community.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border hover:border-primary/50"
              )}
            >
              <span className="text-base leading-none">{community.icon || "🏠"}</span>
              <span>{community.name}</span>
            </button>
          ))}

          {hasMoreCommunities && (
            <button
              onClick={() => setShowAllCommunities(!showAllCommunities)}
              className="px-3 py-1.5 rounded-md text-sm bg-card border border-border hover:border-primary/50 transition-colors whitespace-nowrap"
            >
              {showAllCommunities ? "Show less" : `+${myCommunities.length - 6} more`}
            </button>
          )}
        </div>
      </div>

      {/* Utility Bar - Type filter + Sort in one compact row */}
      <div className="flex items-center justify-between mb-4 py-2 border-b border-border">
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground mr-2">{filteredFeed.length} updates</span>
          
          {/* Type Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 px-2 py-1 text-sm rounded hover:bg-muted transition-colors">
                <Filter className="h-3 w-3 text-muted-foreground" />
                <span className={cn(
                  updateTypeFilter === "listing" && "text-green-600",
                  updateTypeFilter === "trade" && "text-blue-600",
                  updateTypeFilter === "all" && "text-muted-foreground",
                  (updateTypeFilter === "reply" || updateTypeFilter === "announcement") && "text-foreground"
                )}>
                  {updateTypeFilter === "all" ? "All posts" : 
                   updateTypeFilter === "listing" ? "For Sale" :
                   updateTypeFilter === "trade" ? "For Trade" :
                   updateTypeFilter === "reply" ? "Discussion" : "Announcements"}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
            <DropdownMenuItem onClick={() => setUpdateTypeFilter("all")} className="text-xs">
              All posts
            </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setUpdateTypeFilter("listing")} className="text-xs">
                <DollarSign className="h-3.5 w-3.5 mr-2 text-green-600" />
                <span className="text-green-600">For Sale</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setUpdateTypeFilter("trade")} className="text-xs">
                <Repeat2 className="h-3.5 w-3.5 mr-2 text-blue-600" />
                <span className="text-blue-600">For Trade</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setUpdateTypeFilter("reply")} className="text-xs">
                <MessageSquare className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                Discussion
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setUpdateTypeFilter("announcement")} className="text-xs">
                <Megaphone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                Announcements
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-colors">
              {sortBy === "newest" ? <Clock className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
              <span>{sortBy === "newest" ? "Newest" : "Trending"}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-28">
            <DropdownMenuItem onClick={() => setSortBy("newest")} className="text-xs">
              <Clock className="h-3.5 w-3.5 mr-2" />
              Newest
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("trending")} className="text-xs">
              <TrendingUp className="h-3.5 w-3.5 mr-2" />
              Trending
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Feed - Minimal Cards */}
      {filteredFeed.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">No updates yet from this community</p>
        </div>
      ) : (
        <div>
          {filteredFeed.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
