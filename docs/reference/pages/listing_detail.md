# Page: Listing Detail

## URL

`https://v0-rebuild-l86r4kq92-darwoft-subniche.vercel.app/listings/tele-butterscotch-2022`

## Purpose

Listing detail is the buyer/trader evaluation page. It combines listing facts, seller context, community context, direct messaging, offer initiation, watch/share controls, and media browsing.

## Observed Layout

The page uses a two-column desktop layout: details and seller/action panel on the left, large image gallery on the right. The shell can collapse to icon-only nav on this page.

Major regions:

- Breadcrumb: `Musical Instruments > Guitars`.
- Status badge: `For Sale`.
- Title, subtitle, posted time, and price.
- Seller card with profile link, location, join date, item count, and collection count.
- Group summary control: `Posted in 2 groups · 2 in common`.
- Primary actions: `Message`, `Make Offer`, watch toggle, share.
- Description, condition, specs, payment, shipping, return policy.
- Image gallery with previous/next buttons and selectable thumbnails.
- `More from MarkusVintage` carousel with disabled previous/next when not scrollable.

## Observed Interactions

- `Make Offer` opens a centered modal with dimmed backdrop, item summary, offer amount stepper/input, optional message, 48-hour expiration note, `Cancel`, and `Send Offer`. `Send Offer` is disabled by accessibility state until valid data is entered, though it appears visually prominent.
- `Next photo` changes the selected thumbnail state and swaps the main image. One observed secondary image looked like an unrelated generated city/person image, which is likely prototype asset drift.
- `Posted in 2 groups · 2 in common` expands inline and reveals group chips.
- Watch toggle changes from `Watch listing` value `0` to `Stop watching listing` value `1` and the icon turns yellow.
- Share button did not expose a clear app-level popover in the accessibility tree during this pass; possible native share or incomplete prototype behavior.

## States Observed

- Default listing state.
- Offer modal open.
- Gallery photo 2 selected.
- Group list expanded.
- Watch enabled.

## Product Rules Implied

- Listings can be posted to multiple groups/communities and the buyer can see shared context.
- Offer creation is modal-based and requires an amount before sending.
- Watch state is binary and immediate.
- Gallery selection state must be explicit and keyboard/screen-reader observable.

## Acceptance Criteria Candidates

- Listing detail renders seller card, posting groups, price, condition, specs, payment, shipping, and return policy.
- `Make Offer` opens a modal without submitting anything.
- Offer submit is disabled until valid offer input exists.
- Gallery next/thumbnail controls update selected image state.
- Posting-group control expands/collapses community chips.
- Watch toggle updates visual and accessible state.

## Open Questions

- Should `Message` open an inbox thread, a composer modal, or route to `/inbox?id=...`?
- Should share use a custom popover, native share, copied-link toast, or all of those by device capability?
- Is the unrelated gallery image intentional placeholder drift or a bug to reject?
