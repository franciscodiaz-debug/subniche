"use client"

import Link from "next/link"
import { FolderOpen, Globe, Heart, Link2, Lock } from "lucide-react"

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
} as const

export function CollectionCard({
  collection,
  view,
  onClick,
  itemImages = [],
  href,
}: CollectionCardProps) {
  const visibility = collection.visibility || "private"
  const { icon: VisibilityIcon, label: visibilityLabel, color: visibilityColor } =
    visibilityConfig[visibility]
  const gridImages = itemImages.slice(0, 4)

  const listContent = (
    <>
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
        {gridImages.length > 0 ? (
          <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-0.5">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="overflow-hidden bg-secondary">
                {gridImages[index] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={gridImages[index] || "/placeholder.svg"}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-secondary" />
                )}
              </div>
            ))}
          </div>
        ) : collection.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={collection.cover_image || "/placeholder.svg"}
            alt={collection.name}
            className="h-full w-full object-cover"
          />
        ) : collection.is_wishlist ? (
          <div className="flex h-full w-full items-center justify-center">
            <Heart className="h-6 w-6 text-chart-5" />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <FolderOpen className="h-6 w-6 text-primary" />
          </div>
        )}

        {collection.is_wishlist ? (
          <div className="absolute left-1 top-1 flex items-center gap-0.5 rounded bg-background/80 px-1 py-0.5 backdrop-blur-sm">
            <Heart className="h-2 w-2 fill-current text-chart-5" />
          </div>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-medium text-foreground">{collection.name}</h3>
          <div className="flex-shrink-0 text-right" title={visibilityLabel}>
            <VisibilityIcon className={cn("h-4 w-4", visibilityColor)} />
          </div>
        </div>

        {collection.description ? (
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {collection.description}
          </p>
        ) : null}

        <p className="mt-1 text-xs text-muted-foreground">
          {collection.item_count || 0} items
        </p>
      </div>

      <div className="flex-shrink-0 text-right">
        <p className="text-sm font-medium text-foreground">
          ${(collection.total_user_value || 0).toLocaleString()}
        </p>
        {(collection.total_ai_value || 0) > 0 ? (
          <p className="text-xs text-muted-foreground">
            AI: ${(collection.total_ai_value || 0).toLocaleString()}
          </p>
        ) : null}
      </div>
    </>
  )

  const gridContent = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {gridImages.length > 0 ? (
          <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-0.5">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="overflow-hidden bg-secondary">
                {gridImages[index] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={gridImages[index] || "/placeholder.svg"}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-secondary/50" />
                )}
              </div>
            ))}
          </div>
        ) : collection.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={collection.cover_image || "/placeholder.svg"}
            alt={collection.name}
            className="h-full w-full object-cover"
          />
        ) : collection.is_wishlist ? (
          <div className="flex h-full w-full items-center justify-center">
            <Heart className="h-12 w-12 text-chart-5/50" />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <FolderOpen className="h-12 w-12 text-primary/50" />
          </div>
        )}

        {collection.is_wishlist ? (
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-background/80 px-2 py-1 backdrop-blur-sm">
            <Heart className="h-3 w-3 fill-current text-chart-5" />
            <span className="text-[10px] font-medium text-chart-5">Wishlist</span>
          </div>
        ) : null}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-medium text-foreground">{collection.name}</h3>
            {collection.description ? (
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {collection.description}
              </p>
            ) : null}
          </div>

          <div className="flex-shrink-0 text-right" title={visibilityLabel}>
            <VisibilityIcon className={cn("h-4 w-4", visibilityColor)} />
          </div>
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          {collection.item_count || 0} items
        </p>

        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <div>
            <p className="text-xs text-muted-foreground">Your Estimate</p>
            <p className="font-medium text-foreground">
              ${(collection.total_user_value || 0).toLocaleString()}
            </p>
          </div>

          {(collection.total_ai_value || 0) > 0 ? (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">AI Estimate</p>
              <p className="font-medium text-chart-2">
                ${(collection.total_ai_value || 0).toLocaleString()}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </>
  )

  const listClassName =
    "w-full flex items-center gap-4 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary/50"
  const gridClassName =
    "group block overflow-hidden rounded-lg border border-border bg-card text-left transition-colors hover:border-primary/50"

  if (view === "list") {
    if (href) {
      return (
        <Link href={href} className={listClassName}>
          {listContent}
        </Link>
      )
    }

    return (
      <button type="button" onClick={onClick} className={listClassName}>
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
    <button type="button" onClick={onClick} className={gridClassName}>
      {gridContent}
    </button>
  )
}
