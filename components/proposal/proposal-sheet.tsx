"use client"

/**
 * Single proposal-building surface that unifies what used to be:
 *   - MakeOfferModal (initiate a trade from a listing detail)
 *   - CounterOfferModal (counter an active offer in the inbox)
 *   - CashCounterOfferModal (counter a cash-only offer)
 *
 * Two modes:
 *   - "initiate": building a fresh proposal targeting a listing
 *   - "counter":  responding to an existing offer; the target item is locked,
 *                 and a "View history" link reveals the negotiation chain
 *
 * The balance section only renders when every involved item carries a
 * listed price. When any item is unpriced, we show a short note instead —
 * by product decision, unpriced items defer their value to chat.
 *
 * Keeping-status items are excluded from the "Your items" picker by the
 * caller, not here. The owner has to flip an item to For Trade before it
 * can be proposed.
 */

import { useEffect, useMemo, useState } from "react"
import {
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  Lock,
  Minus,
  Plus,
  Search,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import type { Offer, OfferItem } from "@/lib/inbox-types"

export type ProposalMode = "initiate" | "counter"
export type CashDirection = "none" | "add" | "request"

export interface ProposalParticipant {
  username: string
  avatarUrl?: string
}

export interface ProposalListingPreview {
  id: string
  title: string
  image: string
  price?: number | null
  subtitle?: string
}

export interface ProposalSheetProps {
  open: boolean
  onClose: () => void
  mode: ProposalMode
  otherParty: ProposalParticipant
  /** initiate mode — the listing the user is targeting */
  targetListing?: ProposalListingPreview
  /** counter mode — the offer being countered (its current state) */
  originalOffer?: Offer
  /** counter mode — chain of past offers (oldest first), excludes the active one */
  history?: Offer[]
  /** the current user's items available to offer (already filtered to for_trade) */
  availableItems: ProposalListingPreview[]
  onSend: (next: Offer) => void
}

const HEADER_COPY: Record<ProposalMode, { title: string; cta: string }> = {
  initiate: { title: "New trade proposal", cta: "Send proposal" },
  counter: { title: "Counter offer", cta: "Send counter" },
}

function formatMoney(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`
}

export function ProposalSheet({
  open,
  onClose,
  mode,
  otherParty,
  targetListing,
  originalOffer,
  history = [],
  availableItems,
  onSend,
}: ProposalSheetProps) {
  // Items the receiving party gives up (always includes the target listing as a locked anchor)
  const lockedTargetId =
    mode === "initiate" ? targetListing?.id ?? null : originalOffer?.your_items[0]?.id ?? null

  // In counter mode, "their" items pool is whatever the original offer requested from us, plus
  // the right for the user to ask for more later (not designed in this commit — out of scope).
  // For initiate mode, only the single target listing is on "their" side.
  const initialTheirItems: ProposalListingPreview[] = useMemo(() => {
    if (mode === "initiate" && targetListing) {
      return [
        {
          id: targetListing.id,
          title: targetListing.title,
          image: targetListing.image,
          price: targetListing.price ?? null,
          subtitle: targetListing.subtitle,
        },
      ]
    }
    if (mode === "counter" && originalOffer) {
      return originalOffer.your_items.map(toPreview)
    }
    return []
  }, [mode, targetListing, originalOffer])

  // Items the current user offers
  const initialYourItems: ProposalListingPreview[] = useMemo(() => {
    if (mode === "counter" && originalOffer) {
      return originalOffer.their_items.map(toPreview)
    }
    return []
  }, [mode, originalOffer])

  const [yourItems, setYourItems] = useState<ProposalListingPreview[]>(initialYourItems)
  const [cashDirection, setCashDirection] = useState<CashDirection>(() => {
    if (mode === "counter" && originalOffer) {
      if (originalOffer.cash_adjustment > 0) return "add" // they were adding cash before
      if (originalOffer.cash_adjustment < 0) return "request"
    }
    return "none"
  })
  const [cashAmount, setCashAmount] = useState<string>(() => {
    if (mode === "counter" && originalOffer && originalOffer.cash_adjustment !== 0) {
      return Math.abs(originalOffer.cash_adjustment).toString()
    }
    return ""
  })
  const [message, setMessage] = useState("")
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [pickerSearch, setPickerSearch] = useState("")
  const [historyOpen, setHistoryOpen] = useState(false)

  // Reset state when the sheet opens with a different proposal
  useEffect(() => {
    if (!open) return
    setYourItems(initialYourItems)
    setMessage("")
    setIsPickerOpen(false)
    setPickerSearch("")
    setHistoryOpen(false)
  }, [open, initialYourItems])

  const parsedCash = Number.parseFloat(cashAmount) || 0

  const pickerCandidates = availableItems.filter(
    (item) => !yourItems.some((y) => y.id === item.id) && item.id !== lockedTargetId,
  )
  const filteredCandidates = pickerCandidates.filter((item) =>
    item.title.toLowerCase().includes(pickerSearch.toLowerCase()),
  )

  const canSend = yourItems.length > 0

  const handleSend = () => {
    if (!canSend) return
    const cashAdjustment =
      cashDirection === "add" ? parsedCash : cashDirection === "request" ? -parsedCash : 0
    const conversationId =
      mode === "counter" && originalOffer ? originalOffer.conversation_id : `pending-${Date.now()}`
    const next: Offer = {
      id: `proposal-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: "current-user",
      status: "pending",
      their_items: yourItems.map(toOfferItem), // from chat POV, sender's items are "their_items" later
      your_items: initialTheirItems.map(toOfferItem), // receiver's items
      cash_adjustment: cashAdjustment,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      created_at: new Date().toISOString(),
    }
    onSend(next)
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-lg"
      >
        <ProposalHeader title={HEADER_COPY[mode].title} />

        <div className="flex-1 overflow-y-auto">
          <ContextStrip otherParty={otherParty} target={initialTheirItems[0]} />

          {mode === "counter" && history.length > 0 ? (
            <HistorySection
              history={history}
              otherPartyUsername={otherParty.username}
              open={historyOpen}
              onToggle={() => setHistoryOpen((v) => !v)}
            />
          ) : null}

          <SectionLabel>You give</SectionLabel>
          <ItemList
            items={yourItems}
            onRemove={(id) => setYourItems((prev) => prev.filter((p) => p.id !== id))}
            emptyHint="Add at least one item to propose."
          />
          <div className="px-4 pb-4 pt-3">
            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
              Add your items
            </button>
          </div>

          <SectionLabel>You receive</SectionLabel>
          <ItemList
            items={initialTheirItems}
            locked
            emptyHint="No target item — this shouldn't happen."
          />

          <SectionLabel>Cash adjustment</SectionLabel>
          <CashControl
            direction={cashDirection}
            onDirectionChange={setCashDirection}
            amount={cashAmount}
            onAmountChange={setCashAmount}
            otherPartyUsername={otherParty.username}
          />

          <div className="mt-4 border-t border-border px-4 py-4">
            <label className="mb-2 block text-sm font-medium">
              Message <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Add a note for @${otherParty.username}…`}
              rows={3}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-shrink-0 gap-2 border-t border-border p-4">
          <Button variant="quiet_outline" className="min-h-[48px] flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="min-h-[48px] flex-1"
            onClick={handleSend}
            disabled={!canSend}
          >
            {HEADER_COPY[mode].cta}
          </Button>
        </div>

        {isPickerOpen ? (
          <ItemPicker
            candidates={filteredCandidates}
            search={pickerSearch}
            onSearchChange={setPickerSearch}
            onSelect={(item) => {
              setYourItems((prev) => [...prev, item])
              setIsPickerOpen(false)
              setPickerSearch("")
            }}
            onClose={() => {
              setIsPickerOpen(false)
              setPickerSearch("")
            }}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

/* ─── pieces ────────────────────────────────────────────────────────── */

function ProposalHeader({ title }: { title: string }) {
  return (
    <div className="flex flex-shrink-0 items-center border-b border-border px-4 py-3 pr-12">
      <h2 className="text-base font-semibold">{title}</h2>
    </div>
  )
}

function ContextStrip({
  otherParty,
  target,
}: {
  otherParty: ProposalParticipant
  target?: ProposalListingPreview
}) {
  return (
    <div className="flex items-center gap-3 border-b border-border bg-card/40 px-4 py-3">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-xs font-semibold text-foreground">
        {otherParty.avatarUrl ? (
          <img
            src={otherParty.avatarUrl}
            alt={otherParty.username}
            className="h-full w-full object-cover"
          />
        ) : (
          otherParty.username.charAt(0).toUpperCase()
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Negotiating with</p>
        <p className="truncate text-sm font-medium">@{otherParty.username}</p>
      </div>
      {target ? (
        <div className="hidden flex-shrink-0 sm:flex sm:items-center sm:gap-2">
          <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="max-w-[160px] truncate text-xs text-muted-foreground">{target.title}</p>
        </div>
      ) : null}
    </div>
  )
}

function HistorySection({
  history,
  otherPartyUsername,
  open,
  onToggle,
}: {
  history: Offer[]
  otherPartyUsername: string
  open: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-b border-border bg-muted/20">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <span>View history ({history.length})</span>
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>
      {open ? (
        <ol className="space-y-2 px-4 pb-3">
          {history.map((offer, idx) => {
            const isFromYou = offer.sender_id === "current-user"
            const cashLabel =
              offer.cash_adjustment === 0
                ? ""
                : offer.cash_adjustment > 0
                  ? `+ ${formatMoney(offer.cash_adjustment)} cash`
                  : `− ${formatMoney(Math.abs(offer.cash_adjustment))} cash`
            return (
              <li
                key={offer.id}
                className="flex items-start gap-2 text-xs text-muted-foreground"
              >
                <span className="mt-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold">
                  {idx + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-medium text-foreground">
                    {isFromYou ? "You" : `@${otherPartyUsername}`}
                  </span>
                  {": "}
                  {offer.their_items.map((i) => i.title).join(", ") || "—"}
                  {" "}
                  <ArrowRightLeft className="inline h-3 w-3 align-middle" />
                  {" "}
                  {offer.your_items.map((i) => i.title).join(", ") || "—"}
                  {cashLabel ? <span className="text-primary"> · {cashLabel}</span> : null}
                </span>
              </li>
            )
          })}
        </ol>
      ) : null}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  )
}

function ItemList({
  items,
  onRemove,
  locked,
  emptyHint,
}: {
  items: ProposalListingPreview[]
  onRemove?: (id: string) => void
  locked?: boolean
  emptyHint?: string
}) {
  if (items.length === 0) {
    return (
      <div className="mx-4 rounded-lg border border-dashed border-border bg-background py-4 text-center text-xs text-muted-foreground">
        {emptyHint ?? "Nothing here yet."}
      </div>
    )
  }
  return (
    <ul className="space-y-2 px-4">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center gap-3 rounded-lg border border-border bg-card/30 p-2.5"
        >
          <img
            src={item.image}
            alt={item.title}
            className="h-12 w-12 flex-shrink-0 rounded-md object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{item.title}</p>
            <p
              className={cn(
                "text-xs",
                item.price ? "text-primary" : "text-muted-foreground italic",
              )}
            >
              {item.price ? formatMoney(item.price) : "No listed price"}
            </p>
          </div>
          {locked ? (
            <span
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground"
              aria-label="Locked"
              title="Locked target"
            >
              <Lock className="h-3.5 w-3.5" />
            </span>
          ) : onRemove ? (
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
              aria-label={`Remove ${item.title}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

function CashControl({
  direction,
  onDirectionChange,
  amount,
  onAmountChange,
  otherPartyUsername,
}: {
  direction: CashDirection
  onDirectionChange: (d: CashDirection) => void
  amount: string
  onAmountChange: (v: string) => void
  otherPartyUsername: string
}) {
  return (
    <div className="px-4">
      <div className="flex gap-1.5">
        {(["none", "add", "request"] as const).map((opt) => {
          const isActive = direction === opt
          const label =
            opt === "none" ? "None" : opt === "add" ? "You add cash" : "Ask cash"
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onDirectionChange(opt)}
              className={cn(
                "flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          )
        })}
      </div>
      {direction !== "none" ? (
        <div className="mt-2">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full rounded-md border border-border bg-background py-2 pl-7 pr-3 text-sm focus:border-primary/50 focus:outline-none"
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {direction === "add"
              ? `You add this to your side — @${otherPartyUsername} receives it.`
              : `You ask @${otherPartyUsername} to add this to their side.`}
          </p>
        </div>
      ) : null}
    </div>
  )
}

function ItemPicker({
  candidates,
  search,
  onSearchChange,
  onSelect,
  onClose,
}: {
  candidates: ProposalListingPreview[]
  search: string
  onSearchChange: (v: string) => void
  onSelect: (item: ProposalListingPreview) => void
  onClose: () => void
}) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">Add an item</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          aria-label="Close picker"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="border-b border-border px-4 py-2.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search your items for trade…"
            className="w-full rounded-md border border-border bg-background py-2 pl-8 pr-3 text-sm focus:border-primary/50 focus:outline-none"
            autoFocus
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {candidates.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            {search
              ? "No items match your search."
              : "You don't have any items marked for trade right now."}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {candidates.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-card/40"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-10 w-10 flex-shrink-0 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p
                      className={cn(
                        "text-xs",
                        item.price ? "text-primary" : "text-muted-foreground italic",
                      )}
                    >
                      {item.price ? formatMoney(item.price) : "No listed price"}
                    </p>
                  </div>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

/* ─── helpers ───────────────────────────────────────────────────────── */

function toPreview(item: OfferItem): ProposalListingPreview {
  return {
    id: item.id,
    title: item.title,
    image: item.image,
    price: item.price ?? null,
    subtitle: item.subtitle,
  }
}

function toOfferItem(item: ProposalListingPreview): OfferItem {
  return {
    id: item.id,
    title: item.title,
    image: item.image,
    price: item.price ?? undefined,
    subtitle: item.subtitle,
  }
}
