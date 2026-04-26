"use client"

import { useState } from "react"
import useSWR from "swr"
import Image from "next/image"
import Link from "next/link"
import { Package, Tag, Settings, Plus, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

const fetcher = async () => {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { listings: [], collectionItems: [] }

  // Fetch user's listings
  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, subtitle, images, price, category, subcategory, condition")
    .eq("seller_id", user.id)

  // Fetch user's collection items marked for trade
  const { data: collectionItems } = await supabase
    .from("collection_items")
    .select(`
      id, 
      title, 
      subtitle, 
      images, 
      category, 
      subcategory, 
      condition,
      user_estimated_value,
      ai_suggested_value,
      for_trade,
      collection:collections!inner(user_id)
    `)
    .eq("collections.user_id", user.id)
    .eq("for_trade", true)

  return {
    listings: listings || [],
    collectionItems: collectionItems || [],
  }
}

export function MyTradeableItems() {
  const { data, isLoading } = useSWR("my-tradeable-items", fetcher)
  const [activeSection, setActiveSection] = useState<"listings" | "collection">("listings")

  const listings = data?.listings || []
  const collectionItems = data?.collectionItems || []

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-card rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  const hasNoItems = listings.length === 0 && collectionItems.length === 0

  if (hasNoItems) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mb-4">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Tradeable Items</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          Create listings or mark collection items as available for trade to start finding matches.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/create-listing"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Create Listing
          </Link>
          <Link
            href="/collection"
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors text-sm"
          >
            Go to Collection
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Manage your items available for trade and set trade preferences.</p>

      {/* Section tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveSection("listings")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm",
            activeSection === "listings"
              ? "bg-primary/20 text-primary font-medium"
              : "bg-card border border-border text-muted-foreground hover:text-foreground",
          )}
        >
          <Tag className="h-4 w-4" />
          <span>Listings</span>
          <span className="px-1.5 py-0.5 text-xs bg-secondary rounded">{listings.length}</span>
        </button>
        <button
          onClick={() => setActiveSection("collection")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm",
            activeSection === "collection"
              ? "bg-primary/20 text-primary font-medium"
              : "bg-card border border-border text-muted-foreground hover:text-foreground",
          )}
        >
          <Package className="h-4 w-4" />
          <span>Collection Items</span>
          <span className="px-1.5 py-0.5 text-xs bg-secondary rounded">{collectionItems.length}</span>
        </button>
      </div>

      {/* Items list */}
      <div className="space-y-3">
        {activeSection === "listings" && (
          <>
            {listings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No listings yet.</p>
                <Link href="/create-listing" className="text-primary hover:underline">
                  Create your first listing
                </Link>
              </div>
            ) : (
              listings.map((listing) => (
                <TradeableItemRow
                  key={listing.id}
                  item={{
                    id: listing.id,
                    type: "listing",
                    title: listing.title,
                    subtitle: listing.subtitle,
                    image: listing.images?.[0],
                    price: listing.price,
                    category: listing.category,
                    condition: listing.condition,
                  }}
                />
              ))
            )}
          </>
        )}

        {activeSection === "collection" && (
          <>
            {collectionItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No collection items marked for trade.</p>
                <Link href="/collection" className="text-primary hover:underline">
                  Go to your collection
                </Link>
              </div>
            ) : (
              collectionItems.map((item) => (
                <TradeableItemRow
                  key={item.id}
                  item={{
                    id: item.id,
                    type: "collection_item",
                    title: item.title,
                    subtitle: item.subtitle,
                    image: item.images?.[0],
                    price: item.user_estimated_value || item.ai_suggested_value,
                    category: item.category,
                    condition: item.condition,
                  }}
                />
              ))
            )}
          </>
        )}
      </div>
    </div>
  )
}

interface TradeableItemRowProps {
  item: {
    id: string
    type: "listing" | "collection_item"
    title: string
    subtitle: string | null
    image: string | null
    price: number | null
    category: string | null
    condition: string | null
  }
}

function TradeableItemRow({ item }: TradeableItemRowProps) {
  const linkHref = item.type === "listing" ? `/listings/${item.id}` : `/collection`

  return (
    <div className="flex items-center gap-4 p-3 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors group">
      {/* Image */}
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
        <Image
          src={item.image || "/placeholder.svg?height=64&width=64&query=item"}
          alt={item.title}
          width={64}
          height={64}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link href={linkHref}>
          <h4 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
            {item.title}
          </h4>
        </Link>
        {item.subtitle && <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>}
        <div className="flex items-center gap-2 mt-1">
          {item.price && <span className="text-sm font-medium text-primary">${item.price.toLocaleString()}</span>}
          {item.category && (
            <span className="text-xs px-2 py-0.5 bg-secondary rounded text-muted-foreground">{item.category}</span>
          )}
          {item.condition && (
            <span className="text-xs px-2 py-0.5 bg-secondary rounded text-muted-foreground">{item.condition}</span>
          )}
        </div>
      </div>

      {/* Trade settings button */}
      <Link
        href={`/trade/settings/${item.type}/${item.id}`}
        className="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground bg-secondary rounded-lg hover:bg-muted transition-colors"
      >
        <Settings className="h-4 w-4" />
        <span className="hidden sm:inline">Trade Settings</span>
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
