"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { X, Send, ExternalLink, MapPin, Users, DollarSign, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import type { Listing, Message, Conversation } from "@/lib/types"
import { demoMessages, demoProfiles, findDemoConversation, demoListings } from "@/lib/demo-data"

interface ContactModalProps {
  listing: Listing
  open: boolean
  onClose: () => void
}

export function ContactModal({ listing, open, onClose }: ContactModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [isFirstMessage, setIsFirstMessage] = useState(true)
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [offerAmount, setOfferAmount] = useState("")
  const [offerMessage, setOfferMessage] = useState("")
  const [communitiesExpanded, setCommunitiesExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const sellerProfile = demoProfiles.find((p) => p.id === listing.seller_id) || listing.seller
  const currentUserProfile = demoProfiles.find((p) => p.id === (userId || "demo-buyer-1"))

  const sharedCommunities =
    sellerProfile?.communities?.filter((comm) => currentUserProfile?.communities?.some((c) => c.id === comm.id)) || []

  useEffect(() => {
    if (!open) return

    const loadConversation = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUserId(user.id)

        const sellerId = listing.seller_id
        const [p1, p2] = [user.id, sellerId].sort()

        const { data: existingConv } = await supabase
          .from("conversations")
          .select("*")
          .eq("participant_1", p1)
          .eq("participant_2", p2)
          .single()

        if (existingConv) {
          setConversation(existingConv)
          const { data: msgs } = await supabase
            .from("messages")
            .select("*, sender:profiles(*), listing:listings(*)")
            .eq("conversation_id", existingConv.id)
            .order("created_at", { ascending: true })

          if (msgs) {
            setMessages(msgs)
            setIsFirstMessage(false)
          }
        } else {
          setIsFirstMessage(true)
        }
      } else {
        setUserId("demo-buyer-1")
        const demoConv = findDemoConversation("demo-buyer-1", listing.seller_id)
        if (demoConv) {
          setConversation(demoConv)
          const msgs = demoMessages
            .filter((m) => m.conversation_id === demoConv.id)
            .map((m) => ({
              ...m,
              listing: m.listing_id ? demoListings.find((l) => l.id === m.listing_id) : undefined,
            }))
          setMessages(msgs)
          setIsFirstMessage(false)
        } else {
          setIsFirstMessage(true)
        }
      }
    }

    loadConversation()
  }, [open, listing.seller_id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return

    setIsLoading(true)
    const messageContent = newMessage.trim()
    setNewMessage("")

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      let convId = conversation?.id

      if (!convId) {
        const sellerId = listing.seller_id
        const [p1, p2] = [user.id, sellerId].sort()

        const { data: newConv, error: convError } = await supabase
          .from("conversations")
          .insert({
            participant_1: p1,
            participant_2: p2,
          })
          .select()
          .single()

        if (convError) {
          console.error("Error creating conversation:", convError)
          setIsLoading(false)
          return
        }
        convId = newConv.id
        setConversation(newConv)
      }

      const messageData: { conversation_id: string; sender_id: string; content: string; listing_id?: string } = {
        conversation_id: convId,
        sender_id: user.id,
        content: messageContent,
      }

      if (isFirstMessage) {
        messageData.listing_id = listing.id
      }

      const { data: sentMessage, error: msgError } = await supabase
        .from("messages")
        .insert(messageData)
        .select("*, sender:profiles(*), listing:listings(*)")
        .single()

      if (msgError) {
        console.error("Error sending message:", msgError)
      } else {
        setMessages((prev) => [...prev, sentMessage])
        setIsFirstMessage(false)
      }

      await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId)
    } else {
      const demoMessage: Message = {
        id: `demo-msg-${Date.now()}`,
        conversation_id: conversation?.id || "demo-conv-new",
        sender_id: userId || "demo-buyer-1",
        content: messageContent,
        listing_id: isFirstMessage ? listing.id : null,
        read: false,
        created_at: new Date().toISOString(),
        sender: demoProfiles[1],
        listing: isFirstMessage ? listing : undefined,
      }
      setMessages((prev) => [...prev, demoMessage])
      setShowOfferModal(false)
      setOfferAmount("")
      setOfferMessage("")
      setIsFirstMessage(false)
    }

    setIsLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSendOffer = () => {
    if (!offerAmount) return

    const offerMsg: Message = {
      id: `demo-offer-${Date.now()}`,
      conversation_id: conversation?.id || "demo-conv-new",
      sender_id: userId || "demo-buyer-1",
      content: `💰 Offer: $${offerAmount}${offerMessage ? `\n\n"${offerMessage}"` : ""}`,
      listing_id: listing.id,
      read: false,
      created_at: new Date().toISOString(),
      sender: currentUserProfile,
      listing: listing,
    }
    setMessages((prev) => [...prev, offerMsg])
    setShowOfferModal(false)
    setOfferAmount("")
    setOfferMessage("")
    setIsFirstMessage(false)
  }

  if (!open) return null

  const currentUserId = userId || "demo-buyer-1"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg bg-card rounded-xl border border-border shadow-xl flex flex-col max-h-[85vh]">
        <div className="p-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={sellerProfile?.avatar_url || ""} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {sellerProfile?.username?.charAt(0) || "S"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Chat with</span>
                  <span className="text-primary font-semibold">{sellerProfile?.username}</span>
                </div>

                {sellerProfile?.location && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{sellerProfile.location}</span>
                  </div>
                )}

                {sellerProfile?.communities && sellerProfile.communities.length > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Users className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>
                        {sharedCommunities.length > 0
                          ? `${sharedCommunities.length} group${sharedCommunities.length !== 1 ? "s" : ""} in common`
                          : `${sellerProfile.communities.length} group${sellerProfile.communities.length !== 1 ? "s" : ""}`}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {(sharedCommunities.length > 0 ? sharedCommunities : sellerProfile.communities)
                        .slice(0, 2)
                        .map((comm) => (
                          <Badge
                            key={comm.id}
                            variant="secondary"
                            className={`text-xs py-0.5 ${
                              sharedCommunities.some((c) => c.id === comm.id)
                                ? "bg-primary/20 text-primary border-primary/30"
                                : ""
                            }`}
                          >
                            {comm.icon} {comm.name}
                          </Badge>
                        ))}

                      {(sharedCommunities.length > 0 ? sharedCommunities : sellerProfile.communities).length > 2 && (
                        <button
                          onClick={() => setCommunitiesExpanded(!communitiesExpanded)}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
                        >
                          {communitiesExpanded ? (
                            <>
                              Show less
                              <ChevronUp className="h-3 w-3" />
                            </>
                          ) : (
                            <>
                              +
                              {(sharedCommunities.length > 0 ? sharedCommunities : sellerProfile.communities).length -
                                2}{" "}
                              more
                              <ChevronDown className="h-3 w-3" />
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {communitiesExpanded && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {(sharedCommunities.length > 0 ? sharedCommunities : sellerProfile.communities)
                          .slice(2)
                          .map((comm) => (
                            <Badge
                              key={comm.id}
                              variant="secondary"
                              className={`text-xs py-0.5 ${
                                sharedCommunities.some((c) => c.id === comm.id)
                                  ? "bg-primary/20 text-primary border-primary/30"
                                  : ""
                              }`}
                            >
                              {comm.icon} {comm.name}
                            </Badge>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
          <Link
            href={`/listings/${listing.id}`}
            className="block p-3 bg-secondary/50 rounded-xl border border-border hover:bg-secondary/70 transition-colors"
          >
            <div className="flex gap-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={listing.images[0] || "/placeholder.svg?height=64&width=64"}
                  alt={listing.title}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <h4 className="font-medium">{listing.title}</h4>
                <p className="text-primary font-bold">Listed at ${listing.price}</p>
              </div>
            </div>
          </Link>

          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              <p className="text-sm">Start your conversation about this listing</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.sender_id === currentUserId
              const isOffer = message.content.startsWith("💰 Offer:")

              return (
                <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[80%]">
                    {message.listing && message.listing.id !== listing.id && (
                      <Link
                        href={`/listings/${message.listing.id}`}
                        className="block mb-2 p-3 bg-secondary/70 rounded-xl border border-border hover:bg-secondary transition-colors"
                      >
                        <div className="flex gap-3">
                          <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={message.listing.images[0] || "/placeholder.svg?height=56&width=56&query=listing"}
                              alt={message.listing.title}
                              width={56}
                              height={56}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-medium text-sm truncate">{message.listing.title}</h4>
                              <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            </div>
                            <p className="text-primary font-bold text-sm">${message.listing.price}</p>
                          </div>
                        </div>
                      </Link>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isOffer
                          ? "bg-primary/20 border-2 border-primary/50 text-foreground rounded-xl"
                          : isOwn
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-secondary text-foreground rounded-bl-md"
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
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-border space-y-3">
          <div className="flex gap-2 items-center">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              className="flex-1 bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-[46px] w-[46px] p-0 flex-shrink-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>

          <Button
            onClick={() => setShowOfferModal(true)}
            variant="outline"
            className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold py-3 transition-colors"
          >
            <DollarSign className="h-5 w-5 mr-2" />
            Send Offer
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            MarKat does not intermediate sales or guarantee transactions
          </p>
        </div>
      </div>

      {showOfferModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-lg">Send Offer</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowOfferModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex gap-3 p-3 bg-secondary/50 rounded-xl">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={listing.images[0] || "/placeholder.svg?height=64&width=64"}
                    alt={listing.title}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <h4 className="font-medium">{listing.title}</h4>
                  <p className="text-primary font-bold">Listed at ${listing.price}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Your Offer</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <input
                    type="number"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    placeholder={listing.price.toString()}
                    className="w-full bg-secondary border border-border rounded-lg pl-8 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message (optional)</label>
                <textarea
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  placeholder="Add a note to your offer..."
                  rows={2}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <Button
                onClick={handleSendOffer}
                disabled={!offerAmount}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-3"
              >
                Send Offer {offerAmount ? `$${offerAmount}` : ""}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
