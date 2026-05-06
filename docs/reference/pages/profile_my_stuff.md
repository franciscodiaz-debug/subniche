# Page: Profile and My Stuff

## URLs

- Profile: `https://v0-rebuild-bt43es47h-darwoft-subniche.vercel.app/profile`
- My Stuff: `https://v0-rebuild-kecmxlvum-darwoft-subniche.vercel.app/my-stuff`

## Purpose

Profile is the public identity and trust surface. My Stuff is the owner inventory-management surface.

## Observed Profile Layout

- User avatar, handle, edit/settings/share controls.
- Location, member-since date, bio, verification badges, linked account chips, and stats.
- Tabs: `Collections`, `For Sale/Trade`, `Looking For`, `Activity`.
- Collections tab shows image mosaics with visibility status, item count, and value.
- For Sale/Trade tab shows image-forward item cards with price and trade indicator.

## Observed My Stuff Layout

- Title `My Stuff` with `Items` and `Collections` tabs.
- Stat cards: total, for sale, for trade, uncategorized.
- Toolbar: collection dropdown, independent `For Sale` and `For Trade` pill toggles, item search, sort dropdown, grid/list density controls.
- Item cards include collection chip, sale/trade/private status, price, recency, and item actions.
- Dev changelog explicitly states that `For Sale` and `For Trade` are independent booleans per item and can both be true.

## Observed Interactions

- Profile tabs swap visible card sets without navigation.
- My Stuff collection dropdown appears to filter by collection.
- My Stuff status toggles filter by independent sale/trade booleans.
- Grid view control cycles density; list view toggle switches presentation.
- Item action menu and collection chip dropdown are present but not expanded in this pass.

## States Observed

- Profile collections.
- Profile for sale/trade.
- Profile looking-for.
- Profile activity.
- My Stuff items grid.
- My Stuff list view.
- My Stuff collections tab.
- My Stuff collection filter open.
- My Stuff toolbar with independent status toggles.

## Product Rules Implied

- Public profile and owner inventory are different surfaces and should not be collapsed into one route.
- A single item may be for sale, open to trade, both, private, or uncategorized.
- Collections have visibility states such as `Public` and `Link Only`.
- Verification and linked-account state are core trust signals on profile.

## Acceptance Criteria Candidates

- Profile tabs switch between collections, sale/trade, wants, and activity.
- My Stuff shows status counts and item cards.
- Sale and trade filters work independently.
- Collection assignment is visible on each item.
- Grid/list controls do not lose active filters.

## Open Questions

- Which My Stuff item actions are MVP: edit, duplicate, archive, delete, mark sold, adjust trade interest?
- Should public profile display "Looking For" from saved trade interests, want-list items, or both?
- Are `Link Only` collections shareable outside the app?
