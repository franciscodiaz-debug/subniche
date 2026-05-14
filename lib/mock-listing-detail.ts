/**
 * Mock data for the published listing detail page.
 *
 * Four state variants are wired so the layout can be verified across the
 * scenarios called out in the spec:
 *
 *   - `vintage-strat-1965` → Viewer, For Sale + Open to Trade, mutual match.
 *   - `dumble-overdrive`   → Viewer, For Sale only, no match.
 *   - `les-paul-59`        → Viewer, Collection only (no commerce fields).
 *   - `owner-demo`         → Owner viewing own listing (edit/delete + stats).
 *
 * All four routes render the same component; the shape of the returned
 * `MockListing` drives the runtime differences (CTAs, stats, sections).
 *
 * The mock is intentionally decoupled from the Create Listing form types —
 * we serialize into the shapes the detail view actually consumes. This keeps
 * the prototype readable without dragging in authoring-time state.
 */

import { currentUser } from "@/lib/current-user"

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type AvailabilityType = "for-sale" | "for-trade" | "collection"

export interface MockSeller {
  id: string
  username: string
  displayName: string
  avatarUrl: string
  location: string
  joinedYear: number
  ratingAverage: number
  ratingCount: number
  profileHref: string
}

export interface MockComment {
  id: string
  authorName: string
  authorAvatarUrl: string
  isOwner?: boolean
  timestamp: string
  body: string
  replies?: MockComment[]
}

export interface MockRelatedCard {
  id: string
  title: string
  subtitle?: string
  price?: number | null
  imageUrl: string
  forTrade?: boolean
  href: string
}

export interface MockTradeInterest {
  /** "Simple" mode renders the text; "structured" renders the chip list. */
  mode: "simple" | "structured"
  text?: string
  items?: Array<{
    id: string
    label: string
    notes?: string
  }>
}

export interface MockMutualMatch {
  /** Listing title from the viewer that matches this listing. */
  viewerListingTitle: string
  viewerListingHref: string
  viewerListingImage: string
  /** Plain-language match summary, e.g. "Seller wants your Gibson ES-335." */
  summary: string
  matchScore: number
}

export interface MockSpec {
  label: string
  value: string
  /** Stable identifier from the spec catalog. Optional for backward compat
   *  with mock fixtures that pre-date the catalog migration. */
  key?: string
}

export interface MockListing {
  id: string
  categoryPath: string[] // e.g. ["Guitars", "Electric"]
  availability: AvailabilityType[]
  title: string
  subtitle: string | null
  description: string
  price: number | null
  images: string[]
  conditionLabel: string | null
  conditionExplanation: string | null
  specs: MockSpec[]
  seller: MockSeller
  paymentMethods: string[] | null
  shipping: {
    shipsFrom: string
    handlingDays: string
    options: Array<{ label: string; price: number | null }>
    localPickup: boolean
  } | null
  returnPolicy: string | null
  tradeInterest: MockTradeInterest | null
  mutualMatch: MockMutualMatch | null
  viewerIsOwner: boolean
  ownerStats?: {
    views: number
    wishlistAdds: number
    messages: number
    daysListed: number
  }
  markedAsSold?: boolean
  comments: MockComment[]
  moreFromSeller: MockRelatedCard[]
  youMightAlsoLike: MockRelatedCard[]
}

/* -------------------------------------------------------------------------- */
/* Shared seller profiles                                                     */
/* -------------------------------------------------------------------------- */

const jillMusic: MockSeller = {
  id: "user-jek116",
  username: currentUser.username, // "jek116" — treated as the viewer's own account
  displayName: currentUser.displayName,
  avatarUrl: currentUser.avatarUrl,
  location: "Brooklyn, NY",
  joinedYear: 2021,
  ratingAverage: 4.9,
  ratingCount: 142,
  profileHref: currentUser.profileHref,
}

const marcoSeller: MockSeller = {
  id: "user-marco-amp",
  username: "marco_amp",
  displayName: "Marco Lennox",
  avatarUrl: "/placeholder.svg?height=120&width=120",
  location: "Austin, TX",
  joinedYear: 2019,
  ratingAverage: 4.8,
  ratingCount: 89,
  profileHref: "/u/marco_amp",
}

const sashaSeller: MockSeller = {
  id: "user-sasha-keys",
  username: "sasha.keys",
  displayName: "Sasha Reyes",
  avatarUrl: "/placeholder.svg?height=120&width=120",
  location: "Portland, OR",
  joinedYear: 2022,
  ratingAverage: 5.0,
  ratingCount: 34,
  profileHref: "/u/sasha.keys",
}

