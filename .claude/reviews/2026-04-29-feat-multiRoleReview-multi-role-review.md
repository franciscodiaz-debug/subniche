# Multi-Role Review — feat/multiRoleReview

> 2026-04-29 | Reviewed by: QA, Product Owner, Architect, Senior Dev, Security, Performance, Cost, Accessibility, User Persona

---

## Executive Summary

| Severity | Count | Roles involved |
|----------|-------|----------------|
| 🔴 BLOCKER | 18 | All 9 roles |
| 🟡 CONCERN | 22 | All 9 roles |
| 🟢 SUGGESTION | 3 | QA, Security, Senior Dev |

---

## Cross-Cutting Issues (flagged by 2+ roles)

| Finding | Roles | Severity | File |
|---------|-------|----------|------|
| Raw verification token logged at INFO level | Security + Senior Dev | 🔴 BLOCKER | `server/services/auth.service.ts:47` |
| N+1 cover queries in `getAll()` — 21 DB calls at default page size | Performance + Cost | 🔴 BLOCKER | `server/services/listing.service.ts:39-47` |
| Images base64-encoded in JSON body — up to 18MB payload per listing | Cost + Performance | 🔴 BLOCKER | `components/listings/create-listing-screen.tsx:542` |
| 4 form fields (collectionNotes, dateAcquired, acquisitionPrice, extraSpecs) never sent in payload | Product Owner + Senior Dev | 🔴 BLOCKER | `components/listings/create-listing-screen.tsx:431-435` |
| Market brand/condition filters selected by user but silently ignored in filter logic | Product Owner + User Persona | 🔴 BLOCKER | `components/market/market-content.tsx:59-66` |
| `ListingService` directly imports and calls `prisma` — hard layer violation | Architect + Performance + Cost | 🔴 BLOCKER | `server/services/listing.service.ts:54,86,123,152` |
| "Distance: nearest" sort uses `localeCompare` on a string — misleading and semantically wrong | Performance + User Persona | 🔴 BLOCKER | `components/market/market-content.tsx:73` |

---

## Role Conflicts — Tradeoffs to Decide

- **Security vs Cost on image upload**: Security requires server-side magic-byte validation before files reach storage. Cost requires bypassing the API server entirely via pre-signed Supabase Storage URLs (client-direct upload). These goals are mutually exclusive in their pure forms — direct upload eliminates server-side validation opportunity. The team must decide the risk tolerance: validate server-side (pays ingress cost) or validate client-side + Supabase policies (pays trust cost).

- **Accessibility vs Performance on large form component**: Accessibility needs more visible labels and ARIA relationships (adds DOM nodes). Performance wants the 20+ `useState` hooks broken into separate sub-components to limit re-render scope. Both are correct, but splitting into sub-components must be done carefully to preserve label associations and focus management — naive splitting could break ARIA.

*(These are not bugs — they are real tradeoffs. The team must decide.)*

---

## Findings by Role

### QA Engineer

| Severity | File | Finding | Recommendation |
|----------|------|---------|----------------|
| 🔴 | `server/services/listing.service.ts` | No test file exists. `publish()` pre-conditions, `syncStatuses` delete-then-recreate, and `syncAttributes` ID validation are completely untested at the service layer | Create `listing.service.test.ts` covering publish failures, sync strategies, and invalid attribute IDs |
| 🔴 | `server/services/auth.service.test.ts` | `completeRegistration` has no test case where `findUserByCode` returns a user — the "Code already registered" guard is never exercised | Add test asserting `ValidationError` when `findUserByCode` resolves to a user object |
| 🟡 | `server/controllers/listing.controller.test.ts` | `publish` controller tests only cover 401 and 200 — no test for 422 when business pre-conditions fail (missing title, null price, no images) | Add controller tests mocking `listingService.publish` rejecting with `ValidationError` for each pre-condition |
| 🟡 | `server/controllers/listing.controller.test.ts` | `getBySlug` tests never exercise draft-visibility enforcement — non-owner requesting a draft is untested | Add test where `optionalAuth` resolves a different `userId` than listing owner and assert access is denied |
| 🟢 | `server/services/auth.service.test.ts` | No test for login when `banned_at` is set on the user — behavior for banned accounts is undefined in tests | Add login test with `banned_at` set and assert expected error, locking in the intended behavior |

