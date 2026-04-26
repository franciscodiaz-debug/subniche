import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ListingCard } from "@/components/listing/listing-card";
import type { MockListing } from "@/data/mock";

type ListingCarouselSectionProps = {
  href?: string;
  listings: MockListing[];
  title: string;
};

export function ListingCarouselSection({
  href = "/market",
  listings,
  title,
}: ListingCarouselSectionProps) {
  const headingId = `${title.toLowerCase().replaceAll(" ", "-")}-heading`;

  return (
    <section className="space-y-3" aria-labelledby={headingId}>
      <div className="flex items-center justify-between gap-4">
        <h2
          id={headingId}
          className="text-base font-semibold text-foreground"
        >
          {title}
        </h2>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition hover:text-accent"
        >
          See more
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="grid auto-cols-[minmax(240px,1fr)] grid-flow-col gap-4 overflow-x-auto pb-2 md:auto-cols-[minmax(260px,1fr)]">
        {listings.map((listing) => (
          <ListingCard key={listing.id} {...listing} />
        ))}
      </div>
    </section>
  );
}
