"use client"

import { useMemo, useState } from "react"
import { Telescope } from "lucide-react"

import {
  myTradeableItems,
  tradeInboundInterests,
  tradePerfectMatches,
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
import { TradeInterestCard } from "@/components/trade/trade-interest-card"
import { TradeItemSelector } from "@/components/trade/trade-item-selector"

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

export function TradeContent() {
  const [filterMyItem, setFilterMyItem] = useState<string>("all")
  const { gridDensity } = useGridDensity()

  const combined = useMemo<TradeInterestEntry[]>(() => {
    const list: TradeInterestEntry[] = [
      ...tradePerfectMatches.map((match) => ({
        kind: "perfect" as const,
        data: match,
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

  const filtered = useMemo(() => {
    if (filterMyItem === "all") return combined
    return combined.filter((entry) => entry.data.my_item_id === filterMyItem)
  }, [combined, filterMyItem])

  return (
    <div className="px-4 pb-6 pt-3 md:px-8">
      {/* Page title */}
      <div className="mb-4 flex items-center gap-2">
        <Telescope className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Market</h1>
      </div>

      {/* Section tabs */}
      <MarketTabs id="trade-tabs" className="mb-5" />

      {/* Controls row */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex flex-wrap items-center gap-2"
          data-onboarding-id="trade-item-selector"
        >
          <span className="text-sm text-muted-foreground">For</span>
          <TradeItemSelector
            items={myTradeableItems}
            selectedItemId={filterMyItem}
            onSelect={setFilterMyItem}
            totalMatches={combined.length}
          />
          <span className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "match" : "matches"}
          </span>
        </div>
        <GridDensitySelector id="trade-density" />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No trade activity for this item yet. Try selecting a different item
            or check back soon.
          </p>
        </div>
      ) : (
        <div className={gridDensityConfig[gridDensity].gridClass}>
          {filtered.map((entry) =>
            entry.kind === "perfect" ? (
              <TradeInterestCard
                key={entry.data.id}
                type="perfect"
                data={entry.data}
              />
            ) : (
              <TradeInterestCard
                key={entry.data.id}
                type="inbound"
                data={entry.data}
              />
            ),
          )}
        </div>
      )}

      <OnboardingTooltip
        steps={tradeOnboardingSteps}
        storageKey="subniche.onboarding.trade.v1"
      />
    </div>
  )
}
