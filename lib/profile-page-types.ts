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

export interface ProfileActivityReference {
  id: string
  type: "listing" | "trade" | "collection" | "offer" | "follow"
  description: string
  timestamp: string
}

export interface ProfilePageReferenceData {
  profile: ProfileSummaryReference
  collections: ProfileCollectionReference[]
  forSaleItems: ProfileListingReference[]
  tradeInterests: ProfileTradeInterestReference[]
  lookingForItems: ProfileWishlistReference[]
  activity: ProfileActivityReference[]
}
