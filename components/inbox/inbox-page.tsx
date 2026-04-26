"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightLeft,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  ExternalLink,
  Filter,
  FolderOpen,
  Mail,
  MessageSquare,
  Package,
  Search,
  Send,
  Shield,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type {
  MockListing,
  MockMessageThread,
  MockOffer,
  MockProfile,
} from "@/data/mock/types";
import { cn } from "@/lib/utils";

type InboxPageProps = {
  listings: MockListing[];
  offers: MockOffer[];
  profiles: MockProfile[];
  threads: MockMessageThread[];
};

type InboxFilter = "all" | "received" | "sent";

const filterLabels: Record<InboxFilter, string> = {
  all: "All",
  received: "Received",
  sent: "Sent",
};

export function InboxPage({
  listings,
  offers,
  profiles,
  threads,
}: InboxPageProps) {
  const [selectedThreadId, setSelectedThreadId] = useState(threads[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<InboxFilter>("all");

  const selectedThread =
    threads.find((thread) => thread.id === selectedThreadId) ?? threads[0];
  const selectedProfile = profiles.find(
    (profile) => profile.id === selectedThread?.participantId,
  );
  const selectedListing = listings.find(
    (listing) => listing.id === selectedThread?.listingId,
  );
  const selectedOffer = offers.find(
    (offer) => offer.threadId === selectedThread?.id,
  );

  const sortedThreads = useMemo(
    () =>
      [...threads].sort(
        (first, second) =>
          new Date(second.updatedAt).getTime() -
          new Date(first.updatedAt).getTime(),
      ),
    [threads],
  );

  const filteredThreads = sortedThreads.filter((thread) => {
    if (filter === "received" && !thread.unread) return false;
    if (filter === "sent" && thread.unread) return false;

    const profile = profiles.find((item) => item.id === thread.participantId);
    const listing = listings.find((item) => item.id === thread.listingId);
    const haystack = [
      profile?.displayName,
      profile?.handle,
      listing?.title,
      thread.subject,
      thread.lastMessage,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(searchQuery.trim().toLowerCase());
  });

  const totalUnread = threads.filter((thread) => thread.unread).length;

  return (
    <div className="min-h-[calc(100vh-6rem)] overflow-hidden rounded-lg border border-border bg-background lg:h-[calc(100vh-5rem)]">
      <div className="grid h-full lg:grid-cols-[minmax(300px,340px)_minmax(0,1fr)] xl:grid-cols-[minmax(300px,340px)_minmax(430px,1fr)_minmax(280px,320px)]">
        <aside className="flex min-h-[34rem] flex-col border-b border-border bg-background lg:border-b-0 lg:border-r">
          <div className="space-y-5 border-b border-border p-5">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-3xl font-semibold text-foreground">Inbox</h1>
              {totalUnread > 0 ? (
                <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {totalUnread}
                </span>
              ) : null}
            </div>

            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                aria-label="Search messages"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search messages..."
                className="h-11 bg-card pl-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(Object.keys(filterLabels) as InboxFilter[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-md border border-transparent px-3 text-sm font-semibold text-muted-foreground transition hover:text-foreground",
                    filter === option &&
                      "border-border bg-card text-foreground shadow-card",
                  )}
                  onClick={() => setFilter(option)}
                >
                  {option === "all" ? (
                    <Filter className="size-4" aria-hidden="true" />
                  ) : null}
                  {filterLabels[option]}
                  {option === "all" ? (
                    <ChevronDown className="size-3" aria-hidden="true" />
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredThreads.map((thread) => {
              const profile = profiles.find(
                (item) => item.id === thread.participantId,
              );
              const listing = listings.find(
                (item) => item.id === thread.listingId,
              );
              const offer = offers.find((item) => item.threadId === thread.id);

              return (
                <button
                  key={thread.id}
                  type="button"
                  className={cn(
                    "flex w-full gap-3 border-b border-border p-4 text-left transition hover:bg-card/45",
                    selectedThread?.id === thread.id &&
                      "border-l-2 border-l-primary bg-card",
                  )}
                  onClick={() => setSelectedThreadId(thread.id)}
                >
                  <ThreadThumbnail listing={listing} profile={profile} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-3">
                      <span className="truncate text-base font-semibold text-foreground">
                        {profile?.displayName ?? "Unknown member"}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatRelative(thread.updatedAt)}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "mt-1 block truncate text-sm font-semibold",
                        offer ? "text-primary" : "text-foreground",
                      )}
                    >
                      {offer ? "Offer" : thread.subject}
                    </span>
                    <span className="mt-1 block truncate text-sm text-muted-foreground">
                      {offer
                        ? `For ${listing?.title ?? "listing"}`
                        : thread.lastMessage}
                    </span>
                  </span>
                  {thread.unread ? (
                    <span className="grid size-6 shrink-0 place-items-center self-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      1
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </aside>

        <main className="flex min-h-[44rem] min-w-0 flex-col bg-background">
          {selectedThread ? (
            <>
              <div className="flex shrink-0 items-center gap-3 border-b border-border px-5 py-4">
                <ThreadAvatar profile={selectedProfile} size="sm" />
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-foreground">
                    {selectedThread.subject}
                  </h2>
                  <p className="truncate text-sm text-muted-foreground">
                    {selectedProfile?.displayName} about {selectedListing?.title}
                  </p>
                </div>
                {selectedThread.offerState ? (
                  <Badge variant="warning" className="ml-auto capitalize">
                    {selectedThread.offerState}
                  </Badge>
                ) : null}
              </div>

              {selectedOffer ? (
                <StickyOfferCard
                  offer={selectedOffer}
                  listings={listings}
                  listing={selectedListing}
                />
              ) : null}

              <div className="flex-1 overflow-y-auto px-5 py-6">
                <ParticipantIntro
                  listing={selectedListing}
                  profile={selectedProfile}
                />
                <div className="mt-7 space-y-5">
                  {buildThreadMessages(selectedThread, selectedProfile).map(
                    (item) =>
                      item.type === "offer" && selectedOffer ? (
                        <div
                          key={item.id}
                          className="text-sm text-muted-foreground"
                        >
                          {selectedProfile?.displayName ?? "Member"} made an
                          offer
                        </div>
                      ) : (
                        <TimelineMessage
                          key={item.id}
                          content={item.content}
                          own={item.own}
                          profile={selectedProfile}
                          time={item.time}
                        />
                      ),
                  )}
                </div>
              </div>

              <div className="shrink-0 border-t border-border p-4">
                <div className="flex items-end gap-2">
                  <Input
                    aria-label="Reply"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Type a message..."
                    className="h-12 bg-card"
                  />
                  <Button type="button" aria-label="Send reply" className="h-12">
                    <Send className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <MessageSquare className="mb-4 size-14 text-muted-foreground/35" />
              <p className="text-lg font-semibold text-foreground">
                Select a conversation
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose a message from the list to start chatting.
              </p>
            </div>
          )}
        </main>

        <aside className="hidden overflow-y-auto border-l border-border bg-background xl:block">
          <MemberContextPanel profile={selectedProfile} listing={selectedListing} />
        </aside>
      </div>
    </div>
  );
}

function StickyOfferCard({
  listing,
  listings,
  offer,
}: {
  listing?: MockListing;
  listings: MockListing[];
  offer: MockOffer;
}) {
  const offeredListings = listings.filter((item) =>
    offer.offeredListingIds.includes(item.id),
  );

  return (
    <div className="shrink-0 border-b border-border bg-card/35">
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ArrowRightLeft className="size-4 text-primary" aria-hidden="true" />
            Trade offer
          </h3>
          <Badge variant="warning" className="capitalize">
            {offer.state}
          </Badge>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center">
          <OfferSide label="They offer" listings={offeredListings} />
          <div className="hidden justify-center text-muted-foreground lg:flex">
            <ArrowRightLeft className="size-8" aria-hidden="true" />
          </div>
          <OfferSide label="For your" listings={listing ? [listing] : []} />
        </div>

        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          {offer.note}
        </p>

        <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden="true" />
              {formatRelative(offer.updatedAt)} active
            </span>
            {offer.cashAdjustment ? (
              <span className="font-semibold text-success">
                {offer.cashAdjustment}
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              Accept
            </Button>
            <Button variant="outline" size="sm">
              Counter
            </Button>
            <Button variant="outline" size="sm">
              Decline
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OfferSide({
  label,
  listings,
}: {
  label: string;
  listings: MockListing[];
}) {
  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">{label}:</p>
      <div className="space-y-2">
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={listing.href ?? `/listings/${listing.id}`}
            className="flex items-center gap-3 rounded-lg border border-border bg-background/70 p-2.5 transition hover:border-primary/45"
          >
            {listing.imageUrl ? (
              <Image
                src={listing.imageUrl}
                alt={listing.title}
                width={64}
                height={64}
                className="size-14 rounded-md object-cover"
              />
            ) : null}
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-foreground">
                {listing.title}
              </span>
              <span className="block text-sm text-muted-foreground">
                {listing.price ?? "Trade"}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ParticipantIntro({
  listing,
  profile,
}: {
  listing?: MockListing;
  profile?: MockProfile;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <ThreadAvatar profile={profile} size="lg" />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="truncate text-3xl font-semibold text-foreground">
            {profile?.displayName ?? "Member"}
          </h2>
          <Link
            href="/profile"
            className="text-muted-foreground transition hover:text-primary"
            aria-label="View full profile"
          >
            <ExternalLink className="size-5" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span>{profile?.location}</span>
          <span>{profile?.memberSince}</span>
          {profile?.stats.slice(0, 2).map((stat) => (
            <span key={stat.label}>
              {stat.value} {stat.label.toLowerCase()}
            </span>
          ))}
        </div>
        {listing ? (
          <div className="mt-5">
            <p className="mb-2 text-sm text-muted-foreground">Discussing:</p>
            <Link
              href={listing.href ?? `/listings/${listing.id}`}
              className="inline-flex max-w-full items-center gap-3 rounded-lg border border-border bg-card/60 p-3 transition hover:border-primary/45"
            >
              {listing.imageUrl ? (
                <Image
                  src={listing.imageUrl}
                  alt={listing.title}
                  width={56}
                  height={56}
                  className="size-12 rounded-md object-cover"
                />
              ) : null}
              <span className="min-w-0">
                <span className="block truncate font-semibold text-foreground">
                  {listing.title}
                </span>
                <span className="block text-sm text-muted-foreground">
                  {listing.price ?? "Trade"}
                </span>
              </span>
              <ExternalLink
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TimelineMessage({
  content,
  own,
  profile,
  time,
}: {
  content: string;
  own: boolean;
  profile?: MockProfile;
  time: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <ThreadAvatar profile={own ? undefined : profile} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              "text-sm font-semibold",
              own ? "text-success" : "text-primary",
            )}
          >
            {own ? "You" : profile?.displayName ?? "Member"}
          </span>
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
        <p className="mt-1 text-sm leading-6 text-foreground">{content}</p>
      </div>
    </div>
  );
}

function MemberContextPanel({
  listing,
  profile,
}: {
  listing?: MockListing;
  profile?: MockProfile;
}) {
  if (!profile) return null;

  const listingCount =
    profile.stats.find((stat) => stat.label === "Listings")?.value ?? "0";
  const collectionCount =
    profile.stats.find((stat) => stat.label === "Collection")?.value ?? "0";

  return (
    <div className="space-y-6 p-5">
      <section>
        <div className="flex items-start gap-3">
          <ThreadAvatar profile={profile} size="lg" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-xl font-semibold text-foreground">
                {profile.displayName}
              </h2>
              <ExternalLink
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {profile.location}
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Package className="size-4" aria-hidden="true" />
            {listingCount} listings
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FolderOpen className="size-4" aria-hidden="true" />
            {collectionCount} collection
          </span>
        </div>
      </section>

      <Card className="rounded-lg p-5">
        <p className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="size-4" aria-hidden="true" />
          {profile.memberSince}
        </p>
        <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
          <Shield className="size-4" aria-hidden="true" />
          Verification
        </h3>
        <div className="space-y-2">
          {["Email", "Linked account", "Profile context"].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <Mail className="size-3.5" aria-hidden="true" />
                {item}
              </span>
              <Check className="size-4 text-success" aria-hidden="true" />
            </div>
          ))}
        </div>
        <h3 className="mb-3 mt-5 text-base font-semibold text-foreground">
          Linked Accounts
        </h3>
        <div className="space-y-1">
          {profile.indicators.map((indicator) => (
            <div
              key={indicator}
              className="flex items-center justify-between gap-3 rounded-md px-2 py-1 text-sm"
            >
              <span className="text-foreground">{indicator}</span>
              <span className="text-muted-foreground">{profile.handle}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="rounded-lg p-5">
        <div className="mb-4 flex items-center gap-2">
          <Star className="size-5 fill-current text-primary" aria-hidden="true" />
          <span className="text-3xl font-semibold text-foreground">98%</span>
          <span className="text-sm text-muted-foreground">
            Positive Feedback
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Transactions</span>
          <span className="font-semibold text-foreground">23</span>
        </div>
        <h3 className="mb-3 mt-5 text-base font-semibold text-foreground">
          Response Stats
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Response Rate</span>
            <span className="font-semibold text-foreground">95%</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Avg. Response Time</span>
            <span className="font-semibold text-foreground">&lt; 1 hour</span>
          </div>
        </div>
      </Card>

      {listing ? (
        <Card className="rounded-lg p-5">
          <h3 className="text-base font-semibold text-foreground">
            Member context
          </h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            This conversation keeps profile trust, listing context, and offer
            status together so the next step is easier to judge.
          </p>
        </Card>
      ) : null}
    </div>
  );
}

function ThreadThumbnail({
  listing,
  profile,
}: {
  listing?: MockListing;
  profile?: MockProfile;
}) {
  if (!listing?.imageUrl) return <ThreadAvatar profile={profile} size="md" />;

  return (
    <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
      <Image
        src={listing.imageUrl}
        alt=""
        fill
        sizes="56px"
        className="object-cover"
      />
      <span className="absolute -bottom-1 -right-1">
        <ThreadAvatar profile={profile} size="xs" />
      </span>
    </span>
  );
}

function ThreadAvatar({
  profile,
  size,
}: {
  profile?: MockProfile;
  size: "xs" | "sm" | "md" | "lg";
}) {
  const sizeClass = {
    xs: "size-6 text-[10px]",
    sm: "size-10 text-sm",
    md: "size-12 text-base",
    lg: "size-20 text-2xl",
  }[size];

  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-muted font-semibold text-foreground",
        sizeClass,
      )}
    >
      {profile?.avatarUrl ? (
        <Image
          src={profile.avatarUrl}
          alt=""
          fill
          sizes={size === "lg" ? "80px" : "48px"}
          className="object-cover"
        />
      ) : (
        profile?.displayName.slice(0, 1) ?? "Y"
      )}
    </span>
  );
}

function buildThreadMessages(thread: MockMessageThread, profile?: MockProfile) {
  return [
    {
      id: `${thread.id}-1`,
      own: false,
      time: "9:31 AM",
      type: "text",
      content: thread.lastMessage,
    },
    {
      id: `${thread.id}-2`,
      own: true,
      time: "10:01 AM",
      type: "text",
      content:
        "Thanks. I am checking the details and will reply with a clear trade preference.",
    },
    {
      id: `${thread.id}-3`,
      own: false,
      time: "10:31 AM",
      type: "text",
      content: `${profile?.displayName ?? "I"} can share more context if that helps. Would you consider the offer as written?`,
    },
    {
      id: `${thread.id}-4`,
      own: false,
      time: "11:59 AM",
      type: "offer",
      content: "",
    },
  ];
}

function formatRelative(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}
