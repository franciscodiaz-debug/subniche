// Types for the new item status system

export interface ItemSaleStatus {
  active: boolean
  price: number | null
  paymentMethods: string[]
  localPickup: boolean
  pickupZip: string | null
  shippingAvailable: boolean
  shippingCost: number | null
  returnPolicy: string | null
  publishTo: ("marketplace" | "followers" | "groups")[]
}

export interface ItemTradeStatus {
  active: boolean
  estimatedValue: number | null
  interests: string | null
  paymentMethods: string[]
  localPickup: boolean
  pickupZip: string | null
  shippingAvailable: boolean
  shippingCost: number | null
  returnPolicy: string | null
  publishTo: ("marketplace" | "followers" | "groups")[]
}

export interface ItemCollectionStatus {
  active: boolean
  collectionId: string | null
  notes: string | null
  dateAcquired: string | null
  receiptUrl: string | null
}

export interface WishlistItemData {
  sourceUrl: string | null
  isPublic: boolean
  targetPrice: number | null
  notes: string | null
  priority: 0 | 1 | 2 // Low, Medium, High
}

export interface CollectionItemWithStatus {
  id: string
  collectionId: string
  listingId: string | null

  // Core item data
  title: string
  subtitle: string | null
  description: string | null
  images: string[]
  category: string | null
  subcategory: string | null
  condition: string | null

  // Ownership
  isOwned: boolean

  // Status data
  saleStatus: ItemSaleStatus
  tradeStatus: ItemTradeStatus
  collectionStatus: ItemCollectionStatus
  wishlistData: WishlistItemData | null

  // Value tracking
  userEstimatedValue: number | null
  aiSuggestedValue: number | null
  purchasePrice: number | null
  purchaseDate: string | null

  createdAt: string
  updatedAt: string
}

export type ItemStatusType = "for-sale" | "for-trade" | "collection"
export type WishlistPriority = "low" | "medium" | "high"

export const PRIORITY_MAP: Record<WishlistPriority, number> = {
  low: 0,
  medium: 1,
  high: 2,
}

export const PRIORITY_LABELS: Record<number, WishlistPriority> = {
  0: "low",
  1: "medium",
  2: "high",
}
