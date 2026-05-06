import { Heart, Layers, Search, TrendingUp, Zap, Users } from 'lucide-react'
import { HomeSectionHeader } from '@/components/home/home-section-header'
import { ItemCard } from '@/components/item-card'
import { CollectionCard } from '@/components/collection-card'
import type { Collection } from '@/lib/types'

/* ─── Trending Section ───────────────────────────────────────────────── */

const trendingListings = [
  {
    id: 'tr1',
    title: 'Fender Stratocaster',
    subtitle: '2020 American Pro II',
    price: 1450,
    location: 'Brooklyn, NY',
    forSale: true,
    image: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=400&h=300&fit=crop',
  },
  {
    id: 'tr2',
    title: 'Gibson Les Paul',
    subtitle: 'Standard, Honey Burst',
    price: 2100,
    location: 'Austin, TX',
    forSale: true,
    forTrade: true,
    image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=300&fit=crop',
  },
  {
    id: 'tr3',
    title: 'Strymon Timeline',
    subtitle: 'Near mint, all presets',
    price: 380,
    location: 'Portland, OR',
    forSale: true,
    image: 'https://images.unsplash.com/photo-1558098329-a11cff621064?w=400&h=300&fit=crop',
  },
  {
    id: 'tr4',
    title: 'PRS SE Custom 24',
    subtitle: 'Whale Blue, excellent',
    price: 740,
    location: 'Chicago, IL',
    forSale: true,
    image: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=400&h=300&fit=crop',
  },
  {
    id: 'tr5',
    title: 'Martin 000-15M',
    subtitle: 'Satin mahogany, like new',
    price: 680,
    location: 'Nashville, TN',
    forSale: true,
    forTrade: true,
    image: 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=400&h=300&fit=crop',
  },
]

export function TrendingSection() {
  return (
    <section className="mb-8">
      <HomeSectionHeader
        icon={<TrendingUp className="h-5 w-5 text-primary" />}
        title="Trending Now"
        href="/market?sort=trending"
        ctaLabel="See all"
      />
      <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:-mx-0 md:px-0">
        {trendingListings.map((item) => (
          <ItemCard
            key={item.id}
            id={item.id}
            image={item.image}
            title={item.title}
            subtitle={item.subtitle}
            price={item.price}
            location={item.location}
            forSale={item.forSale}
            forTrade={item.forTrade}
            href={`/listings/${item.id}`}
            className="w-[220px] flex-shrink-0 md:w-[240px]"
          />
        ))}
      </div>
    </section>
  )
}

/* ─── Just Listed ────────────────────────────────────────────────────── */

const justListedItems = [
  {
    id: 'jl1',
    title: 'Epiphone Casino',
    subtitle: 'Natural finish, P90s',
    price: 650,
    location: 'Seattle, WA',
    forSale: true,
    image: 'https://images.unsplash.com/photo-1605020420620-20c943cc4669?w=400&h=300&fit=crop',
  },
  {
    id: 'jl2',
    title: 'Ibanez RG550',
    subtitle: 'Road Flare Red, 1990',
    price: 850,
    location: 'Denver, CO',
    forSale: true,
    image: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=400&h=300&fit=crop',
  },
  {
    id: 'jl3',
    title: 'Boss DD-500',
    subtitle: 'Excellent, box + manual',
    price: 250,
    location: 'Brooklyn, NY',
    forSale: true,
    forTrade: true,
    image: 'https://images.unsplash.com/photo-1558098329-a11cff621064?w=400&h=300&fit=crop',
  },
  {
    id: 'jl4',
    title: 'Gretsch G2622',
    subtitle: 'Streamliner, Claret Burst',
    price: 420,
    location: 'Austin, TX',
    forSale: true,
    image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=300&fit=crop',
  },
  {
    id: 'jl5',
    title: 'Taylor 214ce',
    subtitle: 'Grand Auditorium, w/ case',
    price: 1100,
    location: 'Portland, OR',
    forSale: true,
    image: 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=400&h=300&fit=crop',
  },
]

export function JustListedSection() {
  return (
    <section className="mb-8">
      <HomeSectionHeader
        icon={<Zap className="h-5 w-5 text-primary" />}
        title="Just Listed"
        href="/market?sort=just-listed"
        ctaLabel="See all"
      />
      <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:-mx-0 md:px-0">
        {justListedItems.map((item) => (
          <ItemCard
            key={item.id}
            id={item.id}
            image={item.image}
            title={item.title}
            subtitle={item.subtitle}
            price={item.price}
            location={item.location}
            forSale={item.forSale}
            forTrade={item.forTrade}
            href={`/listings/${item.id}`}
            className="w-[220px] flex-shrink-0 md:w-[240px]"
          />
        ))}
      </div>
    </section>
  )
}

/* ─── Saved Searches ────────────────────────────────────────────────── */

const savedSearches = [
  { id: 'ss1', label: 'Fender Telecaster under $1500', hits: 7 },
  { id: 'ss2', label: 'Strymon pedals', hits: 3 },
  { id: 'ss3', label: 'Vintage Gibsons', hits: 12 },
  { id: 'ss4', label: 'Acoustic guitars Portland', hits: 2 },
]

