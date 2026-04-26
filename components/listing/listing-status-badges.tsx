import { Badge } from "@/components/ui/badge";
import type { ListingStatus } from "@/components/listing/types";

type ListingStatusBadgesProps = {
  statuses: ListingStatus;
};

export function ListingStatusBadges({ statuses }: ListingStatusBadgesProps) {
  const badges = [
    statuses.forSale ? <Badge key="sale">For Sale</Badge> : null,
    statuses.forTrade ? (
      <Badge key="trade" variant="info">
        For Trade
      </Badge>
    ) : null,
    statuses.inCollection ? (
      <Badge key="collection" variant="secondary">
        In Collection
      </Badge>
    ) : null,
    statuses.wishlist ? (
      <Badge key="wanted" variant="warning">
        Wanted
      </Badge>
    ) : null,
  ].filter(Boolean);

  if (badges.length === 0) {
    return (
      <Badge variant="outline" aria-label="No listing status set">
        Unlisted
      </Badge>
    );
  }

  return <div className="flex flex-wrap gap-1">{badges}</div>;
}
