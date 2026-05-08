"use client"

/**
 * Trade Interest section for the Create Listing form.
 *
 * Lets the lister describe what they'd accept in trade for the item they're
 * publishing. Two authoring modes (kept independent so toggling never loses
 * work):
 *   - Simple: a single 140-char free-text field with a sparkles "Structure
 *     with AI" button that parses the text into structured cards.
 *   - Advanced: a repeatable list of interest cards, each with progressive
 *     fields (category → subcategory → specs → brand → model → condition →
 *     value range → notes).
 *
 * The section is self-contained: parent forms only hand it a `TradeInterestData`
 * value + change handler. Exports `TradeInterestItem`, `TradeInterestData`,
 * `emptyTradeInterest`, `summarizeInterest`, and `parseSimpleToAdvanced` for
 * downstream consumers (listing detail, matching pipeline).
 */

import * as React from "react"
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Info,
  Loader2,
  Plus,
  Repeat2,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react"

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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  getSpecsFor,
  SPECS_BY_CATEGORY_SUBCATEGORY,
  SUBCATEGORIES_BY_CATEGORY,
  TRADE_CATEGORIES,
  TRADE_CONDITIONS,
  type SpecField,
  type TradeCategory,
} from "@/lib/trade-specs"
import { getBrandsFor, getModelsFor } from "@/lib/trade-brands"
import {
  useSavedTradeInterests,
  type SavedTradeInterest,
} from "@/lib/saved-trade-interests-context"
import { InterestEmptyState } from "@/components/trade-interests/shared/empty-state"
import { LoadSavedPicker } from "@/components/trade-interests/shared/load-saved-picker"
import { Coachmarks, type CoachmarkStep } from "@/components/trade-interests/shared/coachmarks"

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface TradeInterestItem {
  id: string
  category: string
  subcategory: string
  brand: string
  model: string
  unverifiedBrand: boolean
  unverifiedModel: boolean
  condition: string
  /** String so users can clear it; coerced to a number on form submit. */
  valueMin: string
  valueMax: string
  notes: string
  /** Keyed by `SpecField.key`. "Any" means cleared-but-kept-mounted. */
  specs: Record<string, string>
}

export interface TradeInterestData {
  mode: "simple" | "advanced"
  simpleText: string
  advanced: TradeInterestItem[]
  /**
   * Saved interest IDs currently applied to this listing. Kept in form state
   * so the editor is the source of truth during authoring; on publish the
   * parent is expected to mirror these into the saved-interests context's
   * `appliedTo` list for the listing's final ID.
   *
   * Optional for backwards compatibility — consumers that haven't migrated
   * yet still work, just without the saved-interest surface.
   */
  appliedInterestIds?: string[]
}

