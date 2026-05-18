"use client"

/**
 * Card for items the user is LOOKING FOR — not items they own.
 *
 * Distinct from the generic ItemCard because:
 *   - The card itself is NOT a link. There's no `/listings/{id}` page for
 *     a wishlist item (it's an intent, not a publication).
 *   - The primary action is contextual: a visitor sends a message to the
 *     owner ("I have one"), the owner gets a quick path to Edit on their
 *     Wishlist collection page.
 *   - Shows only the slim data set the user filled in when adding the
 *     item to their Wishlist (title, subtitle, target price, source URL).
 */

import Image from "next/image"
import Link from "next/link"
import { ExternalLink, MessageCircle, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { MyItem } from "@/lib/mock/my-stuff"

interface WishlistItemCardProps {
  item: MyItem
  /** Who's looking at this card. */
  viewer: "owner" | "visitor"
  /** Username of the wishlist owner — needed to build the visitor CTA. */
  ownerUsername: string
  className?: string
}

export function WishlistItemCard({
  item,
  viewer,
  ownerUsername,
  className,
}: WishlistItemCardProps) {
  const target = item.wishlist?.targetPrice ?? null
  const sourceUrl = item.wishlist?.sourceUrl ?? null
  const imageSrc = item.images[0] ?? "/placeholder.svg"

  return (
    <div
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/40",
        className,
      )}
    >
      <div className="relative aspect-[4/3]">
        <Image
          src={imageSrc}
          alt={item.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {item.title}
          </h3>
          {item.subtitle ? (
            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
              {item.subtitle}
            </p>
          ) : null}
        </div>

        {target != null || sourceUrl ? (
          <div className="flex flex-col gap-1 border-t border-border/60 pt-2 text-xs">
            {target != null ? (
              <p className="flex items-center justify-between gap-2 text-muted-foreground">
                <span>Target</span>
                <span className="font-semibold tabular-nums text-foreground">
                  ${target.toLocaleString("en-US")}
                </span>
              </p>
            ) : null}
            {sourceUrl ? (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                View source
              </a>
            ) : null}
          </div>
        ) : null}

        {/* Contextual CTA — visitor messages the owner; owner edits on the
            wishlist collection page (no inline edit, single source of
            truth for editing). */}
        <div className="mt-auto pt-1">
          {viewer === "visitor" ? (
            <Button
              asChild
              size="sm"
              className="h-9 w-full gap-1.5 rounded-md text-sm font-medium"
            >
              <Link
                href={`/inbox?contact=${encodeURIComponent(ownerUsername)}&about=${encodeURIComponent(item.id)}`}
              >
                <MessageCircle className="h-4 w-4" />
                Message
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              size="sm"
              variant="quiet_outline"
              className="h-9 w-full gap-1.5 rounded-md text-sm font-medium"
            >
              <Link href={`/collection/wishlist-${ownerUsername}`}>
                <Pencil className="h-4 w-4" />
                Manage
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
