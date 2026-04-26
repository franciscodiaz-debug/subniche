import type {
  Community,
  DiscoverListing,
  InboundInterest,
  PerfectMatch,
} from "./types"

export const marketCommunities: Community[] = [
  { id: "fender-fans", name: "Fender Fans", icon: "🎸" },
  { id: "gibson-gang", name: "Gibson Gang", icon: "🎸" },
  { id: "acoustic-corner", name: "Acoustic Corner", icon: "🪕" },
  { id: "shred-zone", name: "Shred Zone", icon: "🤘" },
  { id: "vintage-vibes", name: "Vintage Vibes", icon: "🕰️" },
  { id: "pedalboard-club", name: "Pedalboard Club", icon: "🎛️" },
  { id: "amp-heads", name: "Amp Heads", icon: "🔊" },
]

export const marketCategories = [
  {
    id: "electric-guitars",
    label: "Electric Guitars",
    count: 1248,
    subcategories: [
      { id: "solid-body", label: "Solid Body", count: 624 },
      { id: "semi-hollow", label: "Semi-Hollow", count: 218 },
      { id: "hollow-body", label: "Hollow Body", count: 147 },
      { id: "offset", label: "Offset", count: 132 },
      { id: "baritone", label: "Baritone", count: 72 },
      { id: "extended-range", label: "Extended Range (7/8 String)", count: 55 },
    ],
  },
  {
    id: "acoustic-guitars",
    label: "Acoustic Guitars",
    count: 642,
    subcategories: [
      { id: "dreadnought", label: "Dreadnought", count: 198 },
      { id: "grand-auditorium", label: "Grand Auditorium / OM", count: 112 },
      { id: "concert", label: "Concert", count: 98 },
      { id: "parlor", label: "Parlor", count: 72 },
      { id: "jumbo", label: "Jumbo", count: 64 },
      { id: "twelve-string", label: "12-String", count: 48 },
      { id: "classical", label: "Classical / Nylon", count: 32 },
      { id: "travel", label: "Travel / Mini", count: 18 },
    ],
  },
  {
    id: "amplifiers",
    label: "Amplifiers",
    count: 489,
    subcategories: [
      { id: "tube-combo", label: "Tube Combos", count: 142 },
      { id: "modeling", label: "Modeling Amps", count: 96 },
      { id: "solid-state-combo", label: "Solid State Combos", count: 87 },
      { id: "amp-heads", label: "Amp Heads", count: 62 },
      { id: "bass", label: "Bass Amps", count: 42 },
      { id: "cabinets", label: "Cabinets", count: 38 },
      { id: "acoustic-amps", label: "Acoustic Amps", count: 22 },
    ],
  },
  {
    id: "effects",
    label: "Effects Pedals",
    count: 936,
    subcategories: [
      { id: "overdrive", label: "Overdrive & Boost", count: 218 },
      { id: "reverb", label: "Reverb", count: 146 },
      { id: "delay", label: "Delay", count: 138 },
      { id: "distortion", label: "Distortion", count: 132 },
      { id: "modulation", label: "Modulation", count: 124 },
      { id: "fuzz", label: "Fuzz", count: 88 },
      { id: "compression", label: "Compression", count: 42 },
      { id: "pitch", label: "Pitch & Octave", count: 28 },
      { id: "multi-effects", label: "Multi-Effects", count: 20 },
    ],
  },
]

export const marketBrands = [
  { value: "fender", label: "Fender", count: 423 },
  { value: "gibson", label: "Gibson", count: 387 },
  { value: "martin", label: "Martin", count: 156 },
  { value: "taylor", label: "Taylor", count: 142 },
  { value: "prs", label: "PRS", count: 98 },
  { value: "ibanez", label: "Ibanez", count: 167 },
  { value: "gretsch", label: "Gretsch", count: 89 },
  { value: "rickenbacker", label: "Rickenbacker", count: 54 },
]

export const marketConditions = [
  { value: "new", label: "New", count: 312 },
  { value: "like-new", label: "Like New", count: 287 },
  { value: "excellent", label: "Excellent", count: 423 },
  { value: "good", label: "Good", count: 198 },
  { value: "fair", label: "Fair", count: 76 },
]

