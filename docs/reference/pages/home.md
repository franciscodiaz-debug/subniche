# Page: Home

## URLs

- Logged in: `https://v0-rebuild-g0oaplonk-darwoft-subniche.vercel.app/`
- Logged out: `https://v0-rebuild-oewmlc1s5-darwoft-subniche.vercel.app/`
- Onboarding: `https://v0-rebuild-hphf7dpyj-darwoft-subniche.vercel.app/`

## Purpose

Home is both the first-visit marketing surface and the logged-in personalized feed. Logged-in home should make the user's niche activity visible immediately: actions, trade matches, saved-search hits, followed items, followed collections/people, community activity, and broader discovery.

## Observed Layout

The shell has a dark left rail, a centered search bar, and a user/niche switcher in the upper right. Logged-in and onboarding states use a large music-gear hero with stats. Logged-out home adds sign-in/sign-up controls and editorial "why" cards before discovery modules.

Logged-in feed modules observed:

- `Action Required` horizontal cards linking to inbox/messages.
- `Most Recent Trade Matches`.
- `From Saved Searches`.
- `From Items You Follow`.
- `From Collections and People You Follow`.
- `Most Recent From Your Communities`.
- `You're all caught up` divider before broader discovery.
- `Trending Listings` and `Just Listed`.

Onboarding state observed:

- Hero title: `Welcome to sn / MusicGear`.
- Three task rows: `List 3 items` with `2/3`, `Set 3 trade interests` with `1/3`, and `Complete profile` with `100%` in the unprotected capture.
- Each task row exposes a preview/play affordance and an arrow affordance.
- `I'll do this later` is available.

## Observed Interactions

- Logged-out `Join free`, `Start listing`, `Start trading`, `Explore listings`, `Explore collections`, and profile follow CTAs are link-style actions.
- Logged-in action cards navigate to message/offer destinations.
- Onboarding task rows are selectable and visually emphasize the active task. Preview buttons open/activate the task preview area.
- `I'll do this later` appears to dismiss or bypass the onboarding prompt, but this was not clicked during observation.

## States Observed

- Logged-out marketing state.
- Logged-in feed state.
- Logged-in onboarding state.
- Onboarding task rows for list-items, trade-interests, and profile-completion selected.
- Onboarding preview buttons for list-items, trade-interests, and profile-completion selected.
- Caught-up state after personalized feed modules.

## Product Rules Implied

- Home should distinguish logged-out, logged-in normal, and logged-in onboarding states.
- Trade matches are important enough to surface above general discovery.
- Inbound action items should route into inbox/offer handling.
- Onboarding progress should be measurable by items listed, trade interests set, and profile completion.

## Acceptance Criteria Candidates

- Home renders the correct state based on auth/onboarding status.
- Logged-in home shows action-required cards before trade/discovery modules.
- Onboarding shows three progress tasks and a defer control.
- Logged-out home has sign-in/sign-up CTAs and discovery modules without private action cards.

## Open Questions

- Should the onboarding preview media be production video, static preview, or removed for MVP?
- Does `I'll do this later` permanently dismiss onboarding, snooze it, or just hide it for the session?
- Which home modules are MVP-critical versus post-MVP discovery polish?
