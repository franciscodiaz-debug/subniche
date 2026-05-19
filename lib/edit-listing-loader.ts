/**
 * Reverse mapper from MockListing → CreateListingInline form state.
 *
 * Used when the page is opened with `?edit={id}` so the owner sees their
 * existing data pre-filled in the form. The shape is intentionally a flat
 * snapshot of the useState values inside CreateListingInline so the
 * caller can spread/assign each piece into its corresponding setter.
 *
 * Items can live in two places:
 *   1. mock-listing-detail.ts (rich shape, includes specs/shipping/etc.)
 *   2. mock/my-stuff.ts (sparse shape, the user's own items)
 *
 * For (2) we fill the rich fields with sensible defaults so the form
 * still hydrates without throwing — the user can edit/complete what's
 * missing. In production the backend would return one rich shape and
 * this fork would disappear.
 */

import { getMockListing } from "@/lib/mock-listing-detail"
import { myItems } from "@/lib/mock/my-stuff"
import { emptyTradeInterest } from "@/components/create-item/trade-interest-section"
import type {
  ItemCollectionStatus,
  ItemSaleStatus,
  ItemTradeStatus,
  WishlistItemData,
} from "@/lib/types/item-status"

type ConditionGrade = "" | "new" | "used-as-new" | "used" | "used-as-is"

export interface EditListingFormState {
  // Identity
  editingListingId: string

  // Media + basic fields
  images: string[]
  category: string
  subcategory: string
  title: string
  subtitle: string
  description: string

  // Condition
  condition: string
  conditionGrade: ConditionGrade

  // Specs — these four are first-class useState; the rest go in extraSpecs
  brand: string
  year: string
  color: string
  handedness: string
  extraSpecs: Record<string, string>

  // Status flags
  forSaleActive: boolean
  forTradeActive: boolean
  inCollectionActive: boolean
  isWishlistActive: boolean

  // Per-status data
  saleData: ItemSaleStatus
  tradeData: ItemTradeStatus
  collectionData: ItemCollectionStatus
  wishlistData: WishlistItemData
}

const SPEC_KEYS_FIRST_CLASS = new Set(["brand", "year", "color", "handedness"])

function mapConditionGrade(label: string | null | undefined): ConditionGrade {
  if (!label) return ""
  const normalized = label.toLowerCase()
  if (normalized.includes("new") && !normalized.includes("used")) return "new"
  if (normalized.includes("as new")) return "used-as-new"
  if (normalized.includes("as is") || normalized.includes("as-is"))
    return "used-as-is"
  if (normalized.includes("used")) return "used"
  return ""
}

function specKeyFor(label: string): string {
  // Match the keys defined in SPEC_SCHEMA in create-listing-inline.tsx.
  // "Body Type" → "bodyType", "Shell Material" → "shellMaterial", etc.
  const parts = label.split(/\s+/)
  return parts
    .map((p, i) => (i === 0 ? p.toLowerCase() : p[0].toUpperCase() + p.slice(1).toLowerCase()))
    .join("")
}

/**
 * Resolves an id against any of the prototype's listing sources and
 * returns the form-shaped snapshot. Returns null when nothing matches.
 */
export function loadListingForEdit(id: string): EditListingFormState | null {
  const richListing = getMockListing(id)
  if (richListing) return fromMockListing(richListing, id)

  const ownItem = myItems.find((item) => item.id === id)
  if (ownItem) return fromMyItem(ownItem, id)

  return null
}

