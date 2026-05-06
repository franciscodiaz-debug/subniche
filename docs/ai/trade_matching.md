# Trade Matching

Trade matching is a core MVP feature. It must be explicit, criteria-driven, and trustworthy.

## Terminology

Trade matching has two separate dimensions:

1. **Match direction** — whose trade interests are satisfied.
2. **Criteria satisfaction** — whether selected criteria are fully met.

Use these terms:

- `2-way match`
- `1-way match`
- `criteria-complete`
- `Possible Match`


## Eligibility

Only active for-trade listings are eligible for trade matching.

Eligible:

- for-trade listings,
- for-sale + for-trade listings.

Not eligible:

- for-sale-only listings,
- collection-only owned items,
- private owned items,
- wishlist items,
- archived items,
- deleted items.

Pending note:

- Pending active for-trade listings may still appear in match results with a Pending badge, but they cannot be used to start new formal offers until Pending is removed.

## Both items must be for trade

For a formal trade offer to be initiated:

- the initiating user's item must be actively for trade,
- the target user's item must be actively for trade,
- the offer must satisfy the applicable 2-way or 1-way match rule,
- both items must be in the same niche.

A 1-way match does not allow users to target items that were not made available for trade.

## Trade interests

A trade interest is structured criteria attached to a for-trade listing.

Rules:

- A trade interest must include at least a category or subcategory.
- A listing may have multiple trade interests.
- Trade interests do not require every required listing attribute.
- Users select only the criteria they care about.
- A trade interest describes the desired item, not the user's own item.

## Criteria-complete matching

A candidate item is criteria-complete only if it satisfies 100% of selected criteria.

Rules:

- selected values inside one field are OR,
- different fields are AND,
- multiple trade interests attached to one listing are OR,
- a candidate only needs to satisfy one complete trade interest to qualify.

Example:

```text
Trade interest A:
- Category: Guitar Amp
- Brand: Fender OR Vox
- Value: $800-$1,200

Candidate item qualifies if:
- it is in Guitar Amp or a child subcategory,
- AND brand is Fender OR Vox,
- AND stated value falls within $800-$1,200.
```

## Category hierarchy

Items tagged with a subcategory also carry parent category tags.

A trade interest set at a parent category is satisfied by eligible child subcategories.

A trade interest set at a specific subcategory matches that subcategory and descendants only. It does not match sibling subcategories.

## Attribute behavior

For MVP, use consistent matching behavior across structured attributes:

- preset/select: selected values are OR,
- multi-select: selected values are OR within the field,
- different fields: AND,
- boolean: selected boolean value must match,
- number/range: candidate value must fall within selected range,
- value/price: only used as hard criteria if the user selected a value range,
- free text/string: not used for criteria-complete matching unless converted into structured/validated values.

Condition is treated like other preset attributes for MVP. Users manually select acceptable values rather than using special ordered logic like `Good or better`.

## Missing data

If selected criteria depend on a missing attribute, the candidate is not criteria-complete.

It may be shown as a Possible Match if the rest of the selected criteria fit.

Example:

```text
Required selected criteria:
- Brand: Fender
- Condition: Excellent

Candidate:
- Brand: Fender
- Condition: missing

Result: Possible Match, not criteria-complete.
```

## Known failed data

If the candidate has known data that fails selected criteria, it is not a match.

Example:

```text
Required selected criteria:
- Brand: Fender
- Condition: Excellent

Candidate:
- Brand: Fender
- Condition: Poor

Result: not a match.
```

Near Misses may be useful later, but are excluded from MVP match surfaces.

## Pending validation values

User-defined values may be pending AI/admin validation.

Rules:

- confirmed attributes can participate in matching,
- pending values should not create global exact matches until approved,
- if selected criteria depend on a pending value, the item is not criteria-complete,
- the item may be Possible Match if otherwise relevant.

## 2-way match

A 2-way match exists when:

- User A's item is criteria-complete against User B's trade interest, and
- User B's item is criteria-complete against User A's trade interest.

2-way matches are the strongest trade opportunities.

## 1-way match

A 1-way match exists when:

- your item is criteria-complete against another user's trade interest, and
- their item is active for trade, and
- you choose to manually express interest in their item by initiating from the item view page.

This works because your item satisfies what they said they are looking for, and your initiation supplies your side's intent.

Do not promote the reverse case:

- their item matches your trade interest,
- but your item does not match theirs.

Users can find and message those items through normal marketplace browse/search, but SubNiche should not encourage that as a match opportunity.

## Match surfaces

MVP Trade / Matches surface should focus on:

1. 2-way matches,
2. 1-way matches where your item matches what they are looking for,
3. Possible Matches as clearly secondary.

Do not include Near Misses in MVP.
Do not show numeric match scores in MVP.

## Offer initiation from matches

The Trade / Matches surface is a discovery/routing surface.

Users must open the full item view page before starting a trade offer.

A Start trade offer action is available from the item view page only when the viewer has an eligible criteria-complete 2-way or 1-way match.

Possible Matches do not unlock formal offers.

## Item-to-item matching

For MVP, each trade interest matches one candidate item/listing only.

The matching engine should not automatically combine bundles such as:

- item + item,
- item + cash,
- multiple lower-value items.

Bundles and cash balancing can occur inside the offer/counter-offer flow after a valid initial match unlocks the trade offer.

## Value matching

Every active tradable listing MUST have value context before it can be published for trade or used in trade matching.

Required value rules:

- for sale only → asking price is required,
- for trade only → stated trade value is required,
- for sale + trade → asking price is required and serves as trade value for MVP.

A trade-only listing cannot be published as an active for-trade listing without a stated trade value. Do not treat stated trade value as optional just because there is no sale price.

Trade value is the owner's stated valuation for negotiation context. It is not an official appraisal and does not make a trade-only item available for cash sale.

Value is a hard match criterion only if the user explicitly selects a value range in the trade interest.

The user's own item value does not automatically constrain matches.

## Negative filters

Trade interests are positive-only in MVP.

Do not support negative criteria like:

- no Squier,
- no relics,
- not Floyd Rose.

Negative/exclusion filters are post-MVP.

## Match recomputation

Trade matches recalculate automatically when matching inputs change:

- listing status,
- for-trade availability,
- Pending status,
- item attributes,
- item value/trade value,
- trade interests,
- archived/deleted state,
- taxonomy changes,
- pending values approved/rejected.

Existing offer records preserve their original context and are not rewritten by later match recalculation.
