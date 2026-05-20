"use client"

/**
 * Collection visitor view — read-only render for someone who isn't the
 * collection owner. Header mirrors the owner view so the page feels
 * familiar; only the action surface changes (Follow + Share-inside-dots
 * instead of Edit + Share + Delete).
 *
 * Visibility rules:
 *   - private   → render a "this collection is private" placeholder
 *   - unlisted  → render the full collection (visitor must have a direct link)
 *   - public    → render the full collection
 */

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Check,
  Flag,
  Globe,
  Heart,
  Link2,
  Lock,
  MoreHorizontal,
  Share2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Collection, CollectionVisibility } from "@/lib/types"
import type { MyItem } from "@/lib/mock/my-stuff"
import { useCollections } from "@/lib/collections-context"
import { ItemCard } from "@/components/item-card"

const visibilityConfig: Record<
  CollectionVisibility,
  { label: string; icon: typeof Lock; className: string }
> = {
  private: {
    label: "Private",
    icon: Lock,
    className: "border-border bg-secondary/50 text-muted-foreground",
  },
  unlisted: {
    label: "Unlisted",
    icon: Link2,
    className: "border-primary/25 bg-primary/10 text-primary",
  },
  public: {
    label: "Public",
    icon: Globe,
    className: "border-green-500/25 bg-green-500/10 text-green-600 dark:text-green-400",
  },
}

interface CollectionVisitorViewProps {
  collection: Collection
  ownedItems: MyItem[]
  categories: string[]
}

export function CollectionVisitorView({
  collection,
  ownedItems,
  categories,
}: CollectionVisitorViewProps) {
  const visibility = collection.visibility ?? "private"

  // Private collections never render their contents to a visitor.
  if (visibility === "private") {
    return <PrivateCollectionNotice />
  }

  const vis = visibilityConfig[visibility]
  const VisibilityIcon = vis.icon

  const totalValue = useMemo(
    () => ownedItems.reduce((sum, item) => sum + (item.price ?? 0), 0),
    [ownedItems],
  )

  return (
    <div className="px-4 pb-8 pt-6 md:px-8">
      {/* Back nav */}
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
          <Link href="/">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      {/* Header — same shape as the owner view: visibility chip on top,
          then title + actions, then inline stats, then description. */}
      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
              vis.className,
            )}
          >
            <VisibilityIcon className="h-3 w-3" />
            {vis.label}
          </span>
        </div>

        <div className="mb-2 flex items-center gap-2">
          <h1 className="min-w-0 text-balance text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
            {collection.name}
          </h1>

          {/* Follow takes the slot the owner's Share button occupies, so
              the row layout matches the owner view exactly. */}
          <FollowCollectionButton collectionId={collection.id} />

          {/* Three-dots menu carries Share + Report — keeps the visitor
              view symmetrical with the owner view's overflow menu. */}
          <VisitorActionsMenu collectionId={collection.id} />
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span>
            {ownedItems.length}{" "}
            {ownedItems.length === 1 ? "item" : "items"}
          </span>
          {totalValue > 0 && (
            <>
              <span aria-hidden>·</span>
              <span>
                $
                {totalValue >= 1000
                  ? `${Math.round(totalValue / 1000)}K`
                  : totalValue.toLocaleString("en-US")}{" "}
                total
              </span>
            </>
          )}
          {categories.length > 0 && (
            <>
              <span aria-hidden>·</span>
              <span>{categories.join(", ")}</span>
            </>
          )}
        </div>

        {collection.description && (
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {collection.description}
          </p>
        )}
      </div>

      {/* Items grid — read-only, watchlist-mode cards. */}
      {ownedItems.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ownedItems.map((item) => (
            <ItemCard
              key={item.id}
              id={item.id}
              title={item.title}
              subtitle={item.subtitle ?? undefined}
              image={item.images[0] || "/placeholder.svg"}
              href={`/listings/${item.id}`}
              price={item.price ?? null}
              forSale={item.for_sale}
              forTrade={item.for_trade}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* FollowCollectionButton                                                     */
/*                                                                            */
/* Toggles the current user's "followed collections" set in the local store.  */
/* Matches the visual weight of the owner's Share button so both views share  */
/* the same header rhythm.                                                    */
/* -------------------------------------------------------------------------- */
function FollowCollectionButton({ collectionId }: { collectionId: string }) {
  const { isFollowingCollection, toggleFollowCollection } = useCollections()
  const following = isFollowingCollection(collectionId)
  return (
    <button
      type="button"
      onClick={() => toggleFollowCollection(collectionId)}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors",
        following
          ? "border-primary bg-primary/10 text-primary hover:bg-primary/15"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
      aria-pressed={following}
    >
      <Heart className={cn("h-3.5 w-3.5", following && "fill-current")} />
      {following ? "Following" : "Follow"}
    </button>
  )
}

/* -------------------------------------------------------------------------- */
/* VisitorActionsMenu                                                         */
/*                                                                            */
/* Overflow menu mirroring the owner view's. Visitors get Share + Report;     */
/* destructive actions (delete, edit) are owner-only and don't appear here.   */
/* -------------------------------------------------------------------------- */
function VisitorActionsMenu({ collectionId }: { collectionId: string }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = `${window.location.origin}/collection/${collectionId}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      // ignore — clipboard may be blocked in some contexts
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
        <MoreHorizontal className="h-3.5 w-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Collection
        </DropdownMenuLabel>
        <DropdownMenuItem onSelect={handleShare}>
          {copied ? (
            <Check className="mr-2 h-4 w-4 text-primary" />
          ) : (
            <Share2 className="mr-2 h-4 w-4" />
          )}
          {copied ? "Link copied" : "Share"}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => console.log("[stub] report collection", collectionId)}>
          <Flag className="mr-2 h-4 w-4" />
          Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* -------------------------------------------------------------------------- */
/* Private collection notice                                                  */
/* -------------------------------------------------------------------------- */
function PrivateCollectionNotice() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 px-6 pt-24 pb-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Lock className="h-6 w-6" />
      </div>
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          This collection is private
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The owner hasn&apos;t shared this collection publicly. Try the link
          again later or browse other collectors.
        </p>
      </div>
      <Button asChild variant="quiet_outline">
        <Link href="/">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back home
        </Link>
      </Button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-secondary/20 p-8 text-center">
      <p className="text-sm text-muted-foreground">
        No items in this collection yet.
      </p>
    </div>
  )
}
