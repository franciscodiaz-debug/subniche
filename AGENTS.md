# AGENTS.md

This is the shared operating guide for AI coding agents working on SubNiche.

Claude Code imports this file through `CLAUDE.md`. Codex should read this file from the repo root before doing non-trivial work.

## Project

SubNiche is a niche-first, person-to-person marketplace for enthusiasts. The MVP combines:

- niche marketplaces,
- native trading,
- personal collections,
- wishlist demand signals,
- niche-specific profiles,
- structured taxonomy and faceted filters,
- user-to-user messaging,
- simple formal offers and counter-offers,
- super-admin taxonomy/configuration tools.

SubNiche should not feel like generic classifieds or a broad e-commerce site. It should feel like a focused room for people who understand the niche.

## Read first

Before non-trivial work, read these files:

1. `docs/ai/product_brain.md`
2. `docs/ai/MVPscope.md`
3. `docs/ai/product_rules.md`
4. `docs/ai/terminology_and_data_model.md`
5. `docs/ai/visibility_and_privacy.md`
6. `docs/ai/trade_matching.md`
7. `docs/ai/offers_and_messaging.md`
8. `docs/ai/taxonomy_and_admin.md`
9. `docs/ai/profiles_search_onboarding.md`
10. `docs/ai/moderation_and_safety.md`
11. `docs/ai/design_and_tone.md`
12. `docs/ai/verification_and_workflow.md`
13. `docs/ai/post_mvp_and_open_questions.md`

For frontend work, also read the relevant frontend/design docs in the repo if present.
For backend work, also read backend/schema/API docs in the repo if present.
For tests, also read verification and test instructions in the repo if present.

## Decision hierarchy

When instructions conflict, follow this order:

1. Current explicit user/product-owner instruction
2. `AGENTS.md`
3. `docs/ai/product_rules.md`
4. Topic-specific docs in `docs/ai/`
5. Existing code and tests
6. Older memory/docs/prototype notes

If an older doc conflicts with this documentation package, treat the older doc as stale.

## MVP scope guardrail

Do not add communities, forums, comments, reactions, paid communities, public reputation systems, transaction processing, escrow, shipping labels, payment processing, or global cross-niche trading unless explicitly instructed.

## Non-negotiable product rules

- MVP has no communities and no discussion/forum features.
- Marketplace browsing is niche-scoped and listing-focused.
- Items, collections, wishlist items, listings, and niche profiles live inside a niche.
- A user has one permanent username/account identity, but can have niche-specific profile presentation.
- One owned item can have only one active listing.
- Active listings are public within their niche marketplace in MVP.
- Publishing a for-trade listing MUST require a user-entered value.
- For sale only listings require an asking price.
- For trade only listings require a stated trade value.
- For sale + for trade listings use the asking price as the trade value for MVP.
- Do not implement any path that publishes an active for-trade listing without value context.
- Only active for-trade listings are eligible for trade matching.
- Trade matching has two dimensions:
  - match direction: `2-way match` or `1-way match`
  - criteria satisfaction: `criteria-complete`, `possible match`, or not a match
- A criteria-complete match requires 100% of selected trade-interest criteria to be satisfied.
- Missing selected criteria data creates a Possible Match, not a criteria-complete match.
- Known failed criteria are not matches and are not shown as Near Misses in MVP.
- Formal trade offers can start only from an eligible criteria-complete 2-way or 1-way match.
- Initial trade offers must include the matched item(s) that unlocked the offer.
- Counter-offers can diverge freely after a valid initial offer.
- Formal offers can include only active listed items within the same niche.
- Pending is manual owner-controlled listing availability, not automated offer lifecycle.
- Deleting an item is destructive and replaces references in messages/offers with a removed placeholder.
- Archive removes items from active/public surfaces but preserves private owner history.
- Collections have one visibility state and no mixed-visibility items in MVP.
- An owned item or wishlist item can belong to only one collection at a time in MVP.
- Super-admin taxonomy changes must preserve existing data through stable IDs, archive/deactivate, rename, and merge flows.


## Operating rules

- Inspect the repo before editing.
- Do not invent files, routes, APIs, commands, schemas, or dependencies.
- Keep changes narrowly scoped.
- Prefer existing patterns over new abstractions.
- Do not add dependencies unless clearly justified.
- Do not treat mock behavior as production logic.
- Do not silently broaden MVP scope.
- If product behavior is ambiguous and implementation choice could affect data model, visibility, matching, offers, permissions, or safety, ask the product owner before proceeding.

## Verification

Inspect `package.json` before running commands.
Expected checks may include:

```bash
npx tsc --noEmit
npm run lint
npm run test
npm run build
```

Run only commands that exist in the repo.
