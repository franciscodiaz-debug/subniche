# pull-and-wire

Pulls from `origin develop`, analyzes backend changes, scans the frontend for broken wiring and deferred wire-up markers, generates a dry-run plan, confirms with the user, then executes frontend wiring only — types, API calls, stubs, helpers, and TODOs. Backend is the source of truth; the frontend adapts to it.

**Trigger**: `/pull-and-wire`, "pull and wire", "sync develop", "pull origin develop", "sync backend changes", "absorb backend changes"

---

## When to Use

- User typed `/pull-and-wire` or any trigger phrase above
- Backend team merged new routes, models, validators, or schema changes to `develop`
- User wants to absorb those changes into the frontend systematically
- Use `--audit` flag to scan existing wiring debt without pulling

**Do NOT invoke when:**
- Backend files have unresolved conflict markers
- User has uncommitted frontend changes (stash first or warn)

---

## Critical Patterns

### Pattern 0: Backend is the source of truth

This workflow NEVER modifies backend files. If frontend code is broken by a backend change, the frontend adapts. If a backend type is renamed, update the frontend import — not the backend.

**Hard scope fence — wiring-agent prompt must repeat this verbatim:**
```
NEVER touch these paths:
- server/**
- app/api/**
- prisma/**
- lib/swagger/**
- lib/prisma.ts
- lib/supabase/**
```

If wiring requires a backend change, add a comment stub in the frontend file and flag it in the summary as "NEEDS BACKEND".

### Pattern 1: Two type ownership patterns — respect both

This project uses two valid patterns. Never force a migration between them unless the user asks:

- **Pattern A** (direct import): `import { ListingPublic } from "@/server/models/listing.model"` — component imports directly from backend model. When the model field changes, update the component's usage, not the import path.
- **Pattern B** (lib/types.ts): `import { DiscoverListing } from "@/lib/types"` — hand-synced frontend type. When the backing model changes, update `lib/types.ts` to match.

The same domain concept may exist in BOTH patterns with different shapes (`DiscoverListing` vs `ListingPublic`). Do NOT collapse them — ask the user if the shapes need syncing.

### Pattern 2: MOCK_* constants are first-class wire targets

Grep for `MOCK_` in `components/` and `app/`. Each constant is a deferred wire-up. For each:
1. Match it to a backend route (new or existing) based on what data it mocks
2. If a matching route exists → add to wiring plan: replace with `apiClient<T>()` call
3. If no matching route exists → add to summary under "Pending"

### Pattern 3: Memory files contain pre-existing wire instructions

Read `.claude/memory/INDEX.md` and all linked files in preflight. These files explicitly document "backend needed" or "wire to GET /api/X" instructions from previous sessions. They are more reliable than diff-inferred work.

### Pattern 4: One decision at a time

Build a `pending_decisions[]` list during plan synthesis. Pop and ask decisions one at a time. Wait for the full user answer. Record it. Only then ask the next. NEVER show a numbered list of questions all at once.

Deterministic fixes (broken call signature, missing new field in type) go directly into the plan — no question needed.

Decisions required:
- New Prisma migration files → "N new migration(s) detected: [list]. Apply with `prisma migrate deploy`?" (Phase 1.5, asked before diff scan)
- New route with no frontend consumer → "Create a helper stub in `lib/api/[resource].ts`?" (default: yes, create stub)
- Removed field that frontend uses → "Field `X.y` removed. Auto-remove from types, or manual review?"
- Same type name in both `lib/types.ts` and `@/server/models/` → "Both define [TypeName]. Sync `lib/types.ts` to match, or keep separate?"
- Direct server model import that a removed field breaks → "Component [file] imports from `@/server/models/` and uses removed field `X.y`. Auto-fix usage or flag for manual review?"

### Pattern 5: Dry-run gate — no files touched until confirmed

Show the full wiring plan as a markdown table before Phase 8. If the user says no, abort cleanly. Only after explicit confirmation does the wiring-agent execute.

### Pattern 6: apiClient vs raw fetch — match what the file already uses

- Client components → `apiClient<T>(path, options)` from `@/lib/api-client`
- Server components / page-level data fetching → raw `fetch(${baseUrl}/api/...)`

Never introduce `apiClient` into a server component. Never introduce raw `fetch` into a client component. Check the first few imports of the target file to determine which pattern it uses.

