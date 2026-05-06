# MVP Scope

This file defines what is included in the SubNiche MVP and what is explicitly deferred.

## MVP includes

### Multi-niche foundation

- Architecture supports multiple niches.
- Initial launch will likely seed roughly three niches.
- Each niche has its own taxonomy, marketplace, profiles, collections, listings, wishlist items, and search context.
- Users do not see results from outside the niche they are currently in unless a future global search surface is intentionally added.

### Niche-specific profiles

- One account and one permanent username.
- Different display name, avatar, bio, and subheading per niche.
- Users can view a user's different niche profiles, but only for niches where that user has public-facing activity.

### Items and listings

- Users can add owned items.
- One owned item can have only one active listing.
- Active listing states:
  - for sale only,
  - for trade only,
  - for sale + for trade.
- All active listings are public inside their niche marketplace in MVP.
- There are no community-only or multi-context listings in MVP.
- Publishing requirements by listing state:
  - `for sale only` requires an asking price.
  - `for trade only` requires a stated trade value.
  - `for sale + for trade` requires an asking price; for MVP, the asking price also serves as the trade value.
- A for-trade listing cannot be actively published for trade without value context.

### Collections

- Users can create collections within a niche.
- Collections can contain owned items and wishlist items.
- A collection can be private, link-only, or public.
- An owned item or wishlist item can belong to only one collection at a time in MVP.
- Collections support delete only, not archive.
- Collection comments are not in MVP.

### Wishlist items

- Wishlist items represent things the user does not own but is looking for.
- Wishlist items are public by default unless made private or placed into a private collection.
- Wishlist items use the same niche taxonomy and structured attributes as owned items/listings.
- Wishlist items are not trade interests.
- Wishlist items do not unlock formal offers in MVP.

### Trade interests and trade matching

- Users can define one or more trade interests for for-trade listings.
- Trade interests are structured criteria describing what the user would accept in trade.
- Trade matching is required for MVP.
- Only active for-trade listings are eligible for trade matching.
- Match direction terms:
  - `2-way match`
  - `1-way match`
- Criteria satisfaction terms:
  - `criteria-complete`
  - `Possible Match`
  - not a match
- Near Misses are post-MVP.

### Messaging and formal offers

- Messaging is included.
- Message threads are item/listing/wishlist/collection-item-context-specific.
- Formal offers and counter-offers are included inside messaging threads.
- For-sale listings support simple cash offers.
- For-trade listings support trade offers only when valid match rules are satisfied.
- No payment processing, escrow, tax, shipping labels, or checkout in MVP.

### Super-admin control panel

MVP includes a true in-app, desktop-only super-admin/product-owner control panel for:

- managing niches,
- managing categories and subcategories,
- managing attributes,
- managing allowed values,
- configuring required/optional attributes,
- reviewing AI/user-defined values,
- managing niche-specific copy and imagery,
- performing basic moderation.

### Trust and safety baseline

MVP includes basic block/report/moderation controls. See `moderation_and_safety.md`.

### Deferred signup

Logged-out users can browse and draft actions, but must create an account before committing anything to the system.

## MVP does not include

- communities,
- community-only listings,
- community publishing contexts,
- community owner tools,
- forums,
- discussion posts,
- comments on items or collections,
- reactions/likes,
- paid communities,
- public reputation scores,
- verification badges,
- transaction processing,
- payment processing,
- escrow,
- shipping labels,
- checkout,
- tax calculation,
- insurance/protection products,
- cross-niche listings or formal cross-niche offers,
- global public inventory/profile surfaces,
- automated bundle matching,
- numeric match scores,
- Near Miss recommendation surfaces.

## MVP success loop

A successful MVP user can:

1. browse a niche marketplace,
2. add an owned item,
3. publish a for-sale and/or for-trade listing,
4. set trade interests for a for-trade listing,
5. discover 2-way and 1-way trade opportunities,
6. message another user,
7. send a cash or trade offer where rules allow,
8. counter, accept, decline, or let offers expire,
9. create collections and wishlist items for context and demand signaling,
10. manage niche-specific profile identity.
