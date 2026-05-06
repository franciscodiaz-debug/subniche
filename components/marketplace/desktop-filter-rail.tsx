"use client";

import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import type { MockCategory, MockNiche } from "@/data/mock/types";
import { cn } from "@/lib/utils";
import {
  categoryTaxonomy,
  getCategoryCount,
  getCategoryTaxonomy,
  getTotalCategoryCount,
} from "@/components/marketplace/filter-options";
import { PriceHistogramControl } from "@/components/marketplace/price-histogram-control";
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

const communityContexts: Array<{
  label: string;
  value: CommunityContextFilter;
}> = [
  { label: "All listings", value: "all" },
  { label: "Public market", value: "public" },
  { label: "Community listings", value: "community" },
];

type DesktopFilterRailProps = {
  open: boolean;
  filters: MarketplaceFilters;
  categories: MockCategory[];
  niches: MockNiche[];
  conditions: string[];
  activeFilterCount: number;
  onClose: () => void;
  onClearAll: () => void;
  onCategoryChange: (categoryId: string) => void;
  onSubcategoryChange: (subcategoryId: string) => void;
  onBrandToggle: (brand: string) => void;
  onNicheChange: (nicheId: string) => void;
  onConditionChange: (condition: string) => void;
  onStatusToggle: (status: ListingStatusFilter) => void;
  onPriceRangeChange: (priceRange: PriceRangeFilter) => void;
  onCommunityContextChange: (context: CommunityContextFilter) => void;
};

export function DesktopFilterRail({
  open,
  filters,
  categories,
  niches,
  conditions,
  activeFilterCount,
  onClose,
  onClearAll,
  onCategoryChange,
  onSubcategoryChange,
  onBrandToggle,
  onNicheChange,
  onConditionChange,
  onStatusToggle,
  onPriceRangeChange,
  onCommunityContextChange,
}: DesktopFilterRailProps) {
  const activeTaxonomy =
    filters.categoryId === "all" ? null : getCategoryTaxonomy(filters.categoryId);

  return (
    <aside
      className={cn(
        "fixed bottom-0 top-0 z-40 hidden w-[360px] flex-col border-r border-border bg-background transition-[left,opacity] duration-300 lg:flex",
        open
          ? "left-[220px] opacity-100"
          : "pointer-events-none left-[-60px] opacity-0",
      )}
      aria-hidden={!open}
    >
      <div className="flex min-h-16 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-primary" aria-hidden="true" />
          <span className="text-sm font-semibold text-foreground">Filters</span>
          {activeFilterCount > 0 ? (
            <span className="grid size-6 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {activeFilterCount}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-card hover:text-foreground"
          aria-label="Close filters"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="border-b border-border px-4 py-3">
        <button
          type="button"
          onClick={onClearAll}
          disabled={activeFilterCount === 0}
          className="h-10 w-full rounded-lg bg-card text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          Clear all filters
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <FilterSection title="Category">
          <button
            type="button"
            onClick={() => onCategoryChange("all")}
            className={cn(
              "flex w-full items-center justify-between rounded-sm py-1 text-left text-sm font-semibold transition",
              filters.categoryId === "all"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span>All categories</span>
            <span className="text-xs text-muted-foreground">
              {getTotalCategoryCount(categories).toLocaleString()}
            </span>
          </button>
          {categoryTaxonomy.map((category) => {
            const active = filters.categoryId === category.id;

            return (
              <div key={category.id}>
                <button
                  type="button"
                  onClick={() => onCategoryChange(category.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-sm py-1 text-left text-sm font-semibold transition",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span>{category.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {getCategoryCount(categories, category.id).toLocaleString()}
                  </span>
                </button>
                {active ? (
                  <div className="ml-4 space-y-1 py-1">
                    {category.subcategories.map((subcategory) => (
                      <button
                        key={subcategory.label}
                        type="button"
                        onClick={() =>
                          onSubcategoryChange(
                            filters.subcategoryId === subcategory.label
                              ? "all"
                              : subcategory.label,
                          )
                        }
                        className={cn(
                          "flex w-full items-center justify-between rounded-sm px-2 py-1 text-left text-sm transition",
                          filters.subcategoryId === subcategory.label
                            ? "font-semibold text-primary"
                            : "text-muted-foreground hover:bg-card hover:text-foreground",
                        )}
                      >
                        <span>{subcategory.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {subcategory.count}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </FilterSection>

        {activeTaxonomy ? (
          <FilterSection title="Brands">
            <CheckboxList>
              {activeTaxonomy.brands.map((brand) => (
                <CheckboxRow
                  key={brand.label}
                  checked={filters.brandFilters.has(brand.label)}
                  label={brand.label}
                  meta={brand.count.toLocaleString()}
                  onChange={() => onBrandToggle(brand.label)}
                />
              ))}
            </CheckboxList>
          </FilterSection>
        ) : null}

        <FilterSection title="Niche">
          <Select
            aria-label="Niche"
            className="bg-card"
            value={filters.nicheId}
            onChange={(event) => onNicheChange(event.target.value)}
          >
            <option value="all">All niches</option>
            {niches.map((niche) => (
              <option key={niche.id} value={niche.id}>
                {niche.name}
              </option>
            ))}
          </Select>
        </FilterSection>

        <FilterSection title="Status">
          <CheckboxList>
            {statuses.map((status) => (
              <CheckboxRow
                key={status.value}
                checked={filters.statusFilters.has(status.value)}
                label={status.label}
                onChange={() => onStatusToggle(status.value)}
              />
            ))}
          </CheckboxList>
        </FilterSection>

        <FilterSection title="Condition">
          <CheckboxList>
            <CheckboxRow
              checked={filters.condition === "all"}
              label="Any condition"
              onChange={() => onConditionChange("all")}
            />
            {conditions.map((condition) => (
              <CheckboxRow
                key={condition}
                checked={filters.condition === condition}
                label={condition}
                onChange={() => onConditionChange(condition)}
              />
            ))}
          </CheckboxList>
        </FilterSection>

        <FilterSection title="Price">
          <PriceHistogramControl
            id="desktop-price-range"
            value={filters.priceRange}
            onChange={onPriceRangeChange}
          />
        </FilterSection>

        <FilterSection title="Show only">
          <CheckboxList>
            <CheckboxRow
              checked={filters.statusFilters.has("forTrade")}
              label="Open to trade"
              onChange={() => onStatusToggle("forTrade")}
            />
          </CheckboxList>
        </FilterSection>

        <FilterSection title="Community context">
          <Select
            aria-label="Community context"
            className="bg-card"
            value={filters.communityContext}
            onChange={(event) =>
              onCommunityContextChange(
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
        </FilterSection>
      </div>
    </aside>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-border px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
      </div>
      {children}
    </section>
  );
}

function CheckboxList({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

function CheckboxRow({
  checked,
  label,
  meta,
  onChange,
}: {
  checked: boolean;
  label: string;
  meta?: string;
  onChange: () => void;
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">
      <Checkbox checked={checked} onChange={onChange} className="bg-transparent" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {meta ? <span className="text-xs text-muted-foreground">{meta}</span> : null}
    </label>
  );
}
