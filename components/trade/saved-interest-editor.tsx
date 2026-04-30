"use client"

/**
 * <SavedInterestEditor />
 *
 * The inline form surface for a single saved Trade Interest, mounted inside
 * <TradeInterestsView />. It mirrors the Create Listing → Trade Interest
 * section (Simple ↔ Advanced mode toggle, sparkles-to-structure parse) but
 * targets a SavedTradeInterest (a single reusable template) rather than a
 * TradeInterestData payload bound to one listing.
 *
 * Authoring model:
 *  - Local buffer state. Edits never hit the shared store until the user taps
 *    "Save interest". That way, previewing a template that's already applied
 *    to N listings can't corrupt those listings' matching.
 *  - Apply-to checkboxes ARE live — toggling a checkbox immediately mutates
 *    the context (`applyToListing` / `unapplyFromListing`). Interpretation:
 *    "where this interest should live" is a relationship, not a draft field.
 *  - Simple + Advanced values are both held in state. Toggling the mode
 *    never wipes the other side's data, matching the listing editor.
 *  - Sparkles in Simple mode calls the same `parseSimpleToAdvanced` route
 *    used elsewhere, then maps its first structured item back onto the flat
 *    SavedTradeInterest shape (a saved interest holds ONE concept; users
 *    create multiple saved interests for multiple concepts).
 */

import * as React from "react"
import Image from "next/image"
import { Loader2, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getSpecsFor,
  SUBCATEGORIES_BY_CATEGORY,
  TRADE_CATEGORIES,
  TRADE_CONDITIONS,
  type TradeCategory,
} from "@/lib/trade-specs"
import { parseSimpleToAdvanced } from "@/components/create-item/trade-interest-section"
import {
  useSavedTradeInterests,
  type SavedTradeInterest,
} from "@/lib/saved-trade-interests-context"
import { myTradeableItems } from "@/lib/market-data"

// 140-char soft cap for the simple description, matching the listing editor.
const SIMPLE_SOFT_LIMIT = 140

interface SavedInterestEditorProps {
  interest: SavedTradeInterest
  /** Called after a successful Save (context already updated). Typically the
   *  parent collapses the row. */
  onSaved: () => void
  /** Called when the user bails — discard buffer, collapse the row. Also used
   *  by the parent to close the editor from external affordances. */
  onCancel: () => void
}

