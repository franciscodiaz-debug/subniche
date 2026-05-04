import type { Collection } from "@/lib/types"

export interface MyItem {
  id: string
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
}

export const myItemCollections: Array<{ id: string; name: string }> = [
  { id: "col-guitars", name: "My Guitars" },
  { id: "col-pedalboard", name: "Pedal Board" },
  { id: "col-dream", name: "Dream Guitars" },
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
    collection_id: null,
    location: "Brooklyn, NY",
  },
  {
    id: "mi-5",
    title: "Mystery Pickup Set",
    subtitle: "Unmarked humbuckers",
    price: null,
    images: ["https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=800&h=600&fit=crop"],
    for_sale: false,
    for_trade: false,
    sold: false,
    views: 0,
    saves: 0,
    messages: 0,
    updated_at: "Draft",
    collection_id: "col-dream",
    location: "Brooklyn, NY",
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
]

export const myCollections: Collection[] = [
  {
    id: "col-guitars",
    name: "My Guitars",
    description: "Vintage and modern guitars I own.",
    visibility: "public",
    item_count: 8,
    total_user_value: 62000,
    total_ai_value: 64500,
  },
  {
    id: "col-pedalboard",
    name: "Pedal Board",
    description: "Current pedalboard gear — drives, modulation, and time.",
    visibility: "public",
    item_count: 14,
    total_user_value: 8600,
    total_ai_value: 9200,
  },
  {
    id: "col-dream",
    name: "Dream Guitars",
    description: "Guitars I'm hunting for.",
    visibility: "private",
    is_wishlist: true,
    item_count: 5,
    total_user_value: 0,
    total_ai_value: 0,
  },
]

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
  "col-dream": [
    "https://images.unsplash.com/photo-1519508234439-4f23643125c1?w=400&h=400&fit=crop",
  ],
}
