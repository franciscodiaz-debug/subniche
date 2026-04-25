# Implementation Plan

This plan is for rebuilding SubNiche into a clean canonical codebase after earlier v0 exploration created design drift and prototype bloat.

## Core rule

Do not merge v0 branches directly.

Use this workflow:

```txt
extract → standardize → rebuild → review → merge
```

## Branch order

### 1. `feature/project-brain`

Create source-of-truth docs and AI instruction files.

Deliverables:

- `/docs/product_overview.md`
- `/docs/design_system.md`
- `/docs/component_inventory.md`
- `/docs/page_inventory.md`
- `/docs/interaction_rules.md`
- `/docs/data_model.md`
- `/docs/implementation_plan.md`
- `CLAUDE.md`
- `AGENTS.md`
- `README.md`

### 2. `feature/v0-reference-import`

Add v0 exports, screenshots, notes, and mobile references.

Suggested structure:

```txt
/v0-reference/homepage-logged-out
/v0-reference/homepage-logged-in
/v0-reference/marketplace
/v0-reference/profile
/v0-reference/add-item
/v0-reference/listing-detail
/v0-reference/collections
/v0-reference/communities
/v0-reference/inbox
```

Important:

These files are reference only. They are not production source.

### 3. `feature/design-system-audit`

Use AI to review all v0 references.

Deliverables:

- updated `/docs/design_system.md`
- updated `/docs/component_inventory.md`
- updated `/docs/page_inventory.md`
- conflict list
- canonical choices

Questions to resolve:

- Which card style wins?
- Which button style wins?
- What is the marketplace grid pattern?
- What is the nav pattern?
- What is the profile layout pattern?
- What mobile patterns are canonical?

### 4. `feature/app-shell`

Build base app structure.

Deliverables:

- routing
- layout shell
- global styles
- desktop nav
- mobile nav
- theme variables
- page container patterns

Avoid full pages at this stage.

### 5. `feature/core-components`

Build foundational reusable components.

Deliverables:

- Button
- Card
- Badge
- Tabs
- Avatar
- PageShell
- SectionHeader
- ListingCard
- ProfileHeader
- CollectionCard
- FilterPanel
- EmptyState
- Modal/Drawer
- Form fields

### 6. `feature/mock-data`

Create consistent mock data.

Deliverables:

- users
- profiles
- listings
- collections
- communities
- trade interests
- messages/offers

Mock data should live in clearly named files and be easy to replace later.

### 7. `feature/marketplace-page`

Build marketplace browse.

Deliverables:

- listing grid
- filters
- search
- category browsing
- listing cards
- market/trade mode entry point
- empty states
- mobile filter drawer

### 8. `feature/listing-detail-page`

Build listing detail.

Deliverables:

- image gallery
- listing metadata
- seller card
- status badges
- trade/wishlist/collection context
- contact/offer CTA
- related listings

### 9. `feature/add-item-flow`

Build item creation.

Deliverables:

- create listing flow
- item status selector
- for sale / for trade / collection / wishlist behavior
- image upload UI
- category/filter fields
- trade interest setup
- review/save step

### 10. `feature/profile-and-collections`

Build user identity surfaces.

Deliverables:

- public profile
- niche-aware profile placeholders
- collections
- owned items
- wishlist items
- for sale / for trade sections
- social proof / verification placeholders

### 11. `feature/homepage-logged-out`

Build marketing surface.

Deliverables:

- hero
- education sections
- trust section
- collections section
- CTA blocks

### 12. `feature/homepage-logged-in`

Build logged-in home.

Deliverables:

- personalized feed
- activation checklist
- recommended listings
- communities
- collections prompts
- trade prompts

### 13. `feature/communities`

Build community surfaces.

Deliverables:

- community overview
- community market
- discussion placeholder
- membership state
- publishing context concepts

### 14. `feature/inbox-offers-trade`

Build communication and offer surfaces.

Deliverables:

- inbox
- message thread
- offer composer
- cash + trade offer
- counteroffer UI
- trade match context

### 15. `feature/design-polish-pass`

Final consistency pass.

Deliverables:

- spacing normalization
- mobile behavior cleanup
- empty states
- loading states
- card consistency
- CTA consistency
- copy tone cleanup

## Development workflow

For each branch:

1. Start from latest `develop`.
2. Make focused changes.
3. Run checks.
4. Push branch.
5. Open PR into `develop`.
6. Review preview deployment.
7. Merge when stable.
8. Delete feature branch after merge.

## AI coding workflow

Use this prompt pattern:

```txt
Read the relevant files in /docs first.

We are working on [branch objective].

Do not edit unrelated areas.

Before coding, provide:
1. implementation plan
2. files you expect to touch
3. risks/conflicts

Then implement using existing design system and components.
```

## v0 usage going forward

v0 is for isolated visual exploration only.

Do not let v0 become the source of truth again.

Accepted v0 workflow:

```txt
v0 experiment
→ export screenshot/code as reference
→ extract design intent
→ update docs if approved
→ implement in canonical repo
```
