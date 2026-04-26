"use client"

import Link from "next/link"
import { FolderOpen, Heart, Lock, Eye, EyeOff } from "lucide-react"
import type { Collection } from "@/lib/types"

interface ProfileCollectionCardProps {
  collection: Collection
  images: string[]
}

const visibilityConfig = {
  private: { icon: Lock, label: "Private" },
  unlisted: { icon: EyeOff, label: "Link Only" },
  public: { icon: Eye, label: "Public" },
}

export function ProfileCollectionCard({ collection, images }: ProfileCollectionCardProps) {
  const visibility = collection.visibility || "private"
  const { icon: VisibilityIcon, label: visibilityLabel } = visibilityConfig[visibility]
  const gridImages = images.slice(0, 4)

  return (
    <Link
      href={`/collection/${collection.id}`}
      className="group bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
    >
      {/* Image Grid */}
      <div className="aspect-[16/10] bg-secondary overflow-hidden relative">
        {gridImages.length > 0 ? (
          <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-0.5">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="bg-secondary overflow-hidden">
                {gridImages[index] ? (
                  <img
                    src={gridImages[index] || "/placeholder.svg"}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-secondary/50" />
                )}
              </div>
            ))}
          </div>
        ) : collection.is_wishlist ? (
          <div className="w-full h-full flex items-center justify-center">
            <Heart className="h-10 w-10 text-rose-500/30" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FolderOpen className="h-10 w-10 text-primary/30" />
          </div>
        )}

        {/* Item count badge */}
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-md">
          <span className="text-xs font-medium text-foreground">{collection.item_count || 0} items</span>
        </div>

        {/* Wishlist badge */}
        {collection.is_wishlist && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-md">
            <Heart className="h-3 w-3 text-rose-500 fill-current" />
          </div>
        )}
      </div>

      {/* Info - Added relative positioning for visibility icon */}
      <div className="p-3 relative">
        <div className="absolute top-3 right-3 text-muted-foreground" title={visibilityLabel}>
          <VisibilityIcon className="w-4 h-4" />
        </div>

        <h3 className="font-medium text-foreground truncate pr-6">{collection.name}</h3>
        {collection.description && (
          <p className="text-sm text-muted-foreground truncate mt-0.5 pr-6">{collection.description}</p>
        )}
        {(collection.total_user_value || 0) > 0 && (
          <p className="text-sm font-medium text-foreground mt-2">
            ${(collection.total_user_value || 0).toLocaleString()}
          </p>
        )}
      </div>
    </Link>
  )
}
