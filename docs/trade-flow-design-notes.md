# Trade Flow Redesign — Design Notes

**Date:** 2026-05-20
**Branch:** `feat/trade-flow-redesign`
**Status:** Approved 2026-05-20 — implementation starts
**Tracker:** NEW-G in [`design-audit.md`](./design-audit.md)

This document captures the current state of the trade/offer/counter-offer flow and proposes a coherent redesign across all three moments: **initiating a trade**, **receiving an offer**, and **counter-offering**. We align here before any code is touched.

---

## 1. What we have today

### 1.1 The two coexisting modals

There are **two distinct modals** for negotiating trades, living in different parts of the codebase and reached from different places:

| Modal | File | Where it opens | Mode |
|---|---|---|---|
| `MakeOfferModal` | `components/listing-detail/make-offer-modal.tsx` (only in PR #8, not yet on main) | Click **"Propose a Trade"** on a listing detail page | 3-step wizard |
| `CounterOfferModal` | `components/inbox/counter-offer-modal.tsx` | Click **"Counter"** on an active offer inside a chat | Single-screen form |
| `CashCounterOfferModal` | `components/inbox/cash-counter-offer-modal.tsx` | Click **"Counter"** on a **cash-only** offer, **mobile only** | Single-screen form |

Currently on **main**, `Propose a Trade` is a dead button — no `onClick`. The wizard only ships when PR #8 lands.

### 1.2 What "an offer" actually is

In the inbox, an `Offer` object can take three shapes that are visually identical in the chat:

1. **Trade** — `their_items` + `your_items`, optional cash adjustment.
2. **Trade with cash balance** — items both sides + cash added or requested by either party.
3. **Cash-only purchase offer** — `their_items: []`, `your_items: [listing]`, cash adjustment is the full price.

All three render as the same little card in the chat panel. The user has to read carefully to figure out what kind of negotiation this is.

### 1.3 Current visual treatment of an active offer in chat

The chat panel shows the active offer as a compact summary that reads roughly:

> `1959 Gibson Les Paul · +$4,000 cash ⇄ 1965 Fender Stratocaster`

The receiver knows the items but **doesn't immediately know which item is theirs and which is the other party's**. The arrow direction (`⇄`) does not disambiguate. There is no clear "you receive" / "you give" framing.

### 1.4 The 3-step initiation wizard (PR #8)

`MakeOfferModal` already supports:

- **Step 1**: pick one or more of your items.
- **Step 2**: cash direction — `none` / `add` / `request`, with an amount input.
- **Step 3**: optional message + send.

On submit it routes to `/inbox` but the offer object **does not actually land in the seller's inbox** (covered by NEW-A).

### 1.5 The counter modal

`CounterOfferModal` is a single-screen flow with:

- **Your items selector** — your existing items minus the one being requested (locked).
- **Cash control** — toggle add/request, amount input. Same conceptual model as the wizard's step 2.
- **Message** — optional.

It does **not** show the cash adjustment as a diff, the listing price for context, or any history of the negotiation. It shows the **active offer** only as a one-line summary at the top.

### 1.6 The cash-only counter modal

`CashCounterOfferModal` is essentially the cash-control fragment isolated as its own modal. It only fires on mobile, only when the active offer is a cash-only purchase. **It duplicates ~300 lines of JSX between its fullScreen and centered modal variants.**

---

## 2. Decisions taken (from product review)

These are the answers from the product owner on 2026-05-20:

| # | Decision | Implication |
|---|---|---|
| 1 | **One single proposal flow** — initiating and counter-offering should not feel like different actions. They are the same operation: building a proposal. | Unify `MakeOfferModal` + `CounterOfferModal` + `CashCounterOfferModal` into a single component with mode-aware copy. |
| 2 | **Both sides must be able to add OR request cash** at any point — initiating an offer, building a counter, or even doing a counter of a counter. Example: "my Fender + $500 for your Marshall", or "your Marshall for my Fender + my pedal, request $300". | The existing add/request/none model in the wizard and counter modal is correct in spirit — needs to be the single source for both directions, both modes (initiate vs counter). |
| 3 | **It should be obvious which items are yours vs theirs** in the chat card and inside the modal. The receiver wants to quickly read "what am I getting" and click through to listing details. | The chat-side offer card needs an explicit two-column / two-row split: "You get" / "You give". Item titles in the offer card must be clickable and link to listing detail. |
| 4 | **The word "Offer" is overloaded** — used for trade offers, cash purchase offers, and trade+cash offers. We need a clearer vocabulary to disambiguate. | New copy: "Trade offer" / "Purchase offer". Or: every offer is a "Proposal" with a `kind` field. To be decided in §3.4 below. |
| 5 | **Show the history of the negotiation** — opening offer, counter 1, counter 2 etc. Currently nothing of this exists. | Add a "Negotiation history" section to the counter modal and to the chat card. |
| 6 | **The handoff between accepted offer and "the buyer/recipient receives something"** is broken. Covered by NEW-A / NEW-B / NEW-C in the audit. | Out of scope for NEW-G — handled separately. |

---

## 3. Proposed design

The principle: **a single conceptual operation** (the "proposal") with one component, two modes (`initiate` vs `counter`), and one set of building blocks for both.

### 3.1 Single component: `ProposalSheet`

Replaces all three current modals.

**Props:**

```ts
interface ProposalSheetProps {
  open: boolean
  onClose: () => void
  mode: "initiate" | "counter"
  // For initiate mode: the listing being targeted
  targetListing?: ListingPreview
  // For counter mode: the offer being countered (and its history)
  originalOffer?: Offer
  history?: Offer[] // counter chain
  // Context (the other user)
  otherParty: ParticipantPreview
  onSent: (proposal: Offer) => void
}
```

**Layout (full-height sheet on desktop and mobile):**

```
┌────────────────────────────────────────────┐
│ [←]  New trade proposal / Counter offer    │  ← header (copy mode-aware)
├────────────────────────────────────────────┤
│ Negotiating with @vintagegearnyc           │  ← context strip (avatar + handle)
│ For: 1965 Fender Stratocaster · $18,500    │  ← target listing (always shown)
├────────────────────────────────────────────┤
│ NEGOTIATION HISTORY (counter mode only)    │  ← collapsed by default
│ ▸ @them opened with: ... +$4,000           │
│ ▸ @you countered: ... +$3,500              │
│ ▸ @them countered: ... +$3,800             │
├────────────────────────────────────────────┤
│ YOU GIVE                                   │
│ ┌────────────────────────────────────────┐ │
│ │ [+ Add your items]                     │ │  ← add button opens picker
│ │ • 1959 Gibson Les Paul ($15,000)   [X] │ │
│ │ • Boss CE-2 Chorus     ($275)      [X] │ │
│ └────────────────────────────────────────┘ │
├────────────────────────────────────────────┤
│ YOU RECEIVE                                │
│ ┌────────────────────────────────────────┐ │
│ │ • 1965 Fender Stratocaster ($18,500)   │ │  ← target, locked in initiate mode
│ │ [+ Add their items] (optional)         │ │  ← can ask for more (e.g. amp + pedal)
│ └────────────────────────────────────────┘ │
├────────────────────────────────────────────┤
│ CASH ADJUSTMENT                            │
│ (•) None   ( ) You add cash   ( ) You ask  │
│     $ [______]                             │
├────────────────────────────────────────────┤
│ TOTAL VALUE BALANCE                        │
│ You give: $15,275          You get: $18,500│
│ Balance:  +$3,225 in your favor            │  ← computed read-only
│ Cash adj: −$500 (you add)                  │
│ Net:      +$2,725 in your favor            │
├────────────────────────────────────────────┤
│ Message (optional) [────────────────────]  │
├────────────────────────────────────────────┤
│ [Cancel]                  [Send proposal]  │
└────────────────────────────────────────────┘
```

**Why this shape:**

- **You give / You receive** are explicit, labeled boxes. No ambiguity about who owns what.
- The **target listing is always pinned** to "You receive" — it's the anchor of the proposal. In counter mode the user can also add more of "their" items if they want to ask for the amp AND the pedal.
- **Cash adjustment is just one block**, three radio options (none / you add / you ask). The current dual modal (cash vs trade) collapses into a single block.
- **Total value balance** is computed live and shown read-only. The user sees immediately whether the proposal makes sense before sending. This replaces the `%` presets idea from #42 — the live balance gives the same intuition with less UI.
- **Negotiation history** is collapsed by default in counter mode and absent in initiate mode.

### 3.2 The chat-side offer card

Today a single line, ambiguous. Proposed:

```
┌──────────────────────────────────────────────┐
│ TRADE PROPOSAL from @vintagegearnyc          │  ← header with sender
├──────────────────────────────────────────────┤
│ YOU GIVE                                     │
│ ▸ 1965 Fender Stratocaster ($18,500) →       │  ← clickable, opens listing
├──────────────────────────────────────────────┤
│ YOU GET                                      │
│ ▸ 1959 Gibson Les Paul ($15,000) →           │  ← clickable
│ + $4,000 cash from them                      │  ← cash framed from receiver POV
├──────────────────────────────────────────────┤
│ Net balance: +$500 in your favor             │  ← optional
├──────────────────────────────────────────────┤
│ [Decline]   [Counter]   [Accept]             │
└──────────────────────────────────────────────┘
```

Same shape for "Purchase offer" (cash-only) — just no items on one side:

```
┌──────────────────────────────────────────────┐
│ PURCHASE OFFER from @tonechaserla            │
├──────────────────────────────────────────────┤
│ YOU GIVE                                     │
│ ▸ 1962 Fender Jazzmaster ($12,500) →         │
├──────────────────────────────────────────────┤
│ YOU GET                                      │
│ $11,000 cash                                 │
├──────────────────────────────────────────────┤
│ [Decline]   [Counter]   [Accept]             │
└──────────────────────────────────────────────┘
```

### 3.3 The "you" framing

Both the proposal sheet and the chat card frame everything **from the current user's perspective**. The sender's view and the receiver's view of the same offer will visually mirror — "You give" on one side becomes "You get" on the other. This is the most intuitive way to read a two-sided proposal.

### 3.4 Vocabulary

| Object | Label |
|---|---|
| The thing being negotiated (either side) | **Proposal** |
| The first proposal of a chain | **Opening proposal** |
| A response to a proposal | **Counter** |
| A pure-cash proposal | **Purchase offer** |
| A trade with cash adjustment | **Trade proposal** (the cash is just a balancing detail, not the lead) |

This removes the "is it an offer or a counter offer or a cash offer" ambiguity. Everything is a Proposal; the chat card header tells the user which flavor.

### 3.5 Negotiation history

When a user opens a counter, they need to see the chain:

- Opening: items + cash, with sender label, timestamp
- Counter 1: items + cash, with sender label, timestamp
- Counter 2: ...
- (current active offer is highlighted)

Inside the modal, this is collapsible — collapsed by default to keep the form clean. Inside the chat, every counter renders as its own card in the message stream (this is already partially the case), but the **active** card is pinned/sticky at the top with the current state.

### 3.6 What we drop

- The `%` presets idea from #42. Live balance computation gives the same intuition with less screen clutter.
- The `CashCounterOfferModal`. Subsumed by the unified `ProposalSheet`.
- The 3-step wizard. Single-screen form with clear sections beats forced linearity. Steps were a fix for "no clear structure"; explicit labeled sections solve the same problem better.

---

## 4. What's IN scope for NEW-G

- Build `ProposalSheet` component (unifies all three modals).
- Update `Propose a Trade` button on listing detail to open it in `initiate` mode.
- Update `Counter` button in chat to open it in `counter` mode with history.
- Redesign the chat-side offer card (`OfferMessage` or equivalent) with "You give / You get" split, sender label, clickable item links, and the proposal-type header.
- New vocabulary (`Proposal`, `Counter`, `Purchase offer`, `Trade proposal`) wherever offer UI is rendered.
- Delete the three current modals once `ProposalSheet` covers them.

## 5. What's OUT of scope for NEW-G

- **NEW-A / NEW-B / NEW-C** — the actual handoff between accepted proposal and inventory transfer. NEW-G ships the **building of proposals**; what happens on accept stays broken until that decision lands.
- **NEW-E** — sold transfer model. Independent.
- **Trade matches page polish** (#36). Independent.
- **Inbox layout/notification redesign**. NEW-G only redesigns the offer card *content*, not its position in chat.

---

## 6. Resolved questions

Decisions taken on 2026-05-20:

1. **PR #8 stays open and unchanged.** NEW-G does **not** touch its branch. When PR #8 eventually merges, NEW-G will **delete `make-offer-modal.tsx`** and rewire the `Propose a Trade` button to open the new `ProposalSheet`. Until then, the button stays dead on main (which is its state today). The other wins in PR #8 (`WatchlistContext`, `/favorites` tabbed, `resolveListingHref`, owner action bar, additional listing mocks) are independent and worth keeping — Kyle decides when #8 merges.
2. **Counter mode — target is locked.** The original requested item from "their side" cannot be removed. The counter-proposer can **add** more of their items (e.g. ask for the amp AND a pedal), but cannot **substitute**. Substitution would be a new proposal, not a counter.
3. **History in chat — single active card + "View history" link.** Each counter does **not** generate its own message card. The active offer card shows the current state, with a "View history" link that expands the chain inline. Keeps the chat clean and avoids nested-container UI.
4. **Balance computation rule:**
   - **All items priced →** show the numeric balance (You give / You get / cash adjustment / net).
   - **Any item unpriced →** drop the numeric balance entirely. Show this text in its place: *"Some items don't have a listed price — agreed value is up to both parties."* No estimated-value input. Pricing is the owner's call; the chat handles negotiation when the lister chose to leave price open.
   - **Note:** `Keeping`-status items cannot be proposed for trade at all — they only allow direct messages. If the owner wants to trade a Keeping item, they must first flip it to `for_trade`.
5. **No item cap per side.** Reasonable users self-regulate; a hard cap would block legitimate multi-piece trades.
