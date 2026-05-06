# Live Prototype URL Inventory

Captured on 2026-04-26. The first pass used the user's Chrome window while deployments were protected. The second pass used Playwright after protection was disabled.

| Slug | URL | Observed purpose | Notes |
| --- | --- | --- | --- |
| `home-feed` | `https://v0-rebuild-g0oaplonk-darwoft-subniche.vercel.app/` | Logged-in personalized home feed | Action-required carousel, trade matches, saved-search feed, followed items, collections/people/community sections, caught-up divider. |
| `home-logged-out` | `https://v0-rebuild-oewmlc1s5-darwoft-subniche.vercel.app/` | Logged-out marketing home | Sign-in/up CTAs, hero, watch cards, listing modules, collection/user modules. |
| `home-onboarding` | `https://v0-rebuild-hphf7dpyj-darwoft-subniche.vercel.app/` | Logged-in onboarding state | Progress tasks for list items, trade interests, and profile completion. |
| `create-listing` | `https://v0-rebuild-k45azn1hm-darwoft-subniche.vercel.app/create-listing` | Add Item / Create Listing flow | Status toggles, category choice, profile context, description/specs/photos/payment/logistics/publishing fields, and product tour overlay. |
| `broken-root` | `https://v0-rebuild-k45azn1hm-darwoft-subniche.vercel.app/` | Dead prototype tab | Root returned 404 with the normal shell, but `/create-listing` is a working product target. |
| `listing-detail` | `https://v0-rebuild-l86r4kq92-darwoft-subniche.vercel.app/listings/tele-butterscotch-2022` | Listing detail | Seller panel, group badges, message/offer/watch/share, image gallery, related seller listings. |
| `market-trade` | `https://v0-rebuild-987hxcadp-darwoft-subniche.vercel.app/` and `/trade` | Market and trade-matching surfaces | For Sale grid with filters; Trade tab separates true matches from inbound interest by card copy. |
| `inbox-offer-flow` | `https://v0-rebuild-tbcoy6gim-darwoft-subniche.vercel.app/inbox` | Inbox with offer thread | User stated offer flow is incomplete. Observed conversation list, offer summary, accept/counter/decline, profile side panel. |
| `profile` | `https://v0-rebuild-bt43es47h-darwoft-subniche.vercel.app/profile` | User profile | Public identity, verification/link badges, stats, profile tabs. |
| `my-stuff` | `https://v0-rebuild-kecmxlvum-darwoft-subniche.vercel.app/my-stuff` | Owner inventory management | Items/Collections tabs, status counts, filters, view density, item actions, independent sale/trade booleans. |

## Evidence Artifacts

Real product evidence is stored on disk:

- Screenshots: `screenshots/live/<slug>/*.png`.
- Traces: `raw-observations/live/*-trace.zip`.
- Capture summary: `raw-observations/live/live-capture-summary.json`.

Older `raw-observations/*.zip` and `screenshots/_capture/*.png` files show the former Vercel auth/login gate. They are not product UI references.
