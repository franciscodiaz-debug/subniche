# Reference Test Plan

The first reference tests live at `playwrighttests/reference-flows/prototype-reference.spec.ts`.

They are intentionally gated behind `RUN_PROTOTYPE_REFERENCE=1` because they hit external v0 deployments. Normal local `npm run test:e2e` should not fail because a prototype URL changes, expires, or becomes protected again.

## Tests Created

- Home logged-in, logged-out, and onboarding reference states.
- Add Item / Create Listing status, wishlist branches, and conditional field behavior.
- Market filter and trade selector reference behavior.
- Listing detail offer modal, gallery, group expansion, and watch toggle behavior.
- Inbox offer thread and counter modal behavior.
- Profile tabs and My Stuff owner-inventory controls.

## Not Covered Yet

- Final trade-interest setup because the user said this functionality is incomplete.
- Final inbox accept/decline/counter submission semantics because the user said the offer flow is incomplete.

## Evidence Captured

- Screenshots: `docs/reference/screenshots/live/<slug>/*.png`.
- Traces: `docs/reference/raw-observations/live/*-trace.zip`.
- Summary JSON: `docs/reference/raw-observations/live/live-capture-summary.json`.
- Add Item status matrix screenshots: `docs/reference/screenshots/live/create-listing/status-audit/`.
- Add Item status matrix observations: `docs/reference/raw-observations/live/create-listing-status-audit/`.

## Running Reference Tests

Run:

```bash
RUN_PROTOTYPE_REFERENCE=1 npm run test:e2e -- playwrighttests/reference-flows/prototype-reference.spec.ts --trace on
```

Next implementation pass should convert stable observed behavior into production acceptance tests against the local app.
