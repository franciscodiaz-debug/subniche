"use client"

import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { MapPin, Clock, Repeat } from "lucide-react"
import type { Listing } from "@/lib/types"

interface CommunityListingCardProps {
  listing: Listing
  variant?: "grid" | "list"
}

export function CommunityListingCard({ listing, variant = "grid" }: CommunityListingCardProps) {
  const timeAgo = formatDistanceToNow(new Date(listing.created_at), { addSuffix: false })

  if (variant === "list") {
    return (
      <Link href={`/listings/${listing.id}`}>
        <div className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
          {/* Image */}
          <div className="w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
            {listing.images?.[0] ? (
              <Image
                src={listing.images[0] || "/placeholder.svg"}
                alt={listing.title}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No img</div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-foreground truncate">{listing.title}</h3>
            {listing.subtitle && <p className="text-xs text-muted-foreground truncate">{listing.subtitle}</p>}
            <div className="flex items-center gap-2 mt-1">
              {listing.condition && (
                <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground">
                  {listing.condition}
                </span>
              )}
              {listing.location && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <MapPin className="h-2.5 w-2.5" />
                  {listing.location}
                </span>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="text-right shrink-0">
            <span className="font-semibold text-primary">${listing.price}</span>
            <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo}</p>
          </div>
        </div>
      </Link>
    )
  }

  // Grid variant (default)
  return (
    <Link href={`/listings/${listing.id}`}>
      <div className="bg-card border border-border rounded-lg overflow-hidden transition-colors hover:border-primary/50 group">
        {/* Image */}
        <div className="aspect-square relative bg-muted">
          {listing.images?.[0] ? (
            <Image
              src={listing.images[0] || "/placeholder.svg"}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
          )}

          {/* Price badge */}
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-background/90 backdrop-blur-sm rounded-md">
            <span className="font-semibold text-sm text-primary">${listing.price}</span>
          </div>

          {/* Trade badge */}
          {(listing as any).for_trade && (
            <div className="absolute top-2 right-2 p-1.5 bg-background/90 backdrop-blur-sm rounded-md">
              <Repeat className="h-3.5 w-3.5 text-primary" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-2.5">
          <h3 className="font-medium text-sm text-foreground truncate">{listing.title}</h3>
          {listing.subtitle && <p className="text-xs text-muted-foreground truncate">{listing.subtitle}</p>}

          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
            {listing.condition && <span className="px-1.5 py-0.5 bg-muted rounded">{listing.condition}</span>}
            <span className="flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5" />
              {timeAgo}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
