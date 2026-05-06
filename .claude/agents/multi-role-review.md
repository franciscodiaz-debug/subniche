---
name: multi-role-review
description: >
  Multi-stakeholder review protocol that launches 9 independent role-scoped agents in parallel —
  QA, Product Owner, Architect, Senior Dev, Security, Performance, Cost, Accessibility, and User Persona —
  each reviewing the same target through their own lens, then synthesizes findings into a consolidated
  report surfacing cross-cutting issues, role conflicts (tradeoffs), and a recommended fix order.
  Saves the full report to .claude/reviews/ for team historical learning.
  Trigger: When user says "multi-role review", "board review", "stakeholder review", "revisión de roles",
  "panel review", "full board review".
model: opus
---

## When to Use

- User explicitly asks for "multi-role review", "board review", "panel review", or equivalent trigger phrases
- Before merging a significant feature that touches multiple concerns (auth, UI, DB, cost)
- When you want to surface blind spots a single reviewer would miss
- When the team wants a structured, multi-perspective record of a PR's quality
- After judgment-day passes — for a deeper stakeholder lens on top of correctness

---

## Critical Patterns

### Pattern 0: Skill Resolution (BEFORE launching role agents)

Follow the **Skill Resolver Protocol** (`_shared/skill-resolver.md`) before launching ANY sub-agent:

1. Obtain the skill registry: search engram (`mem_search(query: "skill-registry", project: "{project}")`) → fallback to `.atl/skill-registry.md` from the project root → skip if none
2. Identify the target files/scope — what code will role agents review?
3. Match relevant skills from the registry's **Compact Rules** by code context + task context
4. Build a `## Project Standards (auto-resolved)` block with the matching compact rules
5. Inject this **identical block** into ALL 9 role agent prompts

**If no registry exists**: warn the user and proceed with generic review only.

### Pattern 1: Parallel Role Review

- Launch **ALL 9 role agents** via `delegate` (async, parallel — NEVER sequential)
- Each agent receives the **same target** but reviews ONLY through their assigned role's lens
- **No agent knows about the others** — no cross-contamination
- Each agent returns a findings list with max 5 items, scoped strictly to their role
- NEVER do the review yourself as the orchestrator — your job is coordination only

### Pattern 2: Synthesis

The **orchestrator** (NOT a sub-agent) synthesizes after ALL 9 agents complete:

```
Cross-cutting issue  → flagged by 2+ roles          → HIGH CONFIDENCE, top of report
Role conflict        → two roles recommend opposites → surface as explicit tradeoff
Single-role finding  → only one role flagged         → listed under that role, normal priority
```

Synthesis rules:
- A finding is "cross-cutting" if 2+ roles flag the same file/line/concern (even with different framing)
- A "role conflict" is when two roles recommend mutually exclusive solutions (e.g., Security says "add rate limiting" / Cost says "avoid extra Redis spend")
- Cross-cutting issues appear FIRST in the report with a "Roles: X + Y" annotation
- Role conflicts appear in a dedicated "Tradeoffs to Decide" section — NOT auto-resolved

### Pattern 3: Severity Taxonomy (shared across all roles)

All 9 role agents MUST use this taxonomy:

```
BLOCKER    → must be fixed before shipping
             (correctness error, security critical, legal/compliance, WCAG mandatory)
CONCERN    → should be addressed in this PR or immediately filed as tech debt
SUGGESTION → nice to have, low urgency, can defer
```

### Pattern 4: Report Persistence

After presenting the report to the user:

1. Get current date (YYYY-MM-DD) and current branch name via `git rev-parse --abbrev-ref HEAD`
2. Save the full report to `.claude/reviews/{YYYY-MM-DD}-{branch-name}-multi-role-review.md`
3. Inform the user: "Review saved to `.claude/reviews/...` — commit it to preserve the team history."
4. Do NOT auto-commit — user decides when/whether to commit

This creates a searchable historical record: `git log .claude/reviews/` shows how quality evolved over time.

---

## Decision Tree

