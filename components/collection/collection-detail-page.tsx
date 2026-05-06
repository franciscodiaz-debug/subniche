"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Folder,
  Globe2,
  Lock,
  MoreHorizontal,
  Plus,
  Repeat2,
  Share2,
  Sparkles,
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

const collectionTags: Record<string, string[]> = {
  "collection-studio-workhorses": ["MusicGear", "Studio", "Workhorses"],
  "collection-semi-hollow-watchlist": ["Guitars", "Electric", "Semi-Hollow"],
  "collection-acoustic-shortlist": ["Acoustic", "Shortlist", "Trade Ideas"],
};

export function CollectionDetailPage({
  collection,
  listings,
  owner,
}: CollectionDetailPageProps) {
  const [collectionItemsExpanded, setCollectionItemsExpanded] = useState(true);
  const [wishlistExpanded, setWishlistExpanded] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const privateCollection = collection.visibility
    .toLowerCase()
    .includes("unlisted");
  const VisibilityIcon = privateCollection ? Lock : Globe2;
  const items = getCollectionListings(collection, listings);
  const wishlistItems = listings
    .filter((listing) => listing.statuses.wishlist)
    .slice(0, 3);

  async function handleShareCollection() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${collection.href}`,
      );
    } catch {
      // Clipboard access may be blocked in test or privacy-restricted contexts.
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/collections"
        className="inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:text-primary/80"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        My Collections
      </Link>

      <section className="mt-6 flex flex-col gap-6 lg:flex-row lg:gap-8">
        <div className="lg:w-[280px] lg:flex-shrink-0">
          <HeroImageGrid images={collection.images} title={collection.title} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge
              variant={privateCollection ? "secondary" : "success"}
              className="rounded-full"
            >
              <VisibilityIcon className="size-3" aria-hidden="true" />
              {privateCollection ? "Link Only" : "Public"}
            </Badge>
            {getCollectionTags(collection).map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-full">
                {tag}
              </Badge>
            ))}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="min-w-0 text-3xl font-bold text-foreground sm:text-4xl lg:text-[2.5rem]">
                {collection.title}
              </h1>
              <button
                type="button"
                onClick={() => void handleShareCollection()}
                className={buttonVariants({
                  variant: "outline",
                  size: "icon",
                  className: "size-8 rounded-lg bg-transparent",
                })}
                aria-label={copied ? "Collection link copied" : "Share collection"}
                title={copied ? "Copied" : "Share collection"}
              >
                {copied ? (
                  <Check className="size-4 text-success" aria-hidden="true" />
                ) : (
                  <Share2 className="size-4" aria-hidden="true" />
                )}
              </button>
              <span className="sr-only" role="status">
                {copied ? "Collection link copied" : ""}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Collection actions"
                  className={buttonVariants({
                    variant: "outline",
                    size: "icon",
                    className: "size-8 rounded-lg bg-transparent",
                  })}
                >
                  <MoreHorizontal className="size-4" aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuItem>Edit collection</DropdownMenuItem>
                  <DropdownMenuItem>Collection settings</DropdownMenuItem>
                  <DropdownMenuItem>Duplicate collection</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span>{items.length} items</span>
              <span aria-hidden="true">·</span>
              <span>{owner?.displayName ?? "SubNiche"} collection</span>
              <span aria-hidden="true">·</span>
              <span>{collection.aiEstimate ?? collection.estimatedValue} value</span>
            </div>
          </div>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            {collection.description}
          </p>

          <Link
            href="/add-item"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "mt-6 rounded-lg bg-transparent",
            })}
          >
            <Plus className="size-4" aria-hidden="true" />
            Add Item
          </Link>
        </div>
      </section>

      <section className="mt-8 space-y-4">
        <SectionHeader
          count={items.length}
          label="collection items"
          expanded={collectionItemsExpanded}
          onToggle={() => setCollectionItemsExpanded((current) => !current)}
        />
        {collectionItemsExpanded ? (
          <div
            className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4"
            data-testid="collection-items-grid"
          >
            {items.map((listing) => (
              <CollectionItemCard
                key={listing.id}
                collectionTitle={collection.title}
                listing={listing}
              />
            ))}
          </div>
        ) : null}
      </section>

      <section className="mt-8 space-y-4">
        <SectionHeader
          count={wishlistItems.length}
          label="wishlist items"
          expanded={wishlistExpanded}
          onToggle={() => setWishlistExpanded((current) => !current)}
          variant="dashed"
        />
        {wishlistExpanded ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
            {wishlistItems.map((listing) => (
              <CollectionItemCard
                key={listing.id}
                collectionTitle="Wishlist"
                isWishlistItem
                listing={listing}
              />
            ))}
          </div>
        ) : null}
      </section>

      <Card className="mt-8 rounded-lg p-4">
        <button
          type="button"
          aria-expanded={notesExpanded}
          onClick={() => setNotesExpanded((current) => !current)}
          className="flex w-full items-center justify-between gap-4 rounded-md text-left transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <div className="flex items-center gap-3 text-base font-semibold text-muted-foreground">
            <Sparkles className="size-5 text-primary" aria-hidden="true" />
            Collection notes
          </div>
          <ChevronDown
            className={`size-5 text-muted-foreground transition-transform ${
              notesExpanded ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>
        {notesExpanded ? (
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            {collectionNotes[collection.id] ??
              "Use collection notes for provenance, setup details, acquisition history, and the judgment that does not fit on a listing card."}
          </p>
        ) : null}
      </Card>
    </div>
  );
}

