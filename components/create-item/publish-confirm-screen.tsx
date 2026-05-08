"use client"

/**
 * Publish Confirm Screen.
 *
 * The finalization step for the Create Listing flow. Two render modes:
 *
 *   - `desktop` → full-screen overlay. Left pane renders a *faithful*
 *     preview via `ListingDetailView` (the exact component the public
 *     listing page uses), guaranteeing the preview can never drift from
 *     the published result. Right pane hosts the Trade Interest editor
 *     + the terminal "Add Item" CTA.
 *   - `mobile`  → embedded body used inside the mobile wizard's step 6.
 *     The wizard footer owns the CTA; this component only renders the
 *     trade-interest editor.
 *
 * Mandatory AI structuring for simple-mode trade interests happens in the
 * parent's `onConfirm` handler (so the mandate is identical on mobile and
 * desktop), not here. This component is purely presentation: show the
 * preview, let the user edit, surface a loading state while `publishing`
 * is true.
 */

import { AlertTriangle, ArrowLeft, CheckCircle2, Loader2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  TradeInterestSection,
  type TradeInterestData,
  summarizeInterest,
} from "@/components/create-item/trade-interest-section"
import { ListingDetailView } from "@/components/listing-detail/listing-detail-view"
import type {
  AvailabilityType,
  MockListing,
  MockSeller,
  MockTradeInterest,
} from "@/lib/mock-listing-detail"

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export interface PublishConfirmListingSummary {
  title: string
  subtitle: string
  description: string
  price: number | null
  /** Retained in the type for back-compat; no longer surfaced — the
   *  "Estimated Value" field was removed to streamline the flow. */
  estimatedTradeValue: number | null
  images: string[]
  category: string
  subcategory: string
  conditionGradeLabel: string | null
  conditionNote: string
  /** Resolved spec rows — only entries with a value are passed in. */
  specs: Array<{ label: string; value: string }>
  /** Intent flags the flow persists. Availability for the preview is
   *  derived from these so the preview's top strip and action bar match
   *  exactly what will publish. */
  statusChips: Array<{
    key: string
    label: string
    tone: "sale" | "trade" | "collection" | "wishlist"
  }>
  paymentMethods: string[]
  localPickup: boolean
  pickupZip: string | null
  shippingAvailable: boolean
  shippingCost: number | null
  returnPolicy: string | null
  /** Seller identity for the preview's author card. Passed in explicitly
   *  so this component never reads current-user state itself. */
  seller: MockSeller
}

export interface PublishConfirmScreenProps {
  variant: "desktop" | "mobile"
  summary: PublishConfirmListingSummary
  /** Null when the listing isn't For Trade — the right column then shows
   *  a minimal "ready to publish" message instead of the editor. */
  trade: {
    value: TradeInterestData
    onChange: (next: TradeInterestData) => void
  } | null
  /** Fires when the user confirms publish. Caller is responsible for any
   *  mandatory AI structuring + navigation. */
  onConfirm: () => void
  /** When true, the publish CTA shows a spinner + "Indexing trade
   *  interests…" label and becomes non-interactive. */
  publishing?: boolean
  /** Desktop only — fires when the user dismisses the overlay. */
  onBack?: () => void
}

