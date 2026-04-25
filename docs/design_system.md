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