---

### Product Owner

| Severity | File | Finding | Recommendation |
|----------|------|---------|----------------|
| 🔴 | `components/listings/create-listing-screen.tsx:431-435` | `collectionNotes`, `dateAcquired`, `acquisitionPrice`, `extraSpecs` are captured in state and shown in UI but never included in the API payload — user data is silently dropped | Include fields in the listing payload or remove them from the UI until the backend supports them |
| 🔴 | `components/listings/create-listing-screen.tsx:431,1022` | "Publish to Niche" checkbox is rendered and interactive but `publishToNiche` state is never sent to the API — the checkbox has zero effect | Wire `publishToNiche` into the publish call or remove the control until the feature is supported |
| 🔴 | `components/market/market-content.tsx:59-66` | Market page runs entirely on hardcoded mock data; brand and condition filters are reflected in active-chip counts but silently ignored in the filter memo | Replace mock data with real API calls and apply all active filter dimensions |
| 🟡 | `server/services/listing.service.ts:114-118` | `publish()` requires a non-null `price` for all listing types — for-trade and in-collection items have no valid price but are blocked from publishing | Make price requirement conditional on `for-sale` status only |
| 🟡 | `server/validators/auth.validator.ts` + `app/register/niche/page.tsx` | Niche selection page exists at `/register/niche` but there is no niche field in the registration schema or auth flow — key value proposition is unreachable during onboarding | Confirm whether niche selection is deferred post-registration and if so add a mandatory post-login step |

---

### Software Architect

| Severity | File | Finding | Recommendation |
|----------|------|---------|----------------|
| 🔴 | `server/services/listing.service.ts:54,86,123,152` | `ListingService` directly imports and invokes the raw Prisma client in four places (`$transaction` calls and `prisma.attribute.findMany`). Service layer depends on a concrete infrastructure detail, breaks DIP, and leaks Prisma types into method signatures | Introduce a unit-of-work or transaction abstraction; move raw queries into the repository layer |
| 🔴 | `server/repositories/auth.repository.ts:54,89` | `userData as any` cast followed by `as unknown as UserWithRelations` on return — type safety fully disabled at the two most critical write paths in the system (user creation) | Align `CreateUserInput` with `Prisma.UserCreateInput` to eliminate the double cast |
| 🟡 | `server/decorators/require-auth.decorator.ts:13,22` | `@RequireAuth` mutates the incoming `NextRequest` object to attach `.auth` as a side effect — implicit ordering contract between decorator and method, invisible to the type system | Pass auth context explicitly (typed parameter or typed wrapper) rather than mutating the request object |
| 🟡 | `server/services/mediable.service.ts` | `MediaableService` directly calls `prisma.media.findFirst` and `prisma.media.update` — same layer violation as `ListingService`, bypassing `mediaRepository` entirely | Move `fetchCover` and order-update queries into `mediaRepository` |
| 🟡 | `server/controllers/base.controller.ts:24,30` | `@Validate` decorator uses a self-referential cast `(self as BaseController<unknown,unknown,unknown>)` to read schema properties at runtime; `handleResponse` uses unchecked `(err as Error).message` | Type `@Validate` to accept the schema directly; narrow catch block to guard against non-Error throwables |

---

### Senior Developer

