"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, Clock, MessageSquare, RepeatIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MessageList } from "./message-list"
import { ChatPanel } from "./chat-panel"
import { UserProfilePanel } from "./user-profile-panel"
import { CounterOfferModal } from "./counter-offer-modal"
import { CashCounterOfferModal } from "./cash-counter-offer-modal"
import { demoConversations, demoMessages } from "@/lib/inbox-demo-data"
import type { Conversation, Message, Offer } from "@/lib/inbox-types"

export function InboxContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const conversationId = searchParams.get("id")

  const [conversations, setConversations] = useState<Conversation[]>(demoConversations)
  const [messages, setMessages] = useState<Record<string, Message[]>>(demoMessages)
  const [filter, setFilter] = useState<"all" | "received" | "sent">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileView, setMobileView] = useState<"list" | "chat" | "profile" | "offer-detail" | "counter" | "cash-counter">("list")
  const [desktopCounterActive, setDesktopCounterActive] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const selectedConversation = conversations.find((c) => c.id === conversationId) ?? null

  useEffect(() => {
    if (conversationId && typeof window !== "undefined" && window.innerWidth < 1024) {
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

  const handleViewProfile = () => setMobileView("profile")
  const handleBackToChat = () => setMobileView("chat")
  const handleBackFromCounter = () => setMobileView("chat")
  const handleViewOfferDetail = () => setMobileView("offer-detail")
  const handleBackFromOfferDetail = () => setMobileView("chat")

  const formatExpiry = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    if (diffHours < 0) return "Expired"
    if (diffHours < 24) return `${diffHours}h remaining`
    return `${diffDays}d remaining`
  }

  const handleOfferDetailAction = (action: "accept" | "decline" | "counter") => {
    handleOfferAction(action)
    if (action !== "counter") setMobileView("chat")
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
        content: "Sounds good, I accept your offer. What are the next steps?",
        created_at: new Date(Date.now() + 100).toISOString(),
        read: true,
        type: "text",
      }
      setMessages((prev) => ({
        ...prev,
        [selectedConversation.id]: [
          ...(prev[selectedConversation.id] || []),
          acceptMessage,
          followUpMessage,
        ],
      }))
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id
            ? { ...c, active_offer: { ...offer, status: "accepted" } }
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
          c.id === selectedConversation.id ? { ...c, active_offer: undefined } : c,
        ),
      )
    } else if (action === "counter") {
      const isCashOnlyOffer =
        offer.their_items.length === 0 && (offer.cash_adjustment || 0) > 0
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setMobileView(isCashOnlyOffer ? "cash-counter" : "counter")
      } else {
        setDesktopCounterActive(true)
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
        c.id === selectedConversation.id ? { ...c, active_offer: counterOffer } : c,
      ),
    )
  }

  const filteredConversations = conversations.filter((c) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matchesUsername = c.participant.username.toLowerCase().includes(q)
      const matchesSubject = c.subject?.title.toLowerCase().includes(q)
      const matchesMessage = c.last_message?.content.toLowerCase().includes(q)
      if (!matchesUsername && !matchesSubject && !matchesMessage) return false
    }
    return true
  })

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0)

  return (
    <div className="flex overflow-hidden" style={{ height: isMobile ? 'calc(100dvh - 65px - 72px)' : 'calc(100vh - 65px)' }}>
      {/* Left rail */}
      <div
        className={cn(
          "w-full flex-shrink-0 border-r border-border bg-background lg:w-80 xl:w-96 lg:block",
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

      {/* Center chat */}
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col bg-background lg:flex overflow-hidden",
          mobileView === "chat" ? "flex" : "hidden lg:flex",
        )}
      >
        {selectedConversation && desktopCounterActive && selectedConversation.active_offer ? (
          <CounterOfferModal
            originalOffer={selectedConversation.active_offer}
            otherPartyUsername={selectedConversation.participant.username}
            onClose={() => setDesktopCounterActive(false)}
            onCounterSent={(o) => {
              handleCounterSent(o)
              setDesktopCounterActive(false)
            }}
          />
        ) : selectedConversation ? (
          <ChatPanel
            conversation={selectedConversation}
            messages={messages[selectedConversation.id] || []}
            onSendMessage={handleSendMessage}
            onOfferAction={handleOfferAction}
            onBack={handleBackToList}
            onViewProfile={handleViewProfile}
            onViewOfferDetail={handleViewOfferDetail}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <MessageSquare className="mb-4 h-16 w-16 text-muted-foreground/30" />
            <p className="text-lg font-medium text-foreground">Select a conversation</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a message from the list to start chatting
            </p>
          </div>
        )}
      </div>

      {/* Right rail - profile */}
      {selectedConversation && (
        <div
          className={cn(
            "w-full flex-shrink-0 overflow-y-auto border-l border-border bg-background xl:w-80 xl:block",
            mobileView === "profile" ? "block" : "hidden xl:block",
          )}
        >
          <div className="flex items-center gap-2 border-b border-border p-4 xl:hidden">
            <button
              onClick={handleBackToChat}
              className="rounded-lg p-2 transition-colors hover:bg-card"
              aria-label="Back to chat"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="font-semibold">Profile</span>
          </div>
          <UserProfilePanel participant={selectedConversation.participant} />
        </div>
      )}

      {/* Mobile offer-detail panel — full-screen, hidden on desktop */}
      {selectedConversation?.active_offer && mobileView === "offer-detail" && (
        <div className="@container fixed inset-0 z-50 flex flex-col bg-background lg:hidden">
          {/* Topbar */}
          <div className="flex flex-shrink-0 items-center gap-3 border-b border-border px-4 py-2">
            <button
              onClick={handleBackFromOfferDetail}
              className="rounded-lg p-2 transition-colors hover:bg-card"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="font-semibold">Trade Offer</h2>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 divide-y divide-border overflow-y-auto pb-[72px] lg:pb-0">
            {/* Their offer */}
            {selectedConversation.active_offer.their_items.length > 0 ? (
              <div className="p-4">
                <p className="mb-2 text-xs text-muted-foreground">They offer</p>
                <div className="flex flex-col gap-2">
                  {selectedConversation.active_offer.their_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg bg-card/50 px-2.5 py-2"
                    >
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="h-14 w-14 flex-shrink-0 rounded-md object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.title}</p>
                        {item.price != null && (
                          <p className="text-xs text-muted-foreground">
                            ${item.price.toLocaleString('en-US')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {selectedConversation.active_offer.cash_adjustment > 0 && (
                    <p className="pl-[62px] text-sm font-medium text-primary">
                      + ${selectedConversation.active_offer.cash_adjustment.toLocaleString('en-US')} cash
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4">
                <p className="mb-1 text-xs text-muted-foreground">Their offer</p>
                <p className="text-2xl font-bold text-primary">
                  ${selectedConversation.active_offer.cash_adjustment.toLocaleString('en-US')}
                </p>
              </div>
            )}

            {/* Swap divider */}
            {selectedConversation.active_offer.their_items.length > 0 && (
              <div className="flex justify-center py-3">
                <RepeatIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            )}

            {/* For your */}
            <div className="p-4">
              <p className="mb-2 text-xs text-muted-foreground">For your</p>
              <div className="flex flex-col gap-2">
                {selectedConversation.active_offer.your_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg bg-card/50 px-2.5 py-2"
                  >
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      className="h-14 w-14 flex-shrink-0 rounded-md object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      {item.price != null && (
                        <p className="text-xs text-muted-foreground">
                          ${item.price.toLocaleString('en-US')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timer */}
            {selectedConversation.active_offer.expires_at && (
              <div className="flex items-center gap-2 p-4">
                <Clock className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {formatExpiry(selectedConversation.active_offer.expires_at)}
                </span>
              </div>
            )}
          </div>

          {/* Sticky action buttons */}
          <div className="flex flex-shrink-0 flex-col gap-2 border-t border-border p-4">
            <Button
              className="min-h-[52px] w-full"
              onClick={() => handleOfferDetailAction("accept")}
            >
              Accept
            </Button>
            <Button
              variant="outline"
              className="min-h-[52px] w-full border-border bg-transparent"
              onClick={() => handleOfferDetailAction("counter")}
            >
              Counter
            </Button>
            <Button
              variant="ghost"
              className="min-h-[52px] w-full text-muted-foreground"
              onClick={() => handleOfferDetailAction("decline")}
            >
              Decline
            </Button>
          </div>
        </div>
      )}

      {/* Mobile counter panels — full-screen, hidden on desktop */}
      {selectedConversation?.active_offer && mobileView === "counter" && (
        <div className="fixed inset-0 z-50 bg-background lg:hidden">
          <CounterOfferModal
            originalOffer={selectedConversation.active_offer}
            otherPartyUsername={selectedConversation.participant.username}
            onClose={handleBackFromCounter}
            onCounterSent={(o) => {
              handleCounterSent(o)
              handleBackFromCounter()
            }}
          />
        </div>
      )}
      {selectedConversation?.active_offer && mobileView === "cash-counter" && (
        <div className="fixed inset-0 z-50 bg-background lg:hidden">
          <CashCounterOfferModal
            open={true}
            onClose={handleBackFromCounter}
            originalOffer={selectedConversation.active_offer}
            otherPartyUsername={selectedConversation.participant.username}
            onCounterSent={(o) => {
              handleCounterSent(o)
              handleBackFromCounter()
            }}
          />
        </div>
      )}
    </div>
  )
}
