import { MapPin } from "lucide-react";
import { ListingPrice } from "@/components/listing/listing-price";
import { ListingStatusBadges } from "@/components/listing/listing-status-badges";
import { Badge } from "@/components/ui/badge";
import type { MockCategory, MockListing, MockNiche } from "@/data/mock/types";

type ListingDetailHeaderProps = {
  listing: MockListing;
  category?: MockCategory;
  niche?: MockNiche;
};

export function ListingDetailHeader({
  listing,
  category,
  niche,
}: ListingDetailHeaderProps) {
  return (
    <header className="space-y-5 rounded-lg border border-border bg-surface p-6">
      <div className="flex flex-wrap gap-2">
        {niche ? <Badge variant="outline">{niche.name}</Badge> : null}
        {category ? <Badge variant="secondary">{category.name}</Badge> : null}
      </div>
      <div className="space-y-2">
        <h1 className="max-w-4xl text-4xl font-bold tracking-normal text-foreground md:text-5xl">
          {listing.title}
        </h1>
        {listing.subtitle ? (
          <p className="text-base leading-7 text-muted-foreground">
            {listing.subtitle}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <ListingPrice
          price={listing.price}
          mode={listing.priceMode}
          className="text-4xl text-primary md:text-5xl"
        />
        <ListingStatusBadges statuses={listing.statuses} />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span>{listing.condition}</span>
        <span>{listing.brand}</span>
        {listing.location ? (
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-4" aria-hidden="true" />
            {listing.location}
          </span>
        ) : null}
        <span>Listed {formatListingDate(listing.createdAt)}</span>
      </div>
    </header>
  );
}

function formatListingDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
