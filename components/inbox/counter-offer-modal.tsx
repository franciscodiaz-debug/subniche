"use client"

import { useState, useEffect, useMemo } from "react"
import { X, ArrowLeft, ArrowRightLeft, Lock, Check, Search, Package, Pencil } from "lucide-react"
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
  otherPartyId: string
  otherPartyUsername: string
  open: boolean
  fullScreen?: boolean
  onClose: () => void
  onCounterSent?: (counterOffer: Offer) => void
}

const extraMyListings: DemoListing[] = [
  { id: "my-extra-1", title: "Boss CE-2 Chorus", price: 275, image: "https://picsum.photos/seed/bossce2/400/300" },
  { id: "my-extra-2", title: "Tube Screamer TS808", price: 450, image: "https://picsum.photos/seed/ts808ibanez/400/300" },
]

const extraTheirListings: DemoListing[] = [
  { id: "their-extra-1", title: "Fuzz Face", price: 320, image: "https://picsum.photos/seed/dunlopfuzz/400/300" },
  { id: "their-extra-2", title: "Vox AC15", price: 1200, image: "https://picsum.photos/seed/voxac15amp/400/300" },
]

export function CounterOfferModal({
  originalOffer,
  otherPartyUsername,
  open,
  fullScreen = false,
  onClose,
  onCounterSent,
}: CounterOfferModalProps) {
  const [theirSelectedIds, setTheirSelectedIds] = useState<Set<string>>(new Set())
  const [yourSelectedIds, setYourSelectedIds] = useState<Set<string>>(new Set())
  const [cashAmount, setCashAmount] = useState("")
  const [cashSide, setCashSide] = useState<"their" | "your" | null>(null)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"their" | "your" | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isEditingMessage, setIsEditingMessage] = useState(false)

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

  const theirListings = useMemo<DemoListing[]>(() => {
    const fromOffer = originalOffer.their_items.map((i) => ({
      id: i.id,
      title: i.title,
      price: i.price ?? 0,
      image: i.image,
    }))
    return [...fromOffer, ...extraTheirListings]
  }, [originalOffer.their_items])

  useEffect(() => {
    if (!open) return
    setTheirSelectedIds(new Set(originalOffer.their_items.map((i) => i.id)))
    setYourSelectedIds(new Set(originalOffer.your_items.map((i) => i.id)))
    if (originalOffer.cash_adjustment > 0) {
      setCashAmount(originalOffer.cash_adjustment.toString())
      setCashSide("their")
    } else if (originalOffer.cash_adjustment < 0) {
      setCashAmount(Math.abs(originalOffer.cash_adjustment).toString())
      setCashSide("your")
    } else {
      setCashAmount("")
      setCashSide(null)
    }
    setMessage("")
    setError(null)
    setSearchQuery("")
    setActiveTab(null)
  }, [open, originalOffer])

  const cashValue = Number.parseFloat(cashAmount) || 0
  const theirCashValue = cashSide === "their" ? cashValue : 0
  const yourCashValue = cashSide === "your" ? cashValue : 0

  const selectedTheirItems = theirListings.filter((l) => theirSelectedIds.has(l.id))
  const selectedYourItems = myListings.filter((l) => yourSelectedIds.has(l.id))

  const toggleTheirItem = (itemId: string) => {
    setTheirSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  const toggleYourItem = (itemId: string) => {
    if (itemId === originalRequestedItemId) return
    setYourSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  const currentListings = activeTab === "their" ? theirListings : myListings
  const filteredListings = currentListings.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleMobileCashChange = (value: string) => {
    setCashAmount(value)
    const num = Number.parseFloat(value)
    if (value && num > 0) setCashSide("their")
    else setCashSide(null)
  }

  const handleCashChange = (value: string) => {
    setCashAmount(value)
    if (activeTab && value && Number.parseFloat(value) > 0) setCashSide(activeTab)
    else if (!value || Number.parseFloat(value) === 0) setCashSide(null)
  }

  const handleSubmitCounter = () => {
    if (theirSelectedIds.size === 0 && theirCashValue <= 0) {
      setError("The counter must include items or cash from them")
      return
    }
    if (yourSelectedIds.size === 0) {
      setError("You must include at least one item")
      return
    }

    setIsLoading(true)
    setError(null)

    const netCashAdjustment = theirCashValue - yourCashValue

    const theirItems: OfferItem[] = theirListings
      .filter((l) => theirSelectedIds.has(l.id))
      .map((l) => ({ id: l.id, title: l.title, image: l.image, price: l.price }))

    const yourItems: OfferItem[] = myListings
      .filter((l) => yourSelectedIds.has(l.id))
      .map((l) => ({ id: l.id, title: l.title, image: l.image, price: l.price }))

    const counterOffer: Offer = {
      id: `counter-${Date.now()}`,
      conversation_id: originalOffer.conversation_id,
      sender_id: "current-user",
      status: "pending",
      their_items: theirItems,
      your_items: yourItems,
      cash_adjustment: netCashAdjustment,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      created_at: new Date().toISOString(),
    }

    setTimeout(() => {
      setIsLoading(false)
      onCounterSent?.(counterOffer)
      onClose()
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
          {/* Compact offer summary — ~120px target height */}
          <div className="flex-shrink-0 border-b border-border px-4 py-2">
            <div className="flex flex-col gap-1">
              {/* Their items — compact read-only rows */}
              {originalOffer.their_items.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-2">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    className="h-10 w-10 flex-shrink-0 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {item.title}
                      {idx === originalOffer.their_items.length - 1 &&
                        originalOffer.cash_adjustment > 0 && (
                          <span className="ml-1.5 text-xs font-semibold text-primary">
                            · +${originalOffer.cash_adjustment.toLocaleString()} cash
                          </span>
                        )}
                    </p>
                    {item.price != null && (
                      <p className="text-xs text-muted-foreground">
                        ${item.price.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {/* Swap icon */}
              <div className="flex justify-center py-0.5">
                <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Your items — compact horizontal scroll */}
              <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5">
                {selectedYourItems.map((item) => {
                  const isRequired = item.id === originalRequestedItemId
                  return (
                    <div
                      key={item.id}
                      className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card/50 px-2 py-1"
                    >
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="h-10 w-10 flex-shrink-0 rounded-md object-cover"
                      />
                      <div className="w-16 min-w-0">
                        <p className="truncate text-xs font-medium">{item.title}</p>
                        {item.price != null && (
                          <p className="text-[10px] text-muted-foreground">
                            ${item.price.toLocaleString()}
                          </p>
                        )}
                      </div>
                      {isRequired ? (
                        <Lock className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                      ) : (
                        <button
                          onClick={() => toggleYourItem(item.id)}
                          className="flex-shrink-0 rounded p-0.5 hover:bg-muted"
                          aria-label={`Remove ${item.title}`}
                        >
                          <X className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  )
                })}
                {yourCashValue > 0 && (
                  <div className="flex flex-shrink-0 items-center rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-1">
                    <span className="text-xs font-semibold text-green-600">
                      ${yourCashValue}
                    </span>
                  </div>
                )}
                {selectedYourItems.length === 0 && yourCashValue === 0 && (
                  <p className="py-1 text-xs italic text-muted-foreground">No items selected</p>
                )}
              </div>
            </div>
          </div>

          {/* Search your listings */}
          <div className="p-4">
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
                <div className="py-4 text-center text-muted-foreground">
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
                      onClick={() => toggleYourItem(item.id)}
                      disabled={isRequired}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-colors",
                        isRequired
                          ? "cursor-not-allowed border-muted-foreground/30 bg-muted/30 opacity-70"
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
                        <p
                          className={cn(
                            "text-xs",
                            isRequired ? "text-muted-foreground" : "text-primary",
                          )}
                        >
                          ${item.price.toLocaleString()}
                        </p>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Cash input */}
          <div className="p-4">
            <div className="flex items-center gap-3">
              <label className="flex-shrink-0 text-sm font-medium">Cash $</label>
              <input
                type="number"
                value={cashAmount}
                onChange={(e) => handleMobileCashChange(e.target.value)}
                placeholder="0"
                min="0"
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Message */}
          <div className="p-4">
            <label className="mb-2 block text-sm font-medium">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Add a message for ${otherPartyUsername}…`}
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
          <Button variant="ghost" className="min-h-[52px] flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="min-h-[52px] flex-1"
            onClick={handleSubmitCounter}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Counter"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-card shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Counter Offer</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 transition-colors hover:bg-secondary"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="sticky top-[57px] z-10 border-b border-border bg-secondary/30 p-4">
          <div className="flex items-center justify-center gap-3">
            {/* Their side */}
            <button
              onClick={() => { setActiveTab(activeTab === "their" ? null : "their"); setSearchQuery("") }}
              className={cn(
                "group relative flex-1 rounded-lg border-2 p-2 transition-all",
                activeTab === "their"
                  ? "border-primary bg-primary/10"
                  : "border-transparent bg-background/50 hover:border-primary/40",
              )}
            >
              {activeTab !== "their" && (
                <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Pencil className="h-3 w-3 text-primary" />
                </div>
              )}
              <div className="mb-2 flex items-center justify-between">
                <p className={cn("text-xs", activeTab === "their" ? "font-medium text-primary" : "text-muted-foreground")}>
                  Their offer:
                </p>
                {activeTab === "their" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveTab(null) }}
                    className="rounded-md bg-primary/10 p-1 transition-colors hover:bg-primary/20"
                  >
                    <Check className="h-3 w-3 text-primary" />
                  </button>
                )}
              </div>
              <div className="grid min-h-[80px] grid-cols-2 gap-1.5">
                {selectedTheirItems.length > 0 || theirCashValue > 0 ? (
                  <>
                    {selectedTheirItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="overflow-hidden rounded-md border-2 border-card bg-muted">
                        <div className="aspect-square w-full overflow-hidden bg-muted">
                          <img src={item.image || "/placeholder.svg"} alt={item.title} className="h-full w-full object-cover" />
                        </div>
                        <div className="p-1.5">
                          <p className="line-clamp-1 text-[10px] font-medium">{item.title}</p>
                          <p className="text-[10px] text-primary">${item.price}</p>
                        </div>
                      </div>
                    ))}
                    {selectedTheirItems.length > 3 && (
                      <div className="flex aspect-square items-center justify-center rounded-md border-2 border-card bg-muted text-xs font-medium">
                        +{selectedTheirItems.length - 3}
                      </div>
                    )}
                    {theirCashValue > 0 && (
                      <div className="flex aspect-square items-center justify-center rounded-md border-2 border-green-500/30 bg-green-500/10">
                        <span className="text-xs font-semibold text-green-600">${theirCashValue}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="col-span-2 flex h-20 items-center justify-center">
                    <span className="text-xs italic text-muted-foreground">No items</span>
                  </div>
                )}
              </div>
            </button>

            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary">
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Your side */}
            <button
              onClick={() => { setActiveTab(activeTab === "your" ? null : "your"); setSearchQuery("") }}
              className={cn(
                "group relative flex-1 rounded-lg border-2 p-2 transition-all",
                activeTab === "your"
                  ? "border-primary bg-primary/10"
                  : "border-transparent bg-background/50 hover:border-primary/40",
              )}
            >
              {activeTab !== "your" && (
                <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Pencil className="h-3 w-3 text-primary" />
                </div>
              )}
              <div className="mb-2 flex items-center justify-between">
                <p className={cn("text-xs", activeTab === "your" ? "font-medium text-primary" : "text-muted-foreground")}>
                  Your items:
                </p>
                {activeTab === "your" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveTab(null) }}
                    className="rounded-md bg-primary/10 p-1 transition-colors hover:bg-primary/20"
                  >
                    <Check className="h-3 w-3 text-primary" />
                  </button>
                )}
              </div>
              <div className="grid min-h-[80px] grid-cols-2 gap-1.5">
                {selectedYourItems.length > 0 || yourCashValue > 0 ? (
                  <>
                    {selectedYourItems.slice(0, 3).map((item) => {
                      const isRequired = item.id === originalRequestedItemId
                      return (
                        <div key={item.id} className={cn("relative overflow-hidden rounded-md bg-muted", isRequired && "border-muted-foreground/50")}>
                          <div className="relative aspect-square w-full overflow-hidden bg-muted">
                            <img src={item.image || "/placeholder.svg"} alt={item.title} className="h-full w-full object-cover" />
                            {isRequired && (
                              <div className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-muted-foreground/80">
                                <Lock className="h-2.5 w-2.5 text-background" />
                              </div>
                            )}
                          </div>
                          <div className="p-1.5">
                            <p className="line-clamp-1 text-[10px] font-medium">{item.title}</p>
                            <p className={cn("text-[10px]", isRequired ? "text-muted-foreground" : "text-primary")}>
                              ${item.price}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    {selectedYourItems.length > 3 && (
                      <div className="flex aspect-square items-center justify-center rounded-md border-2 border-card bg-muted text-xs font-medium">
                        +{selectedYourItems.length - 3}
                      </div>
                    )}
                    {yourCashValue > 0 && (
                      <div className="flex aspect-square items-center justify-center rounded-md border-2 border-green-500/30 bg-green-500/10">
                        <span className="text-xs font-semibold text-green-600">${yourCashValue}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="col-span-2 flex h-20 items-center justify-center">
                    <span className="text-xs italic text-muted-foreground">No items</span>
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>

        {activeTab !== null && (
          <div className="space-y-4 border-y-2 border-primary/20 bg-primary/5 p-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab === "their" ? "their" : "your"} listings...`}
                className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-3 text-sm focus:border-primary/50 focus:outline-none"
              />
            </div>

            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
              {filteredListings.length === 0 ? (
                <div className="flex-1 py-6 text-center text-muted-foreground">
                  <Package className="mx-auto mb-1 h-6 w-6 opacity-50" />
                  <p className="text-xs">No listings found</p>
                </div>
              ) : (
                filteredListings.map((item) => {
                  const isSelected = activeTab === "their" ? theirSelectedIds.has(item.id) : yourSelectedIds.has(item.id)
                  const isRequired = activeTab === "your" && item.id === originalRequestedItemId

                  return (
                    <button
                      key={item.id}
                      onClick={() => activeTab === "their" ? toggleTheirItem(item.id) : toggleYourItem(item.id)}
                      className={cn(
                        "relative w-20 flex-shrink-0 rounded-md border text-left transition-all",
                        isRequired
                          ? "cursor-not-allowed border-muted-foreground/50 bg-muted/30 opacity-70"
                          : isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30",
                      )}
                    >
                      {(isSelected || isRequired) && (
                        <div className={cn("absolute right-1 top-1 z-10 flex h-4 w-4 items-center justify-center rounded-full", isRequired ? "bg-muted-foreground/80" : "bg-primary")}>
                          {isRequired ? <Lock className="h-2 w-2 text-background" /> : <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                        </div>
                      )}
                      <div className="aspect-square w-full overflow-hidden rounded-t-md bg-muted">
                        <img src={item.image || "/placeholder.svg"} alt={item.title} className="h-full w-full object-cover" />
                      </div>
                      <div className="p-1.5">
                        <p className="line-clamp-1 text-[10px] font-medium">{item.title}</p>
                        <p className={cn("text-[10px]", isRequired ? "text-muted-foreground" : "text-primary")}>${item.price}</p>
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            <div className="border-t border-border pt-3">
              <div className="flex items-center gap-2">
                <label className="whitespace-nowrap text-sm font-medium">Cash</label>
                <div className="flex flex-1 items-center gap-2">
                  <span className="text-sm text-muted-foreground">$</span>
                  <input
                    type="number"
                    value={cashAmount}
                    onChange={(e) => handleCashChange(e.target.value)}
                    placeholder="0"
                    className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm focus:border-primary/50 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === null && (
          <div className="p-4">
            <div className="mb-1 flex items-center gap-2">
              <p className="text-xs text-muted-foreground">Message</p>
              {isEditingMessage && (
                <button onClick={() => setIsEditingMessage(false)} className="rounded-md bg-primary/10 p-0.5 transition-colors hover:bg-primary/20">
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
                  <p className="text-sm italic text-muted-foreground">{message}</p>
                ) : (
                  <p className="text-sm italic text-muted-foreground/60 transition-colors group-hover:text-muted-foreground">
                    Add a message for {otherPartyUsername}...
                  </p>
                )}
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="border-t border-destructive/20 bg-destructive/10 px-4 py-2">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="sticky bottom-0 flex gap-3 border-t border-border bg-card p-4">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={activeTab !== null || isEditingMessage}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSubmitCounter} disabled={isLoading || activeTab !== null || isEditingMessage}>
            {isLoading ? "Sending..." : "Send Counter"}
          </Button>
        </div>
      </div>
    </div>
  )
}
