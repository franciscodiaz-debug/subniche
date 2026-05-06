"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Telescope,
  X,
} from "lucide-react";
import { ActiveFilterChips } from "@/components/marketplace/active-filter-chips";
import { DesktopFilterRail } from "@/components/marketplace/desktop-filter-rail";
import { getPriceRangeLabel } from "@/components/marketplace/filter-options";
import {
  GridDensitySelector,
  useGridDensity,
} from "@/components/marketplace/grid-density-selector";
import { MarketplaceGrid } from "@/components/marketplace/marketplace-grid";
import { MarketplaceModeToggle } from "@/components/marketplace/marketplace-mode-toggle";
import { MobileFilterSheet } from "@/components/marketplace/mobile-filter-sheet";
import { SearchBar } from "@/components/marketplace/search-bar";
import { SortControl } from "@/components/marketplace/sort-control";
import { PageShell } from "@/components/layout/page-shell";
import { buttonVariants, Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  mockCategories,
  mockListings,
  mockNiches,
  mockTradeOpportunities,
  tradeDiscoveryListings,
} from "@/data/mock";
import type { MockListing } from "@/data/mock/types";
import { cn } from "@/lib/utils";
import {
  DEFAULT_PRICE_RANGE,
  filterListings,
  isDefaultPriceRange,
  sortListings,
  type CommunityContextFilter,
  type ListingStatusFilter,
  type MarketplaceFilters,
  type MarketplaceMode,
  type PriceRangeFilter,
  type SortOption,
} from "@/lib/marketplace-filters";
import { useLocalStorageFlag } from "@/lib/use-local-storage-flag";

type MarketplacePageProps = {
  initialMode: MarketplaceMode;
};

type TradeTargetOption = {
  id: string;
  label: string;
  meta: string;
  imageUrl: string | null;
  perfectCount: number;
  settingsHref?: string;
};

const statusLabels: Record<ListingStatusFilter, string> = {
  forSale: "For Sale",
  forTrade: "For Trade",
  inCollection: "In Collection",
  wishlist: "Wanted",
};

const communityLabels: Record<CommunityContextFilter, string> = {
  all: "All listings",
  public: "Public market",
  community: "Community listings",
};
const MARKET_TOUR_STORAGE_KEY = "purple-door-market-tour-dismissed";
const MARKET_TOUR_CHANGE_EVENT = "purple-door-market-tour-dismissed-change";

const marketTourSteps = [
  {
    target: "mode",
    title: "For Sale or Trade",
    body: "Switch between For Sale listings and Trade matches on items you're open to swapping.",
    action: "Next",
  },
  {
    target: "filters",
    title: "Filters",
    body: "Narrow the market by category, brand, condition, price, and listings that are open to trade.",
    action: "Next",
  },
  {
    target: "density",
    title: "Grid Controls",
    body: "Change sort order and card density when you want more detail or faster scanning.",
    action: "Get started",
  },
] as const;

type MarketTourTarget = (typeof marketTourSteps)[number]["target"];

const tradeTargetOptions: TradeTargetOption[] = [
  {
    id: "all",
    label: "All items",
    meta: "8 matches",
    imageUrl: null,
    perfectCount: 0,
  },
  {
    id: "my-fender-pro-ii",
    label: "Fender American Pro II Stratocaster",
    meta: "5 matches",
    imageUrl: "/mock/listings/fender-stratocaster-sunburst.jpg",
    perfectCount: 1,
    settingsHref: "/settings/seller-defaults",
  },
  {
    id: "my-martin-d28",
    label: "Martin D-28 Acoustic",
    meta: "3 matches",
    imageUrl: "/mock/listings/martin-d28-natural.jpg",
    perfectCount: 1,
    settingsHref: "/settings/seller-defaults",
  },
  {
    id: "my-mesa-dual-rectifier",
    label: "Mesa Boogie Dual Rectifier",
    meta: "2 matches",
    imageUrl: "/mock/listings/mesa-dual-rectifier.jpg",
    perfectCount: 1,
    settingsHref: "/settings/seller-defaults",
  },
  {
    id: "my-strymon-bigsky",
    label: "Strymon BigSky Reverb",
    meta: "1 match",
    imageUrl: "/mock/listings/strymon-bigsky.jpg",
    perfectCount: 0,
    settingsHref: "/settings/seller-defaults",
  },
];

