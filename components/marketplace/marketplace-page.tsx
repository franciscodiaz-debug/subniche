"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Grid2X2, Plus, Telescope } from "lucide-react";
import { ActiveFilterChips } from "@/components/marketplace/active-filter-chips";
import { MarketplaceGrid } from "@/components/marketplace/marketplace-grid";
import { MarketplaceModeToggle } from "@/components/marketplace/marketplace-mode-toggle";
import { MobileFilterSheet } from "@/components/marketplace/mobile-filter-sheet";
import { SearchBar } from "@/components/marketplace/search-bar";
import { SortControl } from "@/components/marketplace/sort-control";
import { PageShell } from "@/components/layout/page-shell";
import { buttonVariants, Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import {
  mockCategories,
  mockListings,
  mockNiches,
  mockTradeOpportunities,
} from "@/data/mock";
import type { MockListing } from "@/data/mock/types";
import {
  filterListings,
  sortListings,
  type CommunityContextFilter,
  type ListingStatusFilter,
  type MarketplaceFilters,
  type MarketplaceMode,
  type PriceRangeFilter,
  type SortOption,
} from "@/lib/marketplace-filters";

type MarketplacePageProps = {
  initialMode: MarketplaceMode;
};

const statusLabels: Record<ListingStatusFilter, string> = {
  forSale: "For Sale",
  forTrade: "For Trade",
  inCollection: "In Collection",
  wishlist: "Wanted",
};

const priceLabels: Record<PriceRangeFilter, string> = {
  all: "Any price",
  "under-250": "Under $250",
  "250-750": "$250-$750",
  "750-1500": "$750-$1,500",
  "1500-plus": "$1,500+",
};

const communityLabels: Record<CommunityContextFilter, string> = {
  all: "All listings",
  public: "Public market",
  community: "Community listings",
};

export function MarketplacePage({ initialMode }: MarketplacePageProps) {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [nicheId, setNicheId] = useState("all");
  const [tradeTarget, setTradeTarget] = useState("all");
  const [statusFilters, setStatusFilters] = useState<
    Set<ListingStatusFilter>
  >(() => new Set(initialMode === "trade" ? ["forTrade"] : []));
  const [condition, setCondition] = useState("all");
  const [priceRange, setPriceRange] = useState<PriceRangeFilter>("all");
  const [communityContext, setCommunityContext] =
    useState<CommunityContextFilter>("all");
  const [sort, setSort] = useState<SortOption>(
    initialMode === "trade" ? "trade-matches" : "relevant",
  );

  const filters: MarketplaceFilters = useMemo(
    () => ({
      search,
      categoryId,
      statusFilters,
      condition,
      priceRange,
      nicheId,
      communityContext,
    }),
    [
      categoryId,
      communityContext,
      condition,
      nicheId,
      priceRange,
      search,
      statusFilters,
    ],
  );

  const conditions = useMemo(
    () =>
      Array.from(
        new Set(
          mockListings
            .map((listing) => listing.condition)
            .filter((value) => value && value !== "Wanted"),
        ),
      ),
    [],
  );

  const tradeReadyCount = mockListings.filter(
    (listing) => listing.statuses.forTrade,
  ).length;

  const tradeTargetOptions = useMemo(
    () => [
      {
        id: "all",
        label: "All items",
        meta: `${tradeReadyCount} matches`,
      },
      ...mockTradeOpportunities.map((opportunity) => ({
        id: opportunity.id,
        label: opportunity.userItem,
        meta: `${getTradeTargetMatchCount(opportunity.id)} matches`,
      })),
    ],
    [tradeReadyCount],
  );

  const filteredListings = useMemo(() => {
    return filterListings(mockListings, filters, mockCategories);
  }, [filters]);

  const visibleListings = useMemo(() => {
    const targetFiltered =
      initialMode === "trade"
        ? filterByTradeTarget(filteredListings, tradeTarget)
        : filteredListings;

    return sortListings(targetFiltered, sort, mockTradeOpportunities);
  }, [filteredListings, initialMode, sort, tradeTarget]);

  const activeChips = [
    search
      ? {
          key: "search",
          label: `Search: ${search}`,
          onRemove: () => setSearch(""),
        }
      : null,
    categoryId !== "all"
      ? {
          key: "category",
          label:
            mockCategories.find((category) => category.id === categoryId)
              ?.name ?? "Category",
          onRemove: () => setCategoryId("all"),
        }
      : null,
    nicheId !== "all"
      ? {
          key: "niche",
          label:
            mockNiches.find((niche) => niche.id === nicheId)?.name ?? "Niche",
          onRemove: () => setNicheId("all"),
        }
      : null,
    ...Array.from(statusFilters).map((status) => ({
      key: status,
      label: statusLabels[status],
      onRemove: () => toggleStatus(status),
    })),
    condition !== "all"
      ? {
          key: "condition",
          label: condition,
          onRemove: () => setCondition("all"),
        }
      : null,
    priceRange !== "all"
      ? {
          key: "price",
          label: priceLabels[priceRange],
          onRemove: () => setPriceRange("all"),
        }
      : null,
    communityContext !== "all"
      ? {
          key: "community",
          label: communityLabels[communityContext],
          onRemove: () => setCommunityContext("all"),
        }
      : null,
  ].filter((chip) => chip !== null);

  function toggleStatus(status: ListingStatusFilter) {
    setStatusFilters((current) => {
      const next = new Set(current);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  }

  function clearFilters() {
    setSearch("");
    setCategoryId("all");
    setNicheId("all");
    setTradeTarget("all");
    setCondition("all");
    setPriceRange("all");
    setCommunityContext("all");
    setStatusFilters(new Set(initialMode === "trade" ? ["forTrade"] : []));
  }

  return (
    <PageShell className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-5">
          <div className="flex items-center gap-3">
            <Telescope className="size-8 text-accent" aria-hidden="true" />
            <h1 className="text-3xl font-bold tracking-normal text-foreground">
              Market
            </h1>
          </div>
          <MarketplaceModeToggle mode={initialMode} />
        </div>
        <div className="sm:pt-1">
          <Link
            href="/add-item"
            className={buttonVariants({ variant: "secondary", size: "lg" })}
          >
            <Plus className="size-4" aria-hidden="true" />
            Add Item
          </Link>
        </div>
      </header>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <SearchBar value={search} onChange={setSearch} />
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <MobileFilterSheet
            activeFilterCount={activeChips.length}
            filters={filters}
            categories={mockCategories}
            niches={mockNiches}
            conditions={conditions}
            onCategoryChange={setCategoryId}
            onNicheChange={setNicheId}
            onConditionChange={setCondition}
            onStatusToggle={toggleStatus}
            onPriceRangeChange={setPriceRange}
            onCommunityContextChange={setCommunityContext}
          />
          <SortControl value={sort} onChange={setSort} />
          <Button variant="secondary" size="icon" aria-label="Grid view">
            <Grid2X2 className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-b border-border pb-5">
        {initialMode === "trade" ? (
          <TradeTargetControl
            value={tradeTarget}
            options={tradeTargetOptions}
            matchCount={visibleListings.length}
            onChange={setTradeTarget}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            {visibleListings.length} listings
          </p>
        )}
        <ActiveFilterChips chips={activeChips} onClearAll={clearFilters} />
      </div>

      <section>
        {visibleListings.length > 0 ? (
          <MarketplaceGrid listings={visibleListings} />
        ) : (
          <EmptyState
            title="No listings match this view."
            body="Try clearing a filter or switching modes."
            primaryAction={
              <Button onClick={clearFilters}>Clear filters</Button>
            }
            secondaryAction={
              <Link
                href="/add-item"
                className={buttonVariants({ variant: "secondary" })}
              >
                Create Listing
              </Link>
            }
          />
        )}
      </section>
    </PageShell>
  );
}

function TradeTargetControl({
  value,
  options,
  matchCount,
  onChange,
}: {
  value: string;
  options: Array<{ id: string; label: string; meta: string }>;
  matchCount: number;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <span className="text-sm font-medium text-muted-foreground">For</span>
      <Select
        aria-label="Trade target"
        className="min-w-52 bg-surface font-semibold"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label} - {option.meta}
          </option>
        ))}
      </Select>
      <span className="text-sm text-muted-foreground">
        {matchCount} matches
      </span>
    </div>
  );
}

function filterByTradeTarget(
  listings: MockListing[],
  tradeTarget: string,
) {
  if (tradeTarget === "all") {
    return listings;
  }

  const opportunity = mockTradeOpportunities.find(
    (item) => item.id === tradeTarget,
  );

  if (!opportunity) {
    return listings;
  }

  const searchable = [opportunity.userItem, opportunity.otherItem]
    .join(" ")
    .toLowerCase();

  return listings.filter((listing) =>
    searchable.includes(listing.title.toLowerCase()),
  );
}

function getTradeTargetMatchCount(tradeTarget: string) {
  return filterByTradeTarget(mockListings, tradeTarget).length;
}
