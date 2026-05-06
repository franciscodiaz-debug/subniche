# Profiles, Search, and Onboarding

## Account identity

A user has one account and one permanent username/handle.

The permanent username remains visible somewhere on profile/listing surfaces to preserve accountability.

## Niche-specific profiles

MVP supports niche-specific profiles.

Each niche profile can have:

- display name,
- avatar,
- bio,
- subheading/tagline,
- visible collections,
- visible listings,
- visible wishlist items,
- niche-specific context.

Users should appear in communities using niche profile identity later, but communities are not MVP.

## Automatic niche profile creation

When a user first participates in a niche, SubNiche should create a default niche profile using base account info.

Participation may include:

- adding an item,
- creating a listing,
- creating a wishlist item,
- creating a collection,
- messaging or making an offer in that niche.

Users can customize later.

## Public profile visibility

When viewing another user's profile, the niche-profile selector should show only niches where that user has public-facing activity.

Public-facing activity may include:

- public listings,
- public collections,
- public wishlist items,
- other public niche activity later.

Do not reveal inactive/private niche profiles to outside viewers.

## Items and collections live within niches

Items, collections, listings, and wishlist items live inside a niche.

Users are curating their collections for other enthusiasts in that niche.

A global owner control panel for managing everything across niches may be added post-MVP, but it is not the public-facing MVP model.

## Marketplace browse

Marketplace browse/grid is niche-scoped and listing-focused.

It shows active marketplace items only:

- for-sale listings,
- for-trade listings,
- for-sale + for-trade listings.

It does not show:

- collection-only owned items,
- unlisted owned items,
- wishlist items,
- archived items,
- deleted items.

## Search

Search is niche-scoped by default.

Search results should be grouped into result categories, similar to Reddit-style search.

MVP categories may include:

- Items/listings,
- Users,
- Collections,
- Wishlist items.

Post-MVP categories may include:

- Communities,
- Discussions.

Marketplace browse remains item/listing-focused. Search can route to other object types.

## Deferred signup principle

Users should be able to experience as much of the product as possible before account creation, up to the point of committing something to the system.

Principle:

```text
Browse freely. Draft freely. Commit after account creation. Preserve the draft.
```

## Logged-out users can

Logged-out users can:

- browse public niche marketplaces,
- view public listings,
- view public collections,
- view public wishlist items,
- start creating an item/listing draft,
- start creating a wishlist draft,
- compose a message draft,
- start building an offer draft,
- preview the result.

## Logged-out users cannot

Logged-out users cannot:

- publish a listing,
- publish a wishlist item,
- create/save a collection,
- send a message,
- send an offer,
- save trade interests permanently,
- favorite/save items,
- appear in another user's inbox/notifications,
- permanently upload/store content.

## Account gate

At commit point, prompt account creation.

Examples:

- Publish listing → create account to publish.
- Send message → create account to send.
- Send offer → create account to send.
- Publish wishlist → create account to publish.

After signup, return user to the draft for final review. Do not automatically publish/send/commit immediately after signup.

## Draft preservation before signup

Preserve as much draft data as practical before signup.

Rules:

- text and structured data can be saved in browser/local session storage,
- photos may be used for preview,
- photos are not permanently stored before account creation,
- user may need to reselect photos after refresh/session loss,
- durable storage begins only after account creation and save/publish.

## Minimal account creation

MVP account creation should require only:

- email,
- password / magic link / passkey auth,
- permanent username.

Defer until needed:

- profile photo,
- niche display name,
- bio,
- location,
- phone verification,
- full profile completion.

## Location requirements

Approximate location is required before publishing:

- for-sale listing,
- for-trade listing,
- public wishlist item.

Private wishlist items do not require location.
Owned personal/collection-only items do not require location.

Location should be approximate:

- ZIP/postal code,
- city/region,
- approximate marketplace location.

Public display should show approximate location or distance, never exact address.

## Fulfillment requirements

For-sale and for-trade listings require fulfillment/logistics preference:

- Local pickup / meet-up,
- Shipping available,
- Local or shipping.

Do not include `Open to discuss` as an option.

Wishlist items do not require acquisition preference.

## AI listing assist

Manual item/listing creation is the source of truth.

AI listing assist may suggest:

- category,
- subcategory,
- attributes,
- title,
- description details.

Users must review/confirm structured data before it becomes authoritative.

Expensive AI/photo extraction may be account-gated or rate-limited if needed.
