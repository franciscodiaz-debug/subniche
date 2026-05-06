# Taxonomy and Super-Admin

## Core taxonomy principle

Niches define taxonomy.

Structured taxonomy powers:

- item/listing creation,
- marketplace filtering,
- trade interests,
- wishlist items,
- item detail pages,
- search,
- trade matching.

## Super-admin control panel

MVP includes a true in-app super-admin/product-owner control panel.

Requirements:

- desktop-only is acceptable,
- accessible only to super-admin / product-owner account,
- not for normal users,
- not for community owners,
- not a full CMS beyond what MVP needs.

Super-admin can manage:

- niches,
- categories,
- subcategories,
- attributes,
- allowed values,
- required/optional status,
- attribute input types,
- display order/prominence,
- niche-specific copy,
- niche-specific imagery,
- pending user-defined values,
- moderation queues.

## Stable IDs

All taxonomy entities must use stable internal IDs.

Display labels can change without breaking existing items/listings.

Entities include:

- niche,
- category,
- subcategory,
- attribute,
- allowed value.

## Categories and subcategories

Items tagged with a subcategory also carry the parent category tag.

Parent category filters/trade interests include child subcategories.

Specific subcategory selections do not include sibling subcategories.

## Attributes

Attributes should be configurable at category/subcategory level.

Attribute experience is additive:

- broad niche/category filters appear first,
- deeper category/subcategory choices reveal more relevant attributes.

The same attribute model applies across:

- item/listing creation,
- marketplace filtering,
- trade interest creation,
- wishlist item creation,
- item detail pages.

## Attribute consistency

For MVP, do not arbitrarily make an attribute available in one structured flow but unavailable in another.

If an attribute belongs to a category/subcategory, it should be available consistently across the structured flows.

Super-admin may configure:

- required vs optional,
- input type,
- allowed values,
- display order,
- prominence,
- archived/deactivated status.

## Attribute input types

Attributes may support types such as:

- preset/select values,
- multi-select,
- number,
- range,
- boolean,
- string/text,
- user-defined values where allowed.

## Required attributes

Required attributes apply to transactional/demand flows, not personal collection/showcase items.

Required attributes apply before publishing:

- for-sale listing,
- for-trade listing,
- public wishlist item.

Required attributes do not apply to:

- private owned personal item,
- collection-only item,
- public/link-only collection item unless it is also for sale/trade/wishlist.

Users can save incomplete items privately as drafts/personal items. They cannot publish into sale/trade/wishlist contexts until required fields for that context are complete.

Value context is a required publication field for listings, separate from niche-specific taxonomy attributes:

- for-sale publication requires asking price,
- for-trade publication requires stated trade value,
- for sale + trade publication requires asking price, which also serves as trade value for MVP.

Do not allow a for-trade listing to publish merely because taxonomy attributes are complete if the stated trade value is missing.

## Trade interests and required attributes

Trade interests do not require all required attributes for the target item type.

Users select only the criteria they care about.

100% criteria satisfaction applies only to the criteria the user selected.

## Taxonomy deletion and deactivation

Unused taxonomy values may be deleted.

Used taxonomy values must not be hard-deleted.

Used values may be:

- renamed,
- merged,
- archived/deactivated,
- migrated.

Archived/deactivated values:

- are not available for new items/listings,
- may remain on existing items/listings unless migrated,
- must still be handled by search/filter where existing active listings use them.

## Renaming

Super-admin can rename used taxonomy values.

Rename changes display label only and keeps the stable internal ID.

## Merging

Super-admin can merge duplicate taxonomy values.

Merge behavior:

- source value becomes inactive,
- existing items/listings using source value migrate to target value,
- future items/listings use target value,
- action requires explicit confirmation,
- internal audit/history should be preserved if practical.

## Changing required status

Super-admin can change an attribute from optional to required after listings exist.

Rules:

- applies to new items/listings going forward,
- existing active listings are not forcibly invalidated,
- existing listings must provide the required value when edited or republished,
- missing required values can create Possible Match behavior where relevant.

## User-defined values

Some attributes may support user-defined values.

User-defined values should be AI-cleaned and validated after submission.

Handling:

- high-confidence normalization → auto-add/map to existing value,
- obvious duplicate → merge/map into existing value,
- low-confidence or suspicious value → super-admin review queue,
- obvious junk/spam → reject or hold for review.

Examples:

- `fndr` → suggest/normalize to `Fender`,
- `Partscaster Garage Co.` → validate and add if legitimate,
- spam/junk → reject or hold.

## User confirmation on normalization

When AI normalizes or corrects a user-entered value, show lightweight confirmation.

Example:

```text
Did you mean Fender?
```

## Pending user-defined values

A pending user-defined value can be used on the submitting user's item/listing immediately.

Rules:

- user can finish the listing/item draft,
- value appears on their item,
- value is internally marked as pending validation,
- value is not available to all users until approved,
- if rejected, user may be prompted to select a replacement.

## Pending values and matching

Listings with pending-validation values can still participate in trade matching through confirmed data.

Pending values should not create criteria-complete global exact matches until approved.

If selected criteria depend on a pending value, the result is not criteria-complete and may be Possible Match if otherwise relevant.

## Review queue

Super-admin pending value queue should allow:

- approve,
- reject,
- normalize/rename,
- merge into existing value,
- assign to correct niche/category/attribute,
- see submitting item/listing,
- see AI confidence/reasoning if available.
