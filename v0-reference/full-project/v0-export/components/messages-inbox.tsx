"use client"

import { useState, useEffect } from "react"
import { MessageCircle, MapPin } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { ConversationView } from "@/components/conversation-view"
import { demoConversations, demoMessages, demoProfiles, demoListings } from "@/lib/demo-data"
import type { Conversation, Listing } from "@/lib/types"

export function MessagesInbox() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [activeListing, setActiveListing] = useState<Listing | null>(null) // Track active listing for Send Offer
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const loadConversations = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUserId(user.id)

        const { data: convs } = await supabase
          .from("conversations")
          .select(`
            *,
            participant_1_profile:profiles!conversations_participant_1_fkey(*),
            participant_2_profile:profiles!conversations_participant_2_fkey(*)
          `)
          .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
          .order("updated_at", { ascending: false })

        if (convs) {
          const convsWithMessages = await Promise.all(
            convs.map(async (conv) => {
              const { data: lastMsg } = await supabase
                .from("messages")
                .select("*, listing:listings(*)")
                .eq("conversation_id", conv.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .single()

              const { count } = await supabase
                .from("messages")
                .select("*", { count: "exact", head: true })
                .eq("conversation_id", conv.id)
                .eq("read", false)
                .neq("sender_id", user.id)

              const otherUser = conv.participant_1 === user.id ? conv.participant_2_profile : conv.participant_1_profile

              return {
                ...conv,
                other_user: otherUser,
                last_message: lastMsg,
                unread_count: count || 0,
              }
            }),
          )
          setConversations(convsWithMessages)
        }
      } else {
        // Demo mode
        setUserId("demo-buyer-1")
        const demoConvsWithData = demoConversations.map((conv) => {
          const convMessages = demoMessages.filter((m) => m.conversation_id === conv.id)
          const lastMessage = convMessages[convMessages.length - 1]
          const unreadCount = convMessages.filter((m) => !m.read && m.sender_id !== "demo-buyer-1").length
          const otherUserId = conv.participant_1 === "demo-buyer-1" ? conv.participant_2 : conv.participant_1
          const otherUser = demoProfiles.find((p) => p.id === otherUserId)

          return { ...conv, other_user: otherUser, last_message: lastMessage, unread_count: unreadCount }
        })
        setConversations(demoConvsWithData)
      }
      setIsLoading(false)
    }

    loadConversations()
  }, [])

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv)

    // Find the most recent listing mentioned in this conversation
    const convMessages = demoMessages.filter((m) => m.conversation_id === conv.id && m.listing_id)
    if (convMessages.length > 0) {
      const lastListingMsg = convMessages[convMessages.length - 1]
      const listing = demoListings.find((l) => l.id === lastListingMsg.listing_id)
      setActiveListing(listing || null)
    } else {
      setActiveListing(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-muted-foreground">Loading conversations...</div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-73px)]">
      {/* Conversations List - grouped by person */}
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold">Messages</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-sm mt-1">Start a conversation by contacting a seller</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected = selectedConversation?.id === conv.id

              return (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full p-4 flex gap-3 border-b border-border hover:bg-card/50 transition-colors text-left ${
                    isSelected ? "bg-card" : ""
                  }`}
                >
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarImage src={conv.other_user?.avatar_url || ""} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {conv.other_user?.username?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <span className="font-medium truncate">{conv.other_user?.username}</span>
                      {conv.last_message && (
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatTimeAgo(conv.last_message.created_at)}
                        </span>
                      )}
                    </div>
                    {conv.other_user?.location && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{conv.other_user.location}</span>
                      </div>
                    )}
                    {conv.last_message && (
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {conv.last_message.listing_id ? "📎 " : ""}
                        {conv.last_message.content}
                      </p>
                    )}
                  </div>
                  {conv.unread_count && conv.unread_count > 0 && (
                    <div className="flex-shrink-0 self-center">
                      <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                        {conv.unread_count}
                      </span>
                    </div>
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Conversation View - pass activeListing for Send Offer */}
      <div className="flex-1">
        {selectedConversation ? (
          <ConversationView
            conversation={selectedConversation}
            currentUserId={userId || "demo-buyer-1"}
            activeListing={activeListing}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "now"
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  return date.toLocaleDateString()
}
