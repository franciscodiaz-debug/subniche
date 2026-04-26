"use client"

import { Search, Heart, Users, Bookmark, TrendingUp, Sparkles } from "lucide-react"
import { DiscoverListingCard } from "@/components/discover-listing-card"
import { HomeSectionHeader } from "@/components/home/home-section-header"
import type { DiscoverListing } from "@/lib/types"

// Shared scroll container component
function ScrollSection({
  icon: Icon,
  title,
  actionLabel = "See more",
  actionHref = "#",
  children,
}: {
  icon: React.ElementType
  title: string
  actionLabel?: string
  actionHref?: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-8">
      <HomeSectionHeader
        icon={<Icon className="h-5 w-5 text-primary" />}
        title={title}
        href={actionHref}
        ctaLabel={actionLabel}
      />
      <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:-mx-0 md:px-0">
        {children}
      </div>
    </section>
  )
}

// Fixed-width wrapper so the canonical card layout works inside horizontal scrollers
function CarouselItem({ children }: { children: React.ReactNode }) {
  return <div className="w-[240px] flex-shrink-0 md:w-[260px]">{children}</div>
}

// From Saved Searches
const savedSearchItems: DiscoverListing[] = [
  {
    id: "ss-1",
    title: "Fender Telecaster '72 Thinline",
    price: 1100,
    images: ["https://images.unsplash.com/photo-1550985616-10810253b84d?w=400&h=400&fit=crop"],
    for_trade: true,
    location: "Nashville, TN",
    matched_saved_search: "Telecaster under $1,200",
    published_groups: [{ id: "fender", name: "Fender Fans", icon: "🎸" }],
  },
  {
    id: "ss-2",
    title: "Squier Classic Vibe Tele",
    price: 420,
    images: ["https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=400&h=400&fit=crop"],
    for_trade: true,
    location: "Austin, TX",
    matched_saved_search: "Telecaster under $1,200",
    published_groups: [{ id: "fender", name: "Fender Fans", icon: "🎸" }],
  },
  {
    id: "ss-3",
    title: "Boss DD-7 Digital Delay",
    price: 130,
    images: ["https://images.unsplash.com/photo-1558098329-a11cff621064?w=400&h=400&fit=crop"],
    for_trade: true,
    location: "Seattle, WA",
    matched_saved_search: "Boss delay pedals",
    published_groups: [
      { id: "pedals", name: "Pedal Traders", icon: "🎛" },
      { id: "boss", name: "Boss Fans", icon: "🟢" },
    ],
  },
  {
    id: "ss-4",
    title: "Boss DM-2W Analog Delay",
    price: 175,
    images: ["https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&h=400&fit=crop"],
    for_trade: true,
    location: "Portland, OR",
    matched_saved_search: "Boss delay pedals",
    published_groups: [
      { id: "pedals", name: "Pedal Traders", icon: "🎛" },
      { id: "boss", name: "Boss Fans", icon: "🟢" },
    ],
  },
  {
    id: "ss-5",
    title: "Fender Blues Jr. IV",
    price: 550,
    images: ["https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop"],
    for_trade: true,
    location: "Denver, CO",
    matched_saved_search: "Fender amps",
    published_groups: [{ id: "amps", name: "Amp Collectors", icon: "🔊" }],
  },
]

export function SavedSearchesSection() {
  return (
    <ScrollSection icon={Search} title="From Saved Searches" actionLabel="Manage">
      {savedSearchItems.map((item) => (
        <CarouselItem key={item.id}>
          <DiscoverListingCard listing={item} />
        </CarouselItem>
      ))}
    </ScrollSection>
  )
}

// From Items You Follow
const followedUpdateLabels = {
  price_drop: "Price dropped",
  open_trades: "Open to trades",
  qa_reply: "Q&A reply",
  updated: "Updated",
} as const

type FollowedUpdateType = keyof typeof followedUpdateLabels

