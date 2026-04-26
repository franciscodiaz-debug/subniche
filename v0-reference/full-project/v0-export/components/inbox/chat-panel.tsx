"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Send,
  Calendar,
  Package,
  FolderOpen,
  Clock,
  Check,
  X,
  RepeatIcon,
  RefreshCw,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { Conversation, Message, Offer } from "@/lib/types/inbox"

interface ChatPanelProps {
  conversation: Conversation
  messages: Message[]
  onSendMessage: (content: string) => void
  onOfferAction: (action: "accept" | "decline" | "counter") => void
  onBack: () => void
  onViewProfile: () => void
}

export function ChatPanel({
  conversation,
  messages,
  onSendMessage,
  onOfferAction,
  onBack,
  onViewProfile,
}: ChatPanelProps) {
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { participant, subject, active_offer } = conversation

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })
  }

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
          isSticky ? "border-b" : "border rounded-lg",
          "overflow-hidden",
          isSticky && "sticky top-0 z-10",
          isExpired && "opacity-50",
          isPending && "border-amber-500/50 bg-amber-500/5",
          isAccepted && "border-emerald-500/50 bg-emerald-500/5",
          isDeclined && "border-red-500/50 bg-red-500/5",
          !isPending && !isAccepted && !isDeclined && "border-border bg-card",
        )}
      >
        <div className={cn(isSticky ? "px-4 py-3" : "p-4")}>
          {isCashOnlyOffer ? (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">You've received an offer!</h3>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-muted-foreground">
                  <span className="text-foreground font-medium">{conversation.participant.username}</span>
                  {" offered "}
                  <span className="text-emerald-500 font-bold">${offer.cash_adjustment.toLocaleString()}</span>
                  {" for your"}
                </span>
              </div>
              {offer.your_items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 bg-card/50 rounded-lg p-2.5 border border-border/50"
                >
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    className="h-14 w-14 rounded-md object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">${item.price?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-start justify-start gap-9">
              <div className="flex-shrink-0">
                <p className="text-muted-foreground mb-1.5 text-left text-sm">They offer:</p>
                <div className="flex flex-col gap-2">
                  {offer.their_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-card/50 rounded-lg px-2.5 py-2 pb-0">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="h-16 w-16 rounded-md object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{item.title}</p>
                        {item.price && <p className="text-xs text-muted-foreground">${item.price.toLocaleString()}</p>}
                      </div>
                    </div>
                  ))}
                  {offer.cash_adjustment !== 0 && (
                    <div className="flex items-center gap-2 text-sm py-0 pl-[88px]">
                      <span className="text-emerald-500 font-medium">
                        {offer.cash_adjustment > 0
                          ? `plus $${offer.cash_adjustment.toLocaleString()} cash`
                          : `minus $${Math.abs(offer.cash_adjustment).toLocaleString()} cash`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center flex-shrink-0 self-center pb-[px] gap-1 pt-3">
                <RepeatIcon className="text-muted-foreground w-8 h-8" />
              </div>

              <div className="flex-shrink-0">
                <p className="text-muted-foreground mb-1.5 text-left text-sm">For your:</p>
                <div className="flex flex-col gap-2">
                  {offer.your_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-card/50 rounded-lg px-2.5 py-2">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="h-16 w-16 rounded-md object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{item.title}</p>
                        {item.price && <p className="text-xs text-muted-foreground">${item.price.toLocaleString()}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isPending && isSticky && (
            <div className="flex items-center justify-start gap-4 mt-4 pt-3 border-t border-border/50">
              {offer.expires_at && (
                <span className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
                  <Clock className="h-4 w-4" />
                  {formatExpiry(offer.expires_at)}
                </span>
              )}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:border-emerald-500 h-9 px-4 text-sm bg-transparent border font-medium"
                  onClick={() => onOfferAction("accept")}
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="hover:border-yellow-400 bg-transparent h-9 px-4 text-sm font-medium"
                  onClick={() => onOfferAction("counter")}
                >
                  Counter
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="hover:border-red-500 bg-transparent h-9 px-4 text-sm text-foreground font-medium"
                  onClick={() => onOfferAction("decline")}
                >
                  Decline
                </Button>
              </div>
            </div>
          )}

          {isPending && !isSticky && (
            <div className="flex items-center justify-end gap-3 mt-3">
              {offer.expires_at && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatExpiry(offer.expires_at)}
                </span>
              )}
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 h-7 px-2.5 text-xs"
                  onClick={() => onOfferAction("accept")}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-transparent h-7 px-2.5 text-xs"
                  onClick={() => onOfferAction("counter")}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Counter
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10 bg-transparent h-7 px-2.5 text-xs"
                  onClick={() => onOfferAction("decline")}
                >
                  <X className="h-3 w-3 mr-1" />
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
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 border-b border-border">
        <div className="p-4 flex items-center gap-3 py-2">
          <button onClick={onBack} className="lg:hidden p-2 hover:bg-card rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button onClick={onViewProfile} className="flex items-center gap-3 flex-1 min-w-0 xl:pointer-events-none">
            <Avatar className="h-7 w-7">
              <AvatarImage src={participant.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="text-xs">{participant.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate">{participant.username}</p>
            </div>
          </button>
        </div>
      </div>

      {active_offer && active_offer.status === "pending" && (
        <div className="flex-shrink-0 bg-background">{renderOfferCard(active_offer, true)}</div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-start gap-4 py-6 pb-0 pt-[16]">
          <Avatar className="h-20 w-20 flex-shrink-0">
            <AvatarImage src={participant.avatar_url || "/placeholder.svg"} />
            <AvatarFallback className="text-2xl">{participant.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-foreground leading-tight">{participant.username}</h2>
              <Link
                href={`/profile/${participant.id}`}
                className="text-muted-foreground hover:text-yellow-400 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground mt-0 py-0.5">
              <span className="text-sm">{participant.location}</span>
              <span className="text-muted-foreground/50">·</span>
              <span className="flex items-center gap-1 text-sm">
                <Calendar className="h-3 w-3" />
                Joined {formatDate(participant.joined_at)}
              </span>
            </div>
            {participant.feedback_score && (
              <div className="flex items-center gap-2 mt-1 text-muted-foreground">{/* Feedback score display */}</div>
            )}
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0 py-0">
              <span className="flex items-center gap-1">
                <Package className="h-3 w-3" />
                {participant.stats.items} items
              </span>
              <span className="text-muted-foreground/30">·</span>
              <span className="flex items-center gap-1">
                <FolderOpen className="h-3 w-3" />
                {participant.stats.collections} collections
              </span>
            </div>
          </div>
        </div>

        {subject && (
          <div className="py-3">
            <p className="text-xs text-muted-foreground mb-2">Discussing:</p>
            <Link
              href={`/listings/${subject.id}`}
              className="inline-flex items-center gap-2.5 p-2.5 bg-card/50 border rounded hover:border-border transition-colors group border-gray-600"
            >
              <img
                src={subject.image || "/placeholder.svg"}
                alt={subject.title}
                className="h-10 w-10 rounded object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{subject.title}</p>
                {subject.price && <p className="text-xs text-muted-foreground">${subject.price.toLocaleString()}</p>}
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-yellow-400 transition-colors flex-shrink-0" />
            </Link>
          </div>
        )}

        {messages.map((message) => {
          const isOwn = message.sender_id === "current-user"

          if (message.type === "offer" && active_offer) {
            return (
              <div key={message.id} className="flex flex-col gap-2">
                <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                  <span className="text-xs text-muted-foreground">
                    {isOwn ? "You" : participant.username} made an offer
                  </span>
                </div>
              </div>
            )
          }

          if (message.type === "offer_accepted") {
            return (
              <div key={message.id} className="flex justify-center">
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-emerald-500 font-medium">
                    {isOwn ? "You accepted" : `${participant.username} accepted`} the offer
                  </span>
                </div>
              </div>
            )
          }

          if (message.type === "offer_declined") {
            return (
              <div key={message.id} className="flex justify-center">
                <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full">
                  <X className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-500 font-medium">
                    {isOwn ? "You declined" : `${participant.username} declined`} the offer
                  </span>
                </div>
              </div>
            )
          }

          if (message.type === "offer_countered") {
            return (
              <div key={message.id} className="flex justify-center">
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
                  <RefreshCw className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-yellow-500 font-medium">
                    {isOwn ? "You sent" : `${participant.username} sent`} a counter offer
                  </span>
                </div>
              </div>
            )
          }

          return (
            <div
              key={message.id}
              className="flex items-start gap-3 group hover:bg-card/30 -mx-2 px-2 py-1 rounded transition-colors"
            >
              {!isOwn ? (
                <Avatar className="h-10 w-10 flex-shrink-0 mt-0.5">
                  <AvatarImage src={participant.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="text-sm">{participant.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="h-10 w-10 flex-shrink-0 mt-0.5">
                  <AvatarImage src="/current-user-avatar.png" />
                  <AvatarFallback className="text-sm">Y</AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className={cn("font-semibold text-sm", isOwn ? "text-emerald-400" : "text-primary")}>
                    {isOwn ? "You" : participant.username}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatTime(message.created_at)}</span>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap mt-0.5">{message.content}</p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {messages.some((m) => m.type === "offer_accepted") && (
        <div className="flex-shrink-0 px-4 pb-2">
          <p className="text-xs text-muted-foreground mb-2">Suggested replies:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onSendMessage("Great! Should we exchange shipping addresses?")}
              className="px-3 py-1.5 text-xs bg-card border border-border rounded-full hover:bg-card/80 transition-colors"
            >
              Exchange shipping addresses?
            </button>
            <button
              onClick={() => onSendMessage("Perfect! What payment method works best for you?")}
              className="px-3 py-1.5 text-xs bg-card border border-border rounded-full hover:bg-card/80 transition-colors"
            >
              Discuss payment method
            </button>
          </div>
        </div>
      )}

      <div className="flex-shrink-0 p-4 border-t border-border">
        <div className="flex items-end gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 px-4 py-3 bg-card border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 max-h-32"
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
