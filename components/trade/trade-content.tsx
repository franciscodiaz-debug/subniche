"use client"

import { useMemo, useState } from "react"
import { Settings, Telescope } from "lucide-react"

import {
  myTradeableItems,
  tradeInboundInterests,
  tradePerfectMatches,
  type TradeableItemSummary,
} from "@/lib/market-data"
import { GridDensitySelector } from "@/components/shared/grid-density-selector"
import { MarketTabs } from "@/components/shared/market-tabs"
import {
  OnboardingTooltip,
  type OnboardingStep,
} from "@/components/shared/onboarding-tooltip"
import {
  gridDensityConfig,
  useGridDensity,
} from "@/hooks/use-grid-density"
import { ItemCard } from "@/components/item-card"
import { TradeItemSelector } from "@/components/trade/trade-item-selector"
import { TradeInterestsView } from "@/components/trade/trade-interests-view"

const tradeOnboardingSteps: OnboardingStep[] = [
  {
    id: "trade-intro",
    targetSelector: "[data-onboarding-id='trade-tabs']",
    title: "You're in Trade",
    description:
      "This tab shows perfect matches and inbound interest on items you've marked as tradeable. Jump to For Sale anytime.",
    position: "bottom",
  },
  {
    id: "trade-item-selector",
    targetSelector: "[data-onboarding-id='trade-item-selector']",
    title: "Focus on one item",
    description:
      "Pick a single tradeable item to see only its matches and interest.",
    position: "bottom",
  },
  {
    id: "trade-density",
    targetSelector: "[data-onboarding-id='trade-density']",
    title: "Adjust grid density",
    description: "Switch between compact, comfortable, and spacious layouts.",
    position: "bottom",
  },
]

/**
 * Each combined entry is a single `(my_item, their_item, score)` observation.
 * A "display entry" is what actually renders in the grid: possibly a merge of
 * several combined entries where `their_item.id` collides across my_items.
 */
type TradeInterestEntry =
  | {
      kind: "perfect"
      data: (typeof tradePerfectMatches)[number]
      sortKey: number
    }
  | {
      kind: "inbound"
      data: (typeof tradeInboundInterests)[number]
      sortKey: number
    }

type DisplayEntry = {
  /** Stable grid key — their_item id when merging, else the source entry id. */
  key: string
  /** How the card should render — "perfect" always wins when any contributing
   *  entry is a perfect match, because the primary-colored footer is the
   *  stronger call-to-action and reads as the more actionable state. */
  kind: "perfect" | "inbound"
  data: TradeInterestEntry["data"]
  sortKey: number
  /** The viewer's tradeable items this external listing matched, in
   *  insertion order (highest-scoring contributing entry first). When
   *  length > 1 the card collapses to "Matches X of your items" and lets
   *  the user expand the row to see each item with thumb/subtitle/price. */
  matchedItems: TradeableItemSummary[]
}

