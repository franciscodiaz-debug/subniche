import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowRightLeft,
  Bookmark,
  Globe2,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CommunityContextBadge } from "@/components/community/community-context-badge";
import { ListingStatusBadges } from "@/components/listing/listing-status-badges";
import type { ListingCardProps } from "@/components/listing/types";
import { cn } from "@/lib/utils";

export function ListingCard({
  id,
  title,
  subtitle,
  imageUrl,
  price,
  priceMode,
  location,
  statuses,
  href,
  communityContext = [],
  tradeSummary,
  isSaved,
  marketContext,
  showStatusBadges = false,
  showTradeMatch = false,
}: ListingCardProps) {
  const marketplaceCard = marketContext === "market" || marketContext === "trade";
  const shouldShowTradeMatch = marketContext === "trade" || showTradeMatch;
  const tradeMatch = getTradeCardContext(id, title, tradeSummary, showTradeMatch);
  const hasTradeIndicator =
    statuses.forTrade ||
    priceMode === "cashPlusTrade" ||
    priceMode === "tradePreferred";

  return (
    <Card
      variant="interactive"
      data-testid="listing-card"
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-lg",
        marketplaceCard && "border-border/90 bg-card",
      )}
    >
      <div className="relative aspect-[4/3] bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="size-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="grid size-full place-items-center text-sm text-muted-foreground">
            Image pending
          </div>
        )}
        <Button
          variant={isSaved ? "primary" : "secondary"}
          size="icon"
          className={cn(
            "absolute right-2 top-2 size-8 rounded-full backdrop-blur-sm transition group-hover:opacity-100",
            isSaved
              ? "bg-primary text-primary-foreground opacity-100 hover:bg-primary/90"
              : "bg-background/85 text-muted-foreground opacity-100 hover:bg-background/90 hover:text-foreground sm:opacity-0",
          )}
          aria-label={isSaved ? "Saved listing" : "Save listing"}
        >
          <Bookmark className={cn("size-4", isSaved && "fill-current")} />
        </Button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
        <div className={cn(marketplaceCard && "space-y-0.5")}>
          <h3 className="line-clamp-1 text-sm font-semibold text-foreground transition group-hover:text-primary">
            {href ? (
              <Link href={href}>
                {title}
              </Link>
            ) : (
              title
            )}
          </h3>
          {subtitle ? (
            <p
              className={cn(
                "line-clamp-1 text-muted-foreground",
                marketplaceCard ? "text-xs" : "mt-1 text-sm",
              )}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              "flex min-w-0 items-center gap-1.5 font-semibold text-primary",
              marketplaceCard ? "text-sm" : "text-base",
            )}
          >
            <span>{priceMode === "wanted" ? "Wanted" : price ?? "Trade"}</span>
            {hasTradeIndicator ? (
              <ArrowRightLeft
                className="size-3.5 shrink-0 text-muted-foreground"
                aria-label="Open to trade"
              />
            ) : null}
          </div>
          {location ? (
            <span
              className={cn(
                "inline-flex min-w-0 items-center gap-1 pt-1 text-muted-foreground",
                marketplaceCard ? "text-[10px]" : "text-xs",
              )}
            >
              <MapPin
                className={cn("shrink-0", marketplaceCard ? "size-2.5" : "size-3")}
                aria-hidden="true"
              />
              <span className="truncate">{location}</span>
            </span>
          ) : null}
        </div>
        {!marketplaceCard && tradeSummary && !shouldShowTradeMatch ? (
          <div className="flex min-h-5 flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
            <span className="inline-flex min-w-0 items-center gap-1">
              <Search className="size-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{tradeSummary}</span>
            </span>
          </div>
        ) : null}
        <div className="mt-auto space-y-2 pt-1">
          {showStatusBadges ? <ListingStatusBadges statuses={statuses} /> : null}
          {communityContext.length > 0 ? (
            marketplaceCard ? (
              <MarketContextChips labels={communityContext} />
            ) : (
              <div className="flex min-h-6 flex-wrap gap-1.5 overflow-hidden">
                {communityContext.slice(0, 2).map((label) => (
                  <CommunityContextBadge
                    key={label}
                    label={label}
                    publicMarket={label === "Public Market"}
                    className="truncate text-[11px] font-medium"
                  />
                ))}
              </div>
            )
          ) : null}
          {shouldShowTradeMatch ? (
            <TradeMatchStrip
              label={tradeMatch.label}
              score={tradeMatch.score}
              tone={showTradeMatch ? "match" : tradeMatch.tone}
            />
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function TradeMatchStrip({
  label,
  score,
  tone,
}: {
  label: string;
  score: string;
  tone: "match" | "interest";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs",
        tone === "match"
          ? "border-primary/80 bg-primary/10 text-foreground"
          : "border-border bg-secondary/70 text-foreground",
      )}
    >
      {tone === "match" ? (
        <ArrowRightLeft className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
      ) : (
        <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] text-muted-foreground">
          {tone === "match" ? "Trade match for your" : "Interested in your"}
        </span>
        <span className="line-clamp-1 font-medium">{label}</span>
      </span>
      <span
        className={cn(
          "rounded px-1.5 py-0.5 text-[11px] font-semibold",
          tone === "match"
            ? "bg-success/15 text-success"
            : "bg-primary/15 text-primary",
        )}
      >
        {score}
      </span>
    </div>
  );
}

function MarketContextChips({ labels }: { labels: string[] }) {
  return (
    <div className="flex min-h-5 min-w-0 items-center gap-1 overflow-hidden">
      {labels.slice(0, 2).map((label, index) => (
        <MarketContextChip key={label} label={label} index={index} />
      ))}
    </div>
  );
}

function MarketContextChip({
  index,
  label,
}: {
  index: number;
  label: string;
}) {
  const publicMarket = label === "Public Market";
  const Icon = publicMarket ? Globe2 : Users;

  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground",
        index === 0 ? "max-w-[52%] shrink-0" : "flex-1",
      )}
    >
      <Icon
        className={cn(
          "size-3 shrink-0",
          publicMarket ? "text-primary" : "text-muted-foreground",
        )}
        aria-hidden="true"
      />
      <span className="truncate">{label}</span>
    </span>
  );
}