| Severity | File | Finding | Recommendation |
|----------|------|---------|----------------|
| 🔴 | `server/services/auth.service.ts:47` | `rawToken` logged at INFO level — any log observer can extract a valid registration token and complete someone else's registration without email access | Remove this log line entirely |
| 🟡 | `components/listings/create-listing-screen.tsx:432-435` | `collectionNotes`, `dateAcquired`, `acquisitionPrice`, `extraSpecs` are declared as state, wired to inputs, but never included in the API payload — dead state masquerading as functional form fields | Include in payload or remove state declarations and UI bindings |
| 🟡 | `server/services/listing.service.ts:132-136,144-148` | The Prisma transaction client type (`Omit<PrismaClient<...>, ...>`) is copy-pasted verbatim across both `syncStatuses` and `syncAttributes` method signatures — 3-line type repeated twice | Extract to a named type alias `PrismaTx` at the top of the file |
| 🟡 | `components/listings/create-listing-screen.tsx:507` | `setTimeout(..., 4000)` — magic number `4000` with no named constant or semantic explanation | Extract to `STATUS_LABEL_HIDE_DELAY_MS` constant near other module-level constants |
| 🟡 | `server/services/auth.service.ts:108` | `validateToken` is an internal helper (only called from two methods) but lacks the `private` modifier — inconsistent with all other helpers in the class | Add `private` modifier to `validateToken` |

---

### Security Analyst

| Severity | File | Finding | Recommendation |
|----------|------|---------|----------------|
| 🔴 | `server/services/auth.service.ts:47` | Plaintext registration token written to application logs — valid token harvestable by any log observer within the 15-minute TTL | Remove log line; if observability needed, log only a non-sensitive correlation ID |
| 🔴 | `server/services/auth.service.ts` / `server/validators/auth.validator.ts` | No rate limiting on registration endpoints; token validator accepts `min(1)` (not enforcing 64-char hex) — high-speed token enumeration attack is viable within the TTL window | Enforce `length(128)` on the token field; apply per-IP/per-email rate limiting on the complete-registration endpoint |
| 🟡 | `middleware.ts` | Requests with no `Origin` header bypass origin validation and reach API routes unauthenticated — any endpoint missing `@RequireAuth` (e.g., accidentally during development) is reachable from arbitrary HTTP clients | Treat absent `Origin` as untrusted for mutating methods unless a valid JWT is present |
| 🟡 | `server/services/listing.service.ts` | `syncStatuses` accepts any `status_id` without verifying the caller is authorized to assign it — if statuses have privilege semantics, authenticated users can self-assign elevated statuses | Restrict assignable statuses to a user-facing allow-list; require elevated role for privileged transitions |
| 🟢 | `components/listings/create-listing-screen.tsx` | Image upload validated client-side via `accept="image/*"` only — server-side magic-byte validation not confirmed; API error messages reflected directly to `formError` | Validate MIME type via magic bytes server-side; sanitize API errors before rendering to the client |

---

### Performance Analyst

| Severity | File | Finding | Recommendation |
|----------|------|---------|----------------|
| 🔴 | `server/services/listing.service.ts:41-46` | `getAll()` fires one `findAllByUser` query then N individual `fetchCover` calls inside `Promise.all` — 21 DB round trips at default limit=20, 101 at max limit=100 | Batch-fetch all covers for the page in one query keyed by listing IDs; hydrate in memory |
| 🔴 | `components/listings/create-listing-screen.tsx:471-481,507` | `useEffect` has no `AbortController` — `setState` calls fire on unmounted component; `setTimeout` in `handleStatusClick` has no cleanup ref — timer fires after unmount | Return abort/cleanup from `useEffect`; store timer ref and clear it on unmount |
| 🟡 | `components/listings/create-listing-screen.tsx:297,303,542` | `URL.createObjectURL` not revoked on the submit path — up to 6 Blob references leak per form submission; `fileToBase64` doubles memory (Blob + base64 string simultaneously) | Revoke all object URLs in `submitListing` after upload; use `FormData` for binary transfer instead of base64 |
| 🟡 | `components/listings/create-listing-screen.tsx:401-438` | 20+ independent `useState` hooks — any field change triggers a full component re-render including all child sub-components | Group related state with `useReducer` or extract sub-components so field updates only re-render the relevant subtree |
| 🟡 | `components/market/market-content.tsx:73` | `"distance"` sort uses `localeCompare` on a display string — ICU collator invoked, produces wrong order semantically, and is slower than numeric comparison | Sort by a numeric distance field pre-computed server-side (or haversine from lat/lng), never a display string |

---

### Cost Optimizer

