"use client"

/**
 * SpecsEditor — minimal input-first editor for an item's specifications.
 *
 * Layout philosophy:
 *   - Every spec renders as a labelled input (no nested containers, no
 *     double borders). The label sits above and the input is the only
 *     decorated surface.
 *   - Specs with `options` get a lightweight autocomplete popover anchored
 *     under the input. The popover is purely a suggestion — the user can
 *     type anything, including values not in the list.
 *   - Optional specs that haven't been added yet appear as `+ Label` chips
 *     below the active inputs. Tapping a chip promotes the spec to a regular
 *     input row.
 *   - "+ Custom" lets the user create an arbitrary spec on the fly.
 *
 * Brand/Model coupling: when the spec key is `model`, options are resolved
 * dynamically from the current brand value via `getModelOptionsFor`, so the
 * suggestions narrow as the user picks a brand.
 */

import { useEffect, useMemo, useRef, useState } from "react"
import { Check, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  getModelOptionsFor,
  getSpecsFor,
  type SpecDefinition,
} from "@/lib/specs/catalog"

type Suggestion = {
  value: string
  confidence: "high" | "medium" | "low"
  accepted: boolean
}

interface SpecsEditorProps {
  category: string
  subcategory: string
  getSpec: (key: string) => string
  setSpec: (key: string, value: string) => void
  suggestions?: Record<string, Suggestion>
  onAcceptSuggestion?: (key: string) => void
  /** Keys the parent considers required (legacy; specs are now always optional). */
  requiredKeys?: Set<string>
  /** Keys to draw with a warning ring after a failed advance attempt. */
  highlight?: Set<string>
  /** Compact mode reduces input height — used by desktop. */
  compact?: boolean
}

export function SpecsEditor({
  category,
  subcategory,
  getSpec,
  setSpec,
  suggestions = {},
  onAcceptSuggestion,
  requiredKeys = new Set(),
  highlight = new Set(),
  compact = false,
}: SpecsEditorProps) {
  // Single source of truth — pulls catalog entries for this category and
  // injects brand suggestions from the trade-brands index.
  const knownSpecs = useMemo(
    () => getSpecsFor(category, subcategory),
    [category, subcategory],
  )

  // Track which optional specs the user has explicitly tapped to add, so the
  // input row stays visible even if they later clear the value.
  const [promoted, setPromoted] = useState<Set<string>>(new Set())
  // Custom specs created via the "+ Custom" chip — stored locally since they
  // don't live in the canonical catalog.
  const [customSpecs, setCustomSpecs] = useState<SpecDefinition[]>([])
  const [customDraftLabel, setCustomDraftLabel] = useState<string | null>(null)

  // Brand / Model / Year stay visible at all times — they are the most
  // commonly-filled identifiers and surface across the rest of the UI.
  const PINNED_KEYS = new Set(["brand", "model", "year"])

  const isActive = (key: string) =>
    PINNED_KEYS.has(key) ||
    requiredKeys.has(key) ||
    !!getSpec(key) ||
    promoted.has(key) ||
    (suggestions[key] && !suggestions[key].accepted)

  const activeSpecs: SpecDefinition[] = [
    ...knownSpecs.filter((s) => isActive(s.key)),
    ...customSpecs,
  ]
  const suggestedSpecs = knownSpecs.filter((s) => !isActive(s.key))

  const removeSpec = (key: string) => {
    setSpec(key, "")
    setPromoted((prev) => {
      if (!prev.has(key)) return prev
      const next = new Set(prev)
      next.delete(key)
      return next
    })
    setCustomSpecs((prev) => prev.filter((c) => c.key !== key))
  }

  const promoteSpec = (key: string) => {
    setPromoted((p) => {
      const next = new Set(p)
      next.add(key)
      return next
    })
  }

  const commitCustomDraft = () => {
    const label = (customDraftLabel || "").trim()
    if (!label) {
      setCustomDraftLabel(null)
      return
    }
    const key = `custom.${label.toLowerCase().replace(/\s+/g, "_")}`
    if (customSpecs.some((c) => c.key === key) || knownSpecs.some((c) => c.key === key)) {
      setCustomDraftLabel(null)
      return
    }
    setCustomSpecs((prev) => [...prev, { key, label, inputType: "text" }])
    setCustomDraftLabel(null)
  }

  const inputHeight = compact ? "h-10" : "h-11"
  const chipHeight = compact ? "h-8" : "h-9"

  return (
    <div className="space-y-5">
      {/* Active spec inputs — flat list, no nested containers. */}
      <div className="space-y-3">
        {activeSpecs.map((spec) => {
          // Model autocomplete is brand-aware: it pulls its options from the
          // currently selected brand so the suggestions narrow as the user
          // picks one.
          const resolvedOptions =
            spec.key === "model"
              ? getModelOptionsFor(category, getSpec("brand"))
              : spec.options ?? []

          return (
            <SpecField
              key={spec.key}
              spec={spec}
              value={getSpec(spec.key)}
              onChange={(v) => setSpec(spec.key, v)}
              options={resolvedOptions}
              isHighlighted={highlight.has(spec.key)}
              suggestion={suggestions[spec.key]}
              onAcceptSuggestion={
                onAcceptSuggestion ? () => onAcceptSuggestion(spec.key) : undefined
              }
              onRemove={
                PINNED_KEYS.has(spec.key) ? undefined : () => removeSpec(spec.key)
              }
              inputHeight={inputHeight}
            />
          )
        })}
      </div>

      {/* Suggestion chips + custom entry. Only render the divider/heading
          when there's at least one chip to show. */}
      {(suggestedSpecs.length > 0 || customDraftLabel === null) && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Add more</p>
          <div className="flex flex-wrap gap-2">
            {suggestedSpecs.map((spec) => (
              <button
                key={spec.key}
                type="button"
                onClick={() => promoteSpec(spec.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 rounded-full border text-sm",
                  "transition-colors active:scale-95",
                  chipHeight,
                  "border-border text-muted-foreground bg-transparent hover:text-foreground hover:border-primary/40",
                )}
              >
                <Plus className="h-3.5 w-3.5" />
                {spec.label}
              </button>
            ))}

            {customDraftLabel === null && (
              <button
                type="button"
                onClick={() => setCustomDraftLabel("")}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 rounded-full border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors active:scale-95",
                  chipHeight,
                )}
              >
                <Plus className="h-3.5 w-3.5" />
                Custom
              </button>
            )}
          </div>

          {customDraftLabel !== null && (
            <div className="mt-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
              <Input
                autoFocus
                value={customDraftLabel}
                onChange={(e) => setCustomDraftLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    commitCustomDraft()
                  } else if (e.key === "Escape") {
                    setCustomDraftLabel(null)
                  }
                }}
                placeholder="Spec name (e.g. Serial Number)"
                className={cn("text-base flex-1", inputHeight)}
              />
              <Button
                size="sm"
                onClick={commitCustomDraft}
                disabled={!customDraftLabel.trim()}
                className={cn("px-4", inputHeight)}
              >
                Add
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCustomDraftLabel(null)}
                className={cn("px-2 text-muted-foreground", inputHeight)}
                aria-label="Cancel custom spec"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* SpecField                                                                  */