const followedItems: Array<DiscoverListing & { update_type: FollowedUpdateType }> = [
  {
    id: "fi-1",
    title: "Gibson Les Paul '59",
    price: 4500,
    images: ["https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop"],
    for_trade: true,
    location: "Nashville, TN",
    update_type: "price_drop",
    published_groups: [
      { id: "gibson", name: "Gibson Guild", icon: "🎸" },
      { id: "vintage", name: "Vintage Gear", icon: "🏛" },
    ],
  },
  {
    id: "fi-2",
    title: "Analogman King of Tone",
    price: 650,
    images: ["https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&h=400&fit=crop"],
    for_trade: true,
    location: "Brooklyn, NY",
    update_type: "open_trades",
    published_groups: [
      { id: "pedals", name: "Pedal Traders", icon: "🎛" },
      { id: "boutique", name: "Boutique Pedals", icon: "✨" },
    ],
  },
  {
    id: "fi-3",
    title: "Fender P-Bass '75 RI",
    price: 1800,
    images: ["https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=400&h=400&fit=crop"],
    for_trade: true,
    location: "Philadelphia, PA",
    update_type: "qa_reply",
    published_groups: [{ id: "bass", name: "Bass Players", icon: "🎸" }],
  },
  {
    id: "fi-4",
    title: "Sequential Prophet 6",
    price: 2200,
    images: ["https://images.unsplash.com/photo-1558098329-a11cff621064?w=400&h=400&fit=crop"],
    for_trade: false,
    location: "San Francisco, CA",
    update_type: "updated",
    published_groups: [{ id: "synth", name: "Synth Swap", icon: "🎹" }],
  },
]

export function FollowedItemsSection() {
  return (
    <ScrollSection icon={Heart} title="From Items You Follow" actionLabel="Manage">
      {followedItems.map(({ update_type, ...item }) => (
        <CarouselItem key={item.id}>
          <DiscoverListingCard
            listing={{ ...item, subtitle: followedUpdateLabels[update_type] }}
          />
        </CarouselItem>
      ))}
    </ScrollSection>
  )
}

// From Collections and People You Follow
const collectionItems: DiscoverListing[] = [
  {
    id: "cp-1",
    title: "MIJ Fender Jazzmaster '62 RI",
    subtitle: "Listed by @vintagegearnyc",
    price: 1350,
    images: ["https://images.unsplash.com/photo-1550985616-10810253b84d?w=400&h=400&fit=crop"],
    for_trade: true,
    location: "New York, NY",
    published_groups: [
      { id: "fender", name: "Fender Fans", icon: "🎸" },
      { id: "vintage", name: "Vintage Gear", icon: "🏛" },
    ],
  },
  {
    id: "cp-2",
    title: "Fender Blues Jr. IV",
    subtitle: "Added to Tube Amp Collectors",
    price: 550,
    images: ["https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=400&h=400&fit=crop"],
    for_trade: false,
    location: "Nashville, TN",
    published_groups: [{ id: "amps", name: "Amp Collectors", icon: "🔊" }],
  },
  {
    id: "cp-3",
    title: "Martin D-15M",
    subtitle: "Listed by @acousticdan",
    price: 1200,
    images: ["https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=400&h=400&fit=crop"],
    for_trade: true,
    location: "Austin, TX",
    published_groups: [{ id: "acoustic", name: "Acoustic Guild", icon: "🪕" }],
  },
  {
    id: "cp-4",
    title: "MIM Strat Olympic White",
    subtitle: "Added to Fender Fans",
    price: 650,
    images: ["https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=400&h=400&fit=crop"],
    for_trade: true,
    location: "Los Angeles, CA",
    published_groups: [{ id: "fender", name: "Fender Fans", icon: "🎸" }],
  },
]

export function CollectionsSection() {
  return (
    <ScrollSection icon={Users} title="From Collections and People You Follow" actionLabel="See more">
      {collectionItems.map((item) => (
        <CarouselItem key={item.id}>
          <DiscoverListingCard listing={item} />
        </CarouselItem>
      ))}
    </ScrollSection>
  )
}

// Most Recent From Your Communities
const communityItems: DiscoverListing[] = [
  {
    id: "co-1",
    title: "Boss DS-1 Keeley Mod",
    subtitle: "Listed 20m ago in Pedal Traders",
    price: 95,
    images: ["https://images.unsplash.com/photo-1558098329-a11cff621064?w=400&h=400&fit=crop"],
    for_trade: false,
    location: "Austin, TX",
    published_groups: [{ id: "pedals", name: "Pedal Traders", icon: "🎛" }],
  },
  {
    id: "co-2",
    title: "MIM Strat - Olympic White",
    subtitle: "Listed 35m ago in Fender Fans",
    price: 650,
    images: ["https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=400&h=400&fit=crop"],
    for_trade: false,
    location: "Dallas, TX",
    published_groups: [{ id: "fender", name: "Fender Fans", icon: "🎸" }],
  },
  {
    id: "co-3",
    title: "TC Electronic Polytune 3",
    subtitle: "Listed 55m ago in Pedal Traders",
    price: 75,
    images: ["https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&h=400&fit=crop"],
    for_trade: false,
    location: "Portland, OR",
    published_groups: [{ id: "pedals", name: "Pedal Traders", icon: "🎛" }],
  },
  {
    id: "co-4",
    title: "Ernie Ball Strings (10 sets)",
    subtitle: "Listed 1h ago in Guitar Gear Exchange",
    price: 45,
    images: ["https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop"],
    for_trade: false,
    location: "Chicago, IL",
    published_groups: [{ id: "gear", name: "Guitar Gear Exc...", icon: "🔧" }],
  },
]

