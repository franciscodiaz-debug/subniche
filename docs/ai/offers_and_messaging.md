# Offers and Messaging

## Messaging principles

Messaging is included in MVP. It is the flexible layer around listings, wishlist items, collection items, and offers.

Users can message about visible objects even if no trade match exists, unless blocked or restricted by moderation/safety rules.

## Conversation threading

Use context-specific conversation threads for MVP.

Examples:

- user-to-user thread about a specific listing,
- user-to-user thread about a specific wishlist item,
- user-to-user thread about a public collection item.

Do not use one giant global thread per user pair for all items.

## Message eligibility

Users can message about:

- active listings they can view,
- public wishlist items,
- public/link-only collection items they can view,
- Possible Matches if the listing is viewable.

Users cannot message if blocked or if the object is no longer accessible and there is no existing thread.

Existing message history remains visible after access changes unless moderation/safety requires otherwise.

## Wishlist messaging

Public wishlist items support messaging/contact.

Wishlist messaging does not unlock formal offers in MVP.

## Collection item messaging

Users can message the owner about a public/link-only collection item even if the item is not for sale and not for trade.

This creates a conversation tied to that collection/item context.

It does not create a formal offer path unless the item is an eligible active listing.

## Formal offers live inside messaging

All formal offers and counter-offers are managed inside the messaging interface.

An offer may be initiated from an item view page, but the ongoing negotiation lives in the message thread as offer cards/events plus normal chat.

## Offer types by listing status

Initial offer eligibility:

- For sale only → initial offer must be cash-based.
- For trade only → initial offer must be trade-based from a valid criteria-complete 2-way or 1-way match.
- For sale + for trade → initial offer can be cash-based or trade-based.

After a valid offer thread starts, counter-offers can be flexible and may include cash, items, or both.

Value requirements before offer eligibility:

- A for-sale listing must have an asking price before it can receive cash offers.
- A trade-only listing must have a stated trade value before it can be published for trade or used to initiate trade offers.
- A for sale + for trade listing uses its asking price as trade value for MVP.


## Cash offers

Cash offers are allowed on for-sale listings.

Rules:

- buyer may offer asking price or below asking,
- seller may accept, decline, counter, or let expire,
- no payment processing in MVP,
- payment/fulfillment details happen off-platform through messaging.

## Trade offers

Initial trade offers require a valid match basis.

Valid initiation paths:

- criteria-complete 2-way match,
- eligible criteria-complete 1-way match.

Initial trade offer must include the matched item(s) that unlocked the offer.

Users may add cash or extra active listed items to the initial offer.

Extra items/cash do not need to be criteria-complete matches.

## Counter-offers

After a valid initial offer has been sent, counter-offers may diverge freely.

Counter-offers may include:

- the original matched items,
- different active listed items,
- extra active listed items,
- fewer items,
- cash,
- cash-only terms.

A cash-only counter-offer does not convert a trade-only listing into a public for-sale listing.

## Offer item eligibility

Formal offers may include only active listed items in the same niche.

Cannot be added to formal offers:

- private owned items,
- collection-only items,
- wishlist items,
- archived items,
- deleted items,
- items outside the niche.

This avoids turning private inventory into a hidden marketplace.

## Same-niche-only offers

Formal offers are same-niche only in MVP.

Cross-niche trade/offer behavior is post-MVP.

## Offer states

MVP formal offer states:

- `Active` — current offer/counter-offer awaiting response,
- `Countered` / `Superseded` — replaced by a newer counter-offer,
- `Declined` — recipient declined,
- `Expired` — response window passed,
- `Accepted` — recipient accepted,
- `Completed` — both parties privately marked complete.

Do not include formal canceled, failed, disputed, or refunded states in MVP.

## No editing or withdrawal after send

Sent offers and counter-offers cannot be edited or withdrawn.

Once sent, the recipient may:

- accept,
- decline,
- counter,
- let expire.

## Offer expiration

Offer expiration options:

- 24 hours default,
- 48 hours,
- 72 hours,
- 7 days.

Each new counter-offer resets the expiration clock for the currently active proposal.

Accepted offers stop expiring.

Expiration is only the maximum time limit. An offer may become inactive earlier if the item is deleted, archived, access is removed, or moderation action applies.

## Accepting an offer

When an offer is accepted:

- the accepted offer enters `Accepted`,
- offer expiration stops,
- all other active offers involving any item in the accepted offer are automatically declined,
- involved items are not automatically marked Pending,
- item owners may be prompted to manually mark their own items Pending.

Auto-decline message:

```text
Offer declined. The user accepted a different offer for their item(s).
```

## Multiple active offers

A user may have multiple active offers involving the same item before any one of them is accepted.

A user may also include the same item in multiple outgoing offers before any is accepted.

The conflict is resolved by the acceptance rule: accepting one offer automatically declines other active offers involving the same item(s).

## Pending

Pending is manual owner-controlled item/listing availability.

Rules:

- accepting an offer does not automatically mark an item Pending,
- owner may mark an item Pending manually at any time,
- Pending blocks new formal offers involving that item,
- Pending does not block messaging,
- Pending does not decline or deactivate existing active offers,
- Pending does not lock editing,
- owner manually removes Pending when appropriate.

Pending items can remain visible in marketplace/search/match results with a clear Pending marker and disabled formal-offer initiation.

## Completion

After an offer is accepted, the formal next action is completion.

Each party privately marks completion when ready.

The other party should not see whether the user has marked complete.

The offer reaches `Completed` only after both parties privately mark complete.

## Archiving on completion

When an item owner marks an accepted offer complete:

- that owner's contributed item(s) are archived immediately,
- archived item(s) disappear from active listings, search, matching, and active collections,
- the other party's item(s) are not archived until that owner marks complete.

For cash sale:

- seller marks complete → seller's item is archived.
- buyer marking complete does not archive an item unless buyer contributed item(s).

## Acquired item creation

When a user receives an item through a completed offer, SubNiche should offer:

```text
Add this item to your items
```

Rules:

- do not automatically transfer ownership,
- prefill the new owned item from the completed offer context,
- default the acquired item to private owned item,
- do not automatically list it,
- do not automatically add it to a collection,
- retain a private reference to the completed offer.

## Delete effects on offers

Deleting an item is destructive.

If an item involved in an active or accepted offer is deleted:

- the item reference is replaced with:

```text
This item was removed by the user.
```

- the offer becomes inactive/unresolvable,
- it can no longer be accepted, countered, or completed.

Delete warning for owned items:

```text
Delete this item? This removes it from your items, collections, listings, search, and any messages or offers.
```

Wishlist delete warning:

```text
Delete this wishlist item? This removes it from your wishlist, collections, search, and any messages.
```

## Offer snapshots

Offer records should preserve enough context to make active negotiations understandable.

However, if a live item is deleted, user-facing references to that item should be replaced by removed placeholders rather than continuing to display full item details.

Archived items can remain visible to the owner privately; deleted items should be treated as truly removed from product-facing references.
