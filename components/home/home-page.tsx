import Link from "next/link";
import Image from "next/image";
import {
  Bookmark,
  Bell,
  CheckCircle2,
  Heart,
  MessageSquare,
  Repeat2,
  Search,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { ActionRequiredCard } from "@/components/home/action-required-card";
import { ListingCarouselSection } from "@/components/home/listing-carousel-section";
import { PageShell } from "@/components/layout/page-shell";
import { mockListings, mockProfiles } from "@/data/mock";
import { OnboardingPanel } from "@/components/home/onboarding-panel";

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
  const followedItemListings = mockListings.filter(
    (listing) => listing.isSaved || listing.statuses.wishlist,
  );
  const communityListings = mockListings.filter(
    (listing) => listing.communityContext && listing.communityContext.length > 0,
  );
  const justListed = [...mockListings].sort(
    (first, second) =>
      Date.parse(second.createdAt) - Date.parse(first.createdAt),
  );
  const profile = mockProfiles[0];
  const onboardingComplete = false;

  return (
    <PageShell className="space-y-8 pt-0 lg:pt-0">
      {onboardingComplete ? (
        <LoggedInHero profileName={profile?.displayName ?? "Kyle"} />
      ) : (
        <OnboardingPanel />
      )}

      <section className="space-y-3" aria-labelledby="action-required-heading">
        <div className="flex items-center justify-between gap-4">
          <h2
            id="action-required-heading"
            className="flex items-center gap-2 text-lg font-semibold text-foreground"
          >
            <Bell className="size-5 text-primary" aria-hidden="true" />
            <span>Action Required</span>
          </h2>
          <Link
            href="/inbox"
            className="text-sm font-semibold text-muted-foreground transition hover:text-accent"
          >
            View inbox
          </Link>
        </div>
        <div className="scrollbar-hide -mx-4 overflow-x-auto px-4 pb-2 lg:-mx-0 lg:px-0">
          <div className="flex w-max gap-4">
            <div className="w-[280px] shrink-0">
              <ActionRequiredCard
                actionLabel="Go to offer"
                actor="Julian Reed"
                avatarUrl="/mock/profiles/pedal-collector.jpg"
                href="/inbox?id=thread-tone-mesa"
                icon={Repeat2}
                meta="New Trade Offer"
                timestamp="12m ago"
                title="Julian offered a Twin Reverb"
                body="Julian offered a 1974 Fender Twin Reverb for your Gibson SG."
              />
            </div>
            <div className="w-[280px] shrink-0">
              <ActionRequiredCard
                actionLabel="Go to conversation"
                actor="Elena K."
                avatarUrl="/mock/profiles/mara-voss.jpg"
                href="/inbox?id=thread-mara-strat"
                icon={MessageSquare}
                meta="New Message"
                timestamp="45m ago"
                title="Elena asked about the Moog"
                body="Is the price negotiable on the vintage Moog?"
                tone="info"
              />
            </div>
            <div className="w-[280px] shrink-0">
              <ActionRequiredCard
                actionLabel="Go to offer"
                actor="Marcus Sterling"
                avatarUrl="/mock/profiles/kyle-k.jpg"
                href="/inbox?id=thread-tone-mesa"
                icon={CheckCircle2}
                meta="Accepted Offer"
                timestamp="2h ago"
                title="Marcus Sterling approved"
                body="Marcus Sterling approved your trade request for the Jazzmaster."
                tone="success"
              />
            </div>
            <div className="w-[280px] shrink-0">
              <ActionRequiredCard
                actionLabel="Go to offer"
                actor="Dave Wilson"
                avatarUrl="/mock/profiles/tone-archive.jpg"
                href="/inbox?id=thread-tone-mesa"
                icon={Repeat2}
                meta="New Counter Offer"
                timestamp="3h ago"
                title="Dave sent a counter"
                body="Dave countered with $250 + shipping for the Boss DD-500."
                tone="warning"
              />
            </div>
          </div>
        </div>
      </section>

      <ListingCarouselSection
        title="Most Recent Trade Matches"
        href="/trade"
        icon={Repeat2}
        listings={tradeListings.slice(0, 5)}
        cardContext="tradeMatches"
      />
      <ListingCarouselSection
        title="From Saved Searches"
        actionLabel="Manage"
        icon={Search}
        listings={savedSearchListings.slice(0, 5)}
      />
      <ListingCarouselSection
        title="From Items You Follow"
        actionLabel="Manage"
        href="/favorites"
        icon={Heart}
        listings={followedItemListings.slice(0, 5)}
      />
      <ListingCarouselSection
        title="From Collections and People You Follow"
        href="/collections"
        icon={Users}
        listings={collectionListings.slice(0, 5)}
      />
      <ListingCarouselSection
        title="Most Recent From Your Communities"
        actionLabel="See all communities"
        icon={Bookmark}
        listings={communityListings.slice(0, 5)}
      />

      <div className="mx-auto flex max-w-md flex-col items-center py-10 text-center">
        <div className="grid size-12 place-items-center rounded-full border border-border/60 bg-card/50">
          <CheckCircle2
            className="size-6 text-muted-foreground/60"
            aria-hidden="true"
          />
        </div>
        <h2 className="mt-3 text-base font-medium text-foreground">
          You are all caught up
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground/70">
          {profile?.displayName ?? "Your"} personalized feed ends here. Keep
          scrolling to explore broader market activity.
        </p>
      </div>

      <ListingCarouselSection
        title="Trending Listings"
        icon={TrendingUp}
        listings={mockListings.slice(1, 6)}
      />
      <ListingCarouselSection
        title="Just Listed"
        icon={Sparkles}
        listings={justListed.slice(0, 5)}
      />
    </PageShell>
  );
}

function LoggedInHero({ profileName }: { profileName: string }) {
  return (
    <section className="relative isolate -mx-4 overflow-hidden px-4 pb-10 pt-2 sm:-mx-6 sm:px-6 md:pb-12 md:pt-4 lg:-mx-10 lg:px-10">
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
          className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/30"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/90"
        />
      </div>
      <div className="relative max-w-3xl">
        <div className="flex items-center gap-2 text-lg font-semibold md:text-xl">
          <span className="text-primary">SN</span>
          <span className="text-muted-foreground/60">/</span>
          <span className="text-foreground">MusicGear</span>
        </div>
        <h1 className="mt-2 max-w-3xl text-balance text-3xl font-bold leading-tight tracking-normal text-foreground md:text-[2rem] md:leading-[1.15]">
          Where musicians{" "}
          <span className="text-primary">trade, sell, and collect.</span>
        </h1>
        <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
          Welcome back, {profileName} - fresh listings, trade matches, collection
          updates, and community context are waiting.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <HeroMetric tone="success" value="12,487" label="pieces of gear listed" />
          <HeroMetric tone="primary" value="42" label="gear communities" />
          <HeroMetric tone="info" value="3,214" label="musicians online" />
        </div>
      </div>
    </section>
  );
}

function HeroMetric({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "info" | "primary" | "success";
  value: string;
}) {
  const dotClassName = {
    info: "bg-info",
    primary: "bg-primary",
    success: "bg-success",
  }[tone];

  return (
    <span className="inline-flex items-center gap-2">
      <span className={`size-1.5 rounded-full ${dotClassName}`} />
      <span className="font-semibold text-foreground">{value}</span>
      {label}
    </span>
  );
}
