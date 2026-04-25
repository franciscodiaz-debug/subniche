# Claude Project Instructions

You are assisting with the SubNiche codebase.

## Source of truth

Before making meaningful changes, read:

- `/docs/product_overview.md`
- `/docs/design_system.md`
- `/docs/component_inventory.md`
- `/docs/page_inventory.md`
- `/docs/interaction_rules.md`
- `/docs/data_model.md`
- `/docs/implementation_plan.md`

## Product summary

SubNiche is a niche-first marketplace for enthusiast communities. It supports listings, collections, profiles, communities, trade interests, trade matching, offers, and messaging.

The product should feel like a focused club/community marketplace, not a generic classifieds app or SaaS dashboard.

## Rules

- This repo is the source of truth.
- v0 exports are reference material only.
- Do not copy v0 code directly unless explicitly instructed.
- Use `/docs/design_system.md` before creating or modifying UI.
- Reuse existing components before creating new ones.
- Do not invent new visual styles.
- Do not change database/schema assumptions without updating `/docs/data_model.md`.
- Keep mock data isolated in clearly named files.
- Prefer small, reviewable changes.
- Before major edits, produce a short implementation plan.
- Do not push directly to `main`.
- Do not create backend complexity unless requested.
- Favor clean, modular, production-oriented code over prototype hacks.

## UI rules

- Use shared components.
- Use consistent spacing, typography, radius, borders, and card treatments.
- Page-specific creativity is allowed only inside the established design system.
- If a new component pattern is needed, update `/docs/component_inventory.md`.

## Workflow

For each feature:

1. Read relevant docs.
2. Inspect existing components.
3. Propose implementation plan.
4. Build using shared components.
5. Keep mock data separate.
6. Run available checks.
7. Summarize what changed.
