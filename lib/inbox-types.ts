export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  read: boolean
  type:
    | "text"
    | "offer"
    | "offer_accepted"
    | "offer_declined"
    | "offer_countered"
    | "offer_expired"
    | "system"
  offer_id?: string
}

export interface OfferItem {
  id: string
  title: string
  subtitle?: string
  image: string
  price?: number
}

export interface Offer {
  id: string
  conversation_id: string
  sender_id: string
  status: "pending" | "accepted" | "declined" | "countered" | "expired"
  their_items: OfferItem[]
  your_items: OfferItem[]
  /** positive = they add cash, negative = you add cash */
  cash_adjustment: number
  expires_at: string | null
  created_at: string
  /** Optional note the sender added when building this proposal. */
  message?: string
}

export interface ConversationParticipant {
  id: string
  username: string
  avatar_url: string
  location?: string
  joined_at: string
  stats: {
    items: number
    collections: number
    transactions: number
    response_rate: number
    avg_response_time: string
  }
  feedback_score?: number
  verification: {
    email: boolean
    phone: boolean
    id: boolean
  }
  linked_accounts: {
    platform: string
    username: string
    verified: boolean
  }[]
  bio?: string
}

export interface Conversation {
  id: string
  participant: ConversationParticipant
  subject_type: "direct" | "listing" | "collection_item"
  subject?: {
    id: string
    title: string
    subtitle?: string
    image: string
    price?: number
  }
  last_message?: {
    content: string
    created_at: string
    sender_id: string
  }
  active_offer?: Offer
  unread_count: number
  created_at: string
  updated_at: string
}

export const CURRENT_USER_ID = "current-user"
