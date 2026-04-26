# Interaction Rules

This document captures product behavior rules that should remain consistent across the app.

## Item statuses

Items may support multiple compatible statuses:

- For Sale
- For Trade
- In Collection
- Wishlist / Wanted

Important example:

An item can be in a collection and also marked for sale or trade.

For the MVP add-item flow, owned-item statuses are additive, while Wishlist / Wanted is a separate mode. Activating Wanted should clear or disable owned-item statuses so wanted items are not confused with inventory the user already owns.

## Status behavior

### For Sale

Requires or strongly encourages:

- price
- condition
- location/shipping preference, future
- seller contact/offer action

### For Trade

Requires or encourages:

- trade interests
- accepted categories
- accepted attributes/filters
- optional cash adjustment openness

### In Collection

Used to showcase ownership, identity, taste, and trust context.

Does not necessarily imply availability.

### Wishlist / Wanted

Used to show what a user wants.

Can be created from:

- existing listing
- pasted link, future
- manual entry

Wishlist items may later help with recommendations, but should not create false trade matches.

## Trade interests

Trade interests define what a user would accept in exchange for a specific listing.

Rules:

- User-specified criteria must be respected.
- A true match requires the relevant criteria to be satisfied.
- Do not label something as a match if it violates explicit criteria.
- Lower-confidence suggestions may be shown later, but must be labeled differently from matches.

## Trade match types

### True two-way match

Both users have items that satisfy each other’s trade interests.

### Inbound one-way interest

Another user’s item/listing matches what this user wants, or another user wants this user’s item, but there is not necessarily mutual fit.

### Recommendation

A lower-confidence possible fit.

Should not be called a match.

## Offer behavior

Offers may include:

- cash only
- trade item only
- cash + trade item
- multiple trade items, future
- counteroffers

Important rule:

A seller should be able to counter by changing cash, adding items, or adjusting their side without losing the originally targeted item context.

## Messaging

Messaging should be tied to context when possible:

- listing
- offer
- trade proposal
- community context

Avoid generic message threads with no item context when the interaction starts from a listing.

## Listing visibility

A listing may appear in:

- public market
- one or more community markets
- private/profile-only collection context, future

Publishing context should be explicit.

## Community access

Communities may be:

- public
- request-only
- private/invite-only, future

Community owners should eventually control:

- membership
- market visibility
- allowed categories/attributes within the broader niche backstop
- posting rules

## Niche taxonomy

Each niche has a canonical schema.

Communities can narrow what they allow, but should not broaden beyond the niche schema.

Example:

A guitar community may limit listings to pedals or vintage guitars, but should not redefine the entire music gear taxonomy in a way that breaks cross-posting.

## Profiles

Users may eventually have niche-specific profile expression.

Rationale:

A user may be a guitarist in one context, a motorcyclist in another, and a wine collector elsewhere. Their identity should be contextually relevant without requiring separate accounts.

## Trust context

Trust should be built through visible context, not just star ratings.

Potential trust signals:

- profile completeness
- collections
- linked accounts
- prior marketplace accounts
- community membership
- transaction history, future
- repeat interaction feedback, future

## Activation checklist

For new users, likely activation goals:

- complete profile
- add 3 items
- set 3 trade interests

The checklist should prompt action without feeling like a nagging SaaS onboarding widget.

## Empty states

Empty states should:

- explain why the page matters
- suggest one primary next action
- avoid dead ends

Examples:

- No trade matches yet → set trade interests
- No collection items yet → add first item
- No listings yet → create listing
