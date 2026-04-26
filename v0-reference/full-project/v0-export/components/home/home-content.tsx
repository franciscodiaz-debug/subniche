"use client"
import { DiscoverListingCard } from "@/components/discover/discover-listing-card"
import { TradeInterestCard } from "@/components/trade/trade-interest-card"
import { ActionCard } from "./action-card"
import {
  ChevronRight,
  CheckCircle2,
  Bell,
  Repeat,
  Search,
  HeartIcon,
  Users,
  Bookmark,
  TrendingUp,
  Sparkles,
  Package,
  Heart,
  SearchIcon,
} from "lucide-react"
import Link from "next/link"
import type { Listing, Community, PerfectMatch } from "@/lib/types"
import { useState, useRef, useEffect } from "react"

interface DiscoverListing extends Listing {
  for_trade?: boolean
  published_groups?: Community[]
  is_private?: boolean
  matched_saved_search?: string // Update DiscoverListing type to include matched_saved_search
}

function formatTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return `${diffSecs}s ago`
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return "1 day ago"
  return `${diffDays} days ago`
}

// Mock data
const actionItems = [
  {
    id: "1",
    avatar: "/male-musician-profile-photo.jpg",
    username: "Julian Reed",
    actionType: "offer" as const,
    itemTitle: "Gibson SG",
    description: "Julian offered a 1974 Fender Twin Reverb for your Gibson SG.",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: "2",
    avatar: "/female-musician-profile-photo.jpg",
    username: "Elena K.",
    actionType: "message" as const,
    itemTitle: "Vintage Moog",
    description: "Is the price negotiable on the vintage Moog?",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "3",
    avatar: "/guitarist-profile-photo.jpg",
    username: "Marcus Sterling",
    actionType: "approved" as const,
    itemTitle: "Jazzmaster",
    description: "Marcus Sterling approved your trade request for the Jazzmaster.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "4",
    avatar: "/male-musician-profile-photo.jpg",
    username: "Dave Wilson",
    actionType: "counter" as const,
    itemTitle: "Boss DD-500",
    description: "Dave countered with $250 + shipping for the Boss DD-500.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: "5",
    avatar: "/female-musician-profile-photo.jpg",
    username: "Sarah Chen",
    actionType: "trade" as const,
    itemTitle: "Keeley Compressor",
    description: "Sarah wants to trade her MXR Dyna Comp for your Keeley Compressor.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
]

const tradeMatchesData: PerfectMatch[] = [
  {
    id: "tm1",
    my_item: {
      id: "my1",
      title: "Boss DD-500 Digital Delay",
      type: "listing",
      images: ["/boss-dd-500-digital-delay-pedal.jpg"],
      price: 280,
    },
    their_item: {
      id: "1",
      title: "Keeley Compressor Plus",
      subtitle: "Excellent condition, rarely used",
      type: "listing",
      images: ["/keeley-compressor-guitar-pedal-silver.jpg"],
      price: 180,
      user: {
        id: "user1",
        username: "tonehunter",
        location: "Austin, TX",
      },
      published_groups: [
        { id: "g1", name: "Pedal Traders", slug: "pedal-traders", description: null, icon: "🎛️", member_count: 1200 },
      ],
    },
    match_score: 9.2,
    their_trade_interest_created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
  },
  {
    id: "tm2",
    my_item: {
      id: "my2",
      title: "Arturia MicroFreak",
      type: "listing",
      images: ["/arturia-microfreak-synthesizer.jpg"],
      price: 250,
    },
    their_item: {
      id: "2",
      title: "Korg Volca Keys",
      subtitle: "Analog loop synth",
      type: "listing",
      images: ["/korg-volca-keys-analog-synthesizer.jpg"],
      price: 140,
      user: {
        id: "user2",
        username: "synthwave",
        location: "Portland, OR",
      },
      published_groups: [
        { id: "g4", name: "Synth Swap", slug: "synth-swap", description: null, icon: "🎹", member_count: 890 },
      ],
    },
    match_score: 8.5,
    their_trade_interest_created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: "tm3",
    my_item: {
      id: "my3",
      title: "Roland TR-8S",
      type: "listing",
      images: ["/roland-tr-8s-drum-machine.jpg"],
      price: 450,
    },
    their_item: {
      id: "3",
      title: "Roland TR-08",
      subtitle: "Boutique 808 clone",
      type: "listing",
      images: ["/roland-tr-08-drum-machine-red.jpg"],
      price: 320,
      user: {
        id: "user3",
        username: "beatmaker",
        location: "Chicago, IL",
      },
      published_groups: [
        {
          id: "g5",
          name: "Drum Machine Collective",
          slug: "drum-machines",
          description: null,
          icon: "🥁",
          member_count: 650,
        },
      ],
    },
    match_score: 9.0,
    their_trade_interest_created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
  },
  {
    id: "tm4",
    my_item: {
      id: "my4",
      title: "MXR Phase 90",
      type: "listing",
      images: ["/mxr-phase-90-pedal.jpg"],
      price: 80,
    },
    their_item: {
      id: "4",
      title: "EHX Small Stone",
      subtitle: "Classic phaser tone",
      type: "listing",
      images: ["/electro-harmonix-small-stone-phaser-pedal.jpg"],
      price: 85,
      user: {
        id: "user4",
        username: "phasehead",
        location: "Denver, CO",
      },
      published_groups: [
        { id: "g1", name: "Pedal Traders", slug: "pedal-traders", description: null, icon: "🎛️", member_count: 1200 },
      ],
    },
    match_score: 7.8,
    their_trade_interest_created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
  },
  {
    id: "tm5",
    my_item: {
      id: "my5",
      title: "Boss CE-5 Chorus",
      type: "listing",
      images: ["/boss-ce-5-chorus-pedal.jpg"],
      price: 100,
    },
    their_item: {
      id: "5",
      title: "Boss CE-2W",
      subtitle: "Waza Craft chorus",
      type: "listing",
      images: ["/boss-ce-2w-waza-craft-chorus-pedal-blue.jpg"],
      price: 220,
      user: {
        id: "user5",
        username: "choruslover",
        location: "Seattle, WA",
      },
      published_groups: [
        { id: "g1", name: "Pedal Traders", slug: "pedal-traders", description: null, icon: "🎛️", member_count: 1200 },
        { id: "g6", name: "Boss Fans", slug: "boss-fans", description: null, icon: "🔶", member_count: 2100 },
      ],
    },
    match_score: 8.2,
    their_trade_interest_created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: "tm6",
    my_item: {
      id: "my6",
      title: "Earthquaker Devices Avalanche Run",
      type: "listing",
      images: ["/boss-dd-500-digital-delay-pedal.jpg"],
      price: 220,
    },
    their_item: {
      id: "6",
      title: "Strymon El Capistan",
      subtitle: "Tape echo perfection",
      type: "listing",
      images: ["/keeley-compressor-guitar-pedal-silver.jpg"],
      price: 280,
      user: {
        id: "user6",
        username: "delayking",
        location: "Nashville, TN",
      },
      published_groups: [
        { id: "g1", name: "Pedal Traders", slug: "pedal-traders", description: null, icon: "🎛️", member_count: 1200 },
      ],
    },
    match_score: 8.8,
    their_trade_interest_created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  },
  {
    id: "tm7",
    my_item: {
      id: "my7",
      title: "Walrus Audio Julia",
      type: "listing",
      images: ["/boss-ce-5-chorus-pedal.jpg"],
      price: 150,
    },
    their_item: {
      id: "7",
      title: "JHS Emperor",
      subtitle: "Analog chorus/vibrato",
      type: "listing",
      images: ["/boss-ce-2w-waza-craft-chorus-pedal-blue.jpg"],
      price: 180,
      user: {
        id: "user7",
        username: "modulation_station",
        location: "Brooklyn, NY",
      },
      published_groups: [
        { id: "g1", name: "Pedal Traders", slug: "pedal-traders", description: null, icon: "🎛️", member_count: 1200 },
      ],
    },
    match_score: 7.5,
    their_trade_interest_created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
  },
]

const sortedTradeMatches = [...tradeMatchesData]
  .sort(
    (a, b) =>
      new Date(b.their_trade_interest_created_at).getTime() - new Date(a.their_trade_interest_created_at).getTime(),
  )
  .slice(0, 5)

const followedActivity: DiscoverListing[] = [
  {
    id: "6",
    seller_id: "user6",
    title: "MIJ Fender Jazzmaster '62 RI",
    subtitle: "Listed by @vintagegearnyc",
    description: null,
    price: 1350,
    category: "Guitars",
    subcategory: null,
    condition: "Excellent",
    payment_methods: [],
    logistics: null,
    images: ["/fender-jazzmaster-electric-guitar-sunburst-vintage.jpg"],
    location: "New York, NY",
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updated_at: new Date().toISOString(),
    for_trade: true,
    published_groups: [
      { id: "g2", name: "Fender Fans", slug: "fender-fans", description: null, icon: "🎸", member_count: 3400 },
      { id: "g8", name: "Vintage Gear", slug: "vintage-gear", description: null, icon: "🎼", member_count: 980 },
    ],
  },
  {
    id: "7",
    seller_id: "user7",
    title: "Fender Blues Jr. IV",
    subtitle: "Added to Tube Amp Collectors",
    description: null,
    price: 550,
    category: "Amps",
    subcategory: null,
    condition: "Very Good",
    payment_methods: [],
    logistics: null,
    images: ["/fender-blues-junior-tube-amp-tweed.jpg"],
    location: "Nashville, TN",
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    updated_at: new Date().toISOString(),
    published_groups: [
      { id: "g7", name: "Amp Collectors", slug: "amp-collectors", description: null, icon: "🔊", member_count: 1850 },
    ],
  },
  {
    id: "8",
    seller_id: "user8",
    title: "Martin D-15M",
    subtitle: "Listed by @acousticdan",
    description: null,
    price: 1200,
    category: "Guitars",
    subcategory: null,
    condition: "Excellent",
    payment_methods: [],
    logistics: null,
    images: ["/martin-d-15m-acoustic-guitar-mahogany.jpg"],
    location: "Austin, TX",
    created_at: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
    updated_at: new Date().toISOString(),
    for_trade: true,
    published_groups: [
      { id: "g9", name: "Acoustic Guild", slug: "acoustic-guild", description: null, icon: "🎵", member_count: 2200 },
    ],
  },
  {
    id: "9",
    seller_id: "user9",
    title: "MIM Strat Olympic White",
    subtitle: "Added to Fender Fans",
    description: null,
    price: 650,
    category: "Guitars",
    subcategory: null,
    condition: "Good",
    payment_methods: [],
    logistics: null,
    images: ["/fender-stratocaster-olympic-white-electric-guitar.jpg"],
    location: "Los Angeles, CA",
    created_at: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
    updated_at: new Date().toISOString(),
    published_groups: [
      { id: "g2", name: "Fender Fans", slug: "fender-fans", description: null, icon: "🎸", member_count: 3400 },
    ],
  },
  {
    id: "10",
    seller_id: "user10",
    title: "Gibson ES-335",
    subtitle: "Listed by @gibsonguru",
    description: null,
    price: 2800,
    category: "Guitars",
    subcategory: null,
    condition: "Mint",
    payment_methods: [],
    logistics: null,
    images: ["/gibson-es-335-semi-hollow-cherry-red-guitar.jpg"],
    location: "Memphis, TN",
    created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    updated_at: new Date().toISOString(),
    for_trade: true,
    published_groups: [
      { id: "g10", name: "Gibson Guild", slug: "gibson-guild", description: null, icon: "🎸", member_count: 2800 },
    ],
  },
]

const watchlistItems: DiscoverListing[] = [
  {
    id: "11",
    seller_id: "user11",
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
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updated_at: new Date().toISOString(),
    for_trade: true,
    published_groups: [
      { id: "g10", name: "Gibson Guild", slug: "gibson-guild", description: null, icon: "🎸", member_count: 2800 },
      { id: "g8", name: "Vintage Gear", slug: "vintage-gear", description: null, icon: "🎼", member_count: 980 },
    ],
  },
  {
    id: "12",
    seller_id: "user12",
    title: "Analogman King of Tone",
    subtitle: "Open to trades",
    description: null,
    price: 650,
    category: "Pedals",
    subcategory: null,
    condition: "Mint",
    payment_methods: [],
    logistics: null,
    images: ["/analogman-king-of-tone-overdrive-pedal.jpg"],
    location: "Brooklyn, NY",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updated_at: new Date().toISOString(),
    for_trade: true,
    published_groups: [
      { id: "g1", name: "Pedal Traders", slug: "pedal-traders", description: null, icon: "🎛️", member_count: 1200 },
      {
        id: "g11",
        name: "Boutique Pedals",
        slug: "boutique-pedals",
        description: null,
        icon: "✨",
        member_count: 1560,
      },
    ],
  },
  {
    id: "13",
    seller_id: "user13",
    title: "Fender P-Bass '75 RI",
    subtitle: "Q&A reply",
    description: null,
    price: 1800,
    category: "Basses",
    subcategory: null,
    condition: "Very Good",
    payment_methods: [],
    logistics: null,
    images: ["/fender-precision-bass-1975-vintage-sunburst.jpg"],
    location: "Philadelphia, PA",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updated_at: new Date().toISOString(),
    for_trade: true,
    published_groups: [
      { id: "g12", name: "Bass Players", slug: "bass-players", description: null, icon: "🎸", member_count: 1430 },
    ],
  },
  {
    id: "14",
    seller_id: "user14",
    title: "Sequential Prophet 6",
    subtitle: "Updated",
    description: null,
    price: 2200,
    category: "Synths",
    subcategory: null,
    condition: "Excellent",
    payment_methods: [],
    logistics: null,
    images: ["/sequential-prophet-6-synthesizer.jpg"],
    location: "San Francisco, CA",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    updated_at: new Date().toISOString(),
    published_groups: [
      { id: "g4", name: "Synth Swap", slug: "synth-swap", description: null, icon: "🎹", member_count: 890 },
    ],
  },
]

const communityListings: DiscoverListing[] = [
  {
    id: "15",
    seller_id: "user15",
    title: "Boss DS-1 Keeley Mod",
    subtitle: null,
    description: null,
    price: 95,
    category: "Pedals",
    subcategory: null,
    condition: "Excellent",
    payment_methods: [],
    logistics: null,
    images: ["/boss-ds-1-distortion-pedal-orange-keeley-mod.jpg"],
    location: "Austin, TX",
    created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    updated_at: new Date().toISOString(),
    published_groups: [
      { id: "g1", name: "Pedal Traders", slug: "pedal-traders", description: null, icon: "🎛️", member_count: 1200 },
    ],
  },
  {
    id: "16",
    seller_id: "user16",
    title: "MIM Strat - Olympic White",
    subtitle: null,
    description: null,
    price: 650,
    category: "Guitars",
    subcategory: null,
    condition: "Very Good",
    payment_methods: [],
    logistics: null,
    images: ["/fender-stratocaster-olympic-white-mexican.jpg"],
    location: "Dallas, TX",
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    updated_at: new Date().toISOString(),
    published_groups: [
      { id: "g2", name: "Fender Fans", slug: "fender-fans", description: null, icon: "🎸", member_count: 3400 },
    ],
  },
  {
    id: "17",
    seller_id: "user17",
    title: "TC Electronic Polytune 3",
    subtitle: null,
    description: null,
    price: 75,
    category: "Pedals",
    subcategory: null,
    condition: "Good",
    payment_methods: [],
    logistics: null,
    images: ["/tc-electronic-polytune-3-guitar-tuner-pedal.jpg"],
    location: "Portland, OR",
    created_at: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    updated_at: new Date().toISOString(),
    published_groups: [
      { id: "g1", name: "Pedal Traders", slug: "pedal-traders", description: null, icon: "🎛️", member_count: 1200 },
    ],
  },
  {
    id: "18",
    seller_id: "user18",
    title: "Ernie Ball Strings (10 sets)",
    subtitle: null,
    description: null,
    price: 45,
    category: "Accessories",
    subcategory: null,
    condition: "New",
    payment_methods: [],
    logistics: null,
    images: ["/ernie-ball-guitar-strings-pack.jpg"],
    location: "Chicago, IL",
    created_at: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
    updated_at: new Date().toISOString(),
    published_groups: [
      {
        id: "g3",
        name: "Guitar Gear Exchange",
        slug: "guitar-gear-exchange",
        description: null,
        icon: "🔧",
        member_count: 890,
      },
    ],
  },
  {
    id: "19",
    seller_id: "user19",
    title: "Fender Hardshell Case",
    subtitle: null,
    description: null,
    price: 120,
    category: "Accessories",
    subcategory: null,
    condition: "Excellent",
    payment_methods: [],
    logistics: null,
    images: ["/fender-guitar-hardshell-case-black.jpg"],
    location: "Miami, FL",
    created_at: new Date(Date.now() - 1000 * 60 * 100).toISOString(),
    updated_at: new Date().toISOString(),
    for_trade: true,
    published_groups: [
      { id: "g2", name: "Fender Fans", slug: "fender-fans", description: null, icon: "🎸", member_count: 3400 },
    ],
  },
]

const savedSearchResults: DiscoverListing[] = [
  {
    id: "20",
    seller_id: "user20",
    title: "Fender Telecaster '72 Thinline",
    subtitle: null,
    matched_saved_search: "Telecaster under $1,200", // Update savedSearchResults to use matched_saved_search instead of subtitle
    description: null,
    price: 1100,
    category: "Guitars",
    subcategory: null,
    condition: "Very Good",
    payment_methods: [],
    logistics: null,
    images: ["/fender-telecaster-1972-thinline-semi-hollow.jpg"],
    location: "Nashville, TN",
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updated_at: new Date().toISOString(),
    for_trade: true,
    published_groups: [
      { id: "g2", name: "Fender Fans", slug: "fender-fans", description: null, icon: "🎸", member_count: 3400 },
    ],
  },
  {
    id: "21",
    seller_id: "user21",
    title: "Squier Classic Vibe Tele",
    subtitle: null,
    matched_saved_search: "Telecaster under $1,200", // Update savedSearchResults to use matched_saved_search instead of subtitle
    description: null,
    price: 420,
    category: "Guitars",
    subcategory: null,
    condition: "Excellent",
    payment_methods: [],
    logistics: null,
    images: ["/squier-classic-vibe-telecaster-butterscotch-blonde.jpg"],
    location: "Austin, TX",
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    updated_at: new Date().toISOString(),
    for_trade: true,
    published_groups: [
      { id: "g2", name: "Fender Fans", slug: "fender-fans", description: null, icon: "🎸", member_count: 3400 },
    ],
  },
  {
    id: "22",
    seller_id: "user22",
    title: "Boss DD-7 Digital Delay",
    subtitle: null,
    matched_saved_search: "Boss delay pedals", // Update savedSearchResults to use matched_saved_search instead of subtitle
    description: null,
    price: 130,
    category: "Pedals",
    subcategory: null,
    condition: "Good",
    payment_methods: [],
    logistics: null,
    images: ["/boss-dd-7-digital-delay-pedal-white.jpg"],
    location: "Seattle, WA",
    created_at: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    updated_at: new Date().toISOString(),
    for_trade: true,
    published_groups: [
      { id: "g1", name: "Pedal Traders", slug: "pedal-traders", description: null, icon: "🎛️", member_count: 1200 },
      { id: "g6", name: "Boss Fans", slug: "boss-fans", description: null, icon: "🔶", member_count: 2100 },
    ],
  },
  {
    id: "23",
    seller_id: "user23",
    title: "Boss DM-2W Analog Delay",
    subtitle: null,
    matched_saved_search: "Boss delay pedals", // Update savedSearchResults to use matched_saved_search instead of subtitle
    description: null,
    price: 175,
    category: "Pedals",
    subcategory: null,
    condition: "Mint",
    payment_methods: [],
    logistics: null,
    images: ["/boss-dm-2w-waza-analog-delay-pedal.jpg"],
    location: "Portland, OR",
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    updated_at: new Date().toISOString(),
    for_trade: true,
    published_groups: [
      { id: "g1", name: "Pedal Traders", slug: "pedal-traders", description: null, icon: "🎛️", member_count: 1200 },
      { id: "g6", name: "Boss Fans", slug: "boss-fans", description: null, icon: "🔶", member_count: 2100 },
    ],
  },
  {
    id: "24",
    seller_id: "user24",
    title: "Fender Blues Deluxe Reissue",
    subtitle: null,
    matched_saved_search: "Fender tube amps", // Update savedSearchResults to use matched_saved_search instead of subtitle
    description: null,
    price: 750,
    category: "Amps",
    subcategory: null,
    condition: "Very Good",
    payment_methods: [],
    logistics: null,
    images: ["/fender-blues-deluxe-amp.jpg"],
    location: "Denver, CO",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updated_at: new Date().toISOString(),
    for_trade: true,
    published_groups: [
      { id: "g7", name: "Amp Collectors", slug: "amp-collectors", description: null, icon: "🔊", member_count: 1850 },
    ],
  },
]

const trendingListings: (DiscoverListing & { views: number })[] = [
  {
    id: "t1",
    seller_id: "user30",
    title: "1959 Gibson Les Paul Standard",
    subtitle: "Holy grail vintage burst",
    description: null,
    price: 285000,
    category: "Guitars",
    subcategory: null,
    condition: "Excellent",
    payment_methods: [],
    logistics: null,
    images: ["/gibson-les-paul-1959-vintage-sunburst-guitar.jpg"],
    location: "Nashville, TN",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updated_at: new Date().toISOString(),
    for_trade: true,
    published_groups: [
      { id: "g10", name: "Gibson Guild", slug: "gibson-guild", description: null, icon: "🎸", member_count: 2800 },
    ],
    views: 12453,
  },
  {
    id: "t2",
    seller_id: "user31",
    title: "Klon Centaur Gold",
    subtitle: "Original gold horsie",
    description: null,
    price: 4500,
    category: "Pedals",
    subcategory: null,
    condition: "Mint",
    payment_methods: [],
    logistics: null,
    images: ["/analogman-king-of-tone-overdrive-pedal.jpg"],
    location: "Los Angeles, CA",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updated_at: new Date().toISOString(),
    for_trade: false,
    published_groups: [
      {
        id: "g11",
        name: "Boutique Pedals",
        slug: "boutique-pedals",
        description: null,
        icon: "✨",
        member_count: 1560,
      },
    ],
    views: 8921,
  },
  {
    id: "t3",
    seller_id: "user32",
    title: "Fender Custom Shop '63 Strat",
    subtitle: "Heavy relic, sounds incredible",
    description: null,
    price: 4200,
    category: "Guitars",
    subcategory: null,
    condition: "Mint",
    payment_methods: [],
    logistics: null,
    images: ["/fender-stratocaster-olympic-white-electric-guitar.jpg"],
    location: "Austin, TX",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updated_at: new Date().toISOString(),
    for_trade: true,
    published_groups: [
      { id: "g2", name: "Fender Fans", slug: "fender-fans", description: null, icon: "🎸", member_count: 3400 },
    ],
    views: 7234,
  },
  {
    id: "t4",
    seller_id: "user33",
    title: "Dumble Overdrive Special",
    subtitle: "The legendary amp",
    description: null,
    price: 95000,
    category: "Amps",
    subcategory: null,
    condition: "Excellent",
    payment_methods: [],
    logistics: null,
    images: ["/fender-blues-junior-tube-amp-tweed.jpg"],
    location: "Miami, FL",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updated_at: new Date().toISOString(),
    for_trade: false,
    published_groups: [
      { id: "g7", name: "Amp Collectors", slug: "amp-collectors", description: null, icon: "🔊", member_count: 1850 },
    ],
    views: 6102,
  },
  {
    id: "t5",
    seller_id: "user34",
    title: "Moog Minimoog Model D",
    subtitle: "Vintage analog beast",
    description: null,
    price: 12500,
    category: "Synths",
    subcategory: null,
    condition: "Very Good",
    payment_methods: [],
    logistics: null,
    images: ["/sequential-prophet-6-synthesizer.jpg"],
    location: "Brooklyn, NY",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    updated_at: new Date().toISOString(),
    for_trade: true,
    published_groups: [
      { id: "g4", name: "Synth Swap", slug: "synth-swap", description: null, icon: "🎹", member_count: 890 },
    ],
    views: 5487,
  },
]

const justListedItems: DiscoverListing[] = [
  {
    id: "j1",
    seller_id: "user40",
    title: "EHX Big Muff Pi",
    subtitle: null,
    description: null,
    price: 85,
    category: "Pedals",
    subcategory: null,
    condition: "Very Good",
    payment_methods: [],
    logistics: null,
    images: ["/electro-harmonix-small-stone-phaser-pedal.jpg"],
    location: "Chicago, IL",
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    updated_at: new Date().toISOString(),
    for_trade: true,
    published_groups: [
      { id: "g1", name: "Pedal Traders", slug: "pedal-traders", description: null, icon: "🎛️", member_count: 1200 },
    ],
  },
  {
    id: "j2",
    seller_id: "user41",
    title: "PRS Custom 24",
    subtitle: null,
    description: null,
    price: 2800,
    category: "Guitars",
    subcategory: null,
    condition: "Excellent",
    payment_methods: [],
    logistics: null,
    images: ["/gibson-es-335-semi-hollow-cherry-red-guitar.jpg"],
    location: "Seattle, WA",
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    updated_at: new Date().toISOString(),
    for_trade: false,
    published_groups: [],
  },
  {
    id: "j3",
    seller_id: "user42",
    title: "Orange Micro Terror",
    subtitle: null,
    description: null,
    price: 120,
    category: "Amps",
    subcategory: null,
    condition: "Good",
    payment_methods: [],
    logistics: null,
    images: ["/fender-blues-deluxe-amp.jpg"],
    location: "Denver, CO",
    created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    updated_at: new Date().toISOString(),
    for_trade: true,
    published_groups: [
      { id: "g7", name: "Amp Collectors", slug: "amp-collectors", description: null, icon: "🔊", member_count: 1850 },
    ],
  },
  {
    id: "j4",
    seller_id: "user43",
    title: "Seymour Duncan JB/59 Set",
    subtitle: null,
    description: null,
    price: 150,
    category: "Accessories",
    subcategory: null,
    condition: "New",
    payment_methods: [],
    logistics: null,
    images: ["/ernie-ball-guitar-strings-pack.jpg"],
    location: "Portland, OR",
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    updated_at: new Date().toISOString(),
    for_trade: false,
    published_groups: [],
  },
  {
    id: "j5",
    seller_id: "user44",
    title: "Ibanez TS808 Reissue",
    subtitle: null,
    description: null,
    price: 180,
    category: "Pedals",
    subcategory: null,
    condition: "Excellent",
    payment_methods: [],
    logistics: null,
    images: ["/boss-ds-1-distortion-pedal-orange-keeley-mod.jpg"],
    location: "Austin, TX",
    created_at: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
    updated_at: new Date().toISOString(),
    for_trade: true,
    published_groups: [
      { id: "g1", name: "Pedal Traders", slug: "pedal-traders", description: null, icon: "🎛️", member_count: 1200 },
    ],
  },
]

const userStats = {
  collections: {
    total: 12,
    forSale: 3,
    forTrade: 5,
    inCollection: 4,
  },
  numCollections: 3,
  communities: [
    { id: "g1", name: "Pedal Traders", slug: "pedal-traders", icon: "🎛️", newListings: 8 },
    { id: "g2", name: "Fender Fans", slug: "fender-fans", icon: "🎸", newListings: 12 },
    { id: "g4", name: "Synth Swap", slug: "synth-swap", icon: "🎹", newListings: 3 },
  ],
  savedSearches: 4,
  watchlistCount: 7,
  collectionsCount: 5,
  followingUsers: 12,
}

export function HomeContent() {
  const caughtUpRef = useRef<HTMLDivElement>(null)
  const [isAtCaughtUp, setIsAtCaughtUp] = useState(false)
  const [hasPassedPause, setHasPassedPause] = useState(false)
  const scrollAccumulator = useRef(0)
  const SCROLL_THRESHOLD = 150 // Amount of scroll needed to "push through"

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            setIsAtCaughtUp(true)
            scrollAccumulator.current = 0
          } else {
            setIsAtCaughtUp(false)
            // Reset the pause state when scrolling back up
            if (!entry.isIntersecting) {
              setHasPassedPause(false)
            }
          }
        })
      },
      { threshold: [0.5] },
    )

    if (caughtUpRef.current) {
      observer.observe(caughtUpRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Only intercept when at the caught up section and haven't passed through yet
      if (isAtCaughtUp && !hasPassedPause && e.deltaY > 0) {
        scrollAccumulator.current += e.deltaY

        // If accumulated enough scroll, release the pause
        if (scrollAccumulator.current >= SCROLL_THRESHOLD) {
          setHasPassedPause(true)
        } else {
          // Prevent the scroll while accumulating
          e.preventDefault()
        }
      }
    }

    window.addEventListener("wheel", handleWheel, { passive: false })
    return () => window.removeEventListener("wheel", handleWheel)
  }, [isAtCaughtUp, hasPassedPause])

  return (
    <div
      className="min-h-screen pb-20 lg:pb-6 p-4 md:p-6 max-w-7xl mx-auto bg-background scroll-snap-y scroll-snap-proximity"
      style={{ scrollSnapType: "y mandatory" }}
    >
      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-20">
          {/* Clear Page Header */}
          <div className="mb-6">
            <h1 className="font-bold text-foreground text-4xl">{"SN / Guitars"}</h1>
            <p className="text-muted-foreground">Your personalized updates in the guitar community </p>
          </div>

          {/* Dashboard Cockpit */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* My Items Card */}
              <div className="group p-5 bg-card rounded-xl border border-border">
                <Link href="/collections?tab=collections&view=all-items" className="block">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      <span className="font-medium text-foreground">My Items</span>
                      <span className="text-sm text-muted-foreground">({userStats.collections.total})</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href="/my-stuff?tab=all-items&status=for-sale"
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 rounded-md text-sm hover:bg-green-500/20 transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-green-600 dark:text-green-400">{userStats.collections.forSale} For Sale</span>
                  </Link>
                  <Link
                    href="/my-stuff?tab=all-items&status=for-trade"
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 rounded-md text-sm hover:bg-blue-500/20 transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="text-blue-600 dark:text-blue-400">{userStats.collections.forTrade} For Trade</span>
                  </Link>
                  
                </div>
              </div>

              {/* Your Communities Card */}
              <div className="p-5 bg-card rounded-xl border border-border">
                <Link href="/communities" className="flex items-center justify-between mb-4 group">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">My Communities</span>
                    <span className="text-sm text-muted-foreground">({userStats.communities.length})</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                  {userStats.communities.map((community) => (
                    <Link
                      key={community.id}
                      href={`/communities/${community.slug}`}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-md text-sm hover:bg-primary/10 hover:border-primary/20 border border-transparent transition-all"
                    >
                      <span>{community.icon}</span>
                      <span className="text-muted-foreground truncate max-w-[100px]">{community.name}</span>
                      {community.newListings > 0 && (
                        <span className="text-xs text-primary font-medium">+{community.newListings}</span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Following Card */}
              <div className="p-5 bg-card rounded-xl border border-border">
                <Link href="/favorites" className="flex items-center justify-between mb-4 group">
                  <div className="flex items-center gap-2">
                    <HeartIcon className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">Following</span>
                    <span className="text-sm text-muted-foreground">
                      ({userStats.watchlistCount + userStats.collectionsCount + userStats.followingUsers + userStats.savedSearches})
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href="/favorites?tab=items"
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-md text-sm hover:bg-primary/10 hover:border-primary/20 border border-transparent transition-all"
                  >
                    <Package className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Items</span>
                    {userStats.watchlistCount > 0 && (
                      <span className="text-xs text-primary font-medium">+{userStats.watchlistCount}</span>
                    )}
                  </Link>
                  <Link
                    href="/favorites?tab=collections"
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-md text-sm hover:bg-primary/10 hover:border-primary/20 border border-transparent transition-all"
                  >
                    <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Collections</span>
                    {userStats.collectionsCount > 0 && (
                      <span className="text-xs text-primary font-medium">+{userStats.collectionsCount}</span>
                    )}
                  </Link>
                  <Link
                    href="/favorites?tab=users"
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-md text-sm hover:bg-primary/10 hover:border-primary/20 border border-transparent transition-all"
                  >
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Users</span>
                    {userStats.followingUsers > 0 && (
                      <span className="text-xs text-primary font-medium">+{userStats.followingUsers}</span>
                    )}
                  </Link>
                  <Link
                    href="/favorites?tab=searches"
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-md text-sm hover:bg-primary/10 hover:border-primary/20 border border-transparent transition-all"
                  >
                    <SearchIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Searches</span>
                    {userStats.savedSearches > 0 && (
                      <span className="text-xs text-primary font-medium">+{userStats.savedSearches}</span>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Action Items Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Action Required
              </h2>
              <Link
                href="/messages"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                View inbox
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="group">
              <div
                className="overflow-x-auto -mx-4 px-4 pb-2 scrollbar-thin"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "transparent transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.scrollbarColor = "rgba(255,255,255,0.2) transparent"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.scrollbarColor = "transparent transparent"
                }}
              >
                <div className="flex gap-4" style={{ width: "max-content" }}>
                  {actionItems.slice(0, 6).map((item) => (
                    <div key={item.id} className="w-[280px] flex-shrink-0">
                      <ActionCard
                        avatar={item.avatar}
                        username={item.username}
                        actionType={item.actionType}
                        itemTitle={item.itemTitle}
                        description={item.description}
                        amount={item.price}
                        timestamp={formatTimeAgo(item.timestamp)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Trade Matches - Use TradeInterestCard */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Repeat className="h-5 w-5 text-primary" />
                Most Recent Trade Matches
              </h2>
              <Link
                href="/trade"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                See more
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="group">
              <div
                className="overflow-x-auto -mx-4 px-4 pb-2"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "transparent transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.scrollbarColor = "rgba(255,255,255,0.2) transparent"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.scrollbarColor = "transparent transparent"
                }}
              >
                <div className="flex gap-4" style={{ width: "max-content" }}>
                  {sortedTradeMatches.map((match) => (
                    <div
                      key={match.id}
                      className="w-[calc((100vw-2rem-2rem)/3-11px)] min-w-[240px] max-w-[280px] flex-shrink-0"
                    >
                      <TradeInterestCard type="perfect" data={match} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Saved Searches - Use DiscoverListingCard */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                From Saved Searches
              </h2>
              <Link
                href="/discover"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Manage
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="group">
              <div
                className="overflow-x-auto -mx-4 px-4 pb-2"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "transparent transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.scrollbarColor = "rgba(255,255,255,0.2) transparent"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.scrollbarColor = "transparent transparent"
                }}
              >
                <div className="flex gap-4" style={{ width: "max-content" }}>
                  {savedSearchResults.map((listing) => (
                    <div key={listing.id} className="w-[280px] flex-shrink-0">
                      <DiscoverListingCard listing={listing} viewMode="grid" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Watchlist - Use DiscoverListingCard */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <HeartIcon className="h-5 w-5 text-primary" />
                From Items You Follow   
              </h2>
              <Link
                href="/saved"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Manage
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="group">
              <div
                className="overflow-x-auto -mx-4 px-4 pb-2"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "transparent transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.scrollbarColor = "rgba(255,255,255,0.2) transparent"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.scrollbarColor = "transparent transparent"
                }}
              >
                <div className="flex gap-4" style={{ width: "max-content" }}>
                  {watchlistItems.map((listing) => (
                    <div key={listing.id} className="w-[280px] flex-shrink-0">
                      <DiscoverListingCard listing={listing} viewMode="grid" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Following Activity - Use DiscoverListingCard */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                From Collections and People You Follow
              </h2>
              <Link
                href="/discover"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                See more
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="group">
              <div
                className="overflow-x-auto -mx-4 px-4 pb-2"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "transparent transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.scrollbarColor = "rgba(255,255,255,0.2) transparent"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.scrollbarColor = "transparent transparent"
                }}
              >
                <div className="flex gap-4" style={{ width: "max-content" }}>
                  {followedActivity.map((listing) => (
                    <div key={listing.id} className="w-[280px] flex-shrink-0">
                      <DiscoverListingCard listing={listing} viewMode="grid" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Communities - Use DiscoverListingCard */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-primary" />
                Most Recent From Your Communities
              </h2>
              <Link
                href="/communities"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                See all communities
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="group">
              <div
                className="overflow-x-auto -mx-4 px-4 pb-2"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "transparent transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.scrollbarColor = "rgba(255,255,255,0.2) transparent"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.scrollbarColor = "transparent transparent"
                }}
              >
                <div className="flex gap-4" style={{ width: "max-content" }}>
                  {communityListings
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 5)
                    .map((listing) => {
                      const communityName = listing.published_groups?.[0]?.name || "a community"
                      const timeAgo = formatTimeAgo(listing.created_at)
                      const dynamicSubtitle = `Listed ${timeAgo} in ${communityName}`
                      return (
                        <div key={listing.id} className="w-[280px] flex-shrink-0">
                          <DiscoverListingCard listing={{ ...listing, subtitle: dynamicSubtitle }} viewMode="grid" />
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>
          </section>

          {/* End state */}
          <div
            ref={caughtUpRef}
            className="flex flex-col items-center justify-center py-20 text-center"
            style={{ scrollSnapAlign: "start", scrollMarginTop: "0px" }}
          >
            <CheckCircle2 className="h-10 w-10 text-muted-foreground/50 mb-2" />
            <h3 className="text-base font-medium text-foreground mb-1">You're all caught up</h3>
            <p className="text-xs text-muted-foreground">
              Your personalized feed ends here. Keep scrolling to explore more.
            </p>
            <div className="mt-6 w-full max-w-md border-t border-border" />
          </div>

          {/* Non-personalized content below */}
          <div className="space-y-16 pt-4">
            {/* Trending Listings */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  Trending Listings
                </h2>
                <Link
                  href="/discover?sort=views"
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  See more
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="group">
                <div
                  className="overflow-x-auto -mx-4 px-4 pb-2"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "transparent transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.scrollbarColor = "rgba(255,255,255,0.2) transparent"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.scrollbarColor = "transparent transparent"
                  }}
                >
                  <div className="flex gap-4" style={{ width: "max-content" }}>
                    {trendingListings.slice(0, 5).map((listing) => (
                      <div key={listing.id} className="w-[280px] flex-shrink-0">
                        <DiscoverListingCard listing={listing} viewMode="grid" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Just Listed */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-muted-foreground" />
                  Just Listed
                </h2>
                <Link
                  href="/discover?sort=newest"
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  See more
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="group">
                <div
                  className="overflow-x-auto -mx-4 px-4 pb-2"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "transparent transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.scrollbarColor = "rgba(255,255,255,0.2) transparent"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.scrollbarColor = "transparent transparent"
                  }}
                >
                  <div className="flex gap-4" style={{ width: "max-content" }}>
                    {justListedItems.slice(0, 5).map((listing) => (
                      <div key={listing.id} className="w-[280px] flex-shrink-0">
                        <DiscoverListingCard
                          listing={{
                            ...listing,
                            subtitle: `Listed ${formatTimeAgo(listing.created_at)}`,
                          }}
                          viewMode="grid"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Live Activity Sidebar - only visible on xl screens */}
      </div>
    </div>
  )
}