| Severity | File | Finding | Recommendation |
|----------|------|---------|----------------|
| 🔴 | `components/listings/create-listing-screen.tsx:542-547` | Up to 6 images base64-encoded and sent as JSON — single listing creation can carry an 18MB+ body; base64 inflates binary by ~33% and hits Next.js API route size limits | Replace with multipart/form-data or pre-signed Supabase Storage URLs so binary never traverses the API server |
| 🔴 | `server/services/listing.service.ts:41-46` | N+1 cover queries — 21 DB calls at default page size, 101 at max; dominant cost center at moderate DAU | Batch-fetch covers in a single `findMany` with `mediable_id IN (...)` filter |
| 🟡 | `server/utils/media-processor.ts` | Every image unconditionally produces 3 files (original + thumbnail + resized); original retained in full fidelity; no size cap; no deduplication | Drop originals after variants are generated; enforce max input size; migrate storage to Supabase Storage |
| 🟡 | `components/listings/create-listing-screen.tsx:471-481` | `/api/status` and `/api/attribute` are global reference data fetched fresh on every page mount — no HTTP cache headers, no `revalidate` config — pure wasted DB reads at scale | Add `Cache-Control: public, max-age=300, stale-while-revalidate=3600` to both routes or use Next.js `export const revalidate = 300` |
| 🟡 | `server/services/listing.service.ts:137-162` | `syncStatuses` and `syncAttributes` perform `deleteMany` + `createMany` on every update regardless of whether values changed; `syncAttributes` issues an extra query outside the transaction | Diff incoming values against existing records; skip write cycle when unchanged; move validation query inside the transaction |

---

### Accessibility Specialist

| Severity | File | Finding | Recommendation |
|----------|------|---------|----------------|
| 🔴 | `components/listings/create-listing-screen.tsx` | Subtitle and price inputs have no `<label>` element — only placeholder text, which disappears on input and is not reliably announced by screen readers. Fails WCAG 2.1 SC 1.3.1 and 3.3.2 | Associate a visible or visually-hidden `<label htmlFor>` with each input |
| 🔴 | `components/market/market-content.tsx` | Sort dropdown trigger renders only an icon on small screens (`hidden sm:inline` on label text) with no `aria-label` — icon-only button with no accessible name. Fails WCAG 2.1 SC 4.1.2 | Add a persistent `aria-label="Sort listings"` to the button regardless of viewport |
| 🟡 | `components/market/market-content.tsx` | Active filter chip `<X>` icon has neither `aria-hidden="true"` nor an `aria-label` on the button — screen reader announces an unlabeled button. Fails WCAG 2.1 SC 4.1.2 | Add `aria-hidden="true"` to the X icon and an `aria-label` identifying the filter being removed |
| 🟡 | `components/listings/create-listing-screen.tsx` | Specifications accordion button has `aria-expanded` but no `aria-controls` pointing to the panel — screen readers cannot navigate from control to region | Assign a stable `id` to the collapsible panel; set `aria-controls` on the trigger button |
| 🟡 | `components/listings/create-listing-screen.tsx` | Collection section asterisk is `aria-hidden="true"` with no `aria-required` alternative; condition `<select>` has no associated `<label>`. Fails WCAG 2.1 SC 1.3.1 and 3.3.2 | Remove `aria-hidden` from asterisk or add `aria-required="true"` to the input; associate a `<label>` with the condition select |

---

### User Persona

