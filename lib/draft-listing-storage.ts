/**
 * Draft listing storage.
 *
 * Bridges the create-listing flow to the published-listing detail view by
 * persisting the user's form state across a client-side route change.
 * This keeps the prototype's publish → detail journey feeling real: users
 * see *their* item on the published page, not a static mock.
 *
 * Storage lives in `sessionStorage` under a single key so the draft is
 * scoped to the current browser tab and wiped when the tab closes. The
 * detail view consumes it once (or on refresh) and can clear it when the
 * user navigates away.
 */

import type { MockComment, MockListing, MockRelatedCard, MockSeller, MockSpec, MockTradeInterest } from "@/lib/mock-listing-detail"

const STORAGE_KEY = "subniche:just-published-draft"

/** Shape the create-listing form serializes into. Every field is optional
 * because the form lets users skip a lot. Downstream the builder fills in
 * safe defaults so the detail page never blows up on missing data. */
export interface PublishedListingDraft {
  images: string[]
  category: string
  subcategory: string
  title: string
  subtitle: string
  description: string
  condition: string
  conditionGrade: "" | "new" | "used-as-new" | "used" | "used-as-is"
  /** Arbitrary key/value specs captured from the dynamic spec schema. */
  specs: Array<{ label: string; value: string }>
  forSaleActive: boolean
  forTradeActive: boolean
  inCollectionActive: boolean
  price: number | null
  estimatedTradeValue: number | null
  paymentMethods: string[]
  localPickup: boolean
  pickupZip: string | null
  shippingAvailable: boolean
  shippingCost: number | null
  returnPolicy: string | null
  tradeInterestFreeText: string | null
  /** Mode-aware trade interest summary pre-serialized for the detail view. */
  tradeInterest: MockTradeInterest | null
  /** Minimal seller snapshot so the detail page reads consistently. */
  seller: MockSeller
  savedAt: number
}

/* -------------------------------------------------------------------------- */
/* Persistence                                                                 */
/*                                                                            */
/* Both helpers are `window`-guarded so they survive Next's server pass; they  */
/* are only ever called from client components but being defensive is cheaper  */
/* than debugging a hydration error later.                                    */
/* -------------------------------------------------------------------------- */

export function saveDraft(draft: PublishedListingDraft) {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch (err) {
    console.error("[v0] saveDraft failed:", err)
  }
}

export function readDraft(): PublishedListingDraft | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PublishedListingDraft
    return parsed
  } catch (err) {
    console.error("[v0] readDraft failed:", err)
    return null
  }
}

export function clearDraft() {
  if (typeof window === "undefined") return
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.error("[v0] clearDraft failed:", err)
  }
}

/* -------------------------------------------------------------------------- */
/* Builders                                                                    */
/*                                                                            */
/* `draftToMockListing` hoists the user's in-flight form data into the same   */
/* shape the published listing view already knows how to render, so we only   */
/* have one display component to maintain.                                    */
/* -------------------------------------------------------------------------- */

const CONDITION_LABELS: Record<string, string> = {
  new: "New",
  "used-as-new": "Used — As New",
  used: "Used",
  "used-as-is": "Used — As Is",
}

export function draftToMockListing(draft: PublishedListingDraft): MockListing {
  const availability: MockListing["availability"] = []
  if (draft.forSaleActive) availability.push("for-sale")
  if (draft.forTradeActive) availability.push("for-trade")
  if (draft.inCollectionActive) availability.push("collection")

  const specs: MockSpec[] = draft.specs.filter((s) => s.value.trim().length > 0)

  /* At least one image must render so the page doesn't look broken when the
     lister skipped photos entirely. The placeholder still reads as an empty
     slot via the gallery component. */
  const images = draft.images.length > 0 ? draft.images : ["/placeholder.svg?height=900&width=1200"]

  const comments: MockComment[] = []
  const moreFromSeller: MockRelatedCard[] = []
  const youMightAlsoLike: MockRelatedCard[] = []

  const conditionLabel =
    CONDITION_LABELS[draft.conditionGrade] ??
    (draft.condition ? "Condition noted" : null)

  return {
    id: "just-published",
    categoryPath: [draft.category, draft.subcategory].filter(Boolean),
    availability: availability.length > 0 ? availability : ["collection"],
    title: draft.title || "Untitled listing",
    subtitle: draft.subtitle || null,
    description: draft.description || "",
    price: draft.forSaleActive ? draft.price : null,
    images,
    conditionLabel,
    conditionExplanation: draft.condition || null,
    specs,
    seller: draft.seller,
    paymentMethods:
      draft.forSaleActive || draft.forTradeActive
        ? draft.paymentMethods.length > 0
          ? draft.paymentMethods
          : null
        : null,
    shipping:
      draft.forSaleActive || draft.forTradeActive
        ? {
            shipsFrom: draft.pickupZip ?? "—",
            handlingDays: "Ships within 3 business days",
            options: draft.shippingAvailable
              ? [
                  {
                    label: "Standard shipping",
                    price: draft.shippingCost,
                  },
                ]
              : [],
            localPickup: draft.localPickup,
          }
        : null,
    returnPolicy: draft.returnPolicy,
    tradeInterest: draft.forTradeActive ? draft.tradeInterest : null,
    /* Brand-new listings have nothing to match against yet; the banner will
       handle the "you just published" confirmation instead. */
    mutualMatch: null,
    /* The viewer that just published IS the owner — so action bar renders
       the owner variant (edit, boost, mark as sold). */
    viewerIsOwner: true,
    ownerStats: {
      views: 0,
      saves: 0,
      messages: 0,
      daysListed: 0,
    },
    markedAsSold: false,
    comments,
    moreFromSeller,
    youMightAlsoLike,
  }
}
