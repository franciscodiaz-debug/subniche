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
import Image from "next/image"
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
import {
  summarizeSavedInterest,
  useSavedTradeInterests,
  type SavedTradeInterest,
} from "@/lib/saved-trade-interests-context"
import type { TradeableItemSummary } from "@/lib/market-data"
import { SavedInterestEditor } from "./saved-interest-editor"
import { TradeItemSelector } from "./trade-item-selector"
import { TradeInterestRow, savedInterestToChips, savedInterestDescription } from "./trade-interest-row"

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

  /* Collapse state — opt-in by section key. We store the COLLAPSED set (not
   * the expanded set) so the default behavior (everything expanded) requires
   * no initialization beyond explicit defaults, and so a section appearing
   * for the first time is automatically open.
   *
   * Section keys are scoped by mode:
   *   - "global-all"        — Global section in All-items mode
   *   - "global-individual" — Global section in individual-item mode
   *   - "individual"        — Individual section (only in individual-item mode)
   *
   * Default collapsed:
   *   - In all-items mode: Individual section is pre-collapsed so Global is the focus
   *   - In individual-item mode: Global section is pre-collapsed so Individual is the focus */
  const [collapsedSections, setCollapsedSections] = React.useState<
    Set<string>
  >(() => new Set(["global-individual", "individual"]))

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

  const handleNewGlobal = () => {
    const created = create({ appliedTo: items.map((i) => i.id) })
    setExpandedId(created.id)
    setExpandedMode("edit")
    setConfirmingRemovalId(null)
  }

  const handleApplyAsGlobal = (interestId: string) => {
    items.forEach((item) => applyToListing(interestId, item.id))
    setExpandedId(interestId)
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

  const renderRow = (interest: SavedTradeInterest) => {
    const isExpanded = expandedId === interest.id
    /* Focus mode — when *any* row is open, all others dim down so the eye
     * lands on the expanded one. Computed once per render from `expandedId`
     * and passed in so the row itself doesn't need to know the parent's
     * full state shape. */
    const dimmed = expandedId !== null && !isExpanded
    return (
      <li key={interest.id}>
        <InterestRow
          interest={interest}
          items={items}
expanded={isExpanded}
          expandedMode={isExpanded ? expandedMode : null}
          dimmed={dimmed}
          confirming={confirmingRemovalId === interest.id}
          onToggleDetail={() => handleToggleDetail(interest.id)}
          onToggleEdit={() => handleToggleEdit(interest.id)}
          onRequestRemove={() => setConfirmingRemovalId(interest.id)}
          onCancelRemove={() => setConfirmingRemovalId(null)}
          onConfirmRemove={() => handleRemove(interest.id)}
          onSaved={() => setExpandedId(null)}
          onCancelEdit={() => setExpandedId(null)}
        />
      </li>
    )
  }

  return (
    <div className="px-4 pb-6 pt-3 md:px-8">
      {/* Header ----------------------------------------------------------
          Single creation entry point lives in the top-right, matching the
          rectangular primary-button styling used elsewhere on the platform
          (saved-interest editor, listing screens, etc.). The label adapts
          to context so the user knows what scope the click implies. */}
      <div className="mb-1 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
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
        <Button
          type="button"
          onClick={handleNew}
          className="h-11 flex-shrink-0 px-4 text-sm"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          New Interest
        </Button>
      </div>

      {/* "For" row ----------------------------------------------------------
          Sits flush beneath the H1 (mb-1 above, no header card) so the title
          and selector read as a single header cluster: "Trade Interests / For
          [All items ▾]". Subtle selector variant drops the card-button chrome
          and uses larger text to match the title's visual weight. Indented by
          ml-10 to align with the H1's text start (back arrow width + gap).

          The selector is controlled by TradeContent; switching here also
          changes the upstream grid filter, so backing out preserves the user's
          focus context. When "All items" is selected → Global / Individual
          buckets render across the whole portfolio. When a specific item is
          selected → the page reframes around that item. */}
      <div className="mb-3 ml-10 flex w-full flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">For</span>
        <TradeItemSelector
          items={items}
          selectedItemId={selectedItemId}
          onSelect={onSelectItem}
          totalMatches={0}
        />
      </div>

      {/* Selected-item preview ---------------------------------------------
          When the user has narrowed to a specific listing, render a compact
          visual card so they aren't relying on the selector text alone to
          confirm which item they're managing. Three signals at a glance:
          thumbnail (recognizes shape/finish faster than reading), title +
          subtitle (model + condition), and asking price (anchors the trade
          value the interests will be evaluated against). Not shown for the
          "All items" mode since there's no single subject to preview.

          Indented to ml-10 to align with the H1 text and the For-selector
          row above it, keeping the header cluster visually unified. */}
      {isIndividual && selectedItem ? (
        <div className="mb-5 ml-10 flex w-fit max-w-lg items-center gap-3 rounded-lg border border-border bg-card/50 p-2.5">
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
            <Image
              src={selectedItem.image || "/placeholder.svg"}
              alt={selectedItem.title}
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {selectedItem.title}
            </p>
            {selectedItem.subtitle ? (
              <p className="truncate text-xs text-muted-foreground">
                {selectedItem.subtitle}
              </p>
            ) : null}
          </div>
          {typeof selectedItem.price === "number" ? (
            <p className="ml-6 flex-shrink-0 text-sm font-semibold tabular-nums text-foreground">
              ${selectedItem.price.toLocaleString()}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mb-5" />
      )}

      {/* Body ------------------------------------------------------------- */}
      <div className="ml-10">
      {interests.length === 0 ? (
        <EmptyState onCreate={handleNew} />
      ) : isIndividual && selectedItem ? (
        <div className="space-y-1.5">
          <Section
            title="Global"
            caption="Applied to every listing — including this one. Edits here update everywhere."
            count={buckets.global.length}
            empty="No interests here yet."
            collapsed={collapsedSections.has("global-individual")}
            onToggleCollapse={() => toggleSection("global-individual")}
            actions={
              <AddExistingPicker
                available={[...buckets.partial, ...buckets.templates]}
                onApply={handleApplyAsGlobal}
                onAddNew={handleNewGlobal}
              />
            }
          >
            {buckets.global.length > 0 ? (
              <ul className="ml-6 space-y-2">
                {buckets.global.map(renderRow)}
              </ul>
            ) : null}
          </Section>

          <Section
            title="Individual"
            caption="Applied to this listing. May also be shared with other listings."
            count={buckets.itemSpecific.length}
            empty="No interests here yet."
            collapsed={collapsedSections.has("individual")}
            onToggleCollapse={() => toggleSection("individual")}
            actions={
              <AddExistingPicker
                available={buckets.availableForItem}
                onApply={handleApplyExisting}
                onAddNew={handleNew}
              />
            }
          >
            {buckets.itemSpecific.length > 0 ? (
              <ul className="ml-6 space-y-2">
                {buckets.itemSpecific.map(renderRow)}
              </ul>
            ) : null}
          </Section>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Section
            title="Global"
            caption="Applied to every listing"
            count={buckets.global.length}
            empty="No interests here yet."
            collapsed={collapsedSections.has("global-all")}
            onToggleCollapse={() => toggleSection("global-all")}
            actions={
              <AddExistingPicker
                available={[...buckets.partial, ...buckets.templates]}
                onApply={handleApplyAsGlobal}
                onAddNew={handleNewGlobal}
              />
            }
          >
            {buckets.global.length > 0 ? (
              <ul className="ml-6 space-y-2">
                {buckets.global.map(renderRow)}
              </ul>
            ) : null}
          </Section>

          {/* Templates (interests with empty appliedTo) live alongside partial
              ones in this view so a brand-new draft created from "+ New" in
              this section doesn't disappear before the user finishes editing
              its scope. */}
          {(() => {
            const otherInterests = [...buckets.partial, ...buckets.templates]
            return (
              <Section
                title="Individual"
                caption="Applied to individual listings"
                count={otherInterests.length}
                empty="No interests here yet."
                collapsed={collapsedSections.has("individual")}
                onToggleCollapse={() => toggleSection("individual")}
                actions={
                  <AddExistingPicker
                    available={[]}
                    onApply={() => {}}
                    onAddNew={handleNew}
                  />
                }
              >
                {otherInterests.length > 0 ? (
                  <ul className="ml-6 space-y-2">
                    {otherInterests.map(renderRow)}
                  </ul>
                ) : null}
              </Section>
            )
          })()}
        </div>
      )}
      </div>

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
  empty?: string
  actions?: React.ReactNode
  collapsed?: boolean
  onToggleCollapse?: () => void
}) {
  return (
    <section className="group/section">
      {/* Header — full-width hover zone. Caption and action button are hidden
          by default and revealed on group-hover; both stay invisible (not
          removed) when collapsed so height never shifts. */}
      <div className="relative mb-2">
        <button
          type="button"
          onClick={onToggleCollapse ?? undefined}
          aria-expanded={onToggleCollapse ? !collapsed : undefined}
          className={cn(
            "flex w-full items-start gap-2 rounded-md px-1 py-3 text-left transition-colors",
            onToggleCollapse && "hover:bg-secondary/40",
          )}
        >
          {onToggleCollapse ? (
            <ChevronRight
              aria-hidden="true"
              className={cn(
                "mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform",
                !collapsed && "rotate-90",
              )}
            />
          ) : null}
          <div className="min-w-0 pr-28">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-sm font-semibold uppercase tracking-wide text-foreground">
                {title}
              </h2>
              <span className="text-xs text-muted-foreground">{count}</span>
            </div>
            {caption ? (
              <p className={cn(
                "mt-0.5 text-xs text-muted-foreground transition-opacity duration-200",
                collapsed ? "opacity-0 group-hover/section:opacity-100" : "opacity-100",
              )}>
                {caption}
              </p>
            ) : null}
          </div>
        </button>

        {actions ? (
          <div
            className={cn(
              "absolute right-1 top-1/2 -translate-y-1/2 transition-opacity duration-150",
              collapsed ? "opacity-0 pointer-events-none" : "opacity-100",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {actions}
          </div>
        ) : null}
      </div>

      {collapsed ? null : count === 0 ? (
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
  onAddNew,
}: {
  available: SavedTradeInterest[]
  onApply: (id: string) => void
  onAddNew: () => void
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
        variant="quiet_outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        className="h-8"
      >
        <Plus className="mr-1 h-3.5 w-3.5" />
        Add Interest
        <ChevronDown
          className={cn(
            "ml-1 h-3.5 w-3.5 transition-transform",
            open && "rotate-180",
          )}
        />
      </Button>

      {open ? (
        <div className="absolute right-0 top-full z-[60] mt-1 w-80 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          <button
            type="button"
            onClick={() => { onAddNew(); setOpen(false) }}
            className="flex w-full items-center gap-2 border-b border-border px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
            New interest
          </button>
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
                      "group/item flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-secondary",
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
                    <Check className="h-3.5 w-3.5 flex-shrink-0 text-primary opacity-0 transition-opacity group-hover/item:opacity-100" />
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
  expanded: boolean
  expandedMode: "detail" | "edit" | null
  dimmed?: boolean
  confirming: boolean
  onToggleDetail: () => void
  onToggleEdit: () => void
  onRequestRemove: () => void
  onCancelRemove: () => void
  onConfirmRemove: () => void
  onSaved: () => void
  onCancelEdit: () => void
}) {
  const isGlobal = isGlobalInterest(interest, items)
  const appliedCount = isGlobal ? items.length : interest.appliedTo.length
  const chips = savedInterestToChips(interest)
  const description = savedInterestDescription(interest)
  const isDetailOpen = expanded && expandedMode === "detail"
  const isEditOpen = expanded && expandedMode === "edit"

  const actions = !confirming ? (
    <>
      <button
        type="button"
        onClick={onToggleEdit}
        aria-label={isEditOpen ? "Close editor" : "Edit interest"}
        aria-expanded={isEditOpen}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md transition-[color,background-color,opacity]",
          isEditOpen
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground opacity-0 hover:bg-secondary hover:text-foreground focus-visible:opacity-100 group-hover/row:opacity-100",
        )}
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={onRequestRemove}
        aria-label="Remove interest"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-[color,background-color,opacity] hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 group-hover/row:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </>
  ) : (
    <div className="flex flex-shrink-0 items-center gap-1.5">
      <span className="text-xs text-muted-foreground">Remove this interest?</span>
      <Button type="button" variant="destructive" size="sm" onClick={onConfirmRemove} className="h-7 px-2.5">
        <Trash2 className="mr-1 h-3 w-3" />
        Remove
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onCancelRemove} className="h-7 px-2">
        Cancel
      </Button>
    </div>
  )

  return (
    <TradeInterestRow
      name={interest.name}
      description={description}
      chips={chips}
      count={appliedCount}
      actions={actions}
      inlineEditor={isEditOpen ? (
        <SavedInterestEditor interest={interest} onSaved={onSaved} onCancel={onCancelEdit} />
      ) : null}
      dimmed={dimmed}
      expanded={isDetailOpen}
      onToggle={onToggleDetail}
      emptyChipsLabel="No criteria yet — click the pencil to add some."
      className={isEditOpen ? "bg-secondary/30" : undefined}
    />
  )
}

/* -------------------------------------------------------------------------- */
/* Empty state                                                                */
/* -------------------------------------------------------------------------- */

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card/40 px-6 py-16 text-center">
      <p className="text-sm font-medium text-foreground">
        No interests saved yet.
      </p>
      <p className="max-w-sm text-xs text-muted-foreground">
        Create reusable trade interests and apply them to any listing without
        retyping the same criteria every time.
      </p>
      <Button type="button" size="sm" onClick={onCreate} className="mt-2 h-8">
        <Plus className="mr-1 h-4 w-4" />
        New interest
      </Button>
    </div>
  )
}
