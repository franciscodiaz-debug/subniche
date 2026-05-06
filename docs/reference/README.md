# Prototype Reference Package

This directory records live v0 prototype behavior as implementation constraints for Purple Door / SubNiche.

The first pass was observed through the user's Chrome tabs because Vercel deployment protection blocked terminal/Playwright access. After protection was disabled, Playwright captured the real feature pages.

Current evidence:

- Real screenshots: `screenshots/live/<slug>/*.png`.
- Real Playwright traces: `raw-observations/live/*-trace.zip`.
- Capture summary: `raw-observations/live/live-capture-summary.json`.

Legacy evidence:

- `raw-observations/*.zip` and `screenshots/_capture/*.png` show the former Vercel auth/login gate, not product UI. Keep them only as access-history evidence.

Use these files before implementing matching production behavior:

- `url_inventory.md` lists the observed prototype URLs and what each represented.
- `observation_protocol.md` defines how to observe future live prototype URLs.
- `pages/*.md` records observed layout, behavior, states, and acceptance criteria candidates.
- `interaction_index.md` lists cross-page interactions.
- `open_questions.md` tracks ambiguity and product decisions.
- `reference_test_plan.md` explains the gated Playwright reference tests.

Do not treat prototype quirks as final product rules unless they are documented here as observed and intentional.
