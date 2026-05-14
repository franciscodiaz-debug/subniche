
## Skill routing

Read `AGENTS.md` first.

For product behavior, treat the files in `docs/ai/` as authoritative. Start with:

1. `docs/ai/product_brain.md`
2. `docs/ai/MVPscope.md`
3. `docs/ai/product_rules.md`
4. the topic-specific doc related to the task

Do not expand MVP scope beyond the documented rules without explicit product-owner instruction.

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff, review this PR → read `.claude/agents/review.md` FIRST, then invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
- Pull develop, sync backend, wire frontend, absorb backend changes → read `.claude/agents/pull-and-wire.md` FIRST, then follow its instructions exactly

## v0 design integration
When the user pastes v0.dev code, mentions "v0", "import this design", or "integrate this component from v0":
- Read `.claude/agents/v0-import.md` FIRST — it is the ONLY source of truth for this workflow
- Do NOT start adapting or writing code until you have read it in full
- Follow every step in order — do not skip the audit or validation checklist

## Model assignment

When delegating work to sub-agents via the Agent tool, use this table to pick the `model` parameter. Cache this table at session start and apply it to every delegation.

| Task type | Model | Reason |
|-----------|-------|--------|
| Architecture review, `plan-eng-review` | `opus` | System-level design decisions require deep reasoning |
| Brainstorming, `office-hours` | `opus` | Creative and strategic thinking |
| Bug investigation, `investigate` | `opus` | Root cause analysis benefits from full reasoning capacity |
| v0 import, frontend coding | `sonnet` | Balanced implementation — speed + quality |
| Ship, deploy, PR creation, `ship` | `sonnet` | Standard multi-step workflow |
| Code review, `review` | `sonnet` | Line-by-line analysis with context |
| QA testing, `qa` | `sonnet` | Systematic exploration |
| Design review, `design-review`, `design-consultation` | `sonnet` | Visual and pattern analysis |
| Health check, `health` | `haiku` | Fast pattern matching, no deep reasoning needed |
| Docs update, `document-release` | `haiku` | Mostly structured writing |
| Checkpoint / save progress | `haiku` | State persistence only |
| Weekly retro, `retro` | `haiku` | Templated summarization |
| Sync backend, `pull-and-wire` | `sonnet` | Sequential sub-agent analysis — diff, impact, wiring |

Model IDs:
- `opus` → `claude-opus-4-7`
- `sonnet` → `claude-sonnet-4-6`
- `haiku` → `claude-haiku-4-5-20251001`

If a phase is not listed, default to `sonnet`.

## Product behavior work
For ANY task that involves product behavior — listings, offers, trade matching, collections, wishlists, profiles, moderation, taxonomy, or notifications:
- Read `.claude/agents/product.md` FIRST
- Then read the specific `docs/ai/` file for that feature area
- Do not implement business logic until you have read both

## QA and E2E testing
For ANY task writing Playwright tests, page objects, fixtures, or E2E helpers:
- Read `.claude/agents/playwright.md` FIRST before writing any test code
- Do not proceed until you have read it in full

## Development work (Fullstack)
All team members can work across the full stack. Before writing any code, read the guide(s) that match what you are touching:

- Touching `server/`, `app/api/`, `prisma/`, `lib/prisma.ts`, `lib/supabase/`, or `lib/swagger/`
  → read `.claude/agents/backend.md` FIRST
- Touching `components/`, `app/` pages, or frontend styling
  → read `.claude/agents/frontend.md` FIRST
- Task spans both (fullstack feature)
  → read BOTH guides before starting any code

Do not write any code until you have read the required guide(s) in full.

## Team Memory
Shared learnings committed to the repo. Read the index before starting any task:
- Index: `.claude/memory/INDEX.md`
- Add a new file under `.claude/memory/` whenever a decision, discovery, or convention is worth preserving for the whole team.
