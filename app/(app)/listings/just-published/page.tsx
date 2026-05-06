"use client"

/**
 * "Just published" listing page.
 *
 * Terminal destination of the create-listing flow. Reads the in-memory
 * draft that the create-listing form stashed in `sessionStorage`, hydrates
 * it into the same `MockListing` shape used across the detail page, and
 * renders `<ListingDetailView>` so users see their item exactly as it will
 * appear to other collectors.
 *
 * If the user lands here without a draft (e.g. direct URL, or refreshed the
 * page after a long time), we render a friendly stub pointing back to the
 * create flow. That failsafe keeps the prototype self-navigable.
 */

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { ListingDetailView } from "@/components/listing-detail/listing-detail-view"
import { JustPublishedBanner } from "@/components/listing-detail/just-published-banner"
import {
  clearDraft,
  draftToMockListing,
  readDraft,
  type PublishedListingDraft,
} from "@/lib/draft-listing-storage"

export default function JustPublishedPage() {
  /* `draft` is the hydrated draft read from sessionStorage on mount. We
     keep it in local state so React re-renders the detail view once the
     effect has populated it (sessionStorage is only available client-side). */
  const [draft, setDraft] = useState<PublishedListingDraft | null | "loading">(
    "loading",
  )

  useEffect(() => {
    const next = readDraft()
    setDraft(next)
    /* We intentionally don't `clearDraft()` here so a refresh still shows
       the listing. The draft is cleared when the user navigates away via
       the banner's primary action ("View another listing" etc.). */
  }, [])

  const listing = useMemo(() => {
    if (!draft || draft === "loading") return null
    return draftToMockListing(draft)
  }, [draft])

  if (draft === "loading") {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center justify-center px-4 py-12 md:px-6">
        <p className="text-sm text-muted-foreground">Loading your listing…</p>
      </div>
    )
  }

  if (!listing) {
    return <NoDraftFallback />
  }

  return (
    <>
      {/* Persistent confirmation banner — dismissible, but sticks around on
          refresh so the success signal isn't lost if the user scrolls and
          comes back. Placed above the detail view so it anchors the page. */}
      <JustPublishedBanner onClearDraft={clearDraft} />
      <ListingDetailView listing={listing} />
    </>
  )
}

function NoDraftFallback() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-start justify-center gap-5 px-4 py-16 md:px-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Prototype
        </p>
        <h1 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
          Nothing published here yet.
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
          This page shows the listing you just created. Kick off the flow to
          see it render end-to-end.
        </p>
      </div>
      <Link
        href="/create-listing"
        className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Start a new listing
      </Link>
    </div>
  )
}
