# Product Docs Integration

**Date:** 2026-05-04
**Source:** Client/PO package — subniche_ai_docs_package_v4

## What was done

All 16 product documentation files from the PO were integrated into the project under `docs/ai/`.
A new AI agent guide was created at `.claude/agents/product.md` to bridge the product docs with
the existing instruction system.

The frontend/backend lane restriction was removed. All developers can now work fullstack.

## docs/ai/ — ownership and rules

- **Owner:** PO/client. These files are NOT to be edited by the dev team.
- When the PO delivers an updated docs package, replace the files in `docs/ai/` verbatim.
- If a product rule seems wrong or incomplete, flag it to the PO — do not edit the doc.

## Files in docs/ai/

| File | What it covers |
|------|----------------|
| `product_brain.md` | Core positioning, differentiators, anti-goals |
| `MVPscope.md` | Authoritative MVP in/out list |
| `product_rules.md` | Behavioral rules: listing states, offers, archive, delete |
| `terminology_and_data_model.md` | Canonical terms + deprecated terms |
| `visibility_and_privacy.md` | Public vs discoverable, collection states, access control |
| `trade_matching.md` | 2-way/1-way match, criteria-complete logic, value requirements |
| `offers_and_messaging.md` | Offer states, messaging threads, counter-offers, expiry |
| `taxonomy_and_admin.md` | Admin panel: niches, categories, attributes, pending values |
| `profiles_search_onboarding.md` | Username, niche profiles, deferred signup, draft preservation |
| `notifications.md` | Which notifications to send and when |
| `moderation_and_safety.md` | Block, report, suspension, super-admin queue |
| `design_and_tone.md` | Product feel, voice, UI patterns, trade language |
| `verification_and_workflow.md` | Pre-code checklist, sensitive areas, test expectations |
| `post_mvp_and_open_questions.md` | Deferred features — communities, payments, reputation |
| `current_state.md` | MVP assumptions snapshot |
| `changelog_from_original_docs.md` | What changed from original v1 docs to v4 |

## Deprecated terminology (quick reference)

| Use | Never use |
|-----|-----------|
| Item | Product, Asset |
| Owned item | Inventory item |
| Listing | Post, Ad |
| Wishlist item | Wanted item, Want |
| Trade interest | Trade preference |
| 2-way match | True Match, Full Match |
| 1-way match | Partial match |
| Criteria-complete | Full Match, True Match |
| Possible Match | Near Match |

## Fullstack change

As of 2026-05-04, all developers can work across frontend and backend.
The technical guidelines in `backend.md` and `frontend.md` remain mandatory — they now apply
to whoever touches that layer, regardless of their usual domain.
When a task spans both layers, both guides must be read before starting.
