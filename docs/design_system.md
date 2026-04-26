# SubNiche Design System v1

## Design objective

SubNiche should feel like a premium, focused marketplace for enthusiasts. It should not feel like a generic SaaS dashboard, a bargain classifieds site, or a crypto/community hype product.

The design should communicate:

- taste
- trust
- specificity
- quality
- community
- usefulness
- modern marketplace behavior

## Brand feel

Desired feel:

- premium but not precious
- confident but not loud
- community-oriented but not childish
- practical but not boring
- image-forward
- editorial
- club-like
- high-signal

Avoid:

- generic SaaS gradients
- too much blue
- excessive rounded bubbly UI
- cluttered marketplace noise
- dark-pattern urgency
- cheap e-commerce discount language
- overly playful social-network UI

## Visual principles

### 1. Image-led

Many niche items are visually important. Listing cards, collection cards, and profile pages should respect imagery.

### 2. Strong hierarchy

Users should quickly understand:

- what item is being shown
- status: for sale, for trade, in collection, wishlist
- price or trade intent
- niche/category
- seller/user context
- community context where relevant

### 3. Consistent surfaces

Cards, panels, modals, filter drawers, and profile blocks should feel from the same system.

### 4. Calm density

The product can show rich information, but it should not feel noisy.

### 5. Mobile is important

Core marketplace browsing, listing creation, and messaging should work well on mobile.

## Typography

Use a clean sans-serif system.

Suggested hierarchy:

- Display / hero title
- Page title
- Section title
- Card title
- Body text
- Metadata / caption

Rules:

- Do not use too many type sizes.
- Use weight and spacing for hierarchy before adding decorative styles.
- Listing cards should prioritize item title, price/trade status, and key metadata.

## Spacing

Use a consistent spacing scale:

- 4px
- 8px
- 12px
- 16px
- 24px
- 32px
- 48px
- 64px

Rules:

- Card interiors should not feel cramped.
- Marketplace grids should have enough breathing room.
- Forms should feel deliberate and easy to complete.
- Mobile spacing should preserve clarity without wasting vertical space.

## Radius

Use moderate radius.

Suggested:

- small controls: 8px
- cards: 12px–16px
- large panels/modals: 16px–24px

Avoid overly bubbly radius unless intentionally used in a specific component.

## Borders and shadows

Preferred:

- subtle borders
- soft shadows
- hover elevation only where useful

Avoid:

- heavy drop shadows
- high-contrast borders everywhere
- inconsistent card treatments

## Color

The palette should be restrained.

Use:

- neutral background
- strong foreground text
- muted secondary text
- subtle borders
- one primary accent
- status colors sparingly

Status color usage:

- For Sale
- For Trade
- In Collection
- Wishlist / Wanted

Status indicators should be clear but not visually chaotic.

## Buttons

### Primary button

Used for main action:

- Create listing
- Send offer
- Save listing
- Join community
- Start trade

### Secondary button

Used for alternate actions:

- View profile
- Save draft
- Edit
- Learn more

### Ghost button

Used for low-emphasis actions:

- filters
- tab-like controls
- contextual actions

Rules:

- Do not create new button styles per page.
- CTA hierarchy should be obvious.
- Avoid too many competing primary buttons.

## Cards

Cards are central to the product.

Required card types:

- ListingCard
- CollectionCard
- CommunityCard
- UserCard
- TradeMatchCard
- OfferCard

General card rules:

- strong image area when relevant
- clear title
- concise metadata
- status/tags in predictable locations
- hover state on interactive cards
- no one-off page-specific card styling unless promoted into the design system

## Navigation

Expected MVP navigation:

Desktop:

- sidebar or persistent navigation
- Home
- Market
- Trade
- Communities
- Collections
- Inbox
- Create Listing
- Profile / account

Mobile:

- bottom nav and/or drawer
- prioritize Home, Market, Create, Inbox, Profile
- avoid cramming every desktop item into bottom nav

## Marketplace UI

Marketplace page should support:

- grid of listings
- search
- filters
- sort
- status filtering
- trade mode or trade-specific entry point
- mobile filter drawer
- listing card consistency

## Profile UI

Profile should surface:

- identity
- avatar/banner
- bio
- niche-specific context
- collections
- listings
- wishlist
- trust/social proof placeholders

## Design audit decisions

This section records the canonical design direction after reviewing the V0 reference archive. The V0 exports are reference material only; production implementation should rebuild these patterns cleanly through shared components.

### Winning visual language

Use the dark navy/gold marketplace system as the canonical baseline.

Canonical direction:

- dark navy-tinted neutral background
- elevated but quiet card surfaces
- warm gold primary accent
- restrained status colors
- image-led item and collection surfaces
- editorial, enthusiast-native composition

Avoid:

- generic SaaS blue/purple gradients
- light dashboard styling as the primary product mode
- one-off page palettes
- overly bubbly social-app UI
- decorative surfaces that do not carry product information

### Color tokens

Use a restrained token set inspired by the V0 references:

- background: deep navy neutral
- surface/card: slightly lighter navy neutral
- border: subtle cool neutral
- foreground: high-contrast near-white
- muted foreground: cool gray
- primary/accent: warm gold
- success: green, for successful/verified/available states only
- info: blue, for informational states only
- warning: amber, for pending/attention states only
- destructive: red, for destructive actions only

Status colors should never overpower item images. Most status chips should use neutral surfaces with small color accents, not loud filled badges everywhere.

