"use client"

import { Package, Repeat2, Sparkles, TrendingUp } from "lucide-react"

import type { Collection, DiscoverListing } from "@/lib/types"
import { myItems } from "@/lib/mock/my-stuff"
import { ActionCard } from "@/components/home/action-card"
import { HomeSectionHeader } from "@/components/home/home-section-header"
import { CaughtUpDivider } from "@/components/caught-up-divider"
import { StatsCards } from "@/components/stats-cards"
import { SubnicheLogo } from "@/components/app-shell/subniche-logo"
import { ItemCard } from "@/components/item-card"
import { CollectionCard } from "@/components/collection-card"
import { DiscoverListingCard } from "@/components/discover-listing-card"
import { MyItemGridCard, MyItemRow, MyItemListHeader } from "@/components/my-stuff/my-item-card"
import { OnboardingChecklist } from "@/components/onboarding/onboarding-checklist"
import { GridDensitySelector } from "@/components/shared/grid-density-selector"
import { MarketTabs } from "@/components/shared/market-tabs"

import { DSSection } from "../ds-section"

/* ── Mock data ────────────────────────────────────────── */

const mockItemCards = [
  {
    id: "ds-item-1",
    title: "1962 Fender Stratocaster",
    image: "https://placehold.co/800x600/1a2035/d4a853?text=Guitar",
    href: "#",
    subtitle: "Sunburst finish, all original",
    location: "Brooklyn, NY",
    price: 45000,
    forSale: true,
    forTrade: false,
    collections: [{ id: "c1", name: "Vintage Guitars", icon: "🎸" }],
    isWatched: false,
  },
  {
    id: "ds-item-2",
    title: "Gibson Les Paul Standard",
    image: "https://placehold.co/800x600/1a2035/d4a853?text=Les+Paul",
    href: "#",
    subtitle: "Cherry Sunburst, 2019",
    location: "Austin, TX",
    price: 2800,
    forSale: false,
    forTrade: true,
    isWatched: true,
    match: {
      score: 9.2,
      matchedItems: [{ id: "m1", title: "Fender Telecaster", subtitle: "2018 American Pro" }],
    },
  },
  {
    id: "ds-item-3",
    title: "Marshall JCM800",
    image: "https://placehold.co/800x600/1a2035/d4a853?text=Marshall",
    href: "#",
    subtitle: "100W head, 1984",
    price: 1200,
    forSale: true,
    forTrade: true,
  },
]

const mockCollections: Collection[] = [
  {
    id: "col-1",
    name: "Vintage Guitars",
    description: "Pre-CBS Fenders and early Gibsons",
    visibility: "public",
    is_wishlist: false,
    item_count: 12,
    total_user_value: 125000,
    total_ai_value: 118000,
  },
  {
    id: "col-2",
    name: "Dream List",
    description: "Guitars I'd love to own someday",
    visibility: "private",
    is_wishlist: true,
    item_count: 8,
    total_user_value: 0,
  },
]

const mockCollectionImages = [
  "https://placehold.co/200x200/1a2035/d4a853?text=1",
  "https://placehold.co/200x200/1a2035/d4a853?text=2",
  "https://placehold.co/200x200/1a2035/d4a853?text=3",
  "https://placehold.co/200x200/1a2035/d4a853?text=4",
]

const mockDiscoverListing: DiscoverListing = {
  id: "dl-1",
  title: "1958 Gibson Flying V",
  subtitle: "Korina body, all original hardware",
  price: 85000,
  images: ["https://placehold.co/800x600/1a2035/d4a853?text=Flying+V"],
  location: "Nashville, TN",
  for_trade: true,
  is_private: false,
  published_groups: [
    { id: "g1", name: "Vintage Guitars USA", icon: "🎸" },
    { id: "g2", name: "Pre-1960 Gibsons", icon: "🎵" },
  ],
  matched_saved_search: "Gibson Flying V vintage",
}

const mockActionCards = [
  {
    avatar: "https://placehold.co/80x80/1a2035/d4a853?text=VH",
    username: "vinylhunter",
    actionType: "offer" as const,
    itemTitle: "1962 Fender Stratocaster",
    description: "Offered to trade their Telecaster American Pro for your Stratocaster",
    timestamp: "2m ago",
  },
  {
    avatar: "https://placehold.co/80x80/1a2035/d4a853?text=GC",
    username: "guitarcollector",
    actionType: "offer_accepted" as const,
    itemTitle: "Gibson Les Paul",
    description: "Accepted your trade offer on the Les Paul Standard",
    timestamp: "1h ago",
  },
  {
    avatar: "https://placehold.co/80x80/1a2035/d4a853?text=AM",
    username: "ampmaster",
    actionType: "message" as const,
    itemTitle: "Marshall JCM800",
    description: "Sent you a message about the Marshall head — asking about shipping",
    timestamp: "3h ago",
  },
  {
    avatar: "https://placehold.co/80x80/1a2035/d4a853?text=VK",
    username: "vintagekid",
    actionType: "counter" as const,
    itemTitle: "Fender Telecaster",
    description: "Sent a counter-offer: Telecaster + $200 cash for your Stratocaster",
    timestamp: "Yesterday",
  },
  {
    avatar: "https://placehold.co/80x80/1a2035/d4a853?text=RG",
    username: "relicgear",
    actionType: "cash_offer" as const,
    itemTitle: "Gibson SG",
    description: "Made a cash offer of $1,800 on your Gibson SG Standard",
    timestamp: "2d ago",
  },
  {
    avatar: "https://placehold.co/80x80/1a2035/d4a853?text=NT",
    username: "notetaker",
    actionType: "offer_declined" as const,
    itemTitle: "Fender Jazzmaster",
    description: "Declined your trade offer on the Jazzmaster",
    timestamp: "3d ago",
  },
]

