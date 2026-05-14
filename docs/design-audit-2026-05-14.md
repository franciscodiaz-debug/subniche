# SubNiche — Design Audit & MVP Priority List

**Date:** 2026-05-14
**Branch audited:** `main` @ `b0bb83b` ("Polish mobile navigation, profile, and market UI")

## Scope of this audit

This repo is the **design prototype**. Backend lives in a separate project — the back team copies approved UI flows into their own codebase. That means:

- **Persistence to a database is out of scope.** It does not count against a flow.
- **Email sending, password hashing, route protection middleware** — also backend, also out of scope.
- **What does count:** the UI exists, all states are designed (loading / empty / error), and the flow is **runnable end-to-end with local state or `sessionStorage`** so a reviewer (and the back team) can see the intended behaviour without imagining it.

The `feature/create-listing` PR is **not** reflected here — that's the picture of `main` as it stands today.

---

## Executive summary

The product is in much better shape than a raw "is the data persisted" lens would suggest. Surface area is large and most flows are present.

Three concrete gaps stand out for closing MVP **as a design**:

1. **Collections — `[todo]` stubs that prevent end-to-end demo.** Create, edit, delete, and "add items" all log and return. The user can fill in the forms but nothing visible changes — the flow can't be walked through. *This is the single biggest design hole.*
2. **Trade offer initiation has no UI.** Offers can be received in chat (fixtures), but there's no "Make an offer" CTA anywhere — not on a match card, not on a listing detail. The marketplace mechanic is half-designed.
3. **Edit listing is wired with a link but the form doesn't load existing data.** Owner clicks "Edit" → goes to `/create-listing?edit={id}` → empty form. The design intent is clear, the implementation hook isn't there.

Behind those: **Communities page is empty** (placeholder only), **delete listing button is inert**, and **loading/empty states are missing in most feeds** — they'll feel jumpy once the back team wires real fetches.

Everything else is either complete-as-design or just needs polish.

---

## Status legend

- **Missing** — does not exist in the code (or only as a "Coming soon" placeholder)
- **Unfinished** — UI exists but the local flow doesn't simulate the intended behaviour end-to-end (handlers `console.log` or no-op on actions a designer would expect to "work")
- **OK** — flow runs end-to-end with local state / sessionStorage, ready for backend handoff
- **Perfect** — no further design work needed

---

## Flow-by-flow audit

### Auth & Onboarding

> Scope reminder: we audit the *UI flow*, not the security/persistence layer. "Mock cookies" and "no DB" are expected and not counted against the flow.

| # | Flow | Status | MVP risk | Notes |
|---|------|--------|----------|-------|
| 1 | Sign up with email | OK | Low | Form, validation, niche selector, password rules, avatar/bio/zip — full flow visible |
| 2 | Sign up via niche link (`?niche=`) | Missing | Medium | Param isn't read on main. Designed on a side branch but not merged |
| 3 | Verify email | Missing | Medium | No `/verify` route exists on main — the verify screen is a designed state with no entry point |
| 4 | Suggest a niche | OK | Low | Modal, form, success state all designed and runnable locally |
| 5 | Onboarding (display name, bio, avatar, zip) | OK | Low | Complete; avatar preview uses object URL — acceptable for design |
| 6 | Login | OK | Low | Form + error states designed |
| 7 | Forgot password | OK | Low | Email input + confirmation state designed |
| 8 | Logout | Unfinished | Medium | Action exists; **no UI button calls it from anywhere visible to the user** |
| 9 | Welcome / landing (logged-out) | OK | Low | Hero, features, FAQ — solid |
| 10 | Find niche (`/find-niche`) | Missing | Medium | Doesn't exist on main; downstream of verify |

---

### Home & Discovery

