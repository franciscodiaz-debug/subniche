"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X, Check, ArrowRightLeft, Search, Package, Pencil, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { demoListings } from "@/lib/demo-data"
import type { Listing } from "@/lib/types"

interface MakeTradeOfferModalProps {
  listing: Listing
  open: boolean
  onClose: () => void
  onOfferSent?: () => void
}

export function MakeTradeOfferModal({ listing, open, onClose, onOfferSent }: MakeTradeOfferModalProps) {
  const [selectedItems, setSelectedItems] = useState<Listing[]>([])
  const [cashAmount, setCashAmount] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [myListings, setMyListings] = useState<Listing[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  const cashValue = Number.parseFloat(cashAmount) || 0
  const totalTradeValue = selectedItems.reduce((sum, item) => sum + item.price, 0) + cashValue

  // Fetch user's listings
  useEffect(() => {
    const fetchMyListings = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase.from("listings").select("*").eq("seller_id", user.id).neq("id", listing.id)

        if (data) {
          setMyListings(data)
        }
      } else {
        // Demo mode
        const demoUserListings = demoListings.filter((l) => l.seller_id === "demo-buyer-1" && l.id !== listing.id)
        setMyListings([
          {
            id: "my-listing-1",
            seller_id: "demo-buyer-1",
            title: "Discraft Luna",
            subtitle: "Putt & Approach - 173g",
            description: "Great condition Luna, perfect for putting",
            price: 18,
            category: "Discs",
            subcategory: "Putters",
            condition: "Excellent",
            payment_methods: ["Cash"],
            logistics: "Local pickup",
            images: ["/white-putter-disc.jpg"],
            location: "Dallas, TX",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "my-listing-2",
            seller_id: "demo-buyer-1",
            title: "Innova Teebird",
            subtitle: "Fairway Driver - 170g",
            description: "Reliable fairway driver",
            price: 14,
            category: "Discs",
            subcategory: "Fairway Drivers",
            condition: "Good",
            payment_methods: ["Cash", "Venmo"],
            logistics: "Shipping available",
            images: ["/blue-fairway-driver-disc.jpg"],
            location: "Dallas, TX",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "my-listing-3",
            seller_id: "demo-buyer-1",
            title: "MVP Volt",
            subtitle: "Fairway Driver - 168g",
            description: "Slightly understable fairway",
            price: 16,
            category: "Discs",
            subcategory: "Fairway Drivers",
            condition: "Like New",
            payment_methods: ["Cash"],
            logistics: "Local only",
            images: ["/green-fairway-driver-disc.jpg"],
            location: "Dallas, TX",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          ...demoUserListings,
        ])
      }
    }

    if (open) {
      fetchMyListings()
      setIsEditing(false)
      setSelectedItems([])
      setCashAmount("")
      setMessage("")
      setSearchQuery("")
      setError(null)
    }
  }, [open, listing.id])

  const toggleItemSelection = (item: Listing) => {
    setSelectedItems((prev) => {
      const isSelected = prev.some((i) => i.id === item.id)
      if (isSelected) {
        return prev.filter((i) => i.id !== item.id)
      }
      return [...prev, item]
    })
  }

  const filteredListings = myListings.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSubmitOffer = async () => {
    if (selectedItems.length === 0 && cashValue <= 0) {
      setError("Please select at least one item or add cash to your offer")
      return
    }

    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setTimeout(() => {
        setIsLoading(false)
        onOfferSent?.()
        onClose()
      }, 500)
      return
    }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const { data: tradeOffer, error: offerError } = await supabase
      .from("trade_offers")
      .insert({
        listing_id: listing.id,
        sender_id: user.id,
        recipient_id: listing.seller_id,
        cash_amount: cashValue,
        message: message.trim() || null,
        status: "pending",
        expires_at: expiresAt.toISOString(),
      })
      .select("id")
      .single()

    if (offerError || !tradeOffer) {
      setError("Failed to send trade offer. Please try again.")
      setIsLoading(false)
      return
    }

    if (selectedItems.length > 0) {
      const itemsToInsert = selectedItems.map((item) => ({
        trade_offer_id: tradeOffer.id,
        listing_id: item.id,
      }))

      await supabase.from("trade_offer_items").insert(itemsToInsert)
    }

    const [p1, p2] = [user.id, listing.seller_id].sort()
    let convId: string

    const { data: existingConv } = await supabase
      .from("conversations")
      .select("id")
      .eq("participant_1", p1)
      .eq("participant_2", p2)
      .single()

    if (existingConv) {
      convId = existingConv.id
    } else {
      const { data: newConv, error: convError } = await supabase
        .from("conversations")
        .insert({ participant_1: p1, participant_2: p2 })
        .select("id")
        .single()

      if (convError || !newConv) {
        setIsLoading(false)
        onOfferSent?.()
        onClose()
        return
      }
      convId = newConv.id
    }

    const itemsList = selectedItems.map((i) => `• ${i.title} ($${i.price})`).join("\n")
    const tradeMessageContent = `🔄 Trade Offer for "${listing.title}"\n\n${
      selectedItems.length > 0 ? `Items offered:\n${itemsList}\n` : ""
    }${cashValue > 0 ? `+ $${cashValue.toLocaleString()} cash\n` : ""}${message ? `\nMessage: "${message}"` : ""}`

    await supabase.from("messages").insert({
      conversation_id: convId,
      sender_id: user.id,
      listing_id: listing.id,
      content: tradeMessageContent,
    })

    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId)

    setIsLoading(false)
    onOfferSent?.()
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg bg-card rounded-lg border border-border shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Propose a Trade</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-secondary transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Trade Preview */}
        <div className="p-4 bg-secondary/30 border-b border-border sticky top-[57px] z-10">
          <div className="flex items-center justify-center gap-3">
            {/* Your offer - Clickable to edit */}
            <button
              onClick={() => {
                setIsEditing(!isEditing)
                setSearchQuery("")
              }}
              className={`flex-1 p-3 rounded-lg transition-all relative text-left ${
                isEditing 
                  ? "bg-primary/10 ring-2 ring-primary" 
                  : "bg-background/50 hover:bg-primary/5 hover:ring-1 hover:ring-primary/30 cursor-pointer"
              }`}
            >
              <p className={`text-xs mb-2 ${isEditing ? "text-primary font-medium" : "text-muted-foreground"}`}>
                You offer {!isEditing && <span className="text-muted-foreground/50">(click to edit)</span>}
              </p>
              <div className="min-h-[60px] space-y-2">
                {selectedItems.length > 0 || cashValue > 0 ? (
                  <>
                    {/* Items row */}
                    {selectedItems.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedItems.slice(0, 4).map((item) => (
                          <div
                            key={item.id}
                            className="w-14 h-14 rounded-md border-2 border-card overflow-hidden bg-muted flex-shrink-0"
                          >
                            <Image
                              src={item.images[0] || "/placeholder.svg"}
                              alt={item.title}
                              width={56}
                              height={56}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ))}
                        {selectedItems.length > 4 && (
                          <div className="w-14 h-14 rounded-md border-2 border-card bg-muted flex items-center justify-center text-xs font-medium flex-shrink-0">
                            +{selectedItems.length - 4}
                          </div>
                        )}
                      </div>
                    )}
                    {/* Cash row - centered when items exist */}
                    {cashValue > 0 && (
                      <div className={`flex items-center gap-1 ${selectedItems.length > 0 ? "justify-center" : ""}`}>
                        <span className="text-lg font-semibold text-green-500">+</span>
                        <div className="w-14 h-14 rounded-md border-2 border-green-500/30 bg-green-500/5 flex items-center justify-center">
                          <span className="text-xs font-semibold text-green-500">${cashValue}</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-14">
                    <span className="text-xs text-muted-foreground italic">Add items or cash</span>
                  </div>
                )}
              </div>
            </button>

            {/* Swap icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Their item (what you want) - Fixed */}
            <div className="flex-1 p-3 rounded-lg bg-background/50 relative">
              <div className="absolute top-2 right-2 p-1.5 rounded-full bg-muted">
                <Lock className="h-3 w-3 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mb-2">For:</p>
              <div className="flex flex-wrap gap-1.5 min-h-[60px]">
                <div className="w-14 h-14 rounded-md border-2 border-primary overflow-hidden bg-muted flex-shrink-0">
                  <Image
                    src={listing.images[0] || "/placeholder.svg"}
                    alt={listing.title}
                    width={56}
                    height={56}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className="text-xs font-medium line-clamp-2">{listing.title}</p>
                  <p className="text-xs text-primary">${listing.price.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          /* Item Selection when editing */
          <div className="p-4 space-y-4 bg-primary/5 border-y-2 border-primary/20">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-primary">Build your offer</p>
              <Button onClick={() => setIsEditing(false)} size="sm" variant="outline" className="h-7 w-7 p-0">
                <Check className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your listings..."
                className="w-full bg-background border border-border rounded-md pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:border-primary/50"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {filteredListings.length === 0 ? (
                <div className="flex-1 text-center py-6 text-muted-foreground">
                  <Package className="h-6 w-6 mx-auto mb-1 opacity-50" />
                  <p className="text-xs">No listings found</p>
                </div>
              ) : (
                filteredListings.map((item) => {
                  const isSelected = selectedItems.some((i) => i.id === item.id)

                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleItemSelection(item)}
                      className={`relative flex-shrink-0 w-20 rounded-md border transition-all text-left ${
                        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center z-10">
                          <Check className="h-2.5 w-2.5 text-primary-foreground" />
                        </div>
                      )}

                      <div className="w-full aspect-square rounded-t-md overflow-hidden bg-muted">
                        <Image
                          src={item.images[0] || "/placeholder.svg"}
                          alt={item.title}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="p-1.5">
                        <p className="text-[10px] font-medium line-clamp-1">{item.title}</p>
                        <p className="text-[10px] text-primary">${item.price}</p>
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            {/* Cash adjustment */}
            <div className="flex items-center gap-3 pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground whitespace-nowrap">+ Cash</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <input
                  type="number"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full bg-background border border-border rounded-md pl-7 pr-3 py-1.5 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>
          </div>
        )}

        {/* Message section - always visible */}
        <div className="p-4 border-t border-border bg-secondary/20">
          <label className="text-sm font-medium text-foreground mb-2 block">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a note (optional)"
            rows={2}
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary/50"
          />
        </div>

        {error && <p className="text-xs text-destructive px-4 py-2">{error}</p>}

        {/* Footer */}
        <div className="p-4 border-t border-border sticky bottom-0 bg-card">
          <Button
            onClick={handleSubmitOffer}
            disabled={(selectedItems.length === 0 && cashValue <= 0) || isLoading}
            className="w-full"
          >
            {isLoading ? "Sending..." : "Send Offer"}
          </Button>
        </div>
      </div>
    </div>
  )
}
