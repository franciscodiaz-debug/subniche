"use client"

/**
 * TradeInterestPickerPanel
 *
 * Used inside the publish-confirm flow (and the mobile wizard's step 6) to
 * let the user attach trade interests to the listing being published.
 *
 * Two view modes (state-driven, single component):
 *   - "picker": list of saved interests with apply/unapply checkboxes +
 *     "New Interest" button.
 *   - "editor": SavedInterestEditor mounted full-width when the user is
 *     creating a new interest or editing an existing one. On save the
 *     interest is auto-applied to the current listing draft.
 *
 * Source of truth: `appliedInterestIds: string[]` on TradeInterestData.
 * Saved interests live in the SavedTradeInterestsContext.
 */

import * as React from "react"
import { ArrowLeft, Check, Pencil, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  useSavedTradeInterests,
  type SavedTradeInterest,
} from "@/lib/saved-trade-interests-context"
import { SavedInterestEditor } from "@/components/trade/saved-interest-editor"
import { InterestEmptyState } from "@/components/trade-interests/shared/empty-state"

interface PickerPanelProps {
  /** Explicit (non-global) interests applied to the listing draft. */
  appliedIds: string[]
  onChange: (next: string[]) => void
  /** Global interests the user opted-out of for this listing draft. */
  excludedGlobalIds?: string[]
  onExcludedChange?: (next: string[]) => void
}

export function TradeInterestPickerPanel({
  appliedIds,
  onChange,
  excludedGlobalIds = [],
  onExcludedChange,
}: PickerPanelProps) {
  const { interests, create } = useSavedTradeInterests()
  const [editingId, setEditingId] = React.useState<string | null>(null)

  const toggleApply = (id: string) => {
    if (appliedIds.includes(id)) {
      onChange(appliedIds.filter((i) => i !== id))
    } else {
      onChange([...appliedIds, id])
    }
  }

  const toggleGlobalException = (id: string) => {
    if (!onExcludedChange) return
    if (excludedGlobalIds.includes(id)) {
      onExcludedChange(excludedGlobalIds.filter((i) => i !== id))
    } else {
      onExcludedChange([...excludedGlobalIds, id])
    }
  }

  const handleNew = () => {
    const created = create()
    setEditingId(created.id)
  }

  if (editingId) {
    const interest = interests.find((i) => i.id === editingId)
    if (!interest) {
      setEditingId(null)
      return null
    }
    const isNew = !interest.name && interest.simpleText === ""
    return (
      <div className="space-y-4">
        <header className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditingId(null)}
            aria-label="Back to picker"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="text-sm font-semibold text-foreground">
            {isNew ? "New Interest" : "Edit Interest"}
          </h2>
        </header>
        <SavedInterestEditor
          interest={interest}
          onSaved={() => {
            // Auto-apply to the current draft on save
            if (!appliedIds.includes(editingId)) {
              onChange([...appliedIds, editingId])
            }
            setEditingId(null)
          }}
          onCancel={() => setEditingId(null)}
        />
      </div>
    )
  }

  // Picker mode
  if (interests.length === 0) {
    return <InterestEmptyState variant="compact" onAddNew={handleNew} />
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Apply trade interests
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleNew}
          className="h-8 gap-1.5 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          New Interest
        </Button>
      </div>

      <div className="space-y-2">
        {interests.map((interest) => {
          if (interest.isGlobal) {
            const checked = !excludedGlobalIds.includes(interest.id)
            return (
              <PickerCard
                key={interest.id}
                interest={interest}
                checked={checked}
                isGlobal
                onToggle={() => toggleGlobalException(interest.id)}
                onEdit={() => setEditingId(interest.id)}
              />
            )
          }
          return (
            <PickerCard
              key={interest.id}
              interest={interest}
              checked={appliedIds.includes(interest.id)}
              isGlobal={false}
              onToggle={() => toggleApply(interest.id)}
              onEdit={() => setEditingId(interest.id)}
            />
          )
        })}
      </div>
    </div>
  )
}

function PickerCard({
  interest,
  checked,
  isGlobal,
  onToggle,
  onEdit,
}: {
  interest: SavedTradeInterest
  checked: boolean
  isGlobal: boolean
  onToggle: () => void
  onEdit: () => void
}) {
  const title = composeTitle(interest)
  const summary = composeSummary(interest)
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors",
        checked
          ? "border-primary/40 bg-primary/[0.04]"
          : "border-border hover:border-primary/30",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
          checked
            ? "border-primary bg-primary"
            : "border-border hover:border-primary/40",
        )}
        aria-pressed={checked}
        aria-label={checked ? "Unapply interest" : "Apply interest"}
      >
        {checked && <Check className="h-3 w-3 text-primary-foreground" />}
      </button>

      <button
        type="button"
        onClick={onToggle}
        className="min-w-0 flex-1 text-left"
      >
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-medium text-foreground">
            {title}
          </p>
          {isGlobal && (
            <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              Global
            </span>
          )}
        </div>
        {summary && (
          <p className="truncate text-xs text-muted-foreground">{summary}</p>
        )}
      </button>

      <button
        type="button"
        onClick={onEdit}
        aria-label="Edit interest"
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function composeTitle(interest: SavedTradeInterest): string {
  const brandModel = [interest.brand, interest.model].filter(Boolean).join(" ")
  if (brandModel) return brandModel
  const catSub = [interest.category, interest.subcategory]
    .filter(Boolean)
    .join(" / ")
  if (catSub) return catSub
  return interest.name || "Untitled interest"
}

function composeSummary(interest: SavedTradeInterest): string {
  if (interest.mode === "simple" && interest.simpleText.trim()) {
    return interest.simpleText.slice(0, 80)
  }
  const parts: string[] = []
  if (interest.condition && interest.condition !== "Any")
    parts.push(interest.condition)
  if (interest.valueMin && interest.valueMax) {
    parts.push(`$${interest.valueMin}-$${interest.valueMax}`)
  }
  return parts.join(" · ")
}
