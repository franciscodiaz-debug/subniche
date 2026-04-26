# Page Inventory

This document defines the expected pages and major surfaces for the SubNiche MVP.

## Public / logged-out pages

### Logged-out homepage

Purpose:

- explain SubNiche
- show why niche-first marketplace matters
- introduce trading
- introduce collections
- introduce trust/context
- drive signup

Key sections:

- hero
- marketplace preview
- collections showcase
- trading explanation
- trust section
- community/niche explanation
- CTA

### Public marketplace

Purpose:

- allow browsing of public listings
- show inventory value
- expose niche/category filters

May have limited interaction until login.

### Public listing detail

Purpose:

- show listing detail
- prompt login/signup for contact/offer actions

### Public profile

Purpose:

- show seller/collector context
- show listings, collections, wishlist, and trust placeholders where public

### Explore niches

Purpose:

- show available niche markets
- help users choose where they belong

## Authenticated pages

### Logged-in home

Purpose:

- orient user
- show relevant activity
- prompt activation
- surface listings/communities/trade opportunities

Important elements:

- activation checklist
- recommended listings
- new/trending listings
- community prompts
- trade setup prompts

### Marketplace / Market

Purpose:

- primary browse/search/filter experience

Required:

- listing grid
- filters
- search
- sort
- category/status filters
- trade mode entry point
- mobile filter drawer

### Trade

Purpose:

- show trade-relevant inventory and matches

This may route to the marketplace screen with trade mode enabled.

Required:

- true matches
- inbound one-way interest
- possibly recommendations later, clearly labeled

### Listing detail

Purpose:

- evaluate an item
- understand seller context
- contact or propose offer/trade

Required:

- image gallery
- item attributes
- price/status
- seller card
- trade interest display if relevant
- action panel

### Create listing / Add item

Purpose:

- let user add item to marketplace, collection, trade, or wishlist context

Required:

- item status selector
- title/details
- images
- category/filter attributes
- price if for sale
- trade interests if for trade
- collection placement if in collection
- wishlist/wanted behavior if wishlist
- review/save step

### Edit listing

Same as create listing but populated with existing item data.

### Profile

Purpose:

- user identity and trust surface

Required:

- profile header
- bio/context
- listings
- collections
- wishlist
- social/verification placeholders

### Collections

Purpose:

- show user-created collections

Required:

- collection grid
- collection detail
- item cards
- creation/edit flow eventually

### Wishlist / Wanted

Purpose:

- show desired items

Can initially be part of profile/collections rather than a standalone page.

### Inbox

Purpose:

- message users
- handle offers/trade discussions

Required:

- thread list
- message thread
- offer context
- basic offer state

### Offers

May be integrated into Inbox initially.

Purpose:

- view active offers
- accept/decline/counter
- see trade/cash components

## Community pages

### Communities index

Purpose:

- show joined/recommended communities

### Community overview

Purpose:

- introduce specific community

Required:

- description
- membership state
- rules/context
- recent listings/posts

### Community market

Purpose:

- show listings available in that community context

### Community discussion

MVP may use placeholder or light threaded posts.

### Community members

Optional MVP.

## Settings pages

### Account settings

- email
- password/auth
- notifications

### Profile settings

- avatar
- display name
- bio
- social links

### Privacy/visibility settings

Future or lightweight MVP.

## Audit decisions

The design-system audit confirms the following page-level decisions before app implementation starts.

### Canonical first local build route set

The first local build should prioritize an authenticated prototype shell and core marketplace flows.

Build order after this audit:

- app shell
- core components
- mock data
- marketplace
- listing detail
- add item
- profile and collections
- logged-out homepage
- logged-in homepage
- communities
- inbox/offers/trade
- design polish

### Logged-out homepage

Keep it editorial and image-led.

Required sections:

- hero with concrete marketplace/product imagery
- marketplace preview
- collections/trust explanation
- trade explanation
- community/niche explanation
- final CTA

Do not make it a generic SaaS hero. The first viewport should communicate SubNiche as an enthusiast marketplace, not a broad productivity tool.

### Logged-in home

Use as an activity and activation dashboard.

Required modules:

- activation checklist
- recommended listings
- new/trending listings
- saved searches or watchlist
- collection prompt
- trade prompt
- community prompt

This page should help a user decide what to do next.

### Marketplace / Market

This is the first full page implementation after shell/components/mock data.

The top-level Market and Trade routes may share the same marketplace shell. Market opens normal browse mode. Trade opens the same shell with trade mode enabled by default.

Canonical layout:

- page header
- market tabs
- filter control row
- active filter chips
- sort and density controls
- responsive listing grid
- desktop filter sidebar
- mobile filter drawer

Marketplace must support both grid and list/card density patterns, but implementation can start with grid if density switching is ready.

### Trade

Trade may share the market shell but must have distinct semantics.

Required sections:

- selected tradeable item control
- True Match cards
- Inbound Interest cards
- empty state for no matches
- clear labels explaining match type

Do not merge True Match, Inbound Interest, and Suggested into one vague match concept.

### Listing detail

Canonical layout:

- image gallery
- item title/subtitle
- price and status chips
- niche/category/condition attributes
- seller summary/trust card
- trade interest panel if relevant
- action panel with contact, offer, trade, save
- related listings

Public listing detail can show disabled/contact-gated actions later, but the first local build can assume a signed-in prototype context.

### Add item / create listing

Canonical layout:

- status selector first
- item basics
- image upload placeholder
- category and attributes
- sale fields conditional on For Sale
- trade fields conditional on For Trade
- collection placement conditional on In Collection
- wanted fields conditional on Wishlist / Wanted
- review/save step

The add-item flow should preserve the product rule that one item can live in multiple marketplace contexts.

### Profile

Canonical layout:

- profile header
- verification/linked account trust pills
- stats
- profile tabs
- collection cards
- listing cards
- wanted items
- activity feed

Profile should be a trust/identity surface, not merely a settings page.

### Collections

Canonical layout:

- collection grid
- collection detail header
- item grid/list
- visibility state
- optional notes or description

Collections can initially be grouped into profile/my-stuff flows, but shared components should make a standalone collection page straightforward.

### Communities

Canonical layout:

- communities index
- community overview
- community market surface
- community member/post placeholders

Listings should be published into a community context, not duplicated per community.

### Inbox / offers

Canonical layout:

- conversation list
- active thread
- participant trust panel
- listing or offer context
- offer state actions

Mobile should use a stack: thread list, conversation, then detail panel through back navigation or drawer.

## Suggested build order

1. App shell
2. Core components
3. Mock data
4. Marketplace
5. Listing detail
6. Add item flow
7. Profile/collections
8. Logged-out homepage
9. Logged-in homepage
10. Communities
11. Inbox/offers/trade
