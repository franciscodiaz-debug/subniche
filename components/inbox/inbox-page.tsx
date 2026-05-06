"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  Lock,
  Mail,
  MessageSquare,
  Package,
  Pencil,
  Search,
  Send,
  Shield,
  Star,
  X,
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
type SentReply = {
  content: string;
  id: string;
  time: string;
};
type OfferTimelineEvent = {
  content: string;
  id: string;
  state: MockOffer["state"];
  time: string;
};
type CounterOfferDraft = {
  cashAdjustment?: string;
  note: string;
  offeredListingIds: string[];
};

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
  const [localOffers, setLocalOffers] = useState(() => offers);
  const [localThreads, setLocalThreads] = useState(() => threads);
  const [selectedThreadId, setSelectedThreadId] = useState("");
  const [counterOpen, setCounterOpen] = useState(false);
  const [counterMessage, setCounterMessage] = useState("");
  const [message, setMessage] = useState("");
  const [sentRepliesByThread, setSentRepliesByThread] = useState<
    Record<string, SentReply[]>
  >({});
  const [offerEventsByThread, setOfferEventsByThread] = useState<
    Record<string, OfferTimelineEvent[]>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<InboxFilter>("all");
  const eventIdRef = useRef(0);

  const selectedThread =
    localThreads.find((thread) => thread.id === selectedThreadId);
  const selectedProfile = profiles.find(
    (profile) => profile.id === selectedThread?.participantId,
  );
  const selectedListing = listings.find(
    (listing) => listing.id === selectedThread?.listingId,
  );
  const selectedOffer = localOffers.find(
    (offer) => offer.threadId === selectedThread?.id,
  );

  const sortedThreads = useMemo(
    () =>
      [...localThreads].sort(
        (first, second) =>
          new Date(second.updatedAt).getTime() -
          new Date(first.updatedAt).getTime(),
      ),
    [localThreads],
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

  const totalUnread = localThreads.filter((thread) => thread.unread).length;

  const appendOfferEvent = (
    threadId: string,
    state: MockOffer["state"],
    content: string,
  ) => {
    eventIdRef.current += 1;
    setOfferEventsByThread((current) => ({
      ...current,
      [threadId]: [
        ...(current[threadId] ?? []),
        {
          id: `${threadId}-offer-event-${eventIdRef.current}`,
          state,
          content,
          time: "Now",
        },
      ],
    }));
  };

  const updateThreadOfferState = (
    threadId: string,
    state: MockOffer["state"],
    lastMessage: string,
  ) => {
    setLocalThreads((current) =>
      current.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              lastMessage,
              offerState: state,
              unread: false,
              updatedAt: "2026-04-26T12:00:00.000Z",
            }
          : thread,
      ),
    );
  };

  const updateOfferState = (
    offerId: string,
    state: MockOffer["state"],
    patch: Partial<MockOffer> = {},
  ) => {
    setLocalOffers((current) =>
      current.map((offer) =>
        offer.id === offerId
          ? {
              ...offer,
              ...patch,
              state,
              updatedAt: "2026-04-26T12:00:00.000Z",
            }
          : offer,
      ),
    );
  };

  useEffect(() => {
    const syncSelectionFromUrl = () => {
      const threadId = new URLSearchParams(window.location.search).get("id");
      setSelectedThreadId(threadId ?? "");
    };

    syncSelectionFromUrl();
    window.addEventListener("popstate", syncSelectionFromUrl);

    return () => window.removeEventListener("popstate", syncSelectionFromUrl);
  }, []);

  const handleSelectThread = (threadId: string) => {
    setSelectedThreadId(threadId);
    setCounterOpen(false);
    setCounterMessage("");
    window.history.pushState(null, "", `/inbox?id=${threadId}`);
  };

  const handleBackToThreads = () => {
    setSelectedThreadId("");
    setCounterOpen(false);
    setCounterMessage("");
    window.history.pushState(null, "", "/inbox");
  };

  const handleSendReply = () => {
    if (!selectedThread) {
      return;
    }

    const content = message.trim();
    if (!content) {
      return;
    }

    setSentRepliesByThread((current) => ({
      ...current,
      [selectedThread.id]: [
        ...(current[selectedThread.id] ?? []),
        {
          id: `${selectedThread.id}-reply-${eventIdRef.current + 1}`,
          content,
          time: "Now",
        },
      ],
    }));
    eventIdRef.current += 1;
    setMessage("");
  };

  const handleAcceptOffer = () => {
    if (!selectedThread || !selectedOffer) {
      return;
    }

    updateOfferState(selectedOffer.id, "accepted");
    updateThreadOfferState(
      selectedThread.id,
      "accepted",
      "You accepted the offer. Coordinate next steps in this thread.",
    );
    appendOfferEvent(
      selectedThread.id,
      "accepted",
      "You accepted the offer. Coordinate next steps, pickup, shipping, and payment details in this thread.",
    );
    setCounterOpen(false);
  };

  const handleDeclineOffer = () => {
    if (!selectedThread || !selectedOffer) {
      return;
    }

    updateOfferState(selectedOffer.id, "declined");
    updateThreadOfferState(
      selectedThread.id,
      "declined",
      "You declined the offer.",
    );
    appendOfferEvent(
      selectedThread.id,
      "declined",
      "You declined the offer. The conversation remains open for messages or a revised proposal.",
    );
    setCounterOpen(false);
  };

  const handleSendCounterOffer = (draft: CounterOfferDraft) => {
    if (!selectedThread || !selectedOffer) {
      return;
    }

    updateOfferState(selectedOffer.id, "countered", {
      cashAdjustment: draft.cashAdjustment,
      note:
        draft.note ||
        "Counter offer sent with updated item and cash terms.",
      offeredListingIds: draft.offeredListingIds,
    });
    updateThreadOfferState(
      selectedThread.id,
      "countered",
      "You sent a counter offer.",
    );
    appendOfferEvent(
      selectedThread.id,
      "countered",
      draft.note
        ? `You sent a counter offer: ${draft.note}`
        : "You sent a counter offer with updated terms.",
    );
    setCounterOpen(false);
    setCounterMessage("");
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] overflow-hidden bg-background md:h-[calc(100vh-5rem)]">
      <div
        className={cn(
          "grid h-full md:grid-cols-[minmax(340px,384px)_minmax(0,1fr)]",
          selectedThread &&
            "xl:grid-cols-[384px_minmax(430px,1fr)_minmax(280px,320px)]",
        )}
      >
        <aside
          className={cn(
            "flex min-h-[34rem] flex-col border-b border-border bg-background md:border-b-0 md:border-r",
            selectedThread && "hidden md:flex",
          )}
        >
          <div className="space-y-5 border-b border-border p-4">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-2xl font-semibold text-foreground">Inbox</h1>
              {totalUnread > 0 ? (
                <span className="grid size-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
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
                className="h-10 bg-card pl-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(Object.keys(filterLabels) as InboxFilter[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  className={cn(
                    "inline-flex h-8 items-center gap-2 rounded-md border border-transparent px-2.5 text-sm font-medium text-muted-foreground transition hover:text-foreground",
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
              const offer = localOffers.find(
                (item) => item.threadId === thread.id,
              );

              return (
                <button
                  key={thread.id}
                  type="button"
                  className={cn(
                    "flex w-full gap-3 border-b border-border p-4 text-left transition hover:bg-card/45",
                    selectedThread?.id === thread.id &&
                      "border-l-2 border-l-primary bg-card/70",
                  )}
                  onClick={() => handleSelectThread(thread.id)}
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
                    <span className="grid size-5 shrink-0 place-items-center self-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                      1
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </aside>

        <main
          className={cn(
            "min-h-[44rem] min-w-0 flex-col bg-background",
            selectedThread ? "flex" : "hidden md:flex",
          )}
        >
          {selectedThread ? (
            <>
              <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 md:hidden"
                  onClick={handleBackToThreads}
                  aria-label="Back to conversations"
                >
                  <ChevronDown
                    className="size-5 rotate-90"
                    aria-hidden="true"
                  />
                </Button>
                <ThreadAvatar profile={selectedProfile} size="sm" />
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold text-foreground">
                    {selectedThread.subject}
                  </h2>
                  <p className="truncate text-sm text-muted-foreground">
                    {selectedProfile?.displayName} about {selectedListing?.title}
                  </p>
                </div>
                {selectedThread.offerState ? (
                  <Badge
                    variant={getOfferBadgeVariant(selectedThread.offerState)}
                    className="ml-auto capitalize"
                  >
                    {selectedThread.offerState}
                  </Badge>
                ) : null}
              </div>

              {selectedOffer ? (
                <StickyOfferCard
                  offer={selectedOffer}
                  listings={listings}
                  listing={selectedListing}
                  onAccept={handleAcceptOffer}
                  onCounter={() => setCounterOpen(true)}
                  onDecline={handleDeclineOffer}
                />
              ) : null}

              <div className="flex-1 overflow-y-auto px-4 py-5">
                <ParticipantIntro
                  listing={selectedListing}
                  profile={selectedProfile}
                />
                <div className="mt-7 space-y-5">
                  {[
                    ...buildThreadMessages(selectedThread, selectedProfile),
                    ...(offerEventsByThread[selectedThread.id] ?? []).map(
                      (event) => ({
                        ...event,
                        own: true,
                        type: "offer-event" as const,
                      }),
                    ),
                    ...(sentRepliesByThread[selectedThread.id] ?? []).map(
                      (reply) => ({
                        ...reply,
                        own: true,
                        type: "text" as const,
                      }),
                    ),
                  ].map((item) =>
                    item.type === "offer" && selectedOffer ? (
                      <div
                        key={item.id}
                        className="text-sm text-muted-foreground"
                      >
                        {selectedProfile?.displayName ?? "Member"} made an offer
                      </div>
                    ) : item.type === "offer-event" && "state" in item ? (
                      <OfferTimelineEventCard
                        key={item.id}
                        content={item.content}
                        state={item.state as MockOffer["state"]}
                        time={item.time}
                      />
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
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleSendReply();
                      }
                    }}
                    placeholder="Type a message..."
                    className="h-12 bg-card"
                  />
                  <Button
                    type="button"
                    aria-label="Send reply"
                    className="h-12"
                    disabled={!message.trim()}
                    onClick={handleSendReply}
                  >
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

        <aside
          className={cn(
            "hidden overflow-y-auto border-l border-border bg-background",
            selectedThread && "xl:block",
          )}
        >
          <MemberContextPanel profile={selectedProfile} listing={selectedListing} />
        </aside>
      </div>
      {counterOpen && selectedOffer ? (
        <CounterOfferModal
          listing={selectedListing}
          listings={listings}
          message={counterMessage}
          offer={selectedOffer}
          onCancel={() => setCounterOpen(false)}
          onMessageChange={setCounterMessage}
          onSubmit={handleSendCounterOffer}
        />
      ) : null}
    </div>
  );
}

function getOfferBadgeVariant(state: MockOffer["state"]) {
  if (state === "accepted") return "success" as const;
  if (state === "declined") return "destructive" as const;
  if (state === "countered") return "info" as const;
  return "warning" as const;
}

function StickyOfferCard({
  listing,
  listings,
  onAccept,
  onCounter,
  onDecline,
  offer,
}: {
  listing?: MockListing;
  listings: MockListing[];
  onAccept: () => void;
  onCounter: () => void;
  onDecline: () => void;
  offer: MockOffer;
}) {
  const offeredListings = listings.filter((item) =>
    offer.offeredListingIds.includes(item.id),
  );
  const isResolved = offer.state === "accepted" || offer.state === "declined";

  return (
    <div
      className={cn(
        "shrink-0 border-b bg-card/20",
        offer.state === "accepted" && "border-success/45 bg-success/5",
        offer.state === "declined" && "border-destructive/45 bg-destructive/5",
        (offer.state === "pending" || offer.state === "countered") &&
          "border-warning/45",
      )}
    >
      <div className="px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ArrowRightLeft className="size-4 text-primary" aria-hidden="true" />
            Trade offer
          </h3>
          <Badge variant={getOfferBadgeVariant(offer.state)} className="capitalize">
            {offer.state}
          </Badge>
        </div>

        <div className="mt-3 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:gap-5">
          <OfferSide label="They offer" listings={offeredListings} mode="summary" />
          <div className="hidden justify-center text-muted-foreground md:flex">
            <ArrowRightLeft className="size-7" aria-hidden="true" />
          </div>
          <OfferSide label="For your" listings={listing ? [listing] : []} mode="summary" />
        </div>

        {offer.cashAdjustment ? (
          <p className="mt-3 text-center text-sm font-semibold text-success md:text-left md:pl-[5.1rem]">
            {offer.cashAdjustment}
          </p>
        ) : null}

        <div className="mt-4 flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {isResolved ? (
              <span className="font-medium">
                {offer.state === "accepted"
                  ? "Accepted just now"
                  : "Declined just now"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Clock className="size-4" aria-hidden="true" />
                1d remaining
              </span>
            )}
          </div>
          {!isResolved ? (
            <div className="flex shrink-0 flex-nowrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="hover:border-success/60"
                onClick={onAccept}
              >
                Accept
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hover:border-primary/60"
                onClick={onCounter}
              >
                Counter
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hover:border-destructive/60 hover:text-destructive"
                onClick={onDecline}
              >
                Decline
              </Button>
            </div>
          ) : null}
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          {offer.note}
        </p>
      </div>
    </div>
  );
}

function CounterOfferModal({
  listing,
  listings,
  message,
  offer,
  onCancel,
  onMessageChange,
  onSubmit,
}: {
  listing?: MockListing;
  listings: MockListing[];
  message: string;
  offer: MockOffer;
  onCancel: () => void;
  onMessageChange: (message: string) => void;
  onSubmit: (draft: CounterOfferDraft) => void;
}) {
  const [activeSide, setActiveSide] = useState<"their" | "your" | null>(null);
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [cashAmount, setCashAmount] = useState(
    offer.cashAdjustment?.match(/\$([\d,]+)/)?.[1].replaceAll(",", "") ?? "",
  );
  const [cashSide, setCashSide] = useState<"their" | "your" | null>(
    offer.cashAdjustment?.includes("from Kyle") ? "your" : "their",
  );
  const [theirSelectedIds, setTheirSelectedIds] = useState(
    () => new Set(offer.offeredListingIds),
  );
  const [yourSelectedIds, setYourSelectedIds] = useState(
    () => new Set(listing ? [listing.id] : []),
  );

  const offeredListings = listings.filter((item) =>
    theirSelectedIds.has(item.id),
  );
  const yourListings = listings.filter((item) => yourSelectedIds.has(item.id));
  const theirCandidates = listings.filter(
    (item) =>
      item.sellerId === offer.fromProfileId ||
      offer.offeredListingIds.includes(item.id),
  );
  const yourCandidates = listings.filter(
    (item) => item.sellerId === offer.toProfileId || item.id === listing?.id,
  );
  const activeCandidates = activeSide === "their" ? theirCandidates : yourCandidates;
  const cashValue = Number(cashAmount || 0);
  const cashAdjustment =
    cashSide && cashValue
      ? `$${cashValue.toLocaleString()} from ${
          cashSide === "your" ? "Kyle" : "Mara"
        }`
      : undefined;

  const toggleCandidate = (itemId: string) => {
    if (activeSide === "their") {
      setTheirSelectedIds((current) => {
        const next = new Set(current);
        if (next.has(itemId)) next.delete(itemId);
        else next.add(itemId);
        return next;
      });
    }

    if (activeSide === "your" && itemId !== listing?.id) {
      setYourSelectedIds((current) => {
        const next = new Set(current);
        if (next.has(itemId)) next.delete(itemId);
        else next.add(itemId);
        return next;
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/75 px-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Counter Offer"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-card shadow-overlay"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-4 py-3">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <ArrowRightLeft className="size-4 text-primary" aria-hidden="true" />
            Counter Offer
          </h2>
          <button
            type="button"
            aria-label="Close counter offer"
            className="rounded-full p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            onClick={onCancel}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="border-b border-border bg-secondary/30 p-4">
          <div className="grid grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,1fr)] items-center gap-3">
            <button
              type="button"
              className={cn(
                "group min-h-40 rounded-lg border-2 border-transparent bg-background/50 p-2 text-left transition",
                activeSide === "their"
                  ? "border-primary bg-primary/10"
                  : "hover:border-primary/35",
              )}
              onClick={() => setActiveSide(activeSide === "their" ? null : "their")}
            >
              <CounterSideHeader
                active={activeSide === "their"}
                label="Their offer:"
              />
              <CounterTileGrid
                cashAmount={cashSide === "their" ? cashValue : 0}
                listings={offeredListings}
              />
            </button>

            <div className="grid size-10 place-items-center rounded-full bg-secondary text-muted-foreground">
              <ArrowRightLeft className="size-4" aria-hidden="true" />
            </div>

            <button
              type="button"
              className={cn(
                "group min-h-40 rounded-lg border-2 border-transparent bg-background/50 p-2 text-left transition",
                activeSide === "your"
                  ? "border-primary bg-primary/10"
                  : "hover:border-primary/35",
              )}
              onClick={() => setActiveSide(activeSide === "your" ? null : "your")}
            >
              <CounterSideHeader
                active={activeSide === "your"}
                label="Your items:"
              />
              <CounterTileGrid
                cashAmount={cashSide === "your" ? cashValue : 0}
                lockedListingId={listing?.id}
                listings={yourListings}
              />
            </button>
          </div>

          {activeSide ? (
            <div className="mt-4 space-y-4 border-t border-primary/20 pt-4">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {activeCandidates.map((item) => {
                  const selected =
                    activeSide === "their"
                      ? theirSelectedIds.has(item.id)
                      : yourSelectedIds.has(item.id);
                  const locked = activeSide === "your" && item.id === listing?.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={cn(
                        "relative w-20 shrink-0 overflow-hidden rounded-md border bg-background text-left transition hover:border-primary/35",
                        selected && "border-primary bg-primary/10",
                        locked && "cursor-not-allowed border-muted-foreground/50 opacity-70",
                      )}
                      onClick={() => toggleCandidate(item.id)}
                    >
                      {(selected || locked) ? (
                        <span
                          className={cn(
                            "absolute right-1 top-1 z-10 grid size-4 place-items-center rounded-full",
                            locked ? "bg-muted-foreground" : "bg-primary",
                          )}
                        >
                          {locked ? (
                            <Lock
                              className="size-2.5 text-background"
                              aria-hidden="true"
                            />
                          ) : (
                            <Check
                              className="size-2.5 text-primary-foreground"
                              aria-hidden="true"
                            />
                          )}
                        </span>
                      ) : null}
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          width={80}
                          height={80}
                          className="aspect-square w-full object-cover"
                        />
                      ) : null}
                      <span className="block px-1.5 py-1">
                        <span className="block truncate text-[10px] font-medium text-foreground">
                          {item.title}
                        </span>
                        <span className="block text-[10px] text-primary">
                          {item.price}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                Cash
                <span className="text-muted-foreground">$</span>
                <input
                  type="number"
                  value={cashAmount}
                  onChange={(event) => {
                    setCashAmount(event.target.value);
                    setCashSide(
                      event.target.value && Number(event.target.value) > 0
                        ? activeSide
                        : null,
                    );
                  }}
                  placeholder="0"
                  className="h-8 min-w-0 flex-1 rounded-md border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/60"
                />
              </label>
            </div>
          ) : null}
        </div>

        {activeSide === null ? (
          <div className="border-b border-border p-4">
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              Message
              {isEditingMessage ? (
                <button
                  type="button"
                  aria-label="Done editing counter message"
                  className="rounded bg-primary/10 p-0.5 text-primary"
                  onClick={() => setIsEditingMessage(false)}
                >
                  <Check className="size-3" aria-hidden="true" />
                </button>
              ) : null}
            </div>
            {isEditingMessage ? (
              <input
                autoFocus
                value={message}
                onChange={(event) => onMessageChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") setIsEditingMessage(false);
                }}
                placeholder="Add a message..."
                className="w-full border-b border-primary/35 bg-transparent pb-1 text-sm italic text-foreground/80 outline-none"
              />
            ) : (
              <button
                type="button"
                className="group flex w-full items-center gap-2 text-left"
                onClick={() => setIsEditingMessage(true)}
              >
                <Pencil
                  className="size-3.5 text-muted-foreground transition group-hover:text-primary"
                  aria-hidden="true"
                />
                <span className="text-sm italic text-muted-foreground/70 transition group-hover:text-muted-foreground">
                  {message || "Add a message..."}
                </span>
              </button>
            )}
          </div>
        ) : null}

        <div className="sticky bottom-0 flex gap-3 border-t border-border bg-card p-4">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onCancel}
            disabled={activeSide !== null || isEditingMessage}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1"
            disabled={activeSide !== null || isEditingMessage}
            onClick={() =>
              onSubmit({
                cashAdjustment,
                note: message.trim(),
                offeredListingIds: Array.from(theirSelectedIds),
              })
            }
          >
            Send Counter
          </Button>
        </div>
      </div>
    </div>
  );
}

function OfferSide({
  label,
  listings,
  mode = "default",
}: {
  label: string;
  listings: MockListing[];
  mode?: "default" | "summary";
}) {
  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">{label}:</p>
      <div className="space-y-2">
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={listing.href ?? `/listings/${listing.id}`}
            className={cn(
              "flex items-center gap-3 rounded-lg border border-border bg-background/70 transition hover:border-primary/45",
              mode === "summary" ? "p-2" : "p-2.5",
            )}
          >
            {listing.imageUrl ? (
              <Image
                src={listing.imageUrl}
                alt={listing.title}
                width={64}
                height={64}
                className={cn(
                  "rounded-md object-cover",
                  mode === "summary" ? "size-14" : "size-14",
                )}
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

function CounterSideHeader({
  active,
  label,
}: {
  active: boolean;
  label: string;
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <p
        className={cn(
          "text-xs",
          active ? "font-semibold text-primary" : "text-muted-foreground",
        )}
      >
        {label}
      </p>
      {active ? (
        <span className="grid size-5 place-items-center rounded-md bg-primary/10">
          <Check className="size-3 text-primary" aria-hidden="true" />
        </span>
      ) : (
        <Pencil className="size-3 text-primary opacity-0 transition group-hover:opacity-100" />
      )}
    </div>
  );
}

function CounterTileGrid({
  cashAmount,
  listings,
  lockedListingId,
}: {
  cashAmount?: number;
  listings: MockListing[];
  lockedListingId?: string;
}) {
  return (
    <div className="grid min-h-24 grid-cols-2 gap-1.5">
      {listings.length || cashAmount ? (
        <>
          {listings.slice(0, 3).map((item) => {
            const locked = item.id === lockedListingId;

            return (
              <div
                key={item.id}
                className="relative overflow-hidden rounded-md border border-card bg-muted"
              >
                {locked ? (
                  <span className="absolute right-1 top-1 z-10 grid size-4 place-items-center rounded-full bg-muted-foreground">
                    <Lock className="size-2.5 text-background" aria-hidden="true" />
                  </span>
                ) : null}
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    width={96}
                    height={96}
                    className="aspect-square w-full object-cover"
                  />
                ) : null}
                <div className="p-1.5">
                  <p className="truncate text-[10px] font-medium text-foreground">
                    {item.title}
                  </p>
                  <p
                    className={cn(
                      "text-[10px]",
                      locked ? "text-muted-foreground" : "text-primary",
                    )}
                  >
                    {item.price}
                  </p>
                </div>
              </div>
            );
          })}
          {listings.length > 3 ? (
            <div className="grid aspect-square place-items-center rounded-md border border-card bg-muted text-xs font-semibold">
              +{listings.length - 3}
            </div>
          ) : null}
          {cashAmount ? (
            <div className="grid aspect-square place-items-center rounded-md border border-success/35 bg-success/10 text-xs font-semibold text-success">
              ${cashAmount.toLocaleString()}
            </div>
          ) : null}
        </>
      ) : (
        <div className="col-span-2 grid place-items-center text-xs italic text-muted-foreground">
          No items
        </div>
      )}
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

function OfferTimelineEventCard({
  content,
  state,
  time,
}: {
  content: string;
  state: MockOffer["state"];
  time: string;
}) {
  const isAccepted = state === "accepted";
  const isDeclined = state === "declined";

  return (
    <div
      className={cn(
        "ml-[52px] rounded-lg border px-4 py-3 text-sm",
        isAccepted && "border-success/35 bg-success/10",
        isDeclined && "border-destructive/35 bg-destructive/10",
        state === "countered" && "border-info/35 bg-info/10",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={getOfferBadgeVariant(state)} className="capitalize">
          {state}
        </Badge>
        <span className="text-xs text-muted-foreground">{time}</span>
      </div>
      <p className="mt-2 leading-6 text-foreground">{content}</p>
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