function fromMockListing(
  listing: ReturnType<typeof getMockListing> & {},
  id: string,
): EditListingFormState {
  const isForSale = listing.availability.includes("for-sale")
  const isForTrade = listing.availability.includes("for-trade")
  const isCollection = listing.availability.includes("collection")

  // Split specs into first-class fields vs extraSpecs.
  const firstClass: Record<string, string> = {}
  const extras: Record<string, string> = {}
  for (const spec of listing.specs ?? []) {
    const key = specKeyFor(spec.label)
    if (SPEC_KEYS_FIRST_CLASS.has(key)) {
      firstClass[key] = spec.value
    } else {
      extras[key] = spec.value
    }
  }

  // Pick the first shipping option that has a price as the default cost.
  const pricedShipping = listing.shipping?.options.find(
    (o) => o.price != null && o.price > 0,
  )

  const baseTerms = {
    paymentMethods: listing.paymentMethods ?? [],
    localPickup: listing.shipping?.localPickup ?? false,
    pickupZip: null,
    shippingAvailable: !!listing.shipping && listing.shipping.options.length > 0,
    shippingCost: pricedShipping?.price ?? null,
    returnPolicy: listing.returnPolicy ?? null,
    publishTo: ["marketplace"],
  }

  return {
    editingListingId: id,

    images: listing.images ?? [],
    category: listing.categoryPath?.[0] ?? "",
    subcategory: listing.categoryPath?.[1] ?? "",
    title: listing.title,
    subtitle: listing.subtitle ?? "",
    description: listing.description ?? "",

    condition: listing.conditionExplanation ?? "",
    conditionGrade: mapConditionGrade(listing.conditionLabel),

    brand: firstClass.brand ?? "",
    year: firstClass.year ?? "",
    color: firstClass.color ?? "",
    handedness: firstClass.handedness ?? "",
    extraSpecs: extras,

    forSaleActive: isForSale,
    forTradeActive: isForTrade,
    inCollectionActive: isCollection,
    isWishlistActive: false, // wishlist items don't have detail mocks

    saleData: {
      active: isForSale,
      price: isForSale ? listing.price : null,
      ...baseTerms,
    },

    tradeData: {
      active: isForTrade,
      estimatedValue: isForTrade ? listing.price : null,
      interests: listing.tradeInterest?.text ?? null,
      interestsData: { ...emptyTradeInterest },
      ...baseTerms,
    },

    collectionData: {
      active: isCollection,
      collectionId: null,
      notes: null,
      dateAcquired: null,
      acquisitionPrice: null,
      receiptUrl: null,
    },

    wishlistData: {
      sourceUrl: null,
      isPublic: true,
      targetPrice: null,
      notes: null,
      priority: 1,
    },
  }
}

function fromMyItem(
  item: (typeof myItems)[number],
  id: string,
): EditListingFormState {
  // MyItem is sparse — most spec/shipping fields don't exist on it, so we
  // hydrate the basics and leave the rest empty for the owner to fill in.
  const baseTerms = {
    paymentMethods: [],
    localPickup: false,
    pickupZip: null,
    shippingAvailable: false,
    shippingCost: null,
    returnPolicy: null,
    publishTo: ["marketplace"],
  }

  return {
    editingListingId: id,

    images: item.images ?? [],
    category: "",
    subcategory: "",
    title: item.title,
    subtitle: item.subtitle ?? "",
    description: "",

    condition: "",
    conditionGrade: "",

    brand: "",
    year: "",
    color: "",
    handedness: "",
    extraSpecs: {},

    forSaleActive: item.for_sale,
    forTradeActive: item.for_trade,
    inCollectionActive: !!item.collection_id,
    isWishlistActive: false,

    saleData: {
      active: item.for_sale,
      price: item.for_sale ? item.price : null,
      ...baseTerms,
    },

    tradeData: {
      active: item.for_trade,
      estimatedValue: item.for_trade ? item.price : null,
      interests: null,
      interestsData: { ...emptyTradeInterest },
      ...baseTerms,
    },

    collectionData: {
      active: !!item.collection_id,
      collectionId: item.collection_id,
      notes: null,
      dateAcquired: null,
      acquisitionPrice: null,
      receiptUrl: null,
    },

    wishlistData: {
      sourceUrl: null,
      isPublic: true,
      targetPrice: null,
      notes: null,
      priority: 1,
    },
  }
}
