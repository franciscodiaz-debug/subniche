import Link from "next/link"
import Image from "next/image"
import type { Listing } from "@/lib/types"

interface ListingCardProps {
  listing: Listing
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="block bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors"
    >
      <div className="aspect-[4/3] relative">
        <Image
          src={listing.images[0] || "/placeholder.svg?height=300&width=400&query=disc golf equipment"}
          alt={listing.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground truncate">{listing.title}</h3>
        {listing.subtitle && <p className="text-sm text-muted-foreground truncate">{listing.subtitle}</p>}
        <p className="text-xl font-bold text-primary mt-2">${listing.price}</p>
      </div>
    </Link>
  )
}