### Pattern 7: TODO.md is structured — insert in the right section

`TODO.md` has section headers (e.g., `## 🔐 Auth`, `## 📦 Listings`). When adding new wire-up TODOs, find the matching section by resource name and insert there. When resolving a TODO, remove the `- [ ]` line entirely and note the resolution in the run summary. Never append all new TODOs at the bottom.

### Pattern 8: Emit a wiring memory file after every run

After Phase 9 summary, write `.claude/memory/wiring-YYYY-MM-DD.md` with: what was wired, what is still mocked, what decisions were made. Add an entry to `.claude/memory/INDEX.md` if the file is new.

---

## Phase Sequence (must follow in order)

```
Phase 0: PREFLIGHT
Phase 1: GIT PULL          (skip if --audit flag)
Phase 1.5: MIGRATION CHECK (skip if --audit flag — detect new migrations, ask user, apply if confirmed)
Phase 2: DIFF SCAN         (sub-agent A — diff-scanner)
Phase 3: IMPACT SCAN       (sub-agent B — impact-scanner, needs Phase 2 output)
Phase 4: CHANGE DIGEST     (orchestrator, inline — show user what changed and why)
Phase 5: PLAN SYNTHESIS    (orchestrator, inline)
Phase 6: DECISION LOOP     (orchestrator, one question at a time)
Phase 7: DRY-RUN DISPLAY   (show wiring plan, require confirmation)
Phase 8: EXECUTE           (sub-agent C — wiring-agent, scope-fenced)
Phase 9: SUMMARY + MEMORY  (orchestrator, emit wiring memory file)
```

---

## Decision Tree

```
/pull-and-wire [--audit]
│
├── --audit flag?
│   └── YES → skip to Phase 3 (scan existing MOCK_* and TODOs only)
│
├── Phase 0: read frontend.md, backend.md, .claude/memory/**
│   └── FAIL → abort "cannot read project docs, run from project root"
│
├── Phase 1: git pull origin develop
│   ├── conflict in server/ app/api/ prisma/ → ABORT
│   │   "Conflicts in backend files — resolve manually first"
│   ├── conflict in frontend files only
│   │   → warn: list skipped files, proceed on clean files
│   ├── already up to date
│   │   → ask: "Nothing new from develop. Scan existing wiring debt anyway?"
│   └── success → continue
│
├── Phase 1.5: MIGRATION CHECK
│   ├── run: git diff ORIG_HEAD HEAD --name-only -- prisma/migrations/
│   ├── no new migration files → skip, continue
│   └── N new migration files found
│       → ask (one question, then STOP):
│         "N new Prisma migration(s) detected:
│          - prisma/migrations/20240501_add_activity_table/
│          Apply them now with `prisma migrate deploy`?"
│       ├── YES → run: npx prisma migrate deploy && npx prisma generate
│       │         → note in Phase 9 summary: "Migrations applied"
│       │         → continue to Phase 2
│       └── NO  → note in Phase 9 summary: "Migrations pending — Prisma types may be stale"
│                 → continue to Phase 2
│
├── Count backend-touching changed files
│   └── >40 files → ask: "Large diff. Focus on specific resource or all?"
│
├── No backend files changed?
│   └── "No backend changes detected — nothing to wire" → exit
│
├── Phase 4: show Change Digest (no confirmation needed — informational only)
│   └── continue automatically to Phase 5
│
├── Phase 5: plan synthesis
│   ├── new route, no consumer → add to decisions
│   ├── broken call signature → auto-plan fix (no question)
│   ├── removed field in use → add to decisions
│   ├── type collision (both patterns) → add to decisions
│   └── MOCK_* with matching new route → auto-plan wire
│
├── Phase 6: pop decisions one at a time → wait → record answer
│
├── Phase 7: show dry-run report
│   ├── user says NO → abort cleanly, no files touched
│   └── user says YES → Phase 8
│
└── Phase 8: wiring-agent executes
    └── runs npx tsc --noEmit at the end
        ├── errors in touched files → flag in summary
        └── clean → Phase 9 summary
```

---

## Sub-agent Prompts

### diff-scanner (model: sonnet)

