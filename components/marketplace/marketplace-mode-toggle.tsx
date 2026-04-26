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
          "min-w-28 border-b-2 px-2 pb-4 text-3xl font-semibold transition sm:min-w-40 md:text-4xl",
          mode === "market"
            ? "border-accent text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground",
        )}
      >
        For Sale
      </Link>
      <Link
        href="/trade"
        className={cn(
          "min-w-28 border-b-2 px-2 pb-4 text-3xl font-semibold transition sm:min-w-40 md:text-4xl",
          mode === "trade"
            ? "border-accent text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground",
        )}
      >
        Trade
      </Link>
    </nav>
  );
}
