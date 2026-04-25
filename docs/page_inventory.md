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
