"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowRightLeft, Clock, Mail, Send } from "lucide-react";
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

export function InboxPage({
  listings,
  offers,
  profiles,
  threads,
}: InboxPageProps) {
  const [selectedThreadId, setSelectedThreadId] = useState(threads[0]?.id ?? "");
  const [message, setMessage] = useState("");
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

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-normal text-foreground">
          Inbox
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Messages, offers, and trade context stay attached to the listing that
          started the conversation.
        </p>
      </header>

      <div className="grid min-h-[680px] overflow-hidden rounded-lg border border-border bg-surface lg:grid-cols-[320px_minmax(0,1fr)_320px]">
        <aside className="border-b border-border lg:border-b-0 lg:border-r">
          <div className="border-b border-border p-4">
            <h2 className="text-sm font-semibold uppercase text-muted-foreground">
              Conversations
            </h2>
          </div>
          <div className="divide-y divide-border">
            {sortedThreads.map((thread) => {
              const profile = profiles.find(
                (item) => item.id === thread.participantId,
              );
              const listing = listings.find(
                (item) => item.id === thread.listingId,
              );

              return (
                <button
                  key={thread.id}
                  type="button"
                  className={cn(
                    "grid w-full grid-cols-[44px_1fr] gap-3 p-4 text-left transition hover:bg-muted/45",
                    selectedThread?.id === thread.id && "bg-muted/60",
                  )}
                  onClick={() => setSelectedThreadId(thread.id)}
                >
                  <ThreadAvatar profile={profile} />
                  <span className="min-w-0">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-foreground">
                        {profile?.displayName ?? "Unknown member"}
                      </span>
                      {thread.unread ? (
                        <span className="size-2 rounded-full bg-accent" />
                      ) : null}
                    </span>
                    <span className="mt-1 block truncate text-sm text-foreground">
                      {thread.subject}
                    </span>
                    <span className="mt-1 block truncate text-xs text-muted-foreground">
                      {listing?.title ?? "Direct message"} - {thread.lastMessage}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="flex min-h-[520px] flex-col">
          <div className="border-b border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {selectedThread?.subject}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedProfile?.displayName} about {selectedListing?.title}
                </p>
              </div>
              {selectedThread?.offerState ? (
                <Badge variant="warning">{selectedThread.offerState}</Badge>
              ) : null}
            </div>
          </div>

          <div className="flex-1 space-y-4 p-5">
            <MessageBubble align="left" profile={selectedProfile}>
              {selectedThread?.lastMessage}
            </MessageBubble>
            {selectedOffer ? (
              <OfferCard offer={selectedOffer} listings={listings} />
            ) : null}
            <MessageBubble align="right">
              Thanks. I am checking the details and will reply with a clear
              trade preference.
            </MessageBubble>
          </div>

          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Input
                aria-label="Reply"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Write a reply..."
              />
              <Button type="button" aria-label="Send reply">
                <Send className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </main>

        <aside className="border-t border-border p-5 lg:border-l lg:border-t-0">
          <div className="space-y-5">
            <section>
              <h2 className="text-base font-semibold text-foreground">
                Member context
              </h2>
              <div className="mt-4 flex items-center gap-3">
                <ThreadAvatar profile={selectedProfile} />
                <div>
                  <div className="font-semibold text-foreground">
                    {selectedProfile?.displayName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedProfile?.location}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedProfile?.indicators.map((indicator) => (
                  <Badge key={indicator} variant="secondary">
                    {indicator}
                  </Badge>
                ))}
              </div>
            </section>

            {selectedListing ? (
              <section className="rounded-lg border border-border bg-background p-4">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Listing
                </h3>
                <div className="mt-3 flex gap-3">
                  {selectedListing.imageUrl ? (
                    <Image
                      src={selectedListing.imageUrl}
                      alt={selectedListing.title}
                      width={72}
                      height={72}
                      className="size-16 rounded-lg object-cover"
                    />
                  ) : null}
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {selectedListing.title}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {selectedListing.price ?? "Trade"}
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            <section className="rounded-lg border border-border bg-background p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Clock className="size-4 text-accent" aria-hidden="true" />
                Last activity
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {selectedThread
                  ? formatThreadDate(selectedThread.updatedAt)
                  : "No activity yet"}
              </p>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ThreadAvatar({ profile }: { profile?: MockProfile }) {
  return (
    <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-muted text-sm font-semibold text-foreground">
      {profile?.avatarUrl ? (
        <Image
          src={profile.avatarUrl}
          alt=""
          fill
          sizes="44px"
          className="object-cover"
        />
      ) : (
        profile?.displayName.slice(0, 1) ?? <Mail className="size-4" />
      )}
    </span>
  );
}

function MessageBubble({
  align,
  children,
  profile,
}: {
  align: "left" | "right";
  children?: string;
  profile?: MockProfile;
}) {
  return (
    <div
      className={cn(
        "flex gap-3",
        align === "right" ? "justify-end" : "justify-start",
      )}
    >
      {align === "left" ? <ThreadAvatar profile={profile} /> : null}
      <p
        className={cn(
          "max-w-[32rem] rounded-lg px-4 py-3 text-sm leading-6",
          align === "right"
            ? "bg-primary text-primary-foreground"
            : "bg-background text-foreground",
        )}
      >
        {children}
      </p>
    </div>
  );
}

function OfferCard({
  offer,
  listings,
}: {
  offer: MockOffer;
  listings: MockListing[];
}) {
  const offeredListings = listings.filter((listing) =>
    offer.offeredListingIds.includes(listing.id),
  );

  return (
    <div className="rounded-lg border border-accent/40 bg-accent/10 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <ArrowRightLeft className="size-4 text-accent" aria-hidden="true" />
          Trade offer
        </h3>
        <Badge variant="warning">{offer.state}</Badge>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {offer.note}
      </p>
      {offeredListings.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {offeredListings.map((listing) => (
            <Badge key={listing.id} variant="secondary">
              {listing.title}
            </Badge>
          ))}
        </div>
      ) : null}
      {offer.cashAdjustment ? (
        <div className="mt-3 text-sm font-semibold text-warning">
          {offer.cashAdjustment}
        </div>
      ) : null}
    </div>
  );
}

function formatThreadDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
