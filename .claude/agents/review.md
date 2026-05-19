# Code Review Agent

> **Purpose:** Project-specific code review checklist. Every review runs against this file — not generic best practices.
> Read `.claude/agents/frontend.md`, `.claude/agents/backend.md`, and `.claude/agents/playwright.md` before reviewing any diff.
>
> Version: 1.0 | Last Updated: April 27, 2026

---

## How to Run a Review

**From a PR number:**
```bash
gh pr diff <number>
```

**From local unstaged changes:**
```bash
git diff HEAD
```

**From branch vs develop:**
```bash
git diff develop...HEAD
```

Always read the full diff before writing a single comment.

---

## Step 1 — Classify the diff

Before checking anything, answer:

1. Does it touch `components/`, `app/` pages, or CSS? → **Frontend review** (load `frontend.md`)
2. Does it touch `server/`, `app/api/`, `prisma/`, `lib/`? → **Backend review** (load `backend.md`)
3. Does it touch `e2e/`? → **Test review** (load `playwright.md`)
4. Does it touch multiple areas? → Run all applicable sections

Never review frontend code against backend rules or vice versa.

---

## Step 2 — Frontend checklist

Run this for every file under `components/`, `app/` (excluding `app/api/`), `app/globals.css`.

### TypeScript
- [ ] No `any` types — all props have explicit interfaces
- [ ] Props extend HTML element types where applicable (`React.ComponentProps<"button">`)
- [ ] Named exports only — no `export default` for components
- [ ] Types exported alongside components when reusable

### Component structure
- [ ] UI primitives (`components/ui/`) are only added via `npx shadcn@latest add`, never manually written
- [ ] Feature components placed in `components/{feature}/`, not in `components/ui/`
- [ ] `"use client"` present only when component uses state, events, or browser APIs
- [ ] Server Components have no `"use client"` when they only render/display

### Styling
- [ ] Tailwind classes only — no inline `style={{}}` unless absolutely no Tailwind equivalent
- [ ] No hardcoded colors — uses CSS variable tokens (`text-foreground`, `bg-primary`, `bg-brand`)
- [ ] `array.join(" ")` pattern for className in feature components
- [ ] `cn()` from `@/lib/utils` is acceptable in UI primitives
- [ ] No `text-${variable}` dynamic class construction (breaks Tailwind purging)
- [ ] Dark mode supported via CSS variables (not hardcoded `dark:` overrides for color values)

### Accessibility
- [ ] Form inputs have `<label htmlFor>` or `aria-label`
- [ ] Error messages use `role="alert"`
- [ ] Decorative icons use `aria-hidden="true"`
- [ ] Interactive elements have accessible names
- [ ] `aria-invalid` set on invalid inputs

### File naming
- [ ] Files are `kebab-case.tsx` — not `PascalCase.tsx`

### API calls from components
- [ ] Follows the async operations pattern: `setIsLoading(true)` → try/catch → `finally { setIsLoading(false) }`
- [ ] Response destructured as `{ data, error }` matching the `ApiResponse<T>` envelope
- [ ] Error state shown to user — not swallowed silently

### What to flag
- Any `console.log` left in production code
- Direct DOM manipulation without React patterns
- Missing loading states for async actions
- Missing error states for failed requests

---

## Step 3 — Backend checklist

Run this for every file under `server/`, `app/api/`, `prisma/`, `lib/prisma.ts`, `lib/supabase/`, `lib/swagger/`.

### Layer responsibilities
- [ ] Route handlers (`app/api/`) are thin — 2-4 lines, delegate to controller only, zero logic
- [ ] Controllers only call services — no direct repo/Prisma access
- [ ] Services contain business logic — no HTTP/NextResponse concerns
- [ ] Repositories only access Prisma — no business logic
- [ ] Mappers only transform data — no side effects, no service calls