```
You are a backend diff analyzer. Your ONLY job is to parse a git diff and
extract structured information. Do NOT write any files.

You have been given:
1. The raw output of: git diff ORIG_HEAD HEAD -- server/ app/api/ prisma/ lib/swagger/
2. The project backend conventions (backend.md)

Parse and return a JSON object with this exact shape:
{
  "new_routes": [{ "method": "GET|POST|PUT|DELETE|PATCH", "path": "/api/...", "controller_method": "...", "auth_required": true|false }],
  "modified_routes": [{ "method": "...", "path": "...", "old_signature": "...", "new_signature": "...", "breaking": true|false }],
  "removed_routes": [{ "method": "...", "path": "..." }],
  "new_models": [{ "name": "TypeName", "fields": ["fieldName: type"], "source_file": "server/models/..." }],
  "modified_models": [{ "name": "TypeName", "added_fields": [...], "removed_fields": [...], "changed_fields": [...] }],
  "new_validators": [{ "name": "SchemaName", "fields": [...] }],
  "schema_changes": [{ "prisma_model": "...", "change_type": "new_field|removed_field|new_model", "details": "..." }],
  "commit_messages": ["string"]
}

For renamed files: a delete + add pair with high similarity is a rename —
treat it as a modified_model, not a removal.

Return ONLY the JSON. No commentary.
```

### impact-scanner (model: sonnet)

```
You are a frontend impact analyzer. You receive the diff-scanner JSON
(attached below) and must search the frontend codebase for wiring issues.

Use Glob and Grep tools to scan: components/**, app/**/page.tsx, app/**/layout.tsx,
lib/types.ts, lib/api/**, hooks/**

For each item in the diff, find:
1. Existing apiClient or fetch calls to the changed route
2. Direct imports from @/server/models/ in frontend files
3. MOCK_* constants that match what the new/changed route provides
4. TODO or FIXME comments referencing the changed route or model
5. Types in lib/types.ts that mirror changed server models

Return a JSON object:
{
  "broken_calls": [{ "file": "...", "line": 0, "current_path": "/api/...", "issue": "..." }],
  "stale_types": [{ "type_name": "...", "location": "lib/types.ts", "what_changed": "..." }],
  "direct_server_imports": [{ "file": "...", "import_path": "...", "affected_by": ["ModelName"] }],
  "mock_targets": [{ "file": "...", "constant": "MOCK_...", "matching_route": "GET /api/..." }],
  "resolved_todos": [{ "file": "...", "line": 0, "content": "...", "resolved_by": "/api/..." }],
  "pending_todos": [{ "file": "...", "line": 0, "content": "..." }]
}

Return ONLY the JSON. No commentary.

[DIFF-SCANNER OUTPUT ATTACHED HERE]
```

### wiring-agent (model: sonnet)

```
You are the wiring executor. You implement ONLY what is in the confirmed plan
below. You do NOT add, remove, or improve anything beyond the plan.

HARD SCOPE FENCE — you are FORBIDDEN from touching:
- server/**  |  app/api/**  |  prisma/**  |  lib/swagger/**
- lib/prisma.ts  |  lib/supabase/**

If the plan asks you to change a backend file, skip it and note it as SKIPPED.

Project frontend conventions are provided below. Follow them exactly.

The apiClient wrapper signature is:
  apiClient<T>(path: string, options?: RequestInit)
  → Promise<{ res: Response; data: T | null; error: string | null }>

For new API helper stubs, create them in lib/api/[resource].ts following:
  export async function get[Resource](...): Promise<{ data: T | null; error: string | null }> {
    return apiClient<T>("/api/[resource]")
  }
  // TODO: wire into component — stub generated by pull-and-wire

When editing TODO.md: read it fully first, then insert new items in the
matching section by resource name. Remove resolved items entirely.

After ALL edits are complete, run: npx tsc --noEmit
Report any TypeScript errors in files you touched.

[CONFIRMED WIRING PLAN ATTACHED HERE]
[FRONTEND.MD ATTACHED HERE]
[USER DECISIONS ATTACHED HERE]
```

---

## Output Format

### Change Digest (Phase 4)

Plain language. No tables. Shown automatically after the impact scan — no confirmation needed.
Infer the "why" from commit messages and the code context (new service name, feature flag, etc.).

