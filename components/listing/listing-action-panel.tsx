"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRightLeft,
  Bookmark,
  ChevronRight,
  DollarSign,
  X,
  Mail,
  MapPin,
  Package,
  Share2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { MockListing, MockProfile } from "@/data/mock/types";

type ListingActionPanelProps = {
  listing: MockListing;
  seller?: MockProfile;
  listingCount?: number;
  showMobileDock?: boolean;
};

export function ListingActionPanel({
  listing,
  seller,
  listingCount = 0,
  showMobileDock = false,
}: ListingActionPanelProps) {
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [watching, setWatching] = useState(false);
  const [shared, setShared] = useState(false);
  const canSendOffer = Number(offerAmount.replace(/[$,]/g, "")) > 0;
  const hasMobileCommerceAction =
    listing.statuses.forSale || listing.statuses.forTrade;
  const collectionCount =
    seller?.stats.find((stat) => stat.label.toLowerCase().startsWith("collection"))
      ?.value ?? "0";
  const shareUrl = listing.href ?? `/listings/${listing.id}`;

  async function handleShareListing() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${shareUrl}`);
    } catch {
      // Clipboard access can be unavailable in test or privacy-restricted contexts.
    }

    setShared(true);
    window.setTimeout(() => setShared(false), 2200);
  }

  return (
    <>
      <Card className="overflow-hidden rounded-lg p-0">
        {seller ? (
          <Link
            href="/profile"
            className="group block border-b border-border p-4 transition hover:bg-secondary/45"
          >
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-normal text-muted-foreground">
              Seller
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="size-12 rounded-full">
                {seller.avatarUrl ? (
                  <AvatarImage src={seller.avatarUrl} alt="" />
                ) : null}
                <AvatarFallback>
                  {seller.displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 font-semibold text-foreground transition group-hover:text-primary">
                  <span className="truncate">{seller.displayName}</span>
                </div>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {seller.bio}
                </p>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3" aria-hidden="true" />
                    {seller.location}
                  </span>
                  <span>{seller.memberSince}</span>
                </div>
              </div>
              <ChevronRight
                className="size-5 text-muted-foreground transition group-hover:text-primary"
                aria-hidden="true"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Package className="size-3" aria-hidden="true" />
                {listingCount} listing{listingCount === 1 ? "" : "s"}
              </span>
              <span>{collectionCount} collections</span>
            </div>
          </Link>
        ) : null}
        <CardContent className="space-y-3 p-4">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] gap-2">
            <Link
              href="/inbox"
              className={buttonVariants({
                variant: "primary",
                className: "min-w-0",
              })}
            >
              <Mail className="size-4" aria-hidden="true" />
              Message
            </Link>
            {listing.statuses.forSale ? (
              <Button
                type="button"
                variant="secondary"
                leftIcon={<DollarSign className="size-4" />}
                className="min-w-0"
                onClick={() => setOfferOpen(true)}
              >
                Make Offer
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="icon"
              leftIcon={
                <Bookmark
                  className={watching ? "size-4 fill-current text-primary" : "size-4"}
                />
              }
              aria-label={watching ? "Stop watching listing" : "Watch listing"}
              aria-pressed={watching}
              onClick={() => setWatching((current) => !current)}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              leftIcon={<Share2 className="size-4" />}
              aria-label={shared ? "Listing link copied" : "Share listing"}
              onClick={() => void handleShareListing()}
            />
          </div>
          {listing.statuses.forTrade ? (
            <Link
              href="/trade"
              className={buttonVariants({
                variant: listing.statuses.forSale ? "outline" : "secondary",
                className: "w-full",
              })}
            >
              <ArrowRightLeft className="size-4" aria-hidden="true" />
              Propose trade
            </Link>
          ) : null}
          {shared ? (
            <p className="text-xs font-medium text-success" role="status">
              Link copied.
            </p>
          ) : null}
        </CardContent>
      </Card>

      {showMobileDock ? (
        <div
          data-testid="mobile-listing-action-bar"
          className="fixed inset-x-0 bottom-[4.75rem] z-50 border-y border-border bg-background/95 px-4 py-3 shadow-overlay backdrop-blur lg:hidden"
        >
          <div
            className={`mx-auto grid max-w-md gap-2 ${
              hasMobileCommerceAction ? "grid-cols-2" : "grid-cols-1"
            }`}
          >
            {listing.statuses.forSale ? (
              <Button
                type="button"
                variant="outline"
                leftIcon={<DollarSign className="size-4" />}
                className="h-10 border-primary/45 text-primary hover:bg-primary/10"
                onClick={() => setOfferOpen(true)}
              >
                Offer
              </Button>
            ) : listing.statuses.forTrade ? (
              <Button
                type="button"
                variant="outline"
                leftIcon={<ArrowRightLeft className="size-4" />}
                className="h-10 border-primary/45 text-primary hover:bg-primary/10"
              >
                Trade
              </Button>
            ) : null}
            <Link
              href="/inbox"
              className={buttonVariants({
                variant: "primary",
                className: "h-10",
              })}
            >
              <Mail className="size-4" aria-hidden="true" />
              Message
            </Link>
          </div>
        </div>
      ) : null}

      {offerOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Make an Offer"
            className="w-full max-w-lg overflow-hidden rounded-lg border border-border bg-card shadow-overlay"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-lg font-semibold text-foreground">
                Make an Offer
              </h2>
              <button
                type="button"
                aria-label="Cancel offer"
                className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                onClick={() => setOfferOpen(false)}
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/50 p-3">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-background">
                  {listing.imageUrl ? (
                    <Image
                      src={listing.imageUrl}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-1 text-sm font-semibold text-foreground">
                    {listing.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Asking {listing.price ?? "trade value"}
                  </p>
                </div>
              </div>
              <label
                htmlFor="offer-amount"
                className="mt-5 block text-sm font-medium text-foreground"
              >
                Offer amount
              </label>
              <div className="mt-2 flex items-center rounded-lg border border-input bg-background px-3 focus-within:border-primary/55 focus-within:ring-2 focus-within:ring-primary/15">
                <span className="text-muted-foreground">$</span>
                <Input
                  id="offer-amount"
                  inputMode="decimal"
                  value={offerAmount}
                  onChange={(event) => setOfferAmount(event.target.value)}
                  placeholder="0"
                  className="border-0 bg-transparent text-lg focus-visible:ring-0"
                />
              </div>
              <label
                htmlFor="offer-message"
                className="mt-4 block text-sm font-medium text-foreground"
              >
                Message <span className="text-muted-foreground">(optional)</span>
              </label>
              <Textarea
                id="offer-message"
                value={offerMessage}
                onChange={(event) => setOfferMessage(event.target.value)}
                placeholder="Add a short note - sellers are more likely to accept offers with context."
                className="mt-2"
                rows={3}
              />
              <p className="mt-5 rounded-lg border border-border bg-secondary/60 p-3 text-xs leading-5 text-muted-foreground">
                Offers expire after 48 hours unless both members continue the
                conversation.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-border p-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOfferOpen(false)}
              >
                Cancel
              </Button>
              <Button type="button" disabled={!canSendOffer}>
                Send Offer
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
