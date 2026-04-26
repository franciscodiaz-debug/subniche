import { ListingCard } from "@/components/listing/listing-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MockListing } from "@/data/mock/types";

type RelatedListingsProps = {
  listings: MockListing[];
};

export function RelatedListings({ listings }: RelatedListingsProps) {
  if (listings.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Similar gear</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} {...listing} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
