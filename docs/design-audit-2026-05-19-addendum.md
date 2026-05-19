# SubNiche — Design Audit Addendum

**Date:** 2026-05-19
**References:** original audit at `docs/design-audit-2026-05-14.md` (PR #5).

This document tracks **what closed** and **what's new** since the original audit. Original item numbers (e.g. `#48`, `#59`) refer to the row numbers in the 2026-05-14 audit table; new items are prefixed `NEW-`.

---

## Executive summary

Band 1 (cannot close MVP without these) is essentially done. The remaining MVP work concentrates around the **trade/sale handoff between accounts** — a flow we deliberately left out of every PR so far because it needs a product decision from Kyle before any design lands. Band 4 polish is mostly done too; what's left is the loading/empty states sweep (#20) which is wide rather than deep.

Two new threads surfaced that weren't on the original audit:

1. **Wishlist will be removed from the MVP entirely.** Kept as a future feature; everything currently in code (Wishlist single-collection model, `WishlistItemCard`, Looking For tab, status flags on items, URL importer) needs to be hidden or pulled before launch.
2. **The trade/sale handoff between users is undesigned.** Marking an item Sold or Traded today flips a flag on the seller's inventory only — there's no concept of "the buyer receives that item" or "both parties confirm the trade". The audit originally treated this as backend wiring; we now treat it as a design question.

---

## What closed since 2026-05-14

| # | Item | Where it closed | Notes |
|---|------|-----------------|-------|
| #8 | Logout UI entry point | already present in the user-menu (header avatar → Sign Out) — discovered during PR #8 work |
| #15 | Search debouncing | PR #12 — `useDebouncedValue` hook applied to header search bar and mobile search panel |
| #17 | Communities page | PR #11 — Communities moved to post-MVP. Sidebar item removed, feed section removed, profile quick-stat removed, `/communities` redirects to `/`, search placeholder updated, "Publish to communities" block removed from Create Listing. Landing-page marketing tab intentionally kept |
| #19 | CollectionCard `href` fix | PR #12 — feed-section CollectionCards now link to `/collection/{id}`; mock ids aligned with the canonical ids in `lib/mock/my-stuff.ts` so the page will resolve once PR #6 lands |
| #25 | Drag-and-drop photo reordering | PR #15 — `@dnd-kit` integration with PointerSensor + KeyboardSensor; whole thumbnail is the handle with visual lift feedback |
| #30 | Owner actions on listing detail | PR #8 — Delete with AlertDialog, Mark as Sold toggle, stats visible |
| #31 | Edit Listing form-loading | PR #13 — `?edit={id}` is read by the page, the form hydrates from `MockListing` (rich) or `MyItem` (sparse with defaults), title and CTAs flip to "Edit Listing" / "Save changes", submit lands back on the listing with a "Listing updated" banner |
| #32 | Delete listing | PR #8 — AlertDialog confirmation, simulated delete, redirect to `/my-stuff?tab=items` |
| #38 | Make-an-offer CTA on listing | PR #8 — "Propose a Trade" now opens a real flow instead of linking to an inbox stub |
| #39 | Trade offer initiation flow | PR #8 — three-step modal (pick items → optional cash differential → review + message); submission routes to `/inbox` where outbound offers land |
| #42 | Counter-offer modal polish | not done — still pending (Band 4) |
| #44 | Activity tab on profile | PR #14 — 12 mock entries across 8 distinct activity types, filter chips (All · Listings · Trades · Collections · Wishlist), rows clickable to their destination, privacy toggle in Edit Profile that hides the tab from visitors |
| #48–54 | Collections CRUD against local state | PR #6 — all five `[todo]` stubs wired; Collections context (Context + localStorage); visitor view shipped with private/unlisted/public visibility rules |
| #49 | Collection visitor view | PR #6 |
| #59 | Item action menu wiring in My Stuff | PR #16 — every action writes to local state (Mark sold, Mark traded, List/Unlist, Toggle trade, Share clipboard, Edit navigates); Active/Sold/Traded status filter chips added; Sold/Traded items rendered with a status pill and a "…w ago" caption |
| — | Destructive color token | PR #10 (already merged) — saturated red was reading as alarming on plain navigation (Sign Out, Cancel, Decline); aligned with `muted-foreground` so destructive surfaces fade into the neutral palette. The AlertDialog stays the real "are you sure?" affordance |

### Adjacent work shipped beyond the audit

- **Wishlist as a single per-user collection.** PR #6 — every user has exactly one Wishlist that can't be renamed or deleted; "Mark as wishlist" toggle removed from Create Collection; All/Collections/Wishlists filter chip removed. Looking For tab on the profile (PR #9) renders these items with a dedicated `WishlistItemCard` that's not a link — the CTA is contextual (Message for visitors, Manage for owner).
- **Listing detail mocks for every state variant.** PR #8 added Sold and For-Trade-only mocks; helper `resolveListingHref()` routes any listing card across the app (home feed, market, profile, search, chat, related rows) to a real detail page so no card lands on the "not wired up" fallback anymore.
- **Watchlist as a distinct concept from Wishlist.** PR #8 — `useWatchlist` hook with localStorage; eye icon (not heart) on every ItemCard; `/favorites` is now a tabbed page (Watchlist · Following) with the sidebar entry renamed to "Favorites".
- **Unified ItemCard.** PR #6 — My Stuff items, owned listings, market listings, profile listings, trade matches all render the same card with optional `actions` / `belowTitle` / `statusBadge` slots.
- **My Stuff card density toggle.** PR #6 — Compact / Comfortable / Spacious, shared with Market via the global `useGridDensity` hook.

---

## What's still open from the original audit

### Band 1

All Band 1 items have closed.

### Band 2

| # | Item | Status |
|---|------|--------|
| #36 | Trade interests promoted to a dedicated route or tab | open |

### Band 3

| # | Item | Status |
|---|------|--------|
| #20 | Loading & empty states across feeds | open — planned next |
| #26 | AI Assist decision | resolved (decision: keep as designed feature; no code change needed) |
| #27 | Wishlist URL import | superseded by NEW-D (Wishlist removal) |
| #2, #3, #10 | Sign up via niche link, Verify email, Find niche | open — auth side branch never merged |

### Band 4

| # | Item | Status |
|---|------|--------|
| #42 | Counter-offer modal — % presets, diff | open |
| #20-admin | Loading/empty state polish across admin tables | open |

---

## New items (not on the original audit)

### NEW-A — Trade flow handoff with Inbox

**What:** Today, "Make an offer" (PR #8) opens a modal and routes the user to `/inbox` — but the offer object doesn't reach the inbox, it doesn't appear as an outbound offer, and accepting/declining doesn't propagate to the seller's `/my-stuff`. The inbox-side wiring is missing.

**Why it matters:** This is the core marketplace transaction. Without it, "Propose a Trade" is a dead end after the modal closes.

**Owner:** needs the Make-an-Offer modal already shipped (PR #8) and the Inbox fixtures already on main.

### NEW-B — "Recibidos por trade" view

**What:** When a trade is accepted, the other person's item enters this user's inventory. There's no UI yet to indicate "this item just landed in your account because you traded for it" — the item should either appear in `/my-stuff` automatically or behind a confirmation step.

**Why it matters:** Without this, a successful trade leaves the receiver with no item in their inventory and no record of it.

**Depends on:** NEW-A.

### NEW-C — Pre-trade confirmation

**What:** A trade is two items changing hands at once. The current flow doesn't define a two-sided confirmation step ("both parties accepted" → both items move). It's unclear if a single-sided accept is enough or if both sides have to confirm before the swap.

**Why it matters:** Trade flows in marketplaces typically need bilateral confirmation to prevent disputes.

**Depends on:** NEW-A.

### NEW-D — Wishlist removal from MVP

**What:** Pull every Wishlist-related affordance out of the MVP. That includes:

- The single per-user Wishlist collection (PR #6)
- `WishlistItemCard` and the Looking For tab on the profile (PR #9)
- `is_wishlist` flag on collections, `wishlist` data on items
- The Wishlist option in the Create Listing status selector
- The Wishlist URL importer (originally #27)
- Mock wishlist items in `lib/mock/my-stuff.ts`
- Tab/empty-state references in `/my-stuff/collections-tab` and `/profile/looking-for`

**Why it matters:** Product decision — Wishlist is post-MVP. Anything user-facing about it should be hidden before launch.

**Scope:** wide. Needs its own dedicated branch and probably a few smaller PRs (form/UI removal, profile tab removal, mock cleanup, store cleanup).

### NEW-E — "Sold transfer" model decision

**What:** When the seller marks an item as Sold, what happens on the buyer's side? Three options:

1. **Invisible to the buyer.** Buyer has to re-create the item from scratch in their inventory if they want it tracked. Simplest, no cross-account wiring.
2. **Transfer pending.** Seller marks Sold → buyer gets a notification "X says they sold you Y, confirm to add to your collection". Cross-account, requires identifying the buyer.
3. **One-way handoff.** Seller marks Sold + clicks "Send to buyer" → a pre-filled Add-Item link is shared with the buyer. Same shape as #1 but with a copy-paste shortcut.

**Why it matters:** Affects what "Mark as sold" really means and whether the marketplace produces a record of ownership.

**Decision pending:** Kyle.

### NEW-F — Sidebar audit after Communities removal

**What:** With Communities hidden (PR #11) and Favorites repurposed (PR #8), the sidebar should be sanity-checked end-to-end. There may be stale entries, copy mismatches, or routes that no longer exist.

**Why it matters:** First impression of the app's information architecture.

**Scope:** small — likely 30 min of audit + a single PR.

---

## Open questions still pending with Kyle

From the original audit:

- **Communities scope.** Resolved by NEW-D-adjacent decision: Communities is post-MVP.
- **AI Assist** — resolved: keep as designed feature.
- **Edit listing scope** — resolved by PR #13 shipping the full re-edit flow.
- **Collection visibility** — resolved during PR #6 work (private = owner only, unlisted = direct-link only, public = discoverable).
- **Trade offer flow direction** — partially resolved (PR #8 ships initiation); the receiving end (NEW-A / NEW-B / NEW-C) still needs direction.

New ones:

- **Sold transfer model** (NEW-E) — needs Kyle's call between #1 / #2 / #3.
- **Bilateral trade confirmation** (NEW-C) — needs Kyle's call on whether both parties must accept before items swap.
- **Wishlist post-MVP timing** — when does Wishlist come back? Affects how aggressively we strip it in NEW-D.

---

## Recommended next steps

1. **#20 Loading & empty states across feeds.** Wide but mechanical; planned as the next PR.
2. **#42 Counter-offer modal polish.** Self-contained, 30–60 min.
3. **NEW-F Sidebar audit.** Small cleanup pass.
4. **#36 Trade interests promoted to a route.** Mid-size; touches navigation.
5. **NEW-D Wishlist removal.** Wide but mechanical; can run in parallel with the trade-flow design once Kyle resolves NEW-E and NEW-C.
6. **NEW-A / NEW-B / NEW-C Trade-inbox handoff.** Blocked on Kyle's product decisions, then a sizeable design sprint.
