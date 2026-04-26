import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  DollarSign,
  Eye,
  Globe2,
  Lock,
  Plus,
  Share2,
} from "lucide-react";
import { CollectionPreviewStrip } from "@/components/collection/collection-preview-strip";
import { ListingCard } from "@/components/listing/listing-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type {
  MockCollection,
  MockListing,
  MockProfile,
} from "@/data/mock/types";

type CollectionDetailPageProps = {
  collection: MockCollection;
  listings: MockListing[];
  owner?: MockProfile;
};

const collectionNotes: Record<string, string> = {
  "collection-studio-workhorses":
    "Working pieces that are already proven in a studio context. The point is not rarity alone; each item has to earn its place in the signal chain.",
  "collection-semi-hollow-watchlist":
    "Semi-hollows, clean Rickenbackers, and long-term wants. This collection reads more like a living shortlist than an owned shelf.",
  "collection-acoustic-shortlist":
    "Pedalboard and ambient utility tools with enough context to make future trades easier to evaluate.",
};

export function CollectionDetailPage({
  collection,
  listings,
  owner,
}: CollectionDetailPageProps) {
  const privateCollection = collection.visibility
    .toLowerCase()
    .includes("unlisted");
  const VisibilityIcon = privateCollection ? Lock : Globe2;
  const items = getCollectionListings(collection, listings);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <Link
        href="/collections"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to collections
      </Link>

      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="overflow-hidden rounded-lg">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <CollectionPreviewStrip
              images={collection.images}
              className="min-h-72 lg:aspect-auto lg:min-h-[25rem]"
            />
            <div className="flex flex-col justify-between p-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={privateCollection ? "secondary" : "default"}>
                    <VisibilityIcon className="size-3" aria-hidden="true" />
                    {collection.visibility}
                  </Badge>
                  <Badge variant="outline">SN / MusicGear</Badge>
                </div>
                <h1 className="mt-5 text-4xl font-semibold text-foreground">
                  {collection.title}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {collection.description}
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                <Link
                  href="/add-item"
                  className={buttonVariants({ variant: "primary", size: "sm" })}
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Add item
                </Link>
                <button
                  type="button"
                  className={buttonVariants({
                    variant: "secondary",
                    size: "sm",
                  })}
                >
                  <Share2 className="size-4" aria-hidden="true" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </Card>

        <aside className="space-y-4">
          <Card className="rounded-lg p-5">
            <h2 className="text-base font-semibold text-foreground">
              Collection snapshot
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <SnapshotMetric
                icon={Eye}
                label="Items"
                value={collection.itemCount.toString()}
              />
              <SnapshotMetric
                icon={DollarSign}
                label="Your estimate"
                value={collection.estimatedValue ?? "Pending"}
              />
              <SnapshotMetric
                icon={BarChart3}
                label="AI estimate"
                value={collection.aiEstimate ?? "Pending"}
              />
              <SnapshotMetric
                icon={VisibilityIcon}
                label="Visibility"
                value={privateCollection ? "Unlisted" : "Public"}
              />
            </div>
          </Card>

          <Card className="rounded-lg p-5">
            <h2 className="text-base font-semibold text-foreground">Owner</h2>
            <div className="mt-4 flex items-center gap-3">
              <div className="relative size-12 overflow-hidden rounded-full border border-border bg-muted">
                {owner?.avatarUrl ? (
                  <Image
                    src={owner.avatarUrl}
                    alt={owner.displayName}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div>
                <div className="font-semibold text-foreground">
                  {owner?.displayName ?? "SubNiche member"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {owner?.location ?? "MusicGear"}
                </div>
              </div>
            </div>
          </Card>
        </aside>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                Collection items
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Items preserve sale, trade, wanted, and collection context.
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              Grid view / latest activity
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        </div>

        <Card className="h-fit rounded-lg p-5">
          <h2 className="text-base font-semibold text-foreground">
            Collection notes
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {collectionNotes[collection.id] ??
              "Use collection notes for provenance, setup details, acquisition history, and the judgment that does not fit on a listing card."}
          </p>
          <div className="mt-5 rounded-lg border border-border bg-background p-4">
            <div className="text-xs font-semibold uppercase text-muted-foreground">
              Next useful detail
            </div>
            <p className="mt-2 text-sm leading-6 text-foreground">
              Add acquisition dates and service notes to make valuation and
              trade context stronger.
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}

function SnapshotMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Eye;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
        <Icon className="size-3.5 text-accent" aria-hidden="true" />
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function getCollectionListings(
  collection: MockCollection,
  listings: MockListing[],
) {
  if (collection.id === "collection-semi-hollow-watchlist") {
    return listings
      .filter(
        (listing) =>
          listing.statuses.wishlist ||
          listing.categoryId === "electric-guitars",
      )
      .slice(0, 6);
  }

  if (collection.id === "collection-acoustic-shortlist") {
    return listings
      .filter(
        (listing) =>
          listing.categoryId === "effects-pedals" ||
          listing.categoryId === "acoustic-guitars",
      )
      .slice(0, 6);
  }

  return listings
    .filter(
      (listing) =>
        listing.sellerId === collection.ownerId ||
        listing.statuses.inCollection,
    )
    .slice(0, 6);
}
