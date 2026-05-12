"use client"

import * as React from "react"
import Image from "next/image"
import { ChevronDown, Loader2, Plus, Sparkles, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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

  React.useEffect(() => {
    setDraft(interest)
    setParsed(hasStructuredData(interest))
    setActiveCriteria(inferActiveCriteria(interest))
    setApplyOpen(false)
  }, [interest])

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
  const allCriteriaOptions = React.useMemo(() => [
    ...(subcategories.length > 0 ? [{ key: "subcategory", label: "Subcategory", categoryRequired: true }] : []),
    { key: "brand",  label: "Brand",       categoryRequired: true  },
    { key: "model",  label: "Model",       categoryRequired: true  },
    ...specFields.map((f) => ({ key: f.key, label: f.label, categoryRequired: true })),
    { key: "value",  label: "Value range", categoryRequired: true },
    { key: "notes",  label: "Notes",       categoryRequired: true },
  ], [subcategories, specFields])

  const availableToAdd = allCriteriaOptions.filter(
    (c) => !activeCriteria.has(c.key) && (!c.categoryRequired || categorySelected),
  )
  const activeList = allCriteriaOptions.filter((c) => activeCriteria.has(c.key))

  const simpleLen = draft.simpleText.length
  const simpleOver = simpleLen > SIMPLE_SOFT_LIMIT
  const parseLoading = parseState.status === "loading"
  const saveDisabled = parseLoading || (draft.mode === "simple" && !parsed)

  return (
    <div className="border-t border-border bg-background/40 px-4 py-3 space-y-3">

      {/* Mode toggle -------------------------------------------------------- */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-muted-foreground">Set your trade criteria below</span>
        <div role="tablist" className="inline-flex rounded-md border border-border bg-background p-0.5">
          {(["simple", "advanced"] as const).map((m) => {
            const active = draft.mode === m
            return (
              <button key={m} role="tab" aria-selected={active} type="button" onClick={() => setMode(m)}
                className={cn(
                  "h-6 rounded px-2 text-[11px] font-medium capitalize transition-colors",
                  active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}>
                {m}
              </button>
            )
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {draft.mode === "simple" ? (

        <div className="space-y-1.5">
          <div className="relative">
            <textarea
              id={`saved-interest-simple-${draft.id}`}
              value={draft.simpleText}
              onChange={(e) => { patch({ simpleText: e.target.value }); if (parsed) setParsed(false) }}
              disabled={parseLoading}
              placeholder="e.g. Any flagship boutique reverb — Strymon BigSky, Eventide H9 Max, or similar."
              rows={3}
              className={cn(
                "w-full bg-background rounded-lg border px-3 py-2 pr-10 text-sm resize-none",
                "text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1",
                simpleOver
                  ? "border-destructive/60 focus:border-destructive focus:ring-destructive/30"
                  : "border-border focus:border-primary focus:ring-primary/30",
                parseLoading && "opacity-60",
              )}
            />
            <Button type="button" size="icon" variant="quiet" onClick={runParse}
              disabled={parseLoading || !draft.simpleText.trim()}
              aria-label="Structure with AI" className="absolute right-1.5 top-1.5 h-7 w-7">
              {parseLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            </Button>
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span className={cn(simpleOver && "text-destructive")}>{simpleLen}/{SIMPLE_SOFT_LIMIT}</span>
            <span>Tap sparkles to structure.</span>
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

          {/* Category — always shown first; collapse to selected chip once chosen */}
          <ChipRow label="Category">
            {TRADE_CATEGORIES.filter((cat) => !draft.category || draft.category === cat).map((cat) => (
              <Chip key={cat} label={cat} selected={draft.category === cat}
                onClick={() => {
                  patch(draft.category === cat
                    ? { category: "", subcategory: "", brand: "", model: "", specs: {} }
                    : { category: cat, subcategory: "", brand: "", model: "", specs: {} }
                  )
                  clearSpecCriteria()
                }}
              />
            ))}
          </ChipRow>

          {/* Active criteria fields — populated first */}
          {activeList.map((c) => (
            <div key={c.key} className="group/criterion space-y-1">
              <div className="flex items-center gap-1">
                <p className="flex-1 text-[11px] font-medium text-muted-foreground">{c.label}</p>
                <button type="button" onClick={() => removeCriterion(c.key)}
                  aria-label={`Remove ${c.label}`}
                  className="rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-secondary hover:text-foreground group-hover/criterion:opacity-100">
                  <X className="h-3 w-3" />
                </button>
              </div>

              {c.key === "subcategory" ? (
                <div className="flex flex-wrap gap-1">
                  {subcategories.map((sub) => (
                    <Chip key={sub} label={sub} selected={selectedSubs.includes(sub)}
                      onClick={() => {
                        const next = selectedSubs.includes(sub)
                          ? selectedSubs.filter((s) => s !== sub)
                          : [...selectedSubs, sub]
                        if (next.length === 0) {
                          removeCriterion("subcategory")
                        } else {
                          patch({ subcategory: next.join(", "), specs: {} })
                          clearOnlySpecKeys()
                        }
                      }}
                    />
                  ))}
                </div>
              ) : c.key === "brand" ? (
                <div className="max-w-[240px]">
                  <TagInput
                    values={draft.brand ? draft.brand.split(", ").filter(Boolean) : []}
                    onChange={(vals) => patch({ brand: vals.join(", ") })}
                    placeholder="e.g. Gibson, Fender — Enter to add"
                  />
                </div>
              ) : c.key === "model" ? (
                <div className="max-w-[240px]">
                  <TagInput
                    values={draft.model ? draft.model.split(", ").filter(Boolean) : []}
                    onChange={(vals) => patch({ model: vals.join(", ") })}
                    placeholder="e.g. Les Paul, Strat…"
                  />
                </div>
              ) : c.key === "value" ? (
                <div className="flex items-center gap-1.5">
                  <input type="text" inputMode="decimal" value={draft.valueMin}
                    onChange={(e) => patch({ valueMin: e.target.value })} placeholder="Min $"
                    className="w-20 rounded-md border border-border bg-card px-2.5 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                  <span className="text-xs text-muted-foreground">–</span>
                  <input type="text" inputMode="decimal" value={draft.valueMax}
                    onChange={(e) => patch({ valueMax: e.target.value })} placeholder="Max $"
                    className="w-20 rounded-md border border-border bg-card px-2.5 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                </div>
              ) : c.key === "notes" ? (
                <textarea value={draft.notes} onChange={(e) => patch({ notes: e.target.value })}
                  placeholder="Preferred year range, finish, etc." rows={2}
                  className="w-[200px] resize-none rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
              ) : (
                // Spec field — multi-select chips
                <div className="flex flex-wrap gap-1">
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

          {/* Add-criteria chips — always at the bottom */}
          {availableToAdd.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {availableToAdd.map((c) => (
                <AddCriteriaChip key={c.key} label={c.label} onAdd={() => activate(c.key)} />
              ))}
            </div>
          ) : null}

        </div>
      )}

      {/* Apply to ---------------------------------------------------------- */}
      <ApplyToSection
        interest={draft} open={applyOpen}
        onToggle={() => setApplyOpen((v) => !v)}
        onApply={(id) => applyToListing(draft.id, id)}
        onUnapply={(id) => unapplyFromListing(draft.id, id)}
      />

      {/* CTAs -------------------------------------------------------------- */}
      <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="h-8 text-xs">Cancel</Button>
        <Button type="button" size="sm" onClick={handleSave} disabled={saveDisabled} className="h-8 text-xs">Save</Button>
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
      className="inline-flex items-center gap-1 rounded-md border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/70 hover:text-foreground"
    >
      <Plus className="h-3 w-3" />
      {label}
    </button>
  )
}

function Chip({ label, selected, onClick, dimmed }: { label: string; selected: boolean; onClick: () => void; dimmed?: boolean }) {
  return (
    <button type="button" onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium transition-all",
        selected
          ? "border border-primary bg-primary/10 text-foreground font-semibold"
          : dimmed
          ? "border border-border bg-card text-muted-foreground/30 hover:text-muted-foreground"
          : "border border-border bg-card text-foreground hover:bg-secondary",
      )}>
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
}: {
  values: string[]
  onChange: (vals: string[]) => void
  placeholder?: string
}) {
  const [inputVal, setInputVal] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  const add = (raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed || values.includes(trimmed)) { setInputVal(""); return }
    onChange([...values, trimmed])
    setInputVal("")
  }

  const remove = (val: string) => onChange(values.filter((v) => v !== val))

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(inputVal) }
    else if (e.key === "Backspace" && !inputVal && values.length > 0) remove(values[values.length - 1])
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="flex min-h-[30px] cursor-text flex-wrap items-center gap-1 rounded-md border border-border bg-card px-2 py-1"
    >
      {values.map((v) => (
        <span key={v}
          className="inline-flex items-center gap-1 rounded border border-primary bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-foreground">
          {v}
          <button type="button" onClick={(e) => { e.stopPropagation(); remove(v) }}
            className="leading-none text-muted-foreground hover:text-foreground">×</button>
        </span>
      ))}
      <input ref={inputRef} type="text" value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (inputVal.trim()) add(inputVal) }}
        placeholder={values.length === 0 ? placeholder : undefined}
        className="min-w-[80px] flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
      />
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
        className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground">
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
