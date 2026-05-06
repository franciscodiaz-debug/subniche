# SubNiche Product Rules

These rules are authoritative for product behavior.

## MVP scope rules

- MVP has no communities.
- MVP has no comments, forums, discussion posts, reactions, or public feeds.
- MVP has no payment processing, escrow, shipping labels, checkout, or tax handling.
- MVP has no cross-niche formal offers.
- MVP has no public reputation system or verification badges.

## Niche rules

- Every item, listing, wishlist item, collection, trade interest, and niche profile belongs to one niche.
- Marketplace browse is niche-scoped.
- Search is niche-scoped by default.
- Formal offers are limited to items/listings inside the same niche for MVP.

## Account and profile rules

- A user has one account and one permanent username.
- A user may have different niche-specific profile presentation per niche.
- The permanent username should remain visible somewhere on profile/listing surfaces.
- Outside viewers only see niche profiles where the user has public-facing activity.

## Item and listing rules

- `Item` is the umbrella term for objects users add to SubNiche.
- An `owned item` is something the user currently owns.
- A `wishlist item` is something the user does not own but is looking for.
- A `listing` is an owned item made available for sale, trade, or both.
- One owned item can have only one active listing.
- Active listings are public inside their niche marketplace in MVP.
- An archived item cannot be directly listed; it must first be restored as a private owned item.

## Listing states

An active listing may be:

- for sale only,
- for trade only,
- for sale + for trade.

Listing state determines initial offer eligibility:

- for sale only → cash offer only,
- for trade only → trade offer only from a valid 2-way or 1-way match,
- for sale + for trade → cash offer or valid trade offer.

## Listing price/value publication requirements

A listing cannot be published into an active marketplace state unless the required price/value context for that state is present.

Required value rules:

- `for sale only` listings MUST have an asking price.
- `for trade only` listings MUST have a user-entered stated trade value.
- `for sale + for trade` listings MUST have an asking price; for MVP, that asking price also serves as the trade value.

A for-trade listing without a stated value is incomplete and MUST remain draft/unpublished for trade purposes. Do not treat trade value as optional merely because the item is not for sale.

Trade value is not an appraisal or platform-guaranteed value. It is the owner's stated valuation for negotiation and trade context.

## Location and fulfillment rules

- For-sale listings require approximate location.
- For-trade listings require approximate location.
- Public wishlist items require approximate location.
- Private wishlist items do not require location.
- Exact address is never public.
- For-sale and for-trade listings require fulfillment/logistics preference:
  - Local pickup / meet-up,
  - Shipping available,
  - Local or shipping.
- Public wishlist items do not require acquisition preference.

## Collection rules

- Collections belong to one niche.
- A collection may contain owned items and wishlist items.
- A collection has one visibility state:
  - private,
  - link-only,
  - public.
- Items inside a collection inherit/convert to the collection visibility for MVP.
- No mixed-visibility collections in MVP.
- If a user wants private items in a collection, the collection must be private.
- An item or wishlist item can belong to only one collection at a time in MVP.
- Moving an item to another collection moves it out of the old collection.
- Collections support delete only, not archive.
- Deleting a collection does not delete the items inside it.

## Collection/listing exception

A private collection hides the collection. It does not hide an active listing that has been intentionally published elsewhere.

Example:

- Item is inside a private collection.
- Item is actively listed for sale/trade.
- Listing remains public in the niche marketplace.
- Outside viewers do not see the private collection relationship.

## Wishlist rules

- Wishlist item means something the user does not own but is looking for.
- Do not use the term `wanted item`.
- Wishlist items are public by default.
- Wishlist items can be made private.
- Wishlist items can appear in collections.
- Wishlist items use the same niche taxonomy as owned items/listings.
- Wishlist items are demand signals, not trade interests.
- Wishlist items do not unlock formal offers in MVP.
- Public wishlist items may be messaged about.

## Trade matching rules

- Only active for-trade listings are eligible for trade matching.
- Both items involved in a formal trade offer must be active for-trade listings at initiation.
- Trade interests must include at least a category or subcategory.
- Trade interests do not require every required item/listing attribute; users select the criteria they care about.
- A criteria-complete match requires 100% of selected trade-interest criteria to be satisfied.
- Selected values within a single field are OR.
- Different selected fields are AND.
- Multiple trade interests on one listing are OR.
- Parent category criteria are satisfied by eligible child subcategories.
- Specific subcategory criteria do not match sibling subcategories.
- Missing selected criteria data creates a Possible Match, not a criteria-complete match.
- Known failed criteria are not matches.
- Near Misses are not shown in MVP match surfaces.
- No numeric match scores in MVP.

## 2-way and 1-way match rules

- A `2-way match` exists when both users' items are criteria-complete against each other's trade interests.
- A `1-way match` exists when your item is criteria-complete against another user's trade interest, and you choose to manually express interest in their item.
- The reverse case, where their item matches what you want but your item does not match what they want, should not be promoted in the Trade / Matches surface.
- Users can still find those items through normal marketplace browse/search and message the owner.

## Offer rules

- Formal offers live inside messaging threads.
- Offers may be initiated from item view pages where the action is allowed.
- The Trade / Matches surface is discovery/routing, not direct offer initiation.
- Initial trade offers must include the matched item(s) that unlocked the offer.
- Trade offers can add cash or extra active listed items.
- Counter-offers can diverge freely after a valid initial offer.
- Formal offers can only include active listed items in the same niche.
- Private owned items, collection-only items, wishlist items, archived items, and deleted items cannot be added to formal offers.
- Sent offers cannot be edited or withdrawn.
- Offers expire if not accepted/countered/declined within the selected expiration window.
- Accepted offers stop expiring.
- Accepting an offer automatically declines all other active offers involving any item in the accepted offer.

## Pending rules

- Pending is a manual owner-controlled availability state.
- Accepting an offer does not automatically mark items Pending.
- The owner may manually mark an item Pending after acceptance or at any other time.
- Pending items remain visible but show Pending.
- Pending blocks new formal offers involving that item.
- Pending does not block messaging.
- Pending does not cancel existing active offers.
- Pending does not lock editing.

## Completion/archive/delete rules

- Each party privately marks completion when ready.
- The other party does not see whether a user has marked complete.
- Offer reaches Completed only after both parties have privately marked complete.
- When an item owner marks complete, their contributed item(s) are archived immediately.
- Archived items are removed from active/public surfaces and active collections.
- Archived items remain privately visible to the owner in Archived Items.
- Deleted items are truly removed from product-facing references.
- References to deleted items in messages/offers show a removed placeholder.
- Deleting an item involved in an active/accepted offer makes that offer inactive/unresolvable.

## Super-admin rules

- MVP includes an in-app, desktop-only super-admin control panel.
- Taxonomy entities require stable internal IDs.
- Used taxonomy values cannot be hard-deleted.
- Used values may be renamed, merged, archived/deactivated, or migrated.
- Unused taxonomy values may be deleted.
- User-defined values are AI-cleaned/validated and may be added to shared taxonomy.
- Low-confidence or suspicious user-defined values go to a super-admin review queue.

## Moderation rules

- MVP must support blocking and reporting.
- Super-admin must have basic moderation tools to remove/unpublish content and suspend/ban users.
- See `moderation_and_safety.md`.
