# Page: Market and Trade

## URL

`https://v0-rebuild-987hxcadp-darwoft-subniche.vercel.app/`

## Purpose

Market provides buy/sell discovery. Trade provides match discovery for items with trade interest. The prototype treats them as adjacent modes, not as identical listing grids.

## Observed Layout

The page uses the same dark app shell and centered search. Primary title is `Market`. A large tab pair switches between `For Sale` and `Trade`.

For Sale state:

- Filter drawer/rail with category, brand, condition, price histogram slider, and `Open to trade`.
- Sort dropdown defaults to `Newest first`.
- Grid-density control defaults to `Comfortable`.
- Listing grid shows image, title, subtitle, price, location, and community chips.
- Active filters appear as chips near the grid, with `Clear all`.

Trade state:

- `For` item selector controls which owned item to match against.
- Cards contain normal listing metadata plus a trade-match strip.
- True matches use copy like `Trade match for your Fender American Pro II Stratocaster`.
- Inbound interest uses copy like `Interested in your Strymon BigSky Reverb`.
- Match score badges are shown on cards.

## Observed Interactions

- The market deployment initially shows an onboarding/tour spotlight overlay over the `For Sale`/`Trade` tabs. `Skip tour` dismisses it.
- Opening filters slides/expands a left filter panel.
- Selecting `Electric Guitars` increments the filter count, expands subcategories, and reveals brand filters.
- Active filter chip appears and can be cleared.
- Trade tab changes URL to `/trade`.
- Trade `All items` dropdown opens a menu of owned items with match counts and "perfect" counts.
- Grid-density and sort controls are dropdown/popup controls, but their option lists were not fully exercised in this pass.

## States Observed

- For Sale default.
- Filter panel open.
- Category filter selected.
- Trade default.
- Trade item selector open.

## Product Rules Implied

- Market filters are taxonomy-aware: selecting a category changes available subcategories and brands.
- Trade mode is scoped to the user's owned items.
- True matches and inbound interest should remain distinguishable.
- Inbound interest should not be labeled as a full match.

## Acceptance Criteria Candidates

- Selecting a market category adds an active filter chip and expands category-specific controls.
- `Clear all` removes active filters.
- Trade tab shows match cards with selected owned-item context.
- Trade item selector lists owned items with match counts.
- Cards visually distinguish `Trade match for your...` from `Interested in your...`.

## Open Questions

- Does the trade tab belong under `/trade`, `/market?tab=trade-matches`, or both?
- What exact score thresholds produce match badges?
- Which filters are required in MVP, and which are prototype polish?
- The user noted trade interest setting functionality is incomplete; production should not infer final trade-interest setup rules from this page alone.
