"use client";

import Image from "next/image";
import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Archive,
  ArrowUpDown,
  Check,
  Copy,
  DollarSign,
  Edit2,
  Folder,
  Grid3X3,
  List,
  Lock,
  MoreHorizontal,
  Package,
  Plus,
  Repeat2,
  Search,
  Tag,
  Undo2,
  X,
} from "lucide-react";
import { CollectionCard } from "@/components/collection/collection-card";
import { CollectionPreviewStrip } from "@/components/collection/collection-preview-strip";
import {
  GridDensitySelector,
  type GridDensity,
  useGridDensity,
} from "@/components/marketplace/grid-density-selector";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MockCollection, MockListing, MockProfile } from "@/data/mock";
import { cn } from "@/lib/utils";

type CollectionsOverviewProps = {
  collections: MockCollection[];
  listings: MockListing[];
  profile: MockProfile;
};

type SortKey = "newest" | "price-high" | "price-low" | "title";
type EditableListingField = "condition" | "price" | "subtitle" | "title";
type ListingStatusKey = "forSale" | "forTrade";
type ActionFeedback = {
  id: number;
  message: string;
  onUndo?: () => void;
  tone?: "success" | "warning";
  undoLabel?: string;
};

const sortLabels: Record<SortKey, string> = {
  newest: "Newest",
  "price-high": "Price high",
  "price-low": "Price low",
  title: "Title",
};

const defaultCollectionAssignments: Record<string, string | null> = {
  "listing-strat-pro-ii": "collection-studio-workhorses",
  "listing-mesa-dual-rectifier": "collection-studio-workhorses",
  "listing-rickenbacker-360": "collection-semi-hollow-watchlist",
  "listing-strymon-bigsky": "collection-acoustic-shortlist",
};

const myStuffGridDensityClasses: Record<GridDensity, string> = {
  cozy: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
  compact: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
  dense: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
};

