"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X, ArrowRightLeft, Lock, Check, Search, Package, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { demoListings } from "@/lib/demo-data"
import type { Listing } from "@/lib/types"
import type { Offer, OfferItem } from "@/lib/types/inbox"

interface CounterOfferModalProps {
  originalOffer: Offer
  otherPartyId: string
  otherPartyUsername: string
  open: boolean
  onClose: () => void
  onCounterSent?: (counterOffer: Offer) => void
}

export function CounterOfferModal({
  originalOffer,
  otherPartyId,
  otherPartyUsername,
  open,
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

  const [theirOfferItems, setTheirOfferItems] = useState<OfferItem[]>([])
  const [yourOfferItems, setYourOfferItems] = useState<OfferItem[]>([])

  const [myListings, setMyListings] = useState<Listing[]>([])
  const [theirListings, setTheirListings] = useState<Listing[]>([])
  const [activeTab, setActiveTab] = useState<"their" | "your" | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isEditingMessage, setIsEditingMessage] = useState(false)

  // The original item that was requested - cannot be removed
  const originalRequestedItemId = originalOffer.your_items[0]?.id

  // Initialize with original offer terms
  useEffect(() => {
    if (open && originalOffer) {
      setTheirOfferItems([...originalOffer.their_items])
      setYourOfferItems([...originalOffer.your_items])
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
    }
  }, [open, originalOffer])

  // Fetch listings for the item selector
  useEffect(() => {
    const fetchListings = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: myData } = await supabase.from("listings").select("*").eq("seller_id", user.id)
        if (myData) setMyListings(myData)

        const { data: theirData } = await supabase.from("listings").select("*").eq("seller_id", otherPartyId)
        if (theirData) setTheirListings(theirData)
      } else {
        // Include original offer items plus additional demo items
        const theirOfferListings: Listing[] = originalOffer.their_items.map((item) => ({
          id: item.id,
          seller_id: otherPartyId,
          title: item.title,
          subtitle: item.subtitle,
          description: "",
          price: item.price || 0,
          category: "",
          subcategory: "",
          condition: "Excellent",
          payment_methods: ["Cash"],
          logistics: "Local pickup",
          images: [item.image],
          location: "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))

        const yourOfferListings: Listing[] = originalOffer.your_items.map((item) => ({
          id: item.id,
          seller_id: "current-user",
          title: item.title,
          subtitle: item.subtitle,
          description: "",
          price: item.price || 0,
          category: "",
          subcategory: "",
          condition: "Excellent",
          payment_methods: ["Cash"],
          logistics: "Local pickup",
          images: [item.image],
          location: "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))

        // Add some extra demo items for testing adding new items
        const extraMyListings: Listing[] = [
          {
            id: "my-extra-1",
            seller_id: "current-user",
            title: "Discraft Luna",
            subtitle: "Putt & Approach - 173g",
            description: "Great condition Luna",
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
            id: "my-extra-2",
            seller_id: "current-user",
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
        ]

        setMyListings([...yourOfferListings, ...extraMyListings])
        setTheirListings([
          ...theirOfferListings,
          ...demoListings.filter((l) => l.seller_id === "demo-user-3").slice(0, 2),
        ])
      }
    }

    if (open) fetchListings()
  }, [open, otherPartyId, originalOffer])

  const cashValue = Number.parseFloat(cashAmount) || 0
  const theirCashValue = cashSide === "their" ? cashValue : 0
  const yourCashValue = cashSide === "your" ? cashValue : 0

  const selectedTheirItems = theirListings.filter((l) => theirSelectedIds.has(l.id))
  const selectedYourItems = myListings.filter((l) => yourSelectedIds.has(l.id))

  const toggleTheirItem = (itemId: string) => {
    setTheirSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  const toggleYourItem = (itemId: string) => {
    // Can't remove the original requested item
    if (itemId === originalRequestedItemId) return

    setYourSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  // Filter listings by search based on active tab
  const currentListings = activeTab === "their" ? theirListings : myListings
  const filteredListings = currentListings.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCashChange = (value: string) => {
    setCashAmount(value)
    if (activeTab && value && Number.parseFloat(value) > 0) {
      setCashSide(activeTab)
    } else if (!value || Number.parseFloat(value) === 0) {
      setCashSide(null)
    }
  }

  const handleSubmitCounter = async () => {
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
      .map((l) => ({
        id: l.id,
        title: l.title,
        subtitle: l.subtitle,
        image: l.images[0] || "/placeholder.svg",
        price: l.price,
      }))

    const yourItems: OfferItem[] = myListings
      .filter((l) => yourSelectedIds.has(l.id))
      .map((l) => ({
        id: l.id,
        title: l.title,
        subtitle: l.subtitle,
        image: l.images[0] || "/placeholder.svg",
        price: l.price,
      }))

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
    }, 500)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg bg-card rounded-lg border border-border shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Counter Offer</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 bg-secondary/30 border-b border-border sticky top-[57px] z-10">
          <div className="flex items-center justify-center gap-3">
            {/* Their side */}
            <button
              onClick={() => {
                setActiveTab(activeTab === "their" ? null : "their")
                setSearchQuery("")
              }}
              className={`flex-1 p-2 rounded-lg transition-all relative border-2 group ${
                activeTab === "their"
                  ? "bg-primary/10 border-primary"
                  : "bg-background/50 border-transparent hover:border-primary/40"
              }`}
            >
              {activeTab !== "their" && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Pencil className="h-3 w-3 text-primary" />
                </div>
              )}
              <div className="flex items-center justify-between mb-2">
                <p
                  className={`text-xs ${activeTab === "their" ? "text-primary font-medium" : "text-muted-foreground"}`}
                >
                  Their offer:
                </p>
                {activeTab === "their" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveTab(null)
                    }}
                    className="p-1 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    <Check className="h-3 w-3 text-primary" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1.5 min-h-[80px]">
                {selectedTheirItems.length > 0 || theirCashValue > 0 ? (
                  <>
                    {selectedTheirItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="rounded-md border-2 border-card overflow-hidden bg-muted">
                        <div className="w-full aspect-square overflow-hidden bg-muted">
                          <Image
                            src={item.images[0] || "/placeholder.svg"}
                            alt={item.title}
                            width={100}
                            height={100}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="p-1.5">
                          <p className="text-[10px] font-medium line-clamp-1">{item.title}</p>
                          <p className="text-[10px] text-primary">${item.price}</p>
                        </div>
                      </div>
                    ))}
                    {selectedTheirItems.length > 3 && (
                      <div className="rounded-md border-2 border-card bg-muted flex items-center justify-center text-xs font-medium aspect-square">
                        +{selectedTheirItems.length - 3}
                      </div>
                    )}
                    {theirCashValue > 0 && (
                      <div className="rounded-md border-2 border-green-500/30 bg-green-500/5 flex items-center justify-center aspect-square">
                        <span className="text-xs font-semibold text-green-500">${theirCashValue}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="col-span-2 flex items-center justify-center h-20">
                    <span className="text-xs text-muted-foreground italic">No items</span>
                  </div>
                )}
              </div>
            </button>

            {/* Swap icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Your side */}
            <button
              onClick={() => {
                setActiveTab(activeTab === "your" ? null : "your")
                setSearchQuery("")
              }}
              className={`flex-1 p-2 rounded-lg transition-all relative border-2 group ${
                activeTab === "your"
                  ? "bg-primary/10 border-primary"
                  : "bg-background/50 border-transparent hover:border-primary/40"
              }`}
            >
              {activeTab !== "your" && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Pencil className="h-3 w-3 text-primary" />
                </div>
              )}
              <div className="flex items-center justify-between mb-2">
                <p className={`text-xs ${activeTab === "your" ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  Your items:
                </p>
                {activeTab === "your" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveTab(null)
                    }}
                    className="p-1 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    <Check className="h-3 w-3 text-primary" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1.5 min-h-[80px]">
                {selectedYourItems.length > 0 || yourCashValue > 0 ? (
                  <>
                    {selectedYourItems.slice(0, 3).map((item) => {
                      const isRequired = item.id === originalRequestedItemId
                      return (
                        <div
                          key={item.id}
                          className={`rounded-md overflow-hidden bg-muted relative ${
                            isRequired ? "border-muted-foreground/50" : ""
                          }`}
                        >
                          <div className="w-full aspect-square overflow-hidden bg-muted">
                            <Image
                              src={item.images[0] || "/placeholder.svg"}
                              alt={item.title}
                              width={100}
                              height={100}
                              className="object-cover w-full h-full"
                            />
                            {isRequired && (
                              <div className="absolute top-1 right-1 w-4 h-4 bg-muted-foreground/80 rounded-full flex items-center justify-center">
                                <Lock className="h-2.5 w-2.5 text-background" />
                              </div>
                            )}
                          </div>
                          <div className="p-1.5">
                            <p className="text-[10px] font-medium line-clamp-1">{item.title}</p>
                            <p className={`text-[10px] ${isRequired ? "text-muted-foreground" : "text-primary"}`}>
                              ${item.price}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    {selectedYourItems.length > 3 && (
                      <div className="rounded-md border-2 border-card bg-muted flex items-center justify-center text-xs font-medium aspect-square">
                        +{selectedYourItems.length - 3}
                      </div>
                    )}
                    {yourCashValue > 0 && (
                      <div className="rounded-md border-2 border-green-500/30 bg-green-500/5 flex items-center justify-center aspect-square">
                        <span className="text-xs font-semibold text-green-500">${yourCashValue}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="col-span-2 flex items-center justify-center h-20">
                    <span className="text-xs text-muted-foreground italic">No items</span>
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>

        {activeTab !== null && (
          /* Item Selection when editing */
          <div className="p-4 space-y-4 bg-primary/5 border-y-2 border-primary/20">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab === "their" ? "their" : "your"} listings...`}
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
                  const isSelected =
                    activeTab === "their" ? theirSelectedIds.has(item.id) : yourSelectedIds.has(item.id)
                  const isRequired = activeTab === "your" && item.id === originalRequestedItemId

                  return (
                    <button
                      key={item.id}
                      onClick={() => (activeTab === "their" ? toggleTheirItem(item.id) : toggleYourItem(item.id))}
                      className={`relative flex-shrink-0 w-20 rounded-md border transition-all text-left ${
                        isRequired
                          ? "border-muted-foreground/50 bg-muted/30 cursor-not-allowed opacity-70"
                          : isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                      }`}
                    >
                      {/* Selection indicator */}
                      {(isSelected || isRequired) && (
                        <div
                          className={`absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center z-10 ${
                            isRequired ? "bg-muted-foreground/80" : "bg-primary"
                          }`}
                        >
                          {isRequired ? (
                            <Lock className="h-2 w-2 text-background" />
                          ) : (
                            <Check className="h-2.5 w-2.5 text-primary-foreground" />
                          )}
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
                        <p className={`text-[10px] ${isRequired ? "text-muted-foreground" : "text-primary"}`}>
                          ${item.price}
                        </p>
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            {/* Cash adjustment section */}
            <div className="pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium whitespace-nowrap">Cash</label>
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm text-muted-foreground">$</span>
                  <input
                    type="number"
                    value={cashAmount}
                    onChange={(e) => handleCashChange(e.target.value)}
                    placeholder="0"
                    className="flex-1 bg-background border border-border rounded-md px-2 py-1 text-sm focus:outline-none focus:border-primary/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
              {cashSide && activeTab && cashSide !== activeTab && (
                <p className="text-xs text-amber-500 mt-1">
                  Note: Adding cash here will replace the ${cashAmount} from the{" "}
                  {cashSide === "their" ? "their" : "your"} side.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Message section */}
        {activeTab === null && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs text-muted-foreground">Message</p>
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
                  <p className="text-sm italic text-muted-foreground">{message}</p>
                ) : (
                  <p className="text-sm italic text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
                    Add a message...
                  </p>
                )}
              </button>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-border flex gap-3 sticky bottom-0 bg-card">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={activeTab !== null || isEditingMessage}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmitCounter}
            disabled={isLoading || activeTab !== null || isEditingMessage}
          >
            {isLoading ? "Sending..." : "Send Counter"}
          </Button>
        </div>
      </div>
    </div>
  )
}
