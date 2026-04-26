import Image from "next/image";
import Link from "next/link";
import { ArrowRightLeft, Bookmark, MapPin } from "lucide-react";
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
    <Card variant="interactive" className="group overflow-hidden rounded-lg">
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
          className="absolute right-3 top-3 size-9"
          aria-label={isSaved ? "Saved listing" : "Save listing"}
        >
          <Bookmark className={cn("size-4", isSaved && "fill-current")} />
        </Button>
      </div>
      <div className="space-y-3 p-4">
        <ListingStatusBadges statuses={statuses} />
        <div>
          <h3 className="line-clamp-1 text-base font-semibold text-foreground">
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
        <div className="flex items-center justify-between gap-3">
          <ListingPrice price={price} mode={priceMode} />
          {location ? (
            <span className="inline-flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{location}</span>
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{sellerName}</span>
          {condition ? <span>{condition}</span> : null}
        </div>
        {communityContext.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {communityContext.map((label) => (
              <CommunityContextBadge key={label} label={label} />
            ))}
          </div>
        ) : null}
        {tradeSummary ? (
          <p className="flex items-start gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-xs leading-5 text-foreground">
            <ArrowRightLeft
              className="mt-0.5 size-3.5 shrink-0 text-accent"
              aria-hidden="true"
            />
            <span className="line-clamp-2">{tradeSummary}</span>
          </p>
        ) : null}
      </div>
    </Card>
  );
}
