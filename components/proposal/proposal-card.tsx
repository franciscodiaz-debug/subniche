"use client"

/**
 * Inbox-side card that represents a pending proposal in the chat.
 *
 * Collapsed by default: minimal vertical footprint, with the kind
 * label, a thumb strip per side, the cash adjustment, and the action
 * buttons always visible. Tap the header to expand the full
 * "You give / You get" detail and the sender's message.
 *
 * Framing is always from the current user's perspective:
 *   - "You give" maps to whichever side of the offer is yours
 *   - "You get"  maps to the other side
 */

import { useState } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CURRENT_USER_ID, type Offer, type OfferItem } from "@/lib/inbox-types"

export interface ProposalCardProps {
  offer: Offer
  /** History of prior offers in this chain (oldest first), excluding the active one. */
  history?: Offer[]
  /** Username of the OTHER party in this conversation (not the current user). */
  otherPartyUsername: string
  onAccept: () => void
  onCounter: () => void
  onDecline: () => void
}

function formatMoney(value: number): string {
  return `$${Math.abs(value).toLocaleString("en-US")}`
}

export function ProposalCard({
  offer,
  history = [],
  otherPartyUsername,
  onAccept,
  onCounter,
  onDecline,
}: ProposalCardProps) {
  const [expanded, setExpanded] = useState(false)
  const isYouSender = offer.sender_id === CURRENT_USER_ID

  // From the current user's POV:
  // - if YOU sent the offer, the receiver's side (your_items in the offer model) is what you give up
  //   — wait, no: the offer model stores their_items = sender's items, your_items = receiver's items.
  //   So if YOU are the sender, their_items = what YOU offer = what you give.
  // - if THEY sent it, their_items = their offered side = what you get.
  const youGive = isYouSender ? offer.their_items : offer.your_items
  const youGet = isYouSender ? offer.your_items : offer.their_items

  // Cash from current user's POV.
  // cash_adjustment > 0 means the SENDER adds cash on their side (so the receiver gets it).
  // cash_adjustment < 0 means the SENDER asks the receiver to add cash.
  let cashOnYouGet = 0
  let cashOnYouGive = 0
  if (offer.cash_adjustment > 0) {
    if (isYouSender) cashOnYouGive = offer.cash_adjustment
    else cashOnYouGet = offer.cash_adjustment
  } else if (offer.cash_adjustment < 0) {
    if (isYouSender) cashOnYouGet = Math.abs(offer.cash_adjustment)
    else cashOnYouGive = Math.abs(offer.cash_adjustment)
  }

  const isPurchaseOffer = youGive.length === 0 || youGet.length === 0
  const kindLabel = isPurchaseOffer ? "Purchase offer" : "Trade proposal"

  return (
    <div className="overflow-hidden rounded-lg border border-primary/40 bg-primary/5">
      {/* Summary row — always visible, tappable to expand */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-card/40"
      >
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 flex-shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-180",
          )}
        />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
          {kindLabel}
        </span>
        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
          <ThumbStrip items={youGet} />
        </span>
        {(cashOnYouGet > 0 || cashOnYouGive > 0) && (
          <span className="flex-shrink-0 text-xs font-medium text-primary">
            {cashOnYouGet > 0 ? `+${formatMoney(cashOnYouGet)}` : `−${formatMoney(cashOnYouGive)}`}
          </span>
        )}
      </button>

      {/* Expanded detail */}
      {expanded ? (
        <div className="border-t border-border/40">
          <SideBlock label="You give" items={youGive} cash={cashOnYouGive} />
          <div className="border-t border-border/40">
            <SideBlock label="You get" items={youGet} cash={cashOnYouGet} />
          </div>
          {offer.message ? (
            <div className="border-t border-border/40 px-3 py-2">
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Message {isYouSender ? "from you" : `from @${otherPartyUsername}`}
              </p>
              <p className="text-xs italic text-foreground/80">&ldquo;{offer.message}&rdquo;</p>
            </div>
          ) : null}
          {history.length > 0 ? (
            <HistoryAccordion history={history} otherPartyUsername={otherPartyUsername} />
          ) : null}
        </div>
      ) : null}

      {/* Actions — always visible */}
      {!isYouSender ? (
        <div className="flex gap-2 border-t border-border/40 bg-card/30 px-2 py-2">
          <Button variant="quiet_outline" className="h-8 flex-1 text-xs" onClick={onDecline}>
            Decline
          </Button>
          <Button variant="quiet_outline" className="h-8 flex-1 text-xs" onClick={onCounter}>
            Counter
          </Button>
          <Button className="h-8 flex-1 text-xs" onClick={onAccept}>
            Accept
          </Button>
        </div>
      ) : (
        <div className="border-t border-border/40 bg-card/30 px-3 py-1.5 text-[11px] text-muted-foreground">
          Waiting for @{otherPartyUsername} to respond.
        </div>
      )}
    </div>
  )
}

