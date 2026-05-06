import { ChevronRight, Clock, MapPin } from "lucide-react";
import { ListingPrice } from "@/components/listing/listing-price";
import { ListingStatusBadges } from "@/components/listing/listing-status-badges";
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
    <header className="space-y-4 md:space-y-5">
      <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {niche ? <span>{niche.name}</span> : null}
        {niche && category ? (
          <ChevronRight className="size-3.5" aria-hidden="true" />
        ) : null}
        {category ? (
          <span className="font-medium text-foreground">{category.name}</span>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <ListingStatusBadges statuses={listing.statuses} />
        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="size-3.5" aria-hidden="true" />
          Listed {formatListingDate(listing.createdAt)}
        </span>
      </div>
      <div className="space-y-2">
        <h1 className="max-w-4xl text-2xl font-bold leading-tight tracking-normal text-foreground sm:text-3xl md:text-4xl">
          {listing.title}
        </h1>
        {listing.subtitle ? (
          <p className="text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
            {listing.subtitle}
          </p>
        ) : null}
      </div>
      <div>
        <ListingPrice
          price={listing.price}
          mode={listing.priceMode}
          className="text-3xl md:text-4xl"
        />
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