export function CollectionsOverview({
  collections,
  listings,
  profile,
}: CollectionsOverviewProps) {
  const [managedListings, setManagedListings] = useState(() => listings);
  const [localCollections, setLocalCollections] = useState(collections);
  const [collectionFilter, setCollectionFilter] = useState("all");
  const [collectionAssignments, setCollectionAssignments] = useState<
    Record<string, string | null>
  >(() =>
    Object.fromEntries(
      listings.map((listing) => [
        listing.id,
        defaultCollectionAssignments[listing.id] ??
          (listing.statuses.inCollection ? collections[0]?.id ?? null : null),
      ]),
    ),
  );
  const [collectionSearchQuery, setCollectionSearchQuery] = useState("");
  const [collectionSortKey, setCollectionSortKey] =
    useState<SortKey>("newest");
  const [collectionViewMode, setCollectionViewMode] =
    useState<"grid" | "list">("grid");
  const [newCollectionDraft, setNewCollectionDraft] = useState({
    description: "",
    title: "",
    visibility: "Public collection",
  });
  const [newCollectionOpen, setNewCollectionOpen] = useState(false);
  const [saleOnly, setSaleOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [itemSortKey, setItemSortKey] = useState<SortKey>("newest");
  const [tradeOnly, setTradeOnly] = useState(false);
  const [itemViewMode, setItemViewMode] = useState<"grid" | "list">("grid");
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<ActionFeedback | null>(
    null,
  );
  const duplicateIdRef = useRef(0);
  const feedbackIdRef = useRef(0);
  const { gridDensity, setGridDensity } = useGridDensity();

  useEffect(() => {
    if (!actionFeedback) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setActionFeedback(null);
    }, 3600);

    return () => window.clearTimeout(timeout);
  }, [actionFeedback]);

  const filteredCollections = useMemo(() => {
    const query = collectionSearchQuery.trim().toLowerCase();
    const visibleCollections = localCollections.filter((collection) =>
      [collection.title, collection.description, collection.visibility]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );

    return visibleCollections.sort((first, second) => {
      if (collectionSortKey === "title") {
        return first.title.localeCompare(second.title);
      }

      if (
        collectionSortKey === "price-high" ||
        collectionSortKey === "price-low"
      ) {
        const firstValue = parsePrice(first.aiEstimate ?? first.estimatedValue);
        const secondValue = parsePrice(second.aiEstimate ?? second.estimatedValue);

        return collectionSortKey === "price-high"
          ? secondValue - firstValue
          : firstValue - secondValue;
      }

      return 0;
    });
  }, [collectionSearchQuery, collectionSortKey, localCollections]);

  const filteredListings = useMemo(
    () => {
      const query = searchQuery.trim().toLowerCase();
      const filtered = managedListings.filter((listing) => {
        const collectionId = collectionAssignments[listing.id] ?? null;

        if (saleOnly && !listing.statuses.forSale) {
          return false;
        }
        if (tradeOnly && !listing.statuses.forTrade) {
          return false;
        }
        if (collectionFilter === "uncategorized") {
          return !collectionId && !listing.statuses.wishlist;
        }
        if (collectionFilter === "wishlist") {
          return Boolean(listing.statuses.wishlist);
        }
        if (collectionFilter !== "all" && collectionId !== collectionFilter) {
          return false;
        }

        if (!query) {
          return true;
        }

        return [
          listing.title,
          listing.subtitle,
          listing.brand,
          listing.condition,
          listing.price,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);
      });

      return filtered.sort((first, second) => {
        if (itemSortKey === "title") {
          return first.title.localeCompare(second.title);
        }

        if (itemSortKey === "price-high" || itemSortKey === "price-low") {
          const firstPrice = parsePrice(first.price);
          const secondPrice = parsePrice(second.price);

          return itemSortKey === "price-high"
            ? secondPrice - firstPrice
            : firstPrice - secondPrice;
        }

        return (
          new Date(second.createdAt).getTime() -
          new Date(first.createdAt).getTime()
        );
      });
    },
    [
      collectionAssignments,
      collectionFilter,
      managedListings,
      saleOnly,
      searchQuery,
      itemSortKey,
      tradeOnly,
    ],
  );

  const itemStats = [
    { label: "Total", value: managedListings.length },
    {
      label: "For Sale",
      value: managedListings.filter((listing) => listing.statuses.forSale)
        .length,
    },
    {
      label: "For Trade",
      value: managedListings.filter((listing) => listing.statuses.forTrade)
        .length,
    },
    {
      label: "Uncategorized",
      value: managedListings.filter(
        (listing) => !collectionAssignments[listing.id],
      ).length,
    },
  ];
  const hasActiveItemFilter =
    collectionFilter !== "all" ||
    saleOnly ||
    tradeOnly ||
    Boolean(searchQuery.trim());

  const getCollectionLabel = (listing: MockListing) => {
    if (listing.statuses.wishlist) {
      return "Wishlist";
    }

    const collectionId = collectionAssignments[listing.id];
    const collection = localCollections.find((item) => item.id === collectionId);

    return collection?.title ?? "Uncategorized";
  };

  const updateCollectionAssignment = (
    listingId: string,
    collectionId: string | null,
  ) => {
    setCollectionAssignments((current) => ({
      ...current,
      [listingId]: collectionId,
    }));
  };

  const editingListing = useMemo(
    () => managedListings.find((listing) => listing.id === editingListingId),
    [editingListingId, managedListings],
  );

  const showActionFeedback = (
    message: string,
    options: Omit<ActionFeedback, "id" | "message"> = {},
  ) => {
    feedbackIdRef.current += 1;
    setActionFeedback({
      id: feedbackIdRef.current,
      message,
      ...options,
    });
  };

  const updateListing = (
    listingId: string,
    updater: (listing: MockListing) => MockListing,
  ) => {
    setManagedListings((current) =>
      current.map((listing) =>
        listing.id === listingId ? updater(listing) : listing,
      ),
    );
  };

  const updateListingField = (
    listingId: string,
    field: EditableListingField,
    value: string,
  ) => {
    updateListing(listingId, (listing) => ({
      ...listing,
      [field]: value,
    }));
  };

  const toggleListingStatus = (
    listing: MockListing,
    statusKey: ListingStatusKey,
  ) => {
    const nextValue = !listing.statuses[statusKey];

    updateListing(listing.id, (current) => ({
      ...current,
      statuses: {
        ...current.statuses,
        [statusKey]: nextValue,
      },
    }));

    showActionFeedback(
      `${nextValue ? "Added" : "Removed"} ${
        statusKey === "forSale" ? "for sale" : "for trade"
      } status for ${listing.title}.`,
    );
  };

  const markListingSold = (listing: MockListing) => {
    updateListing(listing.id, (current) => ({
      ...current,
      statuses: {
        ...current.statuses,
        forSale: false,
      },
    }));
    showActionFeedback(`Marked ${listing.title} as sold.`);
  };

  const duplicateListing = (listing: MockListing) => {
    duplicateIdRef.current += 1;
    const id = `${listing.id}-copy-${duplicateIdRef.current}`;
    const copy: MockListing = {
      ...listing,
      id,
      slug: `${listing.slug}-copy`,
      title: `${listing.title} (Copy)`,
      createdAt: "2026-04-26T12:00:00.000Z",
    };

    setManagedListings((current) => [copy, ...current]);
    setCollectionAssignments((current) => ({
      ...current,
      [id]: current[listing.id] ?? null,
    }));
    showActionFeedback(`Duplicated ${listing.title}.`);
  };

  const archiveListing = (listing: MockListing) => {
    const previousCollectionId = collectionAssignments[listing.id] ?? null;

    setManagedListings((current) =>
      current.filter((item) => item.id !== listing.id),
    );
    showActionFeedback(`Archived ${listing.title}.`, {
      tone: "warning",
      undoLabel: "Undo",
      onUndo: () => {
        setManagedListings((current) => [listing, ...current]);
        setCollectionAssignments((current) => ({
          ...current,
          [listing.id]: previousCollectionId,
        }));
        showActionFeedback(`Restored ${listing.title}.`);
      },
    });
  };

  const clearItemFilters = () => {
    setCollectionFilter("all");
    setSaleOnly(false);
    setTradeOnly(false);
    setSearchQuery("");
  };

  function handleCreateCollection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newCollectionDraft.title.trim();

    if (!title) {
      return;
    }

    const id = `collection-${title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}-${Date.now()}`;

    setLocalCollections((current) => [
      {
        id,
        ownerId: profile.id,
        nicheId: "music-gear",
        title,
        description:
          newCollectionDraft.description.trim() ||
          "A new place to organize related gear.",
        images: [],
        itemCount: 0,
        estimatedValue: "$0",
        aiEstimate: "$0",
        visibility: newCollectionDraft.visibility,
        href: `/collections/${id}`,
      },
      ...current,
    ]);
    setCollectionFilter(id);
    setCollectionSearchQuery("");
    setNewCollectionDraft({
      description: "",
      title: "",
      visibility: "Public collection",
    });
    setNewCollectionOpen(false);
  }

  return (
    <>
      <Tabs defaultValue="items" className="space-y-5">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Package className="size-6 text-primary" aria-hidden="true" />
          <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
            My Stuff
          </h1>
        </div>

        <TabsList className="flex w-full overflow-x-auto rounded-none border-x-0 border-t-0 bg-transparent p-0">
          <TabsTrigger
            value="items"
            className="relative mr-8 rounded-none bg-transparent px-0 py-2.5 text-xl font-semibold shadow-none after:absolute after:bottom-[-1px] after:left-0 after:h-0.5 after:w-full after:bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
          >
            Items
          </TabsTrigger>
          <TabsTrigger
            value="collections"
            className="relative rounded-none bg-transparent px-0 py-2.5 text-xl font-semibold shadow-none after:absolute after:bottom-[-1px] after:left-0 after:h-0.5 after:w-full after:bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
          >
            Collections
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="collections" className="mt-0 space-y-6">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative w-full md:w-80">
              <Search
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                className="h-10 rounded-lg bg-card pl-10"
                placeholder="Search your collections"
                aria-label="Search your collections"
                value={collectionSearchQuery}
                onChange={(event) => setCollectionSearchQuery(event.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => setNewCollectionOpen(true)}
              className={buttonVariants({
                variant: "outline",
                className: "rounded-full bg-transparent text-muted-foreground",
              })}
            >
              <Plus className="size-4" aria-hidden="true" />
              New collection
            </button>
          </div>
          <div className="flex items-center gap-2">
            <SortMenu value={collectionSortKey} onChange={setCollectionSortKey} />
            <ViewToggle
              value={collectionViewMode}
              onChange={setCollectionViewMode}
            />
          </div>
        </div>

        {filteredCollections.length > 0 ? (
          collectionViewMode === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {filteredCollections.map((collection) => (
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
          ) : (
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              {filteredCollections.map((collection) => (
                <CollectionListRow key={collection.id} collection={collection} />
              ))}
            </div>
          )
        ) : (
          <EmptyCollectionState
            hasSearch={Boolean(collectionSearchQuery.trim())}
            onCreate={() => setNewCollectionOpen(true)}
          />
        )}
      </TabsContent>

      <TabsContent value="items" className="mt-0 space-y-5">
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
          <CollectionFilter
            collections={localCollections}
            value={collectionFilter}
            onChange={setCollectionFilter}
          />
          <FilterPill
            icon={Tag}
            label="For Sale"
            active={saleOnly}
            onClick={() => setSaleOnly((current) => !current)}
          />
          <FilterPill
            icon={Repeat2}
            label="For Trade"
            active={tradeOnly}
            onClick={() => setTradeOnly((current) => !current)}
          />
          <div className="relative min-w-[220px] flex-1">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              className="h-10 rounded-lg bg-card pl-10"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search items..."
              aria-label="Search items"
            />
          </div>
          <SortMenu value={itemSortKey} onChange={setItemSortKey} />
          {itemViewMode === "grid" ? (
            <GridDensitySelector
              value={gridDensity}
              onChange={setGridDensity}
            />
          ) : null}
          <ViewToggle value={itemViewMode} onChange={setItemViewMode} />
        </div>
        {hasActiveItemFilter ? (
          <div className="text-sm text-muted-foreground">
            {filteredListings.length} item{filteredListings.length === 1 ? "" : "s"} shown
          </div>
        ) : null}

        {filteredListings.length === 0 ? (
          <EmptyItemState
            hasFilters={hasActiveItemFilter}
            onClear={clearItemFilters}
          />
        ) : itemViewMode === "grid" ? (
          <div
            className={cn(
              "grid gap-4",
              myStuffGridDensityClasses[gridDensity],
            )}
          >
            {filteredListings.map((listing) => (
              <MyStuffItemCard
                key={listing.id}
                collections={localCollections}
                collectionLabel={getCollectionLabel(listing)}
                listing={listing}
                onArchive={() => archiveListing(listing)}
                onCollectionChange={(collectionId) =>
                  updateCollectionAssignment(listing.id, collectionId)
                }
                onDuplicate={() => duplicateListing(listing)}
                onEdit={() => setEditingListingId(listing.id)}
                onMarkSold={() => markListingSold(listing)}
                onToggleStatus={(statusKey) =>
                  toggleListingStatus(listing, statusKey)
                }
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="hidden grid-cols-[minmax(0,1fr)_190px_190px_220px_auto] gap-4 px-4 text-xs uppercase tracking-wide text-muted-foreground lg:grid">
              <span>Item</span>
              <span>Value</span>
              <span>Status</span>
              <span>Collection</span>
              <span className="sr-only">Actions</span>
            </div>
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              {filteredListings.map((listing) => (
                <MyStuffItemRow
                  key={listing.id}
                  collections={localCollections}
                  collectionLabel={getCollectionLabel(listing)}
                  listing={listing}
                  onArchive={() => archiveListing(listing)}
                  onCollectionChange={(collectionId) =>
                    updateCollectionAssignment(listing.id, collectionId)
                  }
                  onDuplicate={() => duplicateListing(listing)}
                  onEdit={() => setEditingListingId(listing.id)}
                  onMarkSold={() => markListingSold(listing)}
                  onToggleStatus={(statusKey) =>
                    toggleListingStatus(listing, statusKey)
                  }
                />
              ))}
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>

      {newCollectionOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 px-4 backdrop-blur-sm">
          <form
            onSubmit={handleCreateCollection}
            className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-overlay"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-base font-semibold text-foreground">
                New collection
              </h2>
              <button
                type="button"
                aria-label="Close new collection"
                onClick={() => setNewCollectionOpen(false)}
                className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            <label className="mt-5 block text-sm font-medium text-foreground">
              Name
              <Input
                className="mt-2 bg-background"
                value={newCollectionDraft.title}
                onChange={(event) =>
                  setNewCollectionDraft((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Pedal Board"
                autoFocus
              />
            </label>

            <label className="mt-4 block text-sm font-medium text-foreground">
              Description
              <textarea
                className="mt-2 min-h-24 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                value={newCollectionDraft.description}
                onChange={(event) =>
                  setNewCollectionDraft((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Current board, experiments, and tradeable utility pedals."
              />
            </label>

            <label className="mt-4 block text-sm font-medium text-foreground">
              Visibility
              <select
                className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                value={newCollectionDraft.visibility}
                onChange={(event) =>
                  setNewCollectionDraft((current) => ({
                    ...current,
                    visibility: event.target.value,
                  }))
                }
              >
                <option>Public collection</option>
                <option>Unlisted collection</option>
              </select>
            </label>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setNewCollectionOpen(false)}
                className={buttonVariants({ variant: "ghost" })}
              >
                Cancel
              </button>
              <button type="submit" className={buttonVariants()}>
                Create collection
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {editingListing ? (
        <EditItemPanel
          collectionLabel={getCollectionLabel(editingListing)}
          collections={localCollections}
          listing={editingListing}
          onClose={() => setEditingListingId(null)}
          onCollectionChange={(collectionId) =>
            updateCollectionAssignment(editingListing.id, collectionId)
          }
          onFieldChange={(field, value) =>
            updateListingField(editingListing.id, field, value)
          }
          onSave={() => {
            showActionFeedback(`Saved changes to ${editingListing.title}.`);
            setEditingListingId(null);
          }}
          onToggleStatus={(statusKey) =>
            toggleListingStatus(editingListing, statusKey)
          }
        />
      ) : null}

      {actionFeedback ? (
        <ActionFeedbackToast
          feedback={actionFeedback}
          onDismiss={() => setActionFeedback(null)}
        />
      ) : null}
    </>
  );
}

function CollectionFilter({
  collections,
  onChange,
  value,
}: {
  collections: MockCollection[];
  onChange: (value: string) => void;
  value: string;
}) {
  const labels: Record<string, string> = {
    all: "All Items",
    uncategorized: "Uncategorized",
    wishlist: "Wishlist",
  };
  const label =
    labels[value] ?? collections.find((collection) => collection.id === value)?.title ?? "All Items";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-10 items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 text-sm font-medium text-primary transition hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
        <Folder className="size-4" aria-hidden="true" />
        {label}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="left-0 right-auto min-w-56">
        <DropdownMenuItem
          onClick={() => onChange("all")}
          className="justify-between gap-3"
        >
          <span>All Items</span>
          {value === "all" ? (
            <Check className="size-4 text-primary" aria-hidden="true" />
          ) : null}
        </DropdownMenuItem>
        {collections.map((collection) => (
          <DropdownMenuItem
            key={collection.id}
            onClick={() => onChange(collection.id)}
            className="justify-between gap-3"
          >
            <span className="truncate">{collection.title}</span>
            {value === collection.id ? (
              <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
            ) : null}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem
          onClick={() => onChange("wishlist")}
          className="justify-between gap-3"
        >
          <span>Wishlist</span>
          {value === "wishlist" ? (
            <Check className="size-4 text-primary" aria-hidden="true" />
          ) : null}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onChange("uncategorized")}
          className="justify-between gap-3"
        >
          <span>Uncategorized</span>
          {value === "uncategorized" ? (
            <Check className="size-4 text-primary" aria-hidden="true" />
          ) : null}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MyStuffItemCard({
  collections,
  collectionLabel,
  listing,
  onArchive,
  onCollectionChange,
  onDuplicate,
  onEdit,
  onMarkSold,
  onToggleStatus,
}: {
  collections: MockCollection[];
  collectionLabel: string;
  listing: MockListing;
  onArchive: () => void;
  onCollectionChange: (collectionId: string | null) => void;
  onDuplicate: () => void;
  onEdit: () => void;
  onMarkSold: () => void;
  onToggleStatus: (statusKey: ListingStatusKey) => void;
}) {
  const href = listing.href ?? "/collections";
  const imageUrl = listing.imageUrl ?? "/mock/listings/fender-stratocaster-sunburst.jpg";

  return (
    <Card
      variant="interactive"
      data-testid={`my-stuff-card-${listing.id}`}
      className="group flex min-h-full flex-col overflow-hidden rounded-lg hover:ring-1 hover:ring-primary/20"
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
          <div className="absolute right-2 top-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
            <ItemActionMenu
              listing={listing}
              onArchive={onArchive}
              onDuplicate={onDuplicate}
              onEdit={onEdit}
              onMarkSold={onMarkSold}
              onToggleStatus={onToggleStatus}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col p-3">
          <h3 className="line-clamp-1 text-sm font-semibold text-foreground transition group-hover:text-primary">
            <Link href={href}>{listing.title}</Link>
          </h3>
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
            {listing.subtitle}
          </p>

          <div className="mt-3">
            <CollectionChip
              collections={collections}
              label={collectionLabel}
              onChange={onCollectionChange}
            />
          </div>

          <div className="mt-3 flex min-h-5 flex-wrap items-center gap-1.5">
            {listing.statuses.forSale ? (
              <StatusDot icon={DollarSign} label="For sale" tone="success" />
            ) : null}
            {listing.statuses.forTrade ? (
              <StatusDot icon={Repeat2} label="For trade" tone="info" />
            ) : null}
            {!listing.statuses.forSale && !listing.statuses.forTrade ? (
              <span className="rounded-full border border-border bg-card px-2 py-0.5 text-xs text-muted-foreground">
                Private
              </span>
            ) : null}
          </div>

          <div className="mt-auto flex items-end justify-between gap-3 pt-4">
            <div className="text-sm font-semibold text-foreground">
              {listing.price}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatRelativeDate(listing.createdAt)}
            </div>
          </div>
        </div>
    </Card>
  );
}

function MyStuffItemRow({
  collections,
  collectionLabel,
  listing,
  onArchive,
  onCollectionChange,
  onDuplicate,
  onEdit,
  onMarkSold,
  onToggleStatus,
}: {
  collections: MockCollection[];
  collectionLabel: string;
  listing: MockListing;
  onArchive: () => void;
  onCollectionChange: (collectionId: string | null) => void;
  onDuplicate: () => void;
  onEdit: () => void;
  onMarkSold: () => void;
  onToggleStatus: (statusKey: ListingStatusKey) => void;
}) {
  const imageUrl = listing.imageUrl ?? "/mock/listings/fender-stratocaster-sunburst.jpg";
  const href = listing.href ?? "/collections";

  return (
    <div
      data-testid={`my-stuff-row-${listing.id}`}
      className="group grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-4 border-b border-border p-3 transition hover:bg-secondary/40 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_190px_190px_220px_auto]"
    >
      <div className="relative size-16 overflow-hidden rounded-md bg-muted lg:hidden">
        <Image
          src={imageUrl}
          alt={listing.title}
          fill
          sizes="64px"
          className="object-cover"
          style={{ objectPosition: "center bottom" }}
        />
      </div>
      <div className="min-w-0 lg:flex lg:items-center lg:gap-3">
        <div className="hidden size-12 shrink-0 overflow-hidden rounded-md bg-muted lg:block">
          <Image
            src={imageUrl}
            alt=""
            width={48}
            height={48}
            className="size-full object-cover"
            style={{ objectPosition: "center bottom" }}
          />
        </div>
        <div className="min-w-0">
          <Link href={href} className="truncate text-sm font-semibold text-foreground transition hover:text-primary">
            {listing.title}
          </Link>
          <div className="mt-1 truncate text-xs text-muted-foreground">
            {listing.subtitle}
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 lg:hidden">
          <CollectionChip
            collections={collections}
            label={collectionLabel}
            onChange={onCollectionChange}
          />
          {listing.statuses.forSale ? (
            <StatusDot icon={DollarSign} label="For sale" tone="success" />
          ) : null}
          {listing.statuses.forTrade ? (
            <StatusDot icon={Repeat2} label="For trade" tone="info" />
          ) : null}
        </div>
      </div>
      <div className="hidden text-sm font-semibold text-foreground lg:block">
        {listing.price}
      </div>
      <div className="hidden items-center gap-1.5 lg:flex">
        {listing.statuses.forSale ? (
          <StatusDot icon={DollarSign} label="For sale" tone="success" />
        ) : null}
        {listing.statuses.forTrade ? (
          <StatusDot icon={Repeat2} label="For trade" tone="info" />
        ) : null}
        {!listing.statuses.forSale && !listing.statuses.forTrade ? (
          <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
            Private
          </span>
        ) : null}
      </div>
      <div className="hidden lg:block">
        <CollectionChip
          collections={collections}
          label={collectionLabel}
          onChange={onCollectionChange}
        />
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right lg:hidden">
          <div className="text-sm font-semibold text-foreground">{listing.price}</div>
          <div className="text-xs text-muted-foreground">
            {formatRelativeDate(listing.createdAt)}
          </div>
        </div>
        <ItemActionMenu
          listing={listing}
          onArchive={onArchive}
          onDuplicate={onDuplicate}
          onEdit={onEdit}
          onMarkSold={onMarkSold}
          onToggleStatus={onToggleStatus}
        />
      </div>
    </div>
  );
}

function CollectionListRow({ collection }: { collection: MockCollection }) {
  const privateCollection = collection.visibility
    .toLowerCase()
    .includes("unlisted");
  const VisibilityIcon = privateCollection ? Lock : Folder;
  const visibilityLabel = privateCollection ? "Link Only" : "Public";

  return (
    <Link
      href={collection.href}
      className="grid gap-4 border-b border-border p-3 transition last:border-b-0 hover:bg-secondary/40 sm:grid-cols-[220px_minmax(0,1fr)_160px_160px]"
    >
      <CollectionPreviewStrip
        images={collection.images}
        className="aspect-[16/9] rounded-md"
      />
      <div className="min-w-0 self-center">
        <div className="truncate text-sm font-semibold text-foreground">
          {collection.title}
        </div>
        <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">
          {collection.description}
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          {collection.itemCount} items
        </div>
      </div>
      <div className="self-center text-sm font-semibold text-foreground">
        {collection.estimatedValue ?? "$0"}
      </div>
      <div className="flex items-center gap-2 self-center text-xs text-muted-foreground">
        <VisibilityIcon
          className={privateCollection ? "size-3.5" : "size-3.5 text-success"}
          aria-hidden="true"
        />
        {visibilityLabel}
      </div>
    </Link>
  );
}

function EmptyCollectionState({
  hasSearch,
  onCreate,
}: {
  hasSearch: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card px-5 py-14 text-center">
      <Folder className="size-9 text-muted-foreground" aria-hidden="true" />
      <h3 className="mt-4 text-base font-semibold text-foreground">
        {hasSearch ? "No collections found" : "No collections yet"}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        {hasSearch
          ? "Try a different search term or clear the search field."
          : "Create a collection to group related gear and wishlist items."}
      </p>
      {!hasSearch ? (
        <button
          type="button"
          onClick={onCreate}
          className={buttonVariants({
            variant: "secondary",
            size: "sm",
            className: "mt-5",
          })}
        >
          <Plus className="size-4" aria-hidden="true" />
          New collection
        </button>
      ) : null}
    </div>
  );
}

function EmptyItemState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card px-5 py-14 text-center">
      <Package className="size-9 text-muted-foreground" aria-hidden="true" />
      <h3 className="mt-4 text-base font-semibold text-foreground">
        No items found
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        {hasFilters
          ? "Try clearing the active filters or search term."
          : "Items you add to collections, sale listings, trade listings, and wants will appear here."}
      </p>
      {hasFilters ? (
        <button
          type="button"
          onClick={onClear}
          className={buttonVariants({
            variant: "secondary",
            size: "sm",
            className: "mt-5",
          })}
        >
          <X className="size-4" aria-hidden="true" />
          Clear filters
        </button>
      ) : null}
    </div>
  );
}

function EditItemPanel({
  collectionLabel,
  collections,
  listing,
  onClose,
  onCollectionChange,
  onFieldChange,
  onSave,
  onToggleStatus,
}: {
  collectionLabel: string;
  collections: MockCollection[];
  listing: MockListing;
  onClose: () => void;
  onCollectionChange: (collectionId: string | null) => void;
  onFieldChange: (field: EditableListingField, value: string) => void;
  onSave: () => void;
  onToggleStatus: (statusKey: ListingStatusKey) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 px-3 pb-3 backdrop-blur-sm sm:items-center sm:px-4 sm:pb-0">
      <section
        aria-labelledby="edit-item-title"
        className="w-full max-w-2xl rounded-lg border border-border bg-card shadow-overlay"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2
              id="edit-item-title"
              className="text-base font-semibold text-foreground"
            >
              Edit item
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Quick inventory edits update the local card immediately.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close edit item"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-5 px-5 py-5 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-foreground">
              Item title
              <Input
                aria-label="Item title"
                className="mt-2 bg-background"
                value={listing.title}
                onChange={(event) =>
                  onFieldChange("title", event.target.value)
                }
              />
            </label>
            <label className="block text-sm font-medium text-foreground">
              Subtitle
              <Input
                aria-label="Item subtitle"
                className="mt-2 bg-background"
                value={listing.subtitle ?? ""}
                onChange={(event) =>
                  onFieldChange("subtitle", event.target.value)
                }
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-foreground">
                Price
                <Input
                  aria-label="Item price"
                  className="mt-2 bg-background"
                  value={listing.price ?? ""}
                  onChange={(event) =>
                    onFieldChange("price", event.target.value)
                  }
                />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Condition
                <Input
                  aria-label="Item condition"
                  className="mt-2 bg-background"
                  value={listing.condition}
                  onChange={(event) =>
                    onFieldChange("condition", event.target.value)
                  }
                />
              </label>
            </div>
          </div>

          <div className="space-y-4 rounded-lg border border-border bg-background p-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Status
              </div>
              <div className="mt-2 grid gap-2">
                <StatusToggleButton
                  active={Boolean(listing.statuses.forSale)}
                  icon={DollarSign}
                  label="For sale"
                  onClick={() => onToggleStatus("forSale")}
                />
                <StatusToggleButton
                  active={Boolean(listing.statuses.forTrade)}
                  icon={Repeat2}
                  label="For trade"
                  onClick={() => onToggleStatus("forTrade")}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Collection
              </div>
              <CollectionChip
                collections={collections}
                label={collectionLabel}
                onChange={onCollectionChange}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className={buttonVariants({ variant: "ghost" })}
          >
            Cancel
          </button>
          <button type="button" onClick={onSave} className={buttonVariants()}>
            Save changes
          </button>
        </div>
      </section>
    </div>
  );
}

function StatusToggleButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex h-10 items-center justify-between gap-3 rounded-lg border px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        active
          ? "border-primary/45 bg-primary/10 text-primary"
          : "border-border bg-card text-muted-foreground hover:border-primary/35 hover:text-foreground",
      )}
    >
      <span className="flex items-center gap-2">
        <Icon className="size-4" aria-hidden="true" />
        {label}
      </span>
      {active ? <Check className="size-4" aria-hidden="true" /> : null}
    </button>
  );
}

function ActionFeedbackToast({
  feedback,
  onDismiss,
}: {
  feedback: ActionFeedback;
  onDismiss: () => void;
}) {
  return (
    <div
      key={feedback.id}
      role="status"
      className={cn(
        "fixed bottom-24 left-1/2 z-50 flex w-[min(92vw,420px)] -translate-x-1/2 items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm shadow-overlay sm:bottom-5 sm:left-auto sm:right-5 sm:translate-x-0",
        feedback.tone === "warning"
          ? "border-warning/35"
          : "border-primary/30",
      )}
    >
      <div className="min-w-0 flex-1 font-medium text-foreground">
        {feedback.message}
      </div>
      {feedback.onUndo ? (
        <button
          type="button"
          onClick={feedback.onUndo}
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold text-primary transition hover:bg-primary/10"
        >
          <Undo2 className="size-3.5" aria-hidden="true" />
          {feedback.undoLabel ?? "Undo"}
        </button>
      ) : null}
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={onDismiss}
        className="grid size-7 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

function CollectionChip({
  collections,
  label,
  onChange,
}: {
  collections: MockCollection[];
  label: string;
  onChange: (collectionId: string | null) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-primary/35 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
        <Folder className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate">{label}</span>
        <span className="text-muted-foreground">⌄</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="left-0 right-auto">
        {collections.map((collection) => (
          <DropdownMenuItem
            key={collection.id}
            onClick={() => onChange(collection.id)}
            className="justify-between gap-3"
          >
            <span className="truncate">Move to {collection.title}</span>
            {collection.title === label ? (
              <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
            ) : null}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem
          onClick={() => onChange(null)}
          className="justify-between gap-3"
        >
          <span>Remove from collection</span>
          {label === "Uncategorized" ? (
            <Check className="size-4 text-primary" aria-hidden="true" />
          ) : null}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ItemActionMenu({
  listing,
  onArchive,
  onDuplicate,
  onEdit,
  onMarkSold,
  onToggleStatus,
}: {
  listing: MockListing;
  onArchive: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
  onMarkSold: () => void;
  onToggleStatus: (statusKey: ListingStatusKey) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Item actions"
        className="grid size-8 place-items-center rounded-full border border-border bg-background/90 text-muted-foreground backdrop-blur transition hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <MoreHorizontal className="size-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52">
        <DropdownMenuItem onClick={onEdit} className="gap-2">
          <Edit2 className="size-4" aria-hidden="true" />
          Edit item
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onToggleStatus("forSale")}
          className="gap-2"
        >
          <DollarSign className="size-4" aria-hidden="true" />
          {listing.statuses.forSale ? "Remove sale status" : "List for sale"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onToggleStatus("forTrade")}
          className="gap-2"
        >
          <Repeat2 className="size-4" aria-hidden="true" />
          {listing.statuses.forTrade
            ? "Remove trade status"
            : "List for trade"}
        </DropdownMenuItem>
        {listing.statuses.forSale ? (
          <DropdownMenuItem onClick={onMarkSold} className="gap-2">
            <Check className="size-4" aria-hidden="true" />
            Mark sold
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem onClick={onDuplicate} className="gap-2">
          <Copy className="size-4" aria-hidden="true" />
          Duplicate item
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onArchive}
          className="gap-2 text-destructive hover:text-destructive"
        >
          <Archive className="size-4" aria-hidden="true" />
          Archive
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
      className={`grid size-5 place-items-center rounded-full border ${
        tone === "success"
          ? "border-success/45 bg-success/12 text-success"
          : "border-info/45 bg-info/12 text-info"
      }`}
      aria-label={label}
      title={label}
    >
      <Icon className="size-3" aria-hidden="true" />
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

function parsePrice(price?: string) {
  return Number(price?.replace(/[^0-9.]/g, "") ?? 0);
}

function SortMenu({
  onChange,
  value,
}: {
  onChange: (value: SortKey) => void;
  value: SortKey;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-3 text-sm font-semibold text-foreground transition hover:border-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
        <ArrowUpDown className="size-4 text-muted-foreground" aria-hidden="true" />
        {sortLabels[value]}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="right-0 min-w-44">
        {(Object.keys(sortLabels) as SortKey[]).map((key) => (
          <DropdownMenuItem
            key={key}
            onClick={() => onChange(key)}
            className="justify-between gap-3"
          >
            <span>{sortLabels[key]}</span>
            {value === key ? (
              <Check className="size-4 text-primary" aria-hidden="true" />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FilterPill({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active?: boolean;
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 items-center gap-2 rounded-full border px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-transparent text-muted-foreground hover:border-primary/35 hover:text-foreground"
      }`}
    >
      {active ? (
        <Check className="size-4" aria-hidden="true" />
      ) : (
        <Icon className="size-4" aria-hidden="true" />
      )}
      {active ? `${label}: Only` : label}
    </button>
  );
}

function ViewToggle({
  onChange,
  value,
}: {
  onChange: (value: "grid" | "list") => void;
  value: "grid" | "list";
}) {
  return (
    <Card className="flex h-10 items-center gap-1 rounded-lg p-1">
      <button
        type="button"
        aria-label="Grid view"
        onClick={() => onChange("grid")}
        className={`grid size-8 place-items-center rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
          value === "grid"
            ? "bg-primary/15 text-primary"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        }`}
      >
        <Grid3X3 className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="List view"
        onClick={() => onChange("list")}
        className={`grid size-8 place-items-center rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
          value === "list"
            ? "bg-primary/15 text-primary"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        }`}
      >
        <List className="size-4" aria-hidden="true" />
      </button>
    </Card>
  );
}
