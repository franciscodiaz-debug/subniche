# Stabilization Status

Last updated: April 27, 2026

## Current State

The local app is now a broad, high-fidelity prototype. Core screens exist for:

- Home and onboarding
- Market and Trade
- Add Item and Create Listing
- Listing detail
- Profile
- My Stuff and Collections
- Communities
- Inbox and offer handling
- Settings

The app is still mock-data driven. It is suitable for product/design validation, interaction review, and frontend implementation planning. It is not yet production-backed.

## Verified Baseline

Latest passing checks:

```txt
npm run lint
npm run typecheck
npm run test:e2e -- --project=chromium
```

The Chromium Playwright suite currently covers the major user-facing routes and several mobile/touch interaction paths.

## Important Constraints

- v0 screenshots and exports are reference material only.
- Production components should keep using the local shared design system and mock data boundaries.
- Add Item, Inbox offers, save buttons, settings, and collection actions currently simulate state locally; they do not persist to a backend.
- The reference artifact folder is large because it includes screenshots and traces. Decide intentionally what should be committed before making a checkpoint.

## Next Stabilization Priorities

1. Make a git checkpoint after deciding whether to include heavy reference traces.
2. Keep extracting duplicated route setup into shared page-level components.
3. Replace user-facing prototype/demo copy with product-ready temporary states.
4. Separate mock data access from future persistence boundaries.
5. Add lightweight smoke coverage for route aliases such as `/create-listing` and `/collection/:id`.
6. Start the real-build track: auth, database schema, uploads/storage, and persisted listing/offer/collection actions.
