"use client"

/**
 * Reusable skeleton primitives.
 *
 * Skeletons here intentionally MATCH the shape of the real cards they
 * replace — same aspect ratios, same layout slots — so the transition
 * to real data doesn't visually jump.
 *
 * If a real card's layout changes, update the matching skeleton here.
 *
 * For empty states, use the shadcn `Empty` primitives from
 * `components/ui/empty.tsx` — single source of truth.
 */

import { cn } from "@/lib/utils"

/* ─── primitives ────────────────────────────────────────────────────── */

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/60",
        className,
      )}
    />
  )
}

/* ─── ItemCard skeleton ─────────────────────────────────────────────── */

export function ItemCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card/40">
      <Shimmer className="aspect-[4/3] w-full rounded-none rounded-t-lg" />
      <div className="space-y-2 p-3">
        <Shimmer className="h-4 w-3/4" />
        <Shimmer className="h-3 w-1/2" />
        <div className="flex items-center gap-2 pt-1">
          <Shimmer className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
}

/* ─── CollectionCard skeleton ───────────────────────────────────────── */

export function CollectionCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card/40">
      <div className="grid aspect-[5/3] grid-cols-2 gap-0.5 bg-muted/40 p-0.5">
        <Shimmer className="rounded-none" />
        <Shimmer className="rounded-none" />
        <Shimmer className="rounded-none" />
        <Shimmer className="rounded-none" />
      </div>
      <div className="space-y-2 p-3">
        <Shimmer className="h-4 w-2/3" />
        <Shimmer className="h-3 w-1/3" />
      </div>
    </div>
  )
}

/* ─── Row skeleton (list view) ──────────────────────────────────────── */

export function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card/40 p-3">
      <Shimmer className="h-16 w-16 flex-shrink-0 rounded-md" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Shimmer className="h-4 w-3/4" />
        <Shimmer className="h-3 w-1/2" />
      </div>
      <Shimmer className="h-5 w-14 flex-shrink-0 rounded-full" />
    </div>
  )
}

/* ─── Grid wrappers ─────────────────────────────────────────────────── */

export function ItemCardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ItemCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ItemCardScrollerSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-hidden px-4 pb-2 md:-mx-0 md:px-0">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-[220px] flex-shrink-0 md:w-[240px]">
          <ItemCardSkeleton />
        </div>
      ))}
    </div>
  )
}

export function CollectionCardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CollectionCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function CollectionCardScrollerSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-hidden px-4 pb-2 md:-mx-0 md:px-0">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-[180px] flex-shrink-0">
          <CollectionCardSkeleton />
        </div>
      ))}
    </div>
  )
}

export function RowListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <RowSkeleton key={i} />
      ))}
    </div>
  )
}

/* Empty state: see `components/ui/empty.tsx` for the canonical primitives. */
