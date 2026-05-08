"use client"

/**
 * <TradeInterestsView />
 *
 * Replaces the Trade grid entirely when the user clicks the gear next to the
 * "For" dropdown. No modal, no overlay — this is plain section navigation
 * inside the Trade hub, per the spec.
 *
 * Two display modes, driven entirely by the parent's `selectedItemId`:
 *
 *   1. ALL ITEMS  (selectedItemId === "all")
 *      Interests are grouped by REACH:
 *        a. "Applied to every listing"   — global. These are the things you'd
 *           accept on any of your items, full stop. Lifted to the top so the
 *           shared-by-default templates aren't buried.
 *        b. "Applied to some listings"   — partial. The "applied to 4 of 6"
 *           middle ground that already existed; we just give it its own
 *           heading so users can scan reach at a glance.
 *        c. "Templates — not applied"    — orphans. Reusable shells that
 *           haven't been bound to a listing yet.
 *
 *   2. INDIVIDUAL ITEM  (selectedItemId === "my-1" etc.)
 *      The whole surface is reframed around that single item, since the user
 *      arrived here from "For <item>" upstream.
 *        a. "Global — applies to every listing"
 *           Read-context first: these auto-apply to the current item too.
 *        b. "Applied to this item"
 *           Interests where `appliedTo` includes the current item but doesn't
 *           cover everything. Caption shows "Just this item" or
 *           "Shared with N other listings" so reach stays visible.
 *      And a NEW affordance — "Add from existing" — lets the user pull an
 *      already-authored interest into the current item without retyping. It
 *      complements the "+ New" button: + New = author from scratch,
 *      Add existing = reuse a template from another item.
 *
 * Surface contract:
 *   Header:  ←  Trade Interests                              + New
 *            (subtitle — current item context if individual mode)
 *   Section: Title + count
 *            Row: Name + subcategory pill
 *            Brand · Reach caption                          [edit] [×]
 *   On edit: the row expands in-place; the <SavedInterestEditor /> mounts
 *            directly beneath the row. Multiple rows cannot be expanded at
 *            once — focusing one collapses the others so the viewer never
 *            has dueling long forms fighting for vertical space.
 *
 * New interests: `+ New` creates a fresh shell in the store and auto-expands
 * its row so the name field is the next obvious thing to fill out. When the
 * user is in individual mode, the new interest is also auto-applied to the
 * current item so it lands in the right section without an extra click.
 */

import * as React from "react"
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FilterPill } from "@/components/shared/filter-pill"
import {
  summarizeSavedInterest,
  useSavedTradeInterests,
  type SavedTradeInterest,
} from "@/lib/saved-trade-interests-context"
import type { TradeableItemSummary } from "@/lib/market-data"
import { SavedInterestEditor } from "./saved-interest-editor"
import { TradeItemSelector } from "./trade-item-selector"
import { InterestEmptyState } from "@/components/trade-interests/shared/empty-state"
import { type InterestTemplate } from "@/components/trade-interests/shared/templates-strip"
import { InterestCard } from "@/components/trade-interests/shared/interest-card"
import { GridDensitySelector } from "@/components/shared/grid-density-selector"
import { gridDensityConfig, useGridDensity } from "@/hooks/use-grid-density"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TradeInterestsViewProps {
  /** Return to the grid. Rendered as the back-arrow target in the header. */
  onBack: () => void
  /** The viewer's tradeable items. Used to determine globality (an interest
   *  is "global" iff its appliedTo set covers every item) and to drive the
   *  in-page "For" selector that controls All-items vs. individual-item mode. */
  items: TradeableItemSummary[]
  /** Either "all" or a specific my_item id. Controlled by the parent so the
   *  user's "I'm focused on this item" context is shared between this view
   *  and the Trade grid (entering via the gear, picking a different item
   *  here, then backing out keeps the grid filter in sync). */
  selectedItemId: string
  /** Callback that lifts selection back up to the parent (TradeContent) so
   *  switching items here also updates the upstream Trade grid filter. */
  onSelectItem: (id: string) => void
}

