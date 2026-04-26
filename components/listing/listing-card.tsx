import Image from "next/image";
import Link from "next/link";
import { ArrowRightLeft, Bookmark, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CommunityContextBadge } from "@/components/community/community-context-badge";
import { ListingPrice } from "@/components/listing/listing-price";
import { ListingStatusBadges } from "@/components/listing/listing-status-badges";
import type { ListingCardProps } from "@/components/listing/types";
import { cn } from "@/lib/utils";

export function ListingCard({
  title,
  subtitle,
  imageUrl,
  price,
  priceMode,
  location,
  sellerName,
  statuses,
  condition,
  href,
  communityContext = [],
  tradeSummary,
  isSaved,
}: ListingCardProps) {
  return (
    <Card
      variant="interactive"
      className="group flex min-h-full flex-col overflow-hidden rounded-lg"
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
              : "bg-background/80 text-muted-foreground opacity-0 hover:bg-background/90 hover:text-foreground",
          )}
          aria-label={isSaved ? "Saved listing" : "Save listing"}
        >
          <Bookmark className={cn("size-4", isSaved && "fill-current")} />
        </Button>
      </div>
      <div className="flex flex-1 flex-col space-y-2 p-3">
        <div>
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
            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className="flex items-end justify-between gap-3">
          <ListingPrice
            price={price}
            mode={priceMode}
            className="min-w-0 text-base"
          />
          {location ? (
            <span className="inline-flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{location}</span>
            </span>
          ) : null}
        </div>
        <div className="flex min-h-5 flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
          {tradeSummary ? (
            <span className="inline-flex min-w-0 items-center gap-1">
              <Search className="size-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{tradeSummary}</span>
            </span>
          ) : (
            <>
              <span>{sellerName}</span>
              {condition ? <span>{condition}</span> : null}
            </>
          )}
        </div>
        <div className="mt-auto space-y-2 pt-1">
          <ListingStatusBadges statuses={statuses} />
          {communityContext.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {communityContext.map((label) => (
                <CommunityContextBadge key={label} label={label} />
              ))}
            </div>
          ) : null}
          {statuses.forTrade ? (
            <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowRightLeft className="size-3.5" aria-hidden="true" />
              Trade open
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
