"use client"

import Link from "next/link"
import { Award, FolderHeart, FolderOpen, Heart, UserPlus } from "lucide-react"

import { DiscoverListingCard } from "@/components/discover-listing-card"
import { HomeSectionHeader } from "@/components/home/home-section-header"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { DiscoverListing } from "@/lib/types"

// Shared scroll container, kept locally to avoid exporting from feed-sections.
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
    <section className="mb-4">
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

function CarouselItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("w-[240px] flex-shrink-0 md:w-[260px]", className)}>
      {children}
    </div>
  )
}

// --- Featured Collections ---------------------------------------------------

type FeaturedCollection = {
  id: string
  name: string
  description?: string
  item_count: number
  is_wishlist?: boolean
  item_images: string[]
  curator: {
    name: string
    avatar: string
    collections_count: number
  }
  href: string
}

const featuredCollections: FeaturedCollection[] = [
  {
    id: "fc-1",
    name: "Pre-CBS Fenders",
    description: "Slab boards, nitro, and all the right serials.",
    item_count: 24,
    curator: {
      name: "VintageGearNYC",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
      collections_count: 7,
    },
    href: "/collections/pre-cbs-fenders",
    item_images: [
      "https://images.unsplash.com/photo-1550985616-10810253b84d?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=400&h=400&fit=crop",
    ],
  },
  {
    id: "fc-2",
    name: "Boutique Dirt Box",
    description: "Overdrives, fuzz, and the weird one-offs.",
    item_count: 38,
    curator: {
      name: "PedalboardNerd",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      collections_count: 4,
    },
    href: "/collections/boutique-dirt",
    item_images: [
      "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1558098329-a11cff621064?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1558098329-a11cff621064?w=400&h=400&fit=crop",
    ],
  },
  {
    id: "fc-3",
    name: "Tube Amp Hall of Fame",
    description: "The ones worth plugging into twice.",
    item_count: 17,
    curator: {
      name: "AmpCollector",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
      collections_count: 5,
    },
    href: "/collections/tube-amp-hof",
    item_images: [
      "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop",
    ],
  },
  {
    id: "fc-4",
    name: "Offset Obsessed",
    description: "Jazzmasters, Jaguars, Mustangs — all of it.",
    item_count: 29,
    curator: {
      name: "OffsetSociety",
      avatar:
        "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop",
      collections_count: 6,
    },
    href: "/collections/offset-obsessed",
    item_images: [
      "https://images.unsplash.com/photo-1550985616-10810253b84d?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1550985616-10810253b84d?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=400&h=400&fit=crop",
    ],
  },
]

function FeaturedCollectionCard({ collection }: { collection: FeaturedCollection }) {
  const gridImages = collection.item_images.slice(0, 4)

  return (
    <Link
      href={collection.href}
      className="group block overflow-hidden rounded-lg border border-border bg-card text-left transition-colors hover:border-primary/50"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {gridImages.length > 0 ? (
          <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-0.5">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="overflow-hidden bg-secondary">
                {gridImages[index] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={gridImages[index] || "/placeholder.svg"}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-secondary/50" />
                )}
              </div>
            ))}
          </div>
        ) : collection.is_wishlist ? (
          <div className="flex h-full w-full items-center justify-center">
            <Heart className="h-12 w-12 text-chart-5/50" />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <FolderOpen className="h-12 w-12 text-primary/50" />
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="truncate font-medium text-foreground transition-colors group-hover:text-primary">
          {collection.name}
        </h3>
        {collection.description ? (
          <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
            {collection.description}
          </p>
        ) : null}

        <p className="mt-1 text-xs text-muted-foreground">
          {collection.item_count} items
        </p>

        <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
          <div className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full bg-secondary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={collection.curator.avatar || "/placeholder.svg"}
              alt={collection.curator.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-foreground">
              {collection.curator.name}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {collection.curator.collections_count} collections
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function FeaturedCollectionsSection() {
  return (
    <ScrollSection
      icon={FolderHeart}
      title="Featured Collections"
      actionLabel="See all"
      actionHref="/collections"
    >
      {featuredCollections.map((collection) => (
        <CarouselItem key={collection.id}>
          <FeaturedCollectionCard collection={collection} />
        </CarouselItem>
      ))}
    </ScrollSection>
  )
}

// --- Featured Users ---------------------------------------------------------

type FeaturedUser = {
  id: string
  name: string
  handle: string
  avatar: string
  location: string
  tagline: string
  followers: number
  listings: number
  collections: number
  verified?: boolean
}

const featuredUsers: FeaturedUser[] = [
  {
    id: "fu-1",
    name: "VintageGearNYC",
    handle: "vintagegearnyc",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
    location: "New York, NY",
    tagline: "Pre-CBS Fenders and the occasional Gretsch.",
    followers: 3240,
    listings: 42,
    collections: 7,
    verified: true,
  },
  {
    id: "fu-2",
    name: "PedalboardNerd",
    handle: "pedalboardnerd",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    location: "Austin, TX",
    tagline: "Trading boutique dirt, always. Klon KTR hoarder.",
    followers: 1870,
    listings: 28,
    collections: 4,
  },
  {
    id: "fu-3",
    name: "AcousticRoom",
    handle: "acousticroom",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    location: "Nashville, TN",
    tagline: "Pre-war Martins and pre-coffee acoustic tone.",
    followers: 2510,
    listings: 19,
    collections: 3,
    verified: true,
  },
  {
    id: "fu-4",
    name: "SynthSwap",
    handle: "synthswap",
    avatar:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop",
    location: "Brooklyn, NY",
    tagline: "Analog poly synths. Trade interests: DX7, Juno-60.",
    followers: 1420,
    listings: 31,
    collections: 5,
  },
  {
    id: "fu-5",
    name: "AmpCollector",
    handle: "ampcollectors",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    location: "Los Angeles, CA",
    tagline: "Blackface, brownface, tweed — the holy trinity.",
    followers: 2980,
    listings: 24,
    collections: 5,
    verified: true,
  },
]

function FeaturedUserCard({ user }: { user: FeaturedUser }) {
  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/50">
      <Link href={`/profile/${user.handle}`} className="block">
        <div className="flex items-center gap-3 p-4">
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-secondary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.avatar || "/placeholder.svg"}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <p className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                {user.name}
              </p>
              {user.verified ? (
                <span
                  aria-label="Verified"
                  className="inline-flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-[9px] font-bold text-primary"
                >
                  {"\u2713"}
                </span>
              ) : null}
            </div>
            <p className="truncate text-xs text-muted-foreground">{user.location}</p>
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 px-4 pb-4">
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {user.tagline}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>
              <span className="font-medium text-foreground">
                {user.followers.toLocaleString()}
              </span>{" "}
              followers
            </span>
            <span className="text-border">{"\u2022"}</span>
            <span>
              <span className="font-medium text-foreground">{user.collections}</span>{" "}
              collections
            </span>
          </div>

          <Button size="sm" variant="secondary" className="h-7 rounded-md px-2 text-xs">
            <UserPlus className="mr-1 h-3 w-3" />
            Follow
          </Button>
        </div>
      </div>
    </div>
  )
}