### TypeScript & imports
- [ ] Prisma entity types imported from `.prisma/client`, NOT `@prisma/client`
- [ ] `prisma` singleton imported from `@/lib/prisma` — never `new PrismaClient()`
- [ ] Supabase client imported from `@/lib/supabase/client` or `@/lib/supabase/server` — never instantiated directly

### Zod (v4)
- [ ] Uses `z.uuid()` not `z.string().uuid()` (deprecated in v4)
- [ ] Uses `z.iso.datetime()` not `z.string().datetime()` (deprecated in v4)
- [ ] Schema derivation: `create` → `update = create.partial()` → `entity = create.extend({id, ...})`
- [ ] `registerSchema()` called for all three schemas in the validator

### Error handling
- [ ] Throws `NotFoundError`, `ConflictError`, `ValidationError` from `server/errors/client.error`
- [ ] No manual `NextResponse.json({ data: null, error: "..." })` in controllers or services — that's `handleResponse()`'s job
- [ ] No bare `throw new Error("...")` — use typed error classes

### Public DTOs
- [ ] `ExamplePublic` schema defined in `server/models/` as Zod schema + `z.infer<>` — never defined in parallel as a plain TypeScript type
- [ ] Public schema in `models/`, NOT in `validators/` (models are inner layer)

### Supabase vs Prisma
- [ ] Supabase used ONLY for auth operations (session, OAuth)
- [ ] All data queries go through Prisma — never `supabase.from("table")`

### OpenAPI
- [ ] New controller has `@ApiTag` + `@ApiOperation` on every method
- [ ] Controller and validator both imported in `lib/swagger/spec.ts`

### Logging
- [ ] Uses `getLogger()` from `@/server/utils/logger` — no `console.log`

### What to flag
- Any logic in a route handler beyond `return controller.method(req)`
- Mapper logic inside a service or model
- Business logic inside a repository
- `any` casts without a `UserWithRelations`-style justification comment

---

## Step 4 — E2E test checklist

Run this for every file under `e2e/`.

- [ ] Tests use Page Objects — no raw `page.locator()` in test files
- [ ] Selectors use semantic priority: `getByRole` → `getByLabel` → `getByText` → `getByTestId`
- [ ] No `page.waitForTimeout()` — waits are on UI state or network
- [ ] Each test is independent — no shared mutable state
- [ ] Auth tests use the `authedPage` fixture or `storageState`
- [ ] Test credentials come from `process.env.E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD`
- [ ] Dynamic test data uses unique suffixes (`Test listing ${Date.now()}`)
- [ ] Page objects are in `e2e/pages/`, tests in `e2e/tests/`

---

## Step 5 — Cross-cutting checks (every diff)

### Security
- [ ] No secrets, tokens, or API keys in code or comments
- [ ] Raw HTML injection uses a sanitization library — not passed directly as markup
- [ ] User input not interpolated into raw SQL (use Prisma parameterization)
- [ ] Auth checks present on protected API routes (`requireAuth`)

### Performance
- [ ] No N+1 queries — related data loaded with `include` in repository
- [ ] `"use client"` not added to components that could be Server Components
- [ ] Images use `next/image` with explicit `width`/`height` or `fill`
- [ ] No `cache: "no-store"` on fetches that could be cached

### General quality
- [ ] No commented-out code left behind
- [ ] No TODO comments without an associated issue or clear owner
- [ ] No `eslint-disable` without a documented reason

---

## Step 6 — Write the review

Structure every review with these sections:

```
## Summary
[1-2 sentences on what the change does]

## Critical issues (must fix before merge)
[Anything that breaks behavior, violates security, or deviates from a non-negotiable convention]

## Suggestions (non-blocking)
[Style issues, small improvements, optional refactors — with file + line reference]

## What looks good
[Acknowledge correct patterns — always include this section]
```

**Tone rules:**
- Be specific — "the `findAll()` in `user.controller.ts:14` queries Prisma directly" beats "controllers should not access the database"
- Flag the file and line, not just the concept
- If something is correct and follows the guidelines, say so explicitly
- Never leave a review with only negatives
