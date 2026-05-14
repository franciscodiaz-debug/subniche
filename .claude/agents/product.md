# Product Behavior Guide

**Read this file before implementing any feature that involves product behavior.**
Product behavior = listings, offers, trade matching, collections, wishlists, profiles, moderation, taxonomy, notifications.

The authoritative source of truth for all product rules is `docs/ai/`. Files there are PO/client-owned and must NOT be modified by the dev team.

---

## Required reading order

Before touching business logic for any feature, read in this sequence:

1. `docs/ai/product_brain.md` — core positioning and product principles
2. `docs/ai/MVPscope.md` — what is IN and what is OUT for MVP
3. `docs/ai/product_rules.md` — authoritative behavioral rules
4. The topic-specific file for the feature you are building:

| Feature area | File |
|---|---|
| Items, listings, listing states | `docs/ai/product_rules.md` |
| Trade matching, 2-way/1-way, criteria | `docs/ai/trade_matching.md` |
| Offers, counter-offers, messaging threads | `docs/ai/offers_and_messaging.md` |
| Collections, wishlist items | `docs/ai/product_rules.md` |
| Profiles, niche profiles, deferred signup | `docs/ai/profiles_search_onboarding.md` |
| Visibility, access control, public vs discoverable | `docs/ai/visibility_and_privacy.md` |
| Taxonomy, categories, attributes, admin panel | `docs/ai/taxonomy_and_admin.md` |
| Notifications | `docs/ai/notifications.md` |
| Moderation, block, report, suspension | `docs/ai/moderation_and_safety.md` |
| UI language, tone, empty states | `docs/ai/design_and_tone.md` |

---

## Terminology — canonical vs deprecated

Use these terms consistently in code, variable names, comments, and UI copy.

| Use this | Never use |
|---|---|
| Item | Product, Asset |
| Owned item | Inventory item |
| Listing | Post, Ad |
| Wishlist item | Wanted item, Want |
| Trade interest | Trade preference |
| 2-way match | True Match, Full Match, One-way Match (wrong direction) |
| 1-way match | One-way Match, Partial match |
| Criteria-complete | Full Match, True Match |
| Possible Match | Near Match, Fuzzy match |
| Near Miss | (post-MVP — do not surface) |
| asking price | (for-sale listings) |
| stated trade value | (trade-only listings) |
| Archive | Deactivate, Remove (wrong concept) |
| Delete | (destructive — use placeholder pattern, see visibility doc) |

---

## MVP scope guardrail

Before implementing ANY feature, verify it is listed under "MVP includes" in `docs/ai/MVPscope.md`.

**Explicitly excluded from MVP — do NOT build without PO instruction:**
- Communities, community listings, community owner tools
- Forums, discussion posts, comments on items or collections
- Reactions, likes, feeds
- Payment processing, escrow, shipping labels, checkout, tax
- Public reputation scores, verification badges, transaction history
- Cross-niche listings or offers
- Automated bundle matching, numeric match scores
- Near Miss recommendation surfaces
- Global public inventory or profile surfaces

If a task would require any of the above, stop and flag it to the PO before proceeding.

---

## Product-rule-sensitive areas

These areas require you to read the relevant `docs/ai/` file AND flag ambiguities to the PO before writing any code. Do not make assumptions — the rules are explicit and mistakes here affect data integrity.

| Area | What makes it sensitive |
|---|---|
| Data model (entities, fields, relationships) | Naming and semantics are prescribed — see `terminology_and_data_model.md` |
| Visibility and access control | Public ≠ globally discoverable — see `visibility_and_privacy.md` |
| Trade matching logic | Criteria-complete rules are strict — see `trade_matching.md` |
| Offer state transitions | States are explicit and transitions are one-directional — see `offers_and_messaging.md` |
| Archive vs. delete behavior | Different effects on references and history — see `product_rules.md` |
| Taxonomy and admin panel | Admin-controlled values, pending queue, stable IDs — see `taxonomy_and_admin.md` |
| Account and profile identity | One account, one username, per-niche profiles — see `profiles_search_onboarding.md` |
| Moderation behavior | Block, report, suspension effects on offers/messages — see `moderation_and_safety.md` |

---

## What NOT to invent

Do not invent any of the following without explicit spec or PO approval:
- Route paths or API shapes not already in the codebase
- Schema fields, table names, or enum values not in the Prisma schema
- Offer states, listing states, or match types beyond what `product_rules.md` defines
- New notification types beyond `notifications.md`
- npm packages or external dependencies

If something is unspecified, flag it — do not assume.

---

## Verification before shipping

Run these checks before marking any product-behavior feature as done:

```bash
npx tsc --noEmit       # no type errors
npx eslint .           # no lint errors
npx vitest run         # unit tests pass
```

For behavioral correctness: re-read the relevant `docs/ai/` section and confirm the implementation matches the stated rules exactly — especially for listing publication requirements, trade matching criteria, offer state transitions, and visibility rules.
