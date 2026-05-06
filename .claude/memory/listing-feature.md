# Listing Feature

## Status
Frontend-only. The item detail page is built with mock data — the `Listing` backend model does not exist yet.

## Files built
- `app/(app)/niche/[slug]/listing/[id]/page.tsx` — page with `MOCK_LISTING` constant
- `components/listings/see-listing-screen.tsx` — main client component (sub-components inlined: `PhotoGallery`, `StatusBadge`, `SellerActionCard`, `ListingMiniCard`, `RecommendationRow`)

## Files modified for this feature
- `components/ui/button.tsx` — added `icon` size variant (required by shadcn Carousel)
- `components/ui/avatar.tsx` + `components/ui/carousel.tsx` — new shadcn components
- `app/globals.css` — dark mode `--card` changed to `oklch(0.18 0.02 250)` (dark blue surfaces)
- `next.config.ts` — `devIndicators: false` to suppress Next.js 15.5 Segment Explorer crash

## Backend needed (not built yet)
1. `prisma/schema.prisma` — Add `Listing` model
2. `server/models/listing.model.ts`, `repositories/`, `services/`, `controllers/`, `validators/`
3. `app/api/listing/route.ts` (GET list + POST create)
4. `app/api/listing/[id]/route.ts` (GET / PATCH / DELETE)
5. `listing.repository.ts` must include `findByUserId(userId, limit)` for "More from seller"
6. Seller location must be resolved server-side (city + state string) before sending to client

## Wire-up instruction
When backend is ready, replace `MOCK_LISTING` in the page file with a real `GET /api/listing/[id]` fetch.
