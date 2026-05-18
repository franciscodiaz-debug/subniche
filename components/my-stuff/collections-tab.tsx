"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowUpDown, LayoutGrid, List, Plus, Search, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { CollectionCard } from "@/components/collection-card"
import { GridDensitySelector } from "@/components/shared/grid-density-selector"
import { gridDensityConfig, useGridDensity } from "@/hooks/use-grid-density"
import { isUserWishlist, useCollections } from "@/lib/collections-context"
import { currentUser } from "@/lib/current-user"
import type { Collection } from "@/lib/types"

type SortKey = "recent" | "name" | "items" | "value"
type View = "grid" | "list"

const sortLabels: Record<SortKey, string> = {
  recent: "Newest",
  name: "Name A-Z",
  items: "Most items",
  value: "Highest value",
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-sm text-muted-foreground">{label}</div>
      <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
    </div>
  )
}

function buildStats(collections: Collection[]) {
  const ownedCollections = collections.filter((c) => !c.is_wishlist)
  const wishlist = collections.find((c) => c.is_wishlist)
  const ownedValue = ownedCollections.reduce(
    (sum, c) => sum + (c.total_user_value || 0),
    0,
  )
  return {
    // "Collections" stat excludes the default Wishlist — it's a different
    // concept and lives pinned at the top of the grid on its own.
    collections: ownedCollections.length,
    items: ownedCollections.reduce((sum, c) => sum + (c.item_count || 0), 0),
    wishlistItems: wishlist?.item_count ?? 0,
    totalValue: ownedValue,
  }
}

function formatCurrencyShort(value: number) {
  if (value <= 0) return "$0"
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 10_000) return `$${Math.round(value / 1000)}K`
  return `$${value.toLocaleString("en-US")}`
}

function DesktopStatsGrid({ collections }: { collections: Collection[] }) {
  const stats = buildStats(collections)
  return (
    <div className="hidden grid-cols-4 gap-3 @3xl/mystuff:grid">
      <StatCard label="Collections" value={stats.collections} />
      <StatCard label="Items" value={stats.items} />
      <StatCard label="Wishlist items" value={stats.wishlistItems} />
      <StatCard label="Total value" value={formatCurrencyShort(stats.totalValue)} />
    </div>
  )
}

function CompactStatsRow({ collections }: { collections: Collection[] }) {
  const s = buildStats(collections)
  const stats = [
    { label: s.collections === 1 ? "collection" : "collections", value: s.collections },
    { label: s.items === 1 ? "item" : "items", value: s.items },
    { label: s.wishlistItems === 1 ? "wishlist item" : "wishlist items", value: s.wishlistItems },
    { label: "total", value: formatCurrencyShort(s.totalValue) },
  ]
  return (
    <p className={cn(
      "flex h-8 items-center gap-1.5 overflow-x-auto whitespace-nowrap text-xs text-muted-foreground",
      "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
      "@3xl/mystuff:hidden",
    )}>
      {stats.map((stat, i) => (
        <span key={stat.label} className="inline-flex items-center gap-1.5">
          {i > 0 ? <span aria-hidden="true" className="text-muted-foreground/40">·</span> : null}
          <span>
            <span className="font-medium tabular-nums text-foreground">{stat.value}</span>{" "}
            <span>{stat.label}</span>
          </span>
        </span>
      ))}
    </p>
  )
}

function NewCollectionButton({ className }: { className?: string }) {
  return (
    <Button
      asChild
      size="sm"
      variant="quiet_outline"
      className={cn(
        "h-9 shrink-0 rounded-md border-border bg-card px-3 text-sm font-medium text-foreground shadow-none transition-colors hover:border-primary/40",
        className,
      )}
    >
      <Link href="/my-stuff/collections/new">
        <Plus className="mr-1 h-4 w-4" />
        New collection
      </Link>
    </Button>
  )
}

