"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { CommunityContextBadge } from "@/components/community/community-context-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { MockListing } from "@/data/mock/types";

type ListingPublishingContextProps = {
  listing: MockListing;
};

export function ListingPublishingContext({
  listing,
}: ListingPublishingContextProps) {
  const [expanded, setExpanded] = useState(false);
  const communityContexts = listing.publishingContexts.filter(
    (context) => context.type === "community_market",
  );
  const sharedCount = Math.max(1, communityContexts.length);

  return (
    <Card className="rounded-lg">
      <CardContent className="space-y-3 p-4">
        <Button
          type="button"
          variant="ghost"
          className="h-auto w-full justify-start px-0 py-0 text-left"
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
        >
          <Users className="size-4 text-primary" aria-hidden="true" />
          Posted in {sharedCount} group{sharedCount === 1 ? "" : "s"} ·{" "}
          {sharedCount} in common
        </Button>
        {expanded ? (
          <div className="flex flex-wrap gap-1.5">
            {listing.publishingContexts.map((context) => (
              <CommunityContextBadge
                key={`${context.type}-${context.label}`}
                label={context.label}
                publicMarket={context.type === "public_market"}
              />
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
