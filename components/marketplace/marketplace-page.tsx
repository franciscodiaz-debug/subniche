"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Grid2X2, Plus, SlidersHorizontal, Telescope } from "lucide-react";
import { ActiveFilterChips } from "@/components/marketplace/active-filter-chips";
import { DesktopFilterRail } from "@/components/marketplace/desktop-filter-rail";
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
import { cn } from "@/lib/utils";
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
  const [filtersOpen, setFiltersOpen] = useState(false);
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
    <>
      <DesktopFilterRail
        open={filtersOpen}
        filters={filters}
        categories={mockCategories}
        niches={mockNiches}
        conditions={conditions}
        activeFilterCount={activeChips.length}
        onClose={() => setFiltersOpen(false)}
        onClearAll={clearFilters}
        onCategoryChange={setCategoryId}
        onNicheChange={setNicheId}
        onConditionChange={setCondition}
        onStatusToggle={toggleStatus}
        onPriceRangeChange={setPriceRange}
        onCommunityContextChange={setCommunityContext}
      />
      <PageShell
        className={cn(
          "max-w-none space-y-5 transition-[padding] duration-300 lg:px-12",
          filtersOpen && "lg:pl-[304px]",
        )}
      >
        <div className="hidden justify-center lg:flex">
          <SearchBar
            placeholder="Search gear, musicians, communities..."
            value={search}
            onChange={setSearch}
            className="w-full max-w-3xl"
          />
        </div>

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

        <div className="lg:hidden">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        <div className="flex flex-wrap items-start gap-2 lg:flex-nowrap">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className={cn(
              "hidden h-10 shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-semibold text-foreground transition hover:bg-secondary lg:inline-flex",
              filtersOpen && "lg:hidden",
            )}
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Filters
            {activeChips.length > 0 ? (
              <span className="grid size-5 place-items-center rounded-full bg-primary text-xs text-primary-foreground">
                {activeChips.length}
              </span>
            ) : null}
          </button>
          <div className="lg:hidden">
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
          </div>
          <div className="min-w-0 flex-1">
            <ActiveFilterChips chips={activeChips} onClearAll={clearFilters} />
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <SortControl value={sort} onChange={setSort} />
            <Button variant="secondary" size="icon" aria-label="Grid view">
              <Grid2X2 className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
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
    </>
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
