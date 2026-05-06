import { SlidersHorizontal } from "lucide-react";
import { FilterPanel } from "@/components/marketplace/filter-panel";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { MockCategory, MockNiche } from "@/data/mock/types";
import type {
  CommunityContextFilter,
  ListingStatusFilter,
  MarketplaceFilters,
  PriceRangeFilter,
} from "@/lib/marketplace-filters";

type MobileFilterSheetProps = {
  filters: MarketplaceFilters;
  categories: MockCategory[];
  niches: MockNiche[];
  conditions: string[];
  activeFilterCount?: number;
  onCategoryChange: (categoryId: string) => void;
  onSubcategoryChange: (subcategoryId: string) => void;
  onBrandToggle: (brand: string) => void;
  onNicheChange: (nicheId: string) => void;
  onConditionChange: (condition: string) => void;
  onStatusToggle: (status: ListingStatusFilter) => void;
  onPriceRangeChange: (priceRange: PriceRangeFilter) => void;
  onCommunityContextChange: (context: CommunityContextFilter) => void;
};

export function MobileFilterSheet({
  activeFilterCount = 0,
  ...props
}: MobileFilterSheetProps) {
  return (
    <Sheet>
      <SheetTrigger className={buttonVariants({ variant: "secondary" })}>
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        Filters
        {activeFilterCount > 0 ? (
          <span className="grid size-5 place-items-center rounded-full bg-accent text-xs font-bold text-primary-foreground">
            {activeFilterCount}
          </span>
        ) : null}
      </SheetTrigger>
      <SheetContent
        aria-label="Filters"
        className="left-0 right-auto overflow-y-auto border-l-0 border-r sm:max-w-xl"
      >
        <SheetHeader className="mb-5">
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>
            Narrow the music gear market by status, category, price, condition,
            and community context.
          </SheetDescription>
        </SheetHeader>
        <FilterPanel {...props} />
      </SheetContent>
    </Sheet>
  );
}