/* -------------------------------------------------------------------------- */
/* Shared related-listing rows                                                */
/* -------------------------------------------------------------------------- */

function buildMarcoGear(): MockRelatedCard[] {
  return [
    {
      id: "rel-1",
      title: "Fender '65 Deluxe Reverb Reissue",
      subtitle: "All-tube combo, recently serviced",
      price: 1150,
      imageUrl: "/placeholder.svg?height=600&width=800",
      href: "/listings/rel-1",
    },
    {
      id: "rel-2",
      title: "Vintage 1973 Gibson SG Standard",
      subtitle: "Cherry, original case, T-top pickups",
      price: 3200,
      imageUrl: "/placeholder.svg?height=600&width=800",
      forTrade: true,
      href: "/listings/rel-2",
    },
    {
      id: "rel-3",
      title: "Boss CE-1 Chorus Ensemble",
      subtitle: "Original unit, serviced",
      price: 550,
      imageUrl: "/placeholder.svg?height=600&width=800",
      href: "/listings/rel-3",
    },
    {
      id: "rel-4",
      title: "Shure SM7B",
      subtitle: "Podcast / broadcast microphone",
      price: 320,
      imageUrl: "/placeholder.svg?height=600&width=800",
      href: "/listings/rel-4",
    },
  ]
}

function buildRelated(): MockRelatedCard[] {
  return [
    {
      id: "ymal-1",
      title: "1961 Fender Stratocaster",
      subtitle: "Slab board, all original",
      price: 31500,
      imageUrl: "/placeholder.svg?height=600&width=800",
      forTrade: true,
      href: "/listings/ymal-1",
    },
    {
      id: "ymal-2",
      title: "1966 Fender Jazzmaster",
      subtitle: "Sonic blue refin, matching headstock",
      price: 9200,
      imageUrl: "/placeholder.svg?height=600&width=800",
      href: "/listings/ymal-2",
    },
    {
      id: "ymal-3",
      title: "1968 Gibson ES-335",
      subtitle: "Sunburst, trapeze tailpiece",
      price: 7800,
      imageUrl: "/placeholder.svg?height=600&width=800",
      href: "/listings/ymal-3",
    },
    {
      id: "ymal-4",
      title: "2019 Fender Custom Shop '63 Strat Relic",
      subtitle: "Aged lake placid blue",
      price: 4500,
      imageUrl: "/placeholder.svg?height=600&width=800",
      href: "/listings/ymal-4",
    },
    {
      id: "ymal-5",
      title: "1965 Fender Deluxe Reverb",
      subtitle: "Blackface, original transformers",
      price: 2400,
      imageUrl: "/placeholder.svg?height=600&width=800",
      href: "/listings/ymal-5",
    },
  ]
}

/* -------------------------------------------------------------------------- */
/* Mock listings                                                              */
/* -------------------------------------------------------------------------- */

