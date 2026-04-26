// Types for the item status system (For Sale / For Trade / In Collection / Wishlist)

export interface ItemSaleStatus {
  active: boolean
  price: number | null
  paymentMethods: string[]
  localPickup: boolean
  pickupZip: string | null
  shippingAvailable: boolean
  shippingCost: number | null
  returnPolicy: string | null
  publishTo: string[]
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
  publishTo: string[]
}

export interface ItemCollectionStatus {
  active: boolean
  collectionId: string | null
  notes: string | null
  dateAcquired: string | null
  acquisitionPrice: string | null
  receiptUrl: string | null
}

export interface WishlistItemData {
  sourceUrl: string | null
  isPublic: boolean
  targetPrice: number | null
  notes: string | null
  priority: 0 | 1 | 2 // 0 = Low, 1 = Medium, 2 = High
}

export type ItemStatusType = "for-sale" | "for-trade" | "collection" | "wishlist"