export const emptyTradeInterest: TradeInterestData = {
  mode: "simple",
  simpleText: "",
  advanced: [],
  appliedInterestIds: [],
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const SIMPLE_SOFT_LIMIT = 140
const NOTES_LIMIT = 140

let idCounter = 0
function makeId(): string {
  // Stable, SSR-safe-enough id. We never round-trip these ids to a server, so
  // crypto.randomUUID isn't required — a monotonic counter + time is fine.
  idCounter += 1
  return `ti_${Date.now().toString(36)}_${idCounter.toString(36)}`
}

export function createEmptyInterestItem(): TradeInterestItem {
  return {
    id: makeId(),
    category: "",
    subcategory: "",
    brand: "",
    model: "",
    unverifiedBrand: false,
    unverifiedModel: false,
    condition: "",
    valueMin: "",
    valueMax: "",
    notes: "",
    specs: {},
  }
}

/**
 * Produces the collapsed-card summary string described in the spec.
 * Ordering: `Subcategory · Brand Model · <spec values> · Condition · $min-$max`.
 * Empty fields are skipped so summaries stay short and punchy.
 */
export function summarizeInterest(item: TradeInterestItem): string {
  const parts: string[] = []

  if (item.subcategory) parts.push(item.subcategory)

  const brandModel = [item.brand, item.model].filter(Boolean).join(" ")
  if (brandModel) parts.push(brandModel)

  // Only include non-empty, non-"Any" spec values. Order follows the catalog
  // so the summary reads predictably across items.
  const specFields = getSpecsFor(item.category, item.subcategory)
  const specValues: string[] = []
  for (const field of specFields) {
    const val = item.specs[field.key]
    if (val && val !== "Any") specValues.push(val)
  }
  if (specValues.length > 0) parts.push(specValues.join(", "))

  if (item.condition && item.condition !== "Any") parts.push(item.condition)

  const min = item.valueMin.trim()
  const max = item.valueMax.trim()
  if (min && max) parts.push(`$${min}-$${max}`)
  else if (min) parts.push(`$${min}+`)
  else if (max) parts.push(`Up to $${max}`)

  // Fall back to bare category when nothing else is filled — a card with only
  // a category is still valid and the collapsed summary should reflect that.
  if (parts.length === 0 && item.category) return item.category

  return parts.join(" · ")
}

/**
 * Normalizes a raw item returned from the AI parser (or any untrusted source):
 *   - Fills every required field with its empty default.
 *   - Assigns a fresh client-side id.
 *   - Drops any spec keys that aren't defined in the catalog for the current
 *     (category, subcategory) pair.
 *   - Marks unverified brand/model when the value isn't in the local index.
 *
 * Returns null when the item is unusable (no category).
 */
function normalizeParsedItem(raw: unknown): TradeInterestItem | null {
  if (!raw || typeof raw !== "object") return null
  const r = raw as Record<string, unknown>

  const category = typeof r.category === "string" ? r.category : ""
  if (!category || !(TRADE_CATEGORIES as readonly string[]).includes(category)) {
    // AI-parsed cards without a valid category are dropped, per spec.
    return null
  }

  const subcategory = typeof r.subcategory === "string" ? r.subcategory : ""
  const validSubs = SUBCATEGORIES_BY_CATEGORY[category as TradeCategory] ?? []
  const safeSubcategory = validSubs.includes(subcategory) ? subcategory : ""

  const brand = typeof r.brand === "string" ? r.brand.trim() : ""
  const model = typeof r.model === "string" ? r.model.trim() : ""

  const knownBrands = getBrandsFor(category).map((b) => b.name.toLowerCase())
  const unverifiedBrand = brand.length > 0 && !knownBrands.includes(brand.toLowerCase())

  const knownModels = brand
    ? getModelsFor(category, brand).map((m) => m.toLowerCase())
    : []
  const unverifiedModel = model.length > 0 && !knownModels.includes(model.toLowerCase())

  const condition = typeof r.condition === "string" ? r.condition : ""
  const safeCondition = (TRADE_CONDITIONS as readonly string[]).includes(condition)
    ? condition
    : ""

  const valueMin =
    typeof r.valueMin === "string"
      ? r.valueMin
      : typeof r.valueMin === "number"
        ? String(r.valueMin)
        : ""
  const valueMax =
    typeof r.valueMax === "string"
      ? r.valueMax
      : typeof r.valueMax === "number"
        ? String(r.valueMax)
        : ""

  const notes = typeof r.notes === "string" ? r.notes.slice(0, NOTES_LIMIT) : ""

  // Filter specs against the catalog. Unknown keys / values are dropped.
  const specs: Record<string, string> = {}
  const rawSpecs =
    r.specs && typeof r.specs === "object" ? (r.specs as Record<string, unknown>) : {}
  const specFields = getSpecsFor(category, safeSubcategory)
  for (const field of specFields) {
    const incoming = rawSpecs[field.key]
    if (typeof incoming !== "string") continue
    if (incoming === "Any" || field.options.includes(incoming)) {
      specs[field.key] = incoming
    }
  }

  return {
    id: makeId(),
    category,
    subcategory: safeSubcategory,
    brand,
    model,
    unverifiedBrand,
    unverifiedModel,
    condition: safeCondition,
    valueMin,
    valueMax,
    notes,
    specs,
  }
}

/**
 * Client-side parser entry point. Calls the server route, which routes through
 * the Vercel AI Gateway to Anthropic's `claude-sonnet-4-20250514`. The server
 * returns raw JSON items; we normalize/validate on the client so the
 * normalization rules (and the catalog they depend on) stay in one place.
 *
 * On empty/ambiguous input this resolves to []. On network / parse failures
 * it throws so the UI can render a retry branch.
 */
export async function parseSimpleToAdvanced(
  text: string,
): Promise<TradeInterestItem[]> {
  const trimmed = text.trim()
  if (!trimmed) return []

  const res = await fetch("/api/trade-interest/parse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: trimmed }),
  })

  if (!res.ok) {
    throw new Error(`Parse failed: ${res.status}`)
  }

  const data = (await res.json()) as { items?: unknown }
  if (!Array.isArray(data.items)) return []

  const normalized: TradeInterestItem[] = []
  for (const raw of data.items) {
    const item = normalizeParsedItem(raw)
    if (item) normalized.push(item)
  }
  return normalized
}

