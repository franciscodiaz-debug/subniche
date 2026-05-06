# Page: Add Item / Create Listing

## URL

`https://v0-rebuild-k45azn1hm-darwoft-subniche.vercel.app/create-listing`

## Purpose

Add Item is the entry point for adding owned gear into the user's inventory or publishing a wishlist item that the user is looking for.

## Observed Layout

The page uses the same shell as the rest of the prototype. A top action row includes `AI Assist`, `Save Draft`, and `Add Item`; `AI Assist` is visibly disabled in the observed state. The first content block is `Status`, followed by category buttons, a right-side profile completion card, description fields, specifications, photos, and conditional sale/collection sections.

Status choices appear as buttons:

- `For Sale`.
- `For Trade`.
- `In Collection`.
- `Wishlist`.

Per product direction, `Wishlist` means an item the user does not own but wants to publish that they are looking for. It is distinct from trade interest/wants attached to an owned item.

Category choices are button tiles:

- `Guitars`.
- `Drums`.
- `Keyboards`.
- `Audio Equipment`.
- `Accessories`.
- `Other`.

The form includes title, subtitle, description, specifications, photo upload, payment, logistics, publish-to, collection, item notes, date acquired, acquisition price, and proof-of-purchase upload areas.

## Observed Interactions

- The page opens with a product-tour spotlight on `Item Status`; `Skip tour` dismisses it and `Next` advances tour steps.
- Selecting `For Sale` reveals sale-related fields such as price, payment, logistics, return policy, and publishing targets.
- Selecting `For Trade` adds an inline note: `fields added - you'll set interests in the next step`. It also reveals condition plus the same payment/logistics/return-policy/publishing fields as sale, but without the price line. This matches the user's note that trade-interest setup is incomplete and should not be treated as final.
- Selecting `In Collection` reveals collection-related fields, including `Add to Collection`, item notes, acquisition date, acquisition price, and proof of purchase.
- Owned statuses are additive; sale, trade, and collection can be active together. `Wishlist` is the separate non-owned item path.
- Selecting `Wishlist` changes the primary action to `Add to Wishlist`, hides the standard form behind a choice panel, and offers `Add via URL` or `Enter Manually` branches.
- Selecting a category changes visual selection state without leaving the page.
- `Specifications` expands additional structured fields.
- `Save Draft` is available from both the top and bottom action rows. No durable save result was submitted or verified in this pass.

Detailed status-by-status screenshots and behavior notes are documented in `docs/reference/pages/add_item_status_interactions.md`.

## States Observed

- Product tour start.
- Product tour steps 2 and 3.
- Desktop default after tour dismissal.
- `For Sale` selected.
- `For Sale` + `For Trade` selected.
- `For Sale` + `For Trade` + `In Collection` selected.
- `Audio Equipment` category selected.
- Basic title/subtitle/description fields filled.
- Specifications expanded.
- Save Draft clicked.
- Mobile default after tour dismissal.

## Product Rules Implied

- Owned item status is additive, not a single exclusive mode.
- The same item can be in a collection, for sale, and open to trade.
- Wishlist items are not owned inventory and should not be conflated with trade interests.
- Trade setup is intentionally deferred after selecting `For Trade`.
- Inventory metadata and listing metadata coexist in one form.
- Draft saving is part of the intended workflow.

## Acceptance Criteria Candidates

- Add Item renders status toggles, category choices, profile context, description fields, specifications, photos, and top/bottom actions.
- Selecting `For Sale` reveals sale/payment/logistics/publishing fields.
- Selecting `For Trade` reveals condition plus listing logistics fields and the interim next-step trade-interest message without requiring final trade criteria.
- Selecting `In Collection` reveals collection and provenance fields.
- Owned status choices can be active at the same time.
- Wishlist creates/publishes a wanted item, not an owned item or trade-interest criteria, and supports URL import or manual entry.
- `Specifications` expands/collapses structured fields.
- Mobile layout preserves the same major controls without overlapping.

## Open Questions

- Is trade interest setup part of add-item MVP, listing edit, or a separate post-publish step?
- Does `Add Item` publish immediately, route to a review screen, or save and redirect to My Stuff?
- What validation is required before saving a draft versus adding/publishing an item?
- Should `AI Assist` be enabled in MVP, and what source data should it use?
