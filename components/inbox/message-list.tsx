"use client"

import { Search, Filter, ChevronDown, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Conversation } from "@/lib/inbox-types"

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

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="space-y-3 border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Inbox</h1>
          {totalUnread > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
              {totalUnread}
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
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

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <MessageCircle className="mb-3 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">No messages yet</p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              Start a conversation by messaging a seller
            </p>
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
                  "flex w-full gap-3 border-b border-border p-4 text-left transition-colors",
                  selectedId === conversation.id ? "bg-card" : "hover:bg-card/50",
                )}
              >
                {/* Thumbnail */}
                <div className="relative flex-shrink-0">
                  {conversation.subject_type === "direct" ? (
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={conversation.participant.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>
                        {conversation.participant.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="relative">
                      <img
                        src={conversation.subject?.image || "/placeholder.svg"}
                        alt={conversation.subject?.title ?? ""}
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
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "truncate text-sm",
                        isUnread ? "font-bold text-foreground" : "text-foreground",
                      )}
                    >
                      {conversation.participant.username}
                    </span>
                    <span className="flex-shrink-0 text-xs text-muted-foreground">
                      {formatTime(conversation.updated_at)}
                    </span>
                  </div>

                  <p
                    className={cn(
                      "truncate text-sm",
                      isUnread ? "font-semibold text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {hasOffer ? (
                      <span className="text-primary">Offer</span>
                    ) : conversation.subject ? (
                      conversation.subject.title
                    ) : (
                      "Direct message"
                    )}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {hasOffer
                      ? `For ${conversation.subject?.title || "item"}`
                      : conversation.last_message?.content}
                  </p>
                </div>

                {/* Unread indicator */}
                {isUnread && (
                  <div className="flex-shrink-0 self-center">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
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