/* -------------------------------------------------------------------------- */
/* MockListing adapter                                                         */
/*                                                                            */
/* Synthesizes a full `MockListing` from the draft summary so the preview     */
/* can render via the real `ListingDetailView`. Sections that have no data    */
/* yet (comments, related rows) simply resolve to empty arrays — the          */
/* detail view already handles those gracefully.                              */
/* -------------------------------------------------------------------------- */
function summaryToMockListing(
  summary: PublishConfirmListingSummary,
  trade: PublishConfirmScreenProps["trade"],
): MockListing {
  const availability: AvailabilityType[] = []
  for (const chip of summary.statusChips) {
    if (chip.tone === "sale") availability.push("for-sale")
    else if (chip.tone === "trade") availability.push("for-trade")
    else if (chip.tone === "collection") availability.push("collection")
    // Wishlist items aren't published as availability — they're a separate
    // user-side concept — so we omit them here.
  }

  const tradeInterestSnapshot: MockTradeInterest | null = (() => {
    if (!trade) return null
    const d = trade.value
    const hasStructured = d.advanced.length > 0
    const hasText = d.simpleText.trim().length > 0
    if (!hasStructured && !hasText) return null
    if (hasStructured) {
      return {
        mode: "structured",
        items: d.advanced.map((item) => ({
          id: item.id,
          label:
            [item.brand, item.model].filter(Boolean).join(" ") ||
            [item.category, item.subcategory].filter(Boolean).join(" · ") ||
            "Open trade",
          notes: item.notes || undefined,
        })),
      }
    }
    return { mode: "simple", text: d.simpleText.trim() }
  })()

  const categoryPath = [summary.category, summary.subcategory].filter(
    Boolean,
  ) as string[]

  const shipping =
    summary.localPickup || summary.shippingAvailable
      ? {
          shipsFrom: summary.pickupZip ?? summary.seller.location,
          handlingDays: "1–3 business days",
          options: summary.shippingAvailable
            ? [
                {
                  label: "Standard shipping",
                  price: summary.shippingCost ?? null,
                },
              ]
            : [],
          localPickup: summary.localPickup,
        }
      : null

  return {
    id: "preview",
    categoryPath,
    availability,
    title: summary.title || "Untitled listing",
    subtitle: summary.subtitle || null,
    description: summary.description,
    price: summary.price,
    images: summary.images,
    conditionLabel: summary.conditionGradeLabel,
    conditionExplanation: summary.conditionNote || null,
    specs: summary.specs,
    seller: summary.seller,
    paymentMethods: summary.paymentMethods.length > 0 ? summary.paymentMethods : null,
    shipping,
    returnPolicy: summary.returnPolicy,
    tradeInterest: tradeInterestSnapshot,
    mutualMatch: null,
    /* Preview the item from a *shopper's* perspective. Owner mode would
     * surface edit/delete/stats chrome that is irrelevant while the
     * listing is still a draft. */
    viewerIsOwner: false,
    comments: [],
    moreFromSeller: [],
    youMightAlsoLike: [],
  }
}

/* -------------------------------------------------------------------------- */
/* Main component                                                              */
/* -------------------------------------------------------------------------- */

export function PublishConfirmScreen(props: PublishConfirmScreenProps) {
  if (props.variant === "mobile") {
    return <MobileBody {...props} />
  }
  return <DesktopOverlay {...props} />
}

