export interface Community {
  id: string
  name: string
  slug?: string
  description?: string | null
  icon?: string | null
  member_count?: number
}

export interface ProfileSummary {
  id?: string
  username?: string
  avatar_url?: string | null
  location?: string | null
}

export interface Listing {
  id: string
  title: string
  subtitle?: string | null
  description?: string | null
  price: number
  images: string[]
  location?: string | null
  seller?: ProfileSummary
}

export interface DiscoverListing extends Listing {
  for_trade?: boolean
  is_private?: boolean
  published_groups?: Community[]
  matched_saved_search?: string
}

export type CollectionVisibility = "private" | "unlisted" | "public"

export interface Collection {
  id: string
  /** Username of the user who owns this collection. Used to decide whether
   *  the current viewer sees the owner or visitor view. Optional in legacy
   *  mocks; treated as "owned by the current user" when omitted. */
  owner_id?: string
  name: string
  description?: string | null
  cover_image?: string | null
  visibility?: CollectionVisibility
  is_wishlist?: boolean
  tags?: string[]
  item_count?: number
  total_user_value?: number
  total_ai_value?: number
}

export interface TradeableItem {
  id: string
  type: "listing" | "collection_item"
  title: string
  subtitle?: string | null
  images: string[]
  price?: number | null
  user?: ProfileSummary
  published_groups?: Community[]
  niche?: {
    name: string
    icon?: string | null
  }
}

export interface PerfectMatch {
  id: string
  my_item: Pick<TradeableItem, "title">
  their_item: TradeableItem
  match_score: number
}

export interface InboundInterest {
  id: string
  my_item: Pick<TradeableItem, "title">
  their_item: TradeableItem
  match_score: number
}