export function MarketplacePage({ initialMode }: MarketplacePageProps) {
  const { gridDensity, setGridDensity } = useGridDensity();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [subcategoryId, setSubcategoryId] = useState("all");
  const [brandFilters, setBrandFilters] = useState<Set<string>>(() => new Set());
  const [nicheId, setNicheId] = useState("all");
  const [tradeTarget, setTradeTarget] = useState("all");
  const [statusFilters, setStatusFilters] = useState<
    Set<ListingStatusFilter>
  >(() => new Set());
  const [condition, setCondition] = useState("all");
  const [priceRange, setPriceRange] =
    useState<PriceRangeFilter>(DEFAULT_PRICE_RANGE);
  const [communityContext, setCommunityContext] =
    useState<CommunityContextFilter>("all");
  const [sort, setSort] = useState<SortOption>(
    initialMode === "trade" ? "trade-matches" : "newest",
  );
  const [marketTourDismissed, setMarketTourDismissed] = useLocalStorageFlag(
    MARKET_TOUR_STORAGE_KEY,
    MARKET_TOUR_CHANGE_EVENT,
  );
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const tourOpen = initialMode === "market" && !marketTourDismissed;

  const filters: MarketplaceFilters = useMemo(
    () => ({
      search,
      categoryId,
      subcategoryId,
      brandFilters,
      statusFilters,
      condition,
      priceRange,
      nicheId,
      communityContext,
    }),
    [
      brandFilters,
      categoryId,
      communityContext,
      condition,
      nicheId,
      priceRange,
      search,
      subcategoryId,
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

  const filteredListings = useMemo(() => {
    const sourceListings =
      initialMode === "trade" ? tradeDiscoveryListings : mockListings;

    return filterListings(sourceListings, filters, mockCategories);
  }, [filters, initialMode]);

  const visibleListings = useMemo(() => {
    if (initialMode === "trade") {
      return filterByTradeTarget(filteredListings, tradeTarget);
    }

    return sortListings(filteredListings, sort, mockTradeOpportunities);
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
          onRemove: () => handleCategoryChange("all"),
        }
      : null,
    subcategoryId !== "all"
      ? {
          key: "subcategory",
          label: subcategoryId,
          onRemove: () => setSubcategoryId("all"),
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
    ...Array.from(brandFilters).map((brand) => ({
      key: `brand-${brand}`,
      label: brand,
      onRemove: () => toggleBrand(brand),
    })),
    condition !== "all"
      ? {
          key: "condition",
          label: condition,
          onRemove: () => setCondition("all"),
        }
      : null,
    !isDefaultPriceRange(priceRange)
      ? {
          key: "price",
          label: getPriceRangeLabel(priceRange),
          onRemove: () => setPriceRange(DEFAULT_PRICE_RANGE),
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
  const activeTourStep = tourOpen ? marketTourSteps[tourStepIndex] : null;
  const tourHighlightClass = (target: MarketTourTarget) =>
    activeTourStep?.target === target
      ? "relative z-50 rounded-xl ring-2 ring-primary ring-offset-4 ring-offset-background shadow-overlay"
      : "";

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

  function toggleBrand(brand: string) {
    setBrandFilters((current) => {
      const next = new Set(current);
      if (next.has(brand)) {
        next.delete(brand);
      } else {
        next.add(brand);
      }
      return next;
    });
  }

  function handleCategoryChange(nextCategoryId: string) {
    const nextValue =
      nextCategoryId === "all" || nextCategoryId === categoryId
        ? "all"
        : nextCategoryId;

    setCategoryId(nextValue);
    setSubcategoryId("all");
    setBrandFilters(new Set());
  }

  function clearFilters() {
    setSearch("");
    setCategoryId("all");
    setSubcategoryId("all");
    setBrandFilters(new Set());
    setNicheId("all");
    setTradeTarget("all");
    setCondition("all");
    setPriceRange(DEFAULT_PRICE_RANGE);
    setCommunityContext("all");
    setStatusFilters(new Set());
  }

  function closeTour() {
    setMarketTourDismissed(true);
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
        onCategoryChange={handleCategoryChange}
        onSubcategoryChange={setSubcategoryId}
        onBrandToggle={toggleBrand}
        onNicheChange={setNicheId}
        onConditionChange={setCondition}
        onStatusToggle={toggleStatus}
        onPriceRangeChange={setPriceRange}
        onCommunityContextChange={setCommunityContext}
      />
      <PageShell
        className={cn(
          "max-w-none space-y-5 pt-5 transition-[padding] duration-300 lg:px-8 lg:pt-5",
          filtersOpen && "lg:pl-[384px]",
        )}
      >
        <div className="hidden justify-center lg:flex">
          <SearchBar
            iconPosition="right"
            placeholder="Search gear, musicians, communities..."
            value={search}
            onChange={setSearch}
            className="w-full max-w-xl lg:-translate-x-20"
          />
        </div>

        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between lg:gap-6">
          <div className="min-w-0 space-y-4 lg:space-y-5">
            <div className="flex items-center gap-3">
              <Telescope
                className="size-7 text-accent lg:size-8"
                aria-hidden="true"
              />
              <h1 className="text-3xl font-semibold text-foreground md:text-4xl">
                Market
              </h1>
            </div>
            <div className={tourHighlightClass("mode")}>
              <MarketplaceModeToggle mode={initialMode} />
            </div>
          </div>
        </header>

        {initialMode === "market" ? (
          <div className="flex flex-wrap items-start gap-2 lg:flex-nowrap">
            <div className={tourHighlightClass("filters")}>
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className={cn(
                  "hidden h-10 shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3 text-sm font-semibold text-foreground transition hover:bg-secondary lg:inline-flex",
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
            </div>
            <div className="lg:hidden">
              <MobileFilterSheet
                activeFilterCount={activeChips.length}
                filters={filters}
                categories={mockCategories}
                niches={mockNiches}
                conditions={conditions}
                onCategoryChange={handleCategoryChange}
                onSubcategoryChange={setSubcategoryId}
                onBrandToggle={toggleBrand}
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
            <div
              className={cn(
                "ml-auto flex shrink-0 items-center gap-2",
                tourHighlightClass("density"),
              )}
            >
              <SortControl value={sort} onChange={setSort} />
              <GridDensitySelector
                value={gridDensity}
                onChange={setGridDensity}
              />
            </div>
          </div>
        ) : (
          <div className="ml-auto flex justify-end">
            <GridDensitySelector
              value={gridDensity}
              onChange={setGridDensity}
            />
          </div>
        )}

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
            <MarketplaceGrid
              listings={visibleListings}
              mode={initialMode}
              density={gridDensity}
            />
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
      {activeTourStep ? (
        <MarketplaceTour
          step={activeTourStep}
          stepIndex={tourStepIndex}
          onClose={closeTour}
          onNext={() => {
            if (tourStepIndex >= marketTourSteps.length - 1) {
              closeTour();
              return;
            }
            setTourStepIndex((current) => current + 1);
          }}
        />
      ) : null}
    </>
  );
}

function MarketplaceTour({
  onClose,
  onNext,
  step,
  stepIndex,
}: {
  onClose: () => void;
  onNext: () => void;
  step: (typeof marketTourSteps)[number];
  stepIndex: number;
}) {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-40 bg-background/72 backdrop-blur-[1px]"
      />
      <div
        role="dialog"
        aria-label="Marketplace tour"
        className={cn(
          "fixed z-50 w-auto rounded-lg border border-border bg-card text-card-foreground shadow-overlay",
          "left-4 right-4 top-[12.5rem] sm:left-8 sm:right-auto sm:w-80",
          step.target === "mode" && "lg:left-[43rem] lg:top-[12.75rem]",
          step.target === "filters" && "lg:left-[18rem] lg:top-[14.25rem]",
          step.target === "density" && "lg:left-auto lg:right-[7rem] lg:top-[14.25rem]",
        )}
      >
        <div className="border-b border-border p-4">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {marketTourSteps.map((tourStep, index) => (
                <span
                  key={tourStep.target}
                  className={cn(
                    "block h-1.5 rounded-full bg-muted",
                    index === stepIndex ? "w-4 bg-primary" : "w-1.5",
                    index < stepIndex && "bg-primary/75",
                  )}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Close marketplace tour"
              className="grid size-6 place-items-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              onClick={onClose}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
          <h2 className="text-sm font-semibold text-foreground">{step.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {step.body}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3 p-4">
          <button
            type="button"
            className="rounded-md px-1 text-sm text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            onClick={onClose}
          >
            Skip tour
          </button>
          <Button type="button" variant="primary" size="sm" onClick={onNext}>
            {step.action}
            <ChevronDown className="-rotate-90 size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
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
  options: TradeTargetOption[];
  matchCount: number;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">For</span>
      <TradeTargetMenu value={value} options={options} onChange={onChange} />
      <span className="text-sm text-muted-foreground">
        {matchCount} matches
      </span>
    </div>
  );
}

function TradeTargetMenu({
  value,
  options,
  onChange,
}: {
  value: string;
  options: TradeTargetOption[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedOption =
    options.find((option) => option.id === value) ?? options[0];
  const selectedSettingsHref = selectedOption.id === "all"
    ? undefined
    : selectedOption.settingsHref;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="relative flex min-w-0 items-center gap-1" ref={menuRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Trade target"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "inline-flex h-10 min-w-0 max-w-full flex-1 items-center justify-between gap-3 rounded-lg border border-primary/45 bg-card px-3 text-sm font-semibold text-foreground transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 sm:h-11 sm:min-w-48 sm:flex-none sm:rounded-xl sm:px-4",
          open && "border-primary bg-secondary",
        )}
      >
        <span className="max-w-[13rem] truncate">{selectedOption.label}</span>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {selectedSettingsHref ? (
        <Link
          href={selectedSettingsHref}
          aria-label={`Trade preferences for ${selectedOption.label}`}
          className="grid size-8 place-items-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          title="Trade preferences"
        >
          <Settings className="size-4" aria-hidden="true" />
        </Link>
      ) : null}

      {open ? (
        <div
          role="listbox"
          className="absolute left-0 top-full z-30 mt-2 w-[calc(100vw-2rem)] max-w-[360px] overflow-hidden rounded-xl border border-border bg-card shadow-card sm:w-[360px]"
        >
          {options.map((option, index) => {
            const selected = option.id === value;
            const optionMeta = `${option.meta}${
              option.perfectCount > 0 ? ` · ${option.perfectCount} perfect` : ""
            }`;

            return (
              <div
                key={option.id}
                className={cn(
                  "group flex items-center gap-2.5 px-3 py-2 transition-colors",
                  selected && "bg-primary/10",
                  !selected && "hover:bg-secondary",
                  index === 0 && "border-b border-border",
                )}
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(option.id);
                    setOpen(false);
                  }}
                  className="flex min-w-0 flex-1 items-center gap-2.5 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  {option.imageUrl ? (
                    <Image
                      src={option.imageUrl}
                      alt=""
                      width={32}
                      height={32}
                      className="size-8 rounded-md object-cover"
                    />
                  ) : (
                    <span className="grid size-8 place-items-center rounded-md bg-secondary text-primary">
                      <Sparkles className="size-4" aria-hidden="true" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {option.label}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {optionMeta}
                    </span>
                  </span>
                  {selected ? (
                    <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  ) : null}
                </button>
                {option.settingsHref ? (
                  <Link
                    href={option.settingsHref}
                    aria-label={`Trade preferences for ${option.label}`}
                    onClick={(event) => event.stopPropagation()}
                    className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground opacity-100 transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 sm:opacity-0 sm:focus-visible:opacity-100 sm:group-hover:text-foreground sm:group-hover:opacity-100"
                    title="Trade preferences"
                  >
                    <Settings className="size-3.5" aria-hidden="true" />
                  </Link>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
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

  const targetListings: Record<string, string[]> = {
    "my-fender-pro-ii": [
      "listing-les-paul-goldtop",
      "listing-prs-custom-24",
      "listing-gretsch-6120",
    ],
    "my-martin-d28": [
      "listing-taylor-814ce",
      "listing-gibson-j45-standard",
    ],
    "my-mesa-dual-rectifier": [
      "listing-fender-twin",
      "listing-marshall-jcm800-2203",
    ],
    "my-strymon-bigsky": ["listing-eventide-h9-max"],
  };
  const targetIds = targetListings[tradeTarget];

  if (!targetIds) {
    return listings;
  }

  return listings.filter((listing) => targetIds.includes(listing.id));
}