/* -------------------------------------------------------------------------- */
/* Desktop overlay                                                             */
/* -------------------------------------------------------------------------- */
function DesktopOverlay({
  summary,
  trade,
  onBack,
  onConfirm,
  publishing,
}: PublishConfirmScreenProps) {
  const mockListing = summaryToMockListing(summary, trade)

  return (
    <div className="fixed inset-0 z-50 hidden bg-background md:flex md:flex-col">
      {/* Thin contextual header — kept narrow so the preview dominates. */}
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-border bg-card px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="-ml-2 inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to edit
          </button>
          <span aria-hidden className="h-5 w-px bg-border" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Preview
            </p>
            <h1 className="text-sm font-semibold text-foreground">
              Here&apos;s how your listing will look once published
            </h1>
          </div>
        </div>
        <button
          type="button"
          onClick={onBack}
          aria-label="Close preview"
          className="-mr-2 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="grid flex-1 min-h-0 lg:grid-cols-[minmax(0,1.4fr)_minmax(400px,0.9fr)]">
        {/* Left — faithful ListingDetailView render. Scrolls internally so
            the right column's CTA stays pinned on shorter viewports.
            Non-interactive: users shouldn't "Buy" or "Propose Trade" on
            a listing that isn't live yet. */}
        <section
          aria-label="Listing preview"
          className="min-h-0 overflow-y-auto bg-muted/30"
        >
          <div className="pointer-events-none select-none">
            <ListingDetailView listing={mockListing} />
          </div>
        </section>

        {/* Right — Trade Interest editor + publish. */}
        <aside
          aria-label="Trade preferences and publish"
          className="flex min-h-0 flex-col border-l border-border bg-background"
        >
          <div className="flex-1 overflow-y-auto px-6 py-6 lg:px-8">
            <RightColumnContent trade={trade} variant="desktop" />
          </div>
          <div className="flex-shrink-0 border-t border-border bg-card px-6 py-4 lg:px-8">
            <Button
              onClick={onConfirm}
              disabled={publishing}
              className="h-12 w-full text-base font-semibold"
            >
              {publishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Indexing trade interests…
                </>
              ) : (
                // Labeled "Add Item" across desktop + mobile so the
                // terminal action is recognized consistently.
                "Add Item"
              )}
            </Button>
            <p className="mt-2 text-center text-[11px] leading-relaxed text-muted-foreground">
              You can edit or remove your listing anytime from your profile.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Mobile body — embedded inside the wizard's step 6                           */
/*                                                                            */
/* The wizard owns the publish CTA in its sticky footer, so we just render   */
/* the editor card here.                                                      */
/* -------------------------------------------------------------------------- */
function MobileBody({ trade }: PublishConfirmScreenProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Trade Interest</h2>
        <p className="mt-1 text-sm leading-snug text-muted-foreground text-pretty">
          Tell us what you&apos;d accept in trade. The more specific you are,
          the better your matches.
        </p>
      </div>
      <RightColumnContent trade={trade} variant="mobile" />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Right column content                                                        */
/*                                                                            */
/* Either the TradeInterestSection (when For Trade) or a minimal "ready to   */
/* publish" affirmation. The section is mounted `bare` so the right pane's   */
/* own padding isn't duplicated, and the section's built-in header already   */
/* provides the "Trade Interest" label + mode toggle — so no outer heading   */
/* is needed.                                                                */
/* -------------------------------------------------------------------------- */
function RightColumnContent({
  trade,
  variant,
}: {
  trade: PublishConfirmScreenProps["trade"]
  variant: "desktop" | "mobile"
}) {
  if (!trade) {
    return (
      <div
        className={cn(
          "rounded-card border border-dashed border-border bg-muted/30 px-5 py-6 text-center",
          variant === "mobile" && "px-4 py-5",
        )}
      >
        <p className="text-sm font-medium text-foreground">Ready to publish</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          This listing isn&apos;t For Trade, so there&apos;s no trade interest
          to set. Tap{" "}
          <span className="font-semibold text-foreground">Add Item</span>{" "}
          when you&apos;re ready.
        </p>
      </div>
    )
  }

  const hasContent =
    trade.value.advanced.length > 0 ||
    trade.value.simpleText.trim().length > 0

  return (
    <div className="space-y-4">
      <ReviewBanner data={trade.value} hasContent={hasContent} />
      <TradeInterestSection
        bare
        value={trade.value}
        onChange={trade.onChange}
      />
    </div>
  )
}

function ReviewBanner({
  data,
  hasContent,
}: {
  data: TradeInterestData
  hasContent: boolean
}) {
  if (!hasContent) {
    return (
      <div
        role="alert"
        className="flex items-start gap-2.5 rounded-lg border border-warning/40 bg-warning/10 px-3.5 py-3"
      >
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <div className="min-w-0 flex-1 text-xs">
          <p className="font-medium text-foreground">
            Add at least one trade interest to publish
          </p>
          <p className="mt-0.5 text-muted-foreground">
            Without a trade interest, your listing won&apos;t appear as For Trade.
          </p>
        </div>
      </div>
    )
  }

  const count =
    data.mode === "simple"
      ? data.simpleText.trim()
        ? 1
        : 0
      : data.advanced.length

  const summaryItems =
    data.mode === "advanced"
      ? data.advanced.slice(0, 3).map((item) => summarizeInterest(item))
      : data.simpleText
        ? [data.simpleText.slice(0, 80)]
        : []

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/[0.06] px-3.5 py-3">
      <div className="flex items-center gap-2 text-xs">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        <span className="font-medium text-foreground">
          {count} trade interest{count === 1 ? "" : "s"} ready
        </span>
      </div>
      {summaryItems.length > 0 && (
        <ul className="mt-1.5 space-y-0.5 pl-6">
          {summaryItems.map((item, i) => (
            <li key={i} className="truncate text-xs text-muted-foreground">
              · {item || "—"}
            </li>
          ))}
          {data.mode === "advanced" && data.advanced.length > 3 && (
            <li className="text-xs text-muted-foreground/70">
              + {data.advanced.length - 3} more
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
