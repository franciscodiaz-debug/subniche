"use client"

import * as React from "react"
import Image from "next/image"
import { Check, ChevronDown, Loader2, Minus, Plus, Sparkles, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { getBrandsFor, getModelsFor } from "@/lib/trade-brands"
import {
  getSpecsFor,
  SUBCATEGORIES_BY_CATEGORY,
  TRADE_CATEGORIES,
  type TradeCategory,
} from "@/lib/trade-specs"
import { parseSimpleToAdvanced } from "@/components/create-item/trade-interest-section"
import {
  useSavedTradeInterests,
  type SavedTradeInterest,
} from "@/lib/saved-trade-interests-context"
import { myTradeableItems } from "@/lib/market-data"

const SIMPLE_SOFT_LIMIT = 140

// Keys that are always available regardless of category
const UNIVERSAL_KEYS = new Set(["value", "notes"])

function splitChipValues(value: string): string[] {
  return value.split(", ").map((item) => item.trim()).filter(Boolean)
}

function uniqueValues(values: string[]): string[] {
  const seen = new Set<string>()
  return values.filter((value) => {
    const key = value.trim().toLowerCase()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

interface SavedInterestEditorProps {
  interest: SavedTradeInterest
  name: string
  onSaved: () => void
  onCancel: () => void
}

export function SavedInterestEditor({
  interest,
  name,
  onSaved,
  onCancel,
}: SavedInterestEditorProps) {
  const { update, applyToListing, unapplyFromListing } =
    useSavedTradeInterests()

  const [draft, setDraft] = React.useState<SavedTradeInterest>(interest)
  const [parsed, setParsed] = React.useState<boolean>(hasStructuredData(interest))
  const [parseState, setParseState] = React.useState<{
    status: "idle" | "loading" | "empty" | "error"
    message?: string
  }>({ status: "idle" })
  const [applyOpen, setApplyOpen] = React.useState(false)

  // Which optional criteria the user has opted in to
  const [activeCriteria, setActiveCriteria] = React.useState<Set<string>>(
    () => inferActiveCriteria(interest),
  )

  const patch = (p: Partial<SavedTradeInterest>) =>
    setDraft((prev) => ({ ...prev, ...p }))
  const setMode = (mode: "simple" | "advanced") => patch({ mode })

  const activate = (key: string) =>
    setActiveCriteria((prev) => new Set([...prev, key]))

  const removeCriterion = (key: string) => {
    setActiveCriteria((prev) => {
      const next = new Set(prev)
      next.delete(key)
      return next
    })
    // Clear the value so it doesn't ghost in the saved data
    if (key === "subcategory") { patch({ subcategory: "", specs: {} }); clearSpecCriteria() }
    else if (key === "brand") patch({ brand: "" })
    else if (key === "model") patch({ model: "" })
    else if (key === "value") patch({ valueMin: "", valueMax: "" })
    else if (key === "notes") patch({ notes: "" })
    else patch({ specs: { ...draft.specs, [key]: "" } })
  }

  // Clears spec keys AND subcategory from activeCriteria (used when category changes)
  const clearSpecCriteria = () =>
    setActiveCriteria((prev) => {
      const next = new Set<string>()
      for (const k of prev) if (UNIVERSAL_KEYS.has(k) || k === "brand" || k === "model") next.add(k)
      return next
    })

  // Clears only spec keys, preserving subcategory (used when subcategory selection changes)
  const clearOnlySpecKeys = () =>
    setActiveCriteria((prev) => {
      const next = new Set<string>()
      for (const k of prev) {
        if (UNIVERSAL_KEYS.has(k) || k === "brand" || k === "model" || k === "subcategory") next.add(k)
      }
      return next
    })

  const runParse = async () => {
    const trimmed = draft.simpleText.trim()
    if (!trimmed) return
    setParseState({ status: "loading" })
    try {
      const items = await parseSimpleToAdvanced(trimmed)
      if (items.length === 0) {
        setParseState({ status: "empty", message: "Couldn't structure that — try adding a category or brand, or switch to Advanced." })
        return
      }
      const first = items[0]
      patch({
        mode: "advanced",
        category: first.category, subcategory: first.subcategory,
        brand: first.brand, model: first.model, condition: first.condition,
        valueMin: first.valueMin, valueMax: first.valueMax,
        specs: first.specs, notes: first.notes,
      })
      setParsed(true)
      setParseState({ status: "idle" })
    } catch {
      setParseState({ status: "error", message: "Something went wrong. Try again?" })
    }
  }

  const handleSave = () => {
    update(draft.id, {
      name, mode: draft.mode, simpleText: draft.simpleText,
      category: draft.category, subcategory: draft.subcategory,
      brand: draft.brand, model: draft.model, condition: draft.condition,
      valueMin: draft.valueMin, valueMax: draft.valueMax,
      specs: draft.specs, notes: draft.notes,
    })
    onSaved()
  }

  const subcategories =
    draft.category && (draft.category as TradeCategory) in SUBCATEGORIES_BY_CATEGORY
      ? SUBCATEGORIES_BY_CATEGORY[draft.category as TradeCategory]
      : []
  const selectedSubs = draft.subcategory ? draft.subcategory.split(", ").filter(Boolean) : []
  // Intersection of spec fields across all selected subcategories
  const specFields: ReturnType<typeof getSpecsFor> = (() => {
    if (!draft.category || selectedSubs.length === 0) return []
    const first = getSpecsFor(draft.category, selectedSubs[0])
    if (selectedSubs.length === 1) return first
    return first.filter((f) =>
      selectedSubs.slice(1).every((sub) =>
        getSpecsFor(draft.category, sub).some((sf) => sf.key === f.key),
      ),
    )
  })()
  const categorySelected = !!draft.category

  // Build the ordered menu of all optional criteria
  const allCriteriaOptions = [
    ...(subcategories.length > 0 ? [{ key: "subcategory", label: "Subcategory", categoryRequired: true }] : []),
    { key: "brand",  label: "Brand",       categoryRequired: true  },
    { key: "model",  label: "Model",       categoryRequired: true  },
    ...specFields.map((f) => ({ key: f.key, label: f.label, categoryRequired: true })),
    { key: "value",  label: "Value range", categoryRequired: true },
    { key: "notes",  label: "Notes",       categoryRequired: true },
  ]

  const availableToAdd = allCriteriaOptions.filter(
    (c) => !activeCriteria.has(c.key) && (!c.categoryRequired || categorySelected),
  )
  const activeList = allCriteriaOptions.filter((c) => activeCriteria.has(c.key))
  const brandValues = splitChipValues(draft.brand)
  const modelValues = splitChipValues(draft.model)
  const brandSuggestions = uniqueValues(
    getBrandsFor(draft.category).map((brand) => brand.name),
  )
  const modelSuggestions = uniqueValues(
    brandValues.length > 0
      ? brandValues.flatMap((brand) => getModelsFor(draft.category, brand))
      : getBrandsFor(draft.category).flatMap((brand) => brand.models),
  )
  const clearCategory = () => {
    patch({ category: "", subcategory: "", brand: "", model: "", specs: {} })
    clearSpecCriteria()
  }
  const valueForCriterion = (key: string) => {
    if (key === "subcategory") return selectedSubs.join(", ")
    if (key === "brand") return brandValues.join(", ")
    if (key === "model") return modelValues.join(", ")
    if (key === "value") {
      const min = draft.valueMin.trim()
      const max = draft.valueMax.trim()
      if (min && max) return `$${min} - $${max}`
      if (min) return `From $${min}`
      if (max) return `Up to $${max}`
      return ""
    }
    if (key === "notes") return draft.notes.trim()
    return splitChipValues(draft.specs[key] ?? "").join(", ")
  }
  const selectedFilterChips = [
    ...(draft.category
      ? [
          {
            id: "category",
            label: "Category",
            value: draft.category,
            onRemove: clearCategory,
          },
        ]
      : []),
    ...activeList
      .map((criterion) => ({
        id: criterion.key,
        label: criterion.key === "value" ? "Budget" : criterion.label,
        value: valueForCriterion(criterion.key),
        onRemove: () => removeCriterion(criterion.key),
      }))
      .filter((chip) => chip.value.trim()),
  ]

  const simpleLen = draft.simpleText.length
  const simpleOver = simpleLen > SIMPLE_SOFT_LIMIT
  const parseLoading = parseState.status === "loading"
  const saveDisabled = parseLoading || (draft.mode === "simple" && !parsed)

  return (
    <div className="flex min-h-[24rem] flex-col gap-2.5 px-4 pb-4 pt-0">

      {/* Mode toggle -------------------------------------------------------- */}
      <div className="flex justify-start">
        <div
          role="tablist"
          aria-label="Trade interest mode"
          className="inline-flex rounded-full border border-border/60 bg-transparent p-0.5"
        >
          {(["simple", "advanced"] as const).map((m) => {
            const active = draft.mode === m
            return (
              <button key={m} role="tab" aria-selected={active} type="button" onClick={() => setMode(m)}
                className={cn(
                  "h-6 rounded-full px-2.5 text-[11px] font-medium capitalize transition-colors",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground/70 hover:text-foreground",
                )}>
                {m}
              </button>
            )
          })}
        </div>
      </div>

      <div className="pl-2">
        <p className="text-xs font-medium text-muted-foreground">
          {draft.mode === "advanced" ? "Trade Criteria" : "What are you open to trading for?"}
        </p>

        {/* ------------------------------------------------------------------- */}
        <div className="mt-2.5 min-h-[15rem]">
        {draft.mode === "simple" ? (

          <div className="space-y-2">
            <div className="relative">
              <textarea
                id={`saved-interest-simple-${draft.id}`}
                value={draft.simpleText}
                onChange={(e) => { patch({ simpleText: e.target.value }); if (parsed) setParsed(false) }}
                disabled={parseLoading}
                placeholder="We'll create trade filters based on your description."
                rows={4}
                className={cn(
                  "w-full resize-none rounded-lg border bg-background px-3 py-2.5 pb-11 pr-11 text-sm",
                  "text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1",
                  simpleOver
                    ? "border-destructive/60 focus:border-destructive focus:ring-destructive/30"
                    : "border-border focus:border-primary focus:ring-primary/30",
                  parseLoading && "opacity-60",
                )}
              />
              <Button type="button" size="icon" variant="quiet" onClick={runParse}
                disabled={parseLoading || !draft.simpleText.trim()}
                aria-label="Structure with AI"
                className={cn(
                  "absolute bottom-3 right-3 h-8 w-8 rounded-full border bg-secondary/80",
                  draft.simpleText.trim() && !parseLoading
                    ? "border-primary/70 text-primary hover:bg-primary/10"
                    : "border-transparent",
                )}>
                {parseLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              </Button>
              <p
                className={cn(
                  "pointer-events-none absolute bottom-3 left-3 right-14 truncate text-[11px] text-muted-foreground",
                  simpleOver && "text-destructive",
                )}
              >
                {simpleLen}/{SIMPLE_SOFT_LIMIT}
              </p>
            </div>
            {parseState.status === "empty" ? (
              <p className="rounded border border-dashed border-border px-2.5 py-1.5 text-xs text-muted-foreground">{parseState.message}</p>
            ) : null}
            {parseState.status === "error" ? (
              <div className="flex items-center gap-2 rounded border border-destructive/30 bg-destructive/5 px-2.5 py-1.5 text-xs text-destructive">
                <span className="flex-1">{parseState.message}</span>
                <button type="button" onClick={runParse} className="font-medium hover:underline">Retry</button>
              </div>
            ) : null}
          </div>

      ) : (

        /* Advanced — opt-in chip-based ------------------------------------- */
        <div className="space-y-3">

          <div className="min-h-[7.25rem] space-y-3">
            {/* Category — lightweight first step; choosing one unlocks narrower criteria. */}
            {!draft.category ? (
            <div className="flex flex-wrap gap-1.5">
              {TRADE_CATEGORIES.map((cat) => (
                <CategoryChoiceChip
                  key={cat}
                  label={cat}
                  selected={false}
                  onClick={() => {
                    patch({ category: cat, subcategory: "", brand: "", model: "", specs: {} })
                    clearSpecCriteria()
                  }}
                />
              ))}
            </div>
            ) : null}

            {selectedFilterChips.length > 0 ? (
              <div className="flex max-w-full gap-1.5 overflow-x-auto pb-0.5">
                {selectedFilterChips.map((chip) => (
                  <SelectedFilterChip
                    key={chip.id}
                    label={chip.label}
                    value={chip.value}
                    onRemove={chip.onRemove}
                  />
                ))}
              </div>
            ) : null}

            {/* Add-criteria chips — reserve two rows so the fields below don't jump. */}
            {draft.category ? (
              <div className="flex min-h-[4.25rem] content-start flex-wrap gap-2">
                {availableToAdd.map((c) => (
                  <AddCriteriaChip key={c.key} label={c.label} onAdd={() => activate(c.key)} />
                ))}
              </div>
            ) : null}
          </div>

          {/* Active criteria fields — populated first */}
          {activeList.length > 0 ? (
            <div className="space-y-3 border-t border-border/60 pt-3">
              {activeList.map((c) => (
                <div key={c.key} className="group/criterion space-y-1.5">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => removeCriterion(c.key)}
                      aria-label={`Remove ${c.label}`}
                      className="rounded-sm text-muted-foreground/70 transition-colors hover:text-foreground"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <p className="text-xs font-medium text-foreground">{c.label}</p>
                  </div>

                  {c.key === "subcategory" ? (
                    <div className="ml-5 flex flex-wrap gap-1.5">
                      {subcategories.filter((sub) => !selectedSubs.includes(sub)).map((sub) => (
                        <Chip key={sub} label={sub} selected={selectedSubs.includes(sub)}
                          onClick={() => {
                            const next = selectedSubs.includes(sub)
                              ? selectedSubs.filter((s) => s !== sub)
                              : [...selectedSubs, sub]
                            if (next.length === 0) {
                              patch({ subcategory: "", specs: {} })
                              clearOnlySpecKeys()
                            } else {
                              patch({ subcategory: next.join(", "), specs: {} })
                              clearOnlySpecKeys()
                            }
                          }}
                        />
                      ))}
                    </div>
                  ) : c.key === "brand" ? (
                    <div className="ml-5 max-w-[240px]">
                      <TagInput
                        values={draft.brand ? draft.brand.split(", ").filter(Boolean) : []}
                        onChange={(vals) => patch({ brand: vals.join(", ") })}
                        placeholder="Type a brand"
                        suggestions={brandSuggestions}
                        attributeLabel="Brand"
                      />
                    </div>
                  ) : c.key === "model" ? (
                    <div className="ml-5 max-w-[240px]">
                      <TagInput
                        values={draft.model ? draft.model.split(", ").filter(Boolean) : []}
                        onChange={(vals) => patch({ model: vals.join(", ") })}
                        placeholder="Type a model"
                        suggestions={modelSuggestions}
                        attributeLabel="Model"
                      />
                    </div>
                  ) : c.key === "value" ? (
                    <div className="ml-5 flex items-center gap-2">
                      <input type="text" inputMode="decimal" value={draft.valueMin}
                        onChange={(e) => patch({ valueMin: e.target.value })} placeholder="Min $"
                        className="w-24 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                      <span className="text-xs text-muted-foreground">–</span>
                      <input type="text" inputMode="decimal" value={draft.valueMax}
                        onChange={(e) => patch({ valueMax: e.target.value })} placeholder="Max $"
                        className="w-24 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                    </div>
                  ) : c.key === "notes" ? (
                    <textarea value={draft.notes} onChange={(e) => patch({ notes: e.target.value })}
                      placeholder="Preferred year range, finish, etc." rows={2}
                      className="ml-5 w-[240px] resize-none rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                  ) : (
                    // Spec field — multi-select chips
                    <div className="ml-5 flex flex-wrap gap-1.5">
                      {specFields.find((f) => f.key === c.key)?.options.map((opt) => {
                        const sel = (draft.specs[c.key] || "").split(", ").filter(Boolean)
                        return (
                          <Chip key={opt} label={opt} selected={sel.includes(opt)}
                            onClick={() => {
                              const next = sel.includes(opt) ? sel.filter((v) => v !== opt) : [...sel, opt]
                              patch({ specs: { ...draft.specs, [c.key]: next.join(", ") } })
                            }}
                          />
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : null}

        </div>
      )}
        </div>
      </div>

      {/* CTAs -------------------------------------------------------------- */}
      <div className="mt-auto border-t border-border pt-3">
        <div className="flex items-center justify-between gap-3">
          <ApplyToSection
            interest={draft} open={applyOpen}
            onToggle={() => setApplyOpen((v) => !v)}
            onApply={(id) => applyToListing(draft.id, id)}
            onUnapply={(id) => unapplyFromListing(draft.id, id)}
          />
          <div className="flex shrink-0 items-center justify-end gap-2">
            <Button type="button" size="icon" onClick={handleSave} disabled={saveDisabled} aria-label="Save" className="h-8 w-8">
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Primitives                                                                 */
/* -------------------------------------------------------------------------- */

function AddCriteriaChip({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border/80 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
    >
      <Plus className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}

function CategoryChoiceChip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        selected
          ? "border-border/70 bg-secondary/35 text-foreground"
          : "border-dashed border-border/80 bg-transparent text-muted-foreground hover:border-primary/60 hover:text-foreground",
      )}
    >
      {selected ? (
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {label}
    </button>
  )
}

function SelectedFilterChip({
  label,
  value,
  onRemove,
}: {
  label: string
  value: string
  onRemove: () => void
}) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/60 bg-primary/5 px-2.5 py-1 text-xs font-medium">
      {label ? <span className="text-muted-foreground">{label}:</span> : null}
      <span className="text-foreground">{value}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={label ? `Remove ${label} ${value}` : `Remove ${value}`}
        className="-mr-0.5 rounded-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  )
}

function Chip({ label, selected, onClick, dimmed }: { label: string; selected: boolean; onClick: () => void; dimmed?: boolean }) {
  return (
    <button type="button" onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all",
        selected
          ? "border border-foreground/70 bg-secondary/35 text-foreground hover:border-destructive/50 hover:bg-destructive/10 hover:text-foreground"
          : dimmed
          ? "border border-dashed border-border/70 bg-transparent text-muted-foreground/30 hover:text-muted-foreground"
          : "border border-dashed border-border/80 bg-transparent text-muted-foreground hover:border-primary/60 hover:text-foreground",
      )}>
      {selected ? (
        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {label}
    </button>
  )
}

function ChipRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  )
}

function TagInput({
  values,
  onChange,
  placeholder,
  suggestions = [],
  attributeLabel = "value",
}: {
  values: string[]
  onChange: (vals: string[]) => void
  placeholder?: string
  suggestions?: string[]
  attributeLabel?: string
}) {
  const [inputVal, setInputVal] = React.useState("")
  const [suggestionsOpen, setSuggestionsOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const trimmedInput = inputVal.trim()
  const normalizedValues = values.map((value) => value.toLowerCase())
  const availableSuggestions = suggestions.filter(
    (suggestion) => !normalizedValues.includes(suggestion.toLowerCase()),
  )
  const filteredSuggestions = availableSuggestions
    .filter((suggestion) =>
      suggestion.toLowerCase().includes(trimmedInput.toLowerCase()),
    )
    .slice(0, 6)
  const exactSuggestion = availableSuggestions.find(
    (suggestion) => suggestion.toLowerCase() === trimmedInput.toLowerCase(),
  )
  const showSuggestions = suggestionsOpen && (filteredSuggestions.length > 0 || Boolean(trimmedInput))
  const showCustomOption = Boolean(
    trimmedInput &&
      !exactSuggestion &&
      !normalizedValues.includes(trimmedInput.toLowerCase()),
  )

  const add = (raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) { setInputVal(""); return }
    const canonical =
      suggestions.find((suggestion) => suggestion.toLowerCase() === trimmed.toLowerCase()) ?? trimmed
    if (normalizedValues.includes(canonical.toLowerCase())) { setInputVal(""); return }
    onChange([...values, canonical])
    setInputVal("")
    setSuggestionsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      add(filteredSuggestions[0] ?? inputVal)
    }
    else if (e.key === "Escape") setSuggestionsOpen(false)
  }

  return (
    <div className="relative">
      <div
        onClick={() => inputRef.current?.focus()}
        className="flex min-h-8 cursor-text flex-wrap items-center gap-1 rounded-md border border-border bg-card px-2 py-1.5"
      >
        <input ref={inputRef} type="text" value={inputVal}
          onChange={(e) => {
            setInputVal(e.target.value)
            setSuggestionsOpen(true)
          }}
          onFocus={() => setSuggestionsOpen(true)}
          onKeyDown={handleKeyDown}
          onBlur={() => setSuggestionsOpen(false)}
          placeholder={values.length === 0 ? placeholder : `Add another ${attributeLabel.toLowerCase()}`}
          className="min-w-[90px] flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
        />
      </div>

      {showSuggestions ? (
        <div className="absolute left-0 top-full z-20 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-lg">
          {filteredSuggestions.length > 0 ? (
            <div className="py-1">
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault()
                    add(suggestion)
                  }}
                  className="flex w-full items-center px-2.5 py-1.5 text-left text-xs text-foreground transition-colors hover:bg-secondary"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : null}
          {showCustomOption ? (
            <button
              type="button"
              onMouseDown={(event) => {
                event.preventDefault()
                add(inputVal)
              }}
              className="flex w-full items-center gap-1.5 border-t border-border px-2.5 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Plus className="h-3 w-3" />
              Add &ldquo;{trimmedInput}&rdquo; to the {attributeLabel.toLowerCase()} database
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Apply-to section                                                           */
/* -------------------------------------------------------------------------- */

function ApplyToSection({
  interest, open, onToggle, onApply, onUnapply,
}: {
  interest: SavedTradeInterest
  open: boolean
  onToggle: () => void
  onApply: (listingId: string) => void
  onUnapply: (listingId: string) => void
}) {
  const { interests } = useSavedTradeInterests()
  const latest = interests.find((i) => i.id === interest.id)?.appliedTo ?? interest.appliedTo
  const count = latest.length
  const total = myTradeableItems.length

  return (
    <div>
      <button type="button" onClick={onToggle}
        className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
        Applied to {count} of {total} {total === 1 ? "listing" : "listings"}
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="mt-1.5 overflow-hidden rounded-md border border-border">
          {myTradeableItems.map((item, idx) => {
            const checked = latest.includes(item.id)
            return (
              <label key={item.id}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 px-2.5 py-1.5 transition-colors",
                  idx > 0 && "border-t border-border",
                  checked ? "bg-primary/5" : "bg-background hover:bg-secondary/40",
                )}>
                <input type="checkbox" checked={checked}
                  onChange={(e) => e.target.checked ? onApply(item.id) : onUnapply(item.id)}
                  className="h-3.5 w-3.5 flex-shrink-0 rounded border-border text-primary" />
                <div className="h-6 w-6 flex-shrink-0 overflow-hidden rounded bg-secondary">
                  <Image src={item.image || "/placeholder.svg"} alt={item.title} width={24} height={24} className="h-full w-full object-cover" />
                </div>
                <span className="min-w-0 flex-1 truncate text-xs text-foreground">{item.title}</span>
              </label>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function inferActiveCriteria(i: SavedTradeInterest): Set<string> {
  const active = new Set<string>()
  if (i.subcategory) active.add("subcategory")
  if (i.brand) active.add("brand")
  if (i.model) active.add("model")
  if (i.valueMin || i.valueMax) active.add("value")
  if (i.notes) active.add("notes")
  for (const [key, val] of Object.entries(i.specs ?? {})) {
    if (val) active.add(key)
  }
  return active
}

function hasStructuredData(i: SavedTradeInterest): boolean {
  return Boolean(
    i.category || i.subcategory || i.brand || i.model ||
    i.condition || i.valueMin || i.valueMax ||
    Object.keys(i.specs ?? {}).length > 0,
  )
}
