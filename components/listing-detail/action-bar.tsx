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
import { useRouter } from "next/navigation"

import {
  Eye,
  MessageCircle,
  Pencil,
  Repeat2,
  Share2,
  ShoppingBag,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import type { AvailabilityType, MockListing } from "@/lib/mock-listing-detail"
import { useWatchlist } from "@/lib/watchlist-context"
import { MakeOfferModal } from "./make-offer-modal"

interface ViewerActionsProps {
  listingId: string
  listingTitle: string
  listingImage?: string
  listingPrice?: number | null
  availability: AvailabilityType[]
  markedAsSold?: boolean
  mutualMatch?: { matchScore: number; viewerListingTitle: string; viewerListingHref: string } | null
}

export function ViewerActions({
  listingId,
  listingTitle,
  listingImage,
  listingPrice,
  availability,
  markedAsSold,
  mutualMatch,
}: ViewerActionsProps) {
  const { isWatched, toggleWatch } = useWatchlist()
  const watching = isWatched(listingId)
  const [offerOpen, setOfferOpen] = useState(false)

  const isForSale = availability.includes("for-sale")
  const isForTrade = availability.includes("for-trade")
  const isCollectionOnly = !isForSale && !isForTrade

  // Sold state: only Send a Message
  if (markedAsSold) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
          <ShoppingBag className="h-4 w-4 shrink-0" />
          This item has been sold
        </div>
        <Link href="/inbox" className="w-full">
          <Button size="lg" className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <MessageCircle className="h-4 w-4" />
            Send a Message
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Primary CTAs */}
      <div className="flex flex-col gap-2">
        {isForSale && (
          <Link href="/inbox" className="w-full">
            <Button size="lg" className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <MessageCircle className="h-4 w-4" />
              Contact Seller
            </Button>
          </Link>
        )}

        {isForTrade && (
          <Button
            size="lg"
            variant={isForSale ? "quiet_outline" : "default"}
            className={cn(
              "w-full gap-2",
              !isForSale && "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
            onClick={() => setOfferOpen(true)}
          >
            <Repeat2 className="h-4 w-4" />
            Propose a Trade
          </Button>
        )}

        {isCollectionOnly && (
          <Link href="/inbox" className="w-full">
            <Button size="lg" className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <MessageCircle className="h-4 w-4" />
              Send a Message
            </Button>
          </Link>
        )}
      </div>

      {/* Secondary icon row — Watch (Eye, not Heart, to avoid Wishlist
          confusion) + Share. Watch state is sourced from the global
          WatchlistContext so it stays in sync with ItemCard toggles. */}
      <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-card/60 px-3 py-2">
        <IconAction
          active={watching}
          onClick={() => toggleWatch(listingId)}
          icon={Eye}
          label={watching ? "Watching" : "Watch"}
        />
        <div className="h-5 w-px bg-border" aria-hidden="true" />
        <IconAction icon={Share2} label="Share" onClick={() => {}} />
      </div>

      <MakeOfferModal
        open={offerOpen}
        onOpenChange={setOfferOpen}
        targetListingId={listingId}
        targetTitle={listingTitle}
        targetImage={listingImage}
        targetPrice={listingPrice}
      />
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
  const router = useRouter()
  const [markedAsSold, setMarkedAsSold] = useState(initialMarkedAsSold)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleConfirmDelete = () => {
    // Prototype-only — there's no shared listings store in this branch, so
    // we surface the delete intent by sending the user back to their
    // listings tab. The back team wires this to the real API.
    setDeleteOpen(false)
    router.push("/my-stuff?tab=items")
  }

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

        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogTrigger asChild>
            <Button
              size="lg"
              variant="quiet_outline"
              className="w-full gap-2 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
              <AlertDialogDescription>
                This listing will be removed permanently. People watching it
                won&apos;t see it on their watchlist anymore, and pending
                offers will be cancelled.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete listing
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