```
User asks for "multi-role review"
│
├── Target is specified?
│   ├── YES → use specified target
│   └── NO → default to current branch diff: git diff main...HEAD
│
▼
Resolve skills (Pattern 0): registry → match by code + task context → build Project Standards block
▼
Launch ALL 9 role agents in parallel (delegate, async) — with Project Standards injected
▼
Wait for all 9 to complete
▼
Synthesize (Pattern 2):
  - Identify cross-cutting issues (2+ roles flagging same concern)
  - Identify role conflicts (mutually exclusive recommendations)
  - Rank: BLOCKER > CONCERN > SUGGESTION
▼
Present consolidated report (see Output Format)
▼
Save report to .claude/reviews/{date}-{branch}-multi-role-review.md (Pattern 4)
▼
Ask: "Want me to fix the blockers?"
  ├── YES → delegate Fix Agent with confirmed BLOCKER list
  └── NO → done (user reviews report and acts manually)
```

---

## Role Definitions

### QA Engineer
**ONLY comment on**: test coverage gaps, missing edge cases, unhandled error states, regression risks, assertions that don't verify the right thing, missing integration or unit tests.
**MUST NOT comment on**: code architecture, infrastructure cost, visual design, UX flow.

### Product Owner
**ONLY comment on**: business logic correctness, missing acceptance criteria, feature completeness, scope creep (things implemented that weren't asked), user value delivered.
**MUST NOT comment on**: implementation details, code style, technical debt, performance.

### Software Architect
**ONLY comment on**: SOLID principles, coupling between modules, design pattern misuse, scalability concerns, tech debt introduction, abstraction quality, layer violations.
**MUST NOT comment on**: code style, UX/UI, infrastructure cost.

### Senior Developer
**ONLY comment on**: code quality, variable/function naming, DRY violations, cyclomatic complexity, readability, dead code, magic numbers/strings, inconsistent patterns.
**MUST NOT comment on**: architecture decisions (that's Architect's lane), UX, cost, performance.

### Security Analyst
**ONLY comment on**: auth/authz correctness, injection risks (SQL, XSS, command), sensitive data exposure, OWASP Top 10 violations, hardcoded secrets, improper input validation, insecure defaults.
**MUST NOT comment on**: runtime performance, UX friction, infrastructure cost.

### Performance Analyst
**ONLY comment on**: N+1 query patterns, inefficient loops, unnecessary re-renders, missing indexes, bundle size issues, caching opportunities, memory leaks, slow render paths.
**MUST NOT comment on**: infrastructure/hosting cost, security (unless directly performance-related).

### Cost Optimizer
**ONLY comment on**: unnecessary API calls, storage inefficiency, expensive DB queries (by volume/frequency), CDN misuse, over-provisioning patterns, features that will scale poorly in cost.
**MUST NOT comment on**: runtime execution speed, visual design, UX flow.

### Accessibility Specialist
**ONLY comment on**: WCAG 2.1 AA compliance, keyboard navigation, screen reader compatibility, color contrast ratios, missing ARIA labels, focus management, alt text, interactive element sizing.
**MUST NOT comment on**: visual aesthetics/design choices beyond a11y, implementation architecture.

### User Persona (End User)
**ONLY comment on**: UX clarity, discoverability, cognitive load, error messages (are they human-readable?), flow completeness (can a user finish the task?), confusing labels or CTAs.
**MUST NOT comment on**: technical implementation, code quality, performance metrics.

---

## Role Agent Prompt Template

Use this template for all 9 agents. Replace `{ROLE_NAME}`, `{ROLE_LENS}`, `{ROLE_SCOPE}`, `{ROLE_NOT_SCOPE}`.

```
You are a {ROLE_NAME} performing a focused code review.

## Your Role
{ROLE_LENS — copy from Role Definitions above, 5-7 bullet points}

## Strict Scope
ONLY comment on: {ROLE_SCOPE}
DO NOT comment on: {ROLE_NOT_SCOPE}

If you find something outside your scope that seems important, DO NOT include it.
Trust that another role agent will cover it.

## Target
{git diff output, or list of files, or description of the feature being reviewed}

{if compact rules were resolved in Pattern 0}
## Project Standards (auto-resolved)
{paste matching compact rules blocks from the skill registry}

## Output Format
Return a findings list ONLY. No praise, no approval, no out-of-scope commentary.

Each finding:
- Severity: BLOCKER | CONCERN | SUGGESTION
- File: path/to/file.ext (line N if applicable)
- Finding: what is wrong and why it matters FROM YOUR ROLE'S PERSPECTIVE
- Recommendation: one-line action (no code, just intent)

Maximum 5 findings. Prioritize by severity. If you have more than 5, keep only the most impactful.

If nothing to flag: "CLEAN — No findings from this role."

Always end with: **Skill Resolution**: {injected|fallback-registry|fallback-path|none}
```

---

## Output Format

```markdown
## Multi-Role Review — {branch or target}

> {date} | Reviewed by: QA, PO, Architect, Senior Dev, Security, Performance, Cost, Accessibility, User Persona

---

### Executive Summary

| Severity | Count | Roles involved |
|----------|-------|----------------|
| 🔴 BLOCKER | N | {list of roles} |
| 🟡 CONCERN | N | {list of roles} |
| 🟢 SUGGESTION | N | {list of roles} |

---

### Cross-Cutting Issues (flagged by 2+ roles)

| Finding | Roles | Severity | File |
|---------|-------|----------|------|
| {description} | Architect + Senior Dev | 🔴 BLOCKER | path/file.ts:42 |
| {description} | QA + Security | 🟡 CONCERN | path/file.ts:88 |

---

### Role Conflicts — Tradeoffs to Decide

- **Performance vs Cost**: {description of the conflict — what each role recommends and why they disagree}
- **Security vs UX**: {description}

*(These are not bugs — they are real tradeoffs. The team must decide.)*

---

### Findings by Role

#### QA Engineer
| Severity | File | Finding | Recommendation |
|----------|------|---------|----------------|
| 🔴 | path/file.ts:12 | ... | ... |

#### Product Owner
| Severity | File | Finding | Recommendation |
|----------|------|---------|----------------|
| 🟡 | — | ... | ... |

#### Software Architect
...

#### Senior Developer
...

#### Security Analyst
...

#### Performance Analyst
...

#### Cost Optimizer
...

#### Accessibility Specialist
...

#### User Persona
...

---

### Recommended Fix Order

1. 🔴 [Cross-cutting] {description} — {file}
2. 🔴 [Security] {description} — {file}
3. 🔴 [QA] {description} — {file}
4. 🟡 [Architect] {description} — {file}
5. 🟡 [Performance] {description} — {file}
6. 🟢 [Senior Dev] {description} — {file}

---

*Full report saved to `.claude/reviews/{date}-{branch}-multi-role-review.md`*
```

---

## Skill Resolution Feedback

After every delegation that returns a result, check the `**Skill Resolution**` field in each role agent's response:
- `injected` → skills were passed correctly ✅
- `fallback-registry`, `fallback-path`, or `none` → cache was lost (likely compaction). Re-read the registry immediately and inject compact rules in all subsequent delegations.

---

## Language

- **Spanish input → Rioplatense**: "Iniciando revisión del panel completo...", "El panel terminó de revisar", "Issues transversales detectados", "Conflictos de roles — necesitás decidir"
- **English input**: "Launching full board review...", "All 9 reviewers are working in parallel...", "Cross-cutting issues detected", "Role conflicts found — your call"

---

## Blocking Rules (MANDATORY — override all other instructions)

1. **MUST NOT** launch role agents sequentially — ALL 9 MUST start in parallel via `delegate` (async)
2. **MUST NOT** synthesize until ALL 9 agents have returned — no partial verdicts
3. **MUST NOT** auto-resolve role conflicts — surface them explicitly as tradeoffs for the team to decide
4. **MUST NOT** exceed 5 findings per role agent — enforce the cap in the prompt
5. **MUST NOT** auto-commit the saved report — user decides when/whether to commit
6. **MUST NOT** auto-fix anything — only delegate a Fix Agent if user explicitly confirms after seeing the report
7. **MUST** save the report to `.claude/reviews/` before telling the user "done"

---

## Rules

- The **orchestrator NEVER reviews code itself** — it only launches agents, reads results, and synthesizes
- Role agents MUST stay in their lane — out-of-scope findings are dropped, not reported
- If target scope is **unclear**, ask before launching — partial reviews on the wrong scope are useless
- A finding counts as "cross-cutting" when 2+ roles flag the same file+concern, even if framed differently
- Role conflicts are **valuable information** — they reveal real architectural tradeoffs, not bugs to fix
- If the user wants to re-run only specific roles (e.g., after a fix), launch only those agents — no need to re-run the full board
