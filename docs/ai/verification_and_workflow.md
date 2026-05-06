# Verification and Workflow

## Before changing code

Read:

1. `AGENTS.md`
2. `docs/ai/MVPscope.md`
3. `docs/ai/product_rules.md`
4. the topic-specific doc relevant to the task

Then inspect the repo.

## Do not invent implementation details

Do not invent:

- routes,
- APIs,
- schemas,
- database tables,
- commands,
- dependencies,
- background jobs,
- external integrations.

Prefer existing repo patterns.

## Scope discipline

Do not add post-MVP features unless explicitly directed.

Common scope traps:

- communities,
- comments,
- forums,
- likes/reactions,
- reputation systems,
- verification badges,
- payment processing,
- escrow,
- shipping labels,
- cross-niche offers,
- numeric match scores,
- Near Miss recommendations.

## Product-rule sensitive areas

Ask product owner before making unconfirmed changes to:

- data model/entity relationships,
- visibility/permission behavior,
- trade matching logic,
- offer state transitions,
- archive/delete behavior,
- taxonomy/admin rules,
- account/profile identity,
- moderation/blocking behavior.

## Verification commands

Inspect `package.json` before running commands.

Common expected checks may include:

```bash
npx tsc --noEmit
npm run lint
npm run test
npm run build
```

Only run commands that exist in the repo.

## Testing expectations

When implementing relevant features, test at least these behavior classes:

- public vs private visibility,
- collection visibility conversion,
- listing visibility,
- for-trade listing publication blocked when stated trade value is missing,
- for sale + trade listing uses asking price as trade value for MVP,
- wishlist visibility,
- active vs pending vs archived vs deleted item behavior,
- 2-way and 1-way match eligibility,
- criteria-complete vs Possible Match behavior,
- offer state transitions,
- auto-decline on accepted offer conflicts,
- deletion placeholders in messages/offers,
- super-admin taxonomy changes preserving existing data.

## Commit hygiene

Keep changes focused. Avoid broad rewrites.

When modifying product rules/docs, update related topic files and avoid contradictions.
