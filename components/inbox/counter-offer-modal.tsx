"use client"

import { useState, useEffect, useMemo } from "react"
import { ArrowLeft, ArrowRightLeft, Check, Lock, Minus, Package, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Offer, OfferItem } from "@/lib/inbox-types"

interface DemoListing {
  id: string
  title: string
  price: number
  image: string
}

interface CounterOfferModalProps {
  originalOffer: Offer
  otherPartyUsername: string
  onClose: () => void
  onCounterSent?: (counterOffer: Offer) => void
}

const extraMyListings: DemoListing[] = [
  { id: "my-extra-1", title: "Boss CE-2 Chorus", price: 275, image: "https://picsum.photos/seed/bossce2/400/300" },
  { id: "my-extra-2", title: "Tube Screamer TS808", price: 450, image: "https://picsum.photos/seed/ts808ibanez/400/300" },
]

function CompactSummary({ offer }: { offer: Offer }) {
  const theirTitle = offer.their_items[0]?.title ?? "—"
  const yourTitle = offer.your_items[0]?.title ?? "—"
  const cash = offer.cash_adjustment

  let cashPart = ""
  if (cash > 0) cashPart = ` · +$${cash.toLocaleString()} cash`
  else if (cash < 0) cashPart = ` · −$${Math.abs(cash).toLocaleString()} cash`

  return (
    <div className="flex-shrink-0 border-b border-border bg-card/40 px-4 py-2.5">
      <p className="truncate text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{theirTitle}</span>
        {cashPart && <span className="text-primary">{cashPart}</span>}
        {" "}
        <ArrowRightLeft className="inline h-3.5 w-3.5 align-middle text-muted-foreground" />
        {" "}
        <span className="font-medium text-foreground">{yourTitle}</span>
      </p>
    </div>
  )
}

function CashControl({
  amount,
  direction,
  onAmountChange,
  onDirectionToggle,
}: {
  amount: string
  direction: "add" | "request"
  onAmountChange: (v: string) => void
  onDirectionToggle: () => void
}) {
  const numericAmount = Number.parseFloat(amount) || 0

  return (
    <div className="p-4">
      <p className="mb-2 text-sm font-medium">Cash adjustment</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onDirectionToggle}
          className={cn(
            "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border font-bold transition-colors",
            direction === "add"
              ? "border-status-success/40 bg-status-success/10 text-status-success hover:bg-status-success/20"
              : "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20",
          )}
          aria-label="Toggle direction"
        >
          {direction === "add" ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
        </button>
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            $
          </span>
          <input
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0"
            min="0"
            className="w-full rounded-lg border border-border bg-background py-2 pl-7 pr-3 text-sm focus:border-primary/50 focus:outline-none"
          />
        </div>
      </div>
      {numericAmount > 0 && (
        <p
          className={cn(
            "mt-1.5 text-xs font-medium",
            direction === "add" ? "text-status-success" : "text-destructive",
          )}
        >
          {direction === "add"
            ? `adding $${numericAmount.toLocaleString()} cash`
            : `requesting $${numericAmount.toLocaleString()} cash`}
        </p>
      )}
    </div>
  )
}

