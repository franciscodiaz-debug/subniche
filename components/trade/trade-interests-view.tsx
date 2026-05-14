"use client"

/**
 * <TradeInterestsView />
 *
 * Replaces the Trade grid entirely when the user clicks the gear next to the
 * "For" dropdown. No modal, no overlay — this is plain section navigation
 * inside the Trade hub, per the spec.
 *
 * Two display modes, driven by the parent's `selectedItemId`:
 *
 *   1. ALL  (selectedItemId === "all")
 *      Shows every saved trade interest. Row chips explain whether each
 *      interest is global, listing-specific, shared, or not applied yet.
 *
 *   2. INDIVIDUAL ITEM  (selectedItemId === "my-1" etc.)
 *      The whole surface is reframed around that single item, since the user
 *      arrived here from "For <item>" upstream.
 *      Listing-specific, shared, and global interests that apply to that item
 *      are shown together, with global interests using a softer treatment.
 *      Add Interest lets the user either author from scratch or reuse an
 *      existing saved interest without retyping.
 *
 * Surface contract:
 *   Header:  ←  Trade Interests
 *            (subtitle — current item context if individual mode)
 *   Section: Title + count
 *            Row: Name + subcategory pill
 *            Brand · Reach caption                          [edit] [×]
 *   On edit: the row expands in-place; the <SavedInterestEditor /> mounts
 *            directly beneath the row. Multiple rows cannot be expanded at
 *            once — focusing one collapses the others so the viewer never
 *            has dueling long forms fighting for vertical space.
 *
 * New interests: the inline creation buttons create a fresh shell in the
 * store and auto-expand its row so the name field is the next obvious thing
 * to fill out. When the user is in individual mode, the new interest is also
 * auto-applied to the current item so it lands in the right section without
 * an extra click.
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
import {
  TradeInterestRow,
  savedInterestDescription,
  savedInterestToChips,
} from "./trade-interest-row"

interface TradeInterestsViewProps {
  /** Return to the grid. Rendered as the back-arrow target in the header. */
  onBack: () => void
  /** The viewer's tradeable items. Used to determine globality (an interest
   *  is "global" iff its appliedTo set covers every item) and to drive the
   *  in-page "For" selector that controls All vs. individual-item mode. */
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

const INTERESTS_SCOPE_ID = "__interests__"

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

function getInterestApplicationStatus(
  interest: SavedTradeInterest,
  items: TradeableItemSummary[],
) {
  if (isGlobalInterest(interest, items)) {
    return "Global - Applied to all listings"
  }

  const appliedItems = interest.appliedTo
    .map((id) => items.find((item) => item.id === id))
    .filter((item): item is TradeableItemSummary => Boolean(item))

  if (appliedItems.length === 1) {
    return `Applied to ${appliedItems[0].title}`
  }

  if (appliedItems.length > 1) {
    return `Shared - Applied to ${appliedItems.length} listings`
  }

  return "Not applied yet"
}

function getListingInterestStatus(
  interest: SavedTradeInterest,
  items: TradeableItemSummary[],
) {
  if (isGlobalInterest(interest, items)) {
    return "Global - Applied to all listings"
  }

  if (interest.appliedTo.length > 1) {
    return `Shared - Applied to ${interest.appliedTo.length} listings`
  }

  return "Applied to this listing"
}