/*                                                                            */
/* One spec row: label above, input below. When the spec has options, the     */
/* input doubles as an autocomplete — focus opens a popover listing matching  */
/* options, but the user can always commit free text. No surrounding card or  */
/* border — the input itself is the only chrome.                              */
/* -------------------------------------------------------------------------- */
function SpecField({
  spec,
  value,
  onChange,
  options,
  isHighlighted,
  suggestion,
  onAcceptSuggestion,
  onRemove,
  inputHeight,
}: {
  spec: SpecDefinition
  value: string
  onChange: (v: string) => void
  options: string[]
  isHighlighted: boolean
  suggestion?: Suggestion
  onAcceptSuggestion?: () => void
  onRemove?: () => void
  inputHeight: string
}) {
  const [focused, setFocused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const pendingSuggestion = suggestion && !suggestion.accepted && !value
  const hasOptions = options.length > 0
  const inputMode = spec.inputType === "number" ? "decimal" : undefined

  // Filter options by what the user has typed so the list narrows live.
  // Case-insensitive substring match. Hide options that exactly equal the
  // current value so the dropdown doesn't dangle a redundant entry.
  const filteredOptions = useMemo(() => {
    const q = value.trim().toLowerCase()
    if (!q) return options
    return options.filter(
      (o) => o.toLowerCase().includes(q) && o.toLowerCase() !== q,
    )
  }, [options, value])

  // Close the suggestion list when the user clicks anywhere outside the
  // field. Native blur on the input would also work, but it fires before
  // the mousedown on a list item registers and would swallow the click.
  useEffect(() => {
    if (!focused) return
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setFocused(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [focused])

  const showSuggestionList =
    hasOptions && focused && filteredOptions.length > 0

  return (
    <div ref={containerRef} className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm text-muted-foreground">{spec.label}</label>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            aria-label={`Remove ${spec.label}`}
          >
            Remove
          </button>
        )}
      </div>

      {pendingSuggestion && onAcceptSuggestion ? (
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 bg-primary/5 rounded-md border border-primary/20 px-3 py-2 text-foreground/80 italic text-sm truncate">
            {suggestion.value}
          </div>
          <button
            type="button"
            onClick={onAcceptSuggestion}
            className={cn(
              "shrink-0 inline-flex items-center gap-1 px-3 rounded-md bg-primary/20 hover:bg-primary/30 text-primary font-medium text-xs",
              inputHeight,
            )}
          >
            <Check className="h-3.5 w-3.5" />
            Accept
          </button>
        </div>
      ) : (
        // Relative wrapper anchors the suggestion list directly under the
        // input. Avoids Radix Popover so the input never loses focus or
        // gets occluded by the floating panel.
        <div className="relative">
          <Input
            inputMode={inputMode}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder={spec.placeholder ?? `Enter ${spec.label.toLowerCase()}`}
            aria-invalid={isHighlighted}
            className={cn(
              "text-base",
              inputHeight,
              isHighlighted && "border-status-warning focus-visible:ring-status-warning/30",
            )}
          />
          {showSuggestionList && (
            <ul
              className="absolute z-30 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-md border border-border bg-popover shadow-md p-1"
              // Prevent the mousedown from blurring the input — we still want
              // it focused after the user picks an option.
              onMouseDown={(e) => e.preventDefault()}
            >
              {filteredOptions.map((opt) => (
                <li key={opt}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt)
                      setFocused(false)
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors"
                  >
                    {opt}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
