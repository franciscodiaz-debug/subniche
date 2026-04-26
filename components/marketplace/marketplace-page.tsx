"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRightLeft, Plus } from "lucide-react";
import { ActiveFilterChips } from "@/components/marketplace/active-filter-chips";
import { FilterPanel } from "@/components/marketplace/filter-panel";
import { MarketplaceGrid } from "@/components/marketplace/marketplace-grid";
import { MarketplaceModeToggle } from "@/components/marketplace/marketplace-mode-toggle";
import { MobileFilterSheet } from "@/components/marketplace/mobile-filter-sheet";
import { SearchBar } from "@/components/marketplace/search-bar";
import { SortControl } from "@/components/marketplace/sort-control";
import { PageShell } from "@/components/layout/page-shell";
import { TradeMatchCard } from "@/components/trade/trade-match-card";
import { buttonVariants, Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import {
  mockCategories,
  mockListings,
  mockNiches,
  mockTradeOpportunities,
} from "@/data/mock";
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
import { cn } from "@/lib/utils";

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

  const visibleListings = useMemo(() => {
    const filtered = filterListings(mockListings, filters, mockCategories);
    return sortListings(filtered, sort, mockTradeOpportunities);
  }, [filters, sort]);

  const tradeReadyCount = mockListings.filter(
    (listing) => listing.statuses.forTrade,
  ).length;
  const communityListingCount = mockListings.filter((listing) =>
    listing.publishingContexts.some(
      (context) => context.type === "community_market",
    ),
  ).length;

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
    setCondition("all");
    setPriceRange("all");
    setCommunityContext("all");
    setStatusFilters(new Set(initialMode === "trade" ? ["forTrade"] : []));
  }

  return (
    <PageShell className="space-y-6">
      <SectionHeader
        eyebrow={initialMode === "trade" ? "Trade Mode" : "Music Gear Market"}
        title={
          initialMode === "trade"
            ? "Find trade-ready gear."
            : "Find the gear your people actually care about."
        }
        description={
          initialMode === "trade"
            ? "Browse items with trade intent and see the difference between true matches, inbound interest, and suggestions."
            : "Browse niche-specific listings with trade context, collections, and community signals built in."
        }
        action={
          <Link
            href="/add-item"
            className={buttonVariants({ variant: "primary" })}
          >
            <Plus className="size-4" aria-hidden="true" />
            Create Listing
          </Link>
        }
      />

      <div className="grid gap-3 md:grid-cols-3">
        <ContextStat label="Niche" value="Music Gear" />
        <ContextStat label="Trade-ready" value={`${tradeReadyCount} listings`} />
        <ContextStat
          label="Community context"
          value={`${communityListingCount} listings`}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <CategoryPill
          active={categoryId === "all"}
          label="Music Gear"
          onClick={() => setCategoryId("all")}
        />
        {mockCategories.map((category) => (
          <CategoryPill
            key={category.id}
            active={categoryId === category.id}
            label={category.name}
            onClick={() => setCategoryId(category.id)}
          />
        ))}
      </div>

      {initialMode === "trade" ? (
        <section className="grid gap-4 lg:grid-cols-3">
          {mockTradeOpportunities.map((opportunity) => (
            <TradeMatchCard key={opportunity.id} {...opportunity} />
          ))}
        </section>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-center">
        <SearchBar value={search} onChange={setSearch} />
        <MarketplaceModeToggle mode={initialMode} />
        <SortControl value={sort} onChange={setSort} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ActiveFilterChips
          chips={activeChips}
          onClearAll={clearFilters}
        />
        <div className="flex items-center gap-3 sm:ml-auto">
          <span className="text-sm text-muted-foreground">
            {visibleListings.length} listings
          </span>
          <div className="lg:hidden">
            <MobileFilterSheet
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
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <FilterPanel
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
        </aside>

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
      </div>
    </PageShell>
  );
}

function ContextStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-foreground">
        <ArrowRightLeft className="size-4 text-accent" aria-hidden="true" />
        {value}
      </div>
    </Card>
  );
}

function CategoryPill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "h-9 shrink-0 rounded-lg border px-3 text-sm font-semibold transition",
        active
          ? "border-accent/60 bg-primary text-primary-foreground"
          : "border-border bg-surface text-muted-foreground hover:border-accent/45 hover:text-foreground",
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
