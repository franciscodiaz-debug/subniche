"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { MessageList } from "./message-list"
import { ChatPanel } from "./chat-panel"
import { UserProfilePanel } from "./user-profile-panel"
import { CounterOfferModal } from "./counter-offer-modal"
import { CashCounterOfferModal } from "./cash-counter-offer-modal"
import { ArrowLeft } from "lucide-react"
import type { Conversation, Message, Offer } from "@/lib/types/inbox"

// Demo data
const demoConversations: Conversation[] = [
  {
    id: "conv-1",
    participant: {
      id: "user-1",
      username: "vintagegearnyc",
      avatar_url: "/bearded-man-avatar.png",
      location: "New York, NY",
      joined_at: "2022-03-15T00:00:00Z",
      stats: {
        items: 47,
        collections: 8,
        transactions: 23,
        response_rate: 95,
        avg_response_time: "< 1 hour",
      },
      feedback_score: 98,
      verification: { email: true, phone: true, id: true },
      linked_accounts: [
        { platform: "reverb", username: "VintageGearNYC", verified: true },
        { platform: "ebay", username: "vintagegear_nyc", verified: true },
      ],
      bio: "Collector of vintage guitars and amps since 2010. Specializing in pre-CBS Fenders and Marshall plexi amps.",
    },
    subject_type: "listing",
    subject: {
      id: "listing-1",
      title: "1965 Fender Stratocaster",
      subtitle: "Pre-CBS, Original Pickups",
      image: "/vintage-fender-stratocaster-guitar.jpg",
      price: 18500,
    },
    last_message: {
      content: "Would you consider a trade plus cash?",
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
      sender_id: "user-1",
    },
    active_offer: {
      id: "offer-1",
      conversation_id: "conv-1",
      sender_id: "user-1",
      status: "pending",
      their_items: [
        {
          id: "item-1",
          title: "1959 Gibson Les Paul",
          subtitle: "Sunburst, PAF Pickups",
          image: "/vintage-gibson-les-paul-guitar.jpg",
          price: 15000,
        },
      ],
      your_items: [
        {
          id: "listing-1",
          title: "1965 Fender Stratocaster",
          subtitle: "Pre-CBS, Original Pickups",
          image: "/vintage-fender-stratocaster-guitar.jpg",
          price: 18500,
        },
      ],
      cash_adjustment: 4000,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    unread_count: 2,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "conv-2",
    participant: {
      id: "user-2",
      username: "tubescreamer_fan",
      avatar_url: "/woman-with-glasses-avatar.png",
      location: "Austin, TX",
      joined_at: "2023-06-20T00:00:00Z",
      stats: {
        items: 12,
        collections: 3,
        transactions: 5,
        response_rate: 88,
        avg_response_time: "2-3 hours",
      },
      feedback_score: 100,
      verification: { email: true, phone: false, id: false },
      linked_accounts: [{ platform: "reddit", username: "tubescreamer_fan", verified: true }],
      bio: "Pedal enthusiast and tone chaser. Always looking for vintage Tube Screamers and rare fuzzes.",
    },
    subject_type: "direct",
    last_message: {
      content: "Hey! Saw your collection, really impressive stuff!",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      sender_id: "user-2",
    },
    unread_count: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "conv-3",
    participant: {
      id: "user-3",
      username: "marshall_maven",
      avatar_url: "/older-man-avatar.png",
      location: "Nashville, TN",
      joined_at: "2021-01-10T00:00:00Z",
      stats: {
        items: 89,
        collections: 15,
        transactions: 67,
        response_rate: 99,
        avg_response_time: "< 30 mins",
      },
      feedback_score: 100,
      verification: { email: true, phone: true, id: true },
      linked_accounts: [
        { platform: "reverb", username: "MarshallMaven", verified: true },
        { platform: "ebay", username: "marshall_maven_amps", verified: true },
        { platform: "facebook", username: "marshall.maven", verified: true },
      ],
      bio: "30+ years in the vintage amp business. If it glows, I know it.",
    },
    subject_type: "listing",
    subject: {
      id: "listing-2",
      title: "Marshall JCM800 2203",
      subtitle: "1982, Vertical Input",
      image: "/marshall-jcm800-amplifier.jpg",
      price: 2800,
    },
    last_message: {
      content: "Thanks for the purchase! I'll ship it out tomorrow.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      sender_id: "user-3",
    },
    unread_count: 0,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "conv-4",
    participant: {
      id: "user-4",
      username: "pedalboard_pro",
      avatar_url: "/young-man-avatar.png",
      location: "Seattle, WA",
      joined_at: "2023-11-05T00:00:00Z",
      stats: {
        items: 8,
        collections: 2,
        transactions: 1,
        response_rate: 70,
        avg_response_time: "1-2 days",
      },
      verification: { email: true, phone: false, id: false },
      linked_accounts: [],
      bio: "New to collecting, but learning fast!",
    },
    subject_type: "listing",
    subject: {
      id: "listing-3",
      title: "Boss CE-2 Chorus",
      subtitle: "Made in Japan, Green Label",
      image: "/boss-ce2-chorus-pedal.jpg",
      price: 275,
    },
    last_message: {
      content: "Is this still available?",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
      sender_id: "user-4",
    },
    unread_count: 0,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "conv-5",
    participant: {
      id: "user-5",
      username: "tone_chaser_la",
      avatar_url: "/man-with-sunglasses-avatar.jpg",
      location: "Los Angeles, CA",
      joined_at: "2022-08-10T00:00:00Z",
      stats: {
        items: 31,
        collections: 5,
        transactions: 18,
        response_rate: 92,
        avg_response_time: "1-2 hours",
      },
      feedback_score: 96,
      verification: { email: true, phone: true, id: false },
      linked_accounts: [{ platform: "reverb", username: "ToneChaserLA", verified: true }],
      bio: "Session guitarist always hunting for that perfect tone. Cash buyer, quick transactions.",
    },
    subject_type: "listing",
    subject: {
      id: "listing-4",
      title: "1962 Fender Jazzmaster",
      subtitle: "Olympic White, Matching Headstock",
      image: "/vintage-fender-jazzmaster-white-guitar.jpg",
      price: 12500,
    },
    last_message: {
      content: "I can do $11,000 cash today if you're interested.",
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
      sender_id: "user-5",
    },
    active_offer: {
      id: "offer-2",
      conversation_id: "conv-5",
      sender_id: "user-5",
      status: "pending",
      their_items: [], // No trade items, just cash
      your_items: [
        {
          id: "listing-4",
          title: "1962 Fender Jazzmaster",
          subtitle: "Olympic White, Matching Headstock",
          image: "/vintage-fender-jazzmaster-white-guitar.jpg",
          price: 12500,
        },
      ],
      cash_adjustment: 11000, // They're offering $11,000 cash
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 1 day
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 45).toISOString(),
    },
    unread_count: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 45).toISOString(),
  },
]

