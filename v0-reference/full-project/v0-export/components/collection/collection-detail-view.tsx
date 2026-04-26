"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Plus,
  Heart,
  BarChart3,
  Trash2,
  Grid3X3,
  List,
  Lock,
  Globe,
  Link2,
  Copy,
  Check,
  Package,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { Collection, CollectionItem } from "@/lib/types"
import { CollectionItemCard } from "./collection-item-card"
import { WishlistItemCard } from "./wishlist-item-card"
import { AddItemModal } from "./add-item-modal"
import { ShareCollectionModal } from "./share-collection-modal"
import { CollectionAnalytics } from "./collection-analytics"
import { CollectionNotes } from "./collection-notes"
import { VisibilitySelector } from "./visibility-selector"

// Demo items for unauthenticated users
const demoGuitarItems: CollectionItem[] = [
  {
    id: "demo-item-1",
    collection_id: "demo-collection-1",
    listing_id: null,
    title: "1959 Gibson Les Paul Standard",
    subtitle: "Sunburst - Original PAFs",
    description:
      "One of the holy grail guitars. Original finish, original pickups, incredible flame top. Acquired from a private collector in Nashville.",
    images: ["/vintage-gibson-les-paul-sunburst-guitar.jpg"],
    category: "Guitars",
    subcategory: "Electric",
    condition: "Excellent",
    user_estimated_value: 185000,
    ai_suggested_value: 225000,
    ai_value_updated_at: new Date().toISOString(),
    purchase_price: 125000,
    purchase_date: "2019-03-15",
    is_owned: true,
    priority: 0,
    notes: "Insurance policy updated 2024. Kept in climate-controlled case.",
    custom_attributes: { year: 1959, serial: "9-1234" },
    sort_order: 0,
    for_sale: false,
    for_trade: false,
    asking_price: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-item-2",
    collection_id: "demo-collection-1",
    listing_id: null,
    title: "1962 Fender Stratocaster",
    subtitle: "Olympic White - Slab Board",
    description:
      "Pre-CBS Strat with the desirable slab rosewood fingerboard. Refin but all original electronics and hardware.",
    images: ["/fender-stratocaster-white-vintage-guitar.jpg"],
    category: "Guitars",
    subcategory: "Electric",
    condition: "Very Good",
    user_estimated_value: 45000,
    ai_suggested_value: 42000,
    ai_value_updated_at: new Date().toISOString(),
    purchase_price: 32000,
    purchase_date: "2020-11-22",
    is_owned: true,
    priority: 0,
    notes: "Neck date: Nov 62. Pots date: Late 62.",
    custom_attributes: { year: 1962, serial: "L12345" },
    sort_order: 1,
    for_sale: false,
    for_trade: true,
    asking_price: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-item-3",
    collection_id: "demo-collection-1",
    listing_id: null,
    title: "PRS McCarty 594",
    subtitle: "Charcoal Burst - 10 Top",
    description: "Modern workhorse with vintage soul. Beautiful 10-top flame maple, coil-split for versatility.",
    images: ["/prs-mccarty-guitar-charcoal-burst.jpg"],
    category: "Guitars",
    subcategory: "Electric",
    condition: "Mint",
    user_estimated_value: 4200,
    ai_suggested_value: 3800,
    ai_value_updated_at: new Date().toISOString(),
    purchase_price: 4100,
    purchase_date: "2023-06-10",
    is_owned: true,
    priority: 0,
    notes: "My main gigging guitar. Set up with 10-46 strings.",
    custom_attributes: { year: 2023, serial: "23-123456" },
    sort_order: 2,
    for_sale: true,
    for_trade: true,
    asking_price: 3900,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const demoPedalItems: CollectionItem[] = [
  {
    id: "demo-pedal-1",
    collection_id: "demo-collection-2",
    listing_id: null,
    title: "Klon Centaur Gold",
    subtitle: "Original Long-Tail",
    description: "The legendary transparent overdrive. Gold horsie version with the long-tail enclosure.",
    images: ["/klon-centaur-gold-overdrive-pedal.jpg"],
    category: "Pedals",
    subcategory: "Overdrive",
    condition: "Excellent",
    user_estimated_value: 4500,
    ai_suggested_value: 5200,
    ai_value_updated_at: new Date().toISOString(),
    purchase_price: 1800,
    purchase_date: "2015-08-20",
    is_owned: true,
    priority: 0,
    notes: "Bought before the hype. Best investment ever.",
    custom_attributes: {},
    sort_order: 0,
    for_sale: false,
    for_trade: false,
    asking_price: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-pedal-2",
    collection_id: "demo-collection-2",
    listing_id: null,
    title: "Strymon Timeline",
    subtitle: "Delay Workstation",
    description: "12 delay machines in one. Ice, dTape, and Pattern modes are my favorites.",
    images: ["/strymon-timeline-delay-pedal.jpg"],
    category: "Pedals",
    subcategory: "Delay",
    condition: "Very Good",
    user_estimated_value: 380,
    ai_suggested_value: 350,
    ai_value_updated_at: new Date().toISOString(),
    purchase_price: 449,
    purchase_date: "2018-01-15",
    is_owned: true,
    priority: 0,
    notes: "Firmware updated to latest. Custom presets backed up.",
    custom_attributes: {},
    sort_order: 1,
    for_sale: true,
    for_trade: false,
    asking_price: 350,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-pedal-3",
    collection_id: "demo-collection-2",
    listing_id: null,
    title: "Boss TU-3 Tuner",
    subtitle: "Chromatic Tuner",
    description: "The industry standard. Reliable, accurate, and built like a tank.",
    images: ["/boss-tu3-tuner-pedal.jpg"],
    category: "Pedals",
    subcategory: "Utility",
    condition: "Good",
    user_estimated_value: 80,
    ai_suggested_value: 70,
    ai_value_updated_at: new Date().toISOString(),
    purchase_price: 99,
    purchase_date: "2014-03-01",
    is_owned: true,
    priority: 0,
    notes: "First pedal in the chain. Always.",
    custom_attributes: {},
    sort_order: 2,
    for_sale: false,
    for_trade: true,
    asking_price: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const demoWishlistItems: CollectionItem[] = [
  {
    id: "demo-wish-1",
    collection_id: "demo-wishlist-1",
    listing_id: null,
    title: "1958 Gibson Explorer",
    subtitle: "Korina - Original",
    description: "Only 22 made in 1958. The ultimate grail guitar.",
    images: ["/vintage-1958-gibson-explorer-korina.jpg"],
    category: "Guitars",
    subcategory: "Electric",
    condition: "Excellent",
    user_estimated_value: 450000,
    ai_suggested_value: 500000,
    ai_value_updated_at: new Date().toISOString(),
    purchase_price: null,
    purchase_date: null,
    is_owned: false,
    priority: 3,
    notes: "Keep watching Heritage Auctions and Gruhn.",
    custom_attributes: {},
    sort_order: 0,
    for_sale: false,
    for_trade: false,
    asking_price: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-wish-2",
    collection_id: "demo-wishlist-1",
    listing_id: null,
    title: "1954 Fender Stratocaster",
    subtitle: "First Year - Contour Body",
    description: "The first year of the Stratocaster. Ash body, single-ply pickguard.",
    images: ["/1954-fender-stratocaster-sunburst.jpg"],
    category: "Guitars",
    subcategory: "Electric",
    condition: "Very Good",
    user_estimated_value: 150000,
    ai_suggested_value: 175000,
    ai_value_updated_at: new Date().toISOString(),
    purchase_price: null,
    purchase_date: null,
    is_owned: false,
    priority: 2,
    notes: "Would consider a player-grade example.",
    custom_attributes: {},
    sort_order: 1,
    for_sale: false,
    for_trade: false,
    asking_price: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-wish-3",
    collection_id: "demo-wishlist-1",
    listing_id: null,
    title: "D'Angelico Excel EXL-1",
    subtitle: "Archtop Jazz Box",
    description: "Beautiful single-cutaway archtop for jazz gigs.",
    images: ["/dangelico-excel-exl1-archtop.jpg"],
    category: "Guitars",
    subcategory: "Acoustic",
    condition: "Mint",
    user_estimated_value: 3500,
    ai_suggested_value: 3200,
    ai_value_updated_at: new Date().toISOString(),
    purchase_price: null,
    purchase_date: null,
    is_owned: false,
    priority: 1,
    notes: "For when I finally learn jazz.",
    custom_attributes: {},
    sort_order: 2,
    for_sale: false,
    for_trade: false,
    asking_price: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

interface CollectionDetailViewProps {
  collection: Collection
  onBack: () => void
  onUpdate: (collection: Collection) => void
  onDelete: (collectionId: string) => void
  isDemo?: boolean
}

export function CollectionDetailView({
  collection: initialCollection,
  onBack,
  onUpdate,
  onDelete,
  isDemo,
}: CollectionDetailViewProps) {
  const [currentCollection, setCurrentCollection] = useState(initialCollection)
  const [items, setItems] = useState<CollectionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState<"grid" | "list">(currentCollection.is_wishlist ? "list" : "grid")
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [copied, setCopied] = useState(false)
  const [itemFilter, setItemFilter] = useState<"all" | "owned" | "wishlist">("all")

  const supabase = createClient()

  useEffect(() => {
    const loadItems = async () => {
      if (isDemo) {
        // Load demo items based on collection id
        if (currentCollection.id === "demo-collection-1") {
          setItems(demoGuitarItems)
        } else if (currentCollection.id === "demo-collection-2") {
          setItems(demoPedalItems)
        } else if (currentCollection.id === "demo-wishlist-1") {
          setItems(demoWishlistItems)
        } else {
          setItems([])
        }
        setIsLoading(false)
        return
      }

      const { data } = await supabase
        .from("collection_items")
        .select("*")
        .eq("collection_id", currentCollection.id)
        .order("sort_order", { ascending: true })

      if (data) {
        setItems(data)
      }
      setIsLoading(false)
    }

    loadItems()
  }, [currentCollection.id, isDemo, supabase])

  const handleItemAdded = (item: CollectionItem) => {
    setItems((prev) => [...prev, item])
    setIsAddItemModalOpen(false)
  }

  const handleItemUpdated = (updatedItem: CollectionItem) => {
    setItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)))
  }

  const handleItemDeleted = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const handleCollectionUpdated = (updatedCollection: Collection) => {
    setCurrentCollection(updatedCollection)
    onUpdate(updatedCollection)
  }

  const handleDeleteCollection = async () => {
    if (!confirm("Are you sure you want to delete this collection? This cannot be undone.")) return

    if (!isDemo) {
      await supabase.from("collections").delete().eq("id", currentCollection.id)
    }
    onDelete(currentCollection.id)
  }

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/collection/shared/${currentCollection.share_token}`
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Calculate stats
  const ownedItems = items.filter((item) => item.is_owned)
  const wishlistItems = items.filter((item) => !item.is_owned)
  const totalUserValue = ownedItems.reduce((sum, item) => sum + (item.user_estimated_value || 0), 0)
  const totalAiValue = ownedItems.reduce((sum, item) => sum + (item.ai_suggested_value || 0), 0)
  const totalPurchaseCost = ownedItems.reduce((sum, item) => sum + (item.purchase_price || 0), 0)
  const totalWishlistValue = wishlistItems.reduce((sum, item) => sum + (item.user_estimated_value || 0), 0)

  // Wishlist stats
  const highPriorityCount = items.filter((item) => !item.is_owned && item.priority >= 3).length
  const mediumPriorityCount = items.filter((item) => !item.is_owned && item.priority === 2).length

  const hasMixedItems = ownedItems.length > 0 && wishlistItems.length > 0
  const isOnlyWishlist = ownedItems.length === 0 && wishlistItems.length > 0

  const visibilityConfig = {
    private: { icon: Lock, color: "text-muted-foreground" },
    unlisted: { icon: Link2, color: "text-primary" },
    public: { icon: Globe, color: "text-chart-2" },
  }
  const visibility = currentCollection.visibility || "private"
  const VisibilityIcon = visibilityConfig[visibility].icon

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <button onClick={onBack} className="p-2 text-muted-foreground hover:text-foreground transition-colors mt-1">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              {currentCollection.is_wishlist && <Heart className="h-5 w-5 text-chart-5 fill-chart-5" />}
              <h1 className="text-2xl font-bold text-foreground">{currentCollection.name}</h1>
              <VisibilitySelector
                collection={currentCollection}
                onUpdate={handleCollectionUpdated}
                isDemo={isDemo}
                variant="compact"
              />
            </div>
            {currentCollection.description && (
              <p className="text-muted-foreground mt-1">{currentCollection.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!currentCollection.is_wishlist && ownedItems.length > 0 && (
            <Button
              variant={showAnalytics ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAnalytics(!showAnalytics)}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          )}
          {visibility !== "private" && (
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
          )}
          <Button onClick={() => setIsAddItemModalOpen(true)} size="sm" className="bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDeleteCollection} className="text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Collection Notes */}
      <CollectionNotes collection={currentCollection} onUpdate={handleCollectionUpdated} isDemo={isDemo} />

      {/* Analytics Panel */}
      {showAnalytics && !currentCollection.is_wishlist && ownedItems.length > 0 && (
        <CollectionAnalytics items={ownedItems} />
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Items</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-foreground">{items.length}</p>
            {hasMixedItems && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary">{ownedItems.length} owned</span>
                <span className="px-1.5 py-0.5 rounded bg-chart-5/10 text-chart-5">{wishlistItems.length} wanted</span>
              </div>
            )}
          </div>
        </div>

        {currentCollection.is_wishlist || isOnlyWishlist ? (
          <>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">High Priority</p>
              <p className="text-2xl font-bold text-chart-5">{highPriorityCount}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Medium Priority</p>
              <p className="text-2xl font-bold text-chart-4">{mediumPriorityCount}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold text-foreground">
                ${(totalUserValue + totalWishlistValue).toLocaleString()}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Your Estimate</p>
              <p className="text-2xl font-bold text-foreground">${totalUserValue.toLocaleString()}</p>
              {wishlistItems.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">+ ${totalWishlistValue.toLocaleString()} wishlist</p>
              )}
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">AI Estimate</p>
              <p className="text-2xl font-bold text-chart-2">${totalAiValue.toLocaleString()}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Est. Gain</p>
              <p
                className={cn(
                  "text-2xl font-bold",
                  totalUserValue - totalPurchaseCost >= 0 ? "text-chart-2" : "text-destructive",
                )}
              >
                {totalUserValue - totalPurchaseCost >= 0 ? "+" : ""}$
                {(totalUserValue - totalPurchaseCost).toLocaleString()}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        {/* Filter tabs - show if there's a mix of owned and wishlist items */}
        {(hasMixedItems || currentCollection.is_wishlist === false) && (
          <div className="flex bg-card border border-border rounded-lg p-1">
            <button
              onClick={() => setItemFilter("all")}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                itemFilter === "all" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setItemFilter("owned")}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
                itemFilter === "owned" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Package className="h-3.5 w-3.5" />
              Owned ({ownedItems.length})
            </button>
            <button
              onClick={() => setItemFilter("wishlist")}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
                itemFilter === "wishlist"
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Heart className="h-3.5 w-3.5" />
              Wishlist ({wishlistItems.length})
            </button>
          </div>
        )}

        {/* View toggle - hide for pure wishlist collections */}
        {!currentCollection.is_wishlist && (
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
        )}
      </div>

      {/* Items */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading items...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 bg-card border border-border rounded-full mb-4">
            {currentCollection.is_wishlist ? (
              <Heart className="h-8 w-8 text-muted-foreground" />
            ) : (
              <Grid3X3 className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No items yet</h3>
          <p className="text-muted-foreground mb-4 max-w-sm">
            {currentCollection.is_wishlist
              ? "Start adding items you dream of owning"
              : "Start documenting your gear by adding your first item"}
          </p>
          <Button onClick={() => setIsAddItemModalOpen(true)} className="bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Add First Item
          </Button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 bg-card border border-border rounded-full mb-4">
            {itemFilter === "wishlist" ? (
              <Heart className="h-8 w-8 text-muted-foreground" />
            ) : (
              <Package className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No {itemFilter === "wishlist" ? "wishlist" : "owned"} items
          </h3>
          <p className="text-muted-foreground mb-4 max-w-sm">
            {itemFilter === "wishlist" ? "Add items you want to your wishlist" : "Add items you own to your collection"}
          </p>
          <Button onClick={() => setIsAddItemModalOpen(true)} className="bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      ) : currentCollection.is_wishlist || itemFilter === "wishlist" ? (
        <div className="flex flex-col gap-3">
          {filteredItems
            .filter((item) => !item.is_owned)
            .sort((a, b) => (b.priority || 0) - (a.priority || 0))
            .map((item) => (
              <WishlistItemCard
                key={item.id}
                item={item}
                onUpdate={handleItemUpdated}
                onDelete={handleItemDeleted}
                isDemo={isDemo}
              />
            ))}
        </div>
      ) : (
        <div
          className={cn(
            view === "grid" ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col gap-3",
          )}
        >
          {filteredItems.map((item) => (
            <CollectionItemCard
              key={item.id}
              item={item}
              view={view}
              onUpdate={handleItemUpdated}
              onDelete={handleItemDeleted}
            />
          ))}
        </div>
      )}

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        collectionId={currentCollection.id}
        isWishlist={currentCollection.is_wishlist || itemFilter === "wishlist"}
        onItemAdded={handleItemAdded}
        isDemo={isDemo}
      />

      {/* Share Modal */}
      <ShareCollectionModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        collection={currentCollection}
        onUpdate={handleCollectionUpdated}
        isDemo={isDemo}
      />
    </div>
  )
}
