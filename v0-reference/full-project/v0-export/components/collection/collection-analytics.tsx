"use client"

import { useMemo } from "react"
import { TrendingUp, TrendingDown, DollarSign, Sparkles, BarChart3, PieChart } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CollectionItem } from "@/lib/types"

interface CollectionAnalyticsProps {
  items: CollectionItem[]
  className?: string
}

export function CollectionAnalytics({ items, className }: CollectionAnalyticsProps) {
  const analytics = useMemo(() => {
    const ownedItems = items.filter((i) => i.is_owned)

    // Value totals
    const totalUserValue = ownedItems.reduce((sum, item) => sum + (item.user_estimated_value || 0), 0)
    const totalAiValue = ownedItems.reduce((sum, item) => sum + (item.ai_suggested_value || 0), 0)
    const totalPurchaseCost = ownedItems.reduce((sum, item) => sum + (item.purchase_price || 0), 0)

    // Items with both values for comparison
    const itemsWithBothValues = ownedItems.filter((i) => i.user_estimated_value && i.ai_suggested_value)

    // Value difference analysis
    const userVsAiDiff = totalUserValue - totalAiValue
    const userVsAiPercent = totalAiValue > 0 ? ((userVsAiDiff / totalAiValue) * 100).toFixed(1) : 0

    // Gain/loss calculations
    const estimatedGainUser = totalUserValue - totalPurchaseCost
    const estimatedGainAi = totalAiValue - totalPurchaseCost
    const gainPercentUser = totalPurchaseCost > 0 ? ((estimatedGainUser / totalPurchaseCost) * 100).toFixed(1) : 0
    const gainPercentAi = totalPurchaseCost > 0 ? ((estimatedGainAi / totalPurchaseCost) * 100).toFixed(1) : 0

    // Category breakdown
    const categoryBreakdown = ownedItems.reduce(
      (acc, item) => {
        const category = item.category || "Uncategorized"
        if (!acc[category]) {
          acc[category] = { count: 0, userValue: 0, aiValue: 0 }
        }
        acc[category].count++
        acc[category].userValue += item.user_estimated_value || 0
        acc[category].aiValue += item.ai_suggested_value || 0
        return acc
      },
      {} as Record<string, { count: number; userValue: number; aiValue: number }>,
    )

    // Condition breakdown
    const conditionBreakdown = ownedItems.reduce(
      (acc, item) => {
        const condition = item.condition || "Unknown"
        if (!acc[condition]) {
          acc[condition] = { count: 0, userValue: 0 }
        }
        acc[condition].count++
        acc[condition].userValue += item.user_estimated_value || 0
        return acc
      },
      {} as Record<string, { count: number; userValue: number }>,
    )

    // Top valued items
    const topItems = [...ownedItems]
      .sort((a, b) => (b.user_estimated_value || 0) - (a.user_estimated_value || 0))
      .slice(0, 5)

    // Items needing attention (AI value significantly different from user value)
    const itemsNeedingReview = itemsWithBothValues
      .filter((item) => {
        const diff = Math.abs((item.user_estimated_value || 0) - (item.ai_suggested_value || 0))
        const percent = (diff / (item.ai_suggested_value || 1)) * 100
        return percent > 20 // More than 20% difference
      })
      .slice(0, 5)

    return {
      totalItems: ownedItems.length,
      totalUserValue,
      totalAiValue,
      totalPurchaseCost,
      userVsAiDiff,
      userVsAiPercent,
      estimatedGainUser,
      estimatedGainAi,
      gainPercentUser,
      gainPercentAi,
      categoryBreakdown,
      conditionBreakdown,
      topItems,
      itemsNeedingReview,
    }
  }, [items])

  if (items.filter((i) => i.is_owned).length === 0) {
    return null
  }

  const categories = Object.entries(analytics.categoryBreakdown).sort((a, b) => b[1].userValue - a[1].userValue)

  return (
    <div className={cn("space-y-6", className)}>
      {/* Value Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Your Estimates */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Your Total Estimate</p>
              <p className="text-3xl font-bold text-foreground">${analytics.totalUserValue.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Cost</span>
              <span className="text-foreground">${analytics.totalPurchaseCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Est. Gain/Loss</span>
              <span
                className={cn(
                  "font-medium flex items-center gap-1",
                  analytics.estimatedGainUser >= 0 ? "text-chart-2" : "text-destructive",
                )}
              >
                {analytics.estimatedGainUser >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {analytics.estimatedGainUser >= 0 ? "+" : ""}${analytics.estimatedGainUser.toLocaleString()} (
                {analytics.gainPercentUser}%)
              </span>
            </div>
          </div>
        </div>

        {/* AI Estimates */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-chart-2/10 rounded-lg">
              <Sparkles className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">AI Total Estimate</p>
              <p className="text-3xl font-bold text-chart-2">${analytics.totalAiValue.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">vs Your Estimate</span>
              <span
                className={cn(
                  "font-medium",
                  analytics.userVsAiDiff > 0 ? "text-chart-2" : analytics.userVsAiDiff < 0 ? "text-chart-5" : "",
                )}
              >
                {analytics.userVsAiDiff > 0 ? "+" : ""}${analytics.userVsAiDiff.toLocaleString()} (
                {analytics.userVsAiPercent}%)
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Est. Gain/Loss</span>
              <span
                className={cn(
                  "font-medium flex items-center gap-1",
                  analytics.estimatedGainAi >= 0 ? "text-chart-2" : "text-destructive",
                )}
              >
                {analytics.estimatedGainAi >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {analytics.estimatedGainAi >= 0 ? "+" : ""}${analytics.estimatedGainAi.toLocaleString()} (
                {analytics.gainPercentAi}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {categories.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium text-foreground">Value by Category</h3>
          </div>

          <div className="space-y-3">
            {categories.map(([category, data]) => {
              const percent = analytics.totalUserValue > 0 ? (data.userValue / analytics.totalUserValue) * 100 : 0

              return (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground">
                      {category} <span className="text-muted-foreground">({data.count})</span>
                    </span>
                    <span className="text-foreground font-medium">${data.userValue.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Top Items */}
      {analytics.topItems.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium text-foreground">Most Valuable Items</h3>
          </div>

          <div className="space-y-3">
            {analytics.topItems.map((item, index) => (
              <div key={item.id} className="flex items-center gap-3">
                <span className="w-6 h-6 flex items-center justify-center bg-secondary rounded-full text-xs font-medium text-muted-foreground">
                  {index + 1}
                </span>
                <div className="w-10 h-10 bg-secondary rounded overflow-hidden flex-shrink-0">
                  {item.images?.[0] ? (
                    <img
                      src={item.images[0] || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.condition || "Unknown condition"}</p>
                </div>
                <p className="font-medium text-foreground">${(item.user_estimated_value || 0).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items Needing Review */}
      {analytics.itemsNeedingReview.length > 0 && (
        <div className="bg-card border border-chart-4/30 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-chart-4" />
            <h3 className="font-medium text-foreground">Consider Reviewing</h3>
            <span className="text-xs text-muted-foreground">(AI estimates differ by 20%+)</span>
          </div>

          <div className="space-y-3">
            {analytics.itemsNeedingReview.map((item) => {
              const diff = (item.user_estimated_value || 0) - (item.ai_suggested_value || 0)

              return (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{item.title}</p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-foreground">You: ${(item.user_estimated_value || 0).toLocaleString()}</span>
                    <span className="text-chart-2">AI: ${(item.ai_suggested_value || 0).toLocaleString()}</span>
                    <span className={cn("font-medium", diff > 0 ? "text-chart-2" : "text-chart-5")}>
                      {diff > 0 ? "+" : ""}${diff.toLocaleString()}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
