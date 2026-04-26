# V0 Design Alignment Audit

This document captures the practical gap between the current local app and the imported v0 reference archive. The goal is to keep future work fast: use v0 as visual reference, keep the production app clean, and avoid routing every implementation decision through an external chat.

## Operating model

- The repo is the source of truth for implementation.
- v0 screenshots and exported code are reference material, not production source.
- Rebuild v0 patterns through the current Next.js app, shared components, mock data, and design tokens.
- Use ChatGPT only for product-memory questions that are not answered by `/docs`, mock data, or v0 references.
- Ask the product owner for business, idea, and design judgment when the repo and ChatGPT do not answer the question.

## Current status

Completed local branches now cover:

- App shell
- Core components
- Mock data
- Marketplace page
- Listing detail page
- Add item flow

The strongest remaining mismatch is not lack of functionality everywhere. It is uneven visual fidelity: some pages exist but do not yet match the density, hierarchy, and visual rhythm of v0; other pages are still placeholders.

## Global v0 patterns to preserve

### Navigation and chrome

The v0 shell uses a bold script SubNiche wordmark, top search, profile chip, and a left nav with `Add Item` as the primary action. The current app has a cleaner production shell, but it is missing some recognizable v0 cues.

Recommended direction:

- Keep the current production shell structure.
- Bring back a stronger SubNiche wordmark treatment.
- Add a global search area where it helps authenticated surfaces.
- Keep `Create Listing` / `Add Item` prominent in the sidebar.
- Do not copy the v0 sidebar wholesale if it conflicts with current routing.

### Marketplace cards

The v0 cards are more image-led and compact. They use large images, tighter metadata, and trade/context chips near the bottom. The current cards are functional and clearer about status, but they are heavier and more vertical.

Recommended direction:

- Preserve current explicit status semantics.
- Tighten card density and metadata hierarchy.
- Keep images large and visually dominant.
- Add clearer trade-match context on trade-mode cards.
- Avoid turning cards into generic dashboard panels.

### Page rhythm

The v0 pages generally use a top search/header, simple page title, tabs, then dense content grids. Current pages use large `SectionHeader` blocks, stats cards, and explanatory copy. That is useful for early development but feels less like the v0 product.

Recommended direction:

- Reduce explanatory copy on mature pages.
- Prefer tabs and compact toolbars over large instructional headers.
- Keep explanatory text only where product behavior is genuinely new or risky.

## Page-by-page gaps

### 1. Profile and collections

Status: highest priority.

Current:

- `/profile` is a placeholder.
- `/collections` is a placeholder.
- Mock data already exists for profiles, collections, listings, and collection images.

V0 reference:

- `v0-reference/profile/screenshots/MyProfileFSFT.png`
- `v0-reference/profile/screenshots/MyProfileCollections.png`
- `v0-reference/profile/screenshots/MyProfileWants.png`
- `v0-reference/profile/screenshots/MyProfileActivity.png`
- `v0-reference/collections/screenshots/MyStuffCollections.png`
- `v0-reference/collections/screenshots/MyStuffItems.png`
- `v0-reference/collections/screenshots/MyStuffViewCollection.png`

Build direction:

- Implement a real profile header with avatar, handle, location, member date, bio, profile actions, trust placeholders, linked accounts, and stats.
- Add profile tabs for Collections, For Sale / Trade, Looking For, and Activity.
- Build collection cards with image mosaics and item-count/value context.
- Build a collection detail route later, but first make the index/profile surfaces real.

Why first:

Profile and collections are core to SubNiche trust and identity. v0 has strong references here, while the current app has almost nothing.

### 2. Logged-in home

Status: high priority.

Current:

- `/` is still an app-shell placeholder.

V0 reference:

- `v0-reference/homepage-logged-in/screenshots/homepage-logged-in.png`

Build direction:

- Replace placeholder entry cards with an authenticated home feed.
- Add a hero/context band for the current niche.
- Add action-required cards.
- Add horizontal listing sections: trade matches, saved searches, followed items, collections/people, community listings, trending, just listed.
- Reuse `ListingCard` or a denser homepage listing card variant.

Why second:

It gives the app a real first screen and helps connect market, trade, profile, collections, and communities into one product experience.

### 3. Marketplace and trade visual alignment

Status: medium-high priority.

Current:

- `/market` and `/trade` are functional with filters, sort, mode toggle, grid, and trade opportunity cards.
- Playwright covers add-item, not market/trade yet.

V0 reference:

- `v0-reference/marketplace/screenshots/MarketScreen.png`
- `v0-reference/marketplace/screenshots/MarketScreenFilters.png`
- `v0-reference/trade/screenshots/TradeScreen.png`
- `v0-reference/trade/screenshots/TradeScreenMenu.png`

Build direction:

- Make the top area closer to v0: compact title, tabs, toolbar, count, sort, and view controls.
- Reduce or collapse the current stats-card row.
- Tighten the listing grid to feel more image-forward.
- In trade mode, emphasize item-level match cards in the grid, not only the top opportunity cards.
- Add Playwright coverage for filter/mode interactions after visual changes.

Why not first:

The current market/trade pages are already usable. Placeholders should be eliminated before polishing these too deeply.

### 4. Add item visual alignment

Status: medium priority.

Current:

- `/add-item` is functional and covered by Playwright.
- It supports additive owned statuses and separate Wanted mode.
- It uses a single-page form with sticky preview.

V0 reference:

- `v0-reference/add-item/screenshots/AddItemFlow_v1.0.png`
- `v0-reference/add-item/screenshots/AddItemFlowFill_v1.0.png`

Build direction:

- Keep current status semantics.
- Pull in v0's stronger top action bar: save draft, add item, optional AI assist placeholder.
- Consider a more v0-like category breadcrumb/chip row.
- Make the preview/media area more visually dominant.
- Add payment/logistics fields only if they are still product-relevant for MVP.

Why not first:

The current page is already functionally aligned and tested. It can wait until profile/home are real.

### 5. Listing detail polish

Status: medium priority.

Current:

- `/listings/[id]` is real and uses mock selectors, gallery, detail header, seller card, trade panel, related listings, and publishing context.

V0 reference:

- No standalone screenshot exists in `v0-reference/listing-detail`.
- Related code likely lives inside `v0-reference/full-project/v0-export`.

Build direction:

- Keep the current implementation as the canonical base.
- Later compare against full-project listing-detail references if needed.
- Prioritize visual polish after profile/home/collections are built.

## Recommended next branch order

1. `feature/profile-and-collections`
2. `feature/homepage-logged-in`
3. `feature/market-trade-visual-alignment`
4. `feature/add-item-visual-alignment`
5. `feature/listing-detail-polish`

This order removes obvious placeholders first, then tightens existing functional pages.

## Next branch acceptance criteria

For `feature/profile-and-collections`:

- `/profile` is no longer a placeholder.
- `/collections` is no longer a placeholder.
- Profile header uses mock profile data.
- Profile tabs show collections, for-sale/trade items, wanted items, and activity placeholder content.
- Collection grid uses image-led mosaic cards inspired by v0.
- Existing `/market`, `/trade`, `/add-item`, `/listings/listing-strat-pro-ii`, and `/dev/components` still pass route checks.
- `npm run typecheck`, `npm run lint`, `npm run test:e2e`, and `npm run build` pass.

