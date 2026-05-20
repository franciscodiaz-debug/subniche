"use client"

import { useMemo, useState } from "react"
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  Grid2x2,
  Grid3x3,
  LayoutGrid,
  List,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { ItemCardGridSkeleton, RowListSkeleton } from "@/components/loading/skeletons"
import { SimWrapper } from "@/components/loading/sim-wrapper"
import {
  MyItemGridCard,
  MyItemListHeader,
  MyItemRow,
  type MyItem,
} from "./my-item-card"
import { myItemCollections } from "@/lib/mock/my-stuff"

type SortKey = "recent" | "price_desc" | "price_asc" | "views" | "value"
type CollectionFilter =
  | "all"
  | "uncategorized"
  | "unlisted"
  | "drafts"
  | "sold"
  | string
type FilterState = "neutral" | "include" | "exclude"
type View = "grid" | "list"
type GridDensity = "comfortable" | "standard" | "compact"

const sortLabels: Record<SortKey, string> = {
  recent: "Newest",
  price_desc: "Price: high to low",
  price_asc: "Price: low to high",
  views: "Most views",
  value: "Highest value",
}

function nextFilterState(current: FilterState): FilterState {
  if (current === "neutral") return "include"
  if (current === "include") return "exclude"
  return "neutral"
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-sm text-muted-foreground">{label}</div>
      <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
    </div>
  )
}

function DesktopStatsGrid({ items }: { items: MyItem[] }) {
  return (
    <div className="hidden grid-cols-4 gap-3 @3xl/mystuff:grid">
      <StatCard label="Total" value={items.length} />
      <StatCard label="For Sale" value={items.filter((i) => i.for_sale).length} />
      <StatCard label="For Trade" value={items.filter((i) => i.for_trade).length} />
      <StatCard label="Uncategorized" value={items.filter((i) => !i.collection_id).length} />
    </div>
  )
}

function CompactStatsRow({ items }: { items: MyItem[] }) {
  const stats = [
    { label: "items", value: items.length },
    { label: "for sale", value: items.filter((i) => i.for_sale).length },
    { label: "for trade", value: items.filter((i) => i.for_trade).length },
    { label: "uncategorized", value: items.filter((i) => !i.collection_id).length },
  ]
  return (
    <p className={cn(
      "flex h-8 items-center gap-1.5 overflow-x-auto whitespace-nowrap text-xs text-muted-foreground",
      "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
      "@3xl/mystuff:hidden",
    )}>
      {stats.map((s, i) => (
        <span key={s.label} className="inline-flex items-center gap-1.5">
          {i > 0 ? <span aria-hidden="true" className="text-muted-foreground/40">·</span> : null}
          <span>
            <span className="font-medium tabular-nums text-foreground">{s.value}</span>{" "}
            <span>{s.label}</span>
          </span>
        </span>
      ))}
    </p>
  )
}

function StatusTogglePill({
  label,
  state,
  tone,
  onCycle,
}: {
  label: string
  state: FilterState
  tone: "success" | "info"
  onCycle: () => void
}) {
  const includeTone =
    tone === "success"
      ? "border-status-success/40 bg-status-success/10 text-status-success"
      : "border-status-info/40 bg-status-info/10 text-status-info"

  const displayLabel =
    state === "include" ? `${label}: Only` : state === "exclude" ? `${label}: Hide` : label

  return (
    <button
      type="button"
      onClick={onCycle}
      aria-pressed={state !== "neutral"}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        state === "neutral" && "border-border bg-transparent text-muted-foreground hover:border-primary/40 hover:text-foreground",
        state === "include" && includeTone,
        state === "exclude" && "border-destructive/40 bg-destructive/10 text-destructive line-through",
      )}
    >
      {state === "include" && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
      {state === "exclude" && <X className="h-3.5 w-3.5" strokeWidth={2.5} />}
      <span>{displayLabel}</span>
    </button>
  )
}

