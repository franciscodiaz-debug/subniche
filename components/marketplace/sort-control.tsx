import { Select } from "@/components/ui/select";

export function SortControl() {
  return (
    <Select aria-label="Sort listings" defaultValue="recent">
      <option value="recent">Newest first</option>
      <option value="price-low">Price: low to high</option>
      <option value="price-high">Price: high to low</option>
      <option value="trade-fit">Best trade fit</option>
    </Select>
  );
}
