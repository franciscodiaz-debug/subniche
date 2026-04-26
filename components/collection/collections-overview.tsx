import Link from "next/link";
import { Grid3X3, List, Plus, Search } from "lucide-react";
import { CollectionCard } from "@/components/collection/collection-card";
import { ListingCard } from "@/components/listing/listing-card";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MockCollection, MockListing, MockProfile } from "@/data/mock";

type CollectionsOverviewProps = {
  collections: MockCollection[];
  listings: MockListing[];
  profile: MockProfile;
};

export function CollectionsOverview({
  collections,
  listings,
  profile,
}: CollectionsOverviewProps) {
  return (
    <Tabs defaultValue="collections" className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase text-accent">
            My Stuff
          </div>
          <h1 className="mt-2 text-4xl font-semibold text-foreground">
            Collections
          </h1>
        </div>
        <TabsList>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
        </TabsList>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-lg flex-1">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            className="pl-9"
            placeholder="Search your collections"
            aria-label="Search your collections"
            readOnly
          />
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/add-item"
            className={buttonVariants({ variant: "secondary" })}
          >
            <Plus className="size-4" aria-hidden="true" />
            New collection
          </Link>
          <ViewToggle />
        </div>
      </div>

      <TabsContent value="collections">
        <div className="grid gap-5 lg:grid-cols-3">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              title={collection.title}
              ownerName={profile.displayName}
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
      </TabsContent>

      <TabsContent value="items">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} {...listing} />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}

function ViewToggle() {
  return (
    <Card className="flex h-10 items-center gap-1 p-1">
      <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
        <Grid3X3 className="size-4" aria-hidden="true" />
      </span>
      <span className="grid size-8 place-items-center rounded-md text-muted-foreground">
        <List className="size-4" aria-hidden="true" />
      </span>
    </Card>
  );
}
