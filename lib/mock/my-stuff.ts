import type { Collection } from "@/lib/types"

/**
 * Each user has exactly one Wishlist collection, seeded by default. It can't
 * be renamed, edited, or deleted. The id is namespaced by username so the
 * collections-context can find or seed the right one per user.
 */
export const wishlistIdFor = (username: string) => `wishlist-${username}`

/**
 * Wishlist-specific fields attached to a MyItem when it belongs to the
 * user's Wishlist collection. These describe what the user WANTS, not
 * what they have — target price they'd pay, where they found the item,
 * etc. Only set when `collection_id === wishlistIdFor(owner)`.
 */
export interface WishlistItemData {
  /** Price the user is willing to pay to acquire this item. */
  targetPrice: number | null
  /** Optional external link where the user found this item. */
  sourceUrl: string | null
  /** If false, the item only appears on the owner's own Looking For tab. */
  isPublic: boolean
}

export interface MyItem {
  id: string
  /** Owner of this item — needed when the store mixes items from multiple
   *  users (e.g. for visitor profile views). Defaults to the current user
   *  when omitted, matching the legacy fixtures. */
  owner_id?: string
  title: string
  subtitle?: string
  price: number | null
  images: string[]
  for_sale: boolean
  for_trade: boolean
  sold: boolean
  views: number
  saves: number
  messages: number
  updated_at: string
  collection_id: string | null
  location?: string
  /** Only present when the item belongs to a Wishlist collection. */
  wishlist?: WishlistItemData
}

export const myItemCollections: Array<{ id: string; name: string }> = [
  { id: "col-guitars", name: "My Guitars" },
  { id: "col-pedalboard", name: "Pedal Board" },
  { id: "wishlist-jek116", name: "Wishlist" },
]

