import type { ListingPriceMode } from "@/components/listing/types";
import { cn } from "@/lib/utils";

type ListingPriceProps = {
  price?: string;
  mode?: ListingPriceMode;
  className?: string;
};

const modeCopy: Record<ListingPriceMode, string> = {
  cash: "Cash price",
  tradePreferred: "Trade preferred",
  cashPlusTrade: "Cash + trade",
  wanted: "Wanted",
};

export function ListingPrice({
  price,
  mode = "cash",
  className,
}: ListingPriceProps) {
  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className="text-lg font-semibold text-foreground">
        {mode === "wanted" ? "Wanted" : price ?? "Trade"}
      </span>
      <span className="text-xs font-medium uppercase text-muted-foreground">
        {modeCopy[mode]}
      </span>
    </div>
  );
}
