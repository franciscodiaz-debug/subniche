import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import type { MarketplaceMode } from "@/lib/marketplace-filters";
import { cn } from "@/lib/utils";

type MarketplaceModeToggleProps = {
  mode: MarketplaceMode;
};

export function MarketplaceModeToggle({ mode }: MarketplaceModeToggleProps) {
  return (
    <div className="grid grid-cols-2 rounded-lg border border-border bg-background p-1">
      <Link
        href="/market"
        className={cn(
          buttonVariants({
            variant: mode === "market" ? "primary" : "ghost",
            size: "sm",
          }),
          "rounded-md",
        )}
      >
        Market
      </Link>
      <Link
        href="/trade"
        className={cn(
          buttonVariants({
            variant: mode === "trade" ? "primary" : "ghost",
            size: "sm",
          }),
          "rounded-md",
        )}
      >
        Trade
      </Link>
    </div>
  );
}
