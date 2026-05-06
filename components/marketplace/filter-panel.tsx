"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import type { MockCategory, MockNiche } from "@/data/mock/types";
import {
  categoryTaxonomy,
  getCategoryCount,
  getCategoryTaxonomy,
} from "@/components/marketplace/filter-options";
import { PriceHistogramControl } from "@/components/marketplace/price-histogram-control";
import { cn } from "@/lib/utils";
import {
  DEFAULT_PRICE_RANGE,
  type CommunityContextFilter,
  type ListingStatusFilter,
  type MarketplaceFilters,
  type PriceRangeFilter,
} from "@/lib/marketplace-filters";

const statuses: Array<{ label: string; value: ListingStatusFilter }> = [
  { label: "For Sale", value: "forSale" },
  { label: "For Trade", value: "forTrade" },
  { label: "In Collection", value: "inCollection" },
  { label: "Wanted", value: "wishlist" },
];

const communityContexts: Array<{
  label: string;
  value: CommunityContextFilter;
}> = [
  { label: "All listings", value: "all" },
  { label: "Public market", value: "public" },
  { label: "Community listings", value: "community" },
];

type FilterPanelProps = {
  filters?: MarketplaceFilters;
  categories?: MockCategory[];
  niches?: MockNiche[];
  conditions?: string[];
  onCategoryChange?: (categoryId: string) => void;
  onSubcategoryChange?: (subcategoryId: string) => void;
  onBrandToggle?: (brand: string) => void;
  onNicheChange?: (nicheId: string) => void;
  onConditionChange?: (condition: string) => void;
  onStatusToggle?: (status: ListingStatusFilter) => void;
  onPriceRangeChange?: (priceRange: PriceRangeFilter) => void;
  onCommunityContextChange?: (context: CommunityContextFilter) => void;
};

export function FilterPanel({
  filters = {
    search: "",
    categoryId: "all",
    subcategoryId: "all",
    brandFilters: new Set<string>(),
    statusFilters: new Set<ListingStatusFilter>(),
    condition: "all",
    priceRange: DEFAULT_PRICE_RANGE,
    nicheId: "all",
    communityContext: "all",
  },
  categories = [
    { id: "electric-guitars", nicheId: "music-gear", name: "Electric Guitars", slug: "electric-guitars", itemCount: 0 },
    { id: "effects-pedals", nicheId: "music-gear", name: "Effects Pedals", slug: "effects-pedals", itemCount: 0 },
    { id: "amplifiers", nicheId: "music-gear", name: "Amplifiers", slug: "amplifiers", itemCount: 0 },
  ],
  niches = [
    { id: "music-gear", name: "Music Gear", slug: "music-gear", description: "" },
  ],
  conditions = ["Excellent", "Very Good", "Good"],
  onCategoryChange,
  onSubcategoryChange,
  onBrandToggle,
  onNicheChange,
  onConditionChange,
  onStatusToggle,
  onPriceRangeChange,
  onCommunityContextChange,
}: FilterPanelProps) {
  const activeTaxonomy =
    filters.categoryId === "all" ? null : getCategoryTaxonomy(filters.categoryId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="niche">Niche</Label>
          <Select
            id="niche"
            value={filters.nicheId}
            onChange={(event) => onNicheChange?.(event.target.value)}
          >
            <option value="all">All niches</option>
            {niches.map((niche) => (
              <option key={niche.id} value={niche.id}>
                {niche.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-semibold text-foreground">Category</div>
          <div className="space-y-1">
            <button
              type="button"
              className={cn(
                "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-semibold",
                filters.categoryId === "all"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground",
              )}
              onClick={() => {
                onCategoryChange?.("all");
              }}
            >
              <span>All categories</span>
              <span>{categories.reduce((total, item) => total + item.itemCount, 0).toLocaleString()}</span>
            </button>
            {categoryTaxonomy.map((category) => {
              const active = filters.categoryId === category.id;

              return (
                <div key={category.id}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-semibold",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground",
                    )}
                    onClick={() => {
                      onCategoryChange?.(category.id);
                    }}
                  >
                    <span>{category.label}</span>
                    <span>{getCategoryCount(categories, category.id).toLocaleString()}</span>
                  </button>
                  {active ? (
                    <div className="ml-3 mt-1 flex flex-wrap gap-2">
                      {category.subcategories.map((subcategory) => (
                        <button
                          key={subcategory.label}
                          type="button"
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs",
                            filters.subcategoryId === subcategory.label
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border text-muted-foreground",
                          )}
                          onClick={() =>
                            onSubcategoryChange?.(
                              filters.subcategoryId === subcategory.label
                                ? "all"
                                : subcategory.label,
                            )
                          }
                        >
                          {subcategory.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
          {activeTaxonomy ? (
            <fieldset className="space-y-2 pt-2">
              <legend className="text-sm font-semibold text-foreground">
                Brands
              </legend>
              {activeTaxonomy.brands.map((brand) => (
                <label
                  key={brand.label}
                  className="flex items-center justify-between gap-2 text-sm text-muted-foreground"
                >
                  <span className="flex items-center gap-2">
                    <Checkbox
                      checked={filters.brandFilters.has(brand.label)}
                      onChange={() => onBrandToggle?.(brand.label)}
                    />
                    {brand.label}
                  </span>
                  <span className="text-xs">{brand.count}</span>
                </label>
              ))}
            </fieldset>
          ) : null}
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-foreground">
            Status
          </legend>
          {statuses.map((status) => (
            <label
              key={status.value}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Checkbox
                checked={filters.statusFilters.has(status.value)}
                readOnly={!onStatusToggle}
                onChange={() => onStatusToggle?.(status.value)}
              />
              {status.label}
            </label>
          ))}
        </fieldset>
        <div className="space-y-2">
          <Label>Price</Label>
          <PriceHistogramControl
            id="mobile-price-range"
            value={filters.priceRange}
            onChange={(nextRange) => onPriceRangeChange?.(nextRange)}
          />
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-foreground">
            Condition
          </legend>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={filters.condition === "all"}
              readOnly={!onConditionChange}
              onChange={() => onConditionChange?.("all")}
            />
            Any condition
          </label>
          {conditions.map((condition) => (
            <label
              key={condition}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Checkbox
                checked={filters.condition === condition}
                readOnly={!onConditionChange}
                onChange={() => onConditionChange?.(condition)}
              />
              {condition}
            </label>
          ))}
        </fieldset>
        <div className="space-y-2">
          <Label htmlFor="community-context">Community context</Label>
          <Select
            id="community-context"
            value={filters.communityContext}
            onChange={(event) =>
              onCommunityContextChange?.(
                event.target.value as CommunityContextFilter,
              )
            }
          >
            {communityContexts.map((context) => (
              <option key={context.value} value={context.value}>
                {context.label}
              </option>
            ))}
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
