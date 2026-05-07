"use client"

import { useState } from "react"
import { X, ArrowLeft, AlertCircle, Check, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Offer } from "@/lib/inbox-types"

interface CashCounterOfferModalProps {
  open: boolean
  fullScreen?: boolean
  onClose: () => void
  originalOffer: Offer
  otherPartyUsername: string
  onCounterSent?: (counterOffer: Offer) => void
}

export function CashCounterOfferModal({
  open,
  fullScreen = false,
  onClose,
  originalOffer,
  otherPartyUsername,
  onCounterSent,
}: CashCounterOfferModalProps) {
  const [counterAmount, setCounterAmount] = useState(
    originalOffer.cash_adjustment?.toString() || "",
  )
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditingMessage, setIsEditingMessage] = useState(false)

  const counterValue = Number.parseFloat(counterAmount) || 0
  const originalValue = originalOffer.cash_adjustment || 0
  const item = originalOffer.your_items[0]
  const listingPrice = item?.price || 0

  const handleSubmitCounter = () => {
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
    }, 300)
  }

  if (!open) return null

  if (fullScreen) {
    return (
      <div className="@container flex h-full flex-col bg-background">
        {/* Topbar */}
        <div className="flex flex-shrink-0 items-center gap-3 border-b border-border px-4 py-2">
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-card"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="font-semibold">Counter Offer</h2>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 divide-y divide-border overflow-y-auto">
          {/* Item thumbnail + name + price */}
          {item && (
            <div className="p-4">
              <div className="flex gap-3 rounded-lg border border-border bg-secondary/50 p-3">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-0.5 text-base font-bold text-primary">
                    ${listingPrice.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Their original offer */}
          <div className="p-4">
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3">
              <span className="text-sm text-muted-foreground">
                {otherPartyUsername}&apos;s offer
              </span>
              <span className="font-semibold text-foreground">
                ${originalValue.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Counter amount */}
          <div className="p-4">
            <label className="mb-2 block text-sm font-semibold">Your Counter</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">
                $
              </span>
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
                className="w-full rounded-lg border-2 border-border bg-background py-4 pl-8 pr-4 text-xl font-semibold text-foreground transition-colors focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Message */}
          <div className="p-4">
            <label className="mb-2 block text-sm font-semibold">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message..."
              rows={3}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
            />
          </div>

          {/* Info note */}
          <div className="p-4">
            <div className="flex gap-2 rounded-lg border border-primary/20 bg-primary/10 p-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
              <p className="text-sm text-muted-foreground">
                Your counter will replace their original offer. They can accept, decline, or counter
                again.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 px-4 py-2">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        {/* Sticky footer */}
        <div className="flex flex-shrink-0 gap-2 border-t border-border p-4">
          <Button
            variant="ghost"
            className="min-h-[52px] flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitCounter}
            disabled={
              !counterAmount || counterValue <= 0 || counterValue === originalValue || isLoading
            }
            className="min-h-[52px] flex-1"
          >
            {isLoading ? "Sending..." : "Send Counter"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-xl font-bold">Counter Offer</h2>
          <button onClick={onClose} className="rounded-full p-2 transition-colors hover:bg-secondary" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          {item && (
            <div className="flex gap-3 rounded-lg border border-border bg-secondary/50 p-3">
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                <img src={item.image || "/placeholder.svg"} alt={item.title} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-lg font-bold text-primary">${listingPrice.toLocaleString()}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3">
            <span className="text-sm text-muted-foreground">{otherPartyUsername}&apos;s offer</span>
            <span className="font-semibold text-foreground">${originalValue.toLocaleString()}</span>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Your Counter</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">$</span>
              <input
                type="number"
                value={counterAmount}
                onChange={(e) => { setCounterAmount(e.target.value); setError(null) }}
                placeholder="0"
                min="0"
                step="0.01"
                className="w-full rounded-lg border-2 border-border bg-background py-4 pl-8 pr-4 text-xl font-semibold text-foreground transition-colors focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center gap-2">
              <label className="text-sm font-semibold">Message</label>
              {isEditingMessage && (
                <button onClick={() => setIsEditingMessage(false)} className="rounded-md bg-primary/10 p-0.5 transition-colors hover:bg-primary/20" aria-label="Save message">
                  <Check className="h-3 w-3 text-primary" />
                </button>
              )}
            </div>
            {isEditingMessage ? (
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setIsEditingMessage(false)}
                placeholder="Add a message..."
                className="w-full border-b border-primary/30 bg-transparent pb-1 text-sm italic text-foreground/80 focus:outline-none"
                autoFocus
              />
            ) : (
              <button onClick={() => setIsEditingMessage(true)} className="group flex w-full items-center gap-2 text-left">
                {message ? (
                  <p className="text-sm italic text-foreground/80">{message}</p>
                ) : (
                  <p className="text-sm italic text-muted-foreground/60 transition-colors group-hover:text-muted-foreground">Add a message...</p>
                )}
                <Pencil className="h-3 w-3 flex-shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            )}
          </div>

          <div className="flex gap-2 rounded-lg border border-primary/20 bg-primary/10 p-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              Your counter will replace their original offer. They can accept, decline, or counter again.
            </p>
          </div>

          {error && <p className="text-center text-sm text-destructive">{error}</p>}
        </div>

        <div className="flex gap-3 border-t border-border p-4">
          <Button variant="quiet_outline" onClick={onClose} className="flex-1 bg-transparent py-6 text-base font-semibold" disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitCounter}
            disabled={!counterAmount || counterValue <= 0 || counterValue === originalValue || isLoading}
            className="flex-1 bg-primary py-6 text-base font-semibold hover:bg-primary/90"
          >
            {isLoading ? "Sending..." : "Send Counter"}
          </Button>
        </div>
      </div>
    </div>
  )
}
