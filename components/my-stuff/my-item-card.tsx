"use client"

import Image from "next/image"
import Link from "next/link"
import { DollarSign, Repeat2 } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  CollectionChip,
  ItemActionsMenu,
  WatchlistHeart,
} from "@/components/my-stuff/owner-item-controls"
import { type MyItem } from "@/lib/mock/my-stuff"

export type { MyItem } from "@/lib/mock/my-stuff"

/**
 * Card display modes:
 *  - `owner`   → three-dots actions menu (edit, mark sold, list/unlist,
 *                move-to-collection). The viewer is the listing owner.
 *  - `visitor` → watchlist heart toggle. The viewer is browsing someone
 *                else's listing.
 */
export type CardOwnership = "owner" | "visitor"

export function SalePill({
  active,
  iconOnly = false,
}: {
  active: boolean
  iconOnly?: boolean
}) {
  if (!active) return null
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-status-success/30 bg-status-success/10 font-medium text-status-success",
        iconOnly ? "h-5 w-5 justify-center p-0" : "gap-1 px-2 py-0.5 text-[11px]",
      )}
      title="Listed for sale"
      aria-label="Listed for sale"
    >
      <DollarSign className="h-3 w-3" strokeWidth={2.25} />
      {iconOnly ? <span className="sr-only">Sale</span> : "Sale"}
    </span>
  )
}

export function TradePill({
  active,
  iconOnly = false,
}: {
  active: boolean
  iconOnly?: boolean
}) {
  if (!active) return null
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-status-info/30 bg-status-info/10 font-medium text-status-info",
        iconOnly ? "h-5 w-5 justify-center p-0" : "gap-1 px-2 py-0.5 text-[11px]",
      )}
      title="Open to trades"
      aria-label="Open to trades"
    >
      <Repeat2 className="h-3 w-3" strokeWidth={2.25} />
      {iconOnly ? <span className="sr-only">Trade</span> : "Trade"}
    </span>
  )
}

export function MyItemListHeader() {
  return (
    <div className="hidden grid-cols-12 items-center gap-4 px-4 pb-3 text-xs uppercase tracking-wider text-muted-foreground @2xl/list:grid">
      <span className="col-span-4">Item</span>
      <span className="col-span-2">Value</span>
      <span className="col-span-2">Status</span>
      <span className="col-span-3">Collection</span>
      <span className="col-span-1 sr-only text-right">Actions</span>
    </div>
  )
}

interface MyItemRowProps {
  item: MyItem
  ownership?: CardOwnership
  insideCollectionPage?: boolean
}

export function MyItemRow({
  item,
  ownership = "owner",
  insideCollectionPage = false,
}: MyItemRowProps) {
  const href = `/listings/${item.id}`
  const imageSrc = item.images[0] || "/placeholder.svg"
  const priceLabel = item.price != null ? `$${item.price.toLocaleString('en-US')}` : "—"
  const hasStatus = item.for_sale || item.for_trade
  const showCollectionChip = ownership === "owner" && !insideCollectionPage

  return (
    <div
      className={cn(
        "group rounded-lg border border-border bg-card transition-colors hover:border-primary/40",
        item.sold && "opacity-70",
      )}
    >
      {/* Mobile layout */}
      <div className="flex items-center gap-3 px-3 py-3.5 @2xl/list:hidden">
        <Link
          href={href}
          className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-secondary"
          aria-label={item.title}
        >
          <Image src={imageSrc} alt={item.title} fill className="object-cover" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <Link href={href} className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
                {item.title}
              </h3>
            </Link>
            <span
              className={cn(
                "shrink-0 text-sm font-semibold leading-tight tabular-nums",
                item.price != null ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {priceLabel}
            </span>
          </div>
          {item.subtitle && (
            <p className="mt-0.5 truncate text-xs leading-snug text-muted-foreground">
              {item.subtitle}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1">
            {hasStatus ? (
              <>
                <SalePill active={item.for_sale} />
                <TradePill active={item.for_trade} />
              </>
            ) : (
              <span className="inline-flex items-center rounded-full border border-border/70 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                Private
              </span>
            )}
          </div>
          {showCollectionChip && (
            <div className="mt-1 flex">
              <CollectionChip item={item} muted />
            </div>
          )}
        </div>
        <div className="self-center opacity-100 transition-opacity focus-within:opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
          {ownership === "owner" ? (
            <ItemActionsMenu item={item} variant="overlay" />
          ) : (
            <WatchlistHeart itemId={item.id} variant="overlay" />
          )}
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden grid-cols-12 items-center gap-4 px-4 py-4 @2xl/list:grid">
        <Link href={href} className="col-span-4 flex min-w-0 items-center gap-3">
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
            <Image src={imageSrc} alt={item.title} fill className="object-cover" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
              {item.title}
            </h3>
            {item.subtitle && (
              <p className="truncate text-xs text-muted-foreground">
                {item.subtitle}
              </p>
            )}
          </div>
        </Link>
        <div className="col-span-2 text-sm font-semibold text-foreground">
          {item.price != null ? (
            `$${item.price.toLocaleString('en-US')}`
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
        <div className="col-span-2 flex flex-wrap items-center gap-1.5">
          {hasStatus ? (
            <>
              <SalePill active={item.for_sale} />
              <TradePill active={item.for_trade} />
            </>
          ) : (
            <span className="text-xs text-muted-foreground/70">Private</span>
          )}
        </div>
        <div className="col-span-3 flex items-center">
          {showCollectionChip && <CollectionChip item={item} />}
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <div className="w-full max-w-[2.75rem] opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
            {ownership === "owner" ? (
              <ItemActionsMenu item={item} />
            ) : (
              <WatchlistHeart itemId={item.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
