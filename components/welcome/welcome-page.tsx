import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  Boxes,
  CheckCircle2,
  FolderHeart,
  Guitar,
  MessageCircle,
  Repeat2,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  TrendingUp,
  UserPlus,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { mockCollections, mockListings, mockProfiles } from "@/data/mock";
import type { MockCollection, MockListing, MockProfile } from "@/data/mock/types";
import { cn } from "@/lib/utils";

const stats = [
  { value: "12,487", label: "pieces of gear listed", tone: "bg-success" },
  { value: "42", label: "gear communities", tone: "bg-accent" },
  { value: "3,214", label: "musicians online", tone: "bg-info" },
];

const reasons = [
  {
    title: "Your niche, your people",
    body: "Trade, sell, and collect with others as obsessed as you are.",
    icon: Guitar,
  },
  {
    title: "Trades, not transactions",
    body: "Specific trade interests keep offers useful before money enters the conversation.",
    icon: Repeat2,
  },
  {
    title: "Showcase your collection",
    body: "Show what you are into and build context around the pieces you care about.",
    icon: Boxes,
  },
];

const interstitials = [
  {
    eyebrow: "Got gear to move?",
    title: "The hard part should be letting gear go, not listing it.",
    body: "Start with a photo and a few details. SubNiche helps preserve the context buyers and traders need.",
    icon: Tag,
    cta: "Start listing",
    href: "/add-item",
  },
  {
    eyebrow: "Native trade matching",
    title: "Trade like never before.",
    body: "Set specific trade interests for your items so the marketplace can surface better matches.",
    icon: Repeat2,
    cta: "Start trading",
    href: "/trade",
  },
  {
    eyebrow: "More signal, less noise",
    title: "You are specific. We are too.",
    body: "Better categories, better filters, and better listing context for when details matter.",
    icon: Bookmark,
    cta: "Explore listings",
    href: "/market",
  },
  {
    eyebrow: "Trust is built in",
    title: "More than just a listing.",
    body: "See shared collections, trade interests, profiles, and community reputation before reaching out.",
    icon: ShieldCheck,
    cta: "Build your profile",
    href: "/profile",
  },
  {
    eyebrow: "Find your people",
    title: "Explore collections and talk shop with musicians who get it.",
    body: "Curate your own collections, publish to communities, and show what you are about.",
    icon: UsersRound,
    cta: "Explore communities",
    href: "/communities",
  },
];

