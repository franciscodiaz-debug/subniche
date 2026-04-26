import Link from "next/link";
import Image from "next/image";
import {
  Bell,
  CheckCircle2,
  MessageSquare,
  Repeat2,
  Search,
} from "lucide-react";
import { ActionRequiredCard } from "@/components/home/action-required-card";
import { ListingCarouselSection } from "@/components/home/listing-carousel-section";
import { PageShell } from "@/components/layout/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  mockCommunities,
  mockListings,
  mockProfiles,
} from "@/data/mock";

export function HomePage() {
  const tradeListings = mockListings.filter(
    (listing) => listing.statuses.forTrade,
  );
  const savedSearchListings = mockListings.filter(
    (listing) => listing.savedSearchMatch,
  );
  const collectionListings = mockListings.filter(
    (listing) => listing.statuses.inCollection,
  );
  const communityListings = mockListings.filter(
    (listing) => listing.communityContext && listing.communityContext.length > 0,
  );
  const justListed = [...mockListings].sort(
    (first, second) =>
      Date.parse(second.createdAt) - Date.parse(first.createdAt),
  );
  const profile = mockProfiles[0];

  return (
    <PageShell className="space-y-8">
      <section className="relative isolate -mx-4 overflow-hidden px-4 py-8 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/hero-guitar.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/25"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-background/35 via-transparent to-background"
          />
        </div>
        <div className="relative max-w-3xl">
          <div className="text-lg font-semibold">
            <span className="text-primary">SN</span>
            <span className="mx-2 text-muted-foreground/60">/</span>
            <span className="text-foreground">MusicGear</span>
          </div>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-foreground md:text-5xl">
            Where musicians{" "}
            <span className="text-primary">trade, sell, and collect.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
            Welcome back, {profile?.displayName ?? "Kyle"} - fresh listings,
            trade matches, collection updates, and community context are waiting.
          </p>
          <div className="mt-6 flex flex-wrap gap-5 text-sm text-muted-foreground">
            <HeroMetric value="12,487" label="pieces of gear listed" />
            <HeroMetric value="42" label="gear communities" />
            <HeroMetric value="3,214" label="musicians online" />
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/market"
              className={buttonVariants({ variant: "primary" })}
            >
              <Search className="size-4" aria-hidden="true" />
              Browse market
            </Link>
            <Link
              href="/trade"
              className={buttonVariants({ variant: "secondary" })}
            >
              <Repeat2 className="size-4" aria-hidden="true" />
              Review trades
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="action-required-heading">
        <div className="flex items-center justify-between gap-4">
          <h2
            id="action-required-heading"
            className="text-base font-semibold text-foreground"
          >
            Action Required
          </h2>
          <Link
            href="/inbox"
            className="text-sm font-semibold text-muted-foreground transition hover:text-accent"
          >
            View inbox
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ActionRequiredCard
            icon={Repeat2}
            meta="New Trade Offer"
            title="Julian offered a Twin Reverb"
            body="Review the proposed swap for your Mesa Dual Rectifier."
          />
          <ActionRequiredCard
            icon={MessageSquare}
            meta="New Message"
            title="Mara asked about pickup"
            body="Clarify local pickup timing for the Stratocaster listing."
            tone="info"
          />
          <ActionRequiredCard
            icon={CheckCircle2}
            meta="Accepted Offer"
            title="Tone Archive approved"
            body="Confirm next steps for the clean Fender amp discussion."
            tone="success"
          />
          <ActionRequiredCard
            icon={Bell}
            meta="Saved Search"
            title="PRS under $4k"
            body="A new saved-search match is waiting in the market."
            tone="warning"
          />
        </div>
      </section>

      <ListingCarouselSection
        title="Most Recent Trade Matches"
        href="/trade"
        listings={tradeListings.slice(0, 5)}
      />
      <ListingCarouselSection
        title="From Saved Searches"
        listings={savedSearchListings.slice(0, 5)}
      />
      <ListingCarouselSection
        title="From Collections and People You Follow"
        href="/collections"
        listings={collectionListings.slice(0, 5)}
      />
      <ListingCarouselSection
        title="Most Recent From Your Communities"
        listings={communityListings.slice(0, 5)}
      />

      <Card className="mx-auto max-w-md p-5 text-center">
        <CheckCircle2
          className="mx-auto size-8 text-success"
          aria-hidden="true"
        />
        <h2 className="mt-3 text-base font-semibold text-foreground">
          You are all caught up
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {profile?.displayName ?? "Your"} personalized feed ends here. Keep
          scrolling to explore broader market activity.
        </p>
      </Card>

      <ListingCarouselSection
        title="Trending Listings"
        listings={mockListings.slice(1, 6)}
      />
      <ListingCarouselSection
        title="Just Listed"
        listings={justListed.slice(0, 5)}
      />

      <section className="grid gap-4 md:grid-cols-3">
        {mockCommunities.slice(0, 3).map((community) => (
          <Card key={community.id} className="p-4">
            <div className="text-xs font-semibold uppercase text-accent">
              Community
            </div>
            <h2 className="mt-2 text-base font-semibold text-foreground">
              {community.name}
            </h2>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {community.description}
            </p>
            <div className="mt-4 text-xs text-muted-foreground">
              {community.memberCount} / {community.listingCount} listings
            </div>
          </Card>
        ))}
      </section>
    </PageShell>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="size-1.5 rounded-full bg-accent" />
      <span className="font-semibold text-foreground">{value}</span>
      {label}
    </span>
  );
}
