"use client";

import type { LucideIcon } from "lucide-react";
import { Heart, MessageSquare, Repeat2, Settings } from "lucide-react";
import Link from "next/link";
import { CollectionCard } from "@/components/collection/collection-card";
import { ListingCard } from "@/components/listing/listing-card";
import type {
  MockCollection,
  MockListing,
  MockTradeInterest,
} from "@/data/mock";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
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
    <Tabs defaultValue="collections" className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-border md:flex-row md:items-center md:justify-between">
        <TabsList className="flex w-full overflow-x-auto rounded-none border-0 bg-transparent p-0 md:w-auto">
          <TabsTrigger
            value="collections"
            className="relative mr-10 rounded-none bg-transparent px-0 py-4 text-2xl font-semibold shadow-none after:absolute after:bottom-[-1px] after:left-0 after:h-0.5 after:w-full after:bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:after:bg-primary md:text-3xl"
          >
            Collections
          </TabsTrigger>
          <TabsTrigger
            value="available"
            className="relative mr-10 rounded-none bg-transparent px-0 py-4 text-2xl font-semibold shadow-none after:absolute after:bottom-[-1px] after:left-0 after:h-0.5 after:w-full after:bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:after:bg-primary md:text-3xl"
          >
            For Sale / Trade
          </TabsTrigger>
          <TabsTrigger
            value="wanted"
            className="relative mr-10 rounded-none bg-transparent px-0 py-4 text-2xl font-semibold shadow-none after:absolute after:bottom-[-1px] after:left-0 after:h-0.5 after:w-full after:bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:after:bg-primary md:text-3xl"
          >
            Looking For
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="relative rounded-none bg-transparent px-0 py-4 text-2xl font-semibold shadow-none after:absolute after:bottom-[-1px] after:left-0 after:h-0.5 after:w-full after:bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:after:bg-primary md:text-3xl"
          >
            Activity
          </TabsTrigger>
        </TabsList>
        <Link
          href="/collections"
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className:
              "mb-3 w-fit text-muted-foreground hover:text-foreground md:mb-0",
          })}
        >
          <Settings className="size-4" aria-hidden="true" />
          Manage
        </Link>
      </div>

      <TabsContent value="collections" className="mt-0">
        {collections.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
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

      <TabsContent value="available" className="mt-0">
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

      <TabsContent value="wanted" className="mt-0">
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
              <Card key={interest.id} className="rounded-lg p-4">
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

      <TabsContent value="activity" className="mt-0">
        <div className="grid gap-3">
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
    <Card className="rounded-lg p-4">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-card text-accent ring-1 ring-border">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <div>
          <div className="text-sm font-semibold text-foreground">{title}</div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p>
        </div>
      </div>
    </Card>
  );
}
