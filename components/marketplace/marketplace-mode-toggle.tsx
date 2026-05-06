import Link from "next/link";
import type { MarketplaceMode } from "@/lib/marketplace-filters";
import { cn } from "@/lib/utils";

type MarketplaceModeToggleProps = {
  mode: MarketplaceMode;
};

export function MarketplaceModeToggle({ mode }: MarketplaceModeToggleProps) {
  return (
    <nav
      className="flex border-b border-border"
      aria-label="Marketplace mode"
    >
      <Link
        href="/market"
        className={cn(
          "min-w-20 border-b-2 px-2 pb-2.5 text-sm font-semibold transition sm:min-w-24 md:text-base",
          mode === "market"
            ? "border-accent text-foreground"
            : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
        )}
      >
        For Sale
      </Link>
      <Link
        href="/trade"
        className={cn(
          "min-w-20 border-b-2 px-2 pb-2.5 text-sm font-semibold transition sm:min-w-24 md:text-base",
          mode === "trade"
            ? "border-accent text-foreground"
            : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
        )}
      >
        Trade
      </Link>
    </nav>
  );
}