function SortDropdown({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
        <span>{sortLabels[value]}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Sort by</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as SortKey)}>
          {(Object.keys(sortLabels) as SortKey[]).map((k) => (
            <DropdownMenuRadioItem key={k} value={k}>{sortLabels[k]}</DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ViewToggleSegment({ view, setView }: { view: View; setView: (v: View) => void }) {
  return (
    <div className="inline-flex h-9 shrink-0 items-center rounded-lg border border-border bg-card p-0.5">
      {(["grid", "list"] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => setView(v)}
          aria-pressed={view === v}
          aria-label={`${v} view`}
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors",
            view === v ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {v === "grid" ? <LayoutGrid className="h-4 w-4" /> : <List className="h-4 w-4" />}
        </button>
      ))}
    </div>
  )
}

interface CollectionsTabProps {
  /** Optional preview images keyed by collection id. The page-level mock
   *  supplies these so cards have artwork before items are wired in. */
  previewImages?: Record<string, string[]>
}

export function CollectionsTab({ previewImages = {} }: CollectionsTabProps) {
  const isMobile = useIsMobile()
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortKey>("recent")
  const [userView, setUserView] = useState<View | null>(null)
  const view: View = userView ?? (isMobile ? "list" : "grid")
  const { gridDensity } = useGridDensity()
  const setView = (v: View) => setUserView(v)
  // Read directly from the local store so newly-created collections appear
  // here immediately (no page reload required). The store also holds other
  // users' collections (used by the visitor view); we filter to just the
  // current user's so My Stuff stays scoped to "mine".
  const { collections } = useCollections()

  const allCollections = useMemo(
    () =>
      collections.filter(
        (c) => !c.owner_id || c.owner_id === currentUser.username,
      ),
    [collections],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const bySearch = q
      ? allCollections.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.description?.toLowerCase().includes(q) ||
            c.tags?.some((t) => t.toLowerCase().includes(q)),
        )
      : allCollections

    // Pin the user's Wishlist to the top so it's always the first card,
    // regardless of sort. Everything else respects the chosen sort.
    const wishlistEntry = bySearch.find((c) =>
      isUserWishlist(c, currentUser.username),
    )
    const rest = wishlistEntry
      ? bySearch.filter((c) => c.id !== wishlistEntry.id)
      : bySearch

    if (sort === "name") rest.sort((a, b) => a.name.localeCompare(b.name))
    else if (sort === "items")
      rest.sort((a, b) => (b.item_count || 0) - (a.item_count || 0))
    else if (sort === "value")
      rest.sort(
        (a, b) => (b.total_user_value || 0) - (a.total_user_value || 0),
      )

    return wishlistEntry ? [wishlistEntry, ...rest] : rest
  }, [allCollections, query, sort])

  return (
    <div className="@container/mystuff flex flex-col gap-3 @3xl/mystuff:gap-5">
      <CompactStatsRow collections={allCollections} />
      <DesktopStatsGrid collections={allCollections} />

      {/* Mobile toolbar */}
      <div className="flex flex-col gap-2 @3xl/mystuff:hidden">
        <div className="flex items-center gap-2">
          <NewCollectionButton />
          <div className="ml-auto flex items-center gap-2">
            <SortDropdown value={sort} onChange={setSort} />
            {view === "grid" ? <GridDensitySelector /> : null}
            <ViewToggleSegment view={view} setView={setView} />
          </div>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your collections"
            className="h-9 rounded-md border-border bg-card pl-9 pr-9"
          />
          {query.length > 0 ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Desktop toolbar */}
      <div className="hidden flex-wrap items-center gap-2 @3xl/mystuff:flex">
        <NewCollectionButton />
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your collections"
            className="h-9 rounded-md border-border bg-card pl-9"
          />
        </div>
        <SortDropdown value={sort} onChange={setSort} />
        {view === "grid" ? <GridDensitySelector /> : null}
        <ViewToggleSegment view={view} setView={setView} />
      </div>

      {filtered.length === 0 ? (
        <Empty className="rounded-lg border border-dashed border-border bg-card py-12">
          <EmptyHeader>
            <EmptyTitle>No collections yet</EmptyTitle>
            <EmptyDescription>
              {query
                ? "Nothing matches your search. Try a different term."
                : "Group your items into collections to showcase them or track items you're hunting for."}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <NewCollectionButton />
          </EmptyContent>
        </Empty>
      ) : view === "grid" ? (
        <div className={gridDensityConfig[gridDensity].gridClass}>
          {filtered.map((c) => (
            <CollectionCard key={c.id} collection={c} view="grid" itemImages={previewImages[c.id]} href={`/collection/${c.id}`} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((c) => (
            <CollectionCard key={c.id} collection={c} view="list" itemImages={previewImages[c.id]} href={`/collection/${c.id}`} />
          ))}
        </div>
      )}
    </div>
  )
}
