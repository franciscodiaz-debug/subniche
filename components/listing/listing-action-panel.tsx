import { ArrowRightLeft, Bookmark, Mail, Share2, Wrench } from "lucide-react";
import { ListingPrice } from "@/components/listing/listing-price";
import { ListingStatusBadges } from "@/components/listing/listing-status-badges";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MockListing } from "@/data/mock/types";

type ListingActionPanelProps = {
  listing: MockListing;
};

export function ListingActionPanel({ listing }: ListingActionPanelProps) {
  const actions = getActions(listing);

  return (
    <Card className="p-0">
      <CardHeader>
        <CardTitle>Listing intent</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border bg-muted/45 p-4">
          <ListingPrice price={listing.price} mode={listing.priceMode} />
          {listing.tradeSummary ? (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {listing.tradeSummary}
            </p>
          ) : null}
        </div>
        <ListingStatusBadges statuses={listing.statuses} />
        <div className="grid gap-2">
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