const demoMessages: Record<string, Message[]> = {
  "conv-1": [
    {
      id: "msg-1",
      conversation_id: "conv-1",
      sender_id: "user-1",
      content: "Hi! I'm interested in your 1965 Stratocaster. Beautiful guitar!",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      read: true,
      type: "text",
    },
    {
      id: "msg-2",
      conversation_id: "conv-1",
      sender_id: "current-user",
      content: "Thanks! It's been in my collection for about 5 years. What would you like to know?",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2.5).toISOString(),
      read: true,
      type: "text",
    },
    {
      id: "msg-3",
      conversation_id: "conv-1",
      sender_id: "user-1",
      content: "I have a '59 Les Paul I'd be willing to trade. Would you consider a trade plus cash?",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      read: true,
      type: "text",
    },
    {
      id: "msg-4",
      conversation_id: "conv-1",
      sender_id: "user-1",
      content: "",
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      read: false,
      type: "offer",
      offer_id: "offer-1",
    },
    {
      id: "msg-5",
      conversation_id: "conv-1",
      sender_id: "user-1",
      content: "Let me know what you think of the offer!",
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: false,
      type: "text",
    },
  ],
  "conv-2": [
    {
      id: "msg-6",
      conversation_id: "conv-2",
      sender_id: "user-2",
      content: "Hey! Saw your collection, really impressive stuff!",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      read: false,
      type: "text",
    },
  ],
  "conv-3": [
    {
      id: "msg-7",
      conversation_id: "conv-3",
      sender_id: "current-user",
      content: "I'd like to buy the JCM800. Is it still available?",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      read: true,
      type: "text",
    },
    {
      id: "msg-8",
      conversation_id: "conv-3",
      sender_id: "user-3",
      content: "Yes! It's all yours. I'll send you payment details.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1.5).toISOString(),
      read: true,
      type: "text",
    },
    {
      id: "msg-9",
      conversation_id: "conv-3",
      sender_id: "user-3",
      content: "Thanks for the purchase! I'll ship it out tomorrow.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      read: true,
      type: "text",
    },
  ],
  "conv-4": [
    {
      id: "msg-10",
      conversation_id: "conv-4",
      sender_id: "user-4",
      content: "Is this still available?",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      read: true,
      type: "text",
    },
  ],
  "conv-5": [
    {
      id: "msg-11",
      conversation_id: "conv-5",
      sender_id: "user-5",
      content: "Hey! I've been looking everywhere for a '62 Jazzmaster in Olympic White. Yours is stunning!",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      read: true,
      type: "text",
    },
    {
      id: "msg-12",
      conversation_id: "conv-5",
      sender_id: "current-user",
      content: "Thanks! It's one of my favorites. What would you like to know about it?",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      read: true,
      type: "text",
    },
    {
      id: "msg-13",
      conversation_id: "conv-5",
      sender_id: "user-5",
      content: "Is everything original? Pickups, bridge, electronics?",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      read: true,
      type: "text",
    },
    {
      id: "msg-14",
      conversation_id: "conv-5",
      sender_id: "current-user",
      content: "100% original. Never opened, no mods. Even has the original case and candy.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      read: true,
      type: "text",
    },
    {
      id: "msg-15",
      conversation_id: "conv-5",
      sender_id: "user-5",
      content: "Perfect. I'd like to make you a cash offer.",
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      read: true,
      type: "text",
    },
    {
      id: "msg-16",
      conversation_id: "conv-5",
      sender_id: "user-5",
      content: "",
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      read: false,
      type: "offer",
      offer_id: "offer-2",
    },
    {
      id: "msg-17",
      conversation_id: "conv-5",
      sender_id: "user-5",
      content: "I can do $11,000 cash today if you're interested.",
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      read: false,
      type: "text",
    },
  ],
}

