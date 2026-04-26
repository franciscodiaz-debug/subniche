import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpDown,
  DollarSign,
  Folder,
  Grid3X3,
  List,
  Package,
  Plus,
  Repeat2,
  Search,
  Tag,
} from "lucide-react";
import { CollectionCard } from "@/components/collection/collection-card";
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
  const itemStats = [
    { label: "Total", value: listings.length },
    {
      label: "For Sale",
      value: listings.filter((listing) => listing.statuses.forSale).length,
    },
    {
      label: "For Trade",
      value: listings.filter((listing) => listing.statuses.forTrade).length,
    },
    {
      label: "Uncategorized",
      value: listings.filter((listing) => !listing.statuses.inCollection).length,
    },
  ];

  return (
    <Tabs defaultValue="collections" className="space-y-10">
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <Package className="size-8 text-primary" aria-hidden="true" />
          <h1 className="text-4xl font-semibold text-foreground md:text-5xl">
            My Stuff
          </h1>
        </div>

        <TabsList className="flex w-full overflow-x-auto rounded-none border-x-0 border-t-0 bg-transparent p-0">
          <TabsTrigger
            value="items"
            className="relative mr-10 rounded-none bg-transparent px-0 py-4 text-3xl font-semibold shadow-none after:absolute after:bottom-[-1px] after:left-0 after:h-0.5 after:w-full after:bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:after:bg-primary md:text-4xl"
          >
            Items
          </TabsTrigger>
          <TabsTrigger
            value="collections"
            className="relative rounded-none bg-transparent px-0 py-4 text-3xl font-semibold shadow-none after:absolute after:bottom-[-1px] after:left-0 after:h-0.5 after:w-full after:bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:after:bg-primary md:text-4xl"
          >
            Collections
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="collections" className="mt-0 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="sr-only">Collections</h2>
            <div className="text-sm text-muted-foreground">
              {collections.length} collections
            </div>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative w-full md:w-80">
              <Search
                className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                className="h-12 rounded-lg bg-card pl-11 text-base"
                placeholder="Search your collections"
                aria-label="Search your collections"
                readOnly
              />
            </div>
            <Link
              href="/add-item"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className:
                  "rounded-full bg-transparent text-base text-muted-foreground",
              })}
            >
              <Plus className="size-5" aria-hidden="true" />
              New collection
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <SortPill label="Newest" />
            <ViewToggle />
          </div>
        </div>

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

      <TabsContent value="items" className="mt-0 space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {itemStats.map((stat) => (
            <Card key={stat.label} className="rounded-lg p-3">
              <div className="text-sm text-muted-foreground">{stat.label}</div>
              <div className="mt-1 text-2xl font-semibold text-foreground">
                {stat.value}
              </div>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterPill icon={Folder} label="All Items" active />
          <FilterPill icon={Tag} label="For Sale" />
          <FilterPill icon={Repeat2} label="For Trade" />
          <div className="relative min-w-[220px] flex-1">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              className="h-10 rounded-lg bg-card pl-10"
              placeholder="Search items..."
              aria-label="Search items"
              readOnly
            />
          </div>
          <SortPill label="Newest" />
          <ViewToggle />
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {listings.map((listing) => (
            <MyStuffItemCard key={listing.id} listing={listing} />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}

function MyStuffItemCard({ listing }: { listing: MockListing }) {
  const collectionLabel = listing.statuses.inCollection
    ? "Studio Workhorses"
    : listing.statuses.wishlist
      ? "Dream Guitars"
      : "Uncategorized";
  const href = listing.href ?? "/collections";
  const imageUrl = listing.imageUrl ?? "/mock/listings/fender-stratocaster-sunburst.jpg";

  return (
    <Link href={href} className="group block">
      <Card
        variant="interactive"
        className="flex min-h-full flex-col overflow-hidden rounded-lg"
      >
        <div className="relative aspect-[4/3] bg-muted">
          <Image
            src={imageUrl}
            alt={listing.title}
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 45vw, 100vw"
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            style={{ objectPosition: "center bottom" }}
          />
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-1 text-xl font-semibold text-foreground">
            {listing.title}
          </h3>
          <p className="mt-2 line-clamp-1 text-base text-muted-foreground">
            {listing.subtitle}
          </p>

          <div className="mt-4">
            <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
              <Folder className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{collectionLabel}</span>
            </span>
          </div>

          <div className="mt-4 flex min-h-8 flex-wrap items-center gap-2">
            {listing.statuses.forSale ? (
              <StatusDot icon={DollarSign} label="For sale" tone="success" />
            ) : null}
            {listing.statuses.forTrade ? (
              <StatusDot icon={Repeat2} label="For trade" tone="info" />
            ) : null}
            {!listing.statuses.forSale && !listing.statuses.forTrade ? (
              <span className="rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground">
                Private
              </span>
            ) : null}
          </div>

          <div className="mt-auto flex items-end justify-between gap-3 pt-5">
            <div className="text-2xl font-semibold text-foreground">
              {listing.price}
            </div>
            <div className="text-base text-muted-foreground">
              {formatRelativeDate(listing.createdAt)}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function StatusDot({
  icon: Icon,
  label,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  tone: "success" | "info";
}) {
  return (
    <span
      className={`grid size-8 place-items-center rounded-full border ${
        tone === "success"
          ? "border-success/45 bg-success/12 text-success"
          : "border-info/45 bg-info/12 text-info"
      }`}
      aria-label={label}
      title={label}
    >
      <Icon className="size-4" aria-hidden="true" />
    </span>
  );
}

function formatRelativeDate(date: string) {
  const timestamp = new Date(date).getTime();
  const now = new Date("2026-04-26T12:00:00.000Z").getTime();
  const days = Math.max(1, Math.round((now - timestamp) / 86_400_000));

  if (days < 7) {
    return `${days}d ago`;
  }

  const weeks = Math.round(days / 7);
  return `${weeks}w ago`;
}

function SortPill({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-card px-4 text-base font-semibold text-foreground"
    >
      <ArrowUpDown className="size-4 text-muted-foreground" aria-hidden="true" />
      {label}
    </button>
  );
}

function FilterPill({
  active,
  icon: Icon,
  label,
}: {
  active?: boolean;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <button
      type="button"
      className={`inline-flex h-10 items-center gap-2 rounded-full border px-3 text-sm font-medium ${
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-transparent text-muted-foreground"
      }`}
    >
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </button>
  );
}

function ViewToggle() {
  return (
    <Card className="flex h-12 items-center gap-1 rounded-lg p-1">
      <span className="grid size-10 place-items-center rounded-md bg-primary/15 text-primary">
        <Grid3X3 className="size-4" aria-hidden="true" />
      </span>
      <span className="grid size-10 place-items-center rounded-md text-muted-foreground">
        <List className="size-4" aria-hidden="true" />
      </span>
    </Card>
  );
}