export function CommunitiesSection() {
  return (
    <ScrollSection icon={Bookmark} title="Most Recent From Your Communities" actionLabel="See all communities">
      {communityItems.map((item) => (
        <CarouselItem key={item.id}>
          <DiscoverListingCard listing={item} />
        </CarouselItem>
      ))}
    </ScrollSection>
  )
}

// Trending Listings (after caught up divider)
const trendingItems: DiscoverListing[] = [
  {
    id: "tr-1",
    title: "1959 Gibson Les Paul Standard",
    subtitle: "Holy grail vintage burst",
    price: 285000,
    images: ["https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop"],
    for_trade: true,
    location: "Nashville, TN",
    published_groups: [{ id: "gibson", name: "Gibson Guild", icon: "🎸" }],
  },
  {
    id: "tr-2",
    title: "Klon Centaur Gold",
    subtitle: "Original gold horsie",
    price: 4500,
    images: ["https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&h=400&fit=crop"],
    for_trade: false,
    location: "Los Angeles, CA",
    published_groups: [{ id: "boutique", name: "Boutique Pedals", icon: "✨" }],
  },
  {
    id: "tr-3",
    title: "Fender Custom Shop '63 Strat",
    subtitle: "Heavy relic, sounds incredible",
    price: 4200,
    images: ["https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=400&h=400&fit=crop"],
    for_trade: true,
    location: "Austin, TX",
    published_groups: [{ id: "fender", name: "Fender Fans", icon: "🎸" }],
  },
  {
    id: "tr-4",
    title: "Dumble Overdrive Special",
    subtitle: "The legendary amp",
    price: 95000,
    images: ["https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=400&h=400&fit=crop"],
    for_trade: false,
    location: "Miami, FL",
    published_groups: [{ id: "amps", name: "Amp Collectors", icon: "🔊" }],
  },
]

export function TrendingSection() {
  return (
    <ScrollSection icon={TrendingUp} title="Trending Listings" actionLabel="See more">
      {trendingItems.map((item) => (
        <CarouselItem key={item.id}>
          <DiscoverListingCard listing={item} />
        </CarouselItem>
      ))}
    </ScrollSection>
  )
}

// Just Listed (after caught up divider)
const justListedItems: DiscoverListing[] = [
  {
    id: "jl-1",
    title: "EHX Big Muff Pi",
    subtitle: "Listed 6m ago",
    price: 85,
    images: ["https://images.unsplash.com/photo-1558098329-a11cff621064?w=400&h=400&fit=crop"],
    for_trade: true,
    location: "Chicago, IL",
    published_groups: [{ id: "pedals", name: "Pedal Traders", icon: "🎛" }],
  },
  {
    id: "jl-2",
    title: "PRS Custom 24",
    subtitle: "Listed 13m ago",
    price: 2800,
    images: ["https://images.unsplash.com/photo-1550985616-10810253b84d?w=400&h=400&fit=crop"],
    for_trade: false,
    location: "Seattle, WA",
    published_groups: [{ id: "amps", name: "Amp Collectors", icon: "🔊" }],
  },
  {
    id: "jl-3",
    title: "Orange Micro Terror",
    subtitle: "Listed 19m ago",
    price: 120,
    images: ["https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=400&h=400&fit=crop"],
    for_trade: true,
    location: "Denver, CO",
    published_groups: [{ id: "amps", name: "Amp Collectors", icon: "🔊" }],
  },
  {
    id: "jl-4",
    title: "Seymour Duncan JB/59 Set",
    subtitle: "Listed 26m ago",
    price: 150,
    images: ["https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop"],
    for_trade: false,
    location: "Portland, OR",
    published_groups: [{ id: "pedals", name: "Pedal Traders", icon: "🎛" }],
  },
]

export function JustListedSection() {
  return (
    <ScrollSection icon={Sparkles} title="Just Listed" actionLabel="See more">
      {justListedItems.map((item) => (
        <CarouselItem key={item.id}>
          <DiscoverListingCard listing={item} />
        </CarouselItem>
      ))}
    </ScrollSection>
  )
}