export function InboxContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const conversationId = searchParams.get("id")

  const [conversations, setConversations] = useState<Conversation[]>(demoConversations)
  const [messages, setMessages] = useState<Record<string, Message[]>>(demoMessages)
  const [filter, setFilter] = useState<"all" | "received" | "sent">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileView, setMobileView] = useState<"list" | "chat" | "profile">("list")
  const [showCounterModal, setShowCounterModal] = useState(false)
  const [showCashCounterModal, setShowCashCounterModal] = useState(false)

  const selectedConversation = conversations.find((c) => c.id === conversationId)

  useEffect(() => {
    if (conversationId && window.innerWidth < 1024) {
      setMobileView("chat")
    }
  }, [conversationId])

  const handleSelectConversation = (id: string) => {
    router.push(`/inbox?id=${id}`)
  }

  const handleBackToList = () => {
    setMobileView("list")
    router.push("/inbox")
  }

  const handleViewProfile = () => {
    setMobileView("profile")
  }

  const handleBackToChat = () => {
    setMobileView("chat")
  }

  const handleSendMessage = (content: string) => {
    if (!selectedConversation) return

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversation_id: selectedConversation.id,
      sender_id: "current-user",
      content,
      created_at: new Date().toISOString(),
      read: true,
      type: "text",
    }

    setMessages((prev) => ({
      ...prev,
      [selectedConversation.id]: [...(prev[selectedConversation.id] || []), newMessage],
    }))

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversation.id
          ? {
              ...c,
              last_message: {
                content,
                created_at: newMessage.created_at,
                sender_id: "current-user",
              },
              updated_at: newMessage.created_at,
            }
          : c,
      ),
    )
  }

  const handleOfferAction = (action: "accept" | "decline" | "counter") => {
    if (!selectedConversation?.active_offer) return

    const offer = selectedConversation.active_offer

    if (action === "accept") {
      const acceptMessage: Message = {
        id: `msg-${Date.now()}`,
        conversation_id: selectedConversation.id,
        sender_id: "current-user",
        content: "",
        created_at: new Date().toISOString(),
        read: true,
        type: "offer_accepted",
        offer_id: offer.id,
      }

      const followUpMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        conversation_id: selectedConversation.id,
        sender_id: "current-user",
        content: "Sounds good, I accept your offer! What are the next steps?",
        created_at: new Date(Date.now() + 100).toISOString(),
        read: true,
        type: "text",
      }

      setMessages((prev) => ({
        ...prev,
        [selectedConversation.id]: [...(prev[selectedConversation.id] || []), acceptMessage, followUpMessage],
      }))

      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id
            ? {
                ...c,
                active_offer: { ...offer, status: "accepted" },
              }
            : c,
        ),
      )
    } else if (action === "decline") {
      const declineMessage: Message = {
        id: `msg-${Date.now()}`,
        conversation_id: selectedConversation.id,
        sender_id: "current-user",
        content: "",
        created_at: new Date().toISOString(),
        read: true,
        type: "offer_declined",
        offer_id: offer.id,
      }

      setMessages((prev) => ({
        ...prev,
        [selectedConversation.id]: [...(prev[selectedConversation.id] || []), declineMessage],
      }))

      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id
            ? {
                ...c,
                active_offer: undefined,
              }
            : c,
        ),
      )
    } else if (action === "counter") {
      const isCashOnlyOffer = offer.their_items.length === 0 && (offer.cash_adjustment || 0) > 0
      if (isCashOnlyOffer) {
        setShowCashCounterModal(true)
      } else {
        setShowCounterModal(true)
      }
    }
  }

  const handleCounterSent = (counterOffer: Offer) => {
    if (!selectedConversation) return

    const counterMessage: Message = {
      id: `msg-${Date.now()}`,
      conversation_id: selectedConversation.id,
      sender_id: "current-user",
      content: "",
      created_at: new Date().toISOString(),
      read: true,
      type: "offer_countered",
      offer_id: counterOffer.id,
    }

    setMessages((prev) => ({
      ...prev,
      [selectedConversation.id]: [...(prev[selectedConversation.id] || []), counterMessage],
    }))

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversation.id
          ? {
              ...c,
              active_offer: counterOffer,
            }
          : c,
      ),
    )
  }

  const filteredConversations = conversations.filter((c) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesUsername = c.participant.username.toLowerCase().includes(query)
      const matchesSubject = c.subject?.title.toLowerCase().includes(query)
      const matchesMessage = c.last_message?.content.toLowerCase().includes(query)
      if (!matchesUsername && !matchesSubject && !matchesMessage) return false
    }

    return true
  })

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0)

  return (
    <div className="flex h-[calc(100vh-65px)] overflow-hidden">
      <div
        className={cn(
          "w-full lg:w-80 xl:w-96 border-r border-border flex-shrink-0 bg-background",
          "lg:block",
          mobileView === "list" ? "block" : "hidden",
        )}
      >
        <MessageList
          conversations={filteredConversations}
          selectedId={conversationId}
          onSelect={handleSelectConversation}
          filter={filter}
          onFilterChange={setFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalUnread={totalUnread}
        />
      </div>

      <div
        className={cn(
          "flex-1 flex flex-col bg-background min-w-0",
          "lg:flex",
          mobileView === "chat" ? "flex" : "hidden lg:flex",
        )}
      >
        {selectedConversation ? (
          <ChatPanel
            conversation={selectedConversation}
            messages={messages[selectedConversation.id] || []}
            onSendMessage={handleSendMessage}
            onBackToList={handleBackToList}
            onViewProfile={handleViewProfile}
            onOfferAction={handleOfferAction}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div>
              <h3 className="text-lg font-semibold text-muted-foreground">No conversation selected</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="hidden xl:block w-80 border-l border-border flex-shrink-0 bg-background overflow-y-auto">
        {selectedConversation && <UserProfilePanel participant={selectedConversation.participant} />}
      </div>

      {mobileView === "profile" && selectedConversation && (
        <div className="fixed inset-0 bg-background z-50 lg:hidden overflow-y-auto">
          <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center gap-3">
            <button onClick={handleBackToChat} className="p-2 hover:bg-card rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="font-medium">User Profile</span>
          </div>
          <UserProfilePanel participant={selectedConversation.participant} />
        </div>
      )}

      {selectedConversation?.active_offer && (
        <CounterOfferModal
          originalOffer={selectedConversation.active_offer}
          otherPartyId={selectedConversation.participant.id}
          otherPartyUsername={selectedConversation.participant.username}
          open={showCounterModal}
          onClose={() => setShowCounterModal(false)}
          onCounterSent={handleCounterSent}
        />
      )}

      {selectedConversation?.active_offer && (
        <CashCounterOfferModal
          open={showCashCounterModal}
          onClose={() => setShowCashCounterModal(false)}
          originalOffer={selectedConversation.active_offer}
          otherPartyUsername={selectedConversation.participant.username}
          onCounterSent={handleCounterSent}
        />
      )}
    </div>
  )
}