function getTradeCardContext(
  id: string,
  title: string,
  tradeSummary?: string,
  homeMatch?: boolean,
): { label: string; score: string; tone: "match" | "interest" } {
  if (homeMatch) {
    if (id === "listing-strat-pro-ii") {
      return { label: "Gibson Les Paul Goldtop", score: "9.0", tone: "match" };
    }

    if (id === "listing-prs-custom-24") {
      return { label: "Fender Telecaster", score: "9.2", tone: "match" };
    }

    if (id === "listing-mesa-dual-rectifier") {
      return {
        label: "Fender '65 Twin Reverb Reissue",
        score: "9.0",
        tone: "match",
      };
    }
  }

  if (id === "listing-mesa-dual-rectifier") {
    return {
      label: "Fender '65 Twin Reverb Reissue",
      score: "9.0",
      tone: "match",
    };
  }

  if (id === "listing-les-paul-goldtop") {
    return {
      label: "Fender American Pro II Stratocaster",
      score: "9.0",
      tone: "match",
    };
  }

  if (id === "listing-taylor-814ce") {
    return {
      label: "Martin D-28 Acoustic",
      score: "8.4",
      tone: "match",
    };
  }

  if (id === "listing-fender-twin") {
    return {
      label: "Mesa Boogie Dual Rectifier",
      score: "7.6",
      tone: "match",
    };
  }

  if (id === "listing-eventide-h9-max") {
    return {
      label: "Strymon BigSky Reverb",
      score: "8.5",
      tone: "interest",
    };
  }

  if (id === "listing-strat-pro-ii" || id === "listing-prs-custom-24") {
    return {
      label: "Fender American Pro II Stratocaster",
      score: id === "listing-strat-pro-ii" ? "8.5" : "7.0",
      tone: "interest",
    };
  }

  if (id === "listing-gibson-j45-standard") {
    return {
      label: "Martin D-28 Acoustic",
      score: "6.5",
      tone: "interest",
    };
  }

  if (id === "listing-marshall-jcm800-2203") {
    return {
      label: "Mesa Boogie Dual Rectifier",
      score: "5.5",
      tone: "interest",
    };
  }

  if (id === "listing-gretsch-6120") {
    return {
      label: "Fender American Pro II Stratocaster",
      score: "5.0",
      tone: "interest",
    };
  }

  return {
    label: tradeSummary ?? title,
    score: statusesScore(id),
    tone: "interest",
  };
}

function statusesScore(id: string) {
  if (id.includes("taylor")) {
    return "8.4";
  }
  if (id.includes("bigsky")) {
    return "6.5";
  }
  return "6.0";
}
