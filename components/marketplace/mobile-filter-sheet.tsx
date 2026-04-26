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
  onCategoryChange: (categoryId: string) => void;
  onNicheChange: (nicheId: string) => void;
  onConditionChange: (condition: string) => void;
  onStatusToggle: (status: ListingStatusFilter) => void;
  onPriceRangeChange: (priceRange: PriceRangeFilter) => void;
  onCommunityContextChange: (context: CommunityContextFilter) => void;
};

export function MobileFilterSheet(props: MobileFilterSheetProps) {
  return (
    <Sheet>
      <SheetTrigger className={buttonVariants({ variant: "secondary" })}>
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        Filters
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
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
