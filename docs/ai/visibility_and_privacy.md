# Visibility and Privacy

## Core principle

Public visibility does not automatically mean globally discoverable everywhere. An object is viewable by others only through a public surface where it is intentionally exposed.

For MVP, active listings and public wishlist items have standalone public surfaces. Unlisted owned items do not.

## Listing visibility

For MVP, all active for-sale and/or for-trade listings are public inside their niche marketplace.

There are no community-only listings and no listing publishing contexts in MVP.

A listing must have:

- active listing state,
- required listing details,
- approximate location,
- fulfillment preference,
- required value context for its state:
  - for-sale listing → asking price,
  - trade-only listing → stated trade value,
  - for sale + trade listing → asking price, which also serves as trade value for MVP.

A for-trade listing without value context is incomplete and cannot be actively published for trade.

## Owned item visibility

Owned items can exist privately.

Owned items are visible to outside users only if they appear in one of these surfaces:

- active listing,
- public collection,
- link-only collection.

There is no global public inventory/profile surface in MVP.

Unlisted owned items do not appear as standalone search results.

## Standalone URLs

A standalone item URL works only when the item has a standalone public surface:

- active listing,
- public wishlist item.

Unlisted owned items require collection-context access.

Example allowed context route:

```text
/collections/{collectionId}/items/{itemId}
```

If an unlisted item is in a link-only collection, the collection-context URL must preserve link-only access context.

## Collection visibility

Collections have exactly one visibility state:

- `private` — visible only to owner,
- `link-only` — viewable by anyone with the URL, not discoverable in normal browsing/search,
- `public` — visible in normal public surfaces.

For MVP, items inside a collection inherit/convert to the collection's visibility. No mixed-visibility collections.

Changing collection visibility applies to items inside it:

- Private → Public: all items become public in collection context after explicit confirmation.
- Private → Link-only: all items become visible to anyone with the link after explicit confirmation.
- Public/Link-only → Private: unlisted items become private immediately.

Important exception:

- If an item in a private collection is actively listed for sale/trade, the active listing remains visible in the public niche marketplace.
- The private collection relationship is not shown to outside viewers.

## Collection membership

For MVP, each owned item or wishlist item can belong to only one collection at a time.

If a user adds an item to a different collection:

- the item moves out of the old collection,
- the item adopts the destination collection's visibility rules,
- active listing visibility remains separate.

## Removing items from collections

If an unlisted owned item is removed from its only collection:

- it becomes a private owned item by default.

If a listed item is removed from its only collection:

- the active listing remains active.

If a wishlist item is removed from its only collection:

- it returns to public by default, because wishlist items are public demand signals unless explicitly private or inside a private collection.

## Wishlist visibility

Wishlist items are public by default.

A wishlist item can be private.

A public wishlist item can be viewed as a standalone public demand signal and can be messaged about.

A public wishlist item placed in a private collection becomes private while in that collection. If removed from the private collection, it returns to public by default unless explicitly made private.

## Link-only collection item sharing

Users may create a link-only collection with one item to share a specific unlisted item.

An unlisted item in a public or link-only collection can be opened as a specific collection-context item detail view.

Access stops if:

- the item is removed from the collection,
- the item is archived,
- the item is deleted,
- the item becomes private via collection visibility change,
- the collection becomes private,
- the collection is deleted.

## Item page modules and hidden relationships

The item view page is the core page. Listing, trade, collection, wishlist, and owner modules are additive based on state and viewer permission.

Rules:

- If an item is listed and belongs to a public collection, viewers may see the public collection relationship.
- If an item is listed and belongs to a link-only collection, normal marketplace viewers should not see that link-only collection relationship.
- If an item is listed and belongs to a private collection, outside viewers should not see any collection module.
- If the viewer lacks permission to see a module, do not reveal that the hidden relationship exists.

## Archive visibility

Archived owned items are removed from:

- active listings,
- marketplace/search,
- trade matching,
- possible match results,
- active collections,
- public/link-only collection item views.

Archived items remain privately visible to the owner in Archived Items.

## Delete visibility

Deleted items are removed from all active surfaces immediately.

References in messages/offers are replaced with:

```text
This item was removed by the user.
```

Wishlist deletion references use:

```text
This wishlist item was removed by the user.
```

Collection deletion references use:

```text
This collection was removed by the user.
```