function ThumbStrip({ items }: { items: OfferItem[] }) {
  if (items.length === 0) return <span>—</span>
  const visible = items.slice(0, 3)
  const label =
    items.length === 1
      ? items[0].title
      : `${items[0].title} +${items.length - 1} more`
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex -space-x-1.5">
        {visible.map((item) => (
          <img
            key={item.id}
            src={item.image || "/placeholder.svg"}
            alt={item.title}
            className="h-5 w-5 rounded-full border border-background object-cover"
          />
        ))}
      </span>
      <span className="truncate text-foreground/80">{label}</span>
    </span>
  )
}

function SideBlock({
  label,
  items,
  cash,
}: {
  label: string
  items: OfferItem[]
  cash: number
}) {
  const isEmpty = items.length === 0 && cash === 0
  return (
    <div className="px-3 py-2.5">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {isEmpty ? <p className="text-xs text-muted-foreground">—</p> : null}
      {items.length > 0 ? (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/listings/${item.id}`}
                className="group flex items-center gap-2.5 rounded-md transition-colors hover:bg-card/40"
              >
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  className="h-9 w-9 flex-shrink-0 rounded-md object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground group-hover:underline">
                    {item.title}
                  </p>
                  {item.price ? (
                    <p className="text-[11px] text-muted-foreground">{formatMoney(item.price)}</p>
                  ) : (
                    <p className="text-[11px] italic text-muted-foreground">No listed price</p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {cash > 0 ? (
        <p className={cn("mt-1.5 text-xs font-medium text-primary", items.length > 0 && "pl-11")}>
          {items.length > 0 ? "+ " : ""}
          {formatMoney(cash)} cash
        </p>
      ) : null}
    </div>
  )
}

function HistoryAccordion({
  history,
  otherPartyUsername,
}: {
  history: Offer[]
  otherPartyUsername: string
}) {
  return (
    <details className="group border-t border-border/40 bg-background/40">
      <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground">
        <span>View history ({history.length})</span>
        <span className="text-[10px] group-open:hidden">▾</span>
        <span className="hidden text-[10px] group-open:inline">▴</span>
      </summary>
      <ol className="space-y-1 px-3 pb-2">
        {history.map((past, idx) => {
          const fromYou = past.sender_id === CURRENT_USER_ID
          const cashLabel =
            past.cash_adjustment === 0
              ? ""
              : past.cash_adjustment > 0
                ? ` · +${formatMoney(past.cash_adjustment)} cash`
                : ` · −${formatMoney(past.cash_adjustment)} cash`
          return (
            <li key={past.id} className="flex gap-2 text-[11px] text-muted-foreground">
              <span className="mt-0.5 inline-flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-[9px] font-semibold">
                {idx + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-medium text-foreground">
                  {fromYou ? "You" : `@${otherPartyUsername}`}
                </span>
                {" — "}
                {past.their_items.map((i) => i.title).join(", ") || "—"}
                {" ⇄ "}
                {past.your_items.map((i) => i.title).join(", ") || "—"}
                {cashLabel}
              </span>
            </li>
          )
        })}
      </ol>
    </details>
  )
}