export const myItems: MyItem[] = [
  {
    id: "mi-1",
    title: "1962 Fender Stratocaster",
    subtitle: "Sunburst finish, all original",
    price: 45000,
    images: ["https://images.unsplash.com/photo-1550985616-10810253b84d?w=800&h=600&fit=crop"],
    for_sale: true,
    for_trade: true,
    sold: false,
    views: 1204,
    saves: 92,
    messages: 24,
    updated_at: "2d ago",
    collection_id: "col-guitars",
    location: "Brooklyn, NY",
  },
  {
    id: "mi-2",
    title: "Gibson Les Paul Standard",
    subtitle: "Cherry Sunburst, 2019",
    price: 2800,
    images: ["https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800&h=600&fit=crop"],
    for_sale: false,
    for_trade: true,
    sold: false,
    views: 512,
    saves: 46,
    messages: 11,
    updated_at: "5d ago",
    collection_id: "col-guitars",
    location: "Brooklyn, NY",
  },
  {
    id: "mi-3",
    title: "Klon Centaur Overdrive",
    subtitle: "Gold horsie, original",
    price: 3500,
    images: ["https://images.unsplash.com/photo-1558098329-a11cff621064?w=800&h=600&fit=crop"],
    for_sale: true,
    for_trade: false,
    sold: false,
    views: 890,
    saves: 74,
    messages: 18,
    updated_at: "1d ago",
    collection_id: "col-pedalboard",
    location: "Brooklyn, NY",
  },
  {
    id: "mi-4",
    title: "Vintage Tube Amp",
    subtitle: "Needs restoration",
    price: 800,
    images: ["https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=600&fit=crop"],
    for_sale: false,
    for_trade: false,
    sold: false,
    views: 42,
    saves: 3,
    messages: 0,
    updated_at: "2w ago",
    collection_id: "col-guitars",
    location: "Brooklyn, NY",
  },
  {
    id: "mi-5",
    title: "1959 Fender Stratocaster",
    subtitle: "Slab board, any color — playability over originality",
    price: null,
    images: ["https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=800&h=600&fit=crop"],
    for_sale: false,
    for_trade: false,
    sold: false,
    views: 0,
    saves: 0,
    messages: 0,
    updated_at: "2w ago",
    collection_id: "wishlist-jek116",
    location: "Brooklyn, NY",
    wishlist: {
      targetPrice: 28000,
      sourceUrl: "https://reverb.com/item/example-1959-strat",
      isPublic: true,
    },
  },
  {
    id: "mi-7",
    title: "Dumble Overdrive Special",
    subtitle: "Any year, any cosmetic. Lifetime grail.",
    price: null,
    images: ["https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=600&fit=crop"],
    for_sale: false,
    for_trade: false,
    sold: false,
    views: 0,
    saves: 0,
    messages: 0,
    updated_at: "1w ago",
    collection_id: "wishlist-jek116",
    location: "Brooklyn, NY",
    wishlist: {
      targetPrice: 90000,
      sourceUrl: null,
      isPublic: true,
    },
  },
  {
    id: "mi-6",
    title: "Fuzz Face Reissue",
    subtitle: "Dunlop, NOS germanium",
    price: 220,
    images: ["https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=800&h=600&fit=crop"],
    for_sale: false,
    for_trade: false,
    sold: true,
    views: 342,
    saves: 19,
    messages: 6,
    updated_at: "Sold 3w ago",
    collection_id: "col-pedalboard",
    location: "Brooklyn, NY",
  },
  /* -----------------------------------------------------------------------
   * Items owned by other users. Linked to the cross-user collections above
   * so the visitor view has content to render when a viewer drills in from
   * another profile.
   * --------------------------------------------------------------------- */
  {
    id: "gc-1",
    title: "1962 Fender Stratocaster",
    subtitle: "Sunburst, all original",
    price: 48000,
    images: ["https://images.unsplash.com/photo-1550985616-10810253b84d?w=800&h=600&fit=crop"],
    for_sale: true,
    for_trade: true,
    sold: false,
    views: 0,
    saves: 0,
    messages: 0,
    updated_at: "Listed 1w ago",
    collection_id: "collection-1",
    location: "Nashville, TN",
  },
  {
    id: "gc-2",
    title: "1959 Gibson Les Paul Standard",
    subtitle: "Sunburst, original PAFs",
    price: 95000,
    images: ["https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800&h=600&fit=crop"],
    for_sale: false,
    for_trade: true,
    sold: false,
    views: 0,
    saves: 0,
    messages: 0,
    updated_at: "Added 2w ago",
    collection_id: "collection-1",
    location: "Nashville, TN",
  },
  {
    id: "gc-3",
    title: "1968 Gibson ES-335",
    subtitle: "Sunburst, trapeze tailpiece",
    price: 7800,
    images: ["https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=800&h=600&fit=crop"],
    for_sale: true,
    for_trade: false,
    sold: false,
    views: 0,
    saves: 0,
    messages: 0,
    updated_at: "Listed 4d ago",
    collection_id: "collection-1",
    location: "Nashville, TN",
  },
  {
    id: "gc-4",
    title: "Marshall JCM800 2203",
    subtitle: "1982, fully serviced",
    price: 2800,
    images: ["https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=600&fit=crop"],
    for_sale: true,
    for_trade: false,
    sold: false,
    views: 0,
    saves: 0,
    messages: 0,
    updated_at: "Listed 3d ago",
    collection_id: "collection-2",
    location: "Nashville, TN",
  },
  {
    id: "gc-5",
    title: "Fender '65 Deluxe Reverb Reissue",
    subtitle: "All-tube combo, recently serviced",
    price: 1150,
    images: ["https://images.unsplash.com/photo-1558098329-a11cff621064?w=800&h=600&fit=crop"],
    for_sale: false,
    for_trade: true,
    sold: false,
    views: 0,
    saves: 0,
    messages: 0,
    updated_at: "Added 1mo ago",
    collection_id: "collection-2",
    location: "Nashville, TN",
  },
  {
    id: "gc-6",
    title: "Klon KTR",
    subtitle: "Authentic gold, original box",
    price: 480,
    images: ["https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=800&h=600&fit=crop"],
    for_sale: false,
    for_trade: false,
    sold: false,
    views: 0,
    saves: 0,
    messages: 0,
    updated_at: "Added 2w ago",
    collection_id: "collection-3",
    location: "Nashville, TN",
  },
  {
    id: "gc-7",
    title: "Strymon TimeLine",
    subtitle: "Multi-mode delay, latest firmware",
    price: 380,
    images: ["https://images.unsplash.com/photo-1605020420620-20c943cc4669?w=800&h=600&fit=crop"],
    for_sale: false,
    for_trade: false,
    sold: false,
    views: 0,
    saves: 0,
    messages: 0,
    updated_at: "Added 3w ago",
    collection_id: "collection-3",
    location: "Nashville, TN",
  },
  /* -----------------------------------------------------------------------
   * Wishlist items owned by guitar_collector — used to demo the Looking
   * For tab on a visitor profile. All have isPublic=true so they show up
   * for any visitor.
   * --------------------------------------------------------------------- */
  {
    id: "gc-w1",
    owner_id: "guitar_collector",
    title: "1958 Gibson Flying V (Korina)",
    subtitle: "Original — willing to wait years for the right one",
    price: null,
    images: ["https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800&h=600&fit=crop"],
    for_sale: false,
    for_trade: false,
    sold: false,
    views: 0,
    saves: 0,
    messages: 0,
    updated_at: "Added 4d ago",
    collection_id: "wishlist-guitar_collector",
    location: "Nashville, TN",
    wishlist: {
      targetPrice: 250000,
      sourceUrl: null,
      isPublic: true,
    },
  },
  {
    id: "gc-w2",
    owner_id: "guitar_collector",
    title: "Fender Tweed Bassman 5F6-A",
    subtitle: "Original, working — any cosmetic condition",
    price: null,
    images: ["https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=600&fit=crop"],
    for_sale: false,
    for_trade: false,
    sold: false,
    views: 0,
    saves: 0,
    messages: 0,
    updated_at: "Added 1w ago",
    collection_id: "wishlist-guitar_collector",
    location: "Nashville, TN",
    wishlist: {
      targetPrice: 6500,
      sourceUrl: "https://reverb.com/item/example-bassman",
      isPublic: true,
    },
  },
  {
    id: "gc-w3",
    owner_id: "guitar_collector",
    title: "Klon Centaur (Gold, original horsie)",
    subtitle: "Original gold — not a reissue, not silver. Patient buyer.",
    price: null,
    images: ["https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800&h=600&fit=crop"],
    for_sale: false,
    for_trade: false,
    sold: false,
    views: 0,
    saves: 0,
    messages: 0,
    updated_at: "Added 2w ago",
    collection_id: "wishlist-guitar_collector",
    location: "Nashville, TN",
    wishlist: {
      targetPrice: 6000,
      sourceUrl: null,
      isPublic: true,
    },
  },
]

