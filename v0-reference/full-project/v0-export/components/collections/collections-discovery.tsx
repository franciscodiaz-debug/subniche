"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import type React from "react"
import { useState, useRef } from "react"
import { Search, ChevronLeft, ChevronRight, Flame, Clock, Star, Music, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"
import { DiscoveryCollectionCard } from "./discovery-collection-card"
import { DiscoveryItemCard } from "./discovery-item-card"

// Demo data for discovery feed
const trendingCollections = [
  {
    id: "trend-1",
    name: "Holy Grail Guitars",
    description: "Museum-quality vintage instruments",
    item_count: 12,
    total_value: 850000,
    images: [
      "/1959-gibson-les-paul-standard.jpg",
      "/1963-fender-stratocaster.jpg",
      "/1952-telecaster-butterscotch.jpg",
      "/1960-gibson-es-335.jpg",
    ],
    user: {
      username: "vintage_vault",
      avatar: "/vintage-collector-avatar.jpg",
    },
    likes: 342,
  },
  {
    id: "trend-2",
    name: "Boutique Pedal Paradise",
    description: "Hand-built tone machines",
    item_count: 24,
    total_value: 12500,
    images: [
      "/klon-centaur-overdrive-pedal.jpg",
      "/strymon-timeline-delay-pedal.jpg",
      "/big-muff-fuzz-pedal.jpg",
      "/boss-tuner-pedal.jpg",
    ],
    user: {
      username: "pedalhead",
      avatar: "/musician-avatar.png",
    },
    likes: 218,
  },
  {
    id: "trend-3",
    name: "Tweed & Plexi Era",
    description: "Golden age amplifiers",
    item_count: 8,
    total_value: 95000,
    images: [
      "/fender-twin-reverb-amp.jpg",
      "/marshall-plexi-amp.jpg",
      "/vox-ac30-amp.jpg",
      "/fender-deluxe-reverb-amp.jpg",
    ],
    user: {
      username: "ampologist",
      avatar: "/amp-collector.jpg",
    },
    likes: 156,
  },
  {
    id: "trend-4",
    name: "Japanese Craftsmanship",
    description: "Tokai, Greco, Fernandes gems",
    item_count: 15,
    total_value: 28000,
    images: [
      "/tokai-les-paul-guitar.jpg",
      "/greco-stratocaster-guitar.jpg",
      "/fernandes-guitar.jpg",
      "/japanese-vintage-guitar.jpg",
    ],
    user: {
      username: "nihon_guitars",
      avatar: "/japanese-collector.jpg",
    },
    likes: 189,
  },
]

const recentItems = [
  {
    id: "recent-1",
    title: "1965 Fender Jazz Bass",
    price: 8500,
    image: "/fender-jazz-bass-sunburst.jpg",
    user: { username: "bassmaster", avatar: "/bass-player.jpg" },
    collection: "Vintage Basses",
  },
  {
    id: "recent-2",
    title: "Dumble Overdrive Special",
    price: 125000,
    image: "/dumble-amp.jpg",
    user: { username: "tone_chaser", avatar: "/guitarist.png" },
    collection: "Legendary Amps",
  },
  {
    id: "recent-3",
    title: "Original Klon Centaur",
    price: 4200,
    image: "/klon-centaur-gold.jpg",
    user: { username: "pedal_nerd", avatar: "/pedal-collector.jpg" },
    collection: null,
  },
  {
    id: "recent-4",
    title: "1957 Gretsch White Falcon",
    price: 32000,
    image: "/gretsch-white-falcon-guitar.jpg",
    user: { username: "rockabilly_jim", avatar: "/rockabilly-musician.jpg" },
    collection: "Hollow Bodies",
  },
  {
    id: "recent-5",
    title: "Mesa Boogie Mark IIC+",
    price: 6500,
    image: "/mesa-boogie-mark-iic-amp.jpg",
    user: { username: "metal_mike", avatar: "/metal-guitarist.jpg" },
    collection: "High Gain Heroes",
  },
  {
    id: "recent-6",
    title: "1969 Marshall Super Lead",
    price: 8900,
    image: "/marshall-plexi-amp.jpg",
    user: { username: "classic_rock", avatar: "/rock-musician.jpg" },
    collection: "British Invasion",
  },
]

const vintageGuitars = [
  {
    id: "vintage-1",
    name: "Pre-War Martins",
    description: "Depression-era acoustics",
    item_count: 6,
    total_value: 180000,
    images: ["/martin-d28-prewar.jpg", "/martin-000-18-vintage.jpg", "/martin-d45-vintage.jpg", "/martin-om-28.jpg"],
    user: { username: "acoustic_archive", avatar: "/acoustic-collector.jpg" },
    likes: 267,
  },
  {
    id: "vintage-2",
    name: "Burst Collection",
    description: "1958-1960 Les Pauls",
    item_count: 4,
    total_value: 1200000,
    images: [
      "/1959-les-paul-burst.jpg",
      "/1960-les-paul-burst.jpg",
      "/1958-les-paul-burst.jpg",
      "/les-paul-flame-top.jpg",
    ],
    user: { username: "burst_hunter", avatar: "/les-paul-collector.jpg" },
    likes: 512,
  },
  {
    id: "vintage-3",
    name: "Blackguard Telecasters",
    description: "1950-1954 originals",
    item_count: 5,
    total_value: 175000,
    images: [
      "/1952-telecaster-butterscotch.jpg",
      "/1953-telecaster-blonde.jpg",
      "/1954-telecaster.jpg",
      "/blackguard-tele.jpg",
    ],
    user: { username: "tele_fanatic", avatar: "/telecaster-collector.jpg" },
    likes: 198,
  },
]

const pedalCollections = [
  {
    id: "pedal-1",
    name: "Analog Delays",
    description: "Bucket brigade beauties",
    item_count: 18,
    total_value: 8500,
    images: ["/boss-dm2-delay.jpg", "/mxr-carbon-copy.jpg", "/deluxe-memory-man.jpg", "/way-huge-aqua-puss.jpg"],
    user: { username: "analog_addict", avatar: "/delay-pedal-collector.jpg" },
    likes: 145,
  },
  {
    id: "pedal-2",
    name: "Fuzz Face Family",
    description: "Silicon and germanium",
    item_count: 22,
    total_value: 6200,
    images: [
      "/dallas-arbiter-fuzz-face.jpg",
      "/dunlop-fuzz-face.jpg",
      "/analogman-sunface.jpg",
      "/zvex-fuzz-factory.jpg",
    ],
    user: { username: "fuzz_lord", avatar: "/fuzz-pedal-collector.jpg" },
    likes: 178,
  },
]

const curatedMixed = [
  {
    type: "collection" as const,
    id: "curated-1",
    name: "Nashville Session Rigs",
    description: "Working pro setups",
    item_count: 8,
    total_value: 45000,
    images: [
      "/telecaster-nashville.jpg",
      "/deluxe-reverb-studio.jpg",
      "/compressor-pedal.jpg",
      "/studio-guitar-rig.jpg",
    ],
    user: { username: "session_pro", avatar: "/session-musician.jpg" },
    likes: 234,
  },
  {
    type: "item" as const,
    id: "curated-2",
    title: "1964 Vox AC30 Top Boost",
    price: 5800,
    image: "/vox-ac30-vintage.jpg",
    user: { username: "brit_sounds", avatar: "/british-amp-collector.jpg" },
    collection: "British Classics",
  },
  {
    type: "collection" as const,
    id: "curated-3",
    name: "Surf & Reverb",
    description: "Drip and twang essentials",
    item_count: 11,
    total_value: 18000,
    images: ["/fender-reverb-unit.jpg", "/jazzmaster-surf.jpg", "/mosrite-ventures.jpg", "/fender-spring-reverb.jpg"],
    user: { username: "surf_king", avatar: "/placeholder.svg?height=32&width=32" },
    likes: 156,
  },
  {
    type: "item" as const,
    id: "curated-4",
    title: "Echoplex EP-3",
    price: 2200,
    image: "/echoplex-ep3.jpg",
    user: { username: "tape_head", avatar: "/placeholder.svg?height=24&width=24" },
    collection: "Tape Machines",
  },
  {
    type: "collection" as const,
    id: "curated-5",
    name: "80s Shred Machines",
    description: "Superstrats and hot rods",
    item_count: 14,
    total_value: 32000,
    images: ["/ibanez-jem.jpg", "/jackson-soloist.jpg", "/charvel-superstrat.jpg", "/kramer-guitar.jpg"],
    user: { username: "shred_master", avatar: "/placeholder.svg?height=32&width=32" },
    likes: 289,
  },
  {
    type: "item" as const,
    id: "curated-6",
    title: "1978 Roland Jazz Chorus",
    price: 1800,
    image: "/roland-jazz-chorus.jpg",
    user: { username: "clean_machine", avatar: "/placeholder.svg?height=24&width=24" },
    collection: "Solid State Gems",
  },
]

interface DiscoverySection {
  id: string
  title: string
  icon: React.ElementType
  type: "collections" | "items" | "mixed"
  data: any[]
}

export function CollectionsDiscovery() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("explore") // Declare activeTab
  const searchParams = useSearchParams()
  const viewParam = searchParams.get("view") || "collections" // Declare viewParam

  const sections: DiscoverySection[] = [
    { id: "trending", title: "Trending Collections", icon: Flame, type: "collections", data: trendingCollections },
    { id: "recent", title: "Recently Added", icon: Clock, type: "items", data: recentItems },
    { id: "vintage", title: "Vintage Guitars", icon: Music, type: "collections", data: vintageGuitars },
    { id: "pedals", title: "Pedal Collections", icon: Wrench, type: "collections", data: pedalCollections },
    { id: "curated", title: "Curated by Community", icon: Star, type: "mixed", data: curatedMixed },
  ]

  return (
    <div className="min-h-screen">
      <div className="p-6 lg:p-8">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-foreground mb-2">Explore Collections</h2>
          <p className="text-muted-foreground">
            Discover curated collections and find inspiration from the community
          </p>
        </div>

        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search collections, items, or collectors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50"
          />
        </div>

        <div className="space-y-10">
          {sections.map((section) => (
            <DiscoverySectionRow key={section.id} section={section} />
          ))}
        </div>
      </div>
    </div>
  )
}

function DiscoverySectionRow({ section }: { section: DiscoverySection }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10)
    }
  }

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const Icon = section.icon

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={cn(
              "p-1.5 rounded-lg border border-border transition-colors",
              canScrollLeft ? "text-foreground hover:bg-card" : "text-muted-foreground/30 cursor-not-allowed",
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={cn(
              "p-1.5 rounded-lg border border-border transition-colors",
              canScrollRight ? "text-foreground hover:bg-card" : "text-muted-foreground/30 cursor-not-allowed",
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-6 px-6 lg:-mx-8 lg:px-8"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {section.type === "collections" &&
          section.data.map((collection: any) => (
            <DiscoveryCollectionCard key={collection.id} collection={collection} />
          ))}

        {section.type === "items" && section.data.map((item: any) => <DiscoveryItemCard key={item.id} item={item} />)}

        {section.type === "mixed" &&
          section.data.map((item: any) =>
            item.type === "collection" ? (
              <DiscoveryCollectionCard key={item.id} collection={item} />
            ) : (
              <DiscoveryItemCard key={item.id} item={item} />
            ),
          )}
      </div>
    </div>
  )
}
