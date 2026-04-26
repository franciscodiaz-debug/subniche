"use client"

import { useState } from "react"
import Image from "next/image"
import { X, AlertCircle, Check, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Offer } from "@/lib/types/inbox"

interface CashCounterOfferModalProps {
  open: boolean
  onClose: () => void
  originalOffer: Offer
  otherPartyUsername: string
  onCounterSent?: (counterOffer: Offer) => void
}

export function CashCounterOfferModal({
  open,
  onClose,
  originalOffer,
  otherPartyUsername,
  onCounterSent,
}: CashCounterOfferModalProps) {
  const [counterAmount, setCounterAmount] = useState(originalOffer.cash_adjustment?.toString() || "")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditingMessage, setIsEditingMessage] = useState(false)

  const counterValue = Number.parseFloat(counterAmount) || 0
  const originalValue = originalOffer.cash_adjustment || 0
  const item = originalOffer.your_items[0]
  const listingPrice = item?.price || 0

  const handleSubmitCounter = async () => {
    if (!counterAmount || counterValue <= 0) {
      setError("Please enter a valid counter amount")
      return
    }

    if (counterValue === originalValue) {
      setError("Counter must be different from the original offer")
      return
    }

    setIsLoading(true)
    setError(null)

    // Simulate API call
    setTimeout(() => {
      const counterOffer: Offer = {
        ...originalOffer,
        id: `counter-${Date.now()}`,
        sender_id: "current-user",
        status: "pending",
        cash_adjustment: counterValue,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
      }

      setIsLoading(false)
      onCounterSent?.(counterOffer)
      onClose()
      setCounterAmount("")
      setMessage("")
    }, 500)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md bg-card rounded-xl border border-border shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold">Counter Offer</h2>
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
          {/* Item Preview */}
          {item && (
            <div className="flex gap-3 p-3 bg-secondary/50 rounded-xl border border-border">
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                <Image
                  src={item.image || "/placeholder.svg?height=80&width=80"}
                  alt={item.title}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground line-clamp-2">{item.title}</h3>
                <p className="text-lg font-bold text-primary mt-1">${listingPrice.toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Original Offer Info */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
            <span className="text-sm text-muted-foreground">{otherPartyUsername}&apos;s offer</span>
            <span className="font-semibold text-foreground">${originalValue.toLocaleString()}</span>
          </div>

          {/* Counter Amount Input */}
          <div>
            <label className="block text-sm font-semibold mb-2">Your Counter</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">$</span>
              <input
                type="number"
                value={counterAmount}
                onChange={(e) => {
                  setCounterAmount(e.target.value)
                  setError(null)
                }}
                placeholder="0"
                min="0"
                step="0.01"
                className="w-full bg-background border-2 border-border rounded-xl pl-8 pr-4 py-4 text-xl font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Message to Buyer */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="text-sm font-semibold">Message</label>
              {isEditingMessage && (
                <button
                  onClick={() => setIsEditingMessage(false)}
                  className="p-0.5 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors"
                >
                  <Check className="h-3 w-3 text-primary" />
                </button>
              )}
            </div>
            {isEditingMessage ? (
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setIsEditingMessage(false)
                  }
                }}
                placeholder="Add a message..."
                className="w-full bg-transparent text-sm italic text-foreground/80 focus:outline-none border-b border-primary/30 pb-1"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setIsEditingMessage(true)}
                className="w-full text-left group flex items-center gap-2"
              >
                {message ? (
                  <p className="text-sm italic text-foreground/80">{message}</p>
                ) : (
                  <p className="text-sm italic text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
                    Add a message...
                  </p>
                )}
                <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </button>
            )}
          </div>

          {/* Info Notice */}
          <div className="flex gap-2 p-3 bg-primary/10 rounded-xl border border-primary/20">
            <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Your counter will replace their original offer. They can accept, decline, or counter again.
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
            onClick={handleSubmitCounter}
            disabled={!counterAmount || counterValue <= 0 || counterValue === originalValue || isLoading}
            className="flex-1 py-6 text-base font-semibold bg-primary hover:bg-primary/90"
          >
            {isLoading ? "Sending..." : "Send Counter"}
          </Button>
        </div>
      </div>
    </div>
  )
}