| # | Flow | Status | MVP risk | Notes |
|---|------|--------|----------|-------|
| 11 | Homepage logged-in | OK | Low | Feed sections present |
| 12 | Homepage logged-out | OK | Low | Landing renders cleanly |
| 13 | Niche page (`/n/[slug]`) | OK | Low | Three branches (logged-out / onboarding / logged-in), driven by admin-settings context |
| 14 | Market / search results | OK | Low | Tabs (Items/Collections/Users), filters, sort all work against mock data |
| 15 | Search bar (header) | OK | Low | Live suggestions over mock data |
| 16 | Trade page | OK | Low | Grid + interests views, deduped correctly |
| 17 | Communities page | **Missing** | **High** | Placeholder ("Coming soon"). Linked from feed + nav, so it's a dead end |
| 18 | ItemCard component | **Perfect** | Low | Consistent `/listings/{id}` links, every state covered |
| 19 | CollectionCard component | Unfinished | Medium | In feed sections `href` points at `/my-stuff?tab=collections` instead of `/collection/{id}`. One-line fix |
| 20 | Empty / loading states across feeds | Unfinished | Medium | No skeletons, no `Suspense` wrappers — fine while mock is instant, will feel rough on real fetches |

---

### Listings (Create, View, Edit)

| # | Flow | Status | MVP risk | Notes |
|---|------|--------|----------|-------|
| 21 | Create listing — desktop | OK | Low | Functional draft saved to `sessionStorage` |
| 22 | Create listing — mobile wizard | OK | Low | 5-step wizard with per-step validation and scroll-to-error |
| 23 | Status selection (For Sale / Trade / Collection / Wishlist) | Perfect | Low | Mutual exclusion logic correct |
| 24 | Specs editor | Unfinished | Low | Schema-driven inputs only — no "+ Add" affordance, no field-type variation (Kyle has requested chips-style; the open PR addresses this) |
| 25 | Photo upload | OK | Low | Blob URLs — acceptable for design; real upload is backend |
| 26 | AI Assist | Unfinished | Medium | UI is complete (suggestions + accept-all). Whether the *design* shows AI as a feature is the question — UI says yes, no decision spec'd |
| 27 | Wishlist creation | Unfinished | Medium | URL import simulation is too thin — "process" returns the same placeholder regardless of URL. Either deepen the mock or simplify the flow (Kyle's feedback) |
| 28 | Publish Confirm screen | OK | Low | Preview reuses `ListingDetailView` — never drifts from the real detail page |
| 29 | Listing detail page (`/listings/[id]`) | OK | Low | 4 mock listings covering each state variant + helpful fallback |
| 30 | Owner view on detail | Unfinished | **High** | Edit/Delete/Mark-as-Sold buttons are inert — owner can't simulate the flow |
| 31 | **Edit listing** | **Missing** | **High** | Link is wired (`?edit={id}`) but the form doesn't read it, so it lands on an empty create form. The flow exists in intent, not in motion |
| 32 | Delete listing | Unfinished | Medium | Button has no `onClick` — needs at minimum a confirmation modal that removes the listing from local state |
| 33 | Just-published page | OK | Low | Reads `sessionStorage` draft, renders detail view, banner clears the draft |

---

### Trade

| # | Flow | Status | MVP risk | Notes |
|---|------|--------|----------|-------|
| 34 | Trade interest — create | OK | Low | Simple + advanced modes; saved in React Context |
| 35 | Trade interest — edit | OK | Low | Inline editor, delete with confirmation |
| 36 | Trade interests view | OK | Medium | UI is solid but only accessible via a gear button on `/trade`. Bad discoverability — should be a dedicated tab or route |
| 37 | Trade matches on homepage | OK | Low | 6 mock matches; visual scoring works |
| 38 | Trade card | Unfinished | High | No "Make an offer" CTA on the card itself — see flow #39 |
| 39 | **Trade offer flow (initiation)** | **Missing** | **High** | Offers exist as fixtures *inside chat*, but **there is no UI to initiate an offer** from a match, a listing, or anywhere else. The core marketplace action is undesigned |

---

### Messaging

| # | Flow | Status | MVP risk | Notes |
|---|------|--------|----------|-------|
| 40 | Inbox | OK | Low | Three-panel layout, responsive |
| 41 | Chat panel | OK | Low | All message types render (text, offer, accept/decline) |
| 42 | Cash counter-offer modal | OK | Low | Functional; UI could be richer (% presets, diff view) |
| 43 | Trade offer in chat | OK | Low | Inline cards + sticky header when active |

---

### Profile

| # | Flow | Status | MVP risk | Notes |
|---|------|--------|----------|-------|
| 44 | Profile view (own + `/u/[username]`) | OK | Low | Avatar, bio, tabs, stats, trust signals |
| 45 | Edit profile | OK | Low | Form complete |
| 46 | Niche switcher | Perfect | Low | Two variants (rail + chip), accessible |
| 47 | Public profile view | OK | Low | Follow button is mock — counts as designed |

---

### Collections — the biggest design hole

| # | Flow | Status | MVP risk | Notes |
|---|------|--------|----------|-------|
| 48 | Collection detail — owner view | Unfinished | **High** | UI built, but `handleAddSelected` is `console.log("[todo]")` — picking items does nothing visible. The owner can't demo "add items to my collection" |
| 49 | Collection detail — visitor view | **Missing** | **High** | No non-owner render path. Even a private collection renders with owner controls if visited |
| 50 | Create new collection | Unfinished | **High** | Form complete but `[todo] save collection edits` returns silently in `isEditing=false` path too — the redirect happens but the new collection doesn't appear in `/my-stuff` |
| 51 | Edit collection | Unfinished | **High** | Reuses the create form; on save: `console.log("[todo] save collection edits")` |
| 52 | Add items to collection | Unfinished | **High** | Item picker sheet works; on confirm: `console.log("[todo] add items")` |
| 53 | Collection picker (when creating a listing) | OK | Low | Dropdown + "Create New Collection" button — the button needs wiring to the create flow once that works |
| 54 | Delete collection | Unfinished | Medium | Button only logs |

---

### My Stuff

| # | Flow | Status | MVP risk | Notes |
|---|------|--------|----------|-------|
| 55 | My Stuff page | OK | Low | Tabs functional |
| 56 | My collections tab | OK | Low | Grid/list, sort, filters, stats |
| 57 | My listings tab | OK | Low | Same — UI ready, item actions are `[stub]` |
| 58 | My wishlist tab | OK | Low | Folded into collections via `is_wishlist` flag — designed as such |
| 59 | Item action menu | Unfinished | Medium | Actions `[stub]` in `my-item-card.tsx` — user can't simulate "mark sold", "toggle sale", "move to other collection", etc. |

---

### Admin

| # | Flow | Status | MVP risk | Notes |
|---|------|--------|----------|-------|
| 60 | Admin dashboard | OK | Low | Stats + activity log |
| 61 | Design system reference page | OK | Low | Reference, not a builder |
| 62 | Niche config | OK | Low | Cards backed by `useAdminSettings()` |
| 63 | Taxonomy (categories / attributes) | OK | Low | Full editor UI |
| 64 | Moderation queue | OK | Low | Reports table + action dialogs |
| 65 | Review queue | OK | Low | Pending review items, confidence bar |

---

### Navigation & Shell

| # | Flow | Status | MVP risk | Notes |
|---|------|--------|----------|-------|
| 66 | Top bar / header | OK | Low | Sticky, blurred backdrop, auth-aware |
| 67 | Bottom nav (mobile) | OK | Low | 5 slots with center create FAB; auto-hides on scroll |
| 68 | Sidebar (desktop) | OK | Low | Collapse mode on inbox/create |
| 69 | Mobile search panel | OK | Low | Portal overlay with quick searches + results |
| 70 | Niche switcher | OK | Low | Two variants wired to context |
| 71 | App shell client layout | OK | Low | Scroll detection, Suspense fallback, context providers |

---

## Counts at a glance

| Status | Count |
|--------|-------|
| Missing | 5 |
| Unfinished | 15 |
| OK | 49 |
| Perfect | 3 |

---

## Recommended priority for closing MVP (design-only)

The premise: a flow is "done" when a reviewer (or the back team) can run it end-to-end against local state without anyone having to imagine missing behaviour.

### Band 1 — Cannot close MVP without these

1. **Wire up Collections CRUD against local state.** Five `[todo]` stubs (#48, #50, #51, #52, #54). Once these update local state and the affected screens re-read it, the entity that anchors the whole product becomes demoable. Highest leverage single fix in this list.
2. **Design + ship Collection visitor view.** Decide visibility rules (private 404? unlisted gated? public open?) and build the non-owner render path (#49).
3. **Trade offer initiation flow.** Design + build "Make an offer" UI from a match card and from a listing detail page (#38, #39). Should produce an offer object that lands as an outbound offer in inbox.
4. **Edit Listing — read `searchParams.edit` and populate the form.** The link exists; the form-loading hook doesn't (#31). Once the form loads existing data, owner Edit becomes demoable.
5. **Communities page.** Either design a real list view or remove the entry points (#17). Right now both feed links and nav links go to a dead "Coming soon".

### Band 2 — Strongly recommended

6. **Owner actions on listing detail.** Delete with confirmation modal, Mark-as-Sold persisting to local state, stats either wired or hidden (#30, #32).
7. **Logout UI entry point.** The action exists; just add a menu item in the profile chip (#8).
8. **`feature/create-listing` PR merge.** Lands status logic improvements, Acquisition section split, chips-based specs editor, Wishlist progressive disclosure, brand-aware Model autocomplete. Closes Unfinished items #24 and #27.
9. **Item action menu in My Stuff — wire stubs to local state.** Move, mark sold, toggle sale/trade should all reflect in the UI immediately (#59).
10. **Trade interests — promote to a dedicated route or tab.** It's good UI buried behind a gear button (#36).

### Band 3 — Important for design quality, not blocking

11. **Loading & empty states** across feed sections, Market, Trade, My Stuff (#20). Suspense + skeletons.
12. **CollectionCard `href` fix** in feed sections — point at `/collection/{id}` not `/my-stuff` (#19). One-line change.
13. **AI Assist decision.** Either keep the UI and treat it as a designed feature (back team implements), or remove it from the design (#26). The current "fake AI" state isn't a decision.
14. **Wishlist URL import.** Make the local mock smart enough to demo the value (e.g. extract host name + populate title pattern), or simplify the flow if URL import isn't worth the complexity (#27).
15. **Sign up via niche link, Verify email, Find niche.** Designed on a side branch; merge or rebuild on main so the auth flow has continuity (#2, #3, #10).

### Band 4 — Polish

16. Drag-and-drop photo reordering (#25).
17. Search debouncing (#15).
18. Counter-offer modal — % presets, side-by-side diff (#42).
19. Activity tab on profile, currently empty (#44).
20. Loading/empty state polish across admin tables.

---

## Where the open PR (`feature/create-listing`) lands

The PR addresses several items above:

- Closes #24 (chips-based specs editor) and adds brand-aware Model autocomplete
- Closes #27 (Wishlist progressive disclosure per Kyle's feedback)
- Refactors status logic (Keeping rename, mutual exclusion of Wishlist & Keeping)
- Splits Acquisition fields out of Collection, makes Collection a required picker for owned items
- Adds persistent status hints that double as inline explainers

It does **not** address the Band 1 blockers — those are out of scope and need separate branches.

---

## Open questions for Kyle

These need direction before more design work starts on them:

- **Communities scope.** Is this a list of niches, of user-curated groups, of forums?
- **AI Assist — designed feature or not?** If yes, keep the UI and document it as a backend requirement. If no, remove it from the create flow.
- **Edit listing — full re-edit or limited fields?** Some marketplaces only allow price + photos to change after publish. Affects design scope.
- **Collection visibility semantics.** Spec the rules:
  - Private — only owner sees, 404 for others
  - Unlisted — direct link only, not in search/feeds
  - Public — fully discoverable
- **Trade offer flow — design direction.** Single CTA from match card, or step-by-step "pick items → counter cash → send"? Should it open as a modal, a side panel, or a new screen?
