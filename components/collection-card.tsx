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
  className?: string
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
  className,
}: CollectionCardProps) {
  const visibility = collection.visibility || "private"
  const { icon: VisibilityIcon, label: visibilityLabel, color: visibilityColor } =
    visibilityConfig[visibility]
  const gridImages = itemImages.slice(0, 4)

  const listContent = (
    <>
      <div className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
        {gridImages.length > 0 ? (
          <div className="grid h-full w-full grid-cols-4 gap-px">
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
          {collection.is_wishlist ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-chart-5/25 bg-chart-5/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-chart-5">
              <Heart className="h-2.5 w-2.5 fill-current" />
              Wishlist
            </span>
          ) : null}
          <div className="ml-auto flex-shrink-0 text-right" title={visibilityLabel}>
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
          ${(collection.total_user_value || 0).toLocaleString('en-US')}
        </p>
        {(collection.total_ai_value || 0) > 0 ? (
          <p className="text-xs text-muted-foreground">
            AI: ${(collection.total_ai_value || 0).toLocaleString('en-US')}
          </p>
        ) : null}
      </div>
    </>
  )

  const gridContent = (
    <>
      {/* Image section — 4-in-a-row on mobile, 2×2 quad on desktop */}
      <div>
        {gridImages.length > 0 ? (
          <div className="grid grid-cols-4 md:grid-cols-2 gap-px">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="relative aspect-square overflow-hidden bg-secondary">
                {gridImages[index] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={gridImages[index]}
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
          <div className="grid grid-cols-4 md:grid-cols-2 gap-px">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="relative aspect-square overflow-hidden bg-secondary">
                {index === 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={collection.cover_image!}
                    alt={collection.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-secondary/50" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">
            <div className="grid grid-cols-4 md:grid-cols-2 gap-px">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden bg-secondary/40"
                />
              ))}
            </div>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div
                className={cn(
                  "inline-flex items-center justify-center rounded-full p-3",
                  collection.is_wishlist
                    ? "bg-chart-5/10 text-chart-5"
                    : "bg-primary/10 text-primary",
                )}
              >
                {collection.is_wishlist ? (
                  <Heart className="h-5 w-5" />
                ) : (
                  <FolderOpen className="h-5 w-5" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="px-3 pb-3 pt-2">
        {/* Badges row — only renders when there's something to show */}
        {collection.is_wishlist ? (
          <div className="mb-1.5">
            <span className="inline-flex items-center gap-1 rounded-full border border-chart-5/25 bg-chart-5/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-chart-5">
              <Heart className="h-2.5 w-2.5 fill-current" />
              Wishlist
            </span>
          </div>
        ) : null}

        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold md:text-base text-foreground">{collection.name}</h3>
            {collection.description ? (
              <p className="truncate text-xs text-muted-foreground">
                {collection.description}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <VisibilityIcon className={cn("h-3.5 w-3.5", visibilityColor)} />
          </div>
        </div>

        <p className="mt-1 text-xs text-muted-foreground">{collection.item_count || 0} items</p>

        {/* Desktop: labelled two-column estimate block */}
        {(collection.total_user_value || 0) > 0 ? (
          <div className="mt-3 hidden md:flex items-end justify-between gap-2">
            <div>
              <p className="text-[11px] text-muted-foreground">Your Estimate</p>
              <p className="text-base font-bold text-foreground">
                ${(collection.total_user_value || 0).toLocaleString('en-US')}
              </p>
            </div>
            {(collection.total_ai_value || 0) > 0 ? (
              <div className="text-right">
                <p className="text-[11px] text-muted-foreground">AI Estimate</p>
                <p className="text-base font-bold text-chart-2">
                  ${(collection.total_ai_value || 0).toLocaleString('en-US')}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Mobile: compact inline value */}
        {(collection.total_user_value || 0) > 0 ? (
          <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground md:hidden">
            <span>${(collection.total_user_value || 0).toLocaleString('en-US')}</span>
            {(collection.total_ai_value || 0) > 0 ? (
              <>
                <span aria-hidden>·</span>
                <span>AI: ${(collection.total_ai_value || 0).toLocaleString('en-US')}</span>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  )

  const listClassName = cn(
    "w-full flex items-center gap-4 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary/50",
    className,
  )
  const gridClassName = cn(
    "group block overflow-hidden rounded-xl border bg-card text-left transition-colors",
    collection.is_wishlist
      ? "border-chart-5/20 hover:border-chart-5/50"
      : "border-border hover:border-primary/40",
    className,
  )

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
