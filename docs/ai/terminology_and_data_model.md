# Terminology and Data Model

This file defines core terms. Use these terms consistently in code, docs, and UI unless a deliberate product copy variation is approved.

## Account

A single user account with one permanent username/handle.

The permanent username is stable and should remain visible somewhere on profile/listing surfaces. It is not replaced by niche-specific display names.

## Niche

A top-level product context such as guitar gear, motorcycle gear, coins, audiophile gear, etc.

For MVP:

- items live inside one niche,
- listings live inside one niche,
- collections live inside one niche,
- wishlist items live inside one niche,
- search and marketplace browse are niche-scoped,
- formal offers are same-niche only.

## Niche profile

A user's public presentation inside a niche.

A niche profile may have:

- display name,
- avatar,
- bio,
- subheading/tagline,
- niche-specific visible items/listings/collections/wishlist items.

Niche profile does not change the user's permanent username/account identity.

## Item

Umbrella term for objects users add to SubNiche.

Do not use `listing` as the umbrella term.

## Owned item

An item the user currently owns.

An owned item can be:

- private personal item,
- in a collection,
- for sale,
- for trade,
- for sale + for trade,
- pending,
- archived,
- deleted.

## Wishlist item

An item the user does not own but is looking for.

Wishlist items are:

- public demand signals by default,
- allowed in collections,
- structured by the same niche taxonomy,
- not trade interests,
- not active listings,
- not eligible for formal offers in MVP.

Do not use `wanted item` as a product term.

## Listing

An owned item made available in the marketplace for sale, trade, or both.

For MVP, all active listings are public within their niche marketplace.

A listing may be:

- for sale only,
- for trade only,
- for sale + for trade.

One owned item can have only one active listing.

### Price and value terms

Active listings require value context:

- `asking price` applies to for-sale listings.
- `stated trade value` applies to trade-only listings.
- for MVP, a listing that is both for sale and for trade uses its asking price as its trade value.

A stated trade value is the owner's declared valuation for trade context. It is required to publish a trade-only listing, but it is not an official appraisal and does not mean the item is for sale.

## Collection

A niche-specific grouping of owned items and/or wishlist items.

For MVP:

- one collection visibility state applies to the collection and its items,
- an item can belong to only one collection at a time,
- collections can be private, link-only, or public,
- collections can be deleted but not archived.

Collections are identity/context surfaces, not marketplace listings by themselves.

## Trade interest

Structured criteria attached to a for-trade listing that describe what the owner would accept in trade.

A trade interest:

- must include at least category or subcategory,
- may include selected attributes and value range,
- may be broad or narrow,
- does not require every item/listing required attribute,
- is not the same as a wishlist item.

## Match direction

Match direction describes whose trade interests are being satisfied.

### 2-way match

Both users' items are criteria-complete against each other's trade interests.

### 1-way match

Your item is criteria-complete against another user's trade interest, and you choose to manually express interest in their item.

The reverse case is not promoted in the Trade / Matches surface.

## Criteria satisfaction

Criteria satisfaction describes whether selected trade-interest criteria were met.

### Criteria-complete

The candidate item meets 100% of selected trade-interest criteria.

### Possible Match

The candidate item appears relevant but selected criteria data is missing or pending validation.

### Not a match

The candidate item has known data that fails one or more selected criteria.

### Near Miss

A known-failed candidate that may still be adjacent or interesting. Near Misses are post-MVP and should not appear in MVP match surfaces.

## Deprecated terms

Do not use:

- `True Match` — use `2-way match`
- `Full Match` — use `criteria-complete` or `meets all selected criteria`
- `One-way Match` — use `1-way match`
- `Wanted item` — use `wishlist item`

## Offer

A formal proposal sent inside a message thread.

Offer types:

- cash offer,
- trade offer,
- counter-offer.

Formal offers do not process payment or fulfillment in MVP.

## Pending

Manual owner-controlled availability state.

Pending means the item may be held/unavailable for new formal offers. It does not complete, cancel, decline, or otherwise resolve offers by itself.

## Archive

Owner-retained private history state for items/wishlist items the user no longer actively owns or wants.

Archived owned items are removed from active listings, search, matches, and active collections.

## Delete

Destructive removal from active/product-facing references.

Deleted item/wishlist/collection references in messages/offers should show removed placeholders rather than old snapshots.