```markdown
## What changed — [date]

### What the backend team built
- **Activity tracking** — Two new endpoints: `GET /api/user/activity` and `POST /api/user/activity`.
  The commit message says "feat: activity tracking for looking-for feature". This is the backend
  for the activity feed we've had mocked since [date].

- **Listing filters** — `GET /api/niche/[slug]/listing` now accepts `activity_type` as an
  optional query param. Non-breaking — existing calls without it still work.

### Breaking changes
- `ListingPublic.for_sale` field was **removed**. The backend merged it into a `statuses[]`
  array. Two frontend files use this field directly and will break.

### What this unlocks for us
- `MOCK_ACTIVITY` in `components/profile/activity-tab.tsx` can now be replaced with a real call
- TODO "wire activity feed" (activity-tab.tsx:88) is now resolvable

### Frontend impact at a glance
- 2 broken call signatures
- 1 MOCK_* constant ready to wire
- 1 TODO resolved by new endpoints
- 3 types need updating in lib/types.ts
- ⚠️ 1 breaking field removal needs manual decision
```

---

### Dry-run report (Phase 7)

```markdown
## Wiring Plan — [date]

### Files to update
| File | Change | Type |
|------|--------|------|
| lib/types.ts | Add `UserActivity` interface | Type sync |
| components/profile/activity-tab.tsx | Replace MOCK_ACTIVITY with apiClient call | API wire |
| lib/api/activity.ts (NEW) | Stub for GET /api/user/activity | Helper stub |

### TODOs to resolve
- [x] Wire activity feed → resolved by GET /api/user/activity (activity-tab.tsx:88)

### New TODOs to add
- [ ] GET /api/user/preferences — backend added, no frontend consumer yet

### Skipped (conflict or manual review needed)
- components/listing/create-listing-screen.tsx — conflict markers present

### Will NOT touch (backend)
- server/services/activity.service.ts
```

### Run summary (Phase 9)

```markdown
## pull-and-wire — [date]

### Wired
- lib/types.ts: added UserActivity, ActivityType
- components/profile/activity-tab.tsx: wired GET /api/user/activity (was MOCK_ACTIVITY)
- lib/api/activity.ts: created helper stub

### Flagged
- lib/types.ts:12 — DiscoverListing.for_sale removed from backend; confirm runtime impact
- TS error: components/trade/trade-card.tsx:34 — Property 'for_sale' does not exist on type 'DiscoverListing'

### Pending (no backend yet)
- MOCK_WISHLIST_ITEMS in components/profile/wishlist-tab.tsx — no /api/wishlist route exists yet

### TypeScript check
npx tsc --noEmit → 1 error in touched files (see Flagged)
```

---

## Failure Modes

| Scenario | Action |
|----------|--------|
| No `develop` branch on origin | Abort: "Branch `develop` not found on remote. Check `git remote -v`." |
| Conflict markers in `server/` or `app/api/` | Abort: "Backend conflicts must be resolved by the backend team first." |
| Conflict markers in frontend files only | Warn + skip conflicted files; proceed on clean ones |
| Diff > 40 backend files | Ask: "Large diff. Focus on specific resource (listing, auth, user) or process all?" |
| Same type in both `lib/types.ts` and `@/server/models/` | Decision prompt: never auto-collapse |
| New Prisma migrations in `prisma/migrations/` | Phase 1.5: ask user. If confirmed: `npx prisma migrate deploy && npx prisma generate`. If declined: note "Migrations pending — types may be stale" in summary. |
| wiring-agent introduces TS errors | Report errors in summary; do NOT auto-fix (out of scope) |
| `--audit` with no un-wired code found | "No wiring debt detected — all MOCK_* and TODOs are accounted for." |

---

## Commands

```bash
# Pull and check what changed
git pull origin develop
git diff ORIG_HEAD HEAD --name-only
git diff ORIG_HEAD HEAD --name-only -- server/ app/api/ prisma/ lib/swagger/

# Count backend-touching changes
git diff ORIG_HEAD HEAD --name-only -- server/ app/api/ prisma/ lib/swagger/ | wc -l

# Check for conflict markers
git diff --check

# Detect new migration files after pull (Phase 1.5)
git diff ORIG_HEAD HEAD --name-only -- prisma/migrations/

# Apply pending migrations and regenerate Prisma client
npx prisma migrate deploy && npx prisma generate

# Verify TypeScript after wiring
npx tsc --noEmit

# Audit mode: scan MOCK_* without pulling
grep -r "MOCK_" components/ app/ --include="*.tsx" --include="*.ts" -l
```
