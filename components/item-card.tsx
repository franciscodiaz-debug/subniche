"use client"

import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRightFromLine, Heart, MapPin, Repeat2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { MatchFooter } from "@/components/trade-interest-card"

export interface ItemCardCollectionChip {
  id: string
  name: string
  icon?: string
}

export interface ItemCardMatchedItem {
  id: string
  title: string
  subtitle?: string
  image?: string
}

export interface ItemCardMatch {
  score: number
  matchedItems: ItemCardMatchedItem[]
  fallbackItemTitle?: string
  showScoreOnboarding?: boolean
  direction?: "mutual" | "inbound"
}

export interface ItemCardProps {
  id: string
  title: string
  image: string
  href: string
  subtitle?: string
  location?: string | null
  price?: number | null
  forSale?: boolean
  forTrade?: boolean
  collections?: ItemCardCollectionChip[]
  isWatched?: boolean
  onToggleWatch?: (id: string) => void
  match?: ItemCardMatch
  compact?: boolean
  className?: string
  priority?: boolean
  /** Optional overlay node rendered in the top-right of the image area.
   *  When provided, replaces the default WatchlistButton — used by owner
   *  views (e.g. My Stuff) to show a three-dots actions menu instead. */
  actions?: ReactNode
  /** Optional content rendered directly under the title/subtitle, above
   *  the collections row. Used by owner views to render a collection
   *  picker chip without baking that logic into the unified card. */
  belowTitle?: ReactNode
  /** Visually de-emphasizes the card (e.g. sold items). */
  dimmed?: boolean
  /** Render price even when the item is not for sale/trade. Used by owner
   *  views where the price represents the user's estimate, not a listing. */
  alwaysShowPrice?: boolean
}

/* -------------------------------------------------------------------------- */
/* WatchlistButton                                                            */
/*                                                                            */
/* Top-right overlay. Always visible on mobile (no hover available); fades in */
/* on hover/focus on desktop. When watched, stays visible everywhere.         */
/* -------------------------------------------------------------------------- */

function WatchlistButton({
  id,
  isWatched,
  onToggle,
}: {
  id: string
  isWatched?: boolean
  onToggle?: (id: string) => void
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onToggle?.(id)
      }}
      aria-label={isWatched ? "Remove from watchlist" : "Add to watchlist"}
      aria-pressed={!!isWatched}
      className={cn(
        "absolute right-2 top-2 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full bg-card/90 text-muted-foreground shadow-sm backdrop-blur transition-all hover:bg-card hover:text-foreground focus-visible:opacity-100",
        "opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100",
        isWatched &&
          "text-rose-500 hover:text-rose-500 lg:opacity-100",
      )}
    >
      <Heart className={cn("h-4 w-4", isWatched && "fill-current")} />
    </button>
  )
}


/* -------------------------------------------------------------------------- */
/* CollectionChips                                                            */
/*                                                                            */
/* Clickable chips for each collection the item belongs to. The chips break   */
/* out of the parent <Link> by being nested <Link>s themselves; click handler */
/* on each chip stops propagation so the outer card link doesn't fire.        */
/* -------------------------------------------------------------------------- */

function CollectionChips({ chips }: { chips: ItemCardCollectionChip[] }) {
  if (chips.length === 0) return null
  const visible = chips.slice(0, 2)
  const overflow = chips.length - visible.length
  return (
    <div className="flex min-w-0 items-center gap-1">
      {visible.map((chip) => (
        <Link
          key={chip.id}
          href={`/collection/${chip.id}`}
          onClick={(event) => event.stopPropagation()}
          className="inline-flex min-w-0 items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {chip.icon ? <span className="flex-shrink-0">{chip.icon}</span> : null}
          <span className="min-w-0 truncate">{chip.name}</span>
        </Link>
      ))}
      {overflow > 0 ? (
        <span
          className="inline-flex flex-shrink-0 items-center rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
          aria-label={`${overflow} more collection${overflow > 1 ? "s" : ""}`}
        >
          +{overflow}
        </span>
      ) : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* ItemCard                                                                   */
/*                                                                            */
/* Unified card for any listing across the app. Variability rules:            */
/*   - Watchlist heart, Match badge: overlays — never reserve vertical space  */
/*   - Price + status icons: only render if For Sale or For Trade             */
/*   - Location: only renders if provided                                     */
/*   - Collection chips: only render if collections is non-empty              */
/* All optional rows fully collapse so cards in a mixed grid stay coherent.   */
/* -------------------------------------------------------------------------- */

export function ItemCard({
  id,
  title,
  image,
  href,
  subtitle,
  location,
  price,
  forSale,
  forTrade,
  collections,
  isWatched,
  onToggleWatch,
  match,
  compact = false,
  className,
  priority = false,
  actions,
  belowTitle,
  dimmed = false,
  alwaysShowPrice = false,
}: ItemCardProps) {
  const hasPrice = (alwaysShowPrice || forSale || forTrade) && price != null
  const hasStatus = forSale || forTrade
  const hasCollections = collections && collections.length > 0

  return (
    <div
      className={cn(
        "group rounded-lg border border-border bg-card transition-all hover:border-primary/50",
        dimmed && "opacity-75",
        className,
      )}
    >
      <div className="relative aspect-[4/3] rounded-t-lg">
        <Link href={href} className="absolute inset-0 block overflow-hidden rounded-t-lg">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            priority={priority}
            className="object-cover transition-transform group-hover:scale-105"
          />
        </Link>
        {actions ? (
          <div
            className={cn(
              "absolute right-2 top-2 z-20 transition-opacity",
              "opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100",
            )}
          >
            {actions}
          </div>
        ) : (
          <WatchlistButton id={id} isWatched={isWatched} onToggle={onToggleWatch} />
        )}
      </div>

      <div className="space-y-1.5 p-3">
        <Link href={href} className="block">
          <h3 className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
            {title}
          </h3>
          {subtitle ? (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </Link>

        {belowTitle ? <div>{belowTitle}</div> : null}

        {hasCollections ? (
          <CollectionChips chips={collections!} />
        ) : null}

        {hasStatus || hasPrice || location || match ? (
          <div className="space-y-1.5">
            {/* Price · swap icon · location — all on one row */}
            {(hasStatus || hasPrice || location) ? (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {hasPrice ? (
                    <p className="text-sm font-semibold text-primary">
                      ${price!.toLocaleString('en-US')}
                    </p>
                  ) : null}
                  {forTrade ? (
                    <span title="For Trade" aria-label="For Trade" className="text-muted-foreground">
                      <Repeat2 className="h-3.5 w-3.5" />
                    </span>
                  ) : null}
                </div>
                {location ? (
                  <p className="flex flex-shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span>{location}</span>
                  </p>
                ) : null}
              </div>
            ) : null}
            {/* Trade match — own row at the bottom */}
            {match ? (
              <MatchFooter
                variant={match.direction === "inbound" ? "inbound" : "perfect"}
                singleLeadingLabel={match.direction === "inbound" ? "Interested in your" : "Trade match for your"}
                multiLeadingLabel={match.direction === "inbound" ? "Interested in" : "Trade match for"}
                fallbackItemTitle={match.fallbackItemTitle ?? ""}
                matchedItems={match.matchedItems}
                Icon={match.direction === "inbound" ? ArrowRightFromLine : Repeat2}
                iconClassName={match.direction === "inbound" ? "text-muted-foreground" : "text-primary"}
                matchScore={match.score}
                showScoreOnboarding={match.showScoreOnboarding ?? false}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