function FiltersButton({
  collectionFilter,
  setCollectionFilter,
  saleFilter,
  setSaleFilter,
  tradeFilter,
  setTradeFilter,
}: {
  collectionFilter: CollectionFilter
  setCollectionFilter: (v: CollectionFilter) => void
  saleFilter: FilterState
  setSaleFilter: (v: FilterState) => void
  tradeFilter: FilterState
  setTradeFilter: (v: FilterState) => void
}) {
  const activeCount =
    (collectionFilter !== "all" ? 1 : 0) +
    (saleFilter !== "neutral" ? 1 : 0) +
    (tradeFilter !== "neutral" ? 1 : 0)

  const handleClearAll = () => {
    setCollectionFilter("all")
    setSaleFilter("neutral")
    setTradeFilter("neutral")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={activeCount > 0 ? `Filters (${activeCount} active)` : "Filters"}
        className={cn(
          "inline-flex h-9 shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          activeCount > 0
            ? "border-primary/40 bg-primary/10 text-primary hover:border-primary/60"
            : "border-border bg-card text-foreground hover:border-primary/40",
        )}
      >
        <SlidersHorizontal className={cn("h-4 w-4", activeCount > 0 ? "text-primary" : "text-muted-foreground")} />
        <span>Filters</span>
        {activeCount > 0 ? (
          <span className="ml-0.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold leading-none text-primary-foreground tabular-nums">
            {activeCount}
          </span>
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Status</DropdownMenuLabel>
        <div className="flex flex-wrap gap-1.5 px-2 pb-2">
          <StatusTogglePill label="For Sale" state={saleFilter} tone="success" onCycle={() => setSaleFilter(nextFilterState(saleFilter))} />
          <StatusTogglePill label="For Trade" state={tradeFilter} tone="info" onCycle={() => setTradeFilter(nextFilterState(tradeFilter))} />
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Collection</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={collectionFilter} onValueChange={(v) => setCollectionFilter(v as CollectionFilter)}>
          <DropdownMenuRadioItem value="all">All Items</DropdownMenuRadioItem>
          {myItemCollections.map((c) => (
            <DropdownMenuRadioItem key={c.id} value={c.id}>{c.name}</DropdownMenuRadioItem>
          ))}
          <DropdownMenuRadioItem value="uncategorized">Uncategorized</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">State</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={collectionFilter} onValueChange={(v) => setCollectionFilter(v as CollectionFilter)}>
          <DropdownMenuRadioItem value="unlisted">Unlisted</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="drafts">Drafts</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="sold">Sold</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        {activeCount > 0 ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleClearAll} className="text-sm text-muted-foreground">
              Clear all filters
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
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

function ViewToggleSegment({
  view,
  setView,
  gridDensity,
  setGridDensity,
}: {
  view: View
  setView: (v: View) => void
  gridDensity: GridDensity
  setGridDensity: (d: GridDensity) => void
}) {
  const DensityIcon = { comfortable: Grid2x2, standard: LayoutGrid, compact: Grid3x3 }[gridDensity]
  const nextDensity: GridDensity = { comfortable: "standard", standard: "compact", compact: "comfortable" }[gridDensity] as GridDensity

  return (
    <div className="inline-flex h-9 shrink-0 items-center rounded-lg border border-border bg-card p-0.5">
      <button
        type="button"
        onClick={() => view === "grid" ? setGridDensity(nextDensity) : setView("grid")}
        aria-pressed={view === "grid"}
        aria-label="Grid view"
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors",
          view === "grid" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <DensityIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setView("list")}
        aria-pressed={view === "list"}
        aria-label="List view"
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors",
          view === "list" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  )
}

export function MyItemsTab({ items }: { items: MyItem[] }) {
  const isMobile = useIsMobile()

  const [collectionFilter, setCollectionFilter] = useState<CollectionFilter>("all")
  const [saleFilter, setSaleFilter] = useState<FilterState>("neutral")
  const [tradeFilter, setTradeFilter] = useState<FilterState>("neutral")
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortKey>("recent")
  const [userView, setUserView] = useState<View | null>(null)
  const view: View = userView ?? (isMobile ? "list" : "grid")
  const setView = (v: View) => setUserView(v)
  const [gridDensity, setGridDensity] = useState<GridDensity>("standard")

  const gridClass = {
    comfortable: "grid-cols-1 gap-x-6 gap-y-8 @3xl/mystuff:grid-cols-2",
    standard: "grid-cols-1 gap-x-4 gap-y-6 @3xl/mystuff:grid-cols-3 @5xl/mystuff:grid-cols-4",
    compact: "grid-cols-1 gap-x-2 gap-y-4 @3xl/mystuff:grid-cols-4 @5xl/mystuff:grid-cols-6 @7xl/mystuff:grid-cols-8",
  }[gridDensity]

  const filtered = useMemo(() => {
    let result = items

    if (collectionFilter === "uncategorized") result = result.filter((i) => !i.collection_id)
    else if (collectionFilter === "unlisted") result = result.filter((i) => !i.for_sale && !i.for_trade && !i.sold)
    else if (collectionFilter === "drafts") result = result.filter((i) => i.updated_at === "Draft")
    else if (collectionFilter === "sold") result = result.filter((i) => i.sold)
    else if (collectionFilter !== "all") result = result.filter((i) => i.collection_id === collectionFilter)

    if (collectionFilter !== "drafts") result = result.filter((i) => i.updated_at !== "Draft")
    if (collectionFilter !== "sold") result = result.filter((i) => !i.sold)

    if (saleFilter === "include") result = result.filter((i) => i.for_sale)
    else if (saleFilter === "exclude") result = result.filter((i) => !i.for_sale)
    if (tradeFilter === "include") result = result.filter((i) => i.for_trade)
    else if (tradeFilter === "exclude") result = result.filter((i) => !i.for_trade)

    const q = query.trim().toLowerCase()
    if (q) result = result.filter((i) => i.title.toLowerCase().includes(q) || i.subtitle?.toLowerCase().includes(q))

    const sorted = [...result]
    if (sort === "price_desc") sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    else if (sort === "price_asc") sorted.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
    else if (sort === "views") sorted.sort((a, b) => b.views - a.views)
    return sorted
  }, [items, collectionFilter, saleFilter, tradeFilter, query, sort])

  return (
    <div className="@container/mystuff flex flex-col gap-3 @3xl/mystuff:gap-5">
      <CompactStatsRow items={items} />
      <DesktopStatsGrid items={items} />

      {/* Mobile toolbar */}
      <div className="flex flex-col gap-2 @3xl/mystuff:hidden">
        <div className="flex items-center gap-2">
          <FiltersButton
            collectionFilter={collectionFilter}
            setCollectionFilter={setCollectionFilter}
            saleFilter={saleFilter}
            setSaleFilter={setSaleFilter}
            tradeFilter={tradeFilter}
            setTradeFilter={setTradeFilter}
          />
          <div className="ml-auto flex items-center gap-2">
            <SortDropdown value={sort} onChange={setSort} />
            <ViewToggleSegment view={view} setView={setView} gridDensity={gridDensity} setGridDensity={setGridDensity} />
          </div>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items..."
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
        <FiltersButton
          collectionFilter={collectionFilter}
          setCollectionFilter={setCollectionFilter}
          saleFilter={saleFilter}
          setSaleFilter={setSaleFilter}
          tradeFilter={tradeFilter}
          setTradeFilter={setTradeFilter}
        />
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items..."
            className="h-9 rounded-md border-border bg-card pl-9"
          />
        </div>
        <SortDropdown value={sort} onChange={setSort} />
        <ViewToggleSegment view={view} setView={setView} gridDensity={gridDensity} setGridDensity={setGridDensity} />
      </div>

      <SimWrapper
        skeleton={view === "list" ? <RowListSkeleton count={4} /> : <ItemCardGridSkeleton count={6} />}
        empty={
          <Empty className="rounded-lg border border-dashed border-border bg-card py-12">
            <EmptyHeader>
              <EmptyTitle>No items yet</EmptyTitle>
              <EmptyDescription>
                Listings you create will show up here. Start by adding your first item.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                size="sm"
                onClick={() => console.log("[stub] add item")}
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add item
              </Button>
            </EmptyContent>
          </Empty>
        }
      >
        {filtered.length === 0 ? (
          <Empty className="rounded-lg border border-dashed border-border bg-card py-12">
            <EmptyHeader>
              <EmptyTitle>No items match</EmptyTitle>
              <EmptyDescription>
                {query || collectionFilter !== "all" || saleFilter !== "neutral" || tradeFilter !== "neutral"
                  ? "Try adjusting your search or clearing filters."
                  : "Listings you create will show up here. Start by adding your first item."}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                size="sm"
                onClick={() => console.log("[stub] add item")}
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add item
              </Button>
            </EmptyContent>
          </Empty>
        ) : view === "list" ? (
          <div className="@container/list flex flex-col">
            <MyItemListHeader />
            <div className="flex flex-col gap-2">
              {filtered.map((item) => <MyItemRow key={item.id} item={item} />)}
            </div>
          </div>
        ) : (
          <div className={cn("grid", gridClass)}>
            {filtered.map((item) => <MyItemGridCard key={item.id} item={item} />)}
          </div>
        )}
      </SimWrapper>
    </div>
  )
}
