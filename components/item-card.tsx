"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRightFromLine, ChevronDown, Heart, MapPin, Repeat2, Tag } from "lucide-react"

import { cn } from "@/lib/utils"

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
}

function getScoreColor(score: number): string {
  if (score >= 8) return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
  if (score >= 5) return "bg-primary/10 text-primary border-primary/30"
  return "bg-secondary text-muted-foreground border-border"
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
/* MatchBadge                                                                 */
/*                                                                            */
/* Bottom-right overlay on the image. Compact pill that shows score.          */
/*   - Single match: "🎯 9.2" with tooltip "Trade match for [item]"           */
/*   - Multi match:  "🎯 9.2 ▾" + dropdown with item list                     */
/* Hover-to-open intent on desktop, click-to-toggle for touch/keyboard.       */
/* Floating overlay opens upward (above the badge) so it never gets clipped   */
/* by adjacent cards in a horizontal scroll.                                  */
/* -------------------------------------------------------------------------- */

function MatchBadge({ match }: { match: ItemCardMatch }) {
  const [open, setOpen] = useState(false)
  const isMulti = match.matchedItems.length > 1
  const direction = match.direction ?? "mutual"
  const MatchIcon = direction === "inbound" ? ArrowRightFromLine : Repeat2
  const singleItemTitle =
    match.matchedItems[0]?.title ?? match.fallbackItemTitle ?? ""

  const hoverIntentRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelHoverIntent = () => {
    if (hoverIntentRef.current !== null) {
      clearTimeout(hoverIntentRef.current)
      hoverIntentRef.current = null
    }
  }

  const handleMouseEnter = () => {
    if (!isMulti) return
    cancelHoverIntent()
    hoverIntentRef.current = setTimeout(() => {
      setOpen(true)
      hoverIntentRef.current = null
    }, 250)
  }

  const handleMouseLeave = () => {
    if (!isMulti) return
    cancelHoverIntent()
    setOpen(false)
  }

  useEffect(() => cancelHoverIntent, [])

  const tooltip = isMulti
    ? `Matches ${match.matchedItems.length} of your items`
    : `Trade match for your ${singleItemTitle}`

  const labelText = isMulti
    ? `${match.matchedItems.length} of yours`
    : singleItemTitle

  const pillColor =
    direction === "inbound"
      ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
      : getScoreColor(match.score)

  const pill = (
    <span
      className={cn(
        "inline-flex max-w-[200px] items-center gap-1.5 rounded-full border px-1.5 py-0.5 text-[11px] font-semibold shadow-sm backdrop-blur",
        pillColor,
      )}
      data-onboarding={match.showScoreOnboarding ? "match-score" : undefined}
    >
      <span className="inline-flex items-center gap-0.5">
        <MatchIcon className="h-3 w-3" />
        <span>{match.score.toFixed(1)}</span>
      </span>
      <span className="h-3 w-px bg-current opacity-30" aria-hidden />
      <span className="min-w-0 truncate text-[10px] font-medium opacity-90">
        {labelText}
      </span>
      {isMulti ? (
        <ChevronDown
          className={cn(
            "h-3 w-3 flex-shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      ) : null}
    </span>
  )

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative inline-flex"
    >
      {isMulti ? (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            setOpen((prev) => !prev)
          }}
          aria-expanded={open}
          aria-label={open ? "Hide matched items" : "Show matched items"}
          title={tooltip}
          className="min-w-0"
        >
          {pill}
        </button>
      ) : (
        <span title={tooltip} className="min-w-0">
          {pill}
        </span>
      )}

      {isMulti && open ? (
        <ul
          role="list"
          className="absolute bottom-full right-0 z-30 mb-1 w-56 overflow-hidden rounded-md border border-border bg-card shadow-lg"
        >
          <li className="border-b border-border/40 bg-secondary/40 px-2.5 py-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Matches {match.matchedItems.length} of your items
            </p>
          </li>
          {match.matchedItems.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-2 px-2.5 py-2 transition-colors [&:not(:last-child)]:border-b [&:not(:last-child)]:border-border/40 hover:bg-foreground/5"
            >
              <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded bg-secondary">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">
                  {item.title}
                </p>
                {item.subtitle ? (
                  <p className="truncate text-[10px] text-muted-foreground">
                    {item.subtitle}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* StatusIcons                                                                */
/*                                                                            */
/* Inline colored icons next to the price indicating For Sale / For Trade.    */
/* Native HTML title attribute provides the hover tooltip explaining each.    */
/* -------------------------------------------------------------------------- */

function StatusIcons({
  forSale,
  forTrade,
}: {
  forSale?: boolean
  forTrade?: boolean
}) {
  if (!forSale && !forTrade) return null
  return (
    <span className="inline-flex items-center gap-1">
      {forSale ? (
        <span
          title="For Sale"
          aria-label="For Sale"
          className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-status-success/15 text-status-success"
        >
          <Tag className="h-2.5 w-2.5" />
        </span>
      ) : null}
      {forTrade ? (
        <span
          title="For Trade"
          aria-label="For Trade"
          className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-status-info/15 text-status-info"
        >
          <Repeat2 className="h-2.5 w-2.5" />
        </span>
      ) : null}
    </span>
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
}: ItemCardProps) {
  const hasPrice = (forSale || forTrade) && price != null
  const hasStatus = forSale || forTrade
  const hasCollections = collections && collections.length > 0

  return (
    <div
      className={cn(
        "group rounded-lg border border-border bg-card transition-all hover:border-primary/50",
        className,
      )}
    >
      <div className="relative aspect-[4/3] rounded-t-lg">
        <Link href={href} className="absolute inset-0 block overflow-hidden rounded-t-lg">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </Link>
        <WatchlistButton id={id} isWatched={isWatched} onToggle={onToggleWatch} />
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

        {hasCollections ? (
          <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <CollectionChips chips={collections!} />
            {location ? (
              <p className="flex flex-shrink-0 items-center gap-1">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{location}</span>
              </p>
            ) : null}
          </div>
        ) : location ? (
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </p>
        ) : null}

        {hasStatus || hasPrice || match ? (
          <div
            className={cn(
              compact
                ? "space-y-1"
                : "flex items-center justify-between gap-2",
            )}
          >
            {(hasStatus || hasPrice) ? (
              <div className="flex items-center gap-2">
                <StatusIcons forSale={forSale} forTrade={forTrade} />
                {hasPrice ? (
                  <p className="text-sm font-semibold text-primary">
                    ${price!.toLocaleString()}
                  </p>
                ) : null}
              </div>
            ) : null}
            {match ? <MatchBadge match={match} /> : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
