"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, FolderOpen, TrendingUp, Grid3X3, List, Search, Sparkles, Compass } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { Collection } from "@/lib/types"
import { CollectionCard } from "@/components/collection/collection-card"

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

export function CollectionsTab() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [collectionItemImages, setCollectionItemImages] = useState<Record<string, string[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)
  const [view, setView] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "owned" | "wishlist">("all")

  useEffect(() => {
    const loadCollections = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
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
      } else {
        setIsDemo(true)
        setCollections(demoCollections)
        setCollectionItemImages(demoItemImages)
      }
      setIsLoading(false)
    }

    loadCollections()
  }, [])

  const filteredCollections = collections.filter((collection) => {
    return collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const ownedCollections = collections.filter((c) => !c.is_wishlist)
  const wishlistCollections = collections.filter((c) => c.is_wishlist)
  const totalUserValue = ownedCollections.reduce((sum, c) => sum + (c.total_user_value || 0), 0)
  const totalAiValue = ownedCollections.reduce((sum, c) => sum + (c.total_ai_value || 0), 0)
  const totalItems = ownedCollections.reduce((sum, c) => sum + (c.item_count || 0), 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[40vh]">
        <div className="text-muted-foreground">Loading collections...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with explore link */}
      

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 bg-card border border-border rounded-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-full pl-10 pr-4 py-2 border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none bg-transparent rounded-lg"
          />
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
            <Link
              href="/create-collection"
              className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm">Create Collection</span>
            </Link>
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
  )
}
