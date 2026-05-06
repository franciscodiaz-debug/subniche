import { ListingCard } from "@/components/listing/listing-card";
import {
  gridDensityConfig,
  type GridDensity,
} from "@/components/marketplace/grid-density-selector";
import type { MockListing } from "@/data/mock/types";
import { cn } from "@/lib/utils";

type MarketplaceGridProps = {
  listings: MockListing[];
  mode: "market" | "trade";
  density: GridDensity;
};

export function MarketplaceGrid({
  listings,
  mode,
  density,
}: MarketplaceGridProps) {
  return (
    <div
      className={cn("grid gap-3", gridDensityConfig[density].cols)}
      data-density={density}
      data-testid="marketplace-grid"
    >
      {listings.map((listing) => (
        <ListingCard key={listing.id} {...listing} marketContext={mode} />
      ))}
    </div>
  );
}