export const myCollections: Collection[] = [
  {
    id: "col-guitars",
    owner_id: "jek116",
    name: "My Guitars",
    description: "Vintage and modern guitars I own.",
    visibility: "public",
    item_count: 8,
    total_user_value: 62000,
    total_ai_value: 64500,
  },
  {
    id: "col-pedalboard",
    owner_id: "jek116",
    name: "Pedal Board",
    description: "Current pedalboard gear — drives, modulation, and time.",
    visibility: "public",
    item_count: 14,
    total_user_value: 8600,
    total_ai_value: 9200,
  },
  {
    id: "wishlist-jek116",
    owner_id: "jek116",
    name: "Wishlist",
    description: "Items you're hunting for.",
    visibility: "private",
    is_wishlist: true,
    item_count: 5,
    total_user_value: 0,
    total_ai_value: 0,
  },
  /* -----------------------------------------------------------------------
   * Collections owned by other users — used to demo the visitor view when
   * a user navigates from another profile to a collection detail page.
   * Ids match `profile-page-data.ts` so links from the profile resolve to
   * the same record here.
   * --------------------------------------------------------------------- */
  {
    id: "collection-1",
    owner_id: "guitar_collector",
    name: "Vintage Guitars",
    description: "Pre-1970 American classics",
    visibility: "public",
    is_wishlist: false,
    item_count: 8,
    total_user_value: 185000,
    total_ai_value: 192000,
  },
  {
    id: "collection-2",
    owner_id: "guitar_collector",
    name: "Tube Amplifiers",
    description: "Fender, Marshall, Vox",
    visibility: "public",
    is_wishlist: false,
    item_count: 5,
    total_user_value: 24500,
    total_ai_value: 26000,
  },
  {
    id: "collection-3",
    owner_id: "guitar_collector",
    name: "Pedal Board",
    description: "Current touring setup",
    visibility: "unlisted",
    is_wishlist: false,
    item_count: 12,
    total_user_value: 4800,
    total_ai_value: 5100,
  },
  {
    id: "wishlist-guitar_collector",
    owner_id: "guitar_collector",
    name: "Wishlist",
    description: "Items I'm hunting for.",
    visibility: "public",
    is_wishlist: true,
    item_count: 3,
    total_user_value: 0,
    total_ai_value: 0,
  },
]

export const collectionMeta: Record<
  string,
  { categories: string[]; subcategories: string[]; followingCountLabel: string }
> = {
  "col-guitars": {
    categories: ["Guitars"],
    subcategories: ["Electric", "Semi-Hollow"],
    followingCountLabel: "1.2K following",
  },
  "col-pedalboard": {
    categories: ["Effects"],
    subcategories: ["Drive", "Modulation"],
    followingCountLabel: "412 following",
  },
  "wishlist-jek116": {
    categories: ["Guitars"],
    subcategories: ["Electric", "Amps"],
    followingCountLabel: "86 following",
  },
}

export const collectionPreviewImages: Record<string, string[]> = {
  "col-guitars": [
    "https://images.unsplash.com/photo-1550985616-10810253b84d?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=400&h=400&fit=crop",
  ],
  "col-pedalboard": [
    "https://images.unsplash.com/photo-1558098329-a11cff621064?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1558098329-a11cff621064?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&h=400&fit=crop",
  ],
  "wishlist-jek116": [
    "https://images.unsplash.com/photo-1519508234439-4f23643125c1?w=400&h=400&fit=crop",
  ],
}