### Typography

Use a clean sans-serif as the default product font. A restrained serif display accent may be used for logged-out editorial moments, but it should not appear in dense app surfaces.

Canonical hierarchy:

- display: logged-out hero and major marketing statements only
- page title: one per page
- section title: modules and page bands
- card title: item, collection, community, user, offer
- metadata: compact supporting details
- microcopy: labels, helper text, timestamps

Rules:

- app pages should favor scan speed over dramatic type
- card titles should remain compact and truncate predictably
- metadata should be consistent across cards
- do not introduce new type scales per page

### Layout and navigation

Use a persistent desktop sidebar for authenticated app navigation. The V0 references repeatedly rely on sidebar-based orientation, and this matches the app-like marketplace workflow.

Desktop navigation:

- Home
- Market
- Trade
- Communities
- Collections
- Inbox
- Create Listing
- Profile/account

Mobile navigation:

- prioritize Home, Market, Create, Inbox, Profile
- use drawers for secondary navigation and filters
- do not force every desktop item into the bottom nav

Page layout rules:

- authenticated pages use a shared app shell
- marketplace, trade, profile, collections, and inbox must share spacing and surface rules
- dense pages may use compact controls, but should not feel cramped
- filters and side panels should push or overlay predictably, not resize content unpredictably

### Cards

The canonical card style is:

- 8px to 12px radius for dense marketplace cards
- 12px to 16px radius for larger editorial/profile/collection cards
- subtle border
- dark surface
- strong image area where relevant
- concise metadata under the title
- status chips in predictable positions
- hover border/accent, not heavy shadows

Listing cards should win over generic product cards. A listing card must support:

- image
- title
- subtitle or matched search context
- price when saleable
- trade indicator when tradeable
- status chips
- seller or community context when relevant
- saved/favorite affordance
- grid and list density variants

### Buttons and controls

Use one button system across the app.

Canonical variants:

- primary: high-confidence actions such as Create listing, Make offer, Send message, Start trade
- secondary/outline: alternate actions such as Edit profile, View profile, Save draft
- ghost: low-emphasis actions, tabs, menus, contextual controls
- icon: compact tool actions with accessible labels and tooltips
- destructive: delete/remove/cancel destructive actions only

Do not create page-specific button styles. Use icons for compact tools where a standard icon exists.

### Marketplace filters

Use a filter sidebar on desktop and a filter drawer on mobile. The V0 market reference has the strongest pattern here: filters, active chips, sort, density controls, and listing grid belong together.

Market and Trade can route to the same marketplace surface. Market opens standard browsing; Trade opens the shared shell with trade mode enabled, tradeable inventory emphasized, and trade match semantics visible by default.

Canonical marketplace controls:

- search
- category/subcategory filters
- brand or niche-specific attributes
- condition
- price range
- status filters
- trade availability
- sort
- grid density
- active filter chips

Filters should be designed as a reusable system because later niches will have different attribute sets.

### Profile header

Use the profile reference as the winner for identity and trust. Profiles should feel like a credibility layer, not a generic account page.

Canonical profile header:

- avatar
- display name/handle
- location and member-since metadata
- short bio
- verification indicators
- linked account indicators
- counts for items, collections, and trades
- profile actions grouped on the right or under the header on mobile

Profile tabs:

- Collections
- For Sale / Trade
- Looking For
- Activity
- About, if needed later

### Trade language

Trade UI must distinguish match types clearly.

Canonical labels:

- True Match: both users' explicit criteria align
- Inbound Interest: another user wants something from you, but your criteria may not be satisfied
- Suggested: weaker recommendation, future only

Do not label suggestions as matches. Trade cards should show both sides of the potential exchange and any cash adjustment clearly.

### Homepage visual language

Logged-out homepage should be editorial and image-led, not a SaaS landing page. It should explain the niche-first marketplace concept through marketplace, collection, trade, trust, and community examples.

Logged-in home should be practical and app-like:

- activation checklist
- recommended listings
- watchlist or saved searches
- collection prompts
- community prompts
- trade opportunities

### Forms

The add-item reference establishes the right product model: one item can serve multiple contexts. Creation UI must support multi-status behavior.

Canonical add-item flow:

- choose one or more statuses first
- gather title, subtitle, description, images
- gather niche/category attributes
- show sale fields only when for sale
- show trade fields only when for trade
- show collection placement when in collection
- show wanted/wishlist fields when wanted
- provide a review/save step

Do not model item status as a single exclusive visual state.

## Collection UI

Collections should feel browsable and identity-rich, not just utilitarian folders.

Collection cards should show:

- title
- cover images
- owner
- item count
- short description or theme
- engagement/context when available

## Forms

Listing creation and profile editing should feel lightweight but capable.

Rules:

- show only relevant fields when possible
- group fields logically
- avoid overwhelming users early
- support draft-like mental model
- make trade setup feel optional but valuable

## Empty states

Empty states should educate and activate.

Examples:

- no listings yet
- no trade matches
- no collection items
- no communities joined

Empty states should include one clear next action.

## Copy tone

Tone should be:

- direct
- confident
- understated
- niche-aware

Avoid:

- “unlock the power of…”
- generic SaaS phrasing
- childish hype
- excessive exclamation points

## Current design-system task

Because prior v0 branches drifted, all future implementation should normalize to this design system. If a v0 reference conflicts with this document, the design system wins unless the product owner explicitly updates the system.
