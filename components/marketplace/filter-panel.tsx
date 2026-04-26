"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import type { MockCategory, MockNiche } from "@/data/mock/types";
import type {
  CommunityContextFilter,
  ListingStatusFilter,
  MarketplaceFilters,
  PriceRangeFilter,
} from "@/lib/marketplace-filters";

const statuses: Array<{ label: string; value: ListingStatusFilter }> = [
  { label: "For Sale", value: "forSale" },
  { label: "For Trade", value: "forTrade" },
  { label: "In Collection", value: "inCollection" },
  { label: "Wanted", value: "wishlist" },
];

const priceRanges: Array<{ label: string; value: PriceRangeFilter }> = [
  { label: "Any", value: "all" },
  { label: "Under $250", value: "under-250" },
  { label: "$250-$750", value: "250-750" },
  { label: "$750-$1,500", value: "750-1500" },
  { label: "$1,500+", value: "1500-plus" },
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
    statusFilters: new Set<ListingStatusFilter>(),
    condition: "all",
    priceRange: "all",
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
  onNicheChange,
  onConditionChange,
  onStatusToggle,
  onPriceRangeChange,
  onCommunityContextChange,
}: FilterPanelProps) {
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
          <Label htmlFor="category">Category</Label>
          <Select
            id="category"
            value={filters.categoryId}
            onChange={(event) => onCategoryChange?.(event.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
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
          <Label htmlFor="price-range">Price</Label>
          <Select
            id="price-range"
            value={filters.priceRange}
            onChange={(event) =>
              onPriceRangeChange?.(event.target.value as PriceRangeFilter)
            }
          >
            {priceRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </Select>
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
