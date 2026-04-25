# Component Inventory

This document defines the shared components that should exist before page-level implementation becomes too large.

The goal is to prevent design drift and avoid rebuilding the same patterns differently across pages.

## Layout components

### PageShell

Global page wrapper that handles:

- max width
- background
- page padding
- responsive layout
- sidebar/top nav accommodation

### AppSidebar

Desktop navigation shell.

Expected items:

- Home
- Market
- Trade
- Communities
- Collections
- Inbox
- Create Listing
- Profile/account

### MobileNav

Mobile navigation pattern.

Should prioritize the highest-frequency actions.

### SectionHeader

Reusable section title/subtitle/action header.

Used for:

- marketplace sections
- collection sections
- profile sections
- homepage modules

### EmptyState

Reusable empty state with:

- title
- body
- optional icon/visual
- primary action
- optional secondary action

### LoadingState

Reusable loading skeleton/spinner pattern.

## Core UI components

### Button

Variants:

- primary
- secondary
- ghost
- destructive, if needed

### Card

Base card surface used by higher-level cards.

### Badge

Used for:

- item status
- category
- condition
- community role
- verification placeholder

### Tabs

Used for:

- profile sections
- community sections
- marketplace/trade modes
- collections/listings/wishlist

### Avatar

Used for users and community profiles.

### Modal

For focused tasks.

### Drawer

Especially important for mobile filters and mobile creation steps.

### Dropdown / Menu

Used for item actions, profile actions, and filters.

### FormField

Reusable label/input/error/help text wrapper.

## Marketplace components

### ListingCard

Displays item in marketplace grids.

Should support:

- image
- title
- price
- trade status
- condition
- location, if available
- seller mini-context
- saved state
- community/niche context where relevant

### ListingGrid

Responsive grid wrapper.

### ListingCarousel

Horizontal display for homepage/profile modules.

### FilterPanel

Desktop filter sidebar.

### MobileFilterDrawer

Mobile filter experience.

### SearchBar

Search input with optional category/context.

### SortControl

Sort dropdown.

### StatusBadge

Status indicators:

- For Sale
- For Trade
- In Collection
- Wishlist / Wanted

## Listing/detail components

### ListingImageGallery

Supports multiple listing images.

### ListingDetailHeader

Main listing title, price/status, metadata.

### SellerSummaryCard

Compact seller/profile trust context.

### ListingActionPanel

Primary CTAs:

- contact
- make offer
- propose trade
- save
- share

### RelatedListings

Reusable related listing module.

## Profile components

### ProfileHeader

Shows:

- avatar
- display name
- handle
- niche identity/context
- bio
- location, if relevant
- verification/social proof placeholders

### ProfileStats

Counts for:

- listings
- collections
- trades/sales, future
- followers/following, future

### VerificationBadges

Linked accounts and future marketplace/social proof.

### ProfileTabs

Switches between:

- Listings
- Collections
- Wishlist
- About
- Activity, future

## Collection components

### CollectionCard

Shows:

- cover images
- collection title
- owner
- item count
- short description

### CollectionGrid

Grid wrapper.

### CollectionPreviewStrip

Small image strip for collection contents.

### CollectionDetailHeader

Header for collection detail page.

## Trading components

### TradeInterestCard

Displays what a user wants in exchange for an item.

### TradeMatchCard

Displays a potential trade match.

Must distinguish:

- true match
- inbound interest
- recommendation, future

### TradeMatchScore

Optional visual ranking/quality indicator.

### OfferComposer

Allows user to compose:

- cash offer
- trade offer
- cash + trade offer

### OfferThread

Conversation/offer history.

### OfferSummaryCard

Compact view of current offer state.

## Community components

### CommunityCard

Displays community overview.

### CommunityHeader

Shows community name, description, membership state, owner/mod context.

### CommunityTabs

Tabs:

- Overview
- Market
- Discussion
- Members, optional

### CommunityMarketContext

Indicates when browsing within a specific community market.

## Homepage components

### HeroSection

For logged-out marketing homepage.

### TrustSection

Explains trust/context.

### CollectionsShowcase

Shows curated collections.

### EducationInterstitial

Explains key product concepts.

### ActivationChecklist

For logged-in users.

Checklist items:

- complete profile
- add 3 items
- set 3 trade interests

## Admin/future components

Not MVP priority:

- moderation queue
- reported listing card
- community admin panel
- user management table
