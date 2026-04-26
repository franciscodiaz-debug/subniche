"use client";

import type { LucideIcon } from "lucide-react";
import { Heart, MessageSquare, Repeat2 } from "lucide-react";
import { CollectionCard } from "@/components/collection/collection-card";
import { ListingCard } from "@/components/listing/listing-card";
import type {
  MockCollection,
  MockListing,
  MockTradeInterest,
} from "@/data/mock";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ProfileTabsProps = {
  collections: MockCollection[];
  displayName: string;
  listings: MockListing[];
  tradeInterests: MockTradeInterest[];
  wantedListings: MockListing[];
};

export function ProfileTabs({
  collections,
  displayName,
  listings,
  tradeInterests,
  wantedListings,
}: ProfileTabsProps) {
  const availableListings = listings.filter(
    (listing) => listing.statuses.forSale || listing.statuses.forTrade,
  );

  return (
    <Tabs defaultValue="collections" className="space-y-5">
      <TabsList className="flex w-full overflow-x-auto rounded-none border-x-0 border-t-0 bg-transparent p-0">
        <TabsTrigger value="collections" className="mr-8 rounded-none px-0 py-3">
          Collections
        </TabsTrigger>
        <TabsTrigger value="available" className="mr-8 rounded-none px-0 py-3">
          For Sale / Trade
        </TabsTrigger>
        <TabsTrigger value="wanted" className="mr-8 rounded-none px-0 py-3">
          Looking For
        </TabsTrigger>
        <TabsTrigger value="activity" className="rounded-none px-0 py-3">
          Activity
        </TabsTrigger>
      </TabsList>

      <TabsContent value="collections">
        {collections.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-3">
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                title={collection.title}
                ownerName={displayName}
                itemCount={collection.itemCount}
                description={collection.description}
                estimatedValue={collection.estimatedValue}
                aiEstimate={collection.aiEstimate}
                images={collection.images}
                visibility={collection.visibility}
                href={collection.href}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No collections yet."
            body="Collections will show taste, ownership, and trust context."
          />
        )}
      </TabsContent>

      <TabsContent value="available">
        {availableListings.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {availableListings.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No sale or trade listings yet."
            body="Items marked For Sale or For Trade will appear here."
          />
        )}
      </TabsContent>

      <TabsContent value="wanted">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          {wantedListings.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2">
              {wantedListings.map((listing) => (
                <ListingCard key={listing.id} {...listing} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No wanted items yet."
              body="Wanted items show what this profile is looking for without confusing them with owned inventory."
            />
          )}
          <div className="space-y-3">
            {tradeInterests.map((interest) => (
              <Card key={interest.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="grid size-9 place-items-center rounded-lg bg-info/12 text-info">
                    <Repeat2 className="size-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {interest.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {interest.description}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {interest.criteria.map((criterion) => (
                    <Badge
                      key={`${criterion.label}-${criterion.value}`}
                      variant="outline"
                    >
                      {criterion.label}: {criterion.value}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="activity">
        <div className="grid gap-4 md:grid-cols-3">
          <ActivityCard
            icon={Repeat2}
            title="Trade criteria updated"
            body="Vintage Fender combos now require documented service history."
          />
          <ActivityCard
            icon={Heart}
            title="Saved wanted item"
            body="Added a clean semi-hollow search to the profile context."
          />
          <ActivityCard
            icon={MessageSquare}
            title="Offer context"
            body="Recent conversations stay tied to listing and trade intent."
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}

function ActivityCard({
  body,
  icon: Icon,
  title,
}: {
  body: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="size-4 text-accent" aria-hidden="true" />
        {title}
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>
    </Card>
  );
}
