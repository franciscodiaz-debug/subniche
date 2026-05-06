import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { ListingCard } from "@/components/listing/listing-card";
import type { MockListing } from "@/data/mock";

type ListingCarouselSectionProps = {
  actionLabel?: string;
  cardContext?: "default" | "tradeMatches";
  href?: string;
  icon?: LucideIcon;
  listings: MockListing[];
  title: string;
};

export function ListingCarouselSection({
  actionLabel = "See more",
  cardContext = "default",
  href = "/market",
  icon: Icon,
  listings,
  title,
}: ListingCarouselSectionProps) {
  const headingId = `${title.toLowerCase().replaceAll(" ", "-")}-heading`;

  return (
    <section className="space-y-4" aria-labelledby={headingId}>
      <div className="flex items-center justify-between gap-4">
        <h2
          id={headingId}
          className="flex min-w-0 items-center gap-2 text-lg font-semibold text-foreground"
        >
          {Icon ? (
            <Icon className="size-5 shrink-0 text-primary" aria-hidden="true" />
          ) : null}
          <span className="min-w-0 text-balance">{title}</span>
        </h2>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition hover:text-accent"
        >
          {actionLabel}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="scrollbar-hide -mx-4 grid auto-cols-[minmax(240px,78vw)] grid-flow-col gap-4 overflow-x-auto px-4 pb-2 sm:auto-cols-[280px] lg:-mx-0 lg:auto-cols-[260px] lg:px-0 2xl:auto-cols-[280px]">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            {...listing}
            showTradeMatch={cardContext === "tradeMatches"}
          />
        ))}
      </div>
    </section>
  );
}