const MOCK_LISTINGS: Record<string, MockListing> = {
  "vintage-strat-1965": {
    id: "vintage-strat-1965",
    categoryPath: ["Guitars", "Electric"],
    availability: ["for-sale", "for-trade"],
    title: "1965 Fender Stratocaster",
    subtitle: "Three-tone Sunburst, matching headstock, original case",
    description:
      "All-original 1965 Fender Stratocaster in three-tone sunburst with a rosewood fretboard. Frets were dressed in 2022 and the guitar plays effortlessly up and down the neck. Pickups read 5.8k / 5.9k / 6.1k and sound exactly as they should — glassy in position 2, vocal in 4, pure Hendrix in 5. Comes with the original tweed case, case candy, and a 2024 tech invoice. Zero issues, no breaks, no refinish. One of the cleanest 65s I've ever owned.",
  price: 28500,
  images: [
    "/listings/strat-hero.jpg",
    "/placeholder.svg?height=900&width=1200",
    "/placeholder.svg?height=900&width=1200",
    "/placeholder.svg?height=900&width=1200",
  ],
    conditionLabel: "Used — As New",
    conditionExplanation:
      "Light buckle wear on the back, all-original solder joints, no modifications. Plays and sounds like the day it was made.",
    specs: [
      { label: "Brand", value: "Fender" },
      { label: "Year", value: "1965" },
      { label: "Color", value: "Sunburst" },
      { label: "Body type", value: "Solid" },
      { label: "Pickups", value: "Single Coil (SSS)" },
      { label: "Bridge", value: "Tremolo" },
      { label: "Fretboard", value: "Rosewood" },
      { label: "Finish", value: "Gloss" },
      { label: "Handedness", value: "Right" },
    ],
    seller: marcoSeller,
    paymentMethods: [
      "Cash",
      "PayPal — Goods & Services",
      "Bank transfer",
      "Wire",
    ],
    shipping: {
      shipsFrom: "Austin, TX",
      handlingDays: "1–2 business days",
      options: [
        { label: "Insured ground shipping", price: 120 },
        { label: "Local pickup", price: 0 },
      ],
      localPickup: true,
    },
    returnPolicy:
      "3-day approval window. Buyer covers return shipping. Guitar must be returned in the exact condition received.",
    tradeInterest: {
      mode: "structured",
      items: [
        {
          id: "ti-1",
          label: "Pre-CBS Fender Telecaster or Esquire",
          notes: "1954–1964, original finish preferred",
        },
        {
          id: "ti-2",
          label: "Late-50s Gibson Les Paul Junior or Special",
          notes: "Single cut, TV yellow or cherry",
        },
        {
          id: "ti-3",
          label: "Dumble-style overdrive amp",
          notes: "Two Rock, Fuchs, or similar — 50W head",
        },
      ],
    },
    mutualMatch: {
      viewerListingTitle: "1968 Gibson ES-335",
      viewerListingHref: "/listings/viewer-es-335",
      viewerListingImage: "/placeholder.svg?height=160&width=200",
      summary: "Marco wants a late-60s ES-335 — your listing matches.",
      matchScore: 9.2,
    },
    viewerIsOwner: false,
    comments: [
      {
        id: "c-1",
        authorName: "Kyle B.",
        authorAvatarUrl: "/placeholder.svg?height=64&width=64",
        timestamp: "3 days ago",
        body: "Would you consider splitting shipping with a 2024 tech invoice amount? Happy to pay half if you want to post the receipt.",
        replies: [
          {
            id: "c-1-r-1",
            authorName: "Marco Lennox",
            authorAvatarUrl: marcoSeller.avatarUrl,
            isOwner: true,
            timestamp: "2 days ago",
            body: "Invoice is in the description gallery — happy to split the $120 if you're within the continental US.",
          },
        ],
      },
      {
        id: "c-2",
        authorName: "Reva M.",
        authorAvatarUrl: "/placeholder.svg?height=64&width=64",
        timestamp: "5 days ago",
        body: "Is the neck pickup the original grey-bottom? Looks like it in the pics but wanted to confirm.",
        replies: [
          {
            id: "c-2-r-1",
            authorName: "Marco Lennox",
            authorAvatarUrl: marcoSeller.avatarUrl,
            isOwner: true,
            timestamp: "5 days ago",
            body: "Yep — all three pickups are original grey-bottoms, untouched solder.",
          },
        ],
      },
    ],
    moreFromSeller: buildMarcoGear(),
    youMightAlsoLike: buildRelated(),
  },

  "dumble-overdrive": {
    id: "dumble-overdrive",
    categoryPath: ["Audio Equipment", "Amps"],
    availability: ["for-sale"],
    title: "Two Rock Classic Reverb Signature 50W",
    subtitle: "Head only — 2019 build, serviced 2024",
    description:
      "Clean Two Rock Classic Reverb Signature head. The classic Dumble-flavored clean with a singing overdrive channel. Serviced by Two Rock in early 2024 — new valves, bias set to spec. Pairs beautifully with a 2x12 cab and a Strat. No issues, selling because I'm consolidating heads.",
  price: 4200,
  images: [
    "/listings/dumble-hero.jpg",
    "/placeholder.svg?height=900&width=1200",
    "/placeholder.svg?height=900&width=1200",
  ],
    conditionLabel: "Used — Excellent",
    conditionExplanation:
      "Tiny scuff on the top-right corner from a previous owner; otherwise pristine. All knobs smooth, no pops, no noise.",
    specs: [
      { label: "Brand", value: "Two Rock" },
      { label: "Model", value: "Classic Reverb Signature" },
      { label: "Year", value: "2019" },
      { label: "Power", value: "50 Watts" },
      { label: "Tubes", value: "6L6 power section" },
      { label: "Channels", value: "Clean + Overdrive" },
      { label: "Reverb", value: "Onboard tube spring" },
    ],
    seller: marcoSeller,
    paymentMethods: ["Cash", "PayPal — Goods & Services", "Bank transfer"],
    shipping: {
      shipsFrom: "Austin, TX",
      handlingDays: "1–2 business days",
      options: [
        { label: "Insured ground shipping", price: 95 },
        { label: "Local pickup", price: 0 },
      ],
      localPickup: true,
    },
    returnPolicy:
      "Sold as-described. Returns only if materially misrepresented; buyer covers all shipping both ways.",
    tradeInterest: null,
    mutualMatch: null,
    viewerIsOwner: false,
    comments: [
      {
        id: "c-1",
        authorName: "Devon A.",
        authorAvatarUrl: "/placeholder.svg?height=64&width=64",
        timestamp: "1 day ago",
        body: "Any chance of a short clip through your usual rig? Curious how the overdrive channel breaks up.",
      },
    ],
    moreFromSeller: buildMarcoGear(),
    youMightAlsoLike: [
      {
        id: "ymal-amp-1",
        title: "Fuchs Overdrive Supreme 50",
        subtitle: "Head, 2018, serviced",
        price: 2400,
        imageUrl: "/placeholder.svg?height=600&width=800",
        href: "/listings/ymal-amp-1",
      },
      {
        id: "ymal-amp-2",
        title: "Bludotone Bludo-Drive",
        subtitle: "Head — Mk III, 2020",
        price: 6800,
        imageUrl: "/placeholder.svg?height=600&width=800",
        href: "/listings/ymal-amp-2",
      },
      {
        id: "ymal-amp-3",
        title: "Ceriatone Overtone Special 100",
        subtitle: "HRM build, 2022",
        price: 2100,
        imageUrl: "/placeholder.svg?height=600&width=800",
        href: "/listings/ymal-amp-3",
      },
      {
        id: "ymal-amp-4",
        title: "Matchless Chieftain",
        subtitle: "Combo, 40W, recovered",
        price: 3300,
        imageUrl: "/placeholder.svg?height=600&width=800",
        href: "/listings/ymal-amp-4",
      },
    ],
  },

  "les-paul-59": {
    id: "les-paul-59",
    categoryPath: ["Guitars", "Electric"],
    availability: ["collection"],
    title: "1959 Gibson Les Paul Standard (R9 replica)",
    subtitle: "My grail — not for sale, just showing it off",
    description:
      "Historic Makeovers conversion on a 2019 Gibson Custom Shop R9. Double-bound top, Brazilian board, re-topped with a monster flame. Pickups are Throbaks SLE-101+. It plays like butter and looks like a hundred grand. Living in my collection for life.",
  price: null,
  images: [
    "/listings/lespaul-hero.jpg",
    "/placeholder.svg?height=900&width=1200",
  ],
    conditionLabel: "Used — Excellent",
    conditionExplanation:
      "Played regularly but kept in a climate-controlled room. Some natural fingerboard wear; no buckle rash.",
    specs: [
      { label: "Brand", value: "Gibson" },
      { label: "Model", value: "Custom Shop R9 (HM conversion)" },
      { label: "Year", value: "2019" },
      { label: "Color", value: "Lemon Burst" },
      { label: "Pickups", value: "Throbak SLE-101+ (PAF clones)" },
      { label: "Fretboard", value: "Brazilian Rosewood" },
    ],
    seller: sashaSeller,
    paymentMethods: null,
    shipping: null,
    returnPolicy: null,
    tradeInterest: null,
    mutualMatch: null,
    viewerIsOwner: false,
    comments: [
      {
        id: "c-1",
        authorName: "Lou P.",
        authorAvatarUrl: "/placeholder.svg?height=64&width=64",
        timestamp: "1 week ago",
        body: "Absolutely stunning. Who did the HM conversion?",
        replies: [
          {
            id: "c-1-r-1",
            authorName: sashaSeller.displayName,
            authorAvatarUrl: sashaSeller.avatarUrl,
            isOwner: true,
            timestamp: "1 week ago",
            body: "Kim at Historic Makeovers — a 14-month wait, worth every day of it.",
          },
        ],
      },
    ],
    moreFromSeller: [
      {
        id: "sasha-1",
        title: "2021 Collings 290 DC S",
        subtitle: "TV Yellow, mastery bridge",
        price: null,
        imageUrl: "/placeholder.svg?height=600&width=800",
        href: "/listings/sasha-1",
      },
      {
        id: "sasha-2",
        title: "1964 Gibson SG Junior",
        subtitle: "Cherry, single P-90",
        price: null,
        imageUrl: "/placeholder.svg?height=600&width=800",
        href: "/listings/sasha-2",
      },
      {
        id: "sasha-3",
        title: "2020 Nash T-63",
        subtitle: "Aged olympic white",
        price: null,
        imageUrl: "/placeholder.svg?height=600&width=800",
        href: "/listings/sasha-3",
      },
    ],
    youMightAlsoLike: buildRelated(),
  },

  "owner-demo": {
    id: "owner-demo",
    categoryPath: ["Guitars", "Electric"],
    availability: ["for-sale", "for-trade"],
    title: "2012 Fender Custom Shop '63 Telecaster Relic",
    subtitle: "Aged Lake Placid Blue, matching headstock, OHSC",
    description:
      "Custom Shop Tele in aged Lake Placid Blue with a matching headstock. Relic'd tastefully — not beat to death. Neck is a medium C profile with a 7.25” radius and vintage-tall frets. Sounds bright and clear with real Tele quack in position 2. Comes with the original case, COA, and polish cloth.",
  price: 3800,
  images: [
    "/listings/owner-amp-hero.jpg",
    "/placeholder.svg?height=900&width=1200",
    "/placeholder.svg?height=900&width=1200",
  ],
    conditionLabel: "Used — Excellent",
    conditionExplanation:
      "Light play wear on top of the factory relic. Frets are 90% original, no divots. No modifications or repairs.",
    specs: [
      { label: "Brand", value: "Fender Custom Shop" },
      { label: "Year", value: "2012" },
      { label: "Color", value: "Lake Placid Blue (aged)" },
      { label: "Body type", value: "Solid" },
      { label: "Pickups", value: "Single Coil (SS)" },
      { label: "Fretboard", value: "Rosewood" },
      { label: "Handedness", value: "Right" },
    ],
    seller: jillMusic,
    paymentMethods: [
      "Cash",
      "PayPal — Goods & Services",
      "Bank transfer",
    ],
    shipping: {
      shipsFrom: "Brooklyn, NY",
      handlingDays: "2 business days",
      options: [
        { label: "Insured ground shipping", price: 110 },
        { label: "Local pickup", price: 0 },
      ],
      localPickup: true,
    },
    returnPolicy:
      "48-hour approval window. Buyer covers return shipping.",
    tradeInterest: {
      mode: "simple",
      text: "Open to trading toward a late-50s Strat or a Dumble-clone amp (Two Rock, Fuchs, Ceriatone). Cash on my end is fine.",
    },
    mutualMatch: null,
    viewerIsOwner: true,
    ownerStats: {
      views: 1284,
      wishlistAdds: 37,
      messages: 9,
      daysListed: 11,
    },
    markedAsSold: false,
    comments: [
      {
        id: "c-1",
        authorName: "Tanya V.",
        authorAvatarUrl: "/placeholder.svg?height=64&width=64",
        timestamp: "4 hours ago",
        body: "Is the neck profile closer to a soft V or medium C? Hard to tell from the photos.",
      },
      {
        id: "c-2",
        authorName: "Will D.",
        authorAvatarUrl: "/placeholder.svg?height=64&width=64",
        timestamp: "1 day ago",
        body: "Would you ship international (UK)? Happy to cover the full cost + any VAT docs you'd need.",
      },
    ],
    moreFromSeller: [
      {
        id: "jill-1",
        title: "1972 Fender Telecaster Thinline",
        subtitle: "Natural, Wide Range humbuckers",
        price: 3950,
        imageUrl: "/placeholder.svg?height=600&width=800",
        href: "/listings/jill-1",
      },
      {
        id: "jill-2",
        title: "1965 Vox AC30",
        subtitle: "Copper panel, serviced",
        price: 2800,
        imageUrl: "/placeholder.svg?height=600&width=800",
        href: "/listings/jill-2",
      },
      {
        id: "jill-3",
        title: "Klon Centaur (Silver, non-horsie)",
        subtitle: "Original, excellent",
        price: 4600,
        imageUrl: "/placeholder.svg?height=600&width=800",
        href: "/listings/jill-3",
      },
    ],
    youMightAlsoLike: buildRelated(),
  },
}

/* -------------------------------------------------------------------------- */
/* Public lookup                                                              */
/* -------------------------------------------------------------------------- */

export function getMockListing(id: string): MockListing | null {
  return MOCK_LISTINGS[id] ?? null
}

/**
 * All IDs that return a listing. Exposed so the 404 / fallback logic on the
 * route can link users to known-good demo listings instead of dead ends.
 */
export function getAllMockListingIds(): string[] {
  return Object.keys(MOCK_LISTINGS)
}