export function CounterOfferModal({
  originalOffer,
  otherPartyUsername,
  onClose,
  onCounterSent,
}: CounterOfferModalProps) {
  const originalRequestedItemId = originalOffer.your_items[0]?.id

  const myListings = useMemo<DemoListing[]>(() => {
    const fromOffer = originalOffer.your_items.map((i) => ({
      id: i.id,
      title: i.title,
      price: i.price ?? 0,
      image: i.image,
    }))
    return [...fromOffer, ...extraMyListings]
  }, [originalOffer.your_items])

  const [yourSelectedIds, setYourSelectedIds] = useState<Set<string>>(new Set())
  const [cashAmount, setCashAmount] = useState("")
  const [cashDirection, setCashDirection] = useState<"add" | "request">("add")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    setYourSelectedIds(new Set(originalOffer.your_items.map((i) => i.id)))
    if (originalOffer.cash_adjustment > 0) {
      setCashAmount(originalOffer.cash_adjustment.toString())
      setCashDirection("add")
    } else if (originalOffer.cash_adjustment < 0) {
      setCashAmount(Math.abs(originalOffer.cash_adjustment).toString())
      setCashDirection("request")
    } else {
      setCashAmount("")
      setCashDirection("add")
    }
    setMessage("")
    setError(null)
    setSearchQuery("")
  }, [originalOffer])

  const toggleYourItem = (itemId: string) => {
    if (itemId === originalRequestedItemId) return
    setYourSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  const filteredListings = myListings.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSubmitCounter = () => {
    if (yourSelectedIds.size === 0) {
      setError("You must include at least one item")
      return
    }

    setIsLoading(true)
    setError(null)

    const cashValue = Number.parseFloat(cashAmount) || 0
    const netCash = cashDirection === "add" ? cashValue : -cashValue

    const yourItems: OfferItem[] = myListings
      .filter((l) => yourSelectedIds.has(l.id))
      .map((l) => ({ id: l.id, title: l.title, image: l.image, price: l.price }))

    const counterOffer: Offer = {
      id: `counter-${Date.now()}`,
      conversation_id: originalOffer.conversation_id,
      sender_id: "current-user",
      status: "pending",
      their_items: originalOffer.their_items,
      your_items: yourItems,
      cash_adjustment: netCash,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      created_at: new Date().toISOString(),
    }

    setTimeout(() => {
      setIsLoading(false)
      onCounterSent?.(counterOffer)
      onClose()
    }, 300)
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center gap-3 border-b border-border px-4 py-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 transition-colors hover:bg-card"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="font-semibold">Counter Offer</h2>
      </div>

      {/* Compact summary */}
      <CompactSummary offer={originalOffer} />

      {/* Scrollable body */}
      <div className="flex-1 divide-y divide-border overflow-y-auto">

        {/* Your items selector */}
        <div className="p-4">
          <p className="mb-3 text-sm font-medium">Your items</p>
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your listings…"
              className="w-full rounded-md border border-border bg-background py-2 pl-8 pr-3 text-sm focus:border-primary/50 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            {filteredListings.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">
                <Package className="mx-auto mb-1 h-6 w-6 opacity-50" />
                <p className="text-xs">No listings found</p>
              </div>
            ) : (
              filteredListings.map((item) => {
                const isSelected = yourSelectedIds.has(item.id)
                const isRequired = item.id === originalRequestedItemId
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleYourItem(item.id)}
                    disabled={isRequired}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition-colors",
                      isRequired
                        ? "cursor-not-allowed border-border/50 bg-muted/30 opacity-70"
                        : isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30",
                    )}
                  >
                    <div className="relative h-12 w-12 flex-shrink-0">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                      {(isSelected || isRequired) && (
                        <div
                          className={cn(
                            "absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full",
                            isRequired ? "bg-muted-foreground/80" : "bg-primary",
                          )}
                        >
                          {isRequired ? (
                            <Lock className="h-2 w-2 text-background" />
                          ) : (
                            <Check className="h-2.5 w-2.5 text-primary-foreground" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <p className={cn("text-xs", isRequired ? "text-muted-foreground" : "text-primary")}>
                        ${item.price.toLocaleString()}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Cash control */}
        <CashControl
          amount={cashAmount}
          direction={cashDirection}
          onAmountChange={setCashAmount}
          onDirectionToggle={() => setCashDirection((d) => (d === "add" ? "request" : "add"))}
        />

        {/* Message */}
        <div className="p-4">
          <label className="mb-2 block text-sm font-medium">
            Message <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Add a note for ${otherPartyUsername}…`}
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
          />
        </div>

        {error && (
          <div className="bg-destructive/10 px-4 py-2">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </div>

      {/* Sticky footer */}
      <div className="flex flex-shrink-0 gap-2 border-t border-border p-4">
        <Button variant="ghost" className="min-h-[48px] flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="min-h-[48px] flex-1"
          onClick={handleSubmitCounter}
          disabled={isLoading}
        >
          {isLoading ? "Sending…" : "Send Counter"}
        </Button>
      </div>
    </div>
  )
}
