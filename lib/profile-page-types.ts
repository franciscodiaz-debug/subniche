export type ProfileCollectionVisibility = "public" | "unlisted" | "private"

export interface ProfileVerificationReference {
  email: boolean
  phone: boolean
  id: boolean
}

export interface ProfileLinkedAccountReference {
  platform: string
  username: string
  verified: boolean
}

export interface ProfileSummaryReference {
  username: string
  ownerHandle: string
  avatarLabel: string
  avatarUrl?: string
  location: string
  memberSince: string
  bio: string
  stats: {
    totalItems: number
    totalCollections: number
    totalTrades: number
    totalFollowing: number
  }
  verification: ProfileVerificationReference
  linkedAccounts: ProfileLinkedAccountReference[]
  /**
   * Privacy: when false, the Activity tab is hidden from visitors. The
   * owner always sees their own activity. Defaults to true when the
   * field is omitted on legacy mocks.
   */
  showActivityOnPublicProfile?: boolean
}

export interface ProfileCollectionReference {
  id: string
  name: string
  description: string
  visibility: ProfileCollectionVisibility
  itemCount: number
  totalValue: number
  isWishlist: boolean
  previewLabels: string[]
  previewImages: string[]
}

export interface ProfileListingReference {
  id: string
  title: string
  subtitle: string
  imageLabel: string
  imageUrl: string
  price: number
  forSale: boolean
  forTrade: boolean
  listedAt: string
}

export interface ProfileWishlistReference {
  id: string
  title: string
  subtitle: string
  imageLabel: string
  imageUrl: string
  addedAt: string
}

export interface ProfileTradeCriterion {
  label: string
  value: string
}

export interface ProfileTradeInterestReference {
  id: string
  name: string
  description?: string
  criteria: ProfileTradeCriterion[]
  addedAt: string
}

/**
 * Activity feed entry. Each `type` carries an icon and a click destination
 * (when applicable) so a viewer can jump from the narrative line to the
 * thing the activity refers to.
 */
export type ProfileActivityType =
  | "listing_created"
  | "listing_sold"
  | "trade_completed"
  | "collection_created"
  | "item_added_to_collection"
  | "wishlist_added"
  | "wishlist_acquired"
  | "verified"
  /** Legacy generic types kept for backward compatibility with the
   *  earlier mock shape. Prefer the specific types above for new data. */
  | "listing"
  | "trade"
  | "collection"
  | "offer"
  | "follow"

export interface ProfileActivityReference {
  id: string
  type: ProfileActivityType
  description: string
  timestamp: string
  /** Optional click destination for the row. */
  href?: string
}

export interface ProfilePageReferenceData {
  profile: ProfileSummaryReference
  collections: ProfileCollectionReference[]
  forSaleItems: ProfileListingReference[]
  tradeInterests: ProfileTradeInterestReference[]
  lookingForItems: ProfileWishlistReference[]
  activity: ProfileActivityReference[]
}
