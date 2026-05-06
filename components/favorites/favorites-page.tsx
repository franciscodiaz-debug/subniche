"use client";

import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpDown,
  Bell,
  Check,
  ChevronDown,
  ExternalLink,
  FolderOpen,
  Heart,
  MoreHorizontal,
  Search,
  Tag,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ListingCard } from "@/components/listing/listing-card";
import type {
  MockCollection,
  MockListing,
  MockProfile,
} from "@/data/mock/types";
import { cn } from "@/lib/utils";

type FavoritesPageProps = {
  collections: MockCollection[];
  listings: MockListing[];
  profiles: MockProfile[];
};

type ActiveTab = "feed" | "items" | "collections" | "users" | "searches";
type FeedFilter = "all" | "searches" | "price-drops" | "collections" | "users";
type ListingSort = "newest" | "recent-updates" | "price-low" | "price-high";
type CollectionSort =
  | "newest"
  | "recent-updates"
  | "value-high"
  | "items-high"
  | "avg-value-high";
type UserSort = "newest" | "items-high" | "followers-high";

const tabs: Array<{ value: ActiveTab; label: string }> = [
  { value: "feed", label: "Updates" },
  { value: "items", label: "Items" },
  { value: "collections", label: "Collections" },
  { value: "users", label: "Users" },
  { value: "searches", label: "Searches" },
];

const feedFilters: Array<{
  value: FeedFilter;
  label: string;
  icon?: LucideIcon;
}> = [
  { value: "all", label: "All Activity" },
  { value: "searches", label: "Search Matches", icon: Search },
  { value: "price-drops", label: "Price Drops", icon: Tag },
  { value: "collections", label: "Collection Updates", icon: FolderOpen },
  { value: "users", label: "User Listings", icon: User },
];

