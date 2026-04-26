"use client";

import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import type { MockCategory, MockNiche } from "@/data/mock/types";
import { cn } from "@/lib/utils";
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
  { label: "Any price", value: "all" },
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
  onNicheChange,
  onConditionChange,
  onStatusToggle,
  onPriceRangeChange,
  onCommunityContextChange,
}: DesktopFilterRailProps) {
  return (
    <aside
      className={cn(
        "fixed bottom-0 top-0 z-40 hidden w-[280px] flex-col border-r border-border bg-background transition-[left,opacity] duration-300 lg:flex",
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
              {categories.reduce((total, category) => total + category.itemCount, 0)}
            </span>
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-sm py-1 text-left text-sm font-semibold transition",
                filters.categoryId === category.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span>{category.name}</span>
              <span className="text-xs text-muted-foreground">
                {category.itemCount}
              </span>
            </button>
          ))}
        </FilterSection>

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
          <Select
            aria-label="Price"
            className="bg-card"
            value={filters.priceRange}
            onChange={(event) =>
              onPriceRangeChange(event.target.value as PriceRangeFilter)
            }
          >
            {priceRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </Select>
          <div className="mt-4 flex h-16 items-end gap-1 px-4">
            {[20, 34, 45, 58, 72, 82, 92, 74, 58, 42, 28, 18].map(
              (height, index) => (
                <span
                  key={index}
                  className="flex-1 rounded-t bg-primary/70"
                  style={{ height: `${height}%` }}
                />
              ),
            )}
          </div>
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
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">
      <Checkbox
        checked={checked}
        onChange={onChange}
        className="bg-transparent"
      />
      <span>{label}</span>
    </label>
  );
}
