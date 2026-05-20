// Types for the item status system (For Sale / For Trade / In Collection)

import type { TradeInterestData } from "@/components/create-item/trade-interest-section"

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
  /**
   * Legacy plain-text trade interests. Kept for backward compatibility with
   * existing summary rows and matching pipelines. When `interestsData` is
   * present, prefer that structured shape.
   */
  interests: string | null
  /**
   * Structured Trade Interest authoring state. Owned by `TradeInterestSection`.
   * Nullable so legacy records (pre-structured authoring) stay valid.
   */
  interestsData: TradeInterestData | null
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

export type ItemStatusType = "for-sale" | "for-trade" | "collection"
