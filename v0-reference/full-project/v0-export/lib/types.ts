export interface Community {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  member_count: number
}

export interface CommunityEnhanced extends Community {
  cover_image: string | null
  privacy: "public" | "private" | "invite_only"
  created_by: string | null
  category: string | null
  settings: Record<string, unknown>
  updated_at: string
  created_at?: string
  // Computed/joined fields
  is_member?: boolean
  user_role?: "owner" | "admin" | "moderator" | null
  recent_posts?: CommunityPost[]
  listing_count?: number
}

export type CommunityPostType = "discussion" | "question" | "show_and_tell"

export interface CommunityPost {
  id: string
  community_id: string
  author_id: string
  post_type: CommunityPostType
  title: string
  content: string
  images: string[]
  is_pinned: boolean
  is_locked: boolean
  like_count: number
  comment_count: number
  created_at: string
  updated_at: string
  // Joined fields
  author?: Profile
  community?: Community
  has_liked?: boolean
  comments?: CommunityPostComment[]
}

export interface CommunityPostComment {
  id: string
  post_id: string
  author_id: string
  parent_id: string | null
  content: string
  like_count: number
  created_at: string
  updated_at: string
  // Joined fields
  author?: Profile
  has_liked?: boolean
  replies?: CommunityPostComment[]
}

export interface CommunityRole {
  community_id: string
  user_id: string
  role: "owner" | "admin" | "moderator"
  granted_at: string
  granted_by: string | null
}

export interface CommunityListing {
  community_id: string
  listing_id: string
  added_at: string
  added_by: string | null
  // Joined fields
  listing?: Listing
}

export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  location: string | null
  phone: string | null
  created_at: string
  communities?: Community[] // User's community memberships
  bio?: string
  response_rate?: number // percentage 0-100
  avg_response_time?: string // e.g., "within hours", "within a day"
  total_listings?: number
  total_sales?: number
  total_collections?: number
  linked_accounts?: LinkedAccount[]
}

export interface Listing {
  id: string
  seller_id: string
  title: string
  subtitle: string | null
  description: string | null
  price: number
  category: string
  subcategory: string | null
  condition: string | null
  payment_methods: string[]
  logistics: string | null
  images: string[]
  location: string | null
  created_at: string
  updated_at: string
  seller?: Profile
}

export interface Conversation {
  id: string
  participant_1: string
  participant_2: string
  created_at: string
  updated_at: string
  // Populated fields
  other_user?: Profile
  last_message?: Message
  unread_count?: number
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  listing_id: string | null
  read: boolean
  created_at: string
  sender?: Profile
  listing?: Listing // Populated when listing_id is present
}

export interface Offer {
  id: string
  listing_id: string
  sender_id: string
  recipient_id: string
  amount: number
  message: string | null
  status: "pending" | "accepted" | "declined" | "expired"
  created_at: string
  expires_at: string
  listing?: Listing
  sender?: Profile
}

export type CollectionVisibility = "private" | "unlisted" | "public"

export interface Collection {
  id: string
  user_id: string
  name: string
  description: string | null
  cover_image: string | null
  visibility: CollectionVisibility // 'private' = only you, 'unlisted' = anyone with link, 'public' = on profile
  share_token: string
  is_wishlist: boolean
  notes: string | null
  created_at: string
  updated_at: string
  // Computed fields
  item_count?: number
  total_user_value?: number
  total_ai_value?: number
  items?: CollectionItem[]
}

export interface CollectionItem {
  id: string
  collection_id: string
  listing_id: string | null
  title: string
  subtitle: string | null
  description: string | null
  images: string[]
  category: string | null
  subcategory: string | null
  condition: string | null
  user_estimated_value: number | null
  ai_suggested_value: number | null
  ai_value_updated_at: string | null
  purchase_price: number | null
  purchase_date: string | null
  is_owned: boolean
  priority: number
  notes: string | null
  custom_attributes: Record<string, unknown>
  sort_order: number
  for_sale: boolean
  for_trade: boolean
  asking_price: number | null
  created_at: string
  updated_at: string
  // Populated fields
  listing?: Listing
  collection?: Collection
}

export interface CollectionShare {
  id: string
  collection_id: string
  shared_with_user_id: string | null
  can_comment: boolean
  created_at: string
  shared_with_user?: Profile
}

export interface CollectionComment {
  id: string
  collection_id: string
  item_id: string | null
  user_id: string
  content: string
  created_at: string
  updated_at: string
  user?: Profile
}

// Value summary for analytics
export interface CollectionValueSummary {
  total_items: number
  owned_items: number
  wishlist_items: number
  total_user_value: number
  total_ai_value: number
  total_purchase_cost: number
  estimated_gain_user: number // user_value - purchase_cost
  estimated_gain_ai: number // ai_value - purchase_cost
}

export interface LinkedAccount {
  id: string
  user_id: string
  platform: "ebay" | "reverb" | "facebook_marketplace" | "etsy" | "discogs" | "craigslist"
  platform_username: string | null
  profile_url: string | null
  verified: boolean
  created_at: string
}

export interface TradeOffer {
  id: string
  listing_id: string
  sender_id: string
  recipient_id: string
  cash_amount: number
  message: string | null
  status: "pending" | "accepted" | "declined" | "countered" | "expired" | "withdrawn"
  created_at: string
  updated_at: string
  expires_at: string
  // Populated fields
  listing?: Listing
  sender?: Profile
  recipient?: Profile
  offered_items?: TradeOfferItem[]
}

export interface TradeOfferItem {
  id: string
  trade_offer_id: string
  listing_id: string
  created_at: string
  // Populated fields
  listing?: Listing
}

export interface TradeCriteria {
  id: string
  listing_id: string | null
  collection_item_id: string | null
  user_id: string
  target_category: string
  target_subcategories: string[]
  acceptable_conditions: string[]
  min_value: number | null
  max_value: number | null
  value_flexibility: "exact" | "flexible" | "any"
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  // Populated fields
  listing?: Listing
  collection_item?: CollectionItem
}

// Represents an item that is available for trade (either a listing or collection item)
export interface TradeableItem {
  id: string
  type: "listing" | "collection_item"
  title: string
  subtitle: string | null
  images: string[]
  category: string | null
  subcategory: string | null
  condition: string | null
  price: number | null // listing price or estimated value
  user_id: string
  user?: Profile
  trade_criteria?: TradeCriteria[]
}

// A perfect match where both parties have mutual interest
export interface PerfectMatch {
  id: string // composite key
  my_item: TradeableItem
  their_item: TradeableItem
  my_criteria?: TradeCriteria // My criteria that matches their item
  their_criteria?: TradeCriteria // Their criteria that matches my item
  match_score: number // 0-100 based on how well criteria align
  created_at?: string
  their_trade_interest_created_at?: string
}

// One-way inbound interest - someone wants my item
export interface InboundInterest {
  id: string
  my_item: TradeableItem
  their_item: TradeableItem
  their_criteria: TradeCriteria // Their criteria that matches my item
  match_score: number
  created_at: string
}

// Summary counts for trade notifications
export interface TradeMatchCounts {
  perfect_matches: number
  inbound_interest: number
}
