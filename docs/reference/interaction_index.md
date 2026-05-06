# Prototype Interaction Index

## Navigation and Shell

- Left rail persists across pages and can appear full-width or icon-only depending on surface.
- Search is globally visible in the top center.
- User/niche switcher appears in the top right with current account and niche context.
- Some pages route with query state, for example `/inbox?id=conv-1`; trade routes appeared both as `/trade` and as older `/market?tab=trade-matches` links.

## Home

- Logged-in action cards navigate to message/offer destinations.
- Onboarding rows expose progress, preview/play affordance, and arrow action.
- Logged-out cards use `Watch` preview affordances.

## Market

- Filters open as a left rail/drawer.
- Category selection increases filter count, adds active chip, expands subcategories, and exposes brand filters.
- `Clear all` clears active filters.
- Sort and density are popup controls.

## Trade

- Trade tab navigates into `/trade`.
- `For` selector opens owned-item menu with match counts and perfect-match counts.
- Cards show either true match text or inbound-interest text.

## Listing Detail

- `Make Offer` opens a modal; no submit was performed.
- Gallery previous/next and thumbnail controls update selected photo state.
- Posting group summary expands inline into group chips.
- Watch toggle changes accessible state and icon color.
- Share behavior was unclear in this pass.

## Inbox

- Conversation selection updates URL query and fills center/right panels.
- Offer conversations show structured offer summary plus message history.
- `Counter` opens a modal; no submit was performed.
- Profile/trust panel remains visible beside active conversation.

## Profile

- Tabs switch public profile sections in-place.
- Share/settings/edit controls are present but not expanded in this pass.

## My Stuff

- Items/Collections tabs separate inventory views.
- Status filters are independent booleans: for sale and for trade can both be true.
- Collection chip dropdown and item action menu are present.
- Grid/list and density controls alter presentation.

## Add Item

- Product-tour overlay can be skipped or advanced with `Next`.
- Status choices are additive for owned items: sale, trade, and collection can be combined.
- `For Sale` reveals a price line plus condition, payment, logistics, return-policy, and publishing fields.
- `For Trade` reveals condition, payment, logistics, return-policy, and publishing fields, plus an interim next-step note for trade-interest setup.
- `In Collection` reveals collection/provenance fields.
- `Wishlist` is a separate wanted-item path with `Add via URL` and `Enter Manually` branches, and changes the primary action to `Add to Wishlist`.
- `Specifications` expands additional structured item details.
- Deep status audit: `docs/reference/pages/add_item_status_interactions.md`.
