"use client"
import Link from "next/link"
import { FolderOpen, Heart, Lock, Globe, Link2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Collection } from "@/lib/types"

interface CollectionCardProps {
  collection: Collection
  view: "grid" | "list"
  onClick?: () => void
  itemImages?: string[]
  href?: string
}

const visibilityConfig = {
  private: { icon: Lock, label: "Private", color: "text-muted-foreground" },
  unlisted: { icon: Link2, label: "Unlisted", color: "text-primary" },
  public: { icon: Globe, label: "Public", color: "text-chart-2" },
}

export function CollectionCard({ collection, view, onClick, itemImages = [], href }: CollectionCardProps) {
  const visibility = collection.visibility || "private"
  const { icon: VisibilityIcon, label: visibilityLabel, color: visibilityColor } = visibilityConfig[visibility]

  const gridImages = itemImages.slice(0, 4)

  const listContent = (
    <>
      {/* Cover image or 2x2 grid */}
      <div className="relative flex-shrink-0 w-16 h-16 bg-secondary rounded-lg overflow-hidden">
        {gridImages.length > 0 ? (
          <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-0.5">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="bg-secondary overflow-hidden">
                {gridImages[index] ? (
                  <img src={gridImages[index] || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-secondary" />
                )}
              </div>
            ))}
          </div>
        ) : collection.cover_image ? (
          <img
            src={collection.cover_image || "/placeholder.svg"}
            alt={collection.name}
            className="w-full h-full object-cover"
          />
        ) : collection.is_wishlist ? (
          <div className="w-full h-full flex items-center justify-center">
            <Heart className="h-6 w-6 text-chart-5" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FolderOpen className="h-6 w-6 text-primary" />
          </div>
        )}
        {collection.is_wishlist && (
          <div className="absolute top-1 left-1 flex items-center gap-0.5 px-1 py-0.5 bg-background/80 backdrop-blur-sm rounded">
            <Heart className="h-2 w-2 text-chart-5 fill-current" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-foreground truncate">{collection.name}</h3>
          <div className="flex-shrink-0 text-right" title={visibilityLabel}>
            <VisibilityIcon className={cn("h-4 w-4", visibilityColor)} />
          </div>
        </div>
        {collection.description && (
          <p className="text-sm text-muted-foreground truncate mt-0.5">{collection.description}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">{collection.item_count || 0} items</p>
      </div>

      {/* Value */}
      <div className="flex-shrink-0 text-right">
        <p className="text-sm font-medium text-foreground">${(collection.total_user_value || 0).toLocaleString()}</p>
        {(collection.total_ai_value || 0) > 0 && (
          <p className="text-xs text-muted-foreground">AI: ${(collection.total_ai_value || 0).toLocaleString()}</p>
        )}
      </div>
    </>
  )

  const gridContent = (
    <>
      <div className="aspect-[4/3] bg-secondary overflow-hidden relative">
        {gridImages.length > 0 ? (
          <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-0.5">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="bg-secondary overflow-hidden">
                {gridImages[index] ? (
                  <img src={gridImages[index] || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-secondary/50" />
                )}
              </div>
            ))}
          </div>
        ) : collection.cover_image ? (
          <img
            src={collection.cover_image || "/placeholder.svg"}
            alt={collection.name}
            className="w-full h-full object-cover"
          />
        ) : collection.is_wishlist ? (
          <div className="w-full h-full flex items-center justify-center">
            <Heart className="h-12 w-12 text-chart-5/50" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FolderOpen className="h-12 w-12 text-primary/50" />
          </div>
        )}
        {collection.is_wishlist && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-md">
            <Heart className="h-3 w-3 text-chart-5 fill-current" />
            <span className="text-[10px] font-medium text-chart-5">Wishlist</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-foreground truncate">{collection.name}</h3>
            {collection.description && (
              <p className="text-sm text-muted-foreground truncate mt-0.5">{collection.description}</p>
            )}
          </div>
          <div className="flex-shrink-0 text-right" title={visibilityLabel}>
            <VisibilityIcon className={cn("h-4 w-4", visibilityColor)} />
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-1">{collection.item_count || 0} items</p>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Your Estimate</p>
            <p className="font-medium text-foreground">${(collection.total_user_value || 0).toLocaleString()}</p>
          </div>
          {(collection.total_ai_value || 0) > 0 && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">AI Estimate</p>
              <p className="font-medium text-chart-2">${(collection.total_ai_value || 0).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>
    </>
  )

  const listClassName = "w-full flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors text-left"
  const gridClassName = "group bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors text-left block"

  if (view === "list") {
    if (href) {
      return (
        <Link href={href} className={listClassName}>
          {listContent}
        </Link>
      )
    }
    return (
      <button onClick={onClick} className={listClassName}>
        {listContent}
      </button>
    )
  }

  if (href) {
    return (
      <Link href={href} className={gridClassName}>
        {gridContent}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={gridClassName}>
      {gridContent}
    </button>
  )
}
