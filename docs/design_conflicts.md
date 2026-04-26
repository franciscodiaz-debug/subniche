# Design Conflicts

This document resolves the main design conflicts found while reviewing the Project Brain docs and V0 reference archive.

The outcome is intentionally documentation-first. No production components are imported from V0 in this branch.

## Summary

SubNiche should use a dark, image-led, premium marketplace system with a persistent app shell, consistent card language, restrained gold accent color, clear trade semantics, and profile/collection surfaces that communicate trust and enthusiast identity.

Canonical design tone: premium, understated, enthusiast-native, community-oriented, and high-signal. Avoid generic SaaS tone.

## Decisions

### Which card style wins?

The marketplace listing card style wins.

Use:

- dark card surface
- subtle border
- 8px to 12px radius for dense cards
- strong 4:3 image area
- compact title and subtitle
- price/status row
- trade indicator where relevant
- community chips where relevant
- hover border/accent

Do not use unrelated marketing-card styles for marketplace, profile, collection, trade, or inbox surfaces. Larger collection/profile cards can use slightly more breathing room, but they should still feel related to listing cards.

### Which button style wins?

The shared shadcn-like button system wins, with product-specific restraint.

Canonical variants:

- primary
- secondary/outline
- ghost
- icon
- destructive

Primary buttons should be reserved for the main action on a surface. Dense controls should use icon buttons with accessible labels where the icon is familiar.

### Which nav model wins?

The authenticated desktop sidebar wins.

Use:

- persistent desktop sidebar
- route-aware active states
- collapsed mode only when side panels need room
- mobile nav with bottom-priority actions and drawer access to secondary pages

Do not use page-specific headers as the main navigation model.

### Which mobile pattern wins?

Mobile should use a bottom-priority navigation plus drawers for secondary tasks.

Use:

- bottom nav for Home, Market, Create, Inbox, Profile
- drawer for filters
- drawer or menu for secondary navigation
- stacked inbox flow with back navigation

Do not cram every desktop nav item into mobile bottom navigation.

### Which listing card layout wins?

The V0 `DiscoverListingCard` pattern wins as the starting point.

Required card content:

- image
- title
- subtitle or matched search context
- price
- trade indicator
- status chips
- seller or community context when relevant
- saved/favorite action

Support both grid and list variants, but build the grid variant first.

### Which profile header pattern wins?

The V0 profile reference wins.

Required header content:

- avatar
- display name/handle
- location
- member-since metadata
- short bio
- verification indicators
- linked account indicators
- item/collection/trade stats
- edit/share/settings actions when viewing own profile

This pattern supports the product principle that profiles create marketplace trust.

### Which marketplace filter pattern wins?

The market reference filter model wins.

Use:

- desktop filter sidebar
- mobile filter drawer
- active filter chips
- sort control
- grid density control
- category and subcategory filters
- price range
- condition
- brand or niche-specific filters
- status/trade availability

Filters must be reusable because future niches will require different attribute sets.

### Which collection card/showcase pattern wins?

The image-led collection showcase pattern wins.

Use:

- strong cover image or image mosaic
- collection title
- owner context
- item count
- short theme/description
- visibility or community context when relevant

Do not treat collections as plain folders or text-only lists. Collection cards should feel related to listing cards, but with more room for identity and curation.

### Which typography hierarchy wins?

The restrained product hierarchy wins.

Use:

- display type only for logged-out editorial moments
- one page title per page
- section titles for modules and page bands
- compact card titles
- consistent metadata and caption styles
- microcopy for labels, helper text, and timestamps

Do not introduce new type scales per page. App surfaces should optimize for scan speed before dramatic type.

### Which spacing, radius, and shadow rules win?

The shared dense-marketplace surface rules win.

Use:

- the 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px spacing scale
- 8px to 12px radius for dense marketplace cards and controls
- 12px to 16px radius for larger collection, profile, and editorial cards
- subtle borders
- hover border/accent states
- soft shadows only when depth helps comprehension

Avoid oversized rounded cards, heavy shadows, inconsistent borders, and page-specific spacing systems.

### Which homepage visual language wins?

The logged-out homepage should use the editorial, image-led V0 direction, but with cleaner canonical components.

Use:

- real product/marketplace imagery
- marketplace preview
- collections/trust section
- trade explanation
- community/niche explanation
- clear CTA

Avoid:

- generic SaaS hero copy
- abstract gradients
- overly broad marketplace claims
- decorative cards with no product information

### Which trade model wins?

The explicit match-type model wins.

Market and Trade can share the same marketplace surface. The top-level Market route should open normal marketplace browsing. The top-level Trade route should open the same shell with trade mode enabled and trade semantics visible by default.

Canonical labels:

- True Match
- Inbound Interest
- Suggested

Only call something a True Match when both users' explicit trade criteria align. Inbound Interest and Suggested must remain visually and verbally distinct.

### Which add-item model wins?

The multi-status add-item flow wins.

An item can be:

- In Collection
- For Sale
- For Trade
- Wishlist / Wanted
- In Collection + For Sale
- In Collection + For Trade
- For Sale + For Trade

Implementation should not force item status into one exclusive enum unless the data model later proves that necessary.

### Which community model wins?

Communities are publishing contexts, not separate listing silos.

A listing can appear in:

- public market
- one or more community markets
- profile context
- collection context

Do not duplicate listings per community.

### Which V0 page layouts are discarded?

Discard V0 layouts that:

- use generic SaaS hero sections
- rely on abstract gradients instead of real product imagery
- create page-specific card systems
- duplicate navigation inside individual pages
- treat trade matches, inbound interest, and suggestions as the same concept
- make item status mutually exclusive when the product needs multi-status items
- present community markets as duplicate marketplaces
- use decorative cards without product information

### Which V0 ideas are preserved?

Preserve these V0 ideas:

- dark premium marketplace tone
- image-led listing and collection surfaces
- authenticated desktop sidebar shell
- mobile bottom-priority navigation
- desktop filter sidebar and mobile filter drawer
- active filter chips, sorting, and density controls
- profile header as trust surface
- editorial logged-out homepage
- multi-status add-item flow
- explicit trade match language
- community publishing context

## Open implementation questions

These do not block the next branch, but should be answered during app-shell, mock-data, or page implementation.

- Should the first local prototype be dark-only, or include a light theme token set from the start?
- Should Collections live under Profile first, or have a first-class top-level route immediately?
- Which niche is the first seeded mock world: guitars/music gear only, or guitars plus one secondary niche?
- Which profile trust signals are real MVP fields versus visual placeholders?

## Branch guidance

Next branches should follow this order:

- `feature/app-shell`: app shell, routing, global styles, navigation, base layout
- `feature/core-components`: shared components listed in `component_inventory.md`
- `feature/mock-data`: stable fake data for users, listings, collections, communities, trade interests, offers, and messages

No page branch should invent a new visual convention that conflicts with these decisions.
