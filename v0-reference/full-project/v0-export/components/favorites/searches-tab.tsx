"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Settings, ChevronRight, ChevronLeft, Bell, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DiscoverListingCard } from "@/components/discover/discover-listing-card"
import type { Listing, Community } from "@/lib/types"

interface DiscoverListing extends Listing {
  for_trade?: boolean
  is_private?: boolean
  published_groups?: Community[]
  matched_saved_search?: string
}

// Demo matching items for each search
const demoMatchingItems: Record<string, DiscoverListing[]> = {
  "vintage-les-pauls": [
    {
      id: "1",
      seller_id: "user1",
      title: "1959 Gibson Les Paul Standard",
      subtitle: null,
      matched_saved_search: "vintage les paul",
      description: null,
      price: 185000,
      category: "Guitars",
      subcategory: null,
      condition: "Excellent",
      payment_methods: [],
      logistics: null,
      images: ["/gibson-les-paul-1959-vintage-electric-guitar.jpg"],
      location: "Nashville, TN",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      for_trade: false,
      published_groups: [{ id: "g1", name: "Gibson Fans", slug: "gibson-fans", description: null, icon: "🎸", member_count: 5200 }],
    },
    {
      id: "2",
      seller_id: "user2",
      title: "1958 Les Paul Goldtop",
      subtitle: null,
      matched_saved_search: "vintage les paul",
      description: null,
      price: 125000,
      category: "Guitars",
      subcategory: null,
      condition: "Very Good",
      payment_methods: [],
      logistics: null,
      images: ["/gibson-les-paul-gold-top-electric-guitar.jpg"],
      location: "Austin, TX",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      for_trade: true,
      published_groups: [{ id: "g1", name: "Gibson Fans", slug: "gibson-fans", description: null, icon: "🎸", member_count: 5200 }],
    },
    {
      id: "3",
      seller_id: "user3",
      title: "1960 Les Paul Standard Burst",
      subtitle: null,
      matched_saved_search: "vintage les paul",
      description: null,
      price: 275000,
      category: "Guitars",
      subcategory: null,
      condition: "Mint",
      payment_methods: [],
      logistics: null,
      images: ["/gibson-les-paul-sunburst-guitar.jpg"],
      location: "Los Angeles, CA",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      for_trade: false,
      published_groups: [{ id: "g1", name: "Gibson Fans", slug: "gibson-fans", description: null, icon: "🎸", member_count: 5200 }],
    },
  ],
  "klon-centaur": [
    {
      id: "7",
      seller_id: "user7",
      title: "Klon Centaur Gold",
      subtitle: null,
      matched_saved_search: "klon centaur",
      description: null,
      price: 5200,
      category: "Pedals",
      subcategory: null,
      condition: "Mint",
      payment_methods: [],
      logistics: null,
      images: ["/klon-centaur-overdrive-pedal.jpg"],
      location: "Portland, OR",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      for_trade: false,
      published_groups: [{ id: "g2", name: "Pedal Traders", slug: "pedal-traders", description: null, icon: "🎛️", member_count: 1200 }],
    },
    {
      id: "8",
      seller_id: "user8",
      title: "Klon Centaur Silver",
      subtitle: null,
      matched_saved_search: "klon centaur",
      description: null,
      price: 4800,
      category: "Pedals",
      subcategory: null,
      condition: "Excellent",
      payment_methods: [],
      logistics: null,
      images: ["/klon-centaur-gold-overdrive-pedal.jpg"],
      location: "Seattle, WA",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      for_trade: true,
      published_groups: [{ id: "g2", name: "Pedal Traders", slug: "pedal-traders", description: null, icon: "🎛️", member_count: 1200 }],
    },
  ],
  "fender-amps": [
    {
      id: "11",
      seller_id: "user11",
      title: "1965 Fender Twin Reverb",
      subtitle: null,
      matched_saved_search: "fender tube amp",
      description: null,
      price: 3200,
      category: "Amps",
      subcategory: null,
      condition: "Very Good",
      payment_methods: [],
      logistics: null,
      images: ["/fender-twin-reverb-amp.jpg"],
      location: "Denver, CO",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      for_trade: false,
      published_groups: [{ id: "g3", name: "Fender Fans", slug: "fender-fans", description: null, icon: "🎸", member_count: 3400 }],
    },
    {
      id: "12",
      seller_id: "user12",
      title: "1964 Fender Deluxe Reverb",
      subtitle: null,
      matched_saved_search: "fender tube amp",
      description: null,
      price: 4500,
      category: "Amps",
      subcategory: null,
      condition: "Excellent",
      payment_methods: [],
      logistics: null,
      images: ["/fender-blues-deluxe-amp.jpg"],
      location: "Chicago, IL",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      for_trade: false,
      published_groups: [{ id: "g3", name: "Fender Fans", slug: "fender-fans", description: null, icon: "🎸", member_count: 3400 }],
    },
  ],
}

