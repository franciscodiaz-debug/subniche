"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Send, ExternalLink, MapPin, Users, DollarSign, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { demoMessages, demoProfiles, demoListings } from "@/lib/demo-data"
import type { Conversation, Message, Listing } from "@/lib/types"

interface ConversationViewProps {
  conversation: Conversation
  currentUserId: string
  activeListing?: Listing | null // Added active listing for Send Offer context
}

export function ConversationView({ conversation, currentUserId, activeListing }: ConversationViewProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [offerAmount, setOfferAmount] = useState("")
  const [offerMessage, setOfferMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const otherUser = conversation.other_user

  const currentUserProfile = demoProfiles.find((p) => p.id === currentUserId)
  const sharedCommunities =
    otherUser?.communities?.filter((comm) => currentUserProfile?.communities?.some((c) => c.id === comm.id)) || []

  useEffect(() => {
    const loadMessages = async () => {
      if (currentUserId.startsWith("demo-")) {
        const msgs = demoMessages
          .filter((m) => m.conversation_id === conversation.id)
          .map((m) => ({
            ...m,
            listing: m.listing_id ? demoListings.find((l) => l.id === m.listing_id) : undefined,
          }))
        setMessages(msgs)
        return
      }

      const supabase = createClient()
      const { data } = await supabase
        .from("messages")
        .select("*, sender:profiles(*), listing:listings(*)")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true })

      if (data) {
        setMessages(data)
        await supabase
          .from("messages")
          .update({ read: true })
          .eq("conversation_id", conversation.id)
          .neq("sender_id", currentUserId)
      }
    }

    loadMessages()

    if (!currentUserId.startsWith("demo-")) {
      const supabase = createClient()
      const channel = supabase
        .channel(`messages:${conversation.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversation.id}`,
          },
          async (payload) => {
            const { data: newMsg } = await supabase
              .from("messages")
              .select("*, sender:profiles(*), listing:listings(*)")
              .eq("id", payload.new.id)
              .single()
            if (newMsg) {
              setMessages((prev) => [...prev, newMsg])
            }
          },
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [conversation.id, currentUserId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return

    setIsLoading(true)
    const messageContent = newMessage.trim()
    setNewMessage("")

    if (currentUserId.startsWith("demo-")) {
      const demoMessage: Message = {
        id: `demo-msg-${Date.now()}`,
        conversation_id: conversation.id,
        sender_id: currentUserId,
        content: messageContent,
        listing_id: null,
        read: false,
        created_at: new Date().toISOString(),
        sender: demoProfiles.find((p) => p.id === currentUserId),
      }
      setMessages((prev) => [...prev, demoMessage])
      setIsLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender_id: currentUserId,
      content: messageContent,
    })

    if (error) {
      console.error("Error sending message:", error)
    }

    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversation.id)

    setIsLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSendOffer = async () => {
    if (!offerAmount || !activeListing) return

    // In demo mode, just add an offer message to the chat
    const offerMsg: Message = {
      id: `demo-offer-${Date.now()}`,
      conversation_id: conversation.id,
      sender_id: currentUserId,
      content: `💰 Offer: $${offerAmount}${offerMessage ? `\n\n"${offerMessage}"` : ""}`,
      listing_id: activeListing.id,
      read: false,
      created_at: new Date().toISOString(),
      sender: demoProfiles.find((p) => p.id === currentUserId),
      listing: activeListing,
    }
    setMessages((prev) => [...prev, offerMsg])
    setShowOfferModal(false)
    setOfferAmount("")
    setOfferMessage("")
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border bg-card/50">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={otherUser?.avatar_url || ""} />
            <AvatarFallback className="bg-primary/20 text-primary">
              {otherUser?.username?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-lg">{otherUser?.username}</h2>

            {/* Location */}
            {otherUser?.location && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                <MapPin className="h-3.5 w-3.5" />
                <span>{otherUser.location}</span>
              </div>
            )}

            {/* Communities */}
            {otherUser?.communities && otherUser.communities.length > 0 && (
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                {otherUser.communities.slice(0, 3).map((comm) => (
                  <Badge
                    key={comm.id}
                    variant="secondary"
                    className={`text-xs ${sharedCommunities.some((c) => c.id === comm.id) ? "bg-primary/20 text-primary border-primary/30" : ""}`}
                  >
                    {comm.icon} {comm.name}
                    {sharedCommunities.some((c) => c.id === comm.id) && (
                      <span className="ml-1 text-[10px] opacity-70">• shared</span>
                    )}
                  </Badge>
                ))}
                {otherUser.communities.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{otherUser.communities.length - 3} more</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.sender_id === currentUserId
          const isOffer = message.content.startsWith("💰 Offer:")

          return (
            <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              {!isOwn && (
                <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                  <AvatarImage src={message.sender?.avatar_url || ""} />
                  <AvatarFallback>{message.sender?.username?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              )}
              <div className="max-w-[70%]">
                {/* Listing card attachment */}
                {message.listing && (
                  <Link
                    href={`/listings/${message.listing.id}`}
                    className="block mb-2 p-3 bg-secondary/70 rounded-xl border border-border hover:bg-secondary transition-colors"
                  >
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={message.listing.images[0] || "/placeholder.svg?height=64&width=64&query=listing"}
                          alt={message.listing.title}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-medium text-sm truncate">{message.listing.title}</h4>
                          <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        </div>
                        <p className="text-primary font-bold">${message.listing.price}</p>
                        {message.listing.subtitle && (
                          <p className="text-xs text-muted-foreground truncate">{message.listing.subtitle}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                )}

                {/* Message bubble - special styling for offers */}
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    isOffer
                      ? "bg-green-500/20 border-2 border-green-500/50 text-foreground rounded-xl"
                      : isOwn
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-card border border-border rounded-bl-md"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${isOwn && !isOffer ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                  >
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border space-y-3">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>

        {/* Send Offer CTA - only show if there's an active listing context */}
        {activeListing && (
          <Button
            onClick={() => setShowOfferModal(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
          >
            <DollarSign className="h-5 w-5 mr-2" />
            Send Offer for {activeListing.title}
          </Button>
        )}
      </div>

      {showOfferModal && activeListing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border rounded-2xl w-full max-w-md">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-lg">Send Offer</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowOfferModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-4 space-y-4">
              {/* Listing preview */}
              <div className="flex gap-3 p-3 bg-secondary/50 rounded-xl">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={activeListing.images[0] || "/placeholder.svg?height=64&width=64"}
                    alt={activeListing.title}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <h4 className="font-medium">{activeListing.title}</h4>
                  <p className="text-primary font-bold">Listed at ${activeListing.price}</p>
                </div>
              </div>

              {/* Offer amount */}
              <div>
                <label className="block text-sm font-medium mb-2">Your Offer</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <input
                    type="number"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    placeholder={activeListing.price.toString()}
                    className="w-full bg-card border border-border rounded-lg pl-8 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Optional message */}
              <div>
                <label className="block text-sm font-medium mb-2">Message (optional)</label>
                <textarea
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  placeholder="Add a note to your offer..."
                  rows={2}
                  className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <Button
                onClick={handleSendOffer}
                disabled={!offerAmount}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
              >
                Send Offer ${offerAmount || "0"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