export const marketListings: DiscoverListing[] = [
  {
    id: "ml-1",
    title: "Fender American Pro II Stratocaster",
    subtitle: "Sunburst — 2022, near mint",
    price: 1749,
    location: "Austin, TX",
    images: [
      "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=600&h=600&fit=crop",
    ],
    for_trade: true,
    published_groups: [marketCommunities[0], marketCommunities[4]],
  },
  {
    id: "ml-2",
    title: "Gibson Les Paul Standard '50s",
    subtitle: "Gold Top — 2023",
    price: 2499,
    location: "Nashville, TN",
    images: [
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&h=600&fit=crop",
    ],
    for_trade: true,
    published_groups: [marketCommunities[1], marketCommunities[4]],
  },
  {
    id: "ml-3",
    title: "Martin D-28 Acoustic",
    subtitle: "Solid Sitka, 2020",
    price: 3199,
    location: "Denver, CO",
    images: [
      "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=600&h=600&fit=crop",
    ],
    for_trade: false,
    published_groups: [marketCommunities[2]],
  },
  {
    id: "ml-4",
    title: "Taylor 814ce Builder's Edition",
    subtitle: "V-Class bracing, natural",
    price: 3899,
    location: "Portland, OR",
    images: [
      "https://images.unsplash.com/photo-1605020420620-20c943cc4669?w=600&h=600&fit=crop",
    ],
    for_trade: false,
    published_groups: [marketCommunities[2]],
  },
  {
    id: "ml-5",
    title: "PRS Custom 24 10-Top",
    subtitle: "Pattern Neck — Cobalt Blue",
    price: 3499,
    location: "Seattle, WA",
    images: [
      "https://images.unsplash.com/photo-1550985616-10810253b84d?w=600&h=600&fit=crop",
    ],
    for_trade: true,
    published_groups: [marketCommunities[0], marketCommunities[1]],
    matched_saved_search: "PRS under $4k",
  },
  {
    id: "ml-6",
    title: "Mesa Boogie Dual Rectifier",
    subtitle: "100W Head, used",
    price: 1800,
    location: "Los Angeles, CA",
    images: [
      "https://images.unsplash.com/photo-1558098329-a11cff621064?w=600&h=600&fit=crop",
    ],
    for_trade: true,
    published_groups: [marketCommunities[6]],
  },
  {
    id: "ml-7",
    title: "Strymon BigSky Reverb",
    subtitle: "Mint, with box",
    price: 479,
    location: "Brooklyn, NY",
    images: [
      "https://images.unsplash.com/photo-1535225939926-e62b7c8f1b39?w=600&h=600&fit=crop",
    ],
    for_trade: false,
    published_groups: [marketCommunities[5]],
  },
  {
    id: "ml-8",
    title: "Fender '65 Twin Reverb Reissue",
    subtitle: "85W tube combo",
    price: 1699,
    location: "Chicago, IL",
    images: [
      "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=600&h=600&fit=crop",
    ],
    for_trade: true,
    published_groups: [marketCommunities[6], marketCommunities[0]],
  },
  {
    id: "ml-9",
    title: "Rickenbacker 360 Fireglo",
    subtitle: "Excellent condition",
    price: 2299,
    location: "Boston, MA",
    images: [
      "https://images.unsplash.com/photo-1556449895-a33c9dba33dd?w=600&h=600&fit=crop",
    ],
    for_trade: true,
    is_private: true,
    published_groups: [marketCommunities[4]],
  },
  {
    id: "ml-10",
    title: "Gretsch G6120T-55 Vintage Select",
    subtitle: "Hollow Body — Orange Stain",
    price: 3299,
    location: "Memphis, TN",
    images: [
      "https://images.unsplash.com/photo-1519508234439-4f23643125c1?w=600&h=600&fit=crop",
    ],
    for_trade: false,
    published_groups: [marketCommunities[4]],
  },
  {
    id: "ml-11",
    title: "Ibanez JEM7V Steve Vai",
    subtitle: "Mint — 2019",
    price: 3499,
    location: "San Diego, CA",
    images: [
      "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=600&h=600&fit=crop",
    ],
    for_trade: true,
    published_groups: [marketCommunities[3]],
  },
  {
    id: "ml-12",
    title: "Vox AC30 Hand-Wired",
    subtitle: "2x12 Combo, Alnico Blue",
    price: 2899,
    location: "Brooklyn, NY",
    images: [
      "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=600&h=600&fit=crop",
    ],
    for_trade: false,
    published_groups: [marketCommunities[6]],
  },
]

// Trade
export interface TradeableItemSummary {
  id: string
  title: string
  image?: string
  type: "listing" | "collection_item"
  matchCount: number
  perfectCount: number
}

export const myTradeableItems: TradeableItemSummary[] = [
  {
    id: "my-1",
    title: "Fender American Pro II Stratocaster",
    image:
      "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=200&h=200&fit=crop",
    type: "listing",
    matchCount: 5,
    perfectCount: 1,
  },
  {
    id: "my-2",
    title: "Martin D-28 Acoustic",
    image:
      "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=200&h=200&fit=crop",
    type: "listing",
    matchCount: 3,
    perfectCount: 1,
  },
  {
    id: "my-3",
    title: "Mesa Boogie Dual Rectifier",
    image:
      "https://images.unsplash.com/photo-1558098329-a11cff621064?w=200&h=200&fit=crop",
    type: "collection_item",
    matchCount: 2,
    perfectCount: 1,
  },
  {
    id: "my-4",
    title: "Strymon BigSky Reverb",
    image:
      "https://images.unsplash.com/photo-1535225939926-e62b7c8f1b39?w=200&h=200&fit=crop",
    type: "collection_item",
    matchCount: 1,
    perfectCount: 0,
  },
]

