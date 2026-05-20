# SubNiche — Design Audit (Living)

**Last updated:** 2026-05-20 (#20 expanded via #22 + #24 — home, market, trade matches, my-stuff)
**Owner:** Francisco
**Branch audited:** `main`
**Supersedes:** `docs/design-audit-2026-05-14.md` (PR #5) and `docs/design-audit-2026-05-19-addendum.md` (PR #17)

This is the **single source of truth** for the SubNiche MVP design audit. It is updated continuously — every PR that closes, opens, or changes the status of a flow updates this document in the same PR.

---

## How to use this document

- **Status table** (per area) is the live picture. Each row carries the latest known state, the PR that last touched it, and the date.
- **Decision log** records product decisions that close open questions — historical, append-only.
- **Pending decisions** are open questions waiting on a stakeholder.
- **Next up** is the recommended priority list, refreshed every time something closes.

When you ship a PR that affects an item:

1. Update the row's **Status**, **Last reviewed**, **PR**, and **Notes**.
2. If the change resolves a question, add an entry to the **Decision log**.
3. If the PR uncovers a new flow that wasn't on the audit, add a row prefixed `NEW-`.

---

## Scope

This repo is the **design prototype**. Backend lives in a separate project — the back team copies approved UI flows into their own codebase. That means:

- **Persistence to a database is out of scope.** It does not count against a flow.
- **Email sending, password hashing, route-protection middleware** — also backend, also out of scope.
- **What does count:** the UI exists, all states are designed (loading / empty / error), and the flow is **runnable end-to-end with local state, `localStorage`, or `sessionStorage`** so a reviewer (and the back team) can see the intended behaviour without imagining it.

---

## Status legend

- **Missing** — does not exist in the code (or only as a "Coming soon" placeholder)
- **Unfinished** — UI exists but the local flow doesn't simulate the intended behaviour end-to-end (handlers `console.log`, no-op, or only partially wired)
- **OK** — flow runs end-to-end with local state, ready for backend handoff
- **Perfect** — no further design work needed
- **Out of scope (post-MVP)** — explicit product decision to defer

---

## Executive summary

Band 1 (MVP blockers) is **closed**. The bulk of remaining work splits into three groups:

1. **Trade/sale handoff between accounts** (NEW-A, NEW-B, NEW-C, NEW-E) — blocked on a Kyle product decision. This is the only undesigned core flow left.
2. **Mechanical polish** — loading & empty states (#20), counter-offer modal (#42), sidebar cleanup (NEW-F). Can be done in parallel with the trade-flow decision.
3. **Auth side-branch flows** (#2, #3, #10) — designed on a branch that never landed; need to be merged or rebuilt.

Two threads from the original audit have been resolved by product decision:

- **Communities** is post-MVP and hidden from the app.
- **Wishlist** has been removed end-to-end from the MVP.

---

## Decision log

| Date | Decision | Source | Impact |
|------|----------|--------|--------|
| 2026-05-14 | Repo is design-only; backend lives elsewhere. Persistence is out of scope; UI flows must run end-to-end on local state. | Mike + Francisco | All audit criteria |
| 2026-05-14 | "Keeping" replaces "Showcase" as the status label for owned-but-not-listed items. | Kyle | Status taxonomy |
| 2026-05-14 | Items must always belong to a collection. No "Uncategorized" state. | Kyle | Collections + Create Listing |
| 2026-05-14 | Collection visibility semantics: **private** = owner-only with notice, **unlisted** = direct-link with full content, **public** = discoverable. | PR #6 spec | Collections visitor view |
| 2026-05-19 | **Communities is post-MVP.** Sidebar item, feed section, profile quick-stat, "Publish to communities" block all hidden. `/communities` redirects to `/`. Landing-page marketing tab intentionally kept. | Kyle | #17 closed |
| 2026-05-19 | **Wishlist is removed from MVP.** Concept overlapped with Watchlist (following) and Trade Interests, creating confusion. Removed end-to-end across UI, store, mocks, profile tab, create-listing status. Admin paths retain references (pre-MVP tooling). | Kyle | NEW-D closed; #27, #58 closed |
| 2026-05-19 | **AI Assist stays as a designed feature.** UI ships unchanged; back team implements. | Kyle | #26 closed |
| 2026-05-19 | **Edit Listing is full re-edit** (all fields). Not limited to price + photos. | Kyle (PR #13) | #31 closed |
| 2026-05-19 | **Destructive color token** softened. Saturated red on plain navigation (Sign Out, Cancel, Decline) was reading alarming; aligned with `muted-foreground`. AlertDialog stays the real "are you sure?" affordance. | PR #10 (merged) | Style |
| 2026-05-19 | **Watchlist and Wishlist are different concepts.** Watchlist = "following items"; was using a heart icon → switched to eye icon. `/favorites` is now a tabbed page (Watchlist / Following). | Kyle (PR #8) | #58 reshaped, then removed entirely with Wishlist |

---

## Pending decisions (Kyle)

| ID | Question | Blocks |
|----|----------|--------|
| **NEW-E** | When a seller marks an item **Sold**, what happens on the buyer's side? Options: (1) invisible to buyer; (2) transfer pending with confirmation; (3) one-way handoff with pre-filled link. | "Mark as Sold" semantics, NEW-B |
| **NEW-C** | Does a trade require **bilateral confirmation** (both parties accept before items swap), or is a single-sided accept enough? | NEW-A, NEW-B |
| — | When does **Wishlist** come back post-MVP? Affects whether to keep dormant code or delete fully. | Future feature work |

---

## Flow-by-flow audit

### Auth & Onboarding

| # | Flow | Status | Last reviewed | PR | Notes |
|---|------|--------|---------------|----|-------|
| 1 | Sign up with email | OK | 2026-05-14 | — | Full flow visible |
| 2 | Sign up via niche link (`?niche=`) | Missing | 2026-05-14 | — | Designed on a side branch, never merged |
| 3 | Verify email | Missing | 2026-05-14 | — | No `/verify` route on main |
| 4 | Suggest a niche | OK | 2026-05-14 | — | Modal + success state |
| 5 | Onboarding | OK | 2026-05-14 | — | Display name, bio, avatar, zip |
| 6 | Login | OK | 2026-05-14 | — | Form + error states |
| 7 | Forgot password | OK | 2026-05-14 | — | Email input + confirmation |
| 8 | Logout UI entry point | OK | 2026-05-19 | #8 | Already exists in user-menu (header avatar → Sign Out); confirmed during PR #8 |
| 9 | Welcome / landing | OK | 2026-05-14 | — | Hero, features, FAQ |
| 10 | Find niche (`/find-niche`) | Missing | 2026-05-14 | — | Doesn't exist on main; downstream of verify |

### Home & Discovery

| # | Flow | Status | Last reviewed | PR | Notes |
|---|------|--------|---------------|----|-------|
| 11 | Homepage logged-in | OK | 2026-05-14 | — | Feed sections present |
| 12 | Homepage logged-out | OK | 2026-05-14 | — | Landing renders cleanly |
| 13 | Niche page (`/n/[slug]`) | OK | 2026-05-14 | — | Three branches (logged-out / onboarding / logged-in) |
| 14 | Market / search results | OK | 2026-05-14 | — | Tabs (Items/Collections/Users), filters, sort |
| 15 | Search bar (header) | OK | 2026-05-19 | #12 | `useDebouncedValue` applied to header + mobile search panel |
| 16 | Trade page | OK | 2026-05-14 | — | Grid + interests views, deduped |
| 17 | Communities page | Out of scope (post-MVP) | 2026-05-19 | #11 | Sidebar removed, feed section removed, profile quick-stat removed, `/communities` redirects to `/` |
| 18 | ItemCard component | Perfect | 2026-05-14 | — | Consistent `/listings/{id}` links |
| 19 | CollectionCard `href` | OK | 2026-05-19 | #12 | Feed-section CollectionCards link to `/collection/{id}`; mock ids aligned |
| 20 | Empty / loading states across feeds | Unfinished (partial) | 2026-05-20 | #22, #24 | #22 ships reusable Skeleton primitives + consolidates on shadcn `Empty`. #24 stacks on top: trade matches + my-stuff items/collections tabs. Preview with `?sim-loading=1` or `?sim-empty=1`. Pending: profile tabs (intentionally deferred due to overlap with open PRs #9/#14/#18). |

### Listings (Create, View, Edit)

| # | Flow | Status | Last reviewed | PR | Notes |
|---|------|--------|---------------|----|-------|
| 21 | Create listing — desktop | OK | 2026-05-14 | — | Draft saved to `sessionStorage` |
| 22 | Create listing — mobile wizard | OK | 2026-05-14 | — | 5-step wizard with validation |
| 23 | Status selection (For Sale / Trade / Collection) | Perfect | 2026-05-19 | #18 | Mutual exclusion logic correct; Wishlist option removed end-to-end |
| 24 | Specs editor (chips-style) | OK | 2026-05-14 | #4 | Closed by PR #4 (open) |
| 25 | Photo upload + drag-and-drop reorder | OK | 2026-05-19 | #15 | `@dnd-kit` integration with PointerSensor + KeyboardSensor; full thumbnail is the handle |
| 26 | AI Assist | OK | 2026-05-19 | — | Decision: keep as designed feature; no code change needed |
| 27 | Wishlist creation / URL import | Out of scope (post-MVP) | 2026-05-19 | #18 | Wishlist removed from MVP |
| 28 | Publish Confirm screen | OK | 2026-05-14 | — | Preview reuses `ListingDetailView` |
| 29 | Listing detail page (`/listings/[id]`) | OK | 2026-05-19 | #8 | 4 mock listings covering each state variant + Sold + For-Trade-only |
| 30 | Owner view on detail | OK | 2026-05-19 | #8 | Edit/Delete/Mark-as-Sold all wired; stats visible |
| 31 | Edit Listing form-loading | OK | 2026-05-19 | #13 | `?edit={id}` hydrates the form from `MockListing` or `MyItem`; submit lands on listing with "updated" banner |
| 32 | Delete listing | OK | 2026-05-19 | #8 | AlertDialog confirmation; simulated delete; redirect to `/my-stuff?tab=items` |
| 33 | Just-published page | OK | 2026-05-14 | — | Reads `sessionStorage` draft |

### Trade

| # | Flow | Status | Last reviewed | PR | Notes |
|---|------|--------|---------------|----|-------|
| 34 | Trade interest — create | OK | 2026-05-14 | — | Simple + advanced modes; React Context |
| 35 | Trade interest — edit | OK | 2026-05-14 | — | Inline editor, delete with confirmation |
| 36 | Trade interests promoted to a route | Unfinished | 2026-05-19 | — | Only accessible via gear button on `/trade`; needs dedicated tab or route |
| 37 | Trade matches on homepage | OK | 2026-05-14 | — | 6 mock matches |
| 38 | Trade card "Make an offer" CTA | OK | 2026-05-19 | #8 | CTA now opens the offer flow |
| 39 | Trade offer initiation flow | OK | 2026-05-19 | #8 | Three-step modal (pick items → cash differential → review + message); submission routes to `/inbox` |

### Messaging

| # | Flow | Status | Last reviewed | PR | Notes |
|---|------|--------|---------------|----|-------|
| 40 | Inbox | OK | 2026-05-14 | — | Three-panel layout, responsive |
| 41 | Chat panel | OK | 2026-05-14 | — | All message types render |
| 42 | Cash counter-offer modal | OK | 2026-05-20 | #21 | Superseded by the unified `ProposalSheet` shipped in NEW-G. The dedicated cash modal was removed; counter offers now use the same sheet as trade proposals. |
| 43 | Trade offer in chat | OK | 2026-05-14 | — | Inline cards + sticky header |

### Profile

| # | Flow | Status | Last reviewed | PR | Notes |
|---|------|--------|---------------|----|-------|
| 44 | Profile view (own + `/u/[username]`) + Activity tab | OK | 2026-05-19 | #14 | 12 mock entries across 8 activity types; filter chips; clickable rows; privacy toggle |
| 45 | Edit profile | OK | 2026-05-14 | — | Form complete |
| 46 | Niche switcher | Perfect | 2026-05-14 | — | Two variants, accessible |
| 47 | Public profile view | OK | 2026-05-14 | — | Follow button is mock — counts as designed |
| — | Looking For tab (post-Wishlist removal) | OK | 2026-05-20 | #18 | Tab kept on profile; shows Trade Interests only after Wishlist removal |

### Collections

| # | Flow | Status | Last reviewed | PR | Notes |
|---|------|--------|---------------|----|-------|
| 48 | Collection detail — owner view | OK | 2026-05-14 | #6 | `handleAddSelected` wired to store |
| 49 | Collection detail — visitor view | OK | 2026-05-14 | #6 | Visibility rules: private notice, unlisted/public full content |
| 50 | Create new collection | OK | 2026-05-14 | #6 | Wired to `CollectionsContext` |
| 51 | Edit collection | OK | 2026-05-14 | #6 | Reuses create form; saves to store |
| 52 | Add items to collection | OK | 2026-05-14 | #6 | Picker sheet writes to store |
| 53 | Collection picker (in Create Listing) | OK | 2026-05-14 | — | Dropdown + "Create New Collection" wired |
| 54 | Delete collection | OK | 2026-05-14 | #6 | AlertDialog confirmation |

### My Stuff

| # | Flow | Status | Last reviewed | PR | Notes |
|---|------|--------|---------------|----|-------|
| 55 | My Stuff page | OK | 2026-05-14 | — | Tabs functional |
| 56 | My collections tab | OK | 2026-05-14 | — | Grid/list, sort, filters, stats |
| 57 | My listings tab | OK | 2026-05-14 | — | UI ready; actions wired via #16 |
| 58 | My wishlist tab | Out of scope (post-MVP) | 2026-05-19 | #18 | Wishlist removed end-to-end |
| 59 | Item action menu | OK | 2026-05-19 | #16 | Every action writes to local state (Mark sold, Mark traded, List/Unlist, Toggle trade, Share clipboard, Edit); Active/Sold/Traded status filter chips added |

### Admin

| # | Flow | Status | Last reviewed | PR | Notes |
|---|------|--------|---------------|----|-------|
| 60 | Admin dashboard | OK | 2026-05-14 | — | Stats + activity log |
| 61 | Design system reference page | OK | 2026-05-14 | — | Reference, not a builder |
| 62 | Niche config | OK | 2026-05-14 | — | Cards backed by `useAdminSettings()` |
| 63 | Taxonomy (categories / attributes) | OK | 2026-05-14 | — | Full editor UI |
| 64 | Moderation queue | OK | 2026-05-14 | — | Reports table + action dialogs |
| 65 | Review queue | OK | 2026-05-14 | — | Pending review items, confidence bar |
| 20-admin | Loading/empty state polish across admin tables | Unfinished | 2026-05-14 | — | Polish only |

### Navigation & Shell

| # | Flow | Status | Last reviewed | PR | Notes |
|---|------|--------|---------------|----|-------|
| 66 | Top bar / header | OK | 2026-05-14 | — | Sticky, blurred backdrop, auth-aware |
| 67 | Bottom nav (mobile) | OK | 2026-05-14 | — | 5 slots with center FAB |
| 68 | Sidebar (desktop) | OK | 2026-05-14 | — | Collapse mode on inbox/create |
| 69 | Mobile search panel | OK | 2026-05-14 | — | Portal overlay with quick searches + results |
| 70 | Niche switcher | OK | 2026-05-14 | — | Two variants wired to context |
| 71 | App shell client layout | OK | 2026-05-14 | — | Scroll detection, Suspense fallback |
| **NEW-F** | Sidebar audit after Communities removal | OK | 2026-05-20 | #8, #11, #20 | Most cleanup already covered by #8 (Heart→Eye, "Following"→"Favorites") and #11 (remove Communities item, redirect `/communities`). #20 fixes a leftover bottom-nav `/niche/` → `/n/` check. Bottom-nav icon/missing-Trade decisions intentionally left to the product team. |

---

## New items (not on the original audit)

### NEW-A — Trade flow handoff with Inbox

**Status:** Unfinished
**Blocked on:** Kyle (NEW-C decision)
**Last reviewed:** 2026-05-19

"Make an offer" (PR #8) opens a modal and routes to `/inbox`, but the offer doesn't actually reach the seller's inbox: it doesn't appear as an outbound offer, and accepting/declining doesn't propagate to the seller's `/my-stuff`. The inbox-side wiring is missing.

**Why it matters:** This is the core marketplace transaction. Without it, "Propose a Trade" dies after the modal closes.

### NEW-B — "Received via trade" view

**Status:** Missing
**Blocked on:** NEW-A
**Last reviewed:** 2026-05-19

When a trade is accepted, the other person's item enters this user's inventory. There's no UI yet to indicate "this item just landed in your account because you traded for it" — the item should either appear in `/my-stuff` automatically or behind a confirmation step.

### NEW-C — Pre-trade bilateral confirmation

**Status:** Pending decision
**Blocked on:** Kyle
**Last reviewed:** 2026-05-19

A trade is two items changing hands at once. The current flow doesn't define a two-sided confirmation step ("both parties accepted" → both items move). Marketplace trades typically need bilateral confirmation to prevent disputes — but it adds friction. Kyle's call.

### NEW-D — Wishlist removal from MVP

**Status:** OK (closed)
**Last reviewed:** 2026-05-20
**PR:** #18

Wishlist removed end-to-end. See decision log entry 2026-05-19. Admin paths retain references (pre-MVP tooling, out of scope).

### NEW-E — "Sold transfer" model decision

**Status:** Pending decision
**Blocked on:** Kyle
**Last reviewed:** 2026-05-19

When the seller marks an item Sold, what happens on the buyer's side? Three options:

1. **Invisible to the buyer.** Simplest, no cross-account wiring.
2. **Transfer pending.** Seller marks Sold → buyer gets a notification "X says they sold you Y, confirm to add to your collection".
3. **One-way handoff.** Seller marks Sold + clicks "Send to buyer" → a pre-filled Add-Item link is shared with the buyer.

### NEW-F — Sidebar audit after Communities removal

**Status:** OK (closed)
**Last reviewed:** 2026-05-20
**PRs:** #8, #11, #20

Audited the sidebar and mobile bottom-nav end-to-end. Findings:

- **Already fixed in PR #8:** sidebar Heart → Eye icon, label "Following" → "Favorites" (matches the new tabbed `/favorites` page).
- **Already fixed in PR #11:** Communities item + active-state check removed; `/communities` route returns a redirect to `/`.
- **New fix in PR #20:** mobile bottom-nav `pathname.startsWith("/niche/")` corrected to `/n/` — Home now lights up on niche routes.
- **Intentionally left for the product team to decide later (not bugs):**
  - Mobile bottom-nav `Inbox` uses the `Send` icon (chosen for visual punch + action affinity); desktop uses `Inbox`. Product decision pending whether to unify or accept the divergence.
  - Mobile bottom-nav has no `Trade` entry; desktop does.
  - Mobile bottom-nav `Market` uses the `Repeat2` icon (same as `Trade`'s icon).

### NEW-G — Trade flow coherence (Propose / Receive / Counter)

**Status:** OK (closed)
**Last reviewed:** 2026-05-20
**PRs:** #21
**Design notes:** [`docs/trade-flow-design-notes.md`](./trade-flow-design-notes.md)

The trade flow used three different modals (`MakeOfferModal`, `CounterOfferModal`, `CashCounterOfferModal`) — visually inconsistent, hard to read, with the cash-only counter only reachable on mobile in a specific corner case. The chat-side card was framed "they offer / for your", which never made the current user's side obvious.

Unified into a single `ProposalSheet` driven by a `mode` prop (`initiate` / `counter`), and a single `ProposalCard` for the chat-side render. Both are explicit about "You give / You get" from the current user's perspective.

Highlights:

- One source of truth for building proposals (init from listing OR counter from inbox).
- Cash can be **added or requested** by either party at any stage.
- Chat-side card is collapsed by default (~90px) with the action buttons always visible; expanding reveals item details and the negotiation history.
- Trade proposals require at least one item on each side. Cash-only is a Purchase Offer (see NEW-H, future scope).
- `expires_at` dropped from the UI — proposals don't expire.
- Optional message field on the proposal travels with the offer object and renders in the expanded card.

### NEW-H — Purchase offer (Buy) flow redesign

**Status:** Open
**Last reviewed:** 2026-05-20

Today's "Buy — Contact Seller" button on listing detail is a dead button (no `onClick`). When NEW-A wires the inbox handoff, the Buy flow needs a coherent companion to the trade `ProposalSheet`:

- Buyer offers a cash amount on a listing → seller receives it as a "Purchase offer" card in the inbox.
- Same shape as the trade proposal card so the inbox is uniform, but the building UI is simpler (no items to pick — just amount + message).
- Counter flow on a purchase offer is amount-only, same paradigm.

This is **distinct from a trade**. Per product decision (NEW-G review): a trade requires at least one item on each side; pure cash is a purchase. The current `ProposalCard` already renders both as separate kinds (`Trade proposal` vs `Purchase offer`) — only the **building** UI is missing.

---

## Counts at a glance

| Status | Count |
|--------|-------|
| Missing | 4 |
| Unfinished | 5 |
| OK | 60 |
| Perfect | 3 |
| Out of scope (post-MVP) | 3 |

---

## Next up (recommended priority)

Refreshed each time something closes. Items blocked on Kyle are listed at the bottom — they don't pull priority over actionable work.

1. **#20 — Loading & empty states (final pass).** #22 + #24 cover home, market, trade matches, and my-stuff. Only profile tabs left (intentionally deferred — overlaps with open PRs #9/#14/#18). Picks up after those merge.
2. **#36 — Trade interests promoted to a route.** Mid-size, touches navigation.
3. **NEW-H — Buy / Purchase offer flow.** Companion to the trade flow shipped in NEW-G; amount-only proposal sheet, same card shape.
4. **#2, #3, #10 — Auth side-branch flows.** Sign up via niche link, Verify email, Find niche. Need to merge the side branch or rebuild on main.
5. **#20-admin — Admin tables loading/empty polish.** Polish only, low priority.

**Closed in NEW-G:** #42 (counter-offer modal polish) was superseded by the full trade flow redesign — % presets and balance dropped in favor of clearer "You give / You get" framing and live picker.

**Blocked on Kyle:**

- **NEW-A / NEW-B / NEW-C** — trade inbox handoff. Sizeable design sprint once NEW-C is decided.
- **NEW-E** — sold transfer model. Affects what "Mark as Sold" really means.

---

## Open PRs (snapshot)

This list is informational and goes stale fast. Use `gh pr list --state open` for the authoritative view.

| PR | Title | Base | Status |
|----|-------|------|--------|
| #4  | feat(create-listing): mobile fixes, Keeping state, Wishlist redesign, specs editor refactor | main | Open — superseded in part by #18 |
| #5  | docs: add design audit and MVP priority list (2026-05-14) | main | Closed — superseded by this document |
| #6  | feat(collections): end-to-end CRUD, visitor view, and unified card modes | main | Open |
| #8  | feat(listings): listing detail CTAs, Watchlist concept, Make an Offer flow | main | Open |
| #9  | feat(profile): Looking For tab with dedicated WishlistItemCard | #6 | Open — partially superseded by #18 |
| #11 | chore(communities): hide Communities surfaces | main | Open |
| #12 | chore(audit): quick wins — CollectionCard href, search debounce | main | Open |
| #13 | feat(edit-listing): wire ?edit={id} param to hydrate the form | #8 | Open |
| #14 | feat(profile): activity tab | main | Open |
| #15 | feat(create-listing): drag-and-drop photo reordering | main | Open |
| #16 | feat(my-stuff): wire item action menu + Active/Sold/Traded status filter | #6 | Open |
| #17 | docs: 2026-05-19 audit addendum | main | Closed — superseded by this document |
| #18 | feat(mvp): remove Wishlist concept end-to-end | #6 | Open |
| #19 | docs(audit): single living audit document | main | Merged — this document |
| #20 | fix(bottom-nav): mark Home active on niche routes | main | Open |
| #21 | feat(proposal): unified trade flow (Propose / Counter) | main | Open — closes NEW-G |
| #22 | feat(loading): reusable skeletons + empty states | main | Open — #20 partial |
| #24 | feat(loading): trade-matches + my-stuff skeletons & empties | #22 | Open — #20 continuation |