function HeroImageGrid({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  return (
    <div className="grid aspect-square grid-cols-2 grid-rows-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
      {[0, 1, 2, 3].map((index) => (
        <div key={`${title}-${index}`} className="relative bg-muted">
          {images[index] ? (
            <Image
              src={images[index]}
              alt=""
              fill
              priority={index === 0}
              sizes="(min-width: 1024px) 280px, 50vw"
              className="object-cover"
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

function SectionHeader({
  count,
  expanded,
  label,
  onToggle,
  variant = "solid",
}: {
  count: number;
  expanded: boolean;
  label: string;
  onToggle: () => void;
  variant?: "solid" | "dashed";
}) {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      onClick={onToggle}
      className={`flex w-full items-center justify-between rounded-t-lg border-b py-3 text-left transition hover:bg-secondary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
        variant === "dashed" ? "border-dashed border-border border-t" : "border-border"
      }`}
    >
      <Badge variant="secondary" className="rounded-full">
        {count} {label}
      </Badge>
      <ChevronDown
        className={`size-4 text-muted-foreground transition-transform ${
          expanded ? "rotate-180" : ""
        }`}
        aria-hidden="true"
      />
    </button>
  );
}

function CollectionItemCard({
  collectionTitle,
  isWishlistItem = false,
  listing,
}: {
  collectionTitle: string;
  isWishlistItem?: boolean;
  listing: MockListing;
}) {
  return (
    <Link
      href={listing.href ?? "/market"}
      data-testid="collection-item-card"
      className={`group block overflow-hidden rounded-lg border transition ${
        isWishlistItem
          ? "border-dashed border-border bg-secondary/30 hover:border-primary/50"
          : "border-border bg-card hover:border-primary/50"
      }`}
    >
      <div className={`relative aspect-[4/3] bg-muted ${isWishlistItem ? "opacity-70" : ""}`}>
        {listing.imageUrl ? (
          <Image
            src={listing.imageUrl}
            alt={listing.title}
            fill
            sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 28vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="space-y-2.5 p-3">
        <div>
          <h2 className="line-clamp-2 text-sm font-semibold text-foreground transition group-hover:text-primary">
            {listing.title}
          </h2>
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
            {listing.subtitle}
          </p>
        </div>

        <div className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-primary/30 px-2 py-0.5 text-primary">
          <Folder className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate text-xs font-semibold">{collectionTitle}</span>
          <ChevronDown className="size-3 text-muted-foreground" aria-hidden="true" />
        </div>

        <div className="flex items-center justify-end gap-1.5">
          {isWishlistItem ? (
            <span className="text-xs font-semibold text-primary">Wanted</span>
          ) : null}
          {!isWishlistItem && listing.statuses.forSale ? (
            <span className="grid size-6 place-items-center rounded-full border border-success/35 bg-success/12 text-sm text-success">
              $
            </span>
          ) : null}
          {!isWishlistItem && listing.statuses.forTrade ? (
            <span className="grid size-6 place-items-center rounded-full border border-info/35 bg-info/12 text-info">
              <Repeat2 className="size-3.5" aria-hidden="true" />
            </span>
          ) : null}
        </div>

        <div className="flex items-end justify-between gap-3 text-sm">
          <span className="font-bold text-foreground">
            {listing.price ?? "Private"}
          </span>
          <span className="text-muted-foreground">
            {relativeAge(listing.createdAt)}
          </span>
        </div>
      </div>
    </Link>
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

function getCollectionTags(collection: MockCollection) {
  return collectionTags[collection.id] ?? ["MusicGear", "Collection"];
}

function relativeAge(dateValue: string) {
  const timestamp = new Date(dateValue).getTime();
  const days = Math.max(
    1,
    Math.round((Date.now() - timestamp) / (1000 * 60 * 60 * 24)),
  );

  if (days < 14) {
    return `${days}d ago`;
  }

  const weeks = Math.round(days / 7);
  return `${weeks}w ago`;
}