/* -------------------------------------------------------------------------- */
/* Section component                                                          */
/* -------------------------------------------------------------------------- */

export interface TradeInterestSectionProps {
  value: TradeInterestData
  onChange: (next: TradeInterestData) => void
  /**
   * When true, the section renders without its own card chrome — useful when
   * mounting inside an existing Accordion panel that already owns the border
   * and padding. Defaults to false (self-contained card).
   */
  bare?: boolean
  className?: string
}

export function TradeInterestSection({
  value,
  onChange,
  bare = false,
  className,
}: TradeInterestSectionProps) {
  // Track which cards are expanded in the UI. We keep this in component state
  // (not in `value`) so toggling expansion never mutates the parent form.
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set())

  // Saved interests for the "Load from saved" picker.
  const { interests: savedInterests } = useSavedTradeInterests()

  const [parseState, setParseState] = React.useState<{
    status: "idle" | "loading" | "empty" | "error"
    message?: string
  }>({ status: "idle" })

  const toggleCard = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const setMode = (mode: "simple" | "advanced") => {
    // Clearing parse-state on mode change avoids the empty/error helper from
    // shouting at the user after they've switched contexts.
    setParseState({ status: "idle" })
    onChange({ ...value, mode })
  }

  const setSimpleText = (text: string) => {
    if (parseState.status !== "idle" && parseState.status !== "loading") {
      setParseState({ status: "idle" })
    }
    onChange({ ...value, simpleText: text })
  }

  const addCard = () => {
    const next = createEmptyInterestItem()
    setExpandedIds((prev) => new Set(prev).add(next.id))
    onChange({ ...value, advanced: [...value.advanced, next] })
  }

  const removeCard = (id: string) => {
    onChange({
      ...value,
      advanced: value.advanced.filter((item) => item.id !== id),
    })
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const loadFromSaved = (saved: SavedTradeInterest) => {
    const next = createEmptyInterestItem()
    next.category = saved.category
    next.subcategory = saved.subcategory
    next.brand = saved.brand
    next.model = saved.model
    next.condition = saved.condition
    next.valueMin = saved.valueMin
    next.valueMax = saved.valueMax
    next.notes = saved.notes
    next.specs = { ...saved.specs }
    setExpandedIds((prev) => new Set(prev).add(next.id))
    onChange({
      ...value,
      mode: "advanced",
      advanced: [...value.advanced, next],
    })
  }

  const updateCard = (id: string, patch: Partial<TradeInterestItem>) => {
    onChange({
      ...value,
      advanced: value.advanced.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    })
  }

  /**
   * Handles Category or Subcategory changes on a card. Per spec, changing
   * either resets all specs to avoid orphan keys. We handle it here (rather
   * than in the inner card) so the reset rule stays centralized.
   */
  const updateCardCategory = (id: string, category: string) => {
    onChange({
      ...value,
      advanced: value.advanced.map((item) =>
        item.id === id
          ? {
              ...item,
              category,
              subcategory: "",
              specs: {},
              // Changing category invalidates brand/model scoping; clear them
              // so the user isn't left with a Fender under "Drums".
              brand: "",
              model: "",
              unverifiedBrand: false,
              unverifiedModel: false,
            }
          : item,
      ),
    })
  }

  const updateCardSubcategory = (id: string, subcategory: string) => {
    onChange({
      ...value,
      advanced: value.advanced.map((item) =>
        item.id === id
          ? {
              ...item,
              subcategory,
              specs: {},
            }
          : item,
      ),
    })
  }

  const runParse = async () => {
    const trimmed = value.simpleText.trim()
    if (!trimmed) return
    setParseState({ status: "loading" })
    try {
      const items = await parseSimpleToAdvanced(trimmed)
      if (items.length === 0) {
        setParseState({
          status: "empty",
          message:
            "Couldn't turn that into structured interests — try adding a category or brand, or switch to Advanced mode.",
        })
        return
      }
      // Success: switch to Advanced, pre-fill, leave simpleText untouched.
      setExpandedIds(new Set([items[0].id]))
      setParseState({ status: "idle" })
      onChange({
        ...value,
        mode: "advanced",
        advanced: items,
      })
    } catch (err) {
      console.error("[v0] parseSimpleToAdvanced error:", err)
      setParseState({
        status: "error",
        message: "Something went wrong while parsing. Try again?",
      })
    }
  }

  const headerChrome = (
    <div className="flex items-center justify-between gap-3" data-coachmark="trade-interests-header">
      <div className="flex items-center gap-2 min-w-0">
        <Repeat2 className="h-4 w-4 text-primary flex-shrink-0" />
        <h3 className="text-sm font-semibold truncate">Trade Interest</h3>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="About trade interest"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[260px] p-3">
            <p className="text-xs leading-relaxed">
              Describe what you&apos;d accept in trade. The more specific you
              are, the better your matches.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
      <ModeToggle mode={value.mode} onChange={setMode} />
    </div>
  )

  const body = (
    <>
      {value.mode === "simple" ? (
        <SimpleMode
          text={value.simpleText}
          onChangeText={setSimpleText}
          onParse={runParse}
          parseState={parseState}
        />
      ) : (
        <AdvancedMode
          items={value.advanced}
          expandedIds={expandedIds}
          onToggleCard={toggleCard}
          onAddCard={addCard}
          onRemoveCard={removeCard}
          onUpdateCard={updateCard}
          onUpdateCategory={updateCardCategory}
          onUpdateSubcategory={updateCardSubcategory}
          savedInterests={savedInterests}
          onLoadSaved={loadFromSaved}
        />
      )}
    </>
  )

  const tour = (
    <Coachmarks
      storageKey="trade-interests-tour-v1"
      steps={tourSteps(savedInterests.length > 0)}
    />
  )

  if (bare) {
    return (
      <div className={cn("space-y-4", className)}>
        {headerChrome}
        {body}
        {tour}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "bg-card rounded-lg border border-border p-4 space-y-4",
        className,
      )}
    >
      {headerChrome}
      {body}
      {tour}
    </div>
  )
}

