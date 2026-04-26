"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Plus, FolderOpen, TrendingUp, Grid3X3, List, Search, Sparkles, Compass } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { Collection, CollectionItem } from "@/lib/types"
import { CollectionCard } from "./collection-card"
import { MasterList } from "./master-list"
import { CollectionDetailView } from "./collection-detail-view"

interface CollectionManagerProps {
  initialView?: "collections" | "all-items"
}

const demoCollections: Collection[] = [
  {
    id: "demo-collection-1",
    user_id: "demo-user",
    name: "My Guitars",
    description: "My personal guitar collection",
    cover_image: "/electric-guitars-collection.jpg",
    is_wishlist: false,
    visibility: "public",
    share_token: "demo-token-1",
    notes: "Started collecting in 2015. Focus on vintage American guitars from the 50s-70s.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    item_count: 3,
    total_user_value: 234200,
    total_ai_value: 270800,
  },
  {
    id: "demo-collection-2",
    user_id: "demo-user",
    name: "Pedal Board",
    description: "Effects pedals I've collected",
    cover_image: "/guitar-pedals-board.jpg",
    is_wishlist: false,
    visibility: "unlisted",
    share_token: "demo-token-2",
    notes: "Current board setup: Tuner > Klon > Strymon.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    item_count: 3,
    total_user_value: 4960,
    total_ai_value: 5620,
  },
  {
    id: "demo-wishlist-1",
    user_id: "demo-user",
    name: "Dream Guitars",
    description: "Guitars I want to own someday",
    cover_image: "/vintage-gibson-les-paul.jpg",
    is_wishlist: true,
    visibility: "private",
    share_token: "demo-token-3",
    notes: "The ultimate bucket list.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    item_count: 3,
    total_user_value: 603500,
    total_ai_value: 678200,
  },
]

const demoItemImages: Record<string, string[]> = {
  "demo-collection-1": [
    "/vintage-fender-stratocaster-guitar.jpg",
    "/gibson-les-paul-sunburst-guitar.jpg",
    "/martin-acoustic-guitar.jpg",
    "/prs-custom-24-guitar.jpg",
  ],
  "demo-collection-2": [
    "/boss-tuner-pedal.jpg",
    "/klon-centaur-overdrive-pedal.jpg",
    "/strymon-timeline-delay-pedal.jpg",
    "/big-muff-fuzz-pedal.jpg",
  ],
  "demo-wishlist-1": [
    "/1959-gibson-les-paul-standard.jpg",
    "/1963-fender-stratocaster.jpg",
    "/1952-telecaster-butterscotch.jpg",
    "/1960-gibson-es-335.jpg",
  ],
}

const demoMasterListItems: (CollectionItem & { collection?: Collection })[] = [
  {
    id: "demo-item-1",
    collection_id: "demo-collection-1",
    listing_id: null,
    title: "1962 Fender Stratocaster",
    subtitle: "Sunburst finish, all original",
    description: "Amazing vintage strat",
    images: ["/vintage-fender-stratocaster-guitar.jpg"],
    category: "Guitars",
    subcategory: "Electric",
    condition: "Excellent",
    user_estimated_value: 45000,
    ai_suggested_value: 52000,
    ai_value_updated_at: new Date().toISOString(),
    purchase_price: 35000,
    purchase_date: "2020-03-15",
    is_owned: true,
    priority: 1,
    notes: null,
    custom_attributes: {},
    sort_order: 1,
    for_sale: true,
    for_trade: true,
    asking_price: 48000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    collection: demoCollections[0],
  },
  {
    id: "demo-item-2",
    collection_id: "demo-collection-1",
    listing_id: null,
    title: "Gibson Les Paul Standard",
    subtitle: "Cherry Sunburst, 2019",
    description: "Modern classic",
    images: ["/gibson-les-paul-sunburst-guitar.jpg"],
    category: "Guitars",
    subcategory: "Electric",
    condition: "Mint",
    user_estimated_value: 2800,
    ai_suggested_value: 2600,
    ai_value_updated_at: new Date().toISOString(),
    purchase_price: 2500,
    purchase_date: "2019-06-20",
    is_owned: true,
    priority: 2,
    notes: null,
    custom_attributes: {},
    sort_order: 2,
    for_sale: false,
    for_trade: true,
    asking_price: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    collection: demoCollections[0],
  },
  {
    id: "demo-item-3",
    collection_id: "demo-collection-2",
    listing_id: null,
    title: "Klon Centaur Overdrive",
    subtitle: "Gold horsie, original",
    description: "The holy grail of overdrives",
    images: ["/klon-centaur-overdrive-pedal.jpg"],
    category: "Pedals",
    subcategory: "Overdrive",
    condition: "Excellent",
    user_estimated_value: 3500,
    ai_suggested_value: 4200,
    ai_value_updated_at: new Date().toISOString(),
    purchase_price: 1800,
    purchase_date: "2015-09-10",
    is_owned: true,
    priority: 1,
    notes: null,
    custom_attributes: {},
    sort_order: 1,
    for_sale: true,
    for_trade: false,
    asking_price: 3800,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    collection: demoCollections[1],
  },
  {
    id: "demo-item-4",
    collection_id: null,
    listing_id: null,
    title: "Vintage Tube Amp",
    subtitle: "Needs restoration",
    description: "Found at estate sale",
    images: ["/vintage-tube-amp.jpg"],
    category: "Amplifiers",
    subcategory: "Tube",
    condition: "Fair",
    user_estimated_value: 800,
    ai_suggested_value: null,
    ai_value_updated_at: null,
    purchase_price: 200,
    purchase_date: "2024-01-15",
    is_owned: true,
    priority: 0,
    notes: "Needs new caps and tubes",
    custom_attributes: {},
    sort_order: 0,
    for_sale: false,
    for_trade: false,
    asking_price: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    collection: undefined,
  },
  {
    id: "demo-item-5",
    collection_id: null,
    listing_id: null,
    title: "Mystery Pickup Set",
    subtitle: "Unmarked humbuckers",
    description: "Acquired in trade",
    images: ["/guitar-humbucker-pickups.jpg"],
    category: "Parts",
    subcategory: "Pickups",
    condition: "Good",
    user_estimated_value: null,
    ai_suggested_value: null,
    ai_value_updated_at: null,
    purchase_price: null,
    purchase_date: null,
    is_owned: true,
    priority: 0,
    notes: "Need to test and identify",
    custom_attributes: {},
    sort_order: 0,
    for_sale: false,
    for_trade: false,
    asking_price: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    collection: undefined,
  },
]

