import Link from "next/link";
import {
  ArrowRightLeft,
  Bookmark,
  ChevronRight,
  Mail,
  MapPin,
  Package,
  Share2,
  Wrench,
} from "lucide-react";
import { ListingPrice } from "@/components/listing/listing-price";
import { ListingStatusBadges } from "@/components/listing/listing-status-badges";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MockListing, MockProfile } from "@/data/mock/types";

type ListingActionPanelProps = {
  listing: MockListing;
  seller?: MockProfile;
  listingCount?: number;
};

export function ListingActionPanel({
  listing,
  seller,
  listingCount = 0,
}: ListingActionPanelProps) {
  const actions = getActions(listing);

  return (
    <Card className="overflow-hidden rounded-lg p-0">
      {seller ? (
        <Link
          href="/profile"
          className="group flex items-center gap-3 border-b border-border p-4 transition hover:bg-secondary/60"
        >
          <Avatar className="size-12 rounded-xl">
            {seller.avatarUrl ? (
              <AvatarImage src={seller.avatarUrl} alt="" />
            ) : null}
            <AvatarFallback>
              {seller.displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-foreground transition group-hover:text-primary">
              {seller.displayName}
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" aria-hidden="true" />
                {seller.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <Package className="size-3" aria-hidden="true" />
                {listingCount} listing{listingCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>
          <ChevronRight
            className="size-5 text-muted-foreground transition group-hover:text-primary"
            aria-hidden="true"
          />
        </Link>
      ) : null}
      <CardHeader className="pb-3">
        <CardTitle>Listing intent</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 rounded-lg border border-border bg-secondary/65 p-4">
          <ListingPrice
            price={listing.price}
            mode={listing.priceMode}
            className="text-2xl"
          />
          {listing.tradeSummary ? (
            <p className="text-sm leading-6 text-muted-foreground">
              {listing.tradeSummary}
            </p>
          ) : null}
          <ListingStatusBadges statuses={listing.statuses} />
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
          {actions.map((action, index) => (
            <Button
              key={action.label}
              type="button"
              variant={index === 0 ? "primary" : "secondary"}
              leftIcon={action.icon}
              className="w-full"
            >
              {action.label}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            leftIcon={<Bookmark className="size-4" />}
          >
            Save
          </Button>
          <Button
            type="button"
            variant="outline"
            leftIcon={<Share2 className="size-4" />}
          >
            Share
          </Button>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          Actions are placeholders in this local prototype. No messages, offers,
          or trades are submitted yet.
        </p>
      </CardContent>
    </Card>
  );
}

function getActions(listing: MockListing) {
  if (listing.statuses.wishlist) {
    return [
      { label: "I have one", icon: <Wrench className="size-4" /> },
      { label: "Message user", icon: <Mail className="size-4" /> },
    ];
  }

  const actions = [];

  if (listing.statuses.forTrade) {
    actions.push({
      label: "Propose trade",
      icon: <ArrowRightLeft className="size-4" />,
    });
    actions.push({
      label: "View trade interests",
      icon: <ArrowRightLeft className="size-4" />,
    });
  }

  if (listing.statuses.forSale) {
    actions.push({
      label: "Make offer",
      icon: <Wrench className="size-4" />,
    });
    actions.push({
      label: "Message seller",
      icon: <Mail className="size-4" />,
    });
  }

  if (actions.length === 0) {
    actions.push({
      label: "Ask about this item",
      icon: <Mail className="size-4" />,
    });
  }

  return actions;
}