| Severity | File | Finding | Recommendation |
|----------|------|---------|----------------|
| 🔴 | `components/market/market-content.tsx:59-66` | Brand and Condition filters render as active chips with counts but never filter the listing grid — no error, no empty state, no "coming soon" label. User has no way to complete the task of narrowing the market | Apply the filters in the memo or disable the controls and label them "coming soon" |
| 🔴 | `components/market/market-content.tsx:23-29` | "Distance: nearest" sort produces alphabetical string ordering; "For Sale / Trade" tabs do not change the displayed listings — two prominent UI controls that appear functional but are not | Remove/visually-disable "Distance" until real geo is available; gate the Trade tab behind a functional filter or indicate it's inactive |
| 🟡 | `components/auth/complete-setup-screen.tsx` | "UserID" field has no upfront explanation that this is a permanent, public-facing handle visible to other collectors — a user may set a throwaway value | Add a brief description above the field before typing begins explaining it's their permanent public handle |
| 🟡 | `components/listings/create-listing-screen.tsx:1041-1044` | Collection section is always rendered with a red asterisk (`*`) even for For Sale listings — users are misled into thinking collection fields are required for all listing types | Hide the Collection section when status is not "In Collection", or replace the asterisk with a contextual tooltip |
| 🟡 | `components/listings/create-listing-screen.tsx:617-634` | No success confirmation after creating/saving a listing; "Save Draft" vs "Add Item" buttons show no explanation of the difference in outcome — users have no signal confirming which state the listing is now in | Show a brief success toast after both actions; add short descriptors clarifying "Save Draft = private, Add Item = published" |

---

## Recommended Fix Order

1. 🔴 [Cross-cutting: Security + Senior Dev] Remove `rawToken` from INFO log — `server/services/auth.service.ts:47`
2. 🔴 [Security] Enforce `length(128)` on token validator + add rate limiting to registration endpoint
3. 🔴 [Cross-cutting: PO + User Persona] Apply brand/condition filters in `filteredListings` memo — `market-content.tsx:59-66`
4. 🔴 [Cross-cutting: PO + Senior Dev] Include collection/spec fields in listing payload or remove their UI bindings — `create-listing-screen.tsx`
5. 🔴 [PO] Wire `publishToNiche` state into the API call — `create-listing-screen.tsx`
6. 🔴 [PO] Replace market mock data with real API call — `market-content.tsx`
7. 🔴 [Cross-cutting: Performance + Cost] Batch-fetch covers in a single query — `listing.service.ts:41-46`
8. 🔴 [Cross-cutting: Cost + Performance] Replace base64 image JSON upload with multipart or pre-signed URLs — `create-listing-screen.tsx:542`
9. 🔴 [Cross-cutting: Architect + Performance + Cost] Remove direct `prisma` calls from `ListingService`; delegate to repository — `listing.service.ts`
10. 🔴 [Architect] Eliminate `userData as any` casts in `auth.repository.ts:54,89`
11. 🔴 [QA] Create `listing.service.test.ts` covering publish pre-conditions and sync strategies
12. 🔴 [QA] Add missing `completeRegistration` test for duplicate user-code guard
13. 🔴 [A11y] Add `<label>` to subtitle and price inputs — `create-listing-screen.tsx`
14. 🔴 [A11y] Add `aria-label` to sort button — `market-content.tsx`
15. 🔴 [Cross-cutting: Performance + User Persona] Remove/disable "Distance" sort until real geo is implemented — `market-content.tsx:73`
16. 🔴 [Performance] Add `AbortController` to `useEffect` and clean up `setTimeout` timer — `create-listing-screen.tsx:471-481`
17. 🟡 [PO] Make price requirement in `publish()` conditional on `for-sale` status — `listing.service.ts:114-118`
18. 🟡 [Security] Treat no-`Origin` requests as untrusted for mutating methods — `middleware.ts`
19. 🟡 [Security] Add status allow-list to `syncStatuses` — `listing.service.ts`
20. 🟡 [Cost] Add `Cache-Control` headers to `/api/status` and `/api/attribute` routes
21. 🟡 [User Persona] Add upfront description to UserID field in registration — `complete-setup-screen.tsx`
22. 🟡 [User Persona] Add success confirmation after listing create/save
23. 🟡 [A11y] Add `aria-hidden` to filter chip X icon + `aria-label` — `market-content.tsx`
24. 🟡 [A11y] Add `aria-controls` to specs accordion trigger — `create-listing-screen.tsx`
25. 🟢 [Multiple] Remaining suggestions (PrismaTx type alias, magic number constant, validateToken private modifier)

---

*Full report saved to `.claude/reviews/2026-04-29-feat-multiRoleReview-multi-role-review.md`*