const onboardingSteps = [
  {
    id: "welcome",
    targetSelector: "[data-onboarding='header']",
    title: "Welcome to your Collection",
    description:
      "Document all your gear in one place. Track values, organize by category, and share with the community.",
    position: "bottom" as const,
  },
  {
    id: "create",
    targetSelector: "[data-onboarding='create-btn']",
    title: "Create your first collection",
    description:
      "Start by creating a collection for your gear. You can make collections for different categories like 'Guitars' or 'Pedals'.",
    position: "bottom" as const,
  },
  {
    id: "filters",
    targetSelector: "[data-onboarding='filters']",
    title: "Organize with filters",
    description: "Switch between your owned collections and wishlists. Search to find specific items quickly.",
    position: "bottom" as const,
  },
  {
    id: "stats",
    targetSelector: "[data-onboarding='stats']",
    title: "Track your collection value",
    description:
      "See your total collection value at a glance. We'll even provide AI estimates to help you understand market value.",
    position: "bottom" as const,
  },
]

export function CollectionManager({ initialView = "collections" }: CollectionManagerProps) {
  const searchParams = useSearchParams()
  const [collections, setCollections] = useState<Collection[]>([])
  const [collectionItemImages, setCollectionItemImages] = useState<Record<string, string[]>>({})
  const [allItems, setAllItems] = useState<(CollectionItem & { collection?: Collection })[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)
  const [view, setView] = useState<"grid" | "list">("grid")
  const [itemsView, setItemsView] = useState<"grid" | "list">("grid")
  const [filter, setFilter] = useState<"all" | "owned" | "wishlist">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)

  const [isInventoryExpanded, setIsInventoryExpanded] = useState(initialView === "all-items")

  useEffect(() => {
    setIsInventoryExpanded(initialView === "all-items")
  }, [initialView])

  useEffect(() => {
    const loadCollections = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUserId(user.id)
        setIsDemo(false)

        const { data: collectionsData } = await supabase
          .from("collections")
          .select(`
            *,
            collection_items (
              id,
              images,
              user_estimated_value,
              ai_suggested_value,
              is_owned
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (collectionsData) {
          const collectionsWithStats: Collection[] = collectionsData.map((collection: any) => {
            const items = collection.collection_items || []
            const ownedItems = items.filter((item: any) => item.is_owned)

            return {
              ...collection,
              item_count: items.length,
              total_user_value: ownedItems.reduce(
                (sum: number, item: any) => sum + (item.user_estimated_value || 0),
                0,
              ),
              total_ai_value: ownedItems.reduce((sum: number, item: any) => sum + (item.ai_suggested_value || 0), 0),
              collection_items: undefined,
            }
          })
          setCollections(collectionsWithStats)

          const imagesMap: Record<string, string[]> = {}
          collectionsData.forEach((collection: any) => {
            const items = collection.collection_items || []
            const images = items
              .flatMap((item: any) => item.images || [])
              .filter((img: string) => img)
              .slice(0, 4)
            imagesMap[collection.id] = images
          })
          setCollectionItemImages(imagesMap)
        }

        const { data: allItemsData } = await supabase
          .from("collection_items")
          .select(`
            *,
            collection:collections (
              id,
              name,
              is_wishlist,
              visibility
            )
          `)
          .order("updated_at", { ascending: false })

        if (allItemsData) {
          setAllItems(allItemsData as any)
        }
      } else {
        setUserId("demo-user")
        setIsDemo(true)
        setCollections(demoCollections)
        setCollectionItemImages(demoItemImages)
        setAllItems(demoMasterListItems)
      }
      setIsLoading(false)
    }

    loadCollections()
  }, [])

  const filteredCollections = collections.filter((collection) => {
    const matchesFilter =
      filter === "all" ? true : filter === "wishlist" ? collection.is_wishlist : !collection.is_wishlist

    const matchesSearch = collection.name.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const ownedCollections = collections.filter((c) => !c.is_wishlist)
  const wishlistCollections = collections.filter((c) => c.is_wishlist)
  const totalUserValue = ownedCollections.reduce((sum, c) => sum + (c.total_user_value || 0), 0)
  const totalAiValue = ownedCollections.reduce((sum, c) => sum + (c.total_ai_value || 0), 0)
  const totalItems = ownedCollections.reduce((sum, c) => sum + (c.item_count || 0), 0)

  const handleCollectionCreated = (newCollection: Collection) => {
    setCollections((prev) => [newCollection, ...prev])
    setIsCreateModalOpen(false)
  }

  const handleCollectionUpdated = (updatedCollection: Collection) => {
    setCollections((prev) => prev.map((c) => (c.id === updatedCollection.id ? updatedCollection : c)))
    setSelectedCollection(updatedCollection)
  }

  const handleCollectionDeleted = (collectionId: string) => {
    setCollections((prev) => prev.filter((c) => c.id !== collectionId))
    setSelectedCollection(null)
  }

  const handleItemUpdate = (updatedItem: CollectionItem) => {
    setAllItems((prev) => prev.map((item) => (item.id === updatedItem.id ? { ...item, ...updatedItem } : item)))
  }

  const handleItemDelete = (itemId: string) => {
    setAllItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-muted-foreground">Loading collections...</div>
      </div>
    )
  }

  if (selectedCollection) {
    return (
      <CollectionDetailView
        collection={selectedCollection}
        onBack={() => setSelectedCollection(null)}
        onUpdate={handleCollectionUpdated}
        onDelete={handleCollectionDeleted}
        isDemo={isDemo}
      />
    )
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)] relative">
      <div className={cn("transition-all duration-300", isInventoryExpanded ? "hidden" : "block")}>
        <div className="p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Collections</h1>
              <p className="text-muted-foreground mt-1 text-sm">{"Organize, document, and track your gear"}</p>
            </div>
            <Link
              href="/collections"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Compass className="h-4 w-4" />
              <span>Explore community collections</span>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6" data-onboarding="stats">
            <div className="bg-card border border-border rounded-lg p-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Collections</span>
              </div>
              <p className="text-xl font-bold mt-1">{ownedCollections.length}</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4 text-chart-2" />
                <span className="text-sm text-muted-foreground">Total Items</span>
              </div>
              <p className="text-xl font-bold mt-1">{totalItems}</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-chart-4" />
                <span className="text-sm text-muted-foreground">Your Estimate</span>
              </div>
              <p className="text-xl font-bold mt-1">${totalUserValue.toLocaleString()}</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-chart-3" />
                <span className="text-sm text-muted-foreground">AI Estimate</span>
              </div>
              <p className="text-xl font-bold mt-1 text-chart-2">${totalAiValue.toLocaleString()}</p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex flex-1 bg-card border border-border rounded-lg" data-onboarding="filters">
              <div className="flex p-1 border-r border-border rounded-lg">
                <button
                  onClick={() => setFilter("all")}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                    filter === "all"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("owned")}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                    filter === "owned"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Owned
                </button>
                <button
                  onClick={() => setFilter("wishlist")}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                    filter === "wishlist"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Wishlist
                </button>
              </div>

              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder={`Search ${filter === "all" ? "collections" : filter === "owned" ? "owned collections" : "wishlists"}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-full pl-10 pr-4 border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none bg-transparent"
                />
              </div>
            </div>

            <div className="flex bg-card border border-border rounded-lg p-1">
              <button
                onClick={() => setView("grid")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  view === "grid" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  view === "list" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Collections Grid */}
          {filteredCollections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-card border border-border rounded-full mb-4">
                <FolderOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchQuery ? "No collections found" : "No collections yet"}
              </h3>
              <p className="text-muted-foreground mb-4 max-w-sm">
                {searchQuery
                  ? "Try adjusting your search or filters"
                  : "Start documenting your gear by creating your first collection"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm">Create Collection</span>
                </button>
              )}
            </div>
          ) : (
            <div
              className={cn(
                "gap-4",
                view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "flex flex-col",
              )}
            >
              {filteredCollections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  view={view}
                  href={`/collection/${collection.id}`}
                  itemImages={collectionItemImages[collection.id] || []}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className={cn(
          "transition-all duration-300",
          isInventoryExpanded
            ? "flex-1 flex flex-col min-h-[calc(100vh-120px)] bg-background"
            : "bg-card border-t border-border",
        )}
      >
        {isInventoryExpanded && (
          <div className="flex-1 flex flex-col p-6 lg:p-8 overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">My Items</h2>
                <p className="text-muted-foreground text-sm">Manage all your items in one place</p>
              </div>
            </div>
            <div className="flex-1">
              <MasterList
                items={allItems}
                collections={collections}
                onItemUpdate={handleItemUpdate}
                onItemDelete={handleItemDelete}
                view={itemsView}
                onViewChange={setItemsView}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
