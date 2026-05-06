# SubNiche AI Documentation Index

This folder contains the authoritative product and implementation context for AI coding agents working on SubNiche.

## Read order

1. `product_brain.md` — product intent and positioning
2. `MVPscope.md` — what is in/out of MVP
3. `product_rules.md` — highest-level product behavior rules
4. `terminology_and_data_model.md` — shared product terms and core object model
5. `visibility_and_privacy.md` — item, collection, listing, wishlist visibility rules
6. `trade_matching.md` — match direction, criteria satisfaction, trade-interest behavior
7. `offers_and_messaging.md` — messaging, offers, counter-offers, expiration, completion
8. `taxonomy_and_admin.md` — niche taxonomy and super-admin tools
9. `profiles_search_onboarding.md` — niche profiles, search, onboarding, deferred signup
10. `notifications.md` — notification rules
11. `moderation_and_safety.md` — block/report/moderation baseline
12. `design_and_tone.md` — product voice and interface tone
13. `verification_and_workflow.md` — implementation and verification rules
14. `post_mvp_and_open_questions.md` — intentionally deferred scope

## Important current MVP decisions

- No communities in MVP.
- No comments, forums, reactions, or discussion posts in MVP.
- No payment processing, escrow, shipping labels, or checkout in MVP.
- Initial launch may focus on roughly three seeded niches, but the architecture must be multi-niche.
- MVP includes a desktop-only super-admin control panel for product-owner taxonomy/niche configuration.
- Trade matching is a core MVP feature.
- Use `2-way match`, `1-way match`, and `criteria-complete`; do not use `True Match` or `Full Match`.

## Agent reminder

These docs are intended to steer development. They are not marketing copy. When implementing, prefer explicit rules over vibes.