export function FeaturedUsersSection() {
  return (
    <ScrollSection
      icon={UserPlus}
      title="Featured Users"
      actionLabel="See all"
      actionHref="/discover/people"
    >
      {featuredUsers.map((user) => (
        <CarouselItem key={user.id} className="w-[260px] md:w-[280px]">
          <FeaturedUserCard user={user} />
        </CarouselItem>
      ))}
    </ScrollSection>
  )
}

// --- Staff Picks ------------------------------------------------------------

type StaffPickItem = DiscoverListing & { pick_note?: string }

const staffPickItems: StaffPickItem[] = [
  {
    id: "sp-1",
    title: "1965 Fender Jaguar — Lake Placid Blue",
    subtitle: "Matching headstock, original case.",
    price: 7800,
    images: [
      "https://images.unsplash.com/photo-1550985616-10810253b84d?w=400&h=400&fit=crop",
    ],
    for_trade: true,
    location: "Portland, OR",
    pick_note: "Editor's pick",
    published_groups: [
      { id: "fender", name: "Fender Fans", icon: "\u{1F3B8}" },
      { id: "offsets", name: "Offset Society", icon: "\u{1F3AF}" },
    ],
  },
  {
    id: "sp-2",
    title: "Klon KTR — First Run",
    subtitle: "With original box + documentation.",
    price: 1650,
    images: [
      "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&h=400&fit=crop",
    ],
    for_trade: false,
    location: "Chicago, IL",
    pick_note: "Rare find",
    published_groups: [
      { id: "boutique", name: "Boutique Pedals", icon: "\u2728" },
    ],
  },
  {
    id: "sp-3",
    title: "Martin D-18 (1955)",
    subtitle: "Braces unshaved, plays easy.",
    price: 6200,
    images: [
      "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=400&h=400&fit=crop",
    ],
    for_trade: true,
    location: "Nashville, TN",
    pick_note: "Curator pick",
    published_groups: [
      { id: "acoustic", name: "Acoustic Guild", icon: "\u{1FA95}" },
    ],
  },
  {
    id: "sp-4",
    title: "Roland Juno-60 (Serviced)",
    subtitle: "New battery, full cap job.",
    price: 2100,
    images: [
      "https://images.unsplash.com/photo-1558098329-a11cff621064?w=400&h=400&fit=crop",
    ],
    for_trade: true,
    location: "Brooklyn, NY",
    pick_note: "Staff favorite",
    published_groups: [
      { id: "synth", name: "Synth Swap", icon: "\u{1F3B9}" },
    ],
  },
  {
    id: "sp-5",
    title: "Vox AC15 Handwired",
    subtitle: "Barely used, home only.",
    price: 1450,
    images: [
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop",
    ],
    for_trade: false,
    location: "Seattle, WA",
    pick_note: "Editor's pick",
    published_groups: [{ id: "amps", name: "Amp Collectors", icon: "\u{1F50A}" }],
  },
]

export function StaffPicksSection() {
  return (
    <ScrollSection
      icon={Award}
      title="Staff Picks"
      actionLabel="See all"
      actionHref="/discover/staff-picks"
    >
      {staffPickItems.map(({ pick_note, ...item }) => (
        <CarouselItem key={item.id}>
          <div className="flex h-full flex-col gap-2">
            <DiscoverListingCard listing={item} />
            {pick_note ? (
              <div className="flex items-center gap-1.5 px-1 text-[11px] text-primary">
                <Award className="h-3 w-3" />
                <span className="truncate">{pick_note}</span>
              </div>
            ) : null}
          </div>
        </CarouselItem>
      ))}
    </ScrollSection>
  )
}