function tourSteps(hasSaved: boolean): CoachmarkStep[] {
  const steps: CoachmarkStep[] = [
    {
      target: "trade-interests-header",
      title: "What are trade interests?",
      body: "Describe what you'd accept in trade for this item. The more specific, the better the matches we surface.",
      placement: "bottom",
    },
    {
      target: "trade-interests-content",
      title: "Add your first interest",
      body: "Each interest is one thing you'd consider — vintage Strat, tube amp, etc. You can add as many as you want.",
      placement: "top",
    },
  ]
  if (hasSaved) {
    steps.push({
      target: "trade-interests-content",
      title: "Or reuse a saved one",
      body: "If you already have saved interests, load them in with one click — no retyping.",
      placement: "top",
    })
  }
  return steps
}

/* -------------------------------------------------------------------------- */
/* Mode toggle                                                                */
/* -------------------------------------------------------------------------- */

function ModeToggle({
  mode,
  onChange,
}: {
  mode: "simple" | "advanced"
  onChange: (mode: "simple" | "advanced") => void
}) {
  return (
    <div
      role="tablist"
      aria-label="Trade interest mode"
      className="inline-flex rounded-lg border border-border bg-background p-0.5"
    >
      {(["simple", "advanced"] as const).map((m) => {
        const active = mode === m
        return (
          <button
            key={m}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(m)}
            className={cn(
              "px-2.5 h-7 rounded-md text-xs font-medium capitalize transition-colors",
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
  )
}

/* -------------------------------------------------------------------------- */
/* Simple mode                                                                */
/* -------------------------------------------------------------------------- */

function SimpleMode({
  text,
  onChangeText,
  onParse,
  parseState,
}: {
  text: string
  onChangeText: (t: string) => void
  onParse: () => void
  parseState: {
    status: "idle" | "loading" | "empty" | "error"
    message?: string
  }
}) {
  const loading = parseState.status === "loading"
  const disabled = loading || text.trim().length === 0
  const over = text.length > SIMPLE_SOFT_LIMIT

  return (
    <div className="space-y-2">
      <label
        htmlFor="trade-interest-simple"
        className="text-xs text-muted-foreground block"
      >
        What would you accept in trade?
      </label>
      <div className="relative">
        <textarea
          id="trade-interest-simple"
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          disabled={loading}
          placeholder="e.g. 60s Fender Strat in sunburst, or a tube combo under $1500"
          rows={3}
          className={cn(
            "w-full bg-background rounded-lg border px-3 py-2 pr-11 text-sm resize-none transition-all",
            "text-foreground placeholder:text-muted-foreground/50",
            "focus:outline-none focus:ring-1",
            over
              ? "border-destructive/60 focus:border-destructive focus:ring-destructive/30"
              : "border-border focus:border-primary focus:ring-primary/30",
            loading && "opacity-60",
          )}
        />
        {/* Sparkles button docked to the trailing edge, inside the input. */}
        <div className="absolute right-1.5 top-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={onParse}
                disabled={disabled}
                aria-label="Structure with AI"
                className="h-7 w-7"
              >
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs">
              Turn your description into structured interests
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 text-[11px]">
        <span
          className={cn(
            "text-muted-foreground",
            over && "text-destructive",
          )}
        >
          {text.length}/{SIMPLE_SOFT_LIMIT}
        </span>
        <span className="text-muted-foreground">
          Keep it short — the AI button turns this into structured cards.
        </span>
      </div>

      {parseState.status === "empty" && parseState.message ? (
        <p className="text-xs text-muted-foreground border border-dashed border-border rounded-md px-3 py-2">
          {parseState.message}
        </p>
      ) : null}

      {parseState.status === "error" ? (
        <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/5 border border-destructive/30 rounded-md px-3 py-2">
          <span className="flex-1">
            {parseState.message ?? "Something went wrong."}
          </span>
          <button
            type="button"
            onClick={onParse}
            className="font-medium underline-offset-2 hover:underline"
          >
            Retry
          </button>
        </div>
      ) : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Advanced mode                                                              */
/* -------------------------------------------------------------------------- */

function AdvancedMode({
  items,
  expandedIds,
  onToggleCard,
  onAddCard,
  onRemoveCard,
  onUpdateCard,
  onUpdateCategory,
  onUpdateSubcategory,
  savedInterests,
  onLoadSaved,
}: {
  items: TradeInterestItem[]
  expandedIds: Set<string>
  onToggleCard: (id: string) => void
  onAddCard: () => void
  onRemoveCard: (id: string) => void
  onUpdateCard: (id: string, patch: Partial<TradeInterestItem>) => void
  onUpdateCategory: (id: string, category: string) => void
  onUpdateSubcategory: (id: string, subcategory: string) => void
  savedInterests: SavedTradeInterest[]
  onLoadSaved: (interest: SavedTradeInterest) => void
}) {
  if (items.length === 0) {
    return (
      <div data-coachmark="trade-interests-content">
        <InterestEmptyState
          variant="compact"
          onAddNew={onAddCard}
          onLoadSaved={savedInterests.length > 0 ? () => {} : undefined}
          hasSavedAvailable={savedInterests.length > 0}
        />
        {savedInterests.length > 0 && (
          <div className="mt-3 flex justify-center">
            <LoadSavedPicker
              saved={savedInterests}
              onPick={onLoadSaved}
              triggerVariant="ghost"
              triggerSize="sm"
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2.5" data-coachmark="trade-interests-content">
      {items.map((item) => (
        <InterestCard
          key={item.id}
          item={item}
          expanded={expandedIds.has(item.id)}
          onToggle={() => onToggleCard(item.id)}
          onRemove={() => onRemoveCard(item.id)}
          onUpdate={(patch) => onUpdateCard(item.id, patch)}
          onUpdateCategory={(cat) => onUpdateCategory(item.id, cat)}
          onUpdateSubcategory={(sub) => onUpdateSubcategory(item.id, sub)}
        />
      ))}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddCard}
          className="flex-1 border-dashed"
          data-coachmark="trade-interests-add"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add interest
        </Button>
        {savedInterests.length > 0 && (
          <LoadSavedPicker
            saved={savedInterests}
            onPick={onLoadSaved}
            triggerVariant="ghost"
            triggerSize="sm"
          />
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Interest card                                                              */
/* -------------------------------------------------------------------------- */

function InterestCard({
  item,
  expanded,
  onToggle,
  onRemove,
  onUpdate,
  onUpdateCategory,
  onUpdateSubcategory,
}: {
  item: TradeInterestItem
  expanded: boolean
  onToggle: () => void
  onRemove: () => void
  onUpdate: (patch: Partial<TradeInterestItem>) => void
  onUpdateCategory: (category: string) => void
  onUpdateSubcategory: (subcategory: string) => void
}) {
  const subcategories =
    item.category && (item.category as TradeCategory) in SUBCATEGORIES_BY_CATEGORY
      ? SUBCATEGORIES_BY_CATEGORY[item.category as TradeCategory]
      : []

  const specFields = getSpecsFor(item.category, item.subcategory)
  const brands = getBrandsFor(item.category)
  const models = getModelsFor(item.category, item.brand)

  const summary = summarizeInterest(item)

  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden transition-all">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-secondary/40 transition-colors text-left"
      >
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={cn(
                "text-sm font-medium truncate",
                !item.category && "text-muted-foreground italic",
              )}
            >
              {item.category ? summary : "New interest"}
            </span>
          </div>
          {item.category && expanded ? (
            <span className="text-[11px] text-muted-foreground mt-0.5 block">
              {item.category}
            </span>
          ) : null}
        </div>
        {/* Open/Narrowed/Specific badge removed — the collapsed summary
            line itself already reveals how detailed the interest is, and
            the extra pill added visual noise without improving matching. */}
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      {expanded ? (
        <div className="border-t border-border p-3 space-y-4">
          {/* Category — required, always shown */}
          <FieldRow
            label="Category"
            hint="Required"
            required
          >
            <Select
              value={item.category || undefined}
              onValueChange={(v) => onUpdateCategory(v)}
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
          </FieldRow>

          {/* Subcategory — only if category set AND subcategories exist */}
          {item.category && subcategories.length > 0 ? (
            <FieldRow label="Subcategory">
              <div className="flex flex-wrap gap-1.5">
                {subcategories.map((sub) => {
                  const active = item.subcategory === sub
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() =>
                        onUpdateSubcategory(active ? "" : sub)
                      }
                      className={cn(
                        "inline-flex items-center h-7 px-2.5 rounded-full text-xs font-medium border transition-colors",
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:border-primary/60",
                      )}
                    >
                      {sub}
                    </button>
                  )
                })}
              </div>
            </FieldRow>
          ) : null}

          {/* Specs — only if subcategory set AND catalog has specs */}
          {item.subcategory && specFields.length > 0 ? (
            <FieldRow label="Specifications" hint="Tap to add">
              <SpecsChipSection
                fields={specFields}
                values={item.specs}
                onChange={(next) => onUpdate({ specs: next })}
              />
            </FieldRow>
          ) : null}

          {/* Brand — only after category is set */}
          {item.category ? (
            <FieldRow label="Brand">
              <BrandModelCombobox
                value={item.brand}
                unverified={item.unverifiedBrand}
                options={brands.map((b) => b.name)}
                placeholder="Any brand"
                onChange={(brand, unverified) => {
                  // Changing brand invalidates the current model — clear it
                  // so the model combobox reflects the new scope.
                  onUpdate({
                    brand,
                    unverifiedBrand: unverified,
                    model: "",
                    unverifiedModel: false,
                  })
                }}
              />
            </FieldRow>
          ) : null}

          {/* Model — only after brand is set */}
          {item.brand ? (
            <FieldRow label="Model">
              <BrandModelCombobox
                value={item.model}
                unverified={item.unverifiedModel}
                options={models}
                placeholder="Any model"
                onChange={(model, unverified) =>
                  onUpdate({ model, unverifiedModel: unverified })
                }
              />
            </FieldRow>
          ) : null}

          {/* Condition */}
          {item.category ? (
            <FieldRow label="Condition">
              <Select
                value={item.condition || undefined}
                onValueChange={(v) =>
                  onUpdate({ condition: v === "Any" ? "" : v })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Any condition" />
                </SelectTrigger>
                <SelectContent>
                  {TRADE_CONDITIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldRow>
          ) : null}

          {/* Value range */}
          {item.category ? (
            <FieldRow label="Estimated value range">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    $
                  </span>
                  <Input
                    inputMode="decimal"
                    value={item.valueMin}
                    onChange={(e) => onUpdate({ valueMin: e.target.value })}
                    placeholder="Min"
                    className="pl-6"
                  />
                </div>
                <span className="text-muted-foreground text-sm">–</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    $
                  </span>
                  <Input
                    inputMode="decimal"
                    value={item.valueMax}
                    onChange={(e) => onUpdate({ valueMax: e.target.value })}
                    placeholder="Max"
                    className="pl-6"
                  />
                </div>
              </div>
            </FieldRow>
          ) : null}

          {/* Notes */}
          {item.category ? (
            <FieldRow label="Notes">
              <div className="space-y-1">
                <textarea
                  value={item.notes}
                  onChange={(e) =>
                    onUpdate({ notes: e.target.value.slice(0, NOTES_LIMIT) })
                  }
                  rows={2}
                  placeholder="Anything else you'd want to mention…"
                  className="w-full bg-background rounded-lg border border-border px-3 py-2 text-sm resize-none text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                />
                <p className="text-[11px] text-muted-foreground text-right">
                  {item.notes.length}/{NOTES_LIMIT}
                </p>
              </div>
            </FieldRow>
          ) : null}

          {/* Remove */}
          <div className="pt-1 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-8 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Remove
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function FieldRow({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-foreground">
          {label}
          {required ? <span className="text-destructive ml-0.5">*</span> : null}
        </label>
        {hint ? (
          <span className="text-[11px] text-muted-foreground">{hint}</span>
        ) : null}
      </div>
      {children}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Specs chip section                                                         */
/* -------------------------------------------------------------------------- */

export function SpecsChipSection({
  fields,
  values,
  onChange,
}: {
  fields: SpecField[]
  values: Record<string, string>
  onChange: (next: Record<string, string>) => void
}) {
  // Add = promote a dashed `+` chip to a labeled dropdown by setting the key.
  // Remove = drop the key entirely.
  const addSpec = (field: SpecField) => {
    onChange({ ...values, [field.key]: "Any" })
  }

  const removeSpec = (field: SpecField) => {
    const next = { ...values }
    delete next[field.key]
    onChange(next)
  }

  const updateSpec = (field: SpecField, value: string) => {
    onChange({ ...values, [field.key]: value })
  }

  const activeFields = fields.filter((f) => f.key in values)
  const inactiveFields = fields.filter((f) => !(f.key in values))

  return (
    <div className="flex flex-wrap gap-1.5">
      {activeFields.map((field) => (
        <div
          key={field.key}
          className="inline-flex items-center h-8 rounded-full border border-border bg-background pl-2.5 pr-1 gap-1"
        >
          <span className="text-[11px] text-muted-foreground">
            {field.label}:
          </span>
          <Select
            value={values[field.key] || "Any"}
            onValueChange={(v) => updateSpec(field, v)}
          >
            <SelectTrigger
              className="h-6 border-0 bg-transparent px-1 py-0 text-xs font-medium shadow-none focus:ring-0 focus:ring-offset-0 hover:bg-secondary/60 gap-1"
            >
              <SelectValue />
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
          <button
            type="button"
            onClick={() => removeSpec(field)}
            aria-label={`Remove ${field.label}`}
            className="h-5 w-5 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}

      {inactiveFields.map((field) => (
        <button
          key={field.key}
          type="button"
          onClick={() => addSpec(field)}
          className="inline-flex items-center gap-1 h-8 px-2.5 rounded-full border border-dashed border-border bg-background text-xs text-muted-foreground hover:text-foreground hover:border-primary/60 transition-colors"
        >
          <Plus className="h-3 w-3" />
          {field.label}
        </button>
      ))}

      {fields.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No specs available for this subcategory.
        </p>
      ) : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Brand / model combobox                                                     */
/* -------------------------------------------------------------------------- */

export function BrandModelCombobox({
  value,
  unverified,
  options,
  placeholder,
  onChange,
}: {
  value: string
  unverified: boolean
  options: string[]
  placeholder: string
  onChange: (value: string, unverified: boolean) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  // Sync query with value when closed so the input shows the selected value
  // without needing the popover to be open.
  React.useEffect(() => {
    if (!open) setQuery(value)
  }, [open, value])

  const isKnown = (v: string) =>
    options.some((opt) => opt.toLowerCase() === v.trim().toLowerCase())

  const commit = (raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) {
      onChange("", false)
      return
    }
    // Prefer the canonical casing from `options` when there's a match so
    // summaries render consistently across cards.
    const canonical = options.find(
      (opt) => opt.toLowerCase() === trimmed.toLowerCase(),
    )
    if (canonical) {
      onChange(canonical, false)
    } else {
      onChange(trimmed, true)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("", false)
    setQuery("")
  }

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(query.trim().toLowerCase()),
  )
  const showFreeType =
    query.trim().length > 0 && !isKnown(query) && filtered.length < options.length

  return (
    <div className="space-y-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              value={open ? query : value}
              onChange={(e) => {
                setQuery(e.target.value)
                if (!open) setOpen(true)
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => {
                // Commit free-type value on blur so users who don't open the
                // dropdown still persist their typed brand/model.
                if (open) return
                if (query !== value) commit(query)
              }}
              placeholder={placeholder}
              className={cn(
                "pr-8",
                unverified && "border-amber-500/60",
              )}
            />
            {value ? (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary"
              >
                <X className="h-3 w-3" />
              </button>
            ) : null}
          </div>
        </PopoverTrigger>
        {options.length > 0 ? (
          <PopoverContent
            align="start"
            className="p-0 w-[--radix-popover-trigger-width] min-w-[220px]"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search…"
                value={query}
                onValueChange={setQuery}
              />
              <CommandList>
                <CommandEmpty>No matches.</CommandEmpty>
                {filtered.length > 0 ? (
                  <CommandGroup>
                    {filtered.map((opt) => (
                      <CommandItem
                        key={opt}
                        value={opt}
                        onSelect={() => {
                          commit(opt)
                          setQuery(opt)
                          setOpen(false)
                        }}
                      >
                        {opt}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : null}
                {showFreeType ? (
                  <CommandGroup heading="Custom">
                    <CommandItem
                      value={`__custom__${query}`}
                      onSelect={() => {
                        commit(query)
                        setOpen(false)
                      }}
                    >
                      Use &ldquo;{query.trim()}&rdquo;
                    </CommandItem>
                  </CommandGroup>
                ) : null}
              </CommandList>
            </Command>
          </PopoverContent>
        ) : null}
      </Popover>
      {unverified && value ? (
        <p className="text-[11px] text-amber-600 dark:text-amber-500">
          Not in our index — we&apos;ll still use it as a matcher.
        </p>
      ) : null}
    </div>
  )
}


