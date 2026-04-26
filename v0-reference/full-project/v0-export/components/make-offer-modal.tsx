"use client"
import { useState } from "react"
import Image from "next/image"
import { X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import type { Listing } from "@/lib/types"

interface MakeOfferModalProps {
  listing: Listing
  open: boolean
  onClose: () => void
  onOfferSent?: () => void
}

export function MakeOfferModal({ listing, open, onClose, onOfferSent }: MakeOfferModalProps) {
  const [offerAmount, setOfferAmount] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const offerValue = Number.parseFloat(offerAmount) || 0
  const percentOfAsking = listing.price > 0 ? Math.round((offerValue / listing.price) * 100) : 0

  const handleSubmitOffer = async () => {
    if (!offerAmount || offerValue <= 0) {
      setError("Please enter a valid offer amount")
      return
    }

    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // Demo mode - just show success
      setTimeout(() => {
        setIsLoading(false)
        onOfferSent?.()
        onClose()
        setOfferAmount("")
        setMessage("")
      }, 500)
      return
    }

    // Set expiration to 48 hours from now
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 48)

    const { error: offerError } = await supabase.from("offers").insert({
      listing_id: listing.id,
      sender_id: user.id,
      recipient_id: listing.seller_id,
      amount: offerValue,
      message: message.trim() || null,
      status: "pending",
      expires_at: expiresAt.toISOString(),
    })

    if (offerError) {
      console.error("Error creating offer:", offerError)
      setError("Failed to send offer. Please try again.")
      setIsLoading(false)
      return
    }

    // Also create a conversation and message to notify the seller
    const [p1, p2] = [user.id, listing.seller_id].sort()

    let convId: string

    // Check for existing conversation
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
        console.error("Error creating conversation:", convError)
        setIsLoading(false)
        onOfferSent?.()
        onClose()
        return
      }
      convId = newConv.id
    }

    // Send an offer message
    const offerMessageContent = `💰 New Offer: $${offerValue.toLocaleString()}${message ? `\n\n"${message}"` : ""}`

    await supabase.from("messages").insert({
      conversation_id: convId,
      sender_id: user.id,
      listing_id: listing.id,
      content: offerMessageContent,
    })

    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId)

    setIsLoading(false)
    onOfferSent?.()
    onClose()
    setOfferAmount("")
    setMessage("")
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md bg-card rounded-xl border border-border shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold">Make an Offer</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Listing Preview */}
          <div className="flex gap-3 p-3 bg-secondary/50 rounded-xl border border-border">
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
              <Image
                src={listing.images[0] || "/placeholder.svg?height=80&width=80"}
                alt={listing.title}
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground line-clamp-2">{listing.title}</h3>
              <p className="text-lg font-bold text-primary mt-1">${listing.price.toLocaleString()}</p>
            </div>
          </div>

          {/* Offer Amount Input */}
          <div>
            <label className="block text-sm font-semibold mb-2">Your Offer</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">$</span>
              <input
                type="number"
                value={offerAmount}
                onChange={(e) => {
                  setOfferAmount(e.target.value)
                  setError(null)
                }}
                placeholder="0"
                min="0"
                step="0.01"
                className="w-full bg-background border-2 border-border rounded-xl pl-8 pr-4 py-4 text-xl font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            {offerValue > 0 && <p className="text-sm text-muted-foreground mt-2">{percentOfAsking}% of asking price</p>}
          </div>

          {/* Message to Seller */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold">Message</label>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Include a message to the seller (optional)"
              rows={3}
              className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary transition-colors"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Tip: Sellers are more likely to accept offers with a personal note
            </p>
          </div>

          {/* Offer Summary */}
          {offerValue > 0 && (
            <div className="bg-secondary/50 rounded-xl p-4 space-y-2 border border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Your Offer</span>
                <span className="font-semibold">${offerValue.toLocaleString()}</span>
              </div>
              <div className="border-t border-border my-2" />
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">${offerValue.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Info Notice */}
          <div className="flex gap-2 p-3 bg-primary/10 rounded-xl border border-primary/20">
            <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              This offer is sent directly to the seller. Transactions happen between you and the seller - we don't
              intermediate sales.
            </p>
          </div>

          {error && <p className="text-sm text-destructive text-center">{error}</p>}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 py-6 text-base font-semibold bg-transparent"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitOffer}
            disabled={!offerAmount || offerValue <= 0 || isLoading}
            className="flex-1 py-6 text-base font-semibold bg-primary hover:bg-primary/90"
          >
            {isLoading ? "Sending..." : "Submit Offer"}
          </Button>
        </div>
      </div>
    </div>
  )
}