// Demo saved searches
const demoSearches = [
  {
    id: "vintage-les-pauls",
    name: '"vintage les paul"',
    filterSummary: "Excellent / Very Good, Gibson, made in 1950s-1960s, between $50k-$300k, Electric Guitars",
    matchCount: 24,
    alerts: { enabled: true, email: true, sms: false, frequency: "instant" },
  },
  {
    id: "klon-centaur",
    name: '"klon centaur"',
    filterSummary: "Klon, Mint / Excellent, between $3k-$10k, Effects Pedals",
    matchCount: 8,
    alerts: { enabled: true, email: true, sms: true, frequency: "daily" },
  },
  {
    id: "fender-amps",
    name: '"fender tube amp"',
    filterSummary: "Fender, between $500-$10k, Tube Amplifiers",
    matchCount: 31,
    alerts: { enabled: false, email: false, sms: false, frequency: "weekly" },
  },
]

interface SavedSearchShelfProps {
  search: typeof demoSearches[0]
  items: typeof demoMatchingItems["vintage-les-pauls"]
  onSettingsClick: () => void
}

function SavedSearchShelf({ search, items, onSettingsClick }: SavedSearchShelfProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
      setTimeout(checkScroll, 300)
    }
  }

  return (
    <div className="mb-10">
      {/* Search Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">{search.name}</h2>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={onSettingsClick}
              title="Search settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">{search.filterSummary}</p>
        </div>
        <Link
          href={`/discover?saved=${search.id}`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors flex-shrink-0 ml-4"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Horizontal Scrolling Items */}
      <div className="relative group">
        {/* Scroll Left Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-background/90 backdrop-blur-sm border border-border rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity -ml-5"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Items Row */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-[280px] snap-start">
              <DiscoverListingCard listing={item} viewMode="grid" />
            </div>
          ))}
        </div>

        {/* Scroll Right Button */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-background/90 backdrop-blur-sm border border-border rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity -mr-5"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}

export function SearchesTab() {
  const [searches, setSearches] = useState(demoSearches)
  const [editingSearch, setEditingSearch] = useState<typeof demoSearches[0] | null>(null)

  return (
    <div>
      {searches.length > 0 ? (
        <div>
          <div className="mb-6">
            <span className="text-sm text-muted-foreground">Following {searches.length} searches</span>
          </div>
          {searches.map((search) => (
            <SavedSearchShelf
              key={search.id}
              search={search}
              items={demoMatchingItems[search.id as keyof typeof demoMatchingItems] || []}
              onSettingsClick={() => setEditingSearch(search)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No saved searches yet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Save your search criteria and get notified when new items match
          </p>
          <Button asChild>
            <Link href="/discover">Browse Items</Link>
          </Button>
        </div>
      )}

      {/* Settings Dialog */}
      <Dialog open={!!editingSearch} onOpenChange={(open) => !open && setEditingSearch(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Alert Settings</DialogTitle>
          </DialogHeader>
          {editingSearch && (
            <div className="space-y-6 py-4">
              <div className="pb-4 border-b border-border">
                <p className="font-medium text-foreground">{editingSearch.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{editingSearch.filterSummary}</p>
              </div>

              {/* Enable/Disable */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Enable Alerts</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get notified when new items match
                  </p>
                </div>
                <Switch defaultChecked={editingSearch.alerts.enabled} />
              </div>

              {/* Channels */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Notification Channels</Label>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Email notifications</span>
                  <Switch defaultChecked={editingSearch.alerts.email} />
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">SMS notifications</span>
                  <Switch defaultChecked={editingSearch.alerts.sms} />
                </div>
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Frequency</Label>
                <Select defaultValue={editingSearch.alerts.frequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">Instant</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Digest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1">Save Settings</Button>
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive bg-transparent"
                  onClick={() => {
                    setSearches(searches.filter((s) => s.id !== editingSearch.id))
                    setEditingSearch(null)
                  }}
                >
                  Delete Search
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