export function WelcomePage() {
  const trendingListings = mockListings.slice(0, 4);
  const justListed = [...mockListings]
    .sort(
      (first, second) =>
        Date.parse(second.createdAt) - Date.parse(first.createdAt),
    )
    .slice(0, 4);
  const staffPicks = mockListings.slice(4, 8);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[96rem] px-4 py-5 sm:px-6 lg:px-10">
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full max-w-2xl">
            <span className="sr-only">Search SubNiche</span>
            <Search
              className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-accent"
              aria-hidden="true"
            />
            <input
              className="h-12 w-full rounded-lg border border-border bg-surface px-4 pr-12 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
              placeholder="Search gear, musicians, communities..."
            />
          </label>
          <nav className="flex items-center gap-3" aria-label="Welcome actions">
            <Link
              href="/profile"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Sign in
            </Link>
            <Link
              href="/profile"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Sign up
            </Link>
          </nav>
        </header>

        <section className="relative isolate -mx-4 overflow-hidden px-5 py-8 sm:-mx-6 sm:px-8 lg:-mx-10 lg:px-10 lg:py-10">
          <div className="absolute inset-0">
            <Image
              src="/hero-guitar.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/25" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/35 via-transparent to-background" />
          </div>

          <div className="relative">
            <div className="max-w-5xl">
              <div className="flex flex-wrap items-center gap-3 text-2xl font-semibold text-foreground sm:text-3xl">
                <span className="text-accent">SN</span>
                <span className="text-muted-foreground">/</span>
                <span>MusicGear</span>
              </div>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                Where musicians{" "}
                <span className="text-accent">trade, sell, and collect.</span>
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
                Guitars, amps, pedals, synths, and the rare finds in between,
                for people who go deep on their gear.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/profile"
                  className={buttonVariants({ variant: "primary", size: "lg" })}
                >
                  Join free
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  {stats.map((stat) => (
                    <span
                      key={stat.label}
                      className="inline-flex items-center gap-2"
                    >
                      <span className={cn("size-2 rounded-full", stat.tone)} />
                      <span className="font-semibold text-foreground">
                        {stat.value}
                      </span>
                      {stat.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <section
              aria-labelledby="why-subniche-heading"
              className="mt-12 space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="h-6 w-1 rounded-full bg-accent" />
                <h2
                  id="why-subniche-heading"
                  className="text-xs font-semibold uppercase text-muted-foreground"
                >
                  Why SN / MusicGear?
                </h2>
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                {reasons.map((reason, index) => (
                  <ReasonCard key={reason.title} index={index + 1} {...reason} />
                ))}
              </div>
            </section>
          </div>
        </section>

        <main className="space-y-10 py-10">
          <ListingRow
            title="Trending Listings"
            icon={TrendingUp}
            href="/market"
            listings={trendingListings}
          />
          <InterstitialCard {...interstitials[0]} />
          <ListingRow
            title="Just Listed"
            icon={Sparkles}
            href="/market"
            listings={justListed}
            compactMeta
          />
          <InterstitialCard {...interstitials[1]} />
          <CollectionRow collections={mockCollections} />
          <InterstitialCard {...interstitials[2]} />
          <ProfileRow profiles={mockProfiles} />
          <InterstitialCard {...interstitials[3]} />
          <ListingRow
            title="Staff Picks"
            icon={CheckCircle2}
            href="/market"
            listings={staffPicks}
            staffPick
          />
          <InterstitialCard {...interstitials[4]} />
        </main>
      </div>
    </div>
  );
}

function ReasonCard({
  body,
  icon: Icon,
  index,
  title,
}: {
  body: string;
  icon: LucideIcon;
  index: number;
  title: string;
}) {
  return (
    <Card className="rounded-lg bg-surface/90 p-5">
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-11 place-items-center rounded-lg border border-accent/45 bg-accent/10 text-accent">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span className="text-sm font-semibold text-muted-foreground">
          {String(index).padStart(2, "0")}
        </span>
      </div>
      <h3 className="mt-8 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>
    </Card>
  );
}

function SectionHeader({
  href,
  id,
  icon: Icon,
  title,
}: {
  href: string;
  id: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="flex min-w-0 items-center gap-3 text-xl font-semibold text-foreground">
        <Icon className="size-5 shrink-0 text-accent" aria-hidden="true" />
        <span id={id} className="truncate">
          {title}
        </span>
      </h2>
      <Link
        href={href}
        className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-accent"
      >
        See more
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

function ListingRow({
  compactMeta,
  href,
  icon,
  listings,
  staffPick,
  title,
}: {
  compactMeta?: boolean;
  href: string;
  icon: LucideIcon;
  listings: MockListing[];
  staffPick?: boolean;
  title: string;
}) {
  const headingId = `${title.toLowerCase().replaceAll(" ", "-")}-heading`;

  return (
    <section aria-labelledby={headingId}>
      <SectionHeader href={href} id={headingId} icon={icon} title={title} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {listings.map((listing, index) => (
          <WelcomeListingCard
            key={listing.id}
            listing={listing}
            compactMeta={compactMeta}
            staffPick={staffPick ? staffPickLabels[index] : undefined}
          />
        ))}
      </div>
    </section>
  );
}

const staffPickLabels = [
  "Editor's pick",
  "Rare find",
  "Curator pick",
  "Staff favorite",
];

function WelcomeListingCard({
  compactMeta,
  listing,
  staffPick,
}: {
  compactMeta?: boolean;
  listing: MockListing;
  staffPick?: string;
}) {
  return (
    <div>
      <Link href={listing.href ?? "/market"} className="group block">
        <Card
          variant="interactive"
          className="h-full overflow-hidden rounded-lg bg-surface"
        >
          <div className="relative aspect-[4/3] bg-muted">
            {listing.imageUrl ? (
              <Image
                src={listing.imageUrl}
                alt={listing.title}
                fill
                sizes="(min-width: 1280px) 20vw, (min-width: 640px) 45vw, 90vw"
                className="object-cover transition duration-300 group-hover:scale-[1.02]"
              />
            ) : null}
          </div>
          <div className="p-4">
            <h3 className="line-clamp-1 text-base font-semibold text-foreground">
              {listing.title}
            </h3>
            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
              {compactMeta
                ? `Listed ${formatRelativeListingTime(listing.createdAt)}`
                : listing.subtitle}
            </p>
            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="text-lg font-semibold text-accent">
                {listing.price}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {listing.location}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {(listing.communityContext ?? []).slice(0, 2).map((context) => (
                <Badge key={context} variant="secondary">
                  {context}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      </Link>
      {staffPick ? (
        <div className="mt-3 flex items-center gap-2 text-sm text-accent">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          {staffPick}
        </div>
      ) : null}
    </div>
  );
}

function formatRelativeListingTime(createdAt: string) {
  const days = Math.max(
    1,
    Math.round(
      (Date.parse("2026-04-26T12:00:00.000Z") - Date.parse(createdAt)) /
        86_400_000,
    ),
  );

  if (days < 7) {
    return `${days}d ago`;
  }

  return `${Math.round(days / 7)}w ago`;
}

function InterstitialCard({
  body,
  cta,
  eyebrow,
  href,
  icon: Icon,
  title,
}: {
  body: string;
  cta: string;
  eyebrow: string;
  href: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <Card className="rounded-lg p-5 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-5">
          <span className="grid size-14 shrink-0 place-items-center rounded-lg border border-accent/35 bg-accent/10 text-accent">
            <Icon className="size-6" aria-hidden="true" />
          </span>
          <div>
            <div className="text-xs font-semibold uppercase text-accent">
              {eyebrow}
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              {title}
            </h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">
              {body}
            </p>
          </div>
        </div>
        <Link
          href={href}
          className={buttonVariants({
            variant: "primary",
            size: "lg",
            className: "shrink-0",
          })}
        >
          {cta}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
}

function CollectionRow({ collections }: { collections: MockCollection[] }) {
  return (
    <section aria-labelledby="featured-collections-heading">
      <SectionHeader
        href="/collections"
        id="featured-collections-heading"
        icon={FolderHeart}
        title="Featured Collections"
      />
      <div className="grid gap-4 md:grid-cols-3">
        {collections.map((collection) => (
          <Link key={collection.id} href={collection.href} className="group block">
            <Card
              variant="interactive"
              className="h-full overflow-hidden rounded-lg bg-surface"
            >
              <div className="grid aspect-[16/9] grid-cols-2 gap-px bg-border">
                {collection.images.slice(0, 4).map((image, index) => (
                  <div key={`${collection.id}-${image}-${index}`} className="relative bg-muted">
                    <Image
                      src={image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 18vw, 45vw"
                      className="object-cover transition duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                ))}
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-foreground">
                  {collection.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {collection.description}
                </p>
                <div className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {collection.itemCount}
                  </span>{" "}
                  items
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProfileRow({ profiles }: { profiles: MockProfile[] }) {
  return (
    <section aria-labelledby="featured-users-heading">
      <SectionHeader
        href="/profile"
        id="featured-users-heading"
        icon={UserPlus}
        title="Featured Users"
      />
      <div className="grid gap-4 md:grid-cols-3">
        {profiles.map((profile) => (
          <Card key={profile.id} className="rounded-lg p-5">
            <div className="flex items-center gap-4">
              <div className="relative size-14 overflow-hidden rounded-full border border-border bg-muted">
                {profile.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0">
                <h3 className="flex items-center gap-2 truncate text-lg font-semibold text-foreground">
                  {profile.displayName}
                  <CheckCircle2
                    className="size-4 shrink-0 text-accent"
                    aria-label="Verified"
                  />
                </h3>
                <p className="text-sm text-muted-foreground">
                  {profile.location}
                </p>
              </div>
            </div>
            <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {profile.bio}
            </p>
            <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-4">
              <div className="flex gap-5 text-sm text-muted-foreground">
                <span>
                  <span className="block font-semibold text-foreground">
                    {profile.stats[1]?.value ?? "0"}
                  </span>
                  items
                </span>
                <span>
                  <span className="block font-semibold text-foreground">
                    {profile.stats[3]?.value ?? "0"}
                  </span>
                  communities
                </span>
              </div>
              <Link
                href="/profile"
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                Follow
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
