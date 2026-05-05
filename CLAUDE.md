# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev       # Start development server
pnpm lint      # Run ESLint
pnpm build     # Production build (TS errors intentionally ignored in next.config.mjs)
```

No test suite is configured.

## Architecture

Next.js 16 App Router prototype for a hobby gear trading marketplace. Single commit — exported from Vercel v0.

**State management:**
- React Context (`SavedTradeInterestsProvider` in `lib/saved-trade-interests-context.tsx`) for global trade interests
- `sessionStorage` bridges the create-listing multi-step flow to the published listing detail view (`lib/draft-listing-storage.ts`)
- No backend — all listing/market data is mock (`lib/market-data.ts`, `lib/mock-listing-detail.ts`, `lib/inbox-demo-data.ts`)

**AI integration:**
- Single API route: `app/api/trade-interest/parse/route.ts`
- Uses Vercel AI SDK (`ai` package) + Anthropic Claude to parse free-text trade interest descriptions into structured JSON
- Response may include Markdown fences — strip before `JSON.parse`

**Component organization — feature-based, not atomic:**
- `components/app-shell/` — global layout (sidebar, header, mobile nav)
- `components/create-item/` — multi-step listing creation form
- `components/listing-detail/` — published listing view
- `components/market/` — browse/discovery
- `components/trade/` — trade manager (multi-item trade interest assignment)
- `components/inbox/` — three-column inbox (message list · chat · user profile), offer accept/decline/counter flow, two counter-offer modals (trade vs. cash-only)
- `components/shared/` — shared primitives (buttons, fields)
- `components/ui/` — shadcn/ui primitives (59 components, New York style, do not modify directly)

**Path alias:** `@/*` maps to the project root.

## Key Conventions

- **Tailwind CSS 4** with OKLch design tokens defined as CSS custom properties in `styles/globals.css`. Dark mode is the default; light mode is the variant.
- **shadcn/ui** components live in `components/ui/`. Add new ones via `npx shadcn@latest add <component>`, not manually.
- **React Hook Form + Zod** for all forms. Schemas co-located with forms.
- **SSR guards required** for any `sessionStorage`/`localStorage` access — check `typeof window !== 'undefined'` before use.
- TypeScript strict mode is on, but build-time TS errors are suppressed in `next.config.mjs` (prototype stage — don't disable strict mode, but don't panic about suppressed build errors).

## Inbox feature (`app/inbox/`)

Three-column layout: message list (left) · chat (center) · user profile (right). Mobile stack-navigates between them via `mobileView` state. Conversation is selected via `?id=` search param.

- Types: `lib/inbox-types.ts` — `Message`, `Offer`, `Conversation`, `ConversationParticipant`
- Demo data: `lib/inbox-demo-data.ts` — 4 conversations, pre-seeded messages and offers
- `InboxContent` owns all state and passes handlers down; child components are pure UI
- Offer flow: pending offers render a sticky banner in `ChatPanel`; accept/decline mutate local state; counter opens `CounterOfferModal` (trade) or `CashCounterOfferModal` (cash-only), detected by `their_items.length === 0`
- Images use external placeholder services (no local files needed): `picsum.photos` for items, `pravatar.cc` for avatars

## Active Work Area

`.notes/notes.txt` tracks product decisions. Current focus: per-item trade interest management (applying global trade interest templates to individual listings rather than only globally).
