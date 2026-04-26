"use client"

import { Search, Filter, ChevronDown, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Conversation } from "@/lib/types/inbox"

interface MessageListProps {
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (id: string) => void
  filter: "all" | "received" | "sent"
  onFilterChange: (filter: "all" | "received" | "sent") => void
  searchQuery: string
  onSearchChange: (query: string) => void
  totalUnread: number
}

export function MessageList({
  conversations,
  selectedId,
  onSelect,
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  totalUnread,
}: MessageListProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const getMessagePreview = (conversation: Conversation) => {
    if (conversation.active_offer && conversation.active_offer.status === "pending") {
      const offer = conversation.active_offer
      const cashText =
        offer.cash_adjustment > 0
          ? ` + $${offer.cash_adjustment.toLocaleString()}`
          : offer.cash_adjustment < 0
            ? ` - $${Math.abs(offer.cash_adjustment).toLocaleString()}`
            : ""
      return `Trade Offer${cashText}`
    }
    return conversation.last_message?.content || "No messages yet"
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-foreground text-2xl">Inbox</h1>
          {totalUnread > 0 && (
            <span className="bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">{totalUnread}</span>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Filter className="h-4 w-4" />
              <span className="capitalize">{filter}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => onFilterChange("all")}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange("received")}>Received</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange("sent")}>Sent</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Start a conversation by messaging a seller</p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const isUnread = conversation.unread_count > 0
            const hasOffer = conversation.active_offer?.status === "pending"

            return (
              <button
                key={conversation.id}
                onClick={() => onSelect(conversation.id)}
                className={cn(
                  "w-full p-4 flex gap-3 text-left transition-colors border-b border-border",
                  selectedId === conversation.id ? "bg-card" : "hover:bg-card/50",
                )}
              >
                {/* Thumbnail */}
                <div className="relative flex-shrink-0">
                  {conversation.subject_type === "direct" ? (
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={conversation.participant.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{conversation.participant.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="relative">
                      <img
                        src={conversation.subject?.image || "/placeholder.svg"}
                        alt={conversation.subject?.title}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <Avatar className="absolute -bottom-1 -right-1 h-6 w-6 border-2 border-background">
                        <AvatarImage src={conversation.participant.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback className="text-[10px]">
                          {conversation.participant.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn("text-sm truncate", isUnread ? "font-bold text-foreground" : "text-foreground")}
                    >
                      {conversation.participant.username}
                    </span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatTime(conversation.updated_at)}
                    </span>
                  </div>

                  {/* Subject line / Offer description */}
                  <p
                    className={cn(
                      "text-sm truncate",
                      isUnread ? "font-semibold text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {hasOffer ? (
                      <span className="text-amber-500">Offer</span>
                    ) : conversation.subject ? (
                      conversation.subject.title
                    ) : (
                      "Direct message"
                    )}
                  </p>

                  {/* Message preview */}
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {hasOffer ? `For ${conversation.subject?.title || "item"}` : conversation.last_message?.content}
                  </p>
                </div>

                {/* Unread indicator */}
                {isUnread && (
                  <div className="flex-shrink-0 self-center">
                    <span className="bg-amber-500 text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {conversation.unread_count}
                    </span>
                  </div>
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
