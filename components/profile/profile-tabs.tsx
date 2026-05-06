"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  Clock,
  DollarSign,
  FolderOpen,
  Heart,
  Package,
  Repeat2,
  Search,
  Tag,
  Eye,
  EyeOff,
} from "lucide-react";
import type {
  MockCollection,
  MockListing,
  MockTradeInterest,
} from "@/data/mock";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type ProfileTabsProps = {
  collections: MockCollection[];
  displayName: string;
  listings: MockListing[];
  tradeInterests: MockTradeInterest[];
  wantedListings: MockListing[];
};

const tabClass =
  "rounded-none bg-transparent px-0 py-2 text-xl font-semibold text-muted-foreground shadow-none data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none";

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
  const wishlistCards =
    wantedListings.length > 0
      ? wantedListings
      : buildFallbackWishlist(listings, displayName);
  const activityItems = buildActivityItems(availableListings, collections);

  return (
    <Tabs defaultValue="collections" className="space-y-7">
      <div className="overflow-x-auto">
        <TabsList className="flex w-max min-w-full items-center gap-8 rounded-none border-0 bg-transparent p-0">
          <TabsTrigger value="collections" className={tabClass}>
            Collections
          </TabsTrigger>
          <TabsTrigger value="available" className={tabClass}>
            For Sale/Trade
          </TabsTrigger>
          <TabsTrigger value="wanted" className={tabClass}>
            Looking For
          </TabsTrigger>
          <TabsTrigger value="activity" className={tabClass}>
            Activity
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="collections" className="mt-0">
        {collections.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {collections.map((collection) => (
              <ProfileCollectionCard
                key={collection.id}
                collection={collection}
                ownerName={displayName}
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableListings.map((listing) => (
              <ProfileListingCard key={listing.id} listing={listing} />
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
        <div className="space-y-7">
          <section className="space-y-4" aria-label="Trade interests">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="rounded-full px-3 py-1.5 text-sm">
                {tradeInterests.length} trade interests
              </Badge>
            </div>
            <div className="divide-y divide-border border-y border-border">
              {tradeInterests.map((interest) => (
                <TradeInterestRow key={interest.id} interest={interest} />
              ))}
            </div>
          </section>

          <section className="space-y-4" aria-label="Wishlist items">
            <Badge variant="secondary" className="rounded-full px-3 py-1.5 text-sm">
              {wishlistCards.length} wishlist items
            </Badge>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {wishlistCards.map((listing) => (
                <WishlistCard key={listing.id} listing={listing} />
              ))}
            </div>
          </section>
        </div>
      </TabsContent>

      <TabsContent value="activity" className="mt-0">
        <div className="space-y-3">
          {activityItems.map((item) => (
            <ActivityRow key={item.title} {...item} />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}

function ProfileCollectionCard({
  collection,
  ownerName,
}: {
  collection: MockCollection;
  ownerName: string;
}) {
  const privateCollection = collection.visibility.toLowerCase().includes("unlisted");
  const VisibilityIcon = privateCollection ? EyeOff : Eye;
  const mosaicImages = getMosaicImages(collection);

  return (
    <Link
      href={collection.href}
      className="group block overflow-hidden rounded-lg border border-border bg-card transition hover:border-primary/50"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <div className="grid size-full grid-cols-2 grid-rows-2 gap-px bg-border">
          {[0, 1, 2, 3].map((index) => (
            <div key={`${collection.id}-${index}`} className="relative bg-muted">
              <Image
                src={mosaicImages[index]}
                alt=""
                fill
                sizes="(min-width: 1280px) 22vw, (min-width: 768px) 40vw, 50vw"
                className="object-cover transition duration-300 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="relative space-y-3 p-3">
        <VisibilityIcon
          className={cn(
            "absolute right-3 top-3 size-4",
            privateCollection ? "text-muted-foreground" : "text-success",
          )}
          aria-label={collection.visibility}
        />
        <div className="pr-8">
          <h3 className="truncate text-base font-medium text-foreground">
            {collection.title}
          </h3>
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
            {collection.description}
          </p>
        </div>
        <div className="border-t border-border pt-3 text-sm">
          <span className="text-muted-foreground">{collection.itemCount} items</span>
          <span className="mx-2 text-border" aria-hidden="true">
            |
          </span>
          <span className="font-medium text-foreground">
            {collection.aiEstimate ?? collection.estimatedValue}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">{ownerName}</div>
      </div>
    </Link>
  );
}

function getMosaicImages(collection: MockCollection) {
  const fallbackImages = [
    "/mock/listings/fender-stratocaster-sunburst.jpg",
    "/mock/listings/gibson-les-paul-goldtop.jpg",
    "/mock/listings/fender-twin-reverb.jpg",
    "/mock/listings/gretsch-6120-orange.jpg",
  ];
  const images = collection.images.filter(Boolean);

  return [0, 1, 2, 3].map(
    (index) => images[index] ?? fallbackImages[index % fallbackImages.length],
  );
}

function ProfileListingCard({ listing }: { listing: MockListing }) {
  return (
    <Link
      href={listing.href ?? "/market"}
      className="group block overflow-hidden rounded-lg border border-border bg-card transition hover:border-primary/50"
    >
      <div className="relative aspect-[4/3] bg-muted">
        {listing.imageUrl ? (
          <Image
            src={listing.imageUrl}
            alt={listing.title}
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 33vw, 100vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="space-y-1.5 p-3">
        <h3 className="line-clamp-1 text-sm font-semibold text-foreground">
          {listing.title}
        </h3>
        <p className="line-clamp-1 text-xs text-muted-foreground">
          {listing.subtitle}
        </p>
        <div className="flex items-center justify-between gap-2 pt-1.5">
          {listing.price ? (
            <span className="font-semibold text-primary">
              {listing.price}
            </span>
          ) : null}
          <span className="flex items-center gap-1.5">
            {listing.statuses.forSale ? (
              <DollarSign className="size-3.5 text-success" aria-label="For sale" />
            ) : null}
            {listing.statuses.forTrade ? (
              <Repeat2
                className="size-3.5 text-info"
                aria-label="Open to trade"
              />
            ) : null}
          </span>
        </div>
      </div>
    </Link>
  );
}

function TradeInterestRow({ interest }: { interest: MockTradeInterest }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="py-4">
      <button
        type="button"
        className="flex w-full items-start gap-4 text-left"
        aria-expanded={expanded}
        onClick={() => setExpanded((current) => !current)}
      >
        <Repeat2
          className="mt-1 size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-base font-medium text-foreground">
            {interest.title}
          </span>
          <span className="mt-1 block text-sm leading-6 text-muted-foreground">
            {interest.description}
          </span>
        </span>
        <span className="mt-1 flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
          ({interest.criteria.length})
          <ChevronDown
            className={cn(
              "size-4 transition",
              expanded && "rotate-180 text-primary",
            )}
            aria-hidden="true"
          />
        </span>
      </button>
      {expanded ? (
        <div className="ml-8 mt-3 flex flex-wrap gap-2">
          {interest.criteria.map((criterion) => (
            <Badge key={`${interest.id}-${criterion.label}`} variant="outline">
              {criterion.label}: {criterion.value}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function WishlistCard({ listing }: { listing: MockListing }) {
  return (
    <Link
      href={listing.href ?? "/market"}
      className="group block overflow-hidden rounded-lg border border-dashed border-border bg-secondary/20 transition hover:border-primary/45"
    >
      <div className="relative aspect-[4/3] bg-muted opacity-55">
        {listing.imageUrl ? (
          <Image
            src={listing.imageUrl}
            alt={listing.title}
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 33vw, 100vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="space-y-1.5 p-3">
        <h3 className="line-clamp-1 text-sm font-semibold text-muted-foreground">
          {listing.title}
        </h3>
        <p className="line-clamp-1 text-xs text-muted-foreground">
          {listing.subtitle}
        </p>
        <div className="flex justify-end pt-1.5">
          <Search className="size-4 text-primary" aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}

function ActivityRow({
  icon: Icon,
  timestamp,
  title,
  tone,
}: {
  icon: LucideIcon;
  timestamp: string;
  title: string;
  tone: "primary" | "success" | "info" | "warning" | "destructive";
}) {
  const toneClass = {
    primary: "text-primary",
    success: "text-success",
    info: "text-info",
    warning: "text-warning",
    destructive: "text-destructive",
  }[tone];

  return (
    <Card className="rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-muted">
          <Icon className={cn("size-4", toneClass)} aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-base font-medium text-foreground">{title}</h3>
          <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3" aria-hidden="true" />
            {timestamp}
          </p>
        </div>
      </div>
    </Card>
  );
}

function buildFallbackWishlist(
  listings: MockListing[],
  displayName: string,
): MockListing[] {
  return listings.slice(0, 6).map((listing, index) => ({
    ...listing,
    id: `profile-wishlist-${listing.id}`,
    title:
      [
        "1959 Gibson Les Paul Standard",
        "Dumble Overdrive Special",
        "Original Klon Centaur",
        "1963 Fender Stratocaster",
        "Gibson ES-335 Dot",
        "Blackface Fender Deluxe Reverb",
      ][index] ?? listing.title,
    subtitle:
      [
        "Sunburst, original PAFs",
        "Any year, working condition",
        "Silver or gold",
        "Pre-CBS, original finish",
        "Pre-1965, cherry preferred",
        "1964 - 1967, unmodified",
      ][index] ?? listing.subtitle,
    price: undefined,
    priceMode: "wanted",
    sellerName: displayName,
    statuses: { wishlist: true },
  }));
}

function buildActivityItems(
  listings: MockListing[],
  collections: MockCollection[],
): Array<{
  icon: LucideIcon;
  timestamp: string;
  title: string;
  tone: "primary" | "success" | "info" | "warning" | "destructive";
}> {
  const firstListing = listings[0]?.title ?? "Fender Stratocaster";
  const secondListing = listings[1]?.title ?? "Gibson ES-335";
  const firstCollection = collections[0]?.title ?? "Studio Workhorses";

  return [
    {
      icon: Tag,
      title: `Listed ${firstListing} for sale`,
      timestamp: "Apr 10, 4:20 PM",
      tone: "primary",
    },
    {
      icon: Package,
      title: "Completed trade with @vintagegearnyc",
      timestamp: "Apr 8, 2:15 PM",
      tone: "success",
    },
    {
      icon: FolderOpen,
      title: `Added ${secondListing} to ${firstCollection}`,
      timestamp: "Apr 7, 8:45 AM",
      tone: "info",
    },
    {
      icon: Tag,
      title: "Made an offer on Gibson ES-335",
      timestamp: "Apr 5, 1:20 PM",
      tone: "warning",
    },
    {
      icon: Heart,
      title: "Started following @tubescreamer_fan",
      timestamp: "Apr 3, 3:00 PM",
      tone: "destructive",
    },
  ];
}