export const tradePerfectMatches: (PerfectMatch & { my_item_id: string })[] = [
  {
    id: "pm-1",
    my_item_id: "my-1",
    my_item: { title: "Fender American Pro II Stratocaster" },
    match_score: 9.0,
    their_item: {
      id: "tm-1",
      type: "listing",
      title: "Gibson Les Paul Standard '50s",
      subtitle: "Gold Top — 2023",
      price: 2499,
      images: [
        "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&h=600&fit=crop",
      ],
      user: { location: "Austin, TX" },
      published_groups: [marketCommunities[1], marketCommunities[4]],
    },
  },
  {
    id: "pm-2",
    my_item_id: "my-2",
    my_item: { title: "Martin D-28 Acoustic" },
    match_score: 8.4,
    their_item: {
      id: "tm-2",
      type: "listing",
      title: "Taylor 814ce Builder's Edition",
      subtitle: "V-Class bracing — Natural",
      price: 3899,
      images: [
        "https://images.unsplash.com/photo-1605020420620-20c943cc4669?w=600&h=600&fit=crop",
      ],
      user: { location: "Nashville, TN" },
      published_groups: [marketCommunities[2]],
    },
  },
  {
    id: "pm-3",
    my_item_id: "my-3",
    my_item: { title: "Mesa Boogie Dual Rectifier" },
    match_score: 7.6,
    their_item: {
      id: "tm-3",
      type: "listing",
      title: "Fender '65 Twin Reverb Reissue",
      subtitle: "85W tube combo",
      price: 1699,
      images: [
        "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=600&h=600&fit=crop",
      ],
      user: { location: "Los Angeles, CA" },
      published_groups: [marketCommunities[6]],
    },
  },
]

export const tradeInboundInterests: (InboundInterest & { my_item_id: string })[] = [
  {
    id: "ib-1",
    my_item_id: "my-1",
    my_item: { title: "Fender American Pro II Stratocaster" },
    match_score: 7.0,
    their_item: {
      id: "ib-1-item",
      type: "listing",
      title: "PRS Custom 24 10-Top",
      subtitle: "Pattern Neck — Cobalt Blue",
      price: 3499,
      images: [
        "https://images.unsplash.com/photo-1550985616-10810253b84d?w=600&h=600&fit=crop",
      ],
      user: { location: "Seattle, WA" },
      published_groups: [marketCommunities[0]],
    },
  },
  {
    id: "ib-2",
    my_item_id: "my-1",
    my_item: { title: "Fender American Pro II Stratocaster" },
    match_score: 5.0,
    their_item: {
      id: "ib-2-item",
      type: "listing",
      title: "Gretsch G6120T-55 Vintage Select",
      subtitle: "Hollow Body — Orange Stain",
      price: 3299,
      images: [
        "https://images.unsplash.com/photo-1519508234439-4f23643125c1?w=600&h=600&fit=crop",
      ],
      user: { location: "Memphis, TN" },
      published_groups: [marketCommunities[4]],
    },
  },
  {
    id: "ib-3",
    my_item_id: "my-2",
    my_item: { title: "Martin D-28 Acoustic" },
    match_score: 6.5,
    their_item: {
      id: "ib-3-item",
      type: "collection_item",
      title: "Gibson J-45 Standard",
      subtitle: "Round Shoulder — Vintage Sunburst",
      price: 2699,
      images: [
        "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=600&h=600&fit=crop",
      ],
      user: { location: "Portland, OR" },
      published_groups: [marketCommunities[2]],
    },
  },
  {
    id: "ib-4",
    my_item_id: "my-3",
    my_item: { title: "Mesa Boogie Dual Rectifier" },
    match_score: 5.5,
    their_item: {
      id: "ib-4-item",
      type: "listing",
      title: "Marshall JCM800 2203",
      subtitle: "100W Head — 1984",
      price: 2200,
      images: [
        "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=600&h=600&fit=crop",
      ],
      user: { location: "Detroit, MI" },
      published_groups: [marketCommunities[6]],
    },
  },
  {
    id: "ib-5",
    my_item_id: "my-4",
    my_item: { title: "Strymon BigSky Reverb" },
    match_score: 8.5,
    their_item: {
      id: "ib-5-item",
      type: "listing",
      title: "Eventide H9 Max",
      subtitle: "Multi-Effects — All Algorithms",
      price: 699,
      images: ["/listings/eventide-h9-max.jpg"],
      user: { location: "Brooklyn, NY" },
      published_groups: [marketCommunities[5]],
    },
  },
]
