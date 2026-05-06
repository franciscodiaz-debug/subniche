"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Flame,
  MessageCircle,
  Plus,
  Share2,
  Shield,
  Sparkles,
  ShoppingBag,
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
  const [joined, setJoined] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const heroImage =
    listings[0]?.imageUrl ?? "/mock/listings/fender-twin-reverb.jpg";
  const memberCount = community.memberCount.replace(/\s*members?$/i, "");

  return (
    <div className="mx-auto w-full max-w-none px-4 py-8 sm:px-6 lg:px-12 lg:py-10">
      <Link
        href="/communities"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to communities
      </Link>

      <section className="mt-6">
        <div className="relative h-56 overflow-hidden rounded-lg border border-border bg-card md:h-72">
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 80vw, 100vw"
            className="object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/65 to-background/5" />
        </div>

        <Card className="relative z-10 mx-auto -mt-16 max-w-7xl rounded-lg p-5 shadow-card md:p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex gap-4">
              <div className="grid size-16 shrink-0 place-items-center rounded-lg border border-primary/25 bg-primary/10 text-primary md:size-20">
                <Users className="size-8" aria-hidden="true" />
              </div>
              <div className="min-w-0">
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
                <h1 className="mt-4 text-3xl font-semibold text-foreground md:text-4xl">
                  {community.name}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
                  {community.description}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:items-end">
              <div className="grid grid-cols-3 gap-5">
                <Metric label="Members" value={memberCount} />
                <Metric label="Threads" value={threads.length.toString()} />
                <Metric label="Listings" value={community.listingCount} />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShareCopied(true)}
                  className={buttonVariants({
                    variant: "secondary",
                    size: "sm",
                  })}
                >
                  <Share2 className="size-4" aria-hidden="true" />
                  {shareCopied ? "Link copied" : "Share"}
                </button>
                <button
                  type="button"
                  aria-pressed={joined}
                  onClick={() => setJoined((current) => !current)}
                  className={buttonVariants({ variant: "primary", size: "sm" })}
                >
                  {joined
                    ? "Joined"
                    : community.visibility === "Request-only"
                      ? "Request to join"
                      : "Join community"}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
            <span className="rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-foreground">
              Main
            </span>
            <span className="rounded-md px-4 py-2 text-sm font-semibold text-muted-foreground">
              Talk
              <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                {threads.length}
              </span>
            </span>
            <span className="rounded-md px-4 py-2 text-sm font-semibold text-muted-foreground">
              Market
              <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                {listings.length}
              </span>
            </span>
          </div>
        </Card>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-8">
          <section>
            <SectionHeader
              icon={Flame}
              title="Community threads"
              href={`/communities/${community.slug}/threads/${threads[0]?.id ?? "thread"}`}
              cta="Open latest"
            />
            <div className="overflow-hidden rounded-lg border border-border bg-card">
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
            <SectionHeader
              icon={ShoppingBag}
              title="Community marketplace"
              href="/market"
              cta="View market"
            />
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
    <div className="min-w-0">
      <div className="truncate text-2xl font-semibold text-foreground">
        {value}
      </div>
      <div className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function SectionHeader({
  cta,
  href,
  icon: Icon,
  title,
}: {
  cta: string;
  href: string;
  icon: typeof Flame;
  title: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="flex items-center gap-2 text-2xl font-semibold text-foreground">
        <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        {title}
      </h2>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-sm font-semibold text-accent"
      >
        {cta}
        <ArrowRight className="size-4" aria-hidden="true" />
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
      <div className="border-b border-border p-4 transition last:border-b-0 hover:bg-secondary/35">
        <div className="flex gap-4">
          <div className="grid size-11 shrink-0 place-items-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
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
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" aria-hidden="true" />
                {new Date(thread.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
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
    <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/60 p-3">
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
