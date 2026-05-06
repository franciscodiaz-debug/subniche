# Add Item Status Interaction Matrix

Reference URL: `https://v0-rebuild-k45azn1hm-darwoft-subniche.vercel.app/create-listing`

Captured on: 2026-04-26

Artifacts:

- Screenshots: `docs/reference/screenshots/live/create-listing/status-audit/`
- Raw observations: `docs/reference/raw-observations/live/create-listing-status-audit/`

## Summary

The status selector is the main branching control for the Add Item flow. The prototype treats `For Sale`, `For Trade`, and `In Collection` as owned-item statuses that can be combined. `Wishlist` is a separate wanted-item path that changes the page workflow and primary action.

The v0 prototype does not expose reliable `aria-pressed` state for these buttons, so the screenshots are the source of truth for visual active state.

## Default

Screenshot: `status-audit/00-default.png`

- Primary action is `Add Item`.
- Status buttons are visible: `For Sale`, `For Trade`, `In Collection`, `Wishlist`.
- No status note is shown.
- Category, title/subtitle, profile card, description, specifications, and photo upload are visible.
- No price, condition, payment, logistics, collection, or wishlist detail fields are visible.

## For Sale

Screenshot: `status-audit/01-for-sale.png`

- `For Sale` becomes active with green styling.
- Status note appears: `For Sale fields added`.
- `Wishlist` becomes disabled while sale fields are active.
- Title/subtitle block shows a price line, displayed as `$0`.
- `Condition` panel appears in the left column.
- Right column shows:
  - `Payment`
  - `Logistics`
  - `Return Policy`
  - `Publish To`
- Primary action stays `Add Item`.

Clicking `For Sale` again produced a state with the sale fields hidden and `Wishlist` re-enabled, while the status note still remained visible in the prototype screenshot (`status-audit/02-for-sale-clicked-again.png`). Treat this as a prototype ambiguity to resolve before final implementation.

## For Trade

Screenshot: `status-audit/03-for-trade.png`

- `For Trade` becomes active with blue styling.
- Status note appears: `For Trade fields added - you'll set interests in the next step`.
- `Wishlist` becomes disabled while trade fields are active.
- No price line is shown in the title block.
- `Condition` panel appears.
- Right column still shows the same listing fulfillment fields as sale:
  - `Payment`
  - `Logistics`
  - `Return Policy`
  - `Publish To`
- No separate trade-interest form appears; trade-interest setup is explicitly deferred.

Clicking `For Trade` again produced a state with the trade fulfillment fields hidden while the trade note remained (`status-audit/04-for-trade-clicked-again.png`). This mirrors the For Sale ambiguity.

## In Collection

Screenshot: `status-audit/05-in-collection.png`

- `In Collection` becomes active with yellow styling.
- Status note appears: `Collection fields added`.
- `Wishlist` remains visually enabled in this single-status state.
- No price line is shown.
- `Condition` panel appears.
- Right column shows `Collection` fields:
  - `Add to Collection`
  - `Item Notes`
  - `Date Acquired`
  - `Acquisition Price`
  - `Receipt / Proof of Purchase`
- Primary action stays `Add Item`.

Clicking `In Collection` again hid the condition and collection fields (`status-audit/06-in-collection-clicked-again.png`).

## Combined Owned Statuses

Screenshots:

- `status-audit/09-sale-trade.png`
- `status-audit/10-sale-trade-collection.png`
- `status-audit/11-sale-trade-collection-sale-clicked-again.png`

Observed combined behavior:

- `For Sale` + `For Trade` can be active together.
- `For Sale` + `For Trade` + `In Collection` can be active together.
- When `For Sale` is included, the title block shows `$0`.
- When `For Trade` is included, the trade next-step note appears.
- When `In Collection` is included, the collection panel appears.
- When any sale/trade owned publishing status is active, `Wishlist` is disabled.
- When all three are active, the right column stacks listing fields first, then collection fields.

The status note line appears to show the most recently interacted status rather than a complete summary of all active statuses. Existing screenshots show the combined state with only one visible note line.

## Wishlist

Screenshots:

- `status-audit/07-wishlist.png`
- `status-audit/14-wishlist-base.png`
- `status-audit/15-wishlist-add-via-url.png`
- `status-audit/16-wishlist-enter-manually.png`

Wishlist is a separate wanted-item mode, not an owned-item status.

Base wishlist state:

- Primary action changes from `Add Item` to `Add to Wishlist`.
- Status note appears: `Wishlist fields added`.
- `For Sale` and `For Trade` become disabled.
- The standard item form is replaced by a compact choice panel:
  - `Add via URL`
  - `Enter Manually`
- Copy explains that wishlist items are things the user wants but does not own.

`Add via URL` branch:

- Shows a `Paste a link to your wishlist item` field.
- Shows `Process` and `Back`.
- The standard item form remains hidden.

`Enter Manually` branch:

- Restores the standard category, title/subtitle, profile, description, specifications, and photo upload layout.
- Adds a right-side `Wishlist Details` panel with:
  - `Source URL`
  - `Target Price`
  - `Visibility` segmented control: `Public` / `Private`
- Bottom helper changes to `Back to top to add to wishlist`.
- Primary action remains `Add to Wishlist`.

## Implementation Gaps In Local App

- Local `For Trade` currently only shows a trade next-step note; the reference also shows condition plus payment/logistics/return-policy/publish-to fields.
- Local wishlist currently jumps directly to a wishlist details form; the reference has a choice panel first, with `Add via URL` and `Enter Manually` branches.
- Local wishlist primary action still needs to match the reference `Add to Wishlist` action label.
- Local wishlist manual mode should show standard item fields plus a right-side `Wishlist Details` panel.
- The selected-status click-again behavior is ambiguous in v0: fields hide, but status note styling can remain. Decide whether production should fully toggle the status off or preserve a sticky status label.
