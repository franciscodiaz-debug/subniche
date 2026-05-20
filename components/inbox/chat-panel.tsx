"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowLeftRight,
  Info,
  ChevronRight,
  FolderOpen,
  MapPin,
  Package,
  Send,
  CheckCircle,
  X,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ProposalCard } from "@/components/proposal/proposal-card"
import type { Conversation, Message, Offer } from "@/lib/inbox-types"

interface ChatPanelProps {
  conversation: Conversation
  messages: Message[]
  onSendMessage: (content: string) => void
  onOfferAction: (action: "accept" | "decline" | "counter") => void
  onBack: () => void
  onViewProfile: () => void
  onViewOfferDetail?: () => void
}

export function ChatPanel({
  conversation,
  messages,
  onSendMessage,
  onOfferAction,
  onBack,
  onViewProfile,
  onViewOfferDetail,
}: ChatPanelProps) {
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { participant, subject, active_offer } = conversation

  const offerAcceptedIdx = messages.findIndex((m) => m.type === "offer_accepted")
  const isOfferAccepted = offerAcceptedIdx !== -1
  const tradeFinalized =
    isOfferAccepted &&
    messages.slice(offerAcceptedIdx + 1).some((m) => m.type === "text")
  const suggestedChips: string[] =
    !newMessage && isOfferAccepted
      ? tradeFinalized
        ? ["Confirm item condition before shipping"]
        : ["Exchange shipping addresses?", "Discuss payment method"]
      : []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = () => {
    if (!newMessage.trim()) return
    onSendMessage(newMessage.trim())
    setNewMessage("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })

  const renderOfferCard = (offer: Offer) => (
    <ProposalCard
      offer={offer}
      otherPartyUsername={participant.username}
      onAccept={() => onOfferAction("accept")}
      onCounter={() => onOfferAction("counter")}
      onDecline={() => onOfferAction("decline")}
    />
  )

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Sticky header */}
      <div className="flex-shrink-0 border-b border-border">
        <div className="flex items-center gap-3 p-4 py-2">
          <button
            onClick={onBack}
            className="rounded-lg p-2 transition-colors hover:bg-card lg:hidden"
            aria-label="Back to inbox"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={onViewProfile}
            className="flex-shrink-0 xl:pointer-events-none"
            aria-label="View profile"
          >
            <Avatar className="h-10 w-10 lg:h-7 lg:w-7">
              <AvatarImage src={participant.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="text-xs">
                {participant.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </button>
          <div className="min-w-0 flex-1">
            <Link
              href={`/profile/${participant.username}`}
              className="truncate font-semibold text-foreground hover:underline"
            >
              {participant.username}
            </Link>
            {/* Inline mini-profile shown only on mobile (the right-side profile panel covers this on desktop) */}
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-muted-foreground lg:hidden">
              {participant.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{participant.location}</span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <Package className="h-3 w-3" />
                {participant.stats.items}
              </span>
              <span className="flex items-center gap-1">
                <FolderOpen className="h-3 w-3" />
                {participant.stats.collections}
              </span>
            </div>
          </div>
          <button
            onClick={onViewProfile}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-card hover:text-foreground lg:hidden"
            aria-label="View profile info"
          >
            <Info className="h-5 w-5" />
          </button>
        </div>
      </div>

      {subject &&
        !(
          active_offer?.status === "pending" &&
          [...active_offer.your_items, ...active_offer.their_items].some(
            (i) => i.id === subject.id,
          )
        ) && (
        <div className="flex-shrink-0 border-b border-border px-4 py-1.5 lg:hidden">
          <Link
            href={`/listings/${subject.id}`}
            className="inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-card/50 px-2.5 py-1 text-xs transition-colors hover:border-primary/50"
          >
            <img
              src={subject.image || "/placeholder.svg"}
              alt={subject.title}
              className="h-5 w-5 flex-shrink-0 rounded-full object-cover"
            />
            <span className="truncate font-medium text-foreground">{subject.title}</span>
            {subject.price && (
              <span className="flex-shrink-0 text-muted-foreground">
                · ${subject.price.toLocaleString('en-US')}
              </span>
            )}
          </Link>
        </div>
      )}

      {active_offer && active_offer.status === "pending" && (
        <div className="@container flex-shrink-0 bg-background">
          {/* Mobile: compact pill — hidden at wide containers */}
          <div className="px-3 py-2 @[480px]:hidden">
            <button
              onClick={onViewOfferDetail}
              className="flex w-full items-center gap-2 rounded-xl border border-border bg-card px-4 py-3"
            >
              <ArrowLeftRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <div className="flex flex-shrink-0 items-center">
                {[...active_offer.their_items, ...active_offer.your_items]
                  .slice(0, 3)
                  .map((item, idx) => (
                    <img
                      key={item.id}
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      className={cn(
                        "h-6 w-6 rounded-full border-2 border-card object-cover",
                        idx > 0 && "-ml-2",
                      )}
                    />
                  ))}
              </div>
              <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left text-xs font-medium text-foreground">
                {(() => {
                  const yourSide = `your ${active_offer.your_items[0]?.title ?? "item"}`
                  if (active_offer.their_items.length === 0) {
                    return `$${active_offer.cash_adjustment.toLocaleString('en-US')} → ${yourSide}`
                  }
                  const extraCount = active_offer.their_items.length - 1
                  const itemPart =
                    extraCount > 0
                      ? `${active_offer.their_items[0].title} + ${extraCount} more`
                      : active_offer.their_items[0].title
                  const cashPart =
                    active_offer.cash_adjustment > 0
                      ? ` · +$${active_offer.cash_adjustment.toLocaleString('en-US')} cash`
                      : ""
                  return `${itemPart}${cashPart} → ${yourSide}`
                })()}
              </span>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            </button>
          </div>
          {/* Desktop: card banner — hidden at narrow containers */}
          <div className="hidden border-t border-border/40 px-4 py-3 @[480px]:block">
            {renderOfferCard(active_offer)}
          </div>
        </div>
      )}

      {/* Scrolling body */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {subject &&
          !(
            active_offer?.status === "pending" &&
            [...active_offer.your_items, ...active_offer.their_items].some(
              (i) => i.id === subject.id,
            )
          ) && (
            <div className="hidden py-3 lg:block">
              <p className="mb-2 text-xs text-muted-foreground">Discussing:</p>
              <Link
                href={`/listings/${subject.id}`}
                className="group inline-flex items-center gap-2.5 rounded-lg border border-border bg-card/50 p-2.5 transition-colors hover:border-primary/50"
              >
                <img
                  src={subject.image || "/placeholder.svg"}
                  alt={subject.title}
                  className="h-10 w-10 flex-shrink-0 rounded-md object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{subject.title}</p>
                  {subject.price && (
                    <p className="text-xs text-muted-foreground">
                      ${subject.price.toLocaleString('en-US')}
                    </p>
                  )}
                </div>
                <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
              </Link>
            </div>
          )}

        {messages.map((message) => {
          const isOwn = message.sender_id === "current-user"

          if (message.type === "offer" && active_offer) {
            return (
              <div key={message.id} className="flex justify-center">
                <span className="text-xs text-muted-foreground">
                  {isOwn ? "You" : participant.username} made an offer
                </span>
              </div>
            )
          }

          if (message.type === "offer_accepted") {
            return (
              <div key={message.id} className="flex justify-center">
                <div className="flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-4 py-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {isOwn ? "You accepted" : `${participant.username} accepted`} the offer
                  </span>
                </div>
              </div>
            )
          }

          if (message.type === "offer_declined") {
            return (
              <div key={message.id} className="flex justify-center">
                <div className="flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-4 py-2">
                  <X className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">
                    {isOwn ? "You declined" : `${participant.username} declined`} the offer
                  </span>
                </div>
              </div>
            )
          }

          if (message.type === "offer_countered") {
            return (
              <div key={message.id} className="flex justify-center">
                <div className="flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2">
                  <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {isOwn ? "You sent" : `${participant.username} sent`} a counter offer
                  </span>
                </div>
              </div>
            )
          }

          return (
            <div
              key={message.id}
              className="group -mx-2 rounded px-2 py-1 transition-colors hover:bg-card/30"
            >
              <div className="flex items-baseline gap-2">
                <span
                  className={cn(
                    "text-sm font-semibold",
                    isOwn ? "text-green-600" : "text-primary",
                  )}
                >
                  {isOwn ? "You" : participant.username}
                </span>
                <span suppressHydrationWarning className="text-xs text-muted-foreground">
                  {formatTime(message.created_at)}
                </span>
              </div>
              <p className="mt-0.5 whitespace-pre-wrap text-sm text-foreground">
                {message.content}
              </p>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {suggestedChips.length > 0 && (
        <div className="flex-shrink-0 px-4 pb-3 pt-2">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4">
            {suggestedChips.map((chip) => (
              <button
                key={chip}
                onClick={() => setNewMessage(chip)}
                className="flex-shrink-0 rounded-full border border-border px-4 py-2 text-sm transition-colors hover:border-primary/50"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Composer */}
      <div className="flex-shrink-0 border-t border-border p-4">
        <div className="flex items-end gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="max-h-32 flex-1 resize-none rounded-lg border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            style={{ minHeight: "48px" }}
          />
          <Button onClick={handleSend} disabled={!newMessage.trim()} className="h-12 px-4">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
