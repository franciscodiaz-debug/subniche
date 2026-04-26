"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  Bookmark,
  Check,
  Clock3,
  FolderHeart,
  Heart,
  HeartOff,
  MessageCircle,
  MoreHorizontal,
  Search,
  Tag,
  TrendingDown,
  UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type {
  MockCollection,
  MockListing,
  MockProfile,
} from "@/data/mock/types";

type FavoritesPageProps = {
  collections: MockCollection[];
  listings: MockListing[];
  profiles: MockProfile[];
};

const savedSearches = [
  {
    id: "vintage-fenders",
    name: "vintage Fender amp",
    filterSummary:
      "Fender, tube amps, serviced or excellent, under $4,500, within 500 miles",
    matchCount: 12,
    alerts: "Instant email",
  },
  {
    id: "prs-under-4k",
    name: "PRS under $4k",
    filterSummary:
      "PRS, electric guitars, excellent condition, cash plus trade accepted",
    matchCount: 7,
    alerts: "Daily digest",
  },
  {
    id: "boutique-delay",
    name: "boutique delay pedal",
    filterSummary:
      "Effects pedals, delay/modulation, mint or excellent, shipping available",
    matchCount: 19,
    alerts: "Alerts paused",
  },
];

export function FavoritesPage({
  collections,
  listings,
  profiles,
}: FavoritesPageProps) {
  const savedItems = [
    ...new Map(
      listings
        .filter((listing) => listing.isSaved || listing.statuses.forTrade)
        .slice(0, 6)
        .map((listing) => [listing.id, listing]),
    ).values(),
  ];
  const feedItems = [
    {
      label: "Saved search match",
      title: listings[4]?.title ?? "PRS Custom 24 10-Top",
      body: "Matches your PRS under $4k search and accepts cash plus trade.",
      icon: Search,
      href: listings[4]?.href ?? "/market",
    },
    {
      label: "Price drop",
      title: listings[7]?.title ?? "Fender Twin Reverb",
      body: "Tone Archive lowered the cash side while keeping trade interest open.",
      icon: TrendingDown,
      href: listings[7]?.href ?? "/market",
    },
    {
      label: "Collection update",
      title: collections[0]?.title ?? "Studio Workhorses",
      body: "Kyle added two pieces and updated collection value context.",
      icon: FolderHeart,
      href: collections[0]?.href ?? "/collections",
    },
    {
      label: "New from followed user",
      title: profiles[1]?.displayName ?? "Mara Voss",
      body: "Posted a fresh acoustic listing in Acoustic Corner.",
      icon: UserPlus,
      href: "/profile",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-accent/35 bg-accent/10 px-3 py-1.5 text-xs font-semibold uppercase text-accent">
            <Heart className="size-3.5" aria-hidden="true" />
            Following
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-foreground">
            Favorites
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Followed listings, collections, people, and saved searches with the
            updates that explain why they matter.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm sm:min-w-96">
          <Metric value={savedItems.length.toString()} label="saved items" />
          <Metric value={collections.length.toString()} label="collections" />
          <Metric value={savedSearches.length.toString()} label="searches" />
        </div>
      </header>

      <Tabs defaultValue="feed" className="mt-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <TabsList className="w-full overflow-x-auto lg:w-auto">
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="searches">Searches</TabsTrigger>
          </TabsList>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-muted-foreground"
          >
            <Clock3 className="size-4" aria-hidden="true" />
            Most recent activity
          </button>
        </div>

        <TabsContent value="feed" className="mt-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="space-y-3">
              {feedItems.map((item) => (
                <ActivityCard key={item.title} {...item} />
              ))}
            </div>
            <Card className="rounded-lg p-5">
              <h2 className="text-base font-semibold text-foreground">
                Saved search pulse
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Saved searches work like lightweight watchlists. They keep
                matching new inventory without needing a full marketplace pass.
              </p>
              <div className="mt-5 space-y-3">
                {savedSearches.map((search) => (
                  <div
                    key={search.id}
                    className="rounded-lg border border-border bg-background/50 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-foreground">
                        {search.name}
                      </span>
                      <Badge variant="info">{search.matchCount} matches</Badge>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {search.filterSummary}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="items" className="mt-6">
          <div className="grid gap-4">
            {savedItems.map((listing) => (
              <FollowedListingRow key={listing.id} listing={listing} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="collections" className="mt-6">
          <div className="grid gap-4">
            {collections.map((collection) => (
              <FollowedCollectionRow
                key={collection.id}
                collection={collection}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <div className="grid gap-4">
            {profiles.map((profile) => (
              <FollowedUserRow key={profile.id} profile={profile} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="searches" className="mt-6">
          <div className="grid gap-4">
            {savedSearches.map((search) => (
              <SavedSearchRow key={search.id} search={search} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-lg p-3">
      <div className="text-lg font-semibold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </Card>
  );
}

function ActivityCard({
  body,
  href,
  icon: Icon,
  label,
  title,
}: {
  body: string;
  href: string;
  icon: typeof Search;
  label: string;
  title: string;
}) {
  return (
    <Link href={href} className="block">
      <Card variant="interactive" className="rounded-lg p-5">
        <div className="flex gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-lg border border-accent/35 bg-accent/10 text-accent">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase text-muted-foreground">
              {label}
            </div>
            <h2 className="mt-1 text-lg font-semibold text-foreground">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {body}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function FollowedListingRow({ listing }: { listing: MockListing }) {
  return (
    <Card className="rounded-lg p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Link href={listing.href ?? "/market"} className="shrink-0">
          <div className="relative size-24 overflow-hidden rounded-lg bg-muted">
            {listing.imageUrl ? (
              <Image
                src={listing.imageUrl}
                alt={listing.title}
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : null}
          </div>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={listing.href ?? "/market"}
              className="font-semibold text-foreground transition hover:text-accent"
            >
              {listing.title}
            </Link>
            {listing.statuses.forTrade ? (
              <Badge variant="default">Tradeable</Badge>
            ) : null}
            {listing.isSaved ? <Badge variant="success">Saved</Badge> : null}
          </div>
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
            {listing.subtitle}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {listing.price}
            </span>
            <span>{listing.location}</span>
            <span>{listing.sellerName}</span>
          </div>
        </div>
        <RowMenu removeLabel="Remove from following" />
      </div>
    </Card>
  );
}

function FollowedCollectionRow({
  collection,
}: {
  collection: MockCollection;
}) {
  return (
    <Card className="rounded-lg p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Link href={collection.href} className="shrink-0">
          <div className="grid size-24 grid-cols-2 gap-px overflow-hidden rounded-lg bg-border">
            {collection.images.slice(0, 4).map((image, index) => (
              <div
                key={`${collection.id}-${image}-${index}`}
                className="relative bg-muted"
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={collection.href}
            className="font-semibold text-foreground transition hover:text-accent"
          >
            {collection.title}
          </Link>
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
            {collection.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">
                {collection.itemCount}
              </span>{" "}
              items
            </span>
            {collection.estimatedValue ? (
              <span>{collection.estimatedValue} estimate</span>
            ) : null}
            <span>Updated recently</span>
          </div>
        </div>
        <RowMenu removeLabel="Unfollow collection" />
      </div>
    </Card>
  );
}

function FollowedUserRow({ profile }: { profile: MockProfile }) {
  return (
    <Card className="rounded-lg p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Link href="/profile" className="shrink-0">
          <div className="relative size-16 overflow-hidden rounded-full border border-border bg-muted">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={profile.displayName}
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : null}
          </div>
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href="/profile"
            className="font-semibold text-foreground transition hover:text-accent"
          >
            {profile.displayName}
          </Link>
          <p className="text-sm text-muted-foreground">{profile.handle}</p>
          <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">
            {profile.bio}
          </p>
        </div>
        <Link
          href="/inbox"
          className={buttonVariants({ variant: "secondary", size: "sm" })}
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          Message
        </Link>
      </div>
    </Card>
  );
}

function SavedSearchRow({
  search,
}: {
  search: (typeof savedSearches)[number];
}) {
  return (
    <Card className="rounded-lg p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-foreground">{search.name}</h2>
            <Badge variant={search.alerts.includes("paused") ? "secondary" : "info"}>
              {search.alerts}
            </Badge>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {search.filterSummary}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="default">{search.matchCount} matches</Badge>
          <Link
            href="/market"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            View matches
          </Link>
        </div>
      </div>
    </Card>
  );
}

function RowMenu({ removeLabel }: { removeLabel: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground">
        <MoreHorizontal className="size-4" aria-hidden="true" />
        <span className="sr-only">Open actions</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Bell className="mr-2 size-4" aria-hidden="true" />
          Update alerts
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Tag className="mr-2 size-4" aria-hidden="true" />
          Add note
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive hover:text-destructive">
          <HeartOff className="mr-2 size-4" aria-hidden="true" />
          {removeLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