function allocateListingInterestMatches(
  interests: SavedTradeInterest[],
  totalMatches: number,
): Map<string, number> {
  const counts = new Map<string, number>()
  if (interests.length === 0 || totalMatches <= 0) return counts

  const weights = interests.map((interest) =>
    Math.max(1, interest.appliedTo.length),
  )
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  let assigned = 0

  const allocations = interests.map((interest, index) => {
    const exact = (totalMatches * weights[index]) / totalWeight
    const base = Math.floor(exact)
    assigned += base
    counts.set(interest.id, base)
    return { id: interest.id, remainder: exact - base }
  })

  allocations
    .sort((a, b) => b.remainder - a.remainder)
    .slice(0, totalMatches - assigned)
    .forEach(({ id }) => {
      counts.set(id, (counts.get(id) ?? 0) + 1)
    })

  return counts
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

  const activeScopeId =
    selectedItemId === "all" ? INTERESTS_SCOPE_ID : selectedItemId
  const isInterestLibrary = activeScopeId === INTERESTS_SCOPE_ID
  const isIndividual = activeScopeId !== "all" && !isInterestLibrary
  const selectedItem = isIndividual
    ? items.find((item) => item.id === activeScopeId) ?? null
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

  /* Listing-specific creation entry point. In individual mode the new
   * interest is pre-bound to the focused item so it lands in the right
   * listing without an extra apply step. */
  const handleNew = () => {
    const seed: Partial<Omit<SavedTradeInterest, "id">> | undefined =
      isIndividual && selectedItem ? { appliedTo: [selectedItem.id] } : undefined
    const created = create(seed)
    setExpandedId(created.id)
    setExpandedMode("edit")
    setConfirmingRemovalId(null)
  }

  const handleNewTemplate = () => {
    const created = create({ appliedTo: [] })
    setExpandedId(created.id)
    setExpandedMode("edit")
    setConfirmingRemovalId(null)
  }

  const handleSelectInterestLibrary = () => {
    onSelectItem("all")
    setExpandedId(null)
    setConfirmingRemovalId(null)
  }

  const handleSelectItem = (id: string) => {
    onSelectItem(id)
    setExpandedId(null)
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

  const visibleListingInterests = React.useMemo(
    () => [...buckets.itemSpecific, ...buckets.global],
    [buckets.itemSpecific, buckets.global],
  )

  const listingInterestMatchCounts = React.useMemo(
    () =>
      allocateListingInterestMatches(
        visibleListingInterests,
        selectedItem?.matchCount ?? 0,
      ),
    [visibleListingInterests, selectedItem?.matchCount],
  )

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

  const renderRow = (
    interest: SavedTradeInterest,
    options?: { statusChip?: string; rowClassName?: string },
  ) => {
    const isExpanded = expandedId === interest.id
    const isEditOpen = isExpanded && expandedMode === "edit"
    return (
      <li key={interest.id}>
        <InterestRow
          key={isEditOpen ? "edit" : "view"}
          interest={interest}
          items={items}
          matchCount={listingInterestMatchCounts.get(interest.id)}
          statusChip={options?.statusChip}
          rowClassName={options?.rowClassName}
          expanded={isExpanded}
          expandedMode={isExpanded ? expandedMode : null}
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
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-3 md:px-8">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to Trade"
            className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-foreground">
              Trade Interests
            </h1>
          </div>
        </div>
      </div>

      <div className="mb-5 flex w-full flex-wrap items-center gap-2 lg:hidden">
        <span className="text-sm text-muted-foreground">For</span>
        <TradeItemSelector
          items={items}
          selectedItemId={isInterestLibrary ? "all" : activeScopeId}
          onSelect={(id) =>
            id === "all" ? handleSelectInterestLibrary() : handleSelectItem(id)
          }
          totalMatches={0}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[288px_minmax(0,1fr)]">
        <TradeInterestScopeRail
          items={items}
          interests={interests}
          activeScopeId={activeScopeId}
          onSelectInterests={handleSelectInterestLibrary}
          onSelectItem={handleSelectItem}
        />

        {/* Body ------------------------------------------------------------- */}
        <div className="min-w-0">
          {interests.length === 0 ? (
            <EmptyState
              onCreate={
                isIndividual
                  ? handleNew
                  : handleNewTemplate
              }
            />
          ) : isIndividual && selectedItem ? (
            <div className="space-y-5">
              <Section
                count={visibleListingInterests.length}
                empty="No interests here yet."
              >
                <div className="sm:ml-6">
                  <p className="mb-1.5 truncate px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Trade interests for your
                  </p>
                  <div className="flex items-start justify-between gap-3">
                    <SelectedTradeItemCard
                      item={selectedItem}
                      interestCount={buckets.itemSpecific.length}
                      globalCount={buckets.global.length}
                    />
                    <div className="flex-shrink-0">
                      <AddExistingPicker
                        available={buckets.availableForItem}
                        onApply={handleApplyExisting}
                        onAddNew={handleNew}
                      />
                    </div>
                  </div>
                  <div className="my-4 h-px max-w-md bg-border/70" />
                  {visibleListingInterests.length > 0 ? (
                    <ul className="space-y-2">
                      {buckets.itemSpecific.map((interest) =>
                        renderRow(interest, {
                          statusChip: getListingInterestStatus(
                            interest,
                            items,
                          ),
                        }),
                      )}
                      {buckets.global.map((interest) =>
                        renderRow(interest, {
                          statusChip: getListingInterestStatus(
                            interest,
                            items,
                          ),
                          rowClassName:
                            "border-border/70 bg-card/45 hover:border-border",
                        }),
                      )}
                    </ul>
                  ) : (
                    <div className="rounded-lg border border-dashed border-border bg-card/40 px-4 py-5">
                      <p className="text-xs text-muted-foreground">
                        No interests here yet.
                      </p>
                    </div>
                  )}
                </div>
              </Section>
            </div>
          ) : (
            <div className="space-y-5">
              <Section
                count={interests.length}
                empty="No saved interests yet."
              >
                <div className="sm:ml-6">
                  <span className="mb-1.5 block h-4 px-1" aria-hidden="true" />
                  <div className="flex items-start justify-between gap-3">
                    <InterestLibraryCard
                      interestCount={interests.length}
                      globalCount={buckets.global.length}
                      listingSpecificCount={buckets.partial.length}
                    />
                    <Button
                      type="button"
                      variant="quiet_outline"
                      size="sm"
                      onClick={handleNewTemplate}
                      className="h-8 min-w-[9.75rem] flex-shrink-0"
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Add Interest
                    </Button>
                  </div>
                  <div className="my-4 h-px max-w-md bg-border/70" />
                  {interests.length > 0 ? (
                    <ul className="space-y-2">
                      {buckets.global.map((interest) =>
                        renderRow(interest, {
                          statusChip: getInterestApplicationStatus(
                            interest,
                            items,
                          ),
                          rowClassName:
                            "border-border/70 bg-card/45 hover:border-border",
                        }),
                      )}
                      {[...buckets.partial, ...buckets.templates].map((interest) =>
                        renderRow(interest, {
                          statusChip: getInterestApplicationStatus(
                            interest,
                            items,
                          ),
                        }),
                      )}
                    </ul>
                  ) : (
                    <div className="rounded-lg border border-dashed border-border bg-card/40 px-4 py-5">
                      <p className="text-xs text-muted-foreground">
                        No saved interests yet.
                      </p>
                    </div>
                  )}
                </div>
              </Section>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Desktop scope rail + selected item summary                                 */
/* -------------------------------------------------------------------------- */

function TradeInterestScopeRail({
  items,
  interests,
  activeScopeId,
  onSelectInterests,
  onSelectItem,
}: {
  items: TradeableItemSummary[]
  interests: SavedTradeInterest[]
  activeScopeId: string
  onSelectInterests: () => void
  onSelectItem: (id: string) => void
}) {
  const countFor = (itemId: string) =>
    interests.reduce(
      (count, interest) => {
        if (isGlobalInterest(interest, items)) return count
        return count + (interest.appliedTo.includes(itemId) ? 1 : 0)
      },
      0,
    )
  const globalCount = interests.filter((interest) =>
    isGlobalInterest(interest, items),
  ).length

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-20 space-y-2">
        <div>
          <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Trade Interests
          </p>
          <button
            type="button"
            onClick={onSelectInterests}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors",
              activeScopeId === INTERESTS_SCOPE_ID
                ? "border-primary/50 bg-primary/10"
                : "border-transparent bg-transparent hover:border-border hover:bg-card",
            )}
          >
            <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
              <Pencil className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">
                All
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {interests.length} total · {globalCount} global{" "}
                {globalCount === 1 ? "interest" : "interests"}
              </span>
            </span>
          </button>
        </div>

        <div className="pt-4">
          <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Listings
          </p>
          <div className="space-y-1.5">
            {items.map((item) => {
              const selected = activeScopeId === item.id
              const count = countFor(item.id)
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectItem(item.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors",
                    selected
                      ? "border-primary/50 bg-primary/10"
                      : "border-transparent bg-transparent hover:border-border hover:bg-card",
                  )}
                >
                  <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {item.title}
                    </span>
                    <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="truncate">
                        {count} {count === 1 ? "interest" : "interests"}
                      </span>
                      {globalCount > 0 ? (
                        <span
                          className="inline-flex flex-shrink-0 rounded-md bg-secondary px-1.5 py-0.5 text-[11px] text-muted-foreground"
                          title={`${globalCount} global ${
                            globalCount === 1 ? "interest" : "interests"
                          } also apply`}
                        >
                          + {globalCount}
                        </span>
                      ) : null}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </aside>
  )
}

function SelectedTradeItemCard({
  item,
  interestCount,
  globalCount,
}: {
  item: TradeableItemSummary
  interestCount: number
  globalCount: number
}) {
  const formattedPrice =
    typeof item.price === "number"
      ? `$${item.price.toLocaleString("en-US")}`
      : null

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center gap-3 px-1 py-1">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-border/50 bg-secondary">
          <Image
            src={item.image || "/placeholder.svg"}
            alt={item.title}
            width={64}
            height={64}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold leading-tight text-foreground">
            {item.title}
          </p>
          {item.subtitle || formattedPrice ? (
            <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
              {item.subtitle ? (
                <span className="truncate">{item.subtitle}</span>
              ) : null}
              {formattedPrice ? (
                <span className="flex-shrink-0 tabular-nums text-muted-foreground/70">
                  {item.subtitle ? "· " : ""}
                  {formattedPrice}
                </span>
              ) : null}
            </p>
          ) : null}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] text-muted-foreground">
              {interestCount} specific{" "}
              {interestCount === 1 ? "interest" : "interests"}
            </span>
            {globalCount > 0 ? (
              <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] text-muted-foreground">
                + {globalCount} global{" "}
                {globalCount === 1 ? "interest" : "interests"}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function InterestLibraryCard({
  interestCount,
  globalCount,
  listingSpecificCount,
}: {
  interestCount: number
  globalCount: number
  listingSpecificCount: number
}) {
  return (
    <div className="w-full max-w-md">
      <div className="flex items-center gap-3 px-1 py-1">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md border border-border/50 bg-secondary text-muted-foreground">
          <Pencil className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold leading-tight text-foreground">
            All
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            Manage all of your saved trade interests
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] text-muted-foreground">
              {interestCount} saved{" "}
              {interestCount === 1 ? "interest" : "interests"}
            </span>
            <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] text-muted-foreground">
              {globalCount} global
            </span>
            <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] text-muted-foreground">
              {listingSpecificCount} listing-specific
            </span>
          </div>
        </div>
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
  title?: string
  caption?: string
  count: number
  children?: React.ReactNode
  empty?: string
  actions?: React.ReactNode
  collapsed?: boolean
  onToggleCollapse?: () => void
}) {
  const hasHeaderText = Boolean(title || caption)
  const showHeader = hasHeaderText || Boolean(actions)

  return (
    <section>
      {showHeader ? (
        <div
          className={cn(
            "mb-2 flex items-center justify-between gap-3",
            hasHeaderText && "border-b border-border/70 pb-2",
          )}
        >
          {hasHeaderText ? (
            <button
              type="button"
              onClick={onToggleCollapse ?? undefined}
              aria-expanded={onToggleCollapse ? !collapsed : undefined}
              className={cn(
                "flex min-w-0 flex-1 items-start gap-2 rounded-md px-1 py-2 text-left transition-colors",
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
              <div className="min-w-0">
                {title ? (
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-sm font-semibold text-foreground">
                      {title}
                    </h2>
                    <span className="rounded-md bg-secondary px-1.5 py-0.5 text-xs tabular-nums text-muted-foreground">
                      {count}
                    </span>
                  </div>
                ) : null}
                {caption ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {caption}
                  </p>
                ) : null}
              </div>
            </button>
          ) : (
            <div className="min-w-0 flex-1" />
          )}

          {actions ? (
            <div
              className={cn(
                collapsed && "hidden",
                !hasHeaderText && "ml-auto",
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {actions}
            </div>
          ) : null}
        </div>
      ) : null}

      {collapsed ? null : children ? (
        children
      ) : count === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card/40 px-4 py-5">
          <p className="text-xs text-muted-foreground">
            {empty ?? "Nothing here yet."}
          </p>
        </div>
      ) : null}
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
          </div>
          <button
            type="button"
            onClick={() => { onAddNew(); setOpen(false) }}
            className="flex w-full items-center gap-2 border-b border-border px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
            New interest
          </button>

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
  matchCount,
  statusChip,
  rowClassName,
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
  matchCount?: number
  statusChip?: string
  rowClassName?: string
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
  const sharedReach =
    !statusChip && !isGlobal && appliedCount >= 2
      ? `Shared with ${appliedCount} listings`
      : ""
  const matchSummary =
    matchCount && matchCount > 0
      ? `${matchCount} ${matchCount === 1 ? "match" : "matches"}`
      : ""
  const rowDescription = [description, sharedReach, matchSummary]
    .filter(Boolean)
    .join(" · ")
  const isDetailOpen = expanded && expandedMode === "detail"
  const isEditOpen = expanded && expandedMode === "edit"

  // Name is edited inline in the row header while the editor is open.
  // The parent remounts this row when edit mode opens so canceled drafts reset.
  const [draftName, setDraftName] = React.useState(interest.name)

  const nameInput = isEditOpen ? (
    <input
      type="text"
      value={draftName}
      onChange={(e) => setDraftName(e.target.value)}
      placeholder="Give this interest a name…"
      autoFocus={false}
      className="w-full bg-transparent text-sm font-semibold text-foreground placeholder:font-normal placeholder:italic placeholder:text-muted-foreground/70 focus:outline-none border-b border-dashed border-border/60 focus:border-primary pb-px"
    />
  ) : undefined

  const actions = expanded ? (
    !confirming ? (
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
              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          )}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onRequestRemove}
          aria-label="Remove interest"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </button>
      </>
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
    )
  ) : null

  return (
    <TradeInterestRow
      name={interest.name}
      nameInput={nameInput}
      description={rowDescription}
      chips={chips}
      statusChip={statusChip}
      actions={actions}
      inlineEditor={isEditOpen ? (
        <SavedInterestEditor interest={interest} name={draftName} onSaved={onSaved} onCancel={onCancelEdit} />
      ) : null}
      dimmed={dimmed}
      expanded={isDetailOpen}
      onToggle={onToggleDetail}
      emptyChipsLabel="No criteria yet — click the pencil to add some."
      collapseOnBodyClick={isDetailOpen}
      className={cn(rowClassName, isEditOpen && "bg-secondary/30")}
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
