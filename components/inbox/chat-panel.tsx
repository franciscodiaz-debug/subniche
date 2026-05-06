"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowLeftRight,
  ChevronRight,
  Send,
  Clock,
  Check,
  CheckCircle,
  X,
  RepeatIcon,
  RefreshCw,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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

  const renderOfferCard = (offer: Offer, isSticky = false) => {
    const isExpired = offer.status === "expired"
    const isPending = offer.status === "pending"
    const isAccepted = offer.status === "accepted"
    const isDeclined = offer.status === "declined"
    const isCashOnlyOffer = offer.their_items.length === 0 && offer.cash_adjustment > 0

    return (
      <div
        className={cn(
          "@container",
          isSticky ? "border-b" : "rounded-lg border",
          "overflow-hidden",
          isSticky && "sticky top-0 z-10",
          isExpired && "opacity-50",
          isPending && "border-primary/50 bg-primary/5",
          isAccepted && "border-green-500/50 bg-green-500/10",
          isDeclined && "border-destructive/50 bg-destructive/10",
          !isPending && !isAccepted && !isDeclined && "border-border bg-card",
        )}
      >
        <div className={cn(isSticky ? "px-4 py-3" : "p-4")}>
          {isCashOnlyOffer ? (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">You&apos;ve received an offer!</h3>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground">{participant.username}</span>
                  {" offered "}
                  <span className="font-bold text-green-600">
                    ${offer.cash_adjustment.toLocaleString('en-US')}
                  </span>
                  {" for your"}
                </span>
              </div>
              {offer.your_items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 p-2.5"
                >
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    className="h-14 w-14 flex-shrink-0 rounded-md object-cover"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      ${item.price?.toLocaleString('en-US')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3 @[400px]:flex-row @[400px]:items-start @[400px]:justify-start @[400px]:gap-9">
              <div className="w-full @[400px]:w-auto @[400px]:flex-shrink-0">
                <p className="mb-1.5 text-left text-sm text-muted-foreground">They offer:</p>
                <div className="flex flex-col gap-2">
                  {offer.their_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex w-full items-center gap-3 rounded-lg bg-card/50 px-2.5 py-2"
                    >
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="h-16 w-16 flex-shrink-0 rounded-md object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{item.title}</p>
                        {item.price && (
                          <p className="text-xs text-muted-foreground">
                            ${item.price.toLocaleString('en-US')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {offer.cash_adjustment !== 0 && (
                    <div className="flex items-center gap-2 text-sm @[400px]:pl-[88px]">
                      <span className="font-medium text-primary">
                        {offer.cash_adjustment > 0
                          ? `plus $${offer.cash_adjustment.toLocaleString('en-US')} cash`
                          : `minus $${Math.abs(offer.cash_adjustment).toLocaleString('en-US')} cash`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center @[400px]:flex-shrink-0 @[400px]:flex-col @[400px]:items-center @[400px]:gap-1 @[400px]:self-center @[400px]:pt-3">
                <RepeatIcon className="h-8 w-8 text-muted-foreground" />
              </div>

              <div className="w-full @[400px]:w-auto @[400px]:flex-shrink-0">
                <p className="mb-1.5 text-left text-sm text-muted-foreground">For your:</p>
                <div className="flex flex-col gap-2">
                  {offer.your_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex w-full items-center gap-3 rounded-lg bg-card/50 px-2.5 py-2"
                    >
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="h-16 w-16 flex-shrink-0 rounded-md object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{item.title}</p>
                        {item.price && (
                          <p className="text-xs text-muted-foreground">
                            ${item.price.toLocaleString('en-US')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isPending && isSticky && (
            <div className="mt-4 flex flex-col gap-2 border-t border-border/50 pt-3">
              {offer.expires_at && (
                <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {formatExpiry(offer.expires_at)}
                </span>
              )}
              <div className="flex w-full gap-2">
                <Button
                  variant="outline"
                  className="min-h-[48px] flex-1 border bg-transparent text-sm font-medium hover:border-green-500"
                  onClick={() => onOfferAction("accept")}
                >
                  Accept
                </Button>
                <Button
                  variant="outline"
                  className="min-h-[48px] flex-1 bg-transparent text-sm font-medium hover:border-primary"
                  onClick={() => onOfferAction("counter")}
                >
                  Counter
                </Button>
                <Button
                  variant="outline"
                  className="min-h-[48px] flex-1 bg-transparent text-sm font-medium text-foreground hover:border-destructive"
                  onClick={() => onOfferAction("decline")}
                >
                  Decline
                </Button>
              </div>
            </div>
          )}

          {isPending && !isSticky && (
            <div className="mt-3 flex items-center justify-end gap-3">
              {offer.expires_at && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatExpiry(offer.expires_at)}
                </span>
              )}
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  className="h-7 bg-green-600 px-2.5 text-xs text-white hover:bg-green-600/90"
                  onClick={() => onOfferAction("accept")}
                >
                  <Check className="mr-1 h-3 w-3" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 bg-transparent px-2.5 text-xs"
                  onClick={() => onOfferAction("counter")}
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Counter
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 bg-transparent px-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onOfferAction("decline")}
                >
                  <X className="mr-1 h-3 w-3" />
                  Decline
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
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
            <Avatar className="h-7 w-7">
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
          </div>
        </div>
      </div>

      {subject &&
        !(
          active_offer?.status === "pending" &&
          active_offer.your_items.some((i) => i.id === subject.id)
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
          {/* Desktop: full sticky banner — hidden at narrow containers */}
          <div className="hidden @[480px]:block">
            {renderOfferCard(active_offer, true)}
          </div>
        </div>
      )}

      {/* Scrolling body */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {subject && (
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
              className="group -mx-2 flex items-start gap-3 rounded px-2 py-1 transition-colors hover:bg-card/30"
            >
              <Avatar className="mt-0.5 h-10 w-10 flex-shrink-0">
                <AvatarImage src={isOwn ? "/placeholder.svg" : (participant.avatar_url || "/placeholder.svg")} />
                <AvatarFallback className="text-sm">
                  {isOwn ? "Y" : participant.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      isOwn ? "text-green-600" : "text-primary",
                    )}
                  >
                    {isOwn ? "You" : participant.username}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(message.created_at)}
                  </span>
                </div>
                <p className="mt-0.5 whitespace-pre-wrap text-sm text-foreground">
                  {message.content}
                </p>
              </div>
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