export function SavedInterestEditor({
  interest,
  onSaved,
  onCancel,
}: SavedInterestEditorProps) {
  const { update, applyToListing, unapplyFromListing } =
    useSavedTradeInterests()

  // Buffer — initialized from props, re-synced on prop-identity change so
  // switching between rows in the parent list doesn't leak edits.
  const [draft, setDraft] = React.useState<SavedTradeInterest>(interest)
  React.useEffect(() => {
    setDraft(interest)
    // When the editor binds to a different interest, treat any pre-existing
    // structured data as already-indexed so the user isn't forced to re-parse
    // a template they (or a teammate) authored before. Empty shells start
    // unindexed — Save will be gated until sparkles runs.
    setParsed(hasStructuredData(interest))
  }, [interest])

  const patch = (p: Partial<SavedTradeInterest>) =>
    setDraft((prev) => ({ ...prev, ...p }))

  const setMode = (mode: "simple" | "advanced") => patch({ mode })

  /* `parsed` reflects whether the current draft has been transformed into
   * indexed/searchable structured fields. It's the single gate behind the
   * Save button in Simple mode — per the design contract, free-text alone
   * isn't enough; the sparkles step is mandatory so the matching system has
   * something to query against. Editing the simple description after a
   * successful parse invalidates this flag, forcing the user to re-parse so
   * the index reflects what they actually typed. */
  const [parsed, setParsed] = React.useState<boolean>(
    hasStructuredData(interest),
  )

  const [parseState, setParseState] = React.useState<{
    status: "idle" | "loading" | "empty" | "error"
    message?: string
  }>({ status: "idle" })

  /* Sparkles handler. On success we merge the first parsed item into the
   * draft's structured fields, flip to Advanced, and preserve the original
   * simpleText so the user can bounce back. Errors surface a retry inline. */
  const runParse = async () => {
    const trimmed = draft.simpleText.trim()
    if (!trimmed) return
    setParseState({ status: "loading" })
    try {
      const items = await parseSimpleToAdvanced(trimmed)
      if (items.length === 0) {
        setParseState({
          status: "empty",
          message:
            "Couldn't turn that into a structured interest — try adding a category or brand, or switch to Advanced manually.",
        })
        return
      }
      const first = items[0]
      patch({
        mode: "advanced",
        category: first.category,
        subcategory: first.subcategory,
        brand: first.brand,
        model: first.model,
        condition: first.condition,
        valueMin: first.valueMin,
        valueMax: first.valueMax,
        specs: first.specs,
        notes: first.notes,
      })
      // Description has now been indexed into structured fields — unlock Save.
      setParsed(true)
      setParseState({ status: "idle" })
    } catch (err) {
      console.error("[v0] SavedInterestEditor parse error:", err)
      setParseState({
        status: "error",
        message: "Something went wrong while parsing. Try again?",
      })
    }
  }

  const handleSave = () => {
    // Commit the whole draft. Name is required in principle but we don't
    // block saving — an "Untitled interest" shows in the list with muted
    // label, same as the previous manager's convention.
    update(draft.id, {
      name: draft.name,
      mode: draft.mode,
      simpleText: draft.simpleText,
      category: draft.category,
      subcategory: draft.subcategory,
      brand: draft.brand,
      model: draft.model,
      condition: draft.condition,
      valueMin: draft.valueMin,
      valueMax: draft.valueMax,
      specs: draft.specs,
      notes: draft.notes,
    })
    onSaved()
  }

  const subcategories =
    draft.category && (draft.category as TradeCategory) in SUBCATEGORIES_BY_CATEGORY
      ? SUBCATEGORIES_BY_CATEGORY[draft.category as TradeCategory]
      : []
  const specFields = getSpecsFor(draft.category, draft.subcategory)

  const simpleLen = draft.simpleText.length
  const simpleOver = simpleLen > SIMPLE_SOFT_LIMIT
  const parseLoading = parseState.status === "loading"
  const parseDisabled = parseLoading || draft.simpleText.trim().length === 0
  /* Save gate. Simple-mode drafts must pass through sparkles so the matching
   * system has indexed fields to query — saving raw free text would leak
   * un-searchable interests into the store. Advanced mode is always saveable
   * since the user is editing the structured fields directly. */
  const saveDisabled =
    parseLoading || (draft.mode === "simple" && !parsed)

  return (
    <div className="border-t border-border bg-background/40 px-5 py-5 space-y-5">
      {/* Name ------------------------------------------------------------ */}
      <Field label="Name" required>
        <Input
          value={draft.name}
          onChange={(e) => patch({ name: e.target.value })}
          placeholder="e.g. Acoustic upgrade"
          autoFocus={!draft.name}
        />
      </Field>

      {/* Mode toggle ----------------------------------------------------- */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-foreground">
          How do you want to describe this?
        </span>
        <div
          role="tablist"
          aria-label="Interest mode"
          className="inline-flex rounded-lg border border-border bg-background p-0.5"
        >
          {(["simple", "advanced"] as const).map((m) => {
            const active = draft.mode === m
            return (
              <button
                key={m}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "h-7 rounded-md px-2.5 text-xs font-medium capitalize transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m}
              </button>
            )
          })}
        </div>
      </div>

      {/* Mode body ------------------------------------------------------- */}
      {draft.mode === "simple" ? (
        <div className="space-y-2">
          <label
            htmlFor={`saved-interest-simple-${draft.id}`}
            className="text-xs text-muted-foreground block"
          >
            What would you accept in trade?
          </label>
          <div className="relative">
            <textarea
              id={`saved-interest-simple-${draft.id}`}
              value={draft.simpleText}
              onChange={(e) => {
                /* Any edit to the description means the previously-parsed
                 * structured fields no longer reflect the user's intent —
                 * re-gate Save until they tap sparkles again. */
                patch({ simpleText: e.target.value })
                if (parsed) setParsed(false)
              }}
              disabled={parseLoading}
              placeholder="e.g. Any flagship boutique reverb — Strymon BigSky, Eventide H9 Max, or similar."
              rows={3}
              className={cn(
                "w-full bg-background rounded-lg border px-3 py-2 pr-11 text-sm resize-none transition-all",
                "text-foreground placeholder:text-muted-foreground/50",
                "focus:outline-none focus:ring-1",
                simpleOver
                  ? "border-destructive/60 focus:border-destructive focus:ring-destructive/30"
                  : "border-border focus:border-primary focus:ring-primary/30",
                parseLoading && "opacity-60",
              )}
            />
            <div className="absolute right-1.5 top-1.5">
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={runParse}
                disabled={parseDisabled}
                aria-label="Structure with AI"
                className="h-7 w-7"
              >
                {parseLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span
              className={cn(
                "text-muted-foreground",
                simpleOver && "text-destructive",
              )}
            >
              {simpleLen}/{SIMPLE_SOFT_LIMIT}
            </span>
            <span className="text-muted-foreground">
              Tap the sparkles to turn your text into structured fields.
            </span>
          </div>

          {parseState.status === "empty" && parseState.message ? (
            <p className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
              {parseState.message}
            </p>
          ) : null}
          {parseState.status === "error" ? (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              <span className="flex-1">
                {parseState.message ?? "Something went wrong."}
              </span>
              <button
                type="button"
                onClick={runParse}
                className="font-medium underline-offset-2 hover:underline"
              >
                Retry
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Category" required>
              <Select
                value={draft.category || undefined}
                onValueChange={(v) =>
                  patch({
                    category: v,
                    subcategory: "",
                    brand: "",
                    model: "",
                    specs: {},
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pick a category" />
                </SelectTrigger>
                <SelectContent>
                  {TRADE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Subcategory">
              <Select
                value={draft.subcategory || undefined}
                onValueChange={(v) => patch({ subcategory: v, specs: {} })}
                disabled={subcategories.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      draft.category
                        ? subcategories.length
                          ? "Any subcategory"
                          : "No subcategories"
                        : "Pick a category first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map((sub) => (
                    <SelectItem key={sub} value={sub}>
                      {sub}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Brand">
              <Input
                value={draft.brand}
                onChange={(e) => patch({ brand: e.target.value })}
                placeholder="Any brand"
              />
            </Field>
            <Field label="Model">
              <Input
                value={draft.model}
                onChange={(e) => patch({ model: e.target.value })}
                placeholder="Any model"
              />
            </Field>
          </div>

          {specFields.length > 0 ? (
            <div className="space-y-2 rounded-lg border border-border bg-background/70 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Specs
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {specFields.map((field) => (
                  <Field key={field.key} label={field.label}>
                    <Select
                      value={draft.specs[field.key] ?? "Any"}
                      onValueChange={(v) =>
                        patch({
                          specs: {
                            ...draft.specs,
                            [field.key]: v === "Any" ? "" : v,
                          },
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Any">Any</SelectItem>
                        {field.options.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Condition">
              <Select
                value={draft.condition || "Any"}
                onValueChange={(v) =>
                  patch({ condition: v === "Any" ? "" : v })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Any">Any</SelectItem>
                  {TRADE_CONDITIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Value range ($)">
              <div className="flex items-center gap-2">
                <Input
                  inputMode="decimal"
                  value={draft.valueMin}
                  onChange={(e) => patch({ valueMin: e.target.value })}
                  placeholder="Min"
                />
                <span className="text-sm text-muted-foreground">–</span>
                <Input
                  inputMode="decimal"
                  value={draft.valueMax}
                  onChange={(e) => patch({ valueMax: e.target.value })}
                  placeholder="Max"
                />
              </div>
            </Field>
          </div>

          <Field label="Notes">
            <textarea
              value={draft.notes}
              onChange={(e) => patch({ notes: e.target.value })}
              placeholder="Anything else? Preferred year range, finish, etc."
              rows={2}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </Field>
        </div>
      )}

      {/* Apply-to checklist --------------------------------------------- */}
      <ApplyToList
        interest={draft}
        onApply={(id) => applyToListing(draft.id, id)}
        onUnapply={(id) => unapplyFromListing(draft.id, id)}
      />

      {/* CTAs ----------------------------------------------------------- */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-9"
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={saveDisabled}
          className="h-9"
        >
          Save interest
        </Button>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Sub-components                                                             */
/* -------------------------------------------------------------------------- */

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-foreground">
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </label>
      {children}
    </div>
  )
}

/**
 * `Apply to` — list of the viewer's tradeable items as compact checkbox rows.
 * Reads the current applied-to state from `draft.appliedTo` (not from the
 * broader context) because the editor re-syncs `draft` from props on row
 * changes, keeping the UI consistent even when another surface mutates the
 * store out of band. Toggling still calls into the context so every applied
 * relationship is persisted immediately — there's no "unsaved relationship"
 * state to reason about.
 */
function ApplyToList({
  interest,
  onApply,
  onUnapply,
}: {
  interest: SavedTradeInterest
  onApply: (listingId: string) => void
  onUnapply: (listingId: string) => void
}) {
  // We read directly from the context's source of truth for the checkbox
  // state (via the interest prop which the manager keeps fresh). Using the
  // local draft would work too, but subtle — stick with the store value.
  const { interests } = useSavedTradeInterests()
  const latest =
    interests.find((i) => i.id === interest.id)?.appliedTo ?? interest.appliedTo

  const toggle = (id: string, checked: boolean) => {
    if (checked) onApply(id)
    else onUnapply(id)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-foreground">Apply to</p>
        <p className="text-[11px] text-muted-foreground">
          {latest.length}{" "}
          {latest.length === 1 ? "listing" : "listings"} selected
        </p>
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        {myTradeableItems.map((item, idx) => {
          const checked = latest.includes(item.id)
          return (
            <label
              key={item.id}
              className={cn(
                "flex cursor-pointer items-center gap-3 px-3 py-2 transition-colors",
                idx > 0 && "border-t border-border",
                checked ? "bg-primary/5" : "bg-background hover:bg-secondary/40",
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => toggle(item.id, e.target.checked)}
                className="h-4 w-4 flex-shrink-0 rounded border-border text-primary focus:ring-1 focus:ring-primary/40"
              />
              <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded bg-secondary">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                {item.title}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Heuristic — does this saved interest already carry meaningful structured
 * data? Used to decide whether the editor should boot up with `parsed = true`
 * (skipping the sparkles gate) for an existing template, or `false` for a
 * fresh shell. Name and notes alone don't count — they're not searchable
 * dimensions on their own.
 */
function hasStructuredData(i: SavedTradeInterest): boolean {
  return Boolean(
    i.category ||
      i.subcategory ||
      i.brand ||
      i.model ||
      i.condition ||
      i.valueMin ||
      i.valueMax ||
      Object.keys(i.specs ?? {}).length > 0,
  )
}