export function SavedSearchesSection() {
  return (
    <section className="mb-8">
      <HomeSectionHeader
        icon={<Search className="h-5 w-5 text-primary" />}
        title="Saved Searches"
        href="/market?tab=for-sale"
        ctaLabel="Manage"
      />
      <div className="flex flex-wrap gap-2">
        {savedSearches.map((s) => (
          <a
            key={s.id}
            href="/market?tab=for-sale"
            className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            {s.label}
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              {s.hits}
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}

/* ─── Followed Items ────────────────────────────────────────────────── */

const followedItems = [
  {
    id: 'fi1',
    title: '1961 ES-335',
    subtitle: 'Cherry, original PAFs',
    price: 12000,
    location: 'Nashville, TN',
    forSale: true,
    forTrade: true,
    image: 'https://images.unsplash.com/photo-1605020420620-20c943cc4669?w=400&h=300&fit=crop',
  },
  {
    id: 'fi2',
    title: 'Klon Centaur',
    subtitle: 'Gold, horsie, w/ box',
    price: 3800,
    location: 'Brooklyn, NY',
    forSale: true,
    image: 'https://images.unsplash.com/photo-1558098329-a11cff621064?w=400&h=300&fit=crop',
  },
  {
    id: 'fi3',
    title: 'Dumble ODS 50',
    subtitle: 'Clone by Howard Dumble',
    price: 7500,
    location: 'Los Angeles, CA',
    forSale: true,
    image: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=400&h=300&fit=crop',
  },
  {
    id: 'fi4',
    title: 'Pre-CBS Telecaster',
    subtitle: '1964, Dakota Red',
    price: 18000,
    location: 'Austin, TX',
    forSale: true,
    forTrade: true,
    image: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=400&h=300&fit=crop',
  },
]

export function FollowedItemsSection() {
  return (
    <section className="mb-8">
      <HomeSectionHeader
        icon={<Heart className="h-5 w-5 text-primary" />}
        title="Items You're Following"
        href="/market?sort=following"
        ctaLabel="See all"
      />
      <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:-mx-0 md:px-0">
        {followedItems.map((item) => (
          <ItemCard
            key={item.id}
            id={item.id}
            image={item.image}
            title={item.title}
            subtitle={item.subtitle}
            price={item.price}
            location={item.location}
            forSale={item.forSale}
            forTrade={item.forTrade}
            href={`/listings/${item.id}`}
            className="w-[220px] flex-shrink-0 md:w-[240px]"
          />
        ))}
      </div>
    </section>
  )
}

/* ─── Collections ───────────────────────────────────────────────────── */

const myCollectionsData: Array<Collection & { previewImages: string[] }> = [
  {
    id: 'mc1',
    name: 'My Wishlist',
    item_count: 8,
    is_wishlist: true,
    visibility: 'private',
    previewImages: [
      'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1550985616-10810253b84d?w=200&h=200&fit=crop',
    ],
  },
  {
    id: 'mc2',
    name: 'Pedalboard 2025',
    item_count: 12,
    visibility: 'public',
    previewImages: [
      'https://images.unsplash.com/photo-1558098329-a11cff621064?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=200&h=200&fit=crop',
    ],
  },
  {
    id: 'mc3',
    name: 'Dream Guitars',
    item_count: 5,
    visibility: 'private',
    previewImages: [
      'https://images.unsplash.com/photo-1605020420620-20c943cc4669?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=200&h=200&fit=crop',
    ],
  },
  {
    id: 'mc4',
    name: 'Vintage Stuff',
    item_count: 9,
    visibility: 'public',
    previewImages: [
      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1550985616-10810253b84d?w=200&h=200&fit=crop',
    ],
  },
]

export function CollectionsSection() {
  return (
    <section className="mb-8">
      <HomeSectionHeader
        icon={<Layers className="h-5 w-5 text-primary" />}
        title="Your Collections"
        href="/my-stuff?tab=collections"
        ctaLabel="Manage"
      />
      <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:-mx-0 md:px-0">
        {myCollectionsData.map((col) => (
          <CollectionCard
            key={col.id}
            collection={col}
            view="grid"
            itemImages={col.previewImages}
            href="/my-stuff?tab=collections"
            className="w-[180px] flex-shrink-0"
          />
        ))}
      </div>
    </section>
  )
}

/* ─── Communities ───────────────────────────────────────────────────── */

const myCommunities = [
  { id: 'cm1', name: 'Fender Fans', icon: '🎸', members: 4821, slug: 'fender-fans' },
  { id: 'cm2', name: 'Pedal Builders', icon: '🎛️', members: 2103, slug: 'pedal-builders' },
  { id: 'cm3', name: 'Acoustic Corner', icon: '🪕', members: 1560, slug: 'acoustic-corner' },
  { id: 'cm4', name: 'Shred Zone', icon: '⚡', members: 987, slug: 'shred-zone' },
  { id: 'cm5', name: 'Vintage Vibes', icon: '📻', members: 3241, slug: 'vintage-vibes' },
]

export function CommunitiesSection() {
  return (
    <section className="mb-8">
      <HomeSectionHeader
        icon={<Users className="h-5 w-5 text-primary" />}
        title="Your Communities"
        href="/communities"
        ctaLabel="Explore"
      />
      <div className="flex flex-wrap gap-3">
        {myCommunities.map((community) => (
          <a
            key={community.id}
            href="/communities"
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 transition-colors hover:border-primary/40"
          >
            <span className="text-lg leading-none">{community.icon}</span>
            <div>
              <p className="text-sm font-medium text-foreground">{community.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {community.members.toLocaleString('en-US')} members
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
