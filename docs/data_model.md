# MVP Data Model

This is a conceptual MVP data model. It should be updated when implementation decisions are made.

## Mock data implementation

The current frontend-only mock data lives in `/data/mock`.

Rules:

- mock data is deterministic and local to the repo
- mock images live under `/public/mock`
- community memberships and offers are explicit fixtures, not inferred only from labels or messages
- the data mirrors the conceptual model below without introducing a database
- page branches should import from `/data/mock` instead of hard-coding duplicate fixture objects
- replacing these files with real API/database data should not require changing product component props

## Core entities

### User

Represents an account.

Potential fields:

- id
- email
- auth_provider
- created_at
- updated_at

### Profile

Represents public identity.

Potential fields:

- id
- user_id
- display_name
- username
- avatar_url
- banner_url
- bio
- location
- created_at
- updated_at

Future:

- niche-specific profile variants
- social proof links
- verification badges

### Niche

Represents a major marketplace category/community domain.

Examples:

- Music Gear
- Motorcycles
- Wine

Potential fields:

- id
- name
- slug
- description
- taxonomy_version
- created_at
- updated_at

### Category

Niche-specific category.

Potential fields:

- id
- niche_id
- parent_category_id
- name
- slug
- sort_order

### Attribute / Filter Definition

Defines structured listing attributes for a niche/category.

Potential fields:

- id
- niche_id
- category_id
- name
- slug
- type
- options
- required
- filterable
- sort_order

### Community

Represents a user/community-created space inside a niche.

Potential fields:

- id
- niche_id
- owner_user_id
- name
- slug
- description
- visibility
- join_policy
- created_at
- updated_at

### CommunityMembership

Represents user membership in a community.

Potential fields:

- id
- community_id
- user_id
- role
- status
- joined_at

Roles:

- owner
- admin
- moderator
- member

Statuses:

- active
- pending
- banned

### Listing

Represents an item/listing.

Potential fields:

- id
- user_id
- niche_id
- category_id
- title
- description
- condition
- price
- location
- status_for_sale
- status_for_trade
- status_in_collection
- status_wishlist
- visibility
- created_at
- updated_at

Note:

Statuses may eventually be normalized into a separate status table, but boolean flags may be acceptable for MVP if kept clean.

### ListingImage

Potential fields:

- id
- listing_id
- image_url
- alt_text
- sort_order
- created_at

### ListingAttributeValue

Stores structured attribute values.

Potential fields:

- id
- listing_id
- attribute_definition_id
- value

### ListingPublishingContext

Defines where a listing is visible.

Potential fields:

- id
- listing_id
- context_type
- context_id
- created_at

Context types:

- public_market
- community_market
- profile_only
- private, future

### Collection

Represents a curated group of items owned/wanted by a user.

Potential fields:

- id
- user_id
- niche_id
- title
- description
- visibility
- cover_image_url
- created_at
- updated_at

### CollectionItem

Potential fields:

- id
- collection_id
- listing_id
- sort_order
- note
- created_at

### TradeInterest

Represents what a user would accept for a listing.

Potential fields:

- id
- listing_id
- user_id
- niche_id
- category_id
- title
- notes
- cash_adjustment_allowed
- created_at
- updated_at

### TradeInterestCriteria

Structured criteria for a trade interest.

Potential fields:

- id
- trade_interest_id
- attribute_definition_id
- operator
- value

Operators:

- equals
- in
- range
- min
- max
- contains

### TradeMatch

May be computed rather than persisted at MVP.

If persisted:

- id
- listing_a_id
- listing_b_id
- user_a_id
- user_b_id
- match_type
- score
- created_at
- updated_at

Match types:

- true_two_way_match
- inbound_one_way_interest
- recommendation

### Offer

Represents a proposed transaction/trade.

Potential fields:

- id
- buyer_user_id
- seller_user_id
- target_listing_id
- status
- cash_amount
- message
- created_at
- updated_at

Statuses:

- draft
- sent
- accepted
- declined
- countered
- withdrawn
- expired

### OfferItem

Represents items included in an offer.

Potential fields:

- id
- offer_id
- listing_id
- offered_by_user_id
- side

Side:

- buyer_side
- seller_side

### MessageThread

Potential fields:

- id
- listing_id
- offer_id
- created_at
- updated_at

### Message

Potential fields:

- id
- thread_id
- sender_user_id
- body
- created_at
- read_at

### Follow

Potential fields:

- id
- follower_user_id
- followed_user_id
- created_at

Could later support following:

- users
- communities
- collections
- searches

### Report

Potential fields:

- id
- reporter_user_id
- target_type
- target_id
- reason
- details
- status
- created_at
- resolved_at

## Important modeling rules

### Trade criteria must be explicit

Do not blur true matches and loose recommendations.

### Niche schema matters

Listing attributes should come from niche/category definitions, not arbitrary one-off fields.

### Community markets are contexts

A community market is not a separate listing copy. It is a publishing/visibility context for the same listing.

### Collections are not only marketplace inventory

Collections include identity/showcase behavior. An item in a collection may or may not be available for sale/trade.

### Wishlist/wanted items need first-class treatment

Wishlist items should not be treated exactly like owned inventory, but they should share enough structure to support matching/discovery later.
