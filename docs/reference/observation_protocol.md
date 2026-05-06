# Prototype Observation Protocol

Use this before implementing behavior from a v0 prototype URL.

1. Open only the specific prototype URL the user supplied or opened for observation.
2. Record the page purpose and whether it is logged-in, logged-out, onboarding, owner, buyer, seller, or admin state.
3. Capture the default layout: shell, nav, header, primary content, side panels, cards, forms, and empty areas.
4. Click non-destructive controls only: tabs, filters, sort, dropdowns, drawers, toggles, accordions, gallery controls, and modal open/close controls.
5. Do not submit messages, offers, accept/decline actions, account actions, destructive actions, or permission changes without explicit user confirmation.
6. Separate observations from inferences. If the UI implies a backend rule but does not prove it, record it as an inference or open question.
7. Document all visibly reachable states: default, selected, expanded, filtered, modal, disabled, empty, error, and success if safely reachable.
8. Add or update a matching file in `docs/reference/pages/`.
9. Update `docs/reference/interaction_index.md` and `docs/reference/open_questions.md`.
10. Add reference-test candidates under `playwrighttests/reference-flows/`, gated so they do not run against protected external prototypes during normal local tests.

When Playwright cannot access the prototype because of Vercel auth, use the user's authenticated Chrome window for observation and explicitly mark Playwright artifacts as auth-gated.