/* ── Component ─────────────────────────────────────────── */

export function CustomSection() {
  return (
    <div className="space-y-12" id="custom-root">
      {/* Branding */}
      <DSSection id="custom-logo" title="SubnicheLogo" source="Custom">
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <SubnicheLogo width={117} height={36} light />
            <span className="text-[10px] text-muted-foreground">light=true (default)</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-lg bg-card px-4 py-3">
              <SubnicheLogo width={117} height={36} />
            </div>
            <span className="text-[10px] text-muted-foreground">light=false</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <SubnicheLogo width={64} height={20} light />
            <span className="text-[10px] text-muted-foreground">width=64</span>
          </div>
        </div>
      </DSSection>

      {/* ItemCard */}
      <DSSection id="custom-item-card" title="ItemCard" source="Custom">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockItemCards.map((props) => (
            <ItemCard key={props.id} {...props} />
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Variants: with watchlist toggle, match badge, collection chips, location, for-sale/trade status icons.
        </p>
      </DSSection>

      {/* CollectionCard */}
      <DSSection id="custom-collection-card" title="CollectionCard" source="Custom">
        <div className="space-y-6">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Grid view
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {mockCollections.map((col) => (
                <CollectionCard
                  key={col.id}
                  collection={col}
                  view="grid"
                  itemImages={mockCollectionImages}
                  href="#"
                />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              List view
            </p>
            <div className="space-y-2">
              {mockCollections.map((col) => (
                <CollectionCard
                  key={col.id}
                  collection={col}
                  view="list"
                  itemImages={mockCollectionImages}
                  href="#"
                />
              ))}
            </div>
          </div>
        </div>
      </DSSection>


      {/* DiscoverListingCard */}
      <DSSection id="custom-discover-card" title="DiscoverListingCard" source="Custom">
        <div className="space-y-6">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Grid view
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <DiscoverListingCard listing={mockDiscoverListing} viewMode="grid" />
              <DiscoverListingCard
                listing={{ ...mockDiscoverListing, id: "dl-2", is_private: true, published_groups: [] }}
                viewMode="grid"
              />
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              List view
            </p>
            <div className="space-y-2 max-w-lg">
              <DiscoverListingCard listing={mockDiscoverListing} viewMode="list" />
            </div>
          </div>
        </div>
      </DSSection>

      {/* MyItemGridCard & MyItemRow */}
      <DSSection id="custom-my-item-card" title="MyItemGridCard · MyItemRow" source="Custom">
        <div className="space-y-8">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Grid cards (owner view)
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {myItems.slice(0, 4).map((item) => (
                <MyItemGridCard key={item.id} item={item} />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              List rows (owner view)
            </p>
            <div className="space-y-2">
              <MyItemListHeader />
              {myItems.slice(0, 3).map((item) => (
                <MyItemRow key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      </DSSection>

      {/* ActionCard */}
      <DSSection id="custom-action-card" title="ActionCard" source="Custom">
        <p className="mb-4 text-xs text-muted-foreground">
          All six action types — shown in a horizontal scroll on mobile.
        </p>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {mockActionCards.map((props) => (
            <ActionCard key={props.username} {...props} />
          ))}
        </div>
      </DSSection>

      {/* Home utility components */}
      <DSSection id="custom-home-utils" title="HomeSectionHeader · StatsCards · CaughtUpDivider" source="Custom">
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              HomeSectionHeader
            </p>
            <div className="space-y-2">
              <HomeSectionHeader
                icon={<TrendingUp className="h-4 w-4 text-primary" />}
                title="Trending in Your Niche"
                href="#"
                ctaLabel="See all"
              />
              <HomeSectionHeader
                icon={<Sparkles className="h-4 w-4 text-primary" />}
                title="New Arrivals"
              />
              <HomeSectionHeader
                icon={<Repeat2 className="h-4 w-4 text-primary" />}
                title="Trade Matches"
                href="#"
                ctaLabel="View all matches"
              />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              StatsCards
            </p>
            <StatsCards />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              CaughtUpDivider
            </p>
            <CaughtUpDivider />
          </div>
        </div>
      </DSSection>

      {/* OnboardingChecklist */}
      <DSSection id="custom-onboarding" title="OnboardingChecklist" source="Custom">
        <div className="max-w-xl">
          <OnboardingChecklist />
        </div>
      </DSSection>

      {/* Shared: MarketTabs + GridDensitySelector */}
      <DSSection id="custom-shared" title="MarketTabs · GridDensitySelector" source="Custom">
        <div className="space-y-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              MarketTabs
            </p>
            <MarketTabs />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              GridDensitySelector
            </p>
            <GridDensitySelector />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Package icon (Lucide — used throughout)
            </p>
            <div className="flex items-center gap-4 text-muted-foreground">
              <Package className="h-4 w-4" />
              <Package className="h-5 w-5" />
              <Package className="h-6 w-6" />
              <Package className="h-8 w-8" />
              <Package className="h-4 w-4 text-primary" />
              <Package className="h-4 w-4 text-destructive" />
              <Package className="h-4 w-4 text-success" />
            </div>
          </div>
        </div>
      </DSSection>
    </div>
  )
}
