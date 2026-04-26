/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Bookmark, MapPin } from "lucide-react";
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
    <Card variant="interactive" className="group overflow-hidden">
      <div className="relative aspect-[4/3] bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
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
          className="absolute right-3 top-3 size-9"
          aria-label={isSaved ? "Saved listing" : "Save listing"}
        >
          <Bookmark className={cn("size-4", isSaved && "fill-current")} />
        </Button>
      </div>
      <div className="space-y-3 p-4">
        <ListingStatusBadges statuses={statuses} />
        <div>
          <h3 className="line-clamp-2 text-base font-semibold text-foreground">
            {href ? (
              <Link href={href} className="hover:text-accent">
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
        <ListingPrice price={price} mode={priceMode} />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{sellerName}</span>
          {condition ? <span>{condition}</span> : null}
          {location ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3" aria-hidden="true" />
              {location}
            </span>
          ) : null}
        </div>
        {communityContext.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {communityContext.map((label) => (
              <CommunityContextBadge key={label} label={label} />
            ))}
          </div>
        ) : null}
        {tradeSummary ? (
          <p className="rounded-lg border border-info/25 bg-info/10 px-3 py-2 text-xs leading-5 text-info">
            {tradeSummary}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
