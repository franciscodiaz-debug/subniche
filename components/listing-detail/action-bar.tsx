"use client"

/**
 * Primary CTAs for the listing detail page.
 *
 * Two rendering modes depending on whether the current viewer is the owner:
 *
 *   - Viewer: "Buy — Contact Seller" / "Propose a Trade" / "Message Owner"
 *     per the availability flags, plus a secondary icon row for wishlist
 *     and share.
 *   - Owner: "Edit Listing" (primary gold), "Delete" (outlined destructive),
 *     and a "Mark as Sold" switch — followed by the stats grid.
 *
 * State here is local-only prototype state. The parent doesn't own any of
 * this because no data is actually persisted.
 */

import { useState } from "react"
import Link from "next/link"
import {
  Bookmark,
  Heart,
  MessageCircle,
  Pencil,
  Repeat2,
  Share2,
  ShoppingBag,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { AvailabilityType, MockListing } from "@/lib/mock-listing-detail"

interface ViewerActionsProps {
  availability: AvailabilityType[]
}

export function ViewerActions({ availability }: ViewerActionsProps) {
  const [wishlisted, setWishlisted] = useState(false)

  const isForSale = availability.includes("for-sale")
  const isForTrade = availability.includes("for-trade")
  const isCollectionOnly =
    availability.includes("collection") && !isForSale && !isForTrade

  return (
    <div className="flex flex-col gap-3">
      {/* Stacked primary CTAs. Order: buy > trade > message-only fallback. */}
      <div className="flex flex-col gap-2">
        {isForSale ? (
          <Button
            size="lg"
            className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <ShoppingBag className="h-4 w-4" />
            Buy — Contact Seller
          </Button>
        ) : null}

        {isForTrade ? (
          <Button
            size="lg"
            variant={isForSale ? "outline" : "default"}
            className={cn(
              "w-full gap-2",
              !isForSale && "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            <Repeat2 className="h-4 w-4" />
            Propose a Trade
          </Button>
        ) : null}

        {isCollectionOnly ? (
          <Button size="lg" className="w-full gap-2">
            <MessageCircle className="h-4 w-4" />
            Message Owner
          </Button>
        ) : null}

        {/* "Message Owner" is always available as a quieter secondary option
            for for-sale/trade listings, since not every buyer wants to lead
            with a commerce action. */}
        {!isCollectionOnly ? (
          <Button variant="ghost" size="sm" className="w-full gap-2">
            <MessageCircle className="h-4 w-4" />
            Message Owner
          </Button>
        ) : null}
      </div>

      {/* Secondary icon row. Kept quiet so it doesn't compete with primary CTAs. */}
      <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-card/60 px-3 py-2">
        <IconAction
          active={wishlisted}
          onClick={() => setWishlisted((v) => !v)}
          icon={wishlisted ? Bookmark : Heart}
          label={wishlisted ? "Saved" : "Wishlist"}
        />
        <div className="h-5 w-px bg-border" aria-hidden="true" />
        <IconAction icon={Share2} label="Share" onClick={() => {}} />
      </div>
    </div>
  )
}

function IconAction({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex flex-1 items-center justify-center gap-2 rounded px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className={cn("h-4 w-4", active && "fill-current")} aria-hidden="true" />
      <span>{label}</span>
    </button>
  )
}

/* -------------------------------------------------------------------------- */
/* Owner view                                                                 */
/* -------------------------------------------------------------------------- */

interface OwnerActionsProps {
  listingId: string
  stats?: MockListing["ownerStats"]
  initialMarkedAsSold?: boolean
}

export function OwnerActions({
  listingId,
  stats,
  initialMarkedAsSold = false,
}: OwnerActionsProps) {
  const [markedAsSold, setMarkedAsSold] = useState(initialMarkedAsSold)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Link href={`/create-listing?edit=${listingId}`} className="w-full">
          <Button
            size="lg"
            className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Pencil className="h-4 w-4" />
            Edit Listing
          </Button>
        </Link>

        <Button
          size="lg"
          variant="quiet_outline"
          className="w-full gap-2 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>

      {/* Mark as sold toggle. Styled as a toggleable row so it reads as
          state rather than an action. */}
      <button
        type="button"
        onClick={() => setMarkedAsSold((v) => !v)}
        aria-pressed={markedAsSold}
        className={cn(
          "flex items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors",
          markedAsSold
            ? "border-primary/40 bg-primary/10 text-foreground"
            : "border-border bg-card hover:border-muted-foreground",
        )}
      >
        <span className="flex flex-col items-start gap-0.5 text-left">
          <span className="font-medium">Mark as Sold</span>
          <span className="text-xs text-muted-foreground">
            {markedAsSold
              ? "Listing is hidden from search."
              : "Keep listing visible to buyers."}
          </span>
        </span>
        <span
          className={cn(
            "relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full border transition-colors",
            markedAsSold ? "border-primary bg-primary" : "border-border bg-muted",
          )}
          aria-hidden="true"
        >
          <span
            className={cn(
              "absolute h-3.5 w-3.5 rounded-full bg-background transition-transform",
              markedAsSold ? "translate-x-4" : "translate-x-0.5",
            )}
          />
        </span>
      </button>

      {stats ? <OwnerStatsGrid stats={stats} /> : null}
    </div>
  )
}

function OwnerStatsGrid({
  stats,
}: {
  stats: NonNullable<MockListing["ownerStats"]>
}) {
  const items: Array<{ label: string; value: string }> = [
    { label: "Views", value: stats.views.toLocaleString('en-US') },
    { label: "Wishlist adds", value: stats.wishlistAdds.toLocaleString('en-US') },
    { label: "Messages", value: stats.messages.toLocaleString('en-US') },
    { label: "Days listed", value: stats.daysListed.toLocaleString('en-US') },
  ]
  return (
    <div className="rounded-card border border-border bg-card p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Performance
      </p>
      <dl className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-md bg-background/40 p-3"
          >
            <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {item.label}
            </dt>
            <dd className="mt-1 font-display text-xl font-semibold tabular-nums text-foreground">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