/* -------------------------------------------------------------------------- */
/* Grouping helpers                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Interest is "global" when its `appliedTo` covers every tradeable item.
 * We express it via Set membership so an interest with stale ids (e.g. one
 * that points at an item the user has since deleted) doesn't accidentally
 * get classified as global. Edge case: if the user has zero tradeable items
 * we return false to avoid a vacuous "global" bucket.
 */
function isGlobalInterest(
  interest: SavedTradeInterest,
  items: TradeableItemSummary[],
): boolean {
  if (items.length === 0) return false
  const applied = new Set(interest.appliedTo)
  return items.every((item) => applied.has(item.id))
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function TradeInterestsView({
  onBack,
  items,
  selectedItemId,
  onSelectItem,
}: TradeInterestsViewProps) {
  const { interests, create, remove, applyToListing } =
    useSavedTradeInterests()

  const isIndividual = selectedItemId !== "all"
  const selectedItem = isIndividual
    ? items.find((item) => item.id === selectedItemId) ?? null
    : null

  /* Expansion model — at most one row is open at a time, in one of two modes:
   *   - "detail": lightweight pill-chip summary of the saved criteria.
   *     Triggered by clicking the row body or chevron. This is the cheap
   *     "let me peek at what's in here" affordance.
   *   - "edit":   the full SavedInterestEditor form. Triggered by the pencil
   *     icon, by creating a new interest, or by adopting an existing one
   *     into the current item — actions that imply the user wants to
   *     change something, not just look.
   * `expandedMode` is irrelevant when `expandedId` is null. */
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [expandedMode, setExpandedMode] = React.useState<"detail" | "edit">(
    "edit",
  )
  const [confirmingRemovalId, setConfirmingRemovalId] = React.useState<
    string | null
  >(null)

  /* Tab filter — toggleable. Both ON by default. */
  const [activeTabs, setActiveTabs] = React.useState<{
    global: boolean
    individual: boolean
  }>({ global: true, individual: true })

  /* Sort + density */
  type SortMode = "default" | "name-az" | "name-za" | "applied-most" | "applied-least"
  const [sortMode, setSortMode] = React.useState<SortMode>("default")
  const { gridDensity } = useGridDensity()

  /* Section collapse state kept around for backward compat (used internally) */
  const [collapsedSections, setCollapsedSections] = React.useState<
    Set<string>
  >(() => new Set())

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  /* Reset collapse state whenever the mode or focused item changes. This
   * ensures the user always sees the contextually-relevant section first
   * when navigating to a different mode or item:
   *   - Individual item mode: Global collapsed, Individual expanded
   *   - All items mode: Global expanded, Individual collapsed */
  React.useEffect(() => {
    if (isIndividual && selectedItem) {
      setCollapsedSections(new Set(["global-individual"]))
    } else {
      setCollapsedSections(new Set(["individual"]))
    }
  }, [isIndividual, selectedItem?.id])

  /* Single creation entry point. In individual mode the new interest is
   * pre-bound to the focused item so it lands in "Applied to this item"
   * immediately. In All-items mode it starts unbound — the user chooses
   * scope (global vs. specific listings) inside the inline editor. */
  const handleNew = () => {
    const seed: Partial<Omit<SavedTradeInterest, "id">> | undefined =
      isIndividual && selectedItem ? { appliedTo: [selectedItem.id] } : undefined
    const created = create(seed)
    setExpandedId(created.id)
    setExpandedMode("edit")
    setConfirmingRemovalId(null)
  }

  const handlePickTemplate = (template: InterestTemplate) => {
    const { icon: _icon, tagline: _tagline, ...payload } = template
    void _icon
    void _tagline
    const seed: Partial<Omit<SavedTradeInterest, "id">> = {
      ...payload,
      appliedTo:
        isIndividual && selectedItem ? [selectedItem.id] : [],
    }
    const created = create(seed)
    setExpandedId(created.id)
    setExpandedMode("edit")
    setConfirmingRemovalId(null)
  }

  /** Light "peek" toggle. Click the row body or chevron → open pill view. */
  const handleToggleDetail = (id: string) => {
    setConfirmingRemovalId(null)
    setExpandedId((prev) =>
      prev === id && expandedMode === "detail" ? null : id,
    )
    setExpandedMode("detail")
  }

  /** Heavy "edit" toggle. Click the pencil → open the full editor form. */
  const handleToggleEdit = (id: string) => {
    setConfirmingRemovalId(null)
    setExpandedId((prev) =>
      prev === id && expandedMode === "edit" ? null : id,
    )
    setExpandedMode("edit")
  }

  const handleRemove = (id: string) => {
    remove(id)
    if (expandedId === id) setExpandedId(null)
    if (confirmingRemovalId === id) setConfirmingRemovalId(null)
  }

  /* Memoize bucketing — interests rebucket only when the underlying list or
   * the selected-item context changes, not on every expansion toggle. */
  const buckets = React.useMemo(() => {
    const global: SavedTradeInterest[] = []
    const partial: SavedTradeInterest[] = []
    const templates: SavedTradeInterest[] = []
    const itemSpecific: SavedTradeInterest[] = []
    const availableForItem: SavedTradeInterest[] = []

    for (const interest of interests) {
      const global_ = isGlobalInterest(interest, items)
      if (global_) {
        global.push(interest)
        continue
      }
      if (interest.appliedTo.length === 0) {
        templates.push(interest)
      } else {
        partial.push(interest)
      }

      if (isIndividual && selectedItem) {
        if (interest.appliedTo.includes(selectedItem.id)) {
          itemSpecific.push(interest)
        } else {
          /* Anything not global and not already applied to the current item
           * is fair game for the "Add from existing" picker. */
          availableForItem.push(interest)
        }
      }
    }

    return { global, partial, templates, itemSpecific, availableForItem }
  }, [interests, items, isIndividual, selectedItem])

  const handleApplyExisting = (interestId: string) => {
    if (!selectedItem) return
    applyToListing(interestId, selectedItem.id)
    /* Snap focus to the row the user just adopted so they can immediately
     * tweak its criteria for this item if they want to. */
    setExpandedId(interestId)
    setExpandedMode("edit")
    setConfirmingRemovalId(null)
  }

  /* ------------------------------------------------------------------------ */

  const renderCard = (interest: SavedTradeInterest) => {
    const isGlobal = isGlobalInterest(interest, items)
    const appliedCount = interest.appliedTo.length
    let reachLabel = ""
    let reachTone: "global" | "individual" | "template" = "individual"
    if (isGlobal) {
      reachLabel = "Global"
      reachTone = "global"
    } else if (appliedCount === 0) {
      reachLabel = "Draft"
      reachTone = "template"
    } else {
      reachLabel = `${appliedCount} ${appliedCount === 1 ? "listing" : "listings"}`
      reachTone = "individual"
    }
    return (
      <InterestCard
        key={interest.id}
        interest={interest}
        reachLabel={reachLabel}
        reachTone={reachTone}
        onEdit={() => handleToggleEdit(interest.id)}
        onRequestRemove={() => setConfirmingRemovalId(interest.id)}
        confirming={confirmingRemovalId === interest.id}
        onCancelRemove={() => setConfirmingRemovalId(null)}
        onConfirmRemove={() => handleRemove(interest.id)}
      />
    )
  }

  // Sidebar editing state — derived from existing expanded/edit pattern.
  const editingInterest =
    expandedMode === "edit" && expandedId
      ? interests.find((i) => i.id === expandedId) ?? null
      : null

  return (
    <div className="flex">
      <div
        className={cn(
          "min-w-0 flex-1 px-4 pb-6 pt-3 md:px-8",
          editingInterest && "lg:max-w-[calc(100%-480px)]",
        )}
      >
      {/* Header — title only */}
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to Trade"
          className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="truncate text-2xl font-bold text-foreground">
          Trade Interests
        </h1>
      </div>

      {/* Toolbar row: [New Interest] [Global] [Individual]   ←gap→   [Filter] */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleNew}
          className="h-9 gap-1.5"
        >
          <Plus className="h-4 w-4" />
          New Interest
        </Button>
        <FilterPill
          active={activeTabs.global}
          onClick={() => {
            const next = !activeTabs.global
            if (!next && !activeTabs.individual) return
            setActiveTabs((p) => ({ ...p, global: next }))
          }}
          trailing={
            <span className="tabular-nums opacity-70">
              {buckets.global.length}
            </span>
          }
        >
          Global
        </FilterPill>
        <FilterPill
          active={activeTabs.individual}
          onClick={() => {
            const next = !activeTabs.individual
            if (!next && !activeTabs.global) return
            setActiveTabs((p) => ({ ...p, individual: next }))
          }}
          tone="info"
          trailing={
            <span className="tabular-nums opacity-70">
              {isIndividual
                ? buckets.itemSpecific.length
                : buckets.partial.length + buckets.templates.length}
            </span>
          }
        >
          Individual
        </FilterPill>
        <div className="ml-auto flex items-center gap-2">
          <Select
            value={sortMode}
            onValueChange={(v) => setSortMode(v as SortMode)}
          >
            <SelectTrigger
              aria-label="Sort"
              className="h-9 w-auto gap-2 text-sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Sort: default</SelectItem>
              <SelectItem value="name-az">Sort: A → Z</SelectItem>
              <SelectItem value="name-za">Sort: Z → A</SelectItem>
              <SelectItem value="applied-most">Sort: most applied</SelectItem>
              <SelectItem value="applied-least">Sort: least applied</SelectItem>
            </SelectContent>
          </Select>
          <GridDensitySelector id="trade-interests-density" />
          <TradeItemSelector
            items={items}
            selectedItemId={selectedItemId}
            onSelect={onSelectItem}
            totalMatches={0}
            triggerPrefix="Applied to"
          />
        </div>
      </div>

      {/* Body — unified grid */}
      {interests.length === 0 ? (
        <EmptyState onCreate={handleNew} />
      ) : (
        (() => {
          // Build the unified list based on active tabs
          const list: SavedTradeInterest[] = []
          if (activeTabs.global) list.push(...buckets.global)
          if (activeTabs.individual) {
            if (isIndividual && selectedItem) {
              list.push(...buckets.itemSpecific)
            } else {
              list.push(...buckets.partial, ...buckets.templates)
            }
          }

          // Apply sort
          const sorted = [...list]
          switch (sortMode) {
            case "name-az":
              sorted.sort((a, b) =>
                (a.name || "").localeCompare(b.name || ""),
              )
              break
            case "name-za":
              sorted.sort((a, b) =>
                (b.name || "").localeCompare(a.name || ""),
              )
              break
            case "applied-most":
              sorted.sort((a, b) => b.appliedTo.length - a.appliedTo.length)
              break
            case "applied-least":
              sorted.sort((a, b) => a.appliedTo.length - b.appliedTo.length)
              break
            default:
              break
          }

          if (sorted.length === 0) {
            return (
              <div className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
                No interests match the current filters.
              </div>
            )
          }

          // When sidebar is open, force 2-col grid so cards keep their width
          // and the layout simply re-flows instead of squeezing every card.
          const gridClass = editingInterest
            ? "grid grid-cols-1 gap-3 md:grid-cols-2"
            : gridDensityConfig[gridDensity].gridClass
          return (
            <div className={gridClass}>{sorted.map(renderCard)}</div>
          )
        })()
      )}

      </div>

      {/* Split-screen sidebar editor */}
      {editingInterest && (
        <aside className="sticky top-0 hidden h-[100dvh] w-[480px] shrink-0 overflow-y-auto border-l border-border bg-background lg:block">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-border bg-background px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                {editingInterest.name ? "Edit Interest" : "New Interest"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {editingInterest.mode === "simple"
                  ? "Describe what you'd accept; structure with AI before saving."
                  : "Fill in the structured fields below."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setExpandedId(null)}
              aria-label="Close editor"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-5">
            <SavedInterestEditor
              interest={editingInterest}
              onSaved={() => setExpandedId(null)}
              onCancel={() => setExpandedId(null)}
            />
          </div>
        </aside>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Section heading + body wrapper                                             */
/* -------------------------------------------------------------------------- */

function Section({
  title,
  caption,
  count,
  children,
  empty,
  actions,
  collapsed = false,
  onToggleCollapse,
}: {
  title: string
  caption?: string
  count: number
  children?: React.ReactNode
  /** Rendered when `count === 0`. Falls back to a soft dashed empty card. */
  empty?: string
  /** Right-aligned actions for the section header (e.g. add-existing picker).
   *  Lives outside the collapse trigger so clicking the picker doesn't toggle
   *  the section as a side effect. */
  actions?: React.ReactNode
  /** Whether the body is hidden. Controlled by the parent so collapse state
   *  survives unrelated re-renders (e.g. expanding an InterestRow editor). */
  collapsed?: boolean
  /** When provided, the title cluster becomes a clickable toggle and a
   *  chevron renders next to the title. Omit for a non-collapsible section. */
  onToggleCollapse?: () => void
}) {
  /* The title + count cluster is the toggle target. Caption is included
   * inside the same button so the entire textual region is one big affordance
   * — increases the click target on touch and matches the platform's other
   * accordion-style UIs. */
  const TitleCluster = (
    <div className="flex min-w-0 items-start gap-2">
      {onToggleCollapse ? (
        <ChevronRight
          aria-hidden="true"
          className={cn(
            "mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform",
            !collapsed && "rotate-90",
          )}
        />
      ) : null}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="truncate text-sm font-semibold uppercase tracking-wide text-foreground">
            {title}
          </h2>
          <span className="text-xs text-muted-foreground">{count}</span>
        </div>
        {caption ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{caption}</p>
        ) : null}
      </div>
    </div>
  )

  return (
    <section>
      <div className="mb-2 flex items-end justify-between gap-3">
        {onToggleCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-expanded={!collapsed}
            className="-mx-1 -my-1 flex min-w-0 flex-1 items-start gap-2 rounded-md px-1 py-1 text-left transition-colors hover:bg-secondary/40"
          >
            {TitleCluster}
          </button>
        ) : (
          TitleCluster
        )}
        {actions ? <div className="flex-shrink-0">{actions}</div> : null}
      </div>
      {collapsed ? null : count === 0 ? (
        /* Empty state aligns its left edge to where an interest row's title
         * would begin (px-3 row padding + w-4 leading spacer + gap-3 = 40px,
         * i.e. ml-10). This way the empty card occupies the same horizontal
         * column as the actual content would, instead of stretching to the
         * full section width and visually overstating the absence. Vertical
         * padding stays at the original py-5 to preserve breathing room. */
        <div className="ml-10 rounded-lg border border-dashed border-border bg-card/40 px-4 py-5">
          <p className="text-xs text-muted-foreground">
            {empty ?? "Nothing here yet."}
          </p>
        </div>
      ) : (
        children
      )}
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* Add-from-existing picker                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Tiny dropdown that lists every saved interest NOT yet applied to the current
 * item. Clicking a row immediately applies the interest via the store and
 * collapses the picker — the parent is responsible for snapping focus to the
 * newly-adopted row, which makes the relationship feel direct. Includes a
 * search field once the list passes a sensible threshold so users with many
 * templates can narrow down without scrolling.
 */
function AddExistingPicker({
  available,
  onApply,
}: {
  available: SavedTradeInterest[]
  onApply: (id: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  React.useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const filtered = available.filter((interest) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (
      (interest.name || "").toLowerCase().includes(q) ||
      (interest.brand || "").toLowerCase().includes(q) ||
      (interest.model || "").toLowerCase().includes(q) ||
      (interest.category || "").toLowerCase().includes(q) ||
      (interest.subcategory || "").toLowerCase().includes(q)
    )
  })

  return (
    <div className="relative" ref={containerRef}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        className="h-8"
      >
        <Plus className="mr-1 h-3.5 w-3.5" />
        Add existing
        <ChevronDown
          className={cn(
            "ml-1 h-3.5 w-3.5 transition-transform",
            open && "rotate-180",
          )}
        />
      </Button>

      {open ? (
        <div className="absolute right-0 top-full z-[60] mt-1 w-80 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          <div className="border-b border-border p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your interests..."
                className="w-full rounded-md border border-border bg-card py-1.5 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <p className="mt-1.5 px-0.5 text-[11px] text-muted-foreground">
              Pull an interest you&apos;ve already authored into this item.
            </p>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                {query
                  ? `No interests matching "${query}"`
                  : "No more interests to pull in."}
              </div>
            ) : (
              filtered.map((interest, idx) => {
                const summary = summarizeSavedInterest(interest)
                const reach = interest.appliedTo.length
                return (
                  <button
                    key={interest.id}
                    type="button"
                    onClick={() => {
                      onApply(interest.id)
                      setOpen(false)
                      setQuery("")
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-secondary",
                      idx > 0 && "border-t border-border",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "truncate text-sm font-medium",
                          interest.name
                            ? "text-foreground"
                            : "italic text-muted-foreground",
                        )}
                      >
                        {interest.name || "Untitled interest"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {summary}
                        {reach > 0
                          ? ` · Applied to ${reach} ${
                              reach === 1 ? "listing" : "listings"
                            }`
                          : " · Not applied yet"}
                      </p>
                    </div>
                    <Check className="h-3.5 w-3.5 flex-shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                )
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Row                                                                        */
/* -------------------------------------------------------------------------- */

function InterestRow({
  interest,
  items,
  contextItemId,
  expanded,
  expandedMode,
  dimmed = false,
  confirming,
  onToggleDetail,
  onToggleEdit,
  onRequestRemove,
  onCancelRemove,
  onConfirmRemove,
  onSaved,
  onCancelEdit,
}: {
  interest: SavedTradeInterest
  items: TradeableItemSummary[]
  /** When set, the row tailors its reach caption ("Just this item",
   *  "Shared with N other listings", etc.) to the current item context. */
  contextItemId: string | null
  expanded: boolean
  /** Which mode the row is open in (only meaningful when `expanded`). */
  expandedMode: "detail" | "edit" | null
  /** Visually de-emphasize this row because *another* row is currently
   *  expanded. Pulls the user's focus to the expanded row without removing
   *  the dimmed rows from the layout. The row remains fully interactive —
   *  hovering it lifts the dim so the user can re-engage at any time. */
  dimmed?: boolean
  confirming: boolean
  /** Click-row / click-chevron → open the lightweight pill-chip view. */
  onToggleDetail: () => void
  /** Click-pencil → open the heavy editor form. */
  onToggleEdit: () => void
  onRequestRemove: () => void
  onCancelRemove: () => void
  onConfirmRemove: () => void
  onSaved: () => void
  onCancelEdit: () => void
}) {
  /* Single-line description. Brand/model if structured, otherwise the
   * category breadcrumb, otherwise a short slice of the simple-mode prose.
   * Keeps the list readable whether the user authored in Simple or Advanced. */
  const description = (() => {
    if (interest.mode === "simple" && interest.simpleText.trim()) {
      const clean = interest.simpleText.trim().replace(/\s+/g, " ")
      return clean.length > 80 ? clean.slice(0, 80).trimEnd() + "…" : clean
    }
    const brandModel = [interest.brand, interest.model].filter(Boolean).join(" ")
    if (brandModel) return brandModel
    const crumbs = [interest.category, interest.subcategory].filter(Boolean)
    return crumbs.join(" · ") || "No criteria yet"
  })()

  /* Reach count — what number to show in parens on the right side of the row.
   * Mirrors the count semantics in the screenshots: a quick "this many
   * listings touch this interest". For a context-bound view we still show
   * the raw count; the section label ("Individual") supplies the framing. */
  const isGlobal = isGlobalInterest(interest, items)
  const appliedCount = isGlobal ? items.length : interest.appliedTo.length

  /* Pill chips for the detail view. Each chip pairs a muted label with a
   * bold value, matching the screenshot's "Category Electric Guitars" look.
   * Only chips with a value render — empty fields stay invisible so the
   * detail panel stays tight no matter how sparse the interest is. */
  const detailChips = (() => {
    const chips: { label: string; value: string }[] = []
    const push = (label: string, value: string | undefined) => {
      const v = value?.trim()
      if (v) chips.push({ label, value: v })
    }
    push("Category", interest.category)
    push("Subcategory", interest.subcategory)
    push("Brand", interest.brand)
    push("Model", interest.model)
    push("Condition", interest.condition)
    /* Budget — combine min/max into a single chip if either is present. */
    const min = interest.valueMin?.trim()
    const max = interest.valueMax?.trim()
    if (min || max) {
      const fmt = (v: string) => `$${Number(v).toLocaleString()}`
      const value =
        min && max
          ? `${fmt(min)} – ${fmt(max)}`
          : min
            ? `From ${fmt(min)}`
            : `Up to ${fmt(max!)}`
      chips.push({ label: "Budget", value })
    }
    /* Spec key/value pairs (e.g. era, wattage, tonewood) — surface each as
     * its own chip so the detail view scales with the user's annotation. */
    if (interest.specs) {
      for (const [k, v] of Object.entries(interest.specs)) {
        if (typeof v === "string" && v.trim())
          chips.push({ label: k, value: v })
      }
    }
    return chips
  })()

  const isDetailOpen = expanded && expandedMode === "detail"
  const isEditOpen = expanded && expandedMode === "edit"

  return (
    <div
      className={cn(
        "group transition-opacity duration-200",
        isEditOpen && "bg-secondary/30",
        /* Focus mode — dim siblings of the open row. `hover:opacity-100`
         * lets the user re-engage a dimmed row without first closing the
         * expanded one, which is important when scanning for a peer to
         * compare against. */
        dimmed && "opacity-30 hover:opacity-100",
      )}
    >
      {/* Compact row — leading icon + title + reach badge + summary chips */}
      <div className="flex items-start gap-3 px-3 py-3 transition-colors hover:bg-secondary/20">
        <CategoryIcon category={interest.category} />
        <button
          type="button"
          onClick={onToggleDetail}
          aria-expanded={isDetailOpen}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                "truncate text-sm font-semibold transition-colors",
                !interest.name
                  ? "italic text-muted-foreground"
                  : "text-foreground group-hover:text-primary",
                isDetailOpen && interest.name && "text-primary",
              )}
            >
              {interest.name || "Untitled interest"}
            </span>
            <ReachBadge
              isGlobal={isGlobal}
              appliedCount={appliedCount}
            />
          </div>
          {description ? (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {description}
            </p>
          ) : null}
          <SummaryChips
            chips={detailChips.slice(0, 3)}
            extra={detailChips.length > 3 ? detailChips.length - 3 : 0}
          />
        </button>

        {/* Actions cluster. Delete uses an inline 2-step confirm to avoid
            stacking another dialog on top of the already-inline editor.

            Order: pencil → X → chevron. The chevron is anchored to the
            far-right edge as the row's permanent expand/collapse handle —
            its position is stable so the eye learns where to look. Pencil
            and X reveal on row hover or keyboard focus, since they're
            management actions the user only needs occasionally. The pencil
            stays visible while the editor is open as an explicit "way out". */}
        {!confirming ? (
          <div className="flex flex-shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleEdit}
              aria-label={isEditOpen ? "Close editor" : "Edit interest"}
              aria-expanded={isEditOpen}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-md transition-[color,background-color,opacity]",
                isEditOpen
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground opacity-0 hover:bg-secondary hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100",
              )}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onRequestRemove}
              aria-label="Remove interest"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-[color,background-color,opacity] hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onToggleDetail}
              aria-label={isDetailOpen ? "Hide details" : "Show details"}
              aria-expanded={isDetailOpen}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isDetailOpen && "rotate-180",
                )}
              />
            </button>
          </div>
        ) : (
          <div className="flex flex-shrink-0 items-center gap-1.5">
            <span className="text-xs text-muted-foreground">
              Remove this interest?
            </span>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onConfirmRemove}
              className="h-7 px-2.5"
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Remove
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancelRemove}
              className="h-7 px-2"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Detail pills — lightweight peek of the saved criteria. Each chip
          renders as muted-label + bold-value, mirroring the design vision.
          Falls back to a soft "no criteria yet" line when the interest is
          a fresh draft so the detail panel never collapses to zero height. */}
      {isDetailOpen ? (
        <div className="px-3 pb-3 pl-10">
          {detailChips.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {detailChips.map((chip, i) => (
                <span
                  key={`${chip.label}-${i}`}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-2.5 py-1 text-xs"
                >
                  <span className="text-muted-foreground">{chip.label}</span>
                  <span className="font-medium text-foreground">
                    {chip.value}
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs italic text-muted-foreground">
              No criteria yet — click the pencil to add some.
            </p>
          )}
        </div>
      ) : null}

      {/* Inline editor — heavy form opens via the pencil icon. */}
      {isEditOpen ? (
        <SavedInterestEditor
          interest={interest}
          onSaved={onSaved}
          onCancel={onCancelEdit}
        />
      ) : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Empty state                                                                */
/* -------------------------------------------------------------------------- */

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return <InterestEmptyState variant="full" onAddNew={onCreate} />
}

/* -------------------------------------------------------------------------- */
/* Visual helpers for InterestRow                                             */
/* -------------------------------------------------------------------------- */

function CategoryIcon({ category }: { category: string }) {
  // Lightweight category → emoji mapping. Covers the main niches; fallback
  // covers everything else with a neutral package symbol.
  const emoji = (() => {
    const c = category.toLowerCase()
    if (c.includes("guitar")) return "🎸"
    if (c.includes("audio") || c.includes("amp")) return "🔊"
    if (c.includes("drum")) return "🥁"
    if (c.includes("key")) return "🎹"
    return "🎵"
  })()
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/40 text-base">
      {emoji}
    </div>
  )
}

function ReachBadge({
  isGlobal,
  appliedCount,
}: {
  isGlobal: boolean
  appliedCount: number
}) {
  if (isGlobal) {
    return (
      <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
        Global
      </span>
    )
  }
  if (appliedCount === 0) {
    return (
      <span className="shrink-0 rounded-full border border-border/60 bg-secondary/40 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        Template
      </span>
    )
  }
  return (
    <span className="shrink-0 rounded-full border border-border/60 bg-background/40 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
      {appliedCount} {appliedCount === 1 ? "listing" : "listings"}
    </span>
  )
}

function SummaryChips({
  chips,
  extra,
}: {
  chips: { label: string; value: string }[]
  extra: number
}) {
  if (chips.length === 0) return null
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1">
      {chips.map((chip) => (
        <span
          key={`${chip.label}-${chip.value}`}
          className="inline-flex items-center rounded-md bg-secondary/40 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
        >
          {chip.value}
        </span>
      ))}
      {extra > 0 && (
        <span className="text-[10px] text-muted-foreground/70">+{extra}</span>
      )}
    </div>
  )
}