export function TradeContent() {
  const [filterMyItem, setFilterMyItem] = useState<string>("all")
  // "grid" is the default matches/interest grid; "interests" replaces the
  // whole Trade surface with the management view (reachable via the gear on
  // the filter row). No modal — it's plain section navigation inside Trade.
  const [view, setView] = useState<"grid" | "interests">("grid")
  const { gridDensity } = useGridDensity()

  const combined = useMemo<TradeInterestEntry[]>(() => {
    const list: TradeInterestEntry[] = [
      ...tradePerfectMatches.map((match) => ({
        kind: "perfect" as const,
        data: match,
        // Perfect matches get a +100 offset so they dominate inbound
        // when cross-sorted, preserving the "perfect first" intuition.
        sortKey: 100 + match.match_score,
      })),
      ...tradeInboundInterests.map((interest) => ({
        kind: "inbound" as const,
        data: interest,
        sortKey: interest.match_score,
      })),
    ]
    return list.sort((a, b) => b.sortKey - a.sortKey)
  }, [])

  /**
   * When the filter is "all" we dedupe by `their_item.id` so one external
   * listing never shows up twice. When the user zooms into a specific
   * my_item, we skip dedup — at that view, each card stands in for a
   * concrete relationship ("match for your Strat"), and merging would lose
   * that specificity.
   */
  const displayEntries = useMemo<DisplayEntry[]>(() => {
    /* Quick lookup so we don't scan myTradeableItems for every entry. */
    const itemsById = new Map(myTradeableItems.map((item) => [item.id, item]))

    if (filterMyItem !== "all") {
      return combined
        .filter((entry) => entry.data.my_item_id === filterMyItem)
        .map((entry) => {
          const matched = itemsById.get(entry.data.my_item_id)
          return {
            key: entry.data.id,
            kind: entry.kind,
            data: entry.data,
            sortKey: entry.sortKey,
            matchedItems: matched ? [matched] : [],
          }
        })
    }

    /* Internal accumulator — we keep `matchedMyItemIds` as a Set for O(1)
     * dedup, then materialize the ordered TradeableItemSummary list at the
     * end so the card consumer doesn't see Set semantics. */
    const byTheirId = new Map<
      string,
      DisplayEntry & { matchedMyItemIds: Set<string> }
    >()

    for (const entry of combined) {
      const key = entry.data.their_item.id
      const existing = byTheirId.get(key)
      if (!existing) {
        const matched = itemsById.get(entry.data.my_item_id)
        byTheirId.set(key, {
          key,
          kind: entry.kind,
          data: entry.data,
          sortKey: entry.sortKey,
          matchedItems: matched ? [matched] : [],
          matchedMyItemIds: new Set([entry.data.my_item_id]),
        })
        continue
      }

      if (!existing.matchedMyItemIds.has(entry.data.my_item_id)) {
        existing.matchedMyItemIds.add(entry.data.my_item_id)
        const matched = itemsById.get(entry.data.my_item_id)
        if (matched) existing.matchedItems.push(matched)
      }

      // Promote the group's representative entry when the incoming one is
      // more actionable. Rules, in order:
      //   1. A perfect beats any inbound (different visual chrome — primary
      //      vs. muted — and a different message).
      //   2. Within the same kind, higher score wins.
      const incomingBeats =
        (entry.kind === "perfect" && existing.kind !== "perfect") ||
        (entry.kind === existing.kind && entry.sortKey > existing.sortKey)

      if (incomingBeats) {
        existing.kind = entry.kind
        existing.data = entry.data
        existing.sortKey = entry.sortKey
      }
    }

    return Array.from(byTheirId.values()).sort(
      (a, b) => b.sortKey - a.sortKey,
    )
  }, [combined, filterMyItem])

  // When the user opens the Trade Interests management surface, the whole
  // Trade section is replaced — no overlay, no split screen. The back arrow
  // in the header returns them here with `filterMyItem` and grid density
  // preserved (state lives at this level).
  if (view === "interests") {
    return (
      <TradeInterestsView
        onBack={() => setView("grid")}
        items={myTradeableItems}
        selectedItemId={filterMyItem}
        onSelectItem={setFilterMyItem}
      />
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-3 md:px-8">
      <div className="mb-4 flex items-center gap-2">
        <Telescope className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Market</h1>
      </div>

      {/* The gear that previously sat in the tab strip has moved — it now
          lives next to the "For" dropdown below, where it reads as a filter-
          row affordance rather than a tab-level setting. */}
      <MarketTabs id="trade-tabs" className="mb-5" />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex flex-wrap items-center gap-2"
          data-onboarding-id="trade-item-selector"
        >
          <span className="text-sm text-muted-foreground">Matches for</span>
          <TradeItemSelector
            items={myTradeableItems}
            selectedItemId={filterMyItem}
            onSelect={setFilterMyItem}
            totalMatches={combined.length}
          />
          <button
            type="button"
            onClick={() => setView("interests")}
            aria-label="Manage trade interests"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
          </button>
          <span className="text-sm text-muted-foreground">
            {displayEntries.length}{" "}
            {displayEntries.length === 1 ? "match" : "matches"}
          </span>
        </div>
        <GridDensitySelector id="trade-density" />
      </div>

      {displayEntries.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No trade activity for this item yet. Try selecting a different item
            or check back soon.
          </p>
        </div>
      ) : (
        <div className={gridDensityConfig[gridDensity].gridClass}>
          {displayEntries.map((entry) => {
            const item = entry.data.their_item
            const href = `/${item.type === "listing" ? "listings" : "collection"}/${item.id}`
            return (
              <ItemCard
                key={entry.key}
                id={item.id}
                image={item.images[0] ?? ""}
                title={item.title}
                subtitle={item.subtitle}
                price={item.price}
                location={item.user?.location}
                forTrade
                href={href}
                compact={gridDensity === "compact"}
                collections={item.published_groups?.map((g) => ({
                  id: g.id,
                  name: g.name,
                  icon: g.icon,
                }))}
                match={{
                  score: entry.data.match_score,
                  matchedItems: entry.matchedItems,
                  fallbackItemTitle: entry.data.my_item.title,
                  direction: entry.kind === "perfect" ? "mutual" : "inbound",
                }}
              />
            )
          })}
        </div>
      )}

      <OnboardingTooltip
        steps={tradeOnboardingSteps}
        storageKey="subniche.onboarding.trade.v1"
      />
    </div>
  )
}
