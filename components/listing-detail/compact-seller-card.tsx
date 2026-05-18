"use client"

/**
 * Compact seller card.
 *
 * Lives in the left column of the listing detail page. Shows the minimum
 * buyer context — avatar, name, location, join year, aggregated rating — and
 * nothing more. The rating is a single tappable line pointing to the seller's
 * reviews tab; full reviews have been moved off the listing page entirely.
 */

import Image from "next/image"
import Link from "next/link"
import { MapPin, Star } from "lucide-react"

import type { MockSeller } from "@/lib/mock-listing-detail"

interface CompactSellerCardProps {
  seller: MockSeller
}

export function CompactSellerCard({ seller }: CompactSellerCardProps) {
  return (
    <div className="rounded-card border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <Link
          href={seller.profileHref}
          className="flex-shrink-0"
          aria-label={`${seller.displayName} profile`}
        >
          <div className="relative h-12 w-12 overflow-hidden rounded-full bg-muted">
            <Image
              src={seller.avatarUrl || "/placeholder.svg"}
              alt=""
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            href={seller.profileHref}
            className="block truncate text-sm font-semibold text-foreground transition-colors hover:text-primary"
          >
            {seller.displayName}
          </Link>
          <p className="truncate text-xs text-muted-foreground">
            @{seller.username} · Member since {seller.joinedYear}
          </p>
        </div>

        <Link
          href={seller.profileHref}
          className="flex-shrink-0 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-muted-foreground"
        >
          View Profile
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          {seller.location}
        </span>

        <Link
          href={`${seller.profileHref}?tab=reviews`}
          className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
        >
          <Star
            className="h-3.5 w-3.5 fill-primary text-primary"
            aria-hidden="true"
          />
          <span className="font-medium text-foreground">
            {seller.ratingAverage.toFixed(1)}
          </span>
          <span>({seller.ratingCount.toLocaleString('en-US')} reviews)</span>
        </Link>
      </div>
    </div>
  )
}