const listingSortOptions: Array<{ value: ListingSort; label: string }> = [
  { value: "newest", label: "Date Added: Newest" },
  { value: "recent-updates", label: "Most Recent Activity" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

const collectionSortOptions: Array<{ value: CollectionSort; label: string }> = [
  { value: "newest", label: "Date Added: Newest" },
  { value: "recent-updates", label: "Most Recent Activity" },
  { value: "value-high", label: "Value: High to Low" },
  { value: "items-high", label: "# Items: Most to Least" },
  { value: "avg-value-high", label: "Highest Avg. Item Value" },
];

const userSortOptions: Array<{ value: UserSort; label: string }> = [
  { value: "newest", label: "Date Added: Newest" },
  { value: "items-high", label: "Items: Most to Least" },
  { value: "followers-high", label: "Followers: Most to Least" },
];

const savedSearches = [
  {
    id: "vintage-fenders",
    name: "\"vintage Fender amp\"",
    filterSummary:
      "Fender, tube amps, serviced or excellent, under $4,500, within 500 miles",
    matchCount: 12,
    alertLabel: "Instant email",
    listingIds: ["listing-fender-twin", "listing-mesa-dual-rectifier"],
  },
  {
    id: "prs-under-4k",
    name: "\"PRS under $4k\"",
    filterSummary:
      "PRS, electric guitars, excellent condition, cash plus trade accepted",
    matchCount: 7,
    alertLabel: "Daily digest",
    listingIds: ["listing-prs-custom-24", "listing-strat-pro-ii"],
  },
  {
    id: "boutique-delay",
    name: "\"boutique delay pedal\"",
    filterSummary:
      "Effects pedals, delay/modulation, mint or excellent, shipping available",
    matchCount: 19,
    alertLabel: "Alerts paused",
    listingIds: ["listing-strymon-bigsky", "listing-rickenbacker-360"],
  },
];

export function FavoritesPage({
  collections,
  listings,
  profiles,
}: FavoritesPageProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("feed");
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("all");
  const [feedSort, setFeedSort] = useState<ListingSort>("newest");
  const [itemSort, setItemSort] = useState<ListingSort>("newest");
  const [collectionSort, setCollectionSort] =
    useState<CollectionSort>("newest");
  const [userSort, setUserSort] = useState<UserSort>("newest");
  const [followedCollections, setFollowedCollections] = useState(
    () => new Set(collections.map((collection) => collection.id)),
  );

  const savedItems = useMemo(
    () =>
      [
        ...new Map(
          listings
            .filter((listing) => listing.isSaved || listing.statuses.forTrade)
            .map((listing) => [listing.id, listing]),
        ).values(),
      ].slice(0, 8),
    [listings],
  );

  const feedItems = useMemo(
    () => [
      {
        type: "searches" as const,
        label: "Saved search match",
        context: "Matches \"PRS under $4k\"",
        listing: findListing(listings, "listing-prs-custom-24"),
      },
      {
        type: "price-drops" as const,
        label: "Price drop",
        context: "Price dropped from $1,899",
        listing: findListing(listings, "listing-fender-twin"),
      },
      {
        type: "users" as const,
        label: "New from followed user",
        context: "New from Mara Voss",
        listing: findListing(listings, "listing-martin-d28"),
      },
      {
        type: "collections" as const,
        label: "Collection update",
        context: "Added to Studio Workhorses",
        listing: findListing(listings, "listing-mesa-dual-rectifier"),
      },
      {
        type: "searches" as const,
        label: "Saved search match",
        context: "Matches \"boutique delay pedal\"",
        listing: findListing(listings, "listing-strymon-bigsky"),
      },
      {
        type: "price-drops" as const,
        label: "Price drop",
        context: "Price dropped from $2,650",
        listing: findListing(listings, "listing-les-paul-goldtop"),
      },
    ],
    [listings],
  );

  const filteredFeedItems = useMemo(() => {
    const items =
      feedFilter === "all"
        ? feedItems
        : feedItems.filter((item) => item.type === feedFilter);

    return sortListingsWithContext(items, feedSort);
  }, [feedFilter, feedItems, feedSort]);

  const sortedItems = useMemo(
    () => sortListings(savedItems, itemSort),
    [itemSort, savedItems],
  );

  const sortedCollections = useMemo(
    () => sortCollections(collections, collectionSort),
    [collectionSort, collections],
  );

  const sortedUsers = useMemo(
    () => sortUsers(profiles, listings, userSort),
    [listings, profiles, userSort],
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-foreground">Following</h1>
      </header>

      <div className="mb-4 overflow-x-auto">
        <div
          role="tablist"
          aria-label="Following sections"
          className="flex min-w-max items-center gap-8"
        >
          {tabs.map((tab, index) => (
            <TabButton
              key={tab.value}
              active={activeTab === tab.value}
              label={tab.label}
              showDivider={index === 1}
              onClick={() => setActiveTab(tab.value)}
            />
          ))}
        </div>
      </div>

      {activeTab === "feed" ? (
        <section aria-label="Following updates">
          <div className="mb-3 flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">
              {filteredFeedItems.length} updates
            </span>
            <div className="flex items-center gap-2">
              <FilterMenu
                label={
                  feedFilters.find((option) => option.value === feedFilter)
                    ?.label ?? "All Activity"
                }
                options={feedFilters}
                value={feedFilter}
                onChange={setFeedFilter}
              />
              <SortMenu
                label={
                  listingSortOptions.find((option) => option.value === feedSort)
                    ?.label ?? "Date Added: Newest"
                }
                options={listingSortOptions}
                value={feedSort}
                onChange={setFeedSort}
              />
            </div>
          </div>
          <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredFeedItems.map((item) => (
              <ListingCard
                key={`${item.type}-${item.listing.id}`}
                {...item.listing}
                subtitle={item.context}
              />
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "items" ? (
        <section aria-label="Followed items">
          <TabToolbar
            label={`Following ${sortedItems.length} items`}
            sortLabel={
              listingSortOptions.find((option) => option.value === itemSort)
                ?.label ?? "Date Added: Newest"
            }
            options={listingSortOptions}
            value={itemSort}
            onChange={setItemSort}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedItems.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "collections" ? (
        <section aria-label="Followed collections">
          <TabToolbar
            label={`Following ${sortedCollections.length} collections`}
            sortLabel={
              collectionSortOptions.find(
                (option) => option.value === collectionSort,
              )?.label ?? "Date Added: Newest"
            }
            options={collectionSortOptions}
            value={collectionSort}
            onChange={setCollectionSort}
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sortedCollections.map((collection) => (
              <FollowedCollectionCard
                key={collection.id}
                collection={collection}
                followed={followedCollections.has(collection.id)}
                onToggleFollow={() =>
                  setFollowedCollections((current) => {
                    const next = new Set(current);
                    if (next.has(collection.id)) {
                      next.delete(collection.id);
                    } else {
                      next.add(collection.id);
                    }
                    return next;
                  })
                }
              />
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "users" ? (
        <section aria-label="Followed users">
          <TabToolbar
            label={`Following ${sortedUsers.length} users`}
            sortLabel={
              userSortOptions.find((option) => option.value === userSort)
                ?.label ?? "Date Added: Newest"
            }
            options={userSortOptions}
            value={userSort}
            onChange={setUserSort}
          />
          <div className="grid gap-4 md:grid-cols-2">
            {sortedUsers.map((profile) => (
              <FollowedUserCard
                key={profile.id}
                listings={listings}
                profile={profile}
              />
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "searches" ? (
        <section aria-label="Saved searches" className="space-y-10">
          {savedSearches.map((search) => (
            <SavedSearchShelf
              key={search.id}
              listings={search.listingIds
                .map((listingId) => listings.find((item) => item.id === listingId))
                .filter((listing): listing is MockListing => Boolean(listing))}
              search={search}
            />
          ))}
        </section>
      ) : null}
    </div>
  );
}

function TabButton({
  active,
  label,
  onClick,
  showDivider,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  showDivider: boolean;
}) {
  return (
    <>
      {showDivider ? <div className="h-6 w-px bg-border" aria-hidden="true" /> : null}
      <button
        type="button"
        role="tab"
        aria-selected={active}
        className={cn(
          "whitespace-nowrap border-b-2 pb-2 text-xl font-semibold transition-colors",
          active
            ? "border-primary text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground",
        )}
        onClick={onClick}
      >
        {label}
      </button>
    </>
  );
}

function FilterMenu<TValue extends string>({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: TValue) => void;
  options: Array<{ value: TValue; label: string; icon?: LucideIcon }>;
  value: TValue;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm text-foreground transition hover:bg-muted">
        <span>{label}</span>
        <ChevronDown className="size-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52">
        {options.map((option) => {
          const Icon = option.icon;

          return (
            <DropdownMenuItem
              key={option.value}
              className="justify-between"
              onClick={() => onChange(option.value)}
            >
              <span className="flex items-center gap-2">
                {Icon ? <Icon className="size-4" aria-hidden="true" /> : null}
                {option.label}
              </span>
              {value === option.value ? (
                <Check className="size-4 text-primary" aria-hidden="true" />
              ) : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SortMenu<TValue extends string>({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: TValue) => void;
  options: Array<{ value: TValue; label: string }>;
  value: TValue;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm text-foreground transition hover:bg-muted">
        <ArrowUpDown className="size-4" aria-hidden="true" />
        <span>{label}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            className="justify-between"
            onClick={() => onChange(option.value)}
          >
            {option.label}
            {value === option.value ? (
              <Check className="size-4 text-primary" aria-hidden="true" />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TabToolbar<TValue extends string>({
  label,
  onChange,
  options,
  sortLabel,
  value,
}: {
  label: string;
  onChange: (value: TValue) => void;
  options: Array<{ value: TValue; label: string }>;
  sortLabel: string;
  value: TValue;
}) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <SortMenu
        label={sortLabel}
        options={options}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

function FollowedCollectionCard({
  collection,
  followed,
  onToggleFollow,
}: {
  collection: MockCollection;
  followed: boolean;
  onToggleFollow: () => void;
}) {
  return (
    <Card
      variant="interactive"
      className="group overflow-hidden rounded-lg border-border bg-card"
    >
      <Link href={collection.href} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <div className="grid size-full grid-cols-2 grid-rows-2 gap-px bg-border">
            {collection.images.slice(0, 4).map((image, index) => (
              <div
                key={`${collection.id}-${image}-${index}`}
                className="relative overflow-hidden bg-muted"
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 16vw, (min-width: 768px) 33vw, 50vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            aria-label={
              followed ? "Unfollow collection" : "Follow collection"
            }
            aria-pressed={followed}
            className={cn(
              "absolute right-2 top-2 grid size-8 place-items-center rounded-full border border-border bg-background/85 text-muted-foreground backdrop-blur-sm transition hover:text-foreground",
              followed && "text-primary",
            )}
            onClick={(event) => {
              event.preventDefault();
              onToggleFollow();
            }}
          >
            <Heart
              className={cn("size-4", followed && "fill-current")}
              aria-hidden="true"
            />
          </button>
        </div>
        <div className="p-3">
          <h2 className="truncate font-medium text-foreground">
            {collection.title}
          </h2>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {collection.description}
          </p>
          <div className="mt-2 flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">
              {collection.itemCount} items
            </span>
            <span className="font-medium text-foreground">
              {collection.aiEstimate ?? collection.estimatedValue}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
            <span>Kyle K</span>
            <span>{collection.visibility}</span>
          </div>
        </div>
      </Link>
    </Card>
  );
}

function FollowedUserCard({
  listings,
  profile,
}: {
  listings: MockListing[];
  profile: MockProfile;
}) {
  const recentItems = listings
    .filter((listing) => listing.sellerId === profile.id)
    .slice(0, 3);
  const fallbackItems = recentItems.length > 0 ? recentItems : listings.slice(0, 3);
  const itemCount =
    Number(profile.stats.find((stat) => stat.label === "Listings")?.value) ||
    fallbackItems.length;
  const collectionCount =
    Number(profile.stats.find((stat) => stat.label === "Collection")?.value) ||
    0;
  const followersCount = profile.id === "kyle-k" ? 214 : profile.id === "mara-voss" ? 189 : 521;

  return (
    <Link
      href="/profile"
      className="group block overflow-hidden rounded-lg border border-border bg-card transition hover:border-primary/50"
    >
      <div className="relative flex h-24 overflow-hidden bg-muted">
        {fallbackItems.map((listing) => (
          <div key={`${profile.id}-${listing.id}`} className="relative flex-1">
            <Image
              src={listing.imageUrl ?? "/mock/listings/fender-stratocaster-sunburst.jpg"}
              alt=""
              fill
              sizes="(min-width: 768px) 20vw, 33vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          </div>
        ))}
      </div>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-full border-2 border-card bg-muted">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={profile.displayName}
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-semibold text-foreground">
              {profile.displayName}
            </h2>
            <p className="truncate text-sm text-muted-foreground">
              {profile.handle}
            </p>
          </div>
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {profile.bio}
        </p>
        <div className="mt-4 flex gap-5">
          <MiniStat label="Items" value={itemCount.toString()} />
          <MiniStat label="Collections" value={collectionCount.toString()} />
          <MiniStat label="Followers" value={followersCount.toString()} />
        </div>
      </div>
    </Link>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function SavedSearchShelf({
  listings,
  search,
}: {
  listings: MockListing[];
  search: (typeof savedSearches)[number];
}) {
  const [alertEnabled, setAlertEnabled] = useState(
    !search.alertLabel.toLowerCase().includes("paused"),
  );

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              {search.name}
            </h2>
            <SearchSettingsMenu
              alertEnabled={alertEnabled}
              onToggleAlerts={() => setAlertEnabled((current) => !current)}
            />
          </div>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {search.filterSummary}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="info">{search.matchCount} matches</Badge>
            <Badge variant={alertEnabled ? "success" : "secondary"}>
              {alertEnabled ? search.alertLabel : "Alerts paused"}
            </Badge>
          </div>
        </div>
        <Link
          href="/market"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground transition hover:text-primary"
        >
          View All
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard key={`${search.id}-${listing.id}`} {...listing} />
        ))}
      </div>
    </div>
  );
}

function SearchSettingsMenu({
  alertEnabled,
  onToggleAlerts,
}: {
  alertEnabled: boolean;
  onToggleAlerts: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Search settings"
        className="grid size-8 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <MoreHorizontal className="size-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onToggleAlerts}>
          <Bell className="mr-2 size-4" aria-hidden="true" />
          {alertEnabled ? "Pause alerts" : "Resume alerts"}
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ExternalLink className="mr-2 size-4" aria-hidden="true" />
          Edit search
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function findListing(listings: MockListing[], id: string) {
  return listings.find((listing) => listing.id === id) ?? listings[0];
}

function sortListings(listings: MockListing[], sort: ListingSort) {
  const items = [...listings];

  switch (sort) {
    case "price-high":
      return items.sort((a, b) => priceNumber(b) - priceNumber(a));
    case "price-low":
      return items.sort((a, b) => priceNumber(a) - priceNumber(b));
    case "recent-updates":
    case "newest":
    default:
      return items.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
}

function sortListingsWithContext<TItem extends { listing: MockListing }>(
  items: TItem[],
  sort: ListingSort,
) {
  return [...items].sort((a, b) => {
    if (sort === "price-high") {
      return priceNumber(b.listing) - priceNumber(a.listing);
    }

    if (sort === "price-low") {
      return priceNumber(a.listing) - priceNumber(b.listing);
    }

    return (
      new Date(b.listing.createdAt).getTime() -
      new Date(a.listing.createdAt).getTime()
    );
  });
}

function sortCollections(
  collections: MockCollection[],
  sort: CollectionSort,
) {
  const items = [...collections];

  switch (sort) {
    case "value-high":
      return items.sort((a, b) => collectionValue(b) - collectionValue(a));
    case "items-high":
      return items.sort((a, b) => b.itemCount - a.itemCount);
    case "avg-value-high":
      return items.sort(
        (a, b) =>
          collectionValue(b) / Math.max(b.itemCount, 1) -
          collectionValue(a) / Math.max(a.itemCount, 1),
      );
    case "recent-updates":
    case "newest":
    default:
      return items;
  }
}

function sortUsers(
  profiles: MockProfile[],
  listings: MockListing[],
  sort: UserSort,
) {
  const items = [...profiles];

  switch (sort) {
    case "items-high":
      return items.sort(
        (a, b) =>
          listings.filter((listing) => listing.sellerId === b.id).length -
          listings.filter((listing) => listing.sellerId === a.id).length,
      );
    case "followers-high":
      return items.sort((a, b) => b.indicators.length - a.indicators.length);
    case "newest":
    default:
      return items;
  }
}

function priceNumber(listing: MockListing) {
  return Number.parseInt(listing.price?.replace(/[^0-9]/g, "") ?? "0", 10);
}

function collectionValue(collection: MockCollection) {
  return Number.parseInt(
    (collection.aiEstimate ?? collection.estimatedValue ?? "0").replace(
      /[^0-9]/g,
      "",
    ),
    10,
  );
}
