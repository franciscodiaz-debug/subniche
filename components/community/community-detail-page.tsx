import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Flame,
  MessageCircle,
  Plus,
  Share2,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { ListingCard } from "@/components/listing/listing-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type {
  MockCommunity,
  MockCommunityMembership,
  MockListing,
  MockProfile,
} from "@/data/mock/types";
import type { MockCommunityThread } from "@/components/community/community-detail-data";

type CommunityDetailPageProps = {
  community: MockCommunity;
  listings: MockListing[];
  members: Array<{
    membership: MockCommunityMembership;
    profile?: MockProfile;
  }>;
  threads: MockCommunityThread[];
};

export function CommunityDetailPage({
  community,
  listings,
  members,
  threads,
}: CommunityDetailPageProps) {
  const heroImage = listings[0]?.imageUrl ?? "/mock/listings/fender-twin-reverb.jpg";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <Link
        href="/communities"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to communities
      </Link>

      <section className="mt-6 overflow-hidden rounded-lg border border-border bg-surface">
        <div className="relative min-h-64">
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 80vw, 100vw"
            className="object-cover opacity-28"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/45" />
          <div className="relative p-6 lg:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default">{community.visibility}</Badge>
                  <Badge variant="outline">SN / MusicGear</Badge>
                  {members.some((item) => item.membership.role !== "member") ? (
                    <Badge variant="info">
                      <Shield className="size-3" aria-hidden="true" />
                      Moderated
                    </Badge>
                  ) : null}
                </div>
                <h1 className="mt-5 text-4xl font-semibold text-foreground">
                  {community.name}
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                  {community.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={buttonVariants({ variant: "secondary", size: "sm" })}
                >
                  <Share2 className="size-4" aria-hidden="true" />
                  Share
                </button>
                <button
                  type="button"
                  className={buttonVariants({ variant: "primary", size: "sm" })}
                >
                  Join community
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Metric label="Members" value={community.memberCount} />
              <Metric label="Threads" value={threads.length.toString()} />
              <Metric label="Listings" value={community.listingCount} />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-8">
          <section>
            <SectionHeader
              title="Community threads"
              href={`/communities/${community.slug}/threads/${threads[0]?.id ?? "thread"}`}
              cta="Open latest"
            />
            <div className="space-y-3">
              {threads.map((thread) => (
                <ThreadRow
                  key={thread.id}
                  communitySlug={community.slug}
                  thread={thread}
                />
              ))}
            </div>
          </section>

          <section>
            <SectionHeader title="Community marketplace" href="/market" cta="View market" />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {listings.slice(0, 6).map((listing) => (
                <ListingCard key={listing.id} {...listing} />
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <Card className="rounded-lg p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-foreground">
                Active members
              </h2>
              <Link
                href={`/communities/${community.slug}/members`}
                className="text-sm font-semibold text-accent"
              >
                See all
              </Link>
            </div>
            <div className="mt-5 space-y-3">
              {members.slice(0, 4).map(({ membership, profile }) => (
                <MemberMiniRow
                  key={membership.id}
                  profile={profile}
                  role={membership.role}
                />
              ))}
            </div>
          </Card>
          <Card className="rounded-lg p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="size-4 text-accent" aria-hidden="true" />
              Community signal
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Listings here carry community context, so buyers can evaluate
              condition notes, trade fit, and member reputation together.
            </p>
            <Link
              href="/add-item"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "mt-5",
              })}
            >
              <Plus className="size-4" aria-hidden="true" />
              Publish here
            </Link>
          </Card>
        </aside>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/70 p-4">
      <div className="text-2xl font-semibold text-foreground">{value}</div>
      <div className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function SectionHeader({
  cta,
  href,
  title,
}: {
  cta: string;
  href: string;
  title: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
      <Link href={href} className="text-sm font-semibold text-accent">
        {cta}
      </Link>
    </div>
  );
}

function ThreadRow({
  communitySlug,
  thread,
}: {
  communitySlug: string;
  thread: MockCommunityThread;
}) {
  const Icon = thread.type === "show_and_tell" ? Sparkles : thread.type === "question" ? MessageCircle : Flame;

  return (
    <Link href={`/communities/${communitySlug}/threads/${thread.id}`}>
      <Card variant="interactive" className="rounded-lg p-4">
        <div className="flex gap-4">
          <div className="grid size-11 shrink-0 place-items-center rounded-lg border border-accent/35 bg-accent/10 text-accent">
            <Icon className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {thread.pinned ? <Badge variant="default">Pinned</Badge> : null}
              <Badge variant="outline">{thread.type.replaceAll("_", " ")}</Badge>
            </div>
            <h3 className="mt-2 text-lg font-semibold text-foreground">
              {thread.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {thread.body}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>{thread.score} votes</span>
              <span>{thread.commentCount} comments</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function MemberMiniRow({
  profile,
  role,
}: {
  profile?: MockProfile;
  role: MockCommunityMembership["role"];
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
      <div className="relative size-10 overflow-hidden rounded-full bg-muted">
        {profile?.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt={profile.displayName}
            fill
            sizes="40px"
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-foreground">
          {profile?.displayName ?? "Member"}
        </div>
        <div className="text-xs capitalize text-muted-foreground">{role}</div>
      </div>
    </div>
  );
}
