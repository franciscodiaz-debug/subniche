import { ListingCard } from "@/components/listing/listing-card";
import type { MockListing } from "@/data/mock/types";

type MarketplaceGridProps = {
  listings: MockListing[];
};

export function MarketplaceGrid({ listings }: MarketplaceGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {listings.map((listing) => (
        <ListingCard key={listing.id} {...listing} />
      ))}
    </div>
  );
}
