"use client";

import { Select } from "@/components/ui/select";
import type { SortOption } from "@/lib/marketplace-filters";

type SortControlProps = {
  value?: SortOption;
  onChange?: (value: SortOption) => void;
};

export function SortControl({ value = "newest", onChange }: SortControlProps) {
  return (
    <Select
      aria-label="Sort listings"
      className="h-10 rounded-full bg-card font-semibold"
      value={value}
      onChange={(event) => onChange?.(event.target.value as SortOption)}
    >
      <option value="relevant">Most Relevant</option>
      <option value="newest">Newest first</option>
      <option value="price-low">Price: low to high</option>
      <option value="price-high">Price: high to low</option>
      <option value="trade-matches">Trade Matches</option>
    </Select>
  );
}
