"use client"

/**
 * Mobile-only 5-step wizard for creating a listing.
 *
 * Design notes:
 * - Thumb-friendly: all primary controls are ≥ 44 px tall and live in the lower
 *   third of the screen when possible.
 * - Sticky chrome: progress header pins top, action bar pins bottom; the middle
 *   is the only scrollable region so users never lose their place.
 * - Steps are conceptually fixed at 5 (always 5 dots in the progress bar) but
 *   the *content* of steps 3 and 4 adapts to the status selection — e.g. a pure
 *   wishlist item never sees payment/logistics fields.
 * - Review (step 5) is a preview of the final listing card, not a form — this
 *   matches how the item will actually look to other collectors.
 */

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import {
  AlertCircle,
  ArrowLeft,
  ArrowLeftRight,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  DollarSign,
  FolderOpen,
  Heart,
  Loader2,
  Pencil,
  Plus,
  Repeat2,
  RotateCcw,
  Sparkles,
  Tag,
  Truck,
  X,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { StatusSelector } from "@/components/create-item/status-selector"
import { CollectionFields } from "@/components/create-item/collection-fields"
import { WishlistFields } from "@/components/create-item/wishlist-fields"
import { WishlistEntrySelector } from "@/components/create-item/wishlist-entry-selector"
import {
  emptyTradeInterest,
  summarizeInterest,
  TradeInterestSection,
} from "@/components/create-item/trade-interest-section"
import {
  AutoGrowTextarea,
  CategorySelector,
  ConditionGradePicker,
  PhotoUploadSection,
  DEFAULT_SPEC_SCHEMA,
  SPEC_SCHEMA,
  type SpecField,
} from "@/components/create-listing-inline"
import type {
  ItemCollectionStatus,
  ItemSaleStatus,
  ItemTradeStatus,
  WishlistItemData,
} from "@/lib/types/item-status"

type Suggestion = { value: string; confidence: "high" | "medium" | "low"; accepted: boolean }

export interface MobileWizardProps {
  // Core fields
  images: string[]
  setImages: (imgs: string[]) => void
  category: string
  setCategory: (v: string) => void
  subcategory: string
  setSubcategory: (v: string) => void
  title: string
  setTitle: (v: string) => void
  subtitle: string
  setSubtitle: (v: string) => void
  description: string
  setDescription: (v: string) => void
  condition: string
  setCondition: (v: string) => void
  conditionGrade: "" | "new" | "used-as-new" | "used" | "used-as-is"
  setConditionGrade: (v: "" | "new" | "used-as-new" | "used" | "used-as-is") => void

  // Spec helpers
  getSpec: (key: string) => string
  setSpec: (key: string, v: string) => void

  // Status
  forSaleActive: boolean
  forTradeActive: boolean
  inCollectionActive: boolean
  isWishlistActive: boolean
  onForSaleChange: (a: boolean) => void
  onForTradeChange: (a: boolean) => void
  onInCollectionChange: (a: boolean) => void
  onWishlistChange: (a: boolean) => void
  /**
   * True once the user has chosen at least one status. Controls whether the
   * wizard renders the `MobileIntentScreen` (the big-button chooser) or goes
   * straight into the step flow. Managed by the parent in `create-listing-inline`
   * where `handleFor*Change` flip it to `true` on first select.
   */
  hasSelectedStatus: boolean

  // Sale/Trade/Collection/Wishlist data
  saleData: ItemSaleStatus
  setSaleData: React.Dispatch<React.SetStateAction<ItemSaleStatus>>
  tradeData: ItemTradeStatus
  setTradeData: React.Dispatch<React.SetStateAction<ItemTradeStatus>>
  collectionData: ItemCollectionStatus
  setCollectionData: React.Dispatch<React.SetStateAction<ItemCollectionStatus>>
  wishlistData: WishlistItemData
  setWishlistData: React.Dispatch<React.SetStateAction<WishlistItemData>>

  userCollections: Array<{ id: string; name: string; itemCount?: number }>

  // Wishlist entry method (URL vs manual)
  wishlistEntryMethod: "url" | "manual" | null
  setWishlistEntryMethod: (m: "url" | "manual" | null) => void
  onWishlistUrlProcessed: (data: {
    title: string
    subtitle?: string
    description?: string
    sourceUrl?: string
    specifications?: Record<string, string>
    imageUrl?: string
  }) => void

  // AI suggestions & assist
  suggestions: Record<string, Suggestion>
  onAcceptSuggestion: (field: string) => void
  onAcceptAllSuggestions: () => void
  hasPendingSuggestions: boolean
  /** Trigger the AI Assist enhancement run. */
  onEnhance: () => void
  /** True when the minimum inputs (photo + title + subtitle) are present. */
  canEnhance: boolean
  /** True while the enhancement request is in flight. */
  isEnhancing: boolean
  /** Error copy surfaced after a failed enhancement, if any. */
  enhanceError: string | null
  /** 0–100 progress toward unlocking AI Assist, derived from the requirements. */
  enhanceFillPercentage: number
  /** Individual requirements that gate AI Assist; used in the progress popover. */
  enhanceRequirements: { id: string; label: string; met: boolean; weight: number }[]

  // Publish
  onPublish: () => void
  canPublish: boolean
  missingRequirements: string[]
  /** True while the parent is running mandatory AI structuring + persisting
   *  the draft. Shows a spinner on the terminal "Add Item" button and
   *  blocks re-entry. */
  publishing?: boolean

  /**
   * Prototype-only: fills every field with sample data in one tap. When
   * supplied, the wizard surfaces a small "Autofill" pill in its header and
   * on the intent screen. Optional — production builds simply omit it.
   */
  onAutofill?: () => void

  // Username for the review preview
  sellerUsername: string
  sellerAvatarUrl?: string | null
}

/**
 * Total wizard steps.
 *
 * The flow has two shapes:
 *  - 5 steps for non-trade listings:
 *      Basics → Photos → Details → Terms → Review/Publish
 *  - 6 steps for For-Trade listings (the Trade Preferences screen is
 *    inserted *after* Review, matching the desktop "trade comes last"
 *    model established in the Publish Confirm Screen):
 *      Basics → Photos → Details → Terms → Review → Trade Preferences
 *
 * The value is computed per-render inside the component; this constant is
 * the BASE step count for the common case. Use `totalSteps` (local var)
 * in the component body instead of this constant for display.
 */
const BASE_TOTAL_STEPS = 5

/* -------------------------------------------------------------------------- */
/* Spec data                                                                  */
/*                                                                            */
/* Preset options per spec key. When a spec is active and has entries here,   */
/* the UI renders tap-to-select pills instead of a free-text input. Users can */
/* always switch to a custom text value via the "Custom" pill.                */
/* -------------------------------------------------------------------------- */
const SPEC_OPTIONS: Record<string, string[]> = {
  // Generic
  bodyType: ["Solid", "Semi-Hollow", "Hollow", "Chambered"],
  handedness: ["Right", "Left"],
  strings: ["4", "5", "6", "7", "8", "12"],
  color: ["Black", "White", "Natural", "Sunburst", "Red", "Blue", "Sparkle"],
  finish: ["Gloss", "Satin", "Matte", "Relic"],
  fretboard: ["Maple", "Rosewood", "Ebony", "Pau Ferro"],
  material: ["Wood", "Metal", "Plastic", "Composite"],
  actionType: ["Weighted", "Semi-weighted", "Synth-action"],
  connectivity: ["USB", "XLR", '1/4"', "MIDI", "Bluetooth"],
  shellMaterial: ["Maple", "Birch", "Mahogany", "Poplar"],
  type: ["Studio", "Stage", "Touring", "Vintage"],
  size: ["Small", "Medium", "Large"],
  // Subcategory-specific
  pickups: ["Single Coil", "Humbucker", "P90", "Active"],
  pickupConfig: ["HSS", "HSH", "SSS", "HH", "SS"],
  bridgeType: ["Tremolo", "Hardtail", "Floyd Rose", "Bigsby"],
  topWood: ["Spruce", "Cedar", "Mahogany", "Koa"],
  backWood: ["Rosewood", "Mahogany", "Maple", "Sapele"],
  cutaway: ["Yes", "No"],
  activePassive: ["Active", "Passive"],
  hammerAction: ["Weighted", "Semi-weighted", "Synth-action"],
  synthType: ["Analog", "Digital", "FM", "Wavetable", "Hybrid"],
  effectType: ["Overdrive", "Distortion", "Delay", "Reverb", "Chorus", "Fuzz"],
  powerSupply: ["9V", "12V", "18V", "Battery"],
  micType: ["Dynamic", "Condenser", "Ribbon", "USB"],
  polarPattern: ["Cardioid", "Omni", "Figure-8", "Shotgun"],
}

/**
 * Extra spec suggestions contributed by subcategory selection. These are
 * *optional* and appear as `+ Label` pills alongside the category's own
 * optional specs. Tapping a pill promotes the spec into an active field
 * complete with option pills (when available) or a plain text input.
 */
const SUBCATEGORY_SPEC_ADDITIONS: Record<string, SpecField[]> = {
  Electric: [
    { key: "pickups", label: "Pickups" },
    { key: "pickupConfig", label: "Pickup Config" },
    { key: "bridgeType", label: "Bridge" },
  ],
  Acoustic: [
    { key: "topWood", label: "Top Wood" },
    { key: "backWood", label: "Back Wood" },
    { key: "cutaway", label: "Cutaway" },
  ],
  Bass: [
    { key: "strings", label: "Strings" },
    { key: "activePassive", label: "Active/Passive" },
  ],
  "Stage Pianos": [{ key: "hammerAction", label: "Hammer Action" }],
  Synths: [
    { key: "synthType", label: "Synth Type" },
    { key: "voices", label: "Voices" },
  ],
  Pedals: [
    { key: "effectType", label: "Effect Type" },
    { key: "powerSupply", label: "Power Supply" },
  ],
  Microphones: [
    { key: "micType", label: "Mic Type" },
    { key: "polarPattern", label: "Polar Pattern" },
  ],
}

/* -------------------------------------------------------------------------- */
/* Step validation                                                            */
/*                                                                            */
/* Produces a list of required-field issues for the current step. Errors are  */
/* attached to a `fieldId` so the wizard can:                                 */
/*   - Disable the Next button via `aria-disabled` while any issue exists.    */
/*   - On a tap of the (aria-)disabled button, scroll to the first invalid    */
/*     field and display an inline error message below each one.              */
/*                                                                            */
/* Specifications are intentionally NEVER included in step issues — specs     */
/* stay optional everywhere in the flow.                                      */
/* -------------------------------------------------------------------------- */
type StepIssue = {
  /** Stable id used to look up the field ref for scroll-into-view. */
  fieldId: string
  /** Inline error message shown beneath the field. */
  message: string
}

function getStepIssues(step: number, props: MobileWizardProps): StepIssue[] {
  const issues: StepIssue[] = []

  if (step === 1) {
    // 1. Status — at least one selected
    const hasStatus =
      props.forSaleActive ||
      props.forTradeActive ||
      props.inCollectionActive ||
      props.isWishlistActive
    if (!hasStatus) {
      issues.push({ fieldId: "status", message: "Pick a status to continue" })
    }

    // Wishlist-by-URL still needs to pick an entry method before the rest of
    // the fields are even rendered, so skip category/title/price checks here.
    const wishlistAwaitingUrl =
      props.isWishlistActive && props.wishlistEntryMethod === null

    if (!wishlistAwaitingUrl) {
      // 2. Category (+ subcategory when the category has them)
      if (!props.category) {
        issues.push({ fieldId: "category", message: "Pick a category" })
      } else if (categoryHasSubcategories(props.category) && !props.subcategory) {
        issues.push({ fieldId: "category", message: "Pick a subcategory" })
      }

      // 3. Title — non-empty after trim
      if (!props.title.trim()) {
        issues.push({ fieldId: "title", message: "Title is required" })
      }

      // 4. Price — numeric and > 0, only when the listing is For Sale
      if (props.forSaleActive) {
        const price = props.saleData.price
        if (price === null || price === undefined || !(price > 0)) {
          issues.push({ fieldId: "price", message: "Enter a price greater than $0" })
        }
      }
    }
  }

  if (step === 2) {
    if (props.images.length === 0) {
      issues.push({ fieldId: "photos", message: "Add at least one photo" })
    }
  }

  if (step === 3) {
    const showCondition =
      props.forSaleActive || props.forTradeActive || props.inCollectionActive
    if (showCondition && !props.conditionGrade) {
      issues.push({
        fieldId: "conditionGrade",
        message: "Pick a condition grade",
      })
    }
    // Specs are never required — they are always optional.
  }

  if (step === 4) {
    if (props.forSaleActive) {
      if (props.saleData.paymentMethods.length === 0) {
        issues.push({ fieldId: "payment", message: "Pick a payment method" })
      }
      if (!props.saleData.localPickup && !props.saleData.shippingAvailable) {
        issues.push({
          fieldId: "logistics",
          message: "Enable pickup or shipping",
        })
      }
    }
    if (
      props.inCollectionActive &&
      !props.isWishlistActive &&
      !props.collectionData.collectionId
    ) {
      issues.push({ fieldId: "collection", message: "Choose a collection" })
    }
  }

  return issues
}

/** Categories with a non-empty subcategory list in CategorySelector. */
function categoryHasSubcategories(category: string): boolean {
  return [
    "Guitars",
    "Drums",
    "Keyboards",
    "Audio Equipment",
    "Accessories",
    "Other",
  ].includes(category)
}

export function MobileCreateListingWizard(props: MobileWizardProps) {
  const [step, setStep] = useState(1)

  const {
    forSaleActive,
    forTradeActive,
    inCollectionActive,
    isWishlistActive,
  } = props

  // Whether the current status selection produces any "terms" content in step 4
  const hasTermsContent = forSaleActive || forTradeActive || inCollectionActive || isWishlistActive

  // Condition only matters for items you own/list/trade — not pure wishlist entries.
  const showCondition = forSaleActive || forTradeActive || inCollectionActive

  const specSchema =
    (props.category && SPEC_SCHEMA[props.category]) || DEFAULT_SPEC_SCHEMA
  const allSpecs: (SpecField & { required: boolean })[] = [
    ...specSchema.required.map((s) => ({ ...s, required: true })),
    ...specSchema.optional.map((s) => ({ ...s, required: false })),
  ]

  /* --------------------------------------------------------------------- */
  /* Inline field validation                                               */
  /*                                                                       */
  /* Issues recompute on every render so the Next button's aria-disabled   */
  /* state and the inline error messages stay in sync with field edits.    */
  /* --------------------------------------------------------------------- */
  const stepIssues = useMemo(
    () => getStepIssues(step, props),
    // Depend on `step` + the whole props object — any upstream state change
    // re-renders us, so this memo is just a derived-value helper.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step, props],
  )

  // Per-step "the user tried to advance" flag. We only render error chrome
  // (red borders, inline messages) once the user has actually tried to move
  // forward — this avoids screaming at them while they're still typing.
  const [submittedSteps, setSubmittedSteps] = useState<Record<number, boolean>>({})
  const showErrors = !!submittedSteps[step] && stepIssues.length > 0

  // Clear the submitted flag once all issues resolve so the error state
  // silently lifts as the user fixes each field.
  useEffect(() => {
    if (submittedSteps[step] && stepIssues.length === 0) {
      setSubmittedSteps((prev) => {
        if (!prev[step]) return prev
        const next = { ...prev }
        delete next[step]
        return next
      })
    }
  }, [step, stepIssues.length, submittedSteps])

  // Lookup of fieldId → DOM node. Populated by <FieldAnchor> wrappers in each
  // step so we can scroll-into-view on a failed Next tap.
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({})
  const registerField = (id: string) => (el: HTMLElement | null) => {
    fieldRefs.current[id] = el
  }

  // Map from fieldId → error message for the current step. Only populated
  // once the user has attempted to advance. Passed down to each step so
  // individual inputs can render their inline message.
  const fieldErrors = useMemo<Record<string, string>>(() => {
    if (!showErrors) return {}
    const map: Record<string, string> = {}
    for (const issue of stepIssues) {
      if (!map[issue.fieldId]) map[issue.fieldId] = issue.message
    }
    return map
  }, [showErrors, stepIssues])

  const scrollToFirstInvalid = () => {
    if (stepIssues.length === 0) return
    const first = stepIssues[0]
    const node = fieldRefs.current[first.fieldId]
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  /* A Trade Preferences step is appended after Review only when the
   * listing is For Trade. Non-trade flows end at Step 5 (Review) exactly
   * as before, so the common case gets no extra screens. */
  const totalSteps = props.forTradeActive ? BASE_TOTAL_STEPS + 1 : BASE_TOTAL_STEPS

  const handleNextClick = () => {
    if (stepIssues.length > 0) {
      // Mark as submitted so errors render, then scroll to the first one.
      // We purposely don't advance — the button is visually disabled but
      // still receives the tap so this handler can run (aria-disabled
      // pattern, NOT native disabled).
      setSubmittedSteps((prev) => ({ ...prev, [step]: true }))
      // Allow the error DOM to mount before scrolling.
      requestAnimationFrame(() => scrollToFirstInvalid())
      return
    }
    setStep((s) => Math.min(totalSteps, s + 1))
  }

  const goBack = () => setStep((s) => Math.max(1, s - 1))

  const isLastStep = step === totalSteps
  /* Step 5 (Review) is now a *continue* step whenever Trade Preferences
   * follow. Its button label says "Add Item → Trade" so users understand
   * more is coming; see footer rendering below. */
  const isReviewStep = step === BASE_TOTAL_STEPS
  const isFirstStep = step === 1
  const nextDisabled = stepIssues.length > 0

  /* Step label list is derived so the header reflects the trade branch. */
  const stepLabels = props.forTradeActive
    ? ["Basics", "Photos", "Details", "Terms", "Review", "Trade Preferences"]
    : ["Basics", "Photos", "Details", "Terms", "Review"]

  /* --------------------------------------------------------------------- */
  /* Intent screen (Step 0)                                                */
  /*                                                                       */
  /* When the user hasn't picked a status yet, show a dedicated full-      */
  /* screen chooser. This segments the *very first* decision — what you    */
  /* want to do with this item — into its own low-cognitive-load surface   */
  /* so users don't land on a long form cold. Tapping a card flips the     */
  /* matching status via the existing `onXxxChange(true)` handlers, which  */
  /* also sets `hasSelectedStatus` upstream and transitions us into the    */
  /* regular step-1 view on the next render.                               */
  /* --------------------------------------------------------------------- */
  if (!props.hasSelectedStatus) {
    return (
      <MobileIntentScreen
        onAutofill={props.onAutofill}
        onPickForSale={() => props.onForSaleChange(true)}
        onPickForTrade={() => props.onForTradeChange(true)}
        onPickCollection={() => props.onInCollectionChange(true)}
        onPickWishlist={() => props.onWishlistChange(true)}
      />
    )
  }

  return (
    <div className="md:hidden fixed inset-0 z-40 flex flex-col bg-background">
      {/* Header with progress */}
      <header className="flex-shrink-0 border-b border-border bg-background">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="-ml-2 h-10 w-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground active:bg-muted transition-colors"
            aria-label="Close"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-sm font-medium text-foreground">
            {stepLabels[step - 1]}
          </div>
          <div className="flex items-center gap-2">
            {/* Prototype-only autofill affordance. The dashed border signals
                this is a demo action rather than a product feature. */}
            {props.onAutofill && (
              <button
                type="button"
                onClick={props.onAutofill}
                className="flex items-center gap-1 h-8 px-2.5 rounded-md border border-dashed border-border text-[11px] font-medium text-muted-foreground hover:text-foreground active:bg-muted transition-colors"
                aria-label="Fill all fields with sample data"
              >
                <Zap className="h-3 w-3" />
                Autofill
              </button>
            )}
            <div className="text-xs text-muted-foreground tabular-nums">
              {step}/{totalSteps}
            </div>
          </div>
        </div>
        <ProgressBar current={step} total={totalSteps} />
      </header>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto overscroll-contain">
        <div
          key={step}
          className="px-4 pt-4 pb-28 animate-in fade-in slide-in-from-right-4 duration-300 space-y-4"
        >
          {/* Pending suggestions banner — appears above step content on any step
              that exposes AI-suggestable fields, so the user can act on new
              suggestions as soon as they're generated. */}
          {props.hasPendingSuggestions && (step === 3 || step === 4) && (
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  AI suggested some details
                </p>
                <p className="text-xs text-muted-foreground">
                  Tap individual fields to accept, or use Accept All.
                </p>
              </div>
              <Button
                onClick={props.onAcceptAllSuggestions}
                size="sm"
                className="h-9 px-3 shrink-0"
              >
                Accept All
              </Button>
            </div>
          )}

          {step === 1 && (
            <StepBasics
              {...props}
              fieldErrors={fieldErrors}
              registerField={registerField}
            />
          )}
          {step === 2 && (
            <StepPhotos {...props} fieldErrors={fieldErrors} registerField={registerField} />
          )}
          {step === 3 && (
            <StepDetails
              {...props}
              showCondition={showCondition}
              allSpecs={allSpecs}
              fieldErrors={fieldErrors}
              registerField={registerField}
            />
          )}
          {step === 4 && (
            <StepTerms
              {...props}
              hasTermsContent={hasTermsContent}
              onJumpToStep={setStep}
              fieldErrors={fieldErrors}
              registerField={registerField}
            />
          )}
          {step === 5 && <StepReview {...props} onJumpToStep={setStep} />}
          {/* Step 6 — Trade Preferences (trade listings only).
              Mirrors the desktop Publish Confirm Screen's right column,
              so users learn a single pattern: author the listing first,
              then declare what they'd accept in trade, then publish. */}
          {step === 6 && props.forTradeActive && (
            <StepTradePreferences
              tradeData={props.tradeData}
              setTradeData={props.setTradeData}
            />
          )}
        </div>
      </main>

      {/* Bottom nav */}
      <footer
        className="flex-shrink-0 border-t border-border bg-card/95 backdrop-blur-sm"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          {!isFirstStep && (
            <Button
              variant="ghost"
              onClick={goBack}
              className="h-12 px-5 text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Button>
          )}
          {/* Final CTA language is unified with desktop.
              - Non-trade Review is the terminal step → "Add Item".
              - Trade Review continues into Trade Preferences → "Continue"
                (there's more authoring to do, not a publish yet).
              - Trade Preferences is the terminal step → "Add Item".
              This matches the desktop model where "Add Item" always means
              "finalize and publish this listing". */}
          {isLastStep ? (
            <Button
              onClick={props.onPublish}
              disabled={props.publishing}
              className="flex-1 h-12 text-base font-semibold"
            >
              {props.publishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Indexing…
                </>
              ) : (
                "Add Item"
              )}
            </Button>
          ) : isReviewStep && props.forTradeActive ? (
            <Button
              type="button"
              onClick={handleNextClick}
              className="flex-1 h-12 text-base font-semibold"
            >
              Continue
            </Button>
          ) : (
            // aria-disabled (not the native `disabled` attribute) so the tap
            // handler still fires while the button is visually disabled. This
            // lets us scroll to the first invalid field and raise inline
            // errors without the user having to interact with anything else.
            <Button
              type="button"
              onClick={handleNextClick}
              aria-disabled={nextDisabled}
              className={cn(
                "flex-1 h-12 text-base font-semibold",
                nextDisabled &&
                  "opacity-50 hover:bg-primary hover:text-primary-foreground",
              )}
            >
              Next
            </Button>
          )}
        </div>
        {isLastStep && !props.canPublish && props.missingRequirements.length > 0 && (
          <p className="px-4 pb-3 text-xs text-destructive leading-snug">
            Still needed: {props.missingRequirements.join(", ")}
          </p>
        )}
      </footer>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Progress bar                                                               */
/* -------------------------------------------------------------------------- */
function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = (current / total) * 100
  return (
    <div className="relative h-1 bg-muted">
      <div
        className="absolute inset-y-0 left-0 bg-primary transition-all duration-300 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* STEP 1 — Basics                                                            */
/* -------------------------------------------------------------------------- */
function StepBasics(
  props: MobileWizardProps & {
    fieldErrors: Record<string, string>
    registerField: (id: string) => (el: HTMLElement | null) => void
  },
) {
  const { fieldErrors, registerField } = props
  const statusError = fieldErrors.status
  const categoryError = fieldErrors.category
  const titleError = fieldErrors.title
  const priceError = fieldErrors.price

  return (
    // Section rhythm: space-y-7 gives each labeled group its own block.
    <div className="space-y-7">
      {/* Status — the primary choice is made on MobileIntentScreen, so here
          we relabel the block to emphasise that it's the *add more* surface.
          Users who want to list an item as e.g. For Sale AND In Collection
          toggle the additional pills here. */}
      <FieldBlock
        id="status"
        label="Listing as"
        error={statusError}
        registerField={registerField}
      >
        <StatusSelector
          size="lg"
          forSale={props.forSaleActive}
          forTrade={props.forTradeActive}
          inCollection={props.inCollectionActive}
          isWishlist={props.isWishlistActive}
          onForSaleChange={props.onForSaleChange}
          onForTradeChange={props.onForTradeChange}
          onInCollectionChange={props.onInCollectionChange}
          onWishlistChange={props.onWishlistChange}
        />
        <p className="mt-2 text-xs text-muted-foreground leading-snug">
          Tap to add or remove a status. At least one is required.
        </p>
      </FieldBlock>

      {/* Wishlist URL/manual gate — matches desktop behaviour */}
      {props.isWishlistActive && props.wishlistEntryMethod === null ? (
        <section>
          <SectionLabel>Entry</SectionLabel>
          <WishlistEntrySelector
            onMethodSelected={(m) => {
              props.setWishlistEntryMethod(m)
            }}
            onUrlProcessed={props.onWishlistUrlProcessed}
          />
        </section>
      ) : (
        <>
          <FieldBlock
            id="category"
            label="Category"
            error={categoryError}
            registerField={registerField}
          >
            <div
              className={cn(
                // Soft wrap so the error state visibly applies to the whole
                // compound selector, not just a single pill.
                categoryError && "rounded-lg ring-1 ring-destructive/60 -m-0.5 p-0.5",
              )}
            >
              <CategorySelector
                category={props.category}
                subcategory={props.subcategory}
                onCategoryChange={props.setCategory}
                onSubcategoryChange={props.setSubcategory}
                showLabel={false}
              />
            </div>
          </FieldBlock>

          <FieldBlock
            id="title"
            label="Title"
            error={titleError}
            registerField={registerField}
          >
            <div className="space-y-3">
              <Input
                value={props.title}
                onChange={(e) => props.setTitle(e.target.value)}
                placeholder="e.g. 1962 Fender Stratocaster"
                aria-invalid={!!titleError}
                className={cn(
                  "h-12 text-base",
                  titleError &&
                    "border-destructive focus-visible:ring-destructive/40",
                )}
              />
              {/* Subtitle is optional — visually separated from Title. */}
              <Input
                value={props.subtitle}
                onChange={(e) => props.setSubtitle(e.target.value)}
                placeholder="Subtitle (color, year, variant)"
                className="h-12 text-base text-muted-foreground"
              />
            </div>
          </FieldBlock>

          {props.forSaleActive && (
            <FieldBlock
              id="price"
              label="Price"
              error={priceError}
              registerField={registerField}
            >
              <div
                className={cn(
                  "bg-card border rounded-xl px-4 py-3 flex items-baseline gap-2",
                  priceError
                    ? "border-destructive ring-1 ring-destructive/40"
                    : "border-border",
                )}
              >
                <span className="text-3xl font-bold text-primary">$</span>
                <input
                  inputMode="decimal"
                  type="text"
                  value={props.saleData.price ?? ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "")
                    props.setSaleData((p) => ({
                      ...p,
                      price: val ? Number(val) : null,
                    }))
                  }}
                  placeholder="0"
                  aria-invalid={!!priceError}
                  className="bg-transparent outline-none text-3xl font-bold text-primary placeholder:text-primary/30 w-full"
                />
              </div>
            </FieldBlock>
          )}
        </>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* FieldBlock                                                                 */
/*                                                                            */
/* A labeled section with an optional inline error message. Registers the     */
/* wrapper element against the parent's fieldRefs map so the wizard can       */
/* scroll-into-view on a failed advance.                                      */
/* -------------------------------------------------------------------------- */
function FieldBlock({
  id,
  label,
  error,
  registerField,
  children,
}: {
  id: string
  label: string
  error?: string
  registerField: (id: string) => (el: HTMLElement | null) => void
  children: React.ReactNode
}) {
  return (
    <section ref={registerField(id)} data-field-id={id}>
      <SectionLabel>
        <span className={cn(error && "text-destructive")}>{label}</span>
      </SectionLabel>
      {children}
      {error && (
        <p
          className="mt-2 text-xs text-destructive leading-snug"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* STEP 2 — Photos                                                            */
/* -------------------------------------------------------------------------- */
function StepPhotos(
  props: MobileWizardProps & {
    fieldErrors: Record<string, string>
    registerField: (id: string) => (el: HTMLElement | null) => void
  },
) {
  const photosError = props.fieldErrors.photos
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Photos</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add up to 6 photos. First photo becomes the cover.
        </p>
      </div>
      <div
        ref={props.registerField("photos")}
        className={cn(
          "rounded-xl transition-shadow",
          photosError && "ring-1 ring-destructive/60 p-1 -m-1",
        )}
      >
        <PhotoUploadSection
          images={props.images}
          onImagesChange={props.setImages}
          isHighlighted={!!photosError}
        />
        {photosError && (
          <p
            className="mt-2 text-xs text-destructive leading-snug"
            role="alert"
            aria-live="polite"
          >
            {photosError}
          </p>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* STEP 3 — Details                                                           */
/* -------------------------------------------------------------------------- */
function StepDetails(
  props: MobileWizardProps & {
    showCondition: boolean
    allSpecs: (SpecField & { required: boolean })[]
    fieldErrors: Record<string, string>
    registerField: (id: string) => (el: HTMLElement | null) => void
  },
) {
  // Required specs for the current category — used to mark fields with a "*"
  // and to decide which pills must stay pinned as active fields.
  const specSchema =
    (props.category && SPEC_SCHEMA[props.category]) || DEFAULT_SPEC_SCHEMA
  const requiredSpecKeys = new Set(specSchema.required.map((s) => s.key))

  // Specs are always optional, so we never highlight them from validation
  // state. The empty set keeps the prop contract stable for MobileSpecsEditor.
  const specKeysToHighlight = new Set<string>()
  const conditionGradeError = props.fieldErrors.conditionGrade

  return (
    <div className="space-y-5">
      <AiAssistCard
        canEnhance={props.canEnhance}
        isEnhancing={props.isEnhancing}
        onEnhance={props.onEnhance}
        fillPercentage={props.enhanceFillPercentage}
        requirements={props.enhanceRequirements}
        enhanceError={props.enhanceError}
      />

      <section>
        <SectionLabel>Description</SectionLabel>
        <AutoGrowTextarea
          value={props.description}
          onChange={props.setDescription}
          placeholder="Describe your item in detail..."
          minRows={4}
          className="w-full bg-card rounded-xl border border-border px-4 py-3 text-base resize-none text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
        />
      </section>

      {props.showCondition && (
        <section
          ref={props.registerField("conditionGrade")}
          className={cn(
            "rounded-xl transition-shadow",
            conditionGradeError && "ring-1 ring-destructive/60 p-2 -m-2",
          )}
        >
          <SectionLabel>
            <span className={cn(conditionGradeError && "text-destructive")}>
              Condition
              <span
                className={cn(
                  "ml-1",
                  conditionGradeError ? "text-destructive" : "text-status-warning",
                )}
                aria-hidden="true"
              >
                *
              </span>
            </span>
          </SectionLabel>
          <div className="mb-3">
            <ConditionGradePicker
              value={props.conditionGrade}
              onChange={props.setConditionGrade}
            />
          </div>
          {conditionGradeError && (
            <p
              className="-mt-1 mb-3 text-xs text-destructive leading-snug"
              role="alert"
              aria-live="polite"
            >
              {conditionGradeError}
            </p>
          )}
          <AutoGrowTextarea
            value={props.condition}
            onChange={props.setCondition}
            placeholder={
              props.conditionGrade
                ? "Add notes on wear, packaging, quirks..."
                : "Pick a grade above, then add notes..."
            }
            minRows={3}
            className="w-full bg-card rounded-xl border border-border px-4 py-3 text-base resize-none text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
          />
        </section>
      )}

      {/* Specs — always optional, always collapsed by default. */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem
          value="specs"
          className="border border-border rounded-xl bg-card data-[state=open]:bg-card"
        >
          <AccordionTrigger className="px-4 py-4 hover:no-underline [&[data-state=open]>svg]:rotate-180">
            <div className="flex items-center justify-between w-full mr-3">
              <span className="text-base font-semibold">Specifications</span>
              <span className="text-xs text-muted-foreground font-normal">
                {countFilledSpecs(props.allSpecs, props.getSpec)}/{props.allSpecs.length}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-1">
            <MobileSpecsEditor
              category={props.category}
              subcategory={props.subcategory}
              getSpec={props.getSpec}
              setSpec={props.setSpec}
              suggestions={props.suggestions}
              onAcceptSuggestion={props.onAcceptSuggestion}
              requiredKeys={requiredSpecKeys}
              highlight={specKeysToHighlight}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

function countFilledSpecs(
  specs: (SpecField & { required: boolean })[],
  getSpec: (k: string) => string,
) {
  return specs.filter((s) => !!getSpec(s.key)).length
}

/* -------------------------------------------------------------------------- */
/* STEP 4 — Terms (accordions)                                                */
/* -------------------------------------------------------------------------- */
function StepTerms(
  props: MobileWizardProps & {
    hasTermsContent: boolean
    onJumpToStep: (s: number) => void
    fieldErrors: Record<string, string>
    registerField: (id: string) => (el: HTMLElement | null) => void
  },
) {
  const paymentMissing = !!props.fieldErrors.payment
  const logisticsMissing = !!props.fieldErrors.logistics
  const collectionMissing = !!props.fieldErrors.collection
  if (!props.hasTermsContent) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Terms</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Nothing to configure here — your item will be saved to your stuff but
            won&apos;t appear in the marketplace.
          </p>
        </div>
        <button
          type="button"
          onClick={() => props.onJumpToStep(1)}
          className="w-full bg-card rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
        >
          Set a status in Step 1 to configure payment, logistics, or collection details.
        </button>
      </div>
    )
  }

  const {
    forSaleActive,
    forTradeActive,
    inCollectionActive,
    isWishlistActive,
    saleData,
    tradeData,
    setSaleData,
    setTradeData,
  } = props

  const showSaleTrade = forSaleActive || forTradeActive
  // Sale and Trade share the same payment/logistics/return fields in the current
  // data model, so we render them once and sync both writers when active.
  const paymentMethods = forSaleActive ? saleData.paymentMethods : tradeData.paymentMethods
  const localPickup = forSaleActive ? saleData.localPickup : tradeData.localPickup
  const pickupZip = forSaleActive ? saleData.pickupZip : tradeData.pickupZip
  const shippingAvailable = forSaleActive
    ? saleData.shippingAvailable
    : tradeData.shippingAvailable
  const shippingCost = forSaleActive ? saleData.shippingCost : tradeData.shippingCost
  const returnPolicy = forSaleActive ? saleData.returnPolicy : tradeData.returnPolicy

  const updatePayment = (method: string, checked: boolean) => {
    const upd = (arr: string[]) =>
      checked ? [...arr, method] : arr.filter((m) => m !== method)
    if (forSaleActive) setSaleData((p) => ({ ...p, paymentMethods: upd(p.paymentMethods) }))
    if (forTradeActive) setTradeData((p) => ({ ...p, paymentMethods: upd(p.paymentMethods) }))
  }

  /* --------------------------------------------------------------------- */
  /* Summaries                                                             */
  /*                                                                       */
  /* Each accordion header renders a compact at-a-glance summary so users  */
  /* can review the whole Terms screen — and advance on Next — without     */
  /* expanding anything. Status dots signal intent:                        */
  /*   - "done"    = green, selection made                                 */
  /*   - "todo"    = destructive, required and empty                       */
  /*   - "empty"   = muted, optional and empty                             */
  /* --------------------------------------------------------------------- */
  const paymentSummary = (() => {
    if (paymentMethods.length === 0) {
      return { state: "todo" as const, text: "Pick at least one" }
    }
    // Abbreviate long method names so the summary fits on one line. The
    // full names remain visible once the user expands the panel.
    const abbrev = (m: string) =>
      m
        .replace("PayPal - Friends and Family", "PayPal F&F")
        .replace("PayPal - Goods and Services", "PayPal G&S")
    const head = paymentMethods.slice(0, 2).map(abbrev).join(" · ")
    const rest =
      paymentMethods.length > 2 ? ` +${paymentMethods.length - 2}` : ""
    return { state: "done" as const, text: head + rest }
  })()

  const logisticsSummary = (() => {
    const parts: string[] = []
    if (localPickup) parts.push(pickupZip ? `Pickup · ${pickupZip}` : "Pickup")
    if (shippingAvailable) {
      const cost =
        shippingCost === null || shippingCost === undefined
          ? ""
          : shippingCost === 0
            ? " · Free"
            : ` · $${shippingCost}`
      parts.push(`Ships${cost}`)
    }
    if (parts.length === 0) {
      return { state: "todo" as const, text: "Pickup or shipping" }
    }
    return { state: "done" as const, text: parts.join(" · ") }
  })()

  const returnSummary = returnPolicy
    ? { state: "done" as const, text: truncate(returnPolicy, 42) }
    : { state: "empty" as const, text: "No returns" }

  /* Trade summary used to live here for the in-Terms trade card. Trade
   * authoring has moved to its own Step 6, so summaries are no longer
   * needed at this level — the standalone step renders its own status. */

  const collectionSummary = (() => {
    const data = props.collectionData
    if (!data.collectionId) {
      return { state: "todo" as const, text: "Choose a collection" }
    }
    const name = props.userCollections.find((c) => c.id === data.collectionId)?.name
    return {
      state: "done" as const,
      text: name ?? "Collection selected",
    }
  })()

  const wishlistSummary = (() => {
    const data = props.wishlistData
    const bits: string[] = []
    if (data.targetPrice) bits.push(`Target $${data.targetPrice}`)
    if (data.notes?.trim()) bits.push("Notes")
    if (bits.length === 0) {
      return { state: "empty" as const, text: "Optional details" }
    }
    return { state: "done" as const, text: bits.join(" · ") }
  })()

  // Payment is the single most-authored field on this screen, so we open
  // it by default whenever it's relevant (any For Sale / For Trade flow).
  // When the listing is collection-only or wishlist-only the Payment card
  // isn't rendered at all, so we gracefully fall back to the first
  // visible card with outstanding required fields.
  const defaultOpenCard = showSaleTrade
    ? "payment"
    : logisticsMissing
      ? "logistics"
      : collectionMissing
        ? "collection"
        : undefined

  return (
    <div className="space-y-5">
      {/* The wizard header already labels this screen as "Terms"; a second
          heading + explanatory paragraph here was pure redundancy. Cards
          below are self-explanatory and the footer's Next button guides
          progression once required fields are filled. */}
      <Accordion
        type="single"
        collapsible
        defaultValue={defaultOpenCard}
        className="w-full flex flex-col gap-2.5"
      >
        {showSaleTrade && (
          <>
            <TermsCard
              value="payment"
              icon={CreditCard}
              title="Payment"
              summary={paymentSummary.text}
              state={paymentSummary.state}
              error={paymentMissing}
            >
              <div className="grid grid-cols-1 gap-1">
                {[
                  "Cash",
                  "PayPal - Friends and Family",
                  "PayPal - Goods and Services",
                  "Venmo",
                  "Cryptocurrency",
                  "Other",
                ].map((method) => {
                  const checked = paymentMethods.includes(method)
                  return (
                    // Full-row tap target — easier one-handed than a small
                    // checkbox. The label itself toggles, and the checkbox
                    // visual still provides the state affordance.
                    <label
                      key={method}
                      className={cn(
                        "flex items-center gap-3 min-h-12 px-2 -mx-2 rounded-lg cursor-pointer",
                        "transition-colors active:bg-muted/60",
                        checked && "bg-primary/5",
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(c) => updatePayment(method, !!c)}
                        className="h-5 w-5"
                      />
                      <span
                        className={cn(
                          "text-sm flex-1",
                          checked ? "text-foreground font-medium" : "text-muted-foreground",
                        )}
                      >
                        {method}
                      </span>
                    </label>
                  )
                })}
              </div>
            </TermsCard>

            <TermsCard
              value="logistics"
              icon={Truck}
              title="Logistics"
              summary={logisticsSummary.text}
              state={logisticsSummary.state}
              error={logisticsMissing}
            >
              <div className="space-y-3">
                <label
                  className={cn(
                    "flex items-center gap-3 min-h-12 px-2 -mx-2 rounded-lg cursor-pointer",
                    "transition-colors active:bg-muted/60",
                    localPickup && "bg-primary/5",
                  )}
                >
                  <Checkbox
                    checked={localPickup}
                    onCheckedChange={(c) => {
                      if (forSaleActive) setSaleData((p) => ({ ...p, localPickup: !!c }))
                      if (forTradeActive) setTradeData((p) => ({ ...p, localPickup: !!c }))
                    }}
                    className="h-5 w-5"
                  />
                  <span className="text-sm flex-1 font-medium">Local Pickup</span>
                </label>
                {localPickup && (
                  <div className="pl-8">
                    <label className="text-xs text-muted-foreground mb-1.5 block">Zip</label>
                    <Input
                      value={pickupZip || ""}
                      onChange={(e) => {
                        const v = e.target.value || null
                        if (forSaleActive) setSaleData((p) => ({ ...p, pickupZip: v }))
                        if (forTradeActive) setTradeData((p) => ({ ...p, pickupZip: v }))
                      }}
                      inputMode="numeric"
                      className="h-11 w-32 text-base"
                    />
                  </div>
                )}

                <label
                  className={cn(
                    "flex items-center gap-3 min-h-12 px-2 -mx-2 rounded-lg cursor-pointer",
                    "transition-colors active:bg-muted/60",
                    shippingAvailable && "bg-primary/5",
                  )}
                >
                  <Checkbox
                    checked={shippingAvailable}
                    onCheckedChange={(c) => {
                      if (forSaleActive) setSaleData((p) => ({ ...p, shippingAvailable: !!c }))
                      if (forTradeActive) setTradeData((p) => ({ ...p, shippingAvailable: !!c }))
                    }}
                    className="h-5 w-5"
                  />
                  <span className="text-sm flex-1 font-medium">Shipping</span>
                </label>
                {shippingAvailable && (
                  <div className="pl-8">
                    <label className="text-xs text-muted-foreground mb-1.5 block">Cost</label>
                    <div className="relative w-36">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        $
                      </span>
                      <Input
                        inputMode="decimal"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={shippingCost ?? ""}
                        onChange={(e) => {
                          const cost = e.target.value ? Number.parseFloat(e.target.value) : null
                          if (forSaleActive) setSaleData((p) => ({ ...p, shippingCost: cost }))
                          if (forTradeActive) setTradeData((p) => ({ ...p, shippingCost: cost }))
                        }}
                        className="h-11 pl-7 text-base"
                      />
                    </div>
                  </div>
                )}
              </div>
            </TermsCard>

            <TermsCard
              value="return"
              icon={RotateCcw}
              title="Return Policy"
              summary={returnSummary.text}
              state={returnSummary.state}
            >
              <AutoGrowTextarea
                value={returnPolicy || ""}
                onChange={(v) => {
                  const val = v || null
                  if (forSaleActive) setSaleData((p) => ({ ...p, returnPolicy: val }))
                  if (forTradeActive) setTradeData((p) => ({ ...p, returnPolicy: val }))
                }}
                placeholder="Describe your return policy, if any..."
                minRows={3}
                className="w-full bg-background rounded-lg border border-border px-3 py-2 text-sm resize-none text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </TermsCard>

            {/* Trade Preferences used to mount here as another Terms card.
                It has moved to its own dedicated Step 6 so authoring the
                listing and authoring trade expectations are clearly
                separated tasks in the flow. When this listing is For
                Trade, a small pointer is shown instead so users know the
                step is still coming. */}
            {forTradeActive && (
              <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 px-3.5 py-3 flex items-start gap-3">
                <Repeat2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground leading-tight">
                    Trade preferences come next
                  </p>
                  <p className="text-xs text-muted-foreground leading-snug mt-0.5">
                    After Review, you&apos;ll tell us what you&apos;d accept in trade.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {inCollectionActive && !isWishlistActive && (
          <TermsCard
            value="collection"
            icon={FolderOpen}
            title="Collection"
            summary={collectionSummary.text}
            state={collectionSummary.state}
            error={collectionMissing}
          >
            <CollectionFields
              data={props.collectionData}
              onChange={props.setCollectionData}
              isActive
              collections={props.userCollections}
            />
          </TermsCard>
        )}

        {isWishlistActive && (
          <TermsCard
            value="wishlist"
            icon={Heart}
            title="Wishlist Details"
            summary={wishlistSummary.text}
            state={wishlistSummary.state}
          >
            <WishlistFields
              data={props.wishlistData}
              onChange={props.setWishlistData}
              isActive
            />
          </TermsCard>
        )}
      </Accordion>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* TermsCard — accordion item with a rich summary row                         */
/*                                                                            */
/* The collapsed layout is intentionally information-dense: a colored icon    */
/* anchors the row, the title is the primary read, and the summary line       */
/* shows exactly what's selected so users can confirm or move on without      */
/* expanding. A small status dot + bar lift the whole card when a required    */
/* field is still outstanding.                                                */
/* -------------------------------------------------------------------------- */
function TermsCard({
  value,
  icon: Icon,
  title,
  summary,
  state,
  error,
  children,
}: {
  value: string
  icon: React.ElementType
  title: string
  summary: string
  state: "done" | "todo" | "empty"
  error?: boolean
  children: React.ReactNode
}) {
  // Status dot — tiny but high signal. Color is the only differentiator so
  // we keep the rest of the card neutral.
  const dotClass =
    state === "done"
      ? "bg-emerald-500"
      : state === "todo"
        ? "bg-destructive"
        : "bg-muted-foreground/40"

  return (
    <AccordionItem
      value={value}
      className={cn(
        "border rounded-xl bg-card overflow-hidden",
        // The subtle ring-on-error pattern matches the rest of the wizard
        // so validation state reads consistently across steps.
        error
          ? "border-destructive/60 ring-1 ring-destructive/30"
          : "border-border",
      )}
    >
      {/* Trigger height is bumped to min-h-16 (~64px) so it's comfortable
          one-handed. The whole row is tappable; the chevron is a hint,
          not the target. */}
      <AccordionTrigger className="px-3.5 py-3 min-h-16 hover:no-underline [&[data-state=open]>svg]:rotate-180 [&>svg]:ml-2">
        <div className="flex items-center gap-3 w-full min-w-0 text-left">
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg shrink-0",
              error ? "bg-destructive/10" : "bg-muted",
            )}
            aria-hidden="true"
          >
            <Icon
              className={cn(
                "h-5 w-5",
                error ? "text-destructive" : "text-foreground/70",
              )}
            />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full shrink-0",
                  dotClass,
                )}
                aria-hidden="true"
              />
              <span className="text-[15px] font-semibold text-foreground truncate">
                {title}
              </span>
            </div>
            {/* Summary line — the payoff of this redesign. Users can scan
                the whole Terms screen at a glance. */}
            <p
              className={cn(
                "text-xs mt-0.5 truncate font-normal",
                error
                  ? "text-destructive"
                  : state === "empty"
                    ? "text-muted-foreground/70"
                    : "text-muted-foreground",
              )}
            >
              {error && (
                <AlertCircle
                  className="inline-block h-3 w-3 mr-1 -mt-0.5 shrink-0"
                  aria-hidden="true"
                />
              )}
              {summary}
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-3.5 pb-4 pt-1">{children}</AccordionContent>
    </AccordionItem>
  )
}

/* -------------------------------------------------------------------------- */
/* STEP 5 — Review & Publish                                                  */
/*                                                                            */
/* This step is a *preview* of the published listing, not a form. The goal is */
/* for the user to see exactly what other collectors will see before hitting  */
/* the publish CTA. Each section has an inline "Edit" link that jumps back to */
/* the originating step.                                                      */
/* -------------------------------------------------------------------------- */
function StepReview(
  props: MobileWizardProps & { onJumpToStep: (s: number) => void },
) {
  const {
    title,
    subtitle,
    description,
    images,
    category,
    subcategory,
    conditionGrade,
    condition,
    forSaleActive,
    forTradeActive,
    inCollectionActive,
    isWishlistActive,
    saleData,
    tradeData,
    collectionData,
    wishlistData,
    userCollections,
    sellerUsername,
    sellerAvatarUrl,
  } = props

  const statusChips: { key: string; label: string; tone: string; Icon: React.ComponentType<{ className?: string }> }[] = []
  if (forSaleActive) {
    statusChips.push({
      key: "sale",
      label: "For Sale",
      tone: "bg-emerald-500/10 border-emerald-500/40 text-emerald-400",
      Icon: Tag,
    })
  }
  if (forTradeActive) {
    statusChips.push({
      key: "trade",
      label: "For Trade",
      tone: "bg-sky-500/10 border-sky-500/40 text-sky-400",
      Icon: Repeat2,
    })
  }
  if (inCollectionActive) {
    statusChips.push({
      key: "collection",
      label: "In Collection",
      tone: "bg-primary/10 border-primary/40 text-primary",
      Icon: FolderOpen,
    })
  }
  if (isWishlistActive) {
    statusChips.push({
      key: "wishlist",
      label: wishlistData.isPublic ? "Public wishlist" : "Private wishlist",
      tone: "bg-rose-500/10 border-rose-500/40 text-rose-400",
      Icon: Heart,
    })
  }

  const selectedCollection = userCollections.find((c) => c.id === collectionData.collectionId)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Review &amp; Publish</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s how your listing will appear to other collectors.
        </p>
      </div>

      {/* Listing preview card — mirrors marketplace card look */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {/* Hero image */}
        <div className="aspect-square bg-muted relative">
          {images[0] ? (
            <Image
              src={images[0]}
              alt={title || "Listing preview"}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
              No photo
            </div>
          )}
          {statusChips.length > 0 && (
            <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-1.5">
              {statusChips.map((c) => (
                <span
                  key={c.key}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border text-xs font-medium px-2.5 py-1 backdrop-blur-sm",
                    c.tone,
                  )}
                >
                  <c.Icon className="h-3.5 w-3.5" />
                  {c.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground text-base text-balance">
                {title || <span className="text-muted-foreground italic">No title</span>}
              </h3>
              {subtitle && (
                <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
              )}
            </div>
            {forSaleActive && saleData.price != null && (
              <div className="text-primary font-bold text-lg tabular-nums flex-shrink-0">
                ${saleData.price}
              </div>
            )}
          </div>
          {(category || subcategory) && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>{category}</span>
              {subcategory && (
                <>
                  <span>•</span>
                  <span>{subcategory}</span>
                </>
              )}
            </div>
          )}

          {/* Seller */}
          <div className="flex items-center gap-2 pt-2 mt-2 border-t border-border">
            <div className="h-6 w-6 rounded-full bg-muted overflow-hidden relative">
              {sellerAvatarUrl && (
                <Image
                  src={sellerAvatarUrl}
                  alt={sellerUsername}
                  fill
                  className="object-cover"
                  unoptimized
                />
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              by <span className="text-foreground">{sellerUsername}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Section summaries with edit jump links */}
      <SummarySection
        title="Basics"
        onEdit={() => props.onJumpToStep(1)}
        items={[
          { label: "Status", value: statusChips.map((c) => c.label).join(" · ") || "—" },
          { label: "Category", value: [category, subcategory].filter(Boolean).join(" · ") || "—" },
          { label: "Title", value: title || "—" },
          ...(subtitle ? [{ label: "Subtitle", value: subtitle }] : []),
          ...(forSaleActive
            ? [{ label: "Price", value: saleData.price != null ? `$${saleData.price}` : "—" }]
            : []),
        ]}
      />

      <SummarySection
        title="Photos"
        onEdit={() => props.onJumpToStep(2)}
        items={[
          {
            label: "Uploaded",
            value: images.length > 0 ? `${images.length} photo${images.length > 1 ? "s" : ""}` : "None",
          },
        ]}
      />

      <SummarySection
        title="Details"
        onEdit={() => props.onJumpToStep(3)}
        items={[
          { label: "Description", value: description ? truncate(description, 80) : "—" },
          ...(conditionGrade
            ? [{ label: "Condition", value: labelForGrade(conditionGrade) }]
            : []),
          ...(condition ? [{ label: "Condition notes", value: truncate(condition, 80) }] : []),
        ]}
      />

      {(forSaleActive || forTradeActive || inCollectionActive || isWishlistActive) && (
        <SummarySection
          title="Terms"
          onEdit={() => props.onJumpToStep(4)}
          items={[
            ...(forSaleActive || forTradeActive
              ? [
                  {
                    label: "Payment",
                    value:
                      (forSaleActive ? saleData.paymentMethods : tradeData.paymentMethods).length > 0
                        ? (forSaleActive
                            ? saleData.paymentMethods
                            : tradeData.paymentMethods
                          ).join(", ")
                        : "—",
                  },
                  {
                    label: "Logistics",
                    value:
                      [
                        (forSaleActive ? saleData.localPickup : tradeData.localPickup) && "Pickup",
                        (forSaleActive ? saleData.shippingAvailable : tradeData.shippingAvailable) &&
                          "Shipping",
                      ]
                        .filter(Boolean)
                        .join(" + ") || "—",
                  },
                ]
              : []),
            ...(forTradeActive
              ? (() => {
                  // Prefer the structured interest summary when we have one.
                  // Falls back to the legacy free-text `interests` field so
                  // existing records (or users who skip the structured
                  // section) still show up in the review summary.
                  const data = tradeData.interestsData
                  if (data) {
                    if (data.mode === "advanced" && data.advanced.length > 0) {
                      const joined = data.advanced
                        .map(summarizeInterest)
                        .filter(Boolean)
                        .join(" / ")
                      if (joined) {
                        return [
                          { label: "Trade interests", value: truncate(joined, 80) },
                        ]
                      }
                    }
                    if (data.simpleText.trim()) {
                      return [
                        {
                          label: "Trade interests",
                          value: truncate(data.simpleText.trim(), 80),
                        },
                      ]
                    }
                  }
                  if (tradeData.interests) {
                    return [
                      {
                        label: "Trade interests",
                        value: truncate(tradeData.interests, 80),
                      },
                    ]
                  }
                  return []
                })()
              : []),
            ...(inCollectionActive && selectedCollection
              ? [{ label: "Collection", value: selectedCollection.name }]
              : []),
            ...(isWishlistActive
              ? [
                  {
                    label: "Visibility",
                    value: wishlistData.isPublic ? "Public" : "Private",
                  },
                  ...(wishlistData.targetPrice != null
                    ? [{ label: "Target price", value: `$${wishlistData.targetPrice}` }]
                    : []),
                ]
              : []),
          ].filter((x) => x !== undefined && x !== null)}
        />
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* StepTradePreferences                                                       */
/*                                                                            */
/* The final screen of the For-Trade branch of the wizard. Hosts the          */
/* structured TradeInterestSection only — the previous Estimated Value input  */
/* was removed because it duplicated data the confirm-step preview already    */
/* shows, and the matching pipeline now derives value from the listing price  */
/* / structured interest ranges directly. Users land here after Review,       */
/* make one authoring pass, then tap "Add Item" in the footer to publish.    */
/* -------------------------------------------------------------------------- */
function StepTradePreferences({
  tradeData,
  setTradeData,
}: {
  tradeData: MobileWizardProps["tradeData"]
  setTradeData: MobileWizardProps["setTradeData"]
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Trade Interest</h2>
        <p className="text-sm text-muted-foreground mt-1 leading-snug text-pretty">
          Tell collectors what you&apos;d accept in trade. You can be loose
          (&ldquo;open to offers&rdquo;) or specific (brands, models, years).
        </p>
      </div>

      {/* Structured interest authoring — mounted self-contained (no `bare`)
          so it owns its own card chrome at this top level of the step. */}
      <TradeInterestSection
        value={tradeData.interestsData ?? emptyTradeInterest}
        onChange={(next) =>
          setTradeData((p) => ({ ...p, interestsData: next }))
        }
      />

      <p className="text-xs text-muted-foreground leading-relaxed px-1">
        Optional — you can skip this and add preferences later from the listing
        page. Tap <span className="font-semibold text-foreground">Add Item</span>{" "}
        below when you&apos;re ready.
      </p>
    </div>
  )
}

function SummarySection({
  title,
  items,
  onEdit,
}: {
  title: string
  items: Array<{ label: string; value: string } | undefined | null | false>
  onEdit: () => void
}) {
  const rows = items.filter(Boolean) as { label: string; value: string }[]
  return (
    <section className="bg-card rounded-xl border border-border overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <Pencil className="h-3 w-3" />
          Edit
        </button>
      </header>
      <dl className="px-4 py-2 divide-y divide-border">
        {rows.length === 0 ? (
          <div className="py-2 text-sm text-muted-foreground">—</div>
        ) : (
          rows.map((row) => (
            <div
              key={row.label}
              className="py-2.5 flex items-start gap-3 text-sm"
            >
              <dt className="flex-shrink-0 w-28 text-muted-foreground">{row.label}</dt>
              <dd className="flex-1 text-foreground text-pretty break-words">{row.value}</dd>
            </div>
          ))
        )}
      </dl>
    </section>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
      {children}
    </label>
  )
}

/* -------------------------------------------------------------------------- */
/* MobileIntentScreen                                                         */
/*                                                                            */
/* A dedicated "Choose what you want to do with your listing" surface that    */
/* precedes the wizard. Four large tappable cards — For Sale, For Trade,     */
/* Collection, Wishlist — each with an icon, a one-line description, and an  */
/* accent color matching the rest of the app's status palette.               */
/*                                                                            */
/* Goals:                                                                     */
/*  - Segment the first decision on its own screen so the user isn't faced   */
/*    with a long form cold.                                                  */
/*  - Thumb-friendly: full-width cards, ~72px tall, big type, clear targets. */
/*  - Non-exclusive: the footer note reminds users they can combine statuses */
/*    later from the Basics step.                                             */
/* -------------------------------------------------------------------------- */
function MobileIntentScreen({
  onPickForSale,
  onPickForTrade,
  onPickCollection,
  onPickWishlist,
  onAutofill,
}: {
  onPickForSale: () => void
  onPickForTrade: () => void
  onPickCollection: () => void
  onPickWishlist: () => void
  /** Prototype-only: see MobileWizardProps['onAutofill']. */
  onAutofill?: () => void
}) {
  // One row of config keeps every option visually consistent while still
  // letting each status carry its own brand accent.
  const options: Array<{
    key: "sale" | "trade" | "collection" | "wishlist"
    title: string
    description: string
    icon: React.ElementType
    // Tailwind class fragments. Split out so we can tint the icon tile and
    // the press/hover ring independently of the neutral card surface.
    iconBg: string
    iconColor: string
    hoverBorder: string
    activeRing: string
    onSelect: () => void
  }> = [
    {
      key: "sale",
      title: "For Sale",
      description: "Sell it to someone in the community",
      icon: DollarSign,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
      hoverBorder: "hover:border-emerald-500/60",
      activeRing: "active:ring-emerald-500/40",
      onSelect: onPickForSale,
    },
    {
      key: "trade",
      title: "For Trade",
      description: "Swap it for something you want",
      icon: ArrowLeftRight,
      iconBg: "bg-sky-500/10",
      iconColor: "text-sky-400",
      hoverBorder: "hover:border-sky-500/60",
      activeRing: "active:ring-sky-500/40",
      onSelect: onPickForTrade,
    },
    {
      key: "collection",
      title: "Collection",
      description: "Add to your private catalog",
      icon: FolderOpen,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      hoverBorder: "hover:border-primary/60",
      activeRing: "active:ring-primary/40",
      onSelect: onPickCollection,
    },
    {
      key: "wishlist",
      title: "Wishlist",
      description: "Track gear you're looking for",
      icon: Heart,
      iconBg: "bg-rose-500/10",
      iconColor: "text-rose-400",
      hoverBorder: "hover:border-rose-500/60",
      activeRing: "active:ring-rose-500/40",
      onSelect: onPickWishlist,
    },
  ]

  return (
    <div className="md:hidden fixed inset-0 z-40 flex flex-col bg-background">
      {/* Minimal header — just the escape hatch. No progress bar here since
          the user hasn't entered the stepper yet. */}
      <header className="flex-shrink-0 border-b border-border bg-background">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="-ml-2 h-10 w-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground active:bg-muted transition-colors"
            aria-label="Cancel"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="text-sm font-medium text-foreground">New Listing</div>
          {onAutofill ? (
            <button
              type="button"
              onClick={onAutofill}
              className="flex items-center gap-1 h-8 px-2.5 rounded-md border border-dashed border-border text-[11px] font-medium text-muted-foreground hover:text-foreground active:bg-muted transition-colors"
              aria-label="Fill all fields with sample data"
            >
              <Zap className="h-3 w-3" />
              Autofill
            </button>
          ) : (
            // Spacer keeps the title centered when autofill isn't supplied.
            <div className="w-10" aria-hidden="true" />
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-contain">
        <div
          className="px-4 pt-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-300"
          style={{ paddingBottom: "calc(2.5rem + env(safe-area-inset-bottom))" }}
        >
          {/* Hero copy — task-led, not product-led. */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-foreground text-pretty leading-tight">
              What do you want to do with this item?
            </h1>
            <p className="mt-2 text-sm text-muted-foreground text-pretty">
              Pick one to get started. You can always add another later.
            </p>
          </div>

          {/* Option cards — stacked, one-tap-per-row. Radio-group semantics
              give assistive tech a clear grouping even though tapping any
              option advances the flow immediately. */}
          <div className="flex flex-col gap-3" role="radiogroup" aria-label="Listing intent">
            {options.map((opt) => {
              const Icon = opt.icon
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={opt.onSelect}
                  role="radio"
                  aria-checked={false}
                  className={cn(
                    "group flex items-center gap-4 w-full text-left",
                    "rounded-2xl border border-border bg-card",
                    "px-4 py-4 min-h-[76px]",
                    "transition-[border-color,transform,box-shadow] duration-150",
                    "active:scale-[0.99] active:ring-2",
                    opt.hoverBorder,
                    opt.activeRing,
                  )}
                >
                  {/* Colored icon tile — the primary visual anchor for each
                      row. Sized at 48px so it reads immediately at arm's
                      length without dominating the card. */}
                  <span
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl shrink-0",
                      opt.iconBg,
                    )}
                    aria-hidden="true"
                  >
                    <Icon className={cn("h-6 w-6", opt.iconColor)} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-base font-semibold text-foreground">
                      {opt.title}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted-foreground leading-snug text-pretty">
                      {opt.description}
                    </span>
                  </span>
                  <ChevronRight
                    className="h-5 w-5 text-muted-foreground/60 shrink-0 transition-transform group-active:translate-x-0.5"
                    aria-hidden="true"
                  />
                </button>
              )
            })}
          </div>

          {/* Soft reassurance that this isn't a one-way door. Keeps the
              primary decision feeling low-stakes. */}
          <p className="mt-6 text-xs text-muted-foreground text-center leading-relaxed">
            Listing statuses aren't exclusive — an item can be
            <br className="hidden sm:inline" /> for sale, for trade, and in your collection all at once.
          </p>
        </div>
      </main>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* AI Assist — compact, thumb-friendly CTA that mirrors the desktop behavior  */
/* but lives inside the wizard's content area so it's discoverable on mobile. */
/*                                                                            */
/* Two visual states:                                                         */
/*  - Locked: the requirements aren't met yet. We show a progress fill that   */
/*    tracks photo/title/subtitle completion, plus a checklist underneath so  */
/*    the user knows exactly what to add next.                                */
/*  - Unlocked: full-width gold CTA that runs the enhancement, with a spinner */
/*    during the request.                                                     */
/* -------------------------------------------------------------------------- */
function AiAssistCard({
  canEnhance,
  isEnhancing,
  onEnhance,
  fillPercentage,
  requirements,
  enhanceError,
}: {
  canEnhance: boolean
  isEnhancing: boolean
  onEnhance: () => void
  fillPercentage: number
  requirements: { id: string; label: string; met: boolean; weight: number }[]
  enhanceError: string | null
}) {
  const locked = !canEnhance

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border transition-colors",
        locked
          ? "border-border bg-card"
          : "border-primary/50 bg-primary/5",
      )}
    >
      {/* Progress fill behind the button when locked — visualises how close
          the user is to unlocking the feature without needing a separate bar. */}
      {locked && fillPercentage > 0 && (
        <div
          className="absolute inset-y-0 left-0 bg-primary/10 transition-all duration-500 ease-out pointer-events-none"
          style={{ width: `${fillPercentage}%` }}
          aria-hidden="true"
        />
      )}

      <button
        type="button"
        onClick={onEnhance}
        disabled={locked || isEnhancing}
        className={cn(
          "relative z-10 w-full flex items-center gap-3 px-4 py-3.5 text-left",
          "disabled:cursor-not-allowed",
          !locked && "active:bg-primary/10",
        )}
      >
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg shrink-0",
            locked ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary",
          )}
        >
          {isEnhancing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
        </span>
        <span className="flex-1 min-w-0">
          <span
            className={cn(
              "block text-sm font-semibold",
              locked ? "text-foreground" : "text-primary",
            )}
          >
            {isEnhancing ? "Enhancing your listing…" : "AI Assist"}
          </span>
          <span className="block text-xs text-muted-foreground">
            {locked
              ? "Auto-fill description, condition, and specs"
              : "Tap to auto-fill description, condition, and specs"}
          </span>
        </span>
      </button>

      {/* Requirement checklist — only shown when locked. Helps the user see
          exactly which piece is missing so they can jump back a step. */}
      {locked && (
        <div className="relative z-10 border-t border-border/60 px-4 py-2.5 bg-background/40">
          <ul className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {requirements.map(({ id, label, met }) => (
              <li key={id} className="flex items-center gap-1.5 text-xs">
                <Check
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    met ? "text-primary" : "text-muted-foreground/50",
                  )}
                />
                <span
                  className={cn(
                    met ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {enhanceError && (
        <p className="relative z-10 px-4 pb-3 text-xs text-destructive">
          {enhanceError}
        </p>
      )}
    </div>
  )
}

function truncate(s: string, n: number) {
  if (s.length <= n) return s
  return s.slice(0, n - 1).trimEnd() + "…"
}

function labelForGrade(v: "new" | "used-as-new" | "used" | "used-as-is" | "") {
  switch (v) {
    case "new":
      return "New"
    case "used-as-new":
      return "Used – As New"
    case "used":
      return "Used"
    case "used-as-is":
      return "Used – As Is"
    default:
      return "—"
  }
}

/* -------------------------------------------------------------------------- */
/* MobileSpecsEditor                                                          */
/*                                                                            */
/* Pill-first, mobile-native replacement for the desktop InlineSpecInput grid.*/
/* Active specs (required, already-filled, user-promoted, or AI-suggested)    */
/* render as individual field rows with tap-to-select option pills. Remaining */
/* suggested specs from the category + subcategory schemas render as compact  */
/* `+ Label` pills below, plus a `+ Custom` pill for arbitrary user entries.  */
/* -------------------------------------------------------------------------- */
function MobileSpecsEditor({
  category,
  subcategory,
  getSpec,
  setSpec,
  suggestions,
  onAcceptSuggestion,
  requiredKeys,
  highlight,
}: {
  category: string
  subcategory: string
  getSpec: (k: string) => string
  setSpec: (k: string, v: string) => void
  suggestions: Record<string, Suggestion>
  onAcceptSuggestion: (k: string) => void
  requiredKeys: Set<string>
  /** Keys to draw with a warning ring after a failed advance attempt. */
  highlight: Set<string>
}) {
  const specSchema = (category && SPEC_SCHEMA[category]) || DEFAULT_SPEC_SCHEMA
  const subcatAdditions = subcategory
    ? SUBCATEGORY_SPEC_ADDITIONS[subcategory] ?? []
    : []

  // Deduped canonical list of known specs for this category+subcategory.
  const knownSpecs: SpecField[] = useMemo(() => {
    const seen = new Set<string>()
    const result: SpecField[] = []
    for (const s of [
      ...specSchema.required,
      ...specSchema.optional,
      ...subcatAdditions,
    ]) {
      if (seen.has(s.key)) continue
      seen.add(s.key)
      result.push(s)
    }
    return result
  }, [specSchema, subcatAdditions])

  // Track which optional specs the user has explicitly tapped to add, so the
  // field stays visible even if they clear the value.
  const [promoted, setPromoted] = useState<Set<string>>(new Set())
  // Custom specs created via the "+ Custom" pill — stored locally since they
  // don't live in the canonical schema.
  const [customSpecs, setCustomSpecs] = useState<SpecField[]>([])
  const [customDraftLabel, setCustomDraftLabel] = useState<string | null>(null)

  const isActive = (key: string) =>
    requiredKeys.has(key) ||
    !!getSpec(key) ||
    promoted.has(key) ||
    (suggestions[key] && !suggestions[key].accepted)

  const activeSpecs: SpecField[] = [
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

  const commitCustomDraft = () => {
    const label = (customDraftLabel || "").trim()
    if (!label) {
      setCustomDraftLabel(null)
      return
    }
    const key = `custom.${label.toLowerCase().replace(/\s+/g, "_")}`
    // Avoid duplicate custom keys — if one exists, just focus it instead.
    if (customSpecs.some((c) => c.key === key) || knownSpecs.some((c) => c.key === key)) {
      setCustomDraftLabel(null)
      return
    }
    setCustomSpecs((prev) => [...prev, { key, label }])
    setCustomDraftLabel(null)
  }

  return (
    <div className="space-y-4">
      {activeSpecs.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          No specs yet — tap a suggestion below to add one.
        </p>
      ) : (
        <div className="space-y-3">
          {activeSpecs.map((spec) => (
            <SpecFieldRow
              key={spec.key}
              spec={spec}
              value={getSpec(spec.key)}
              onChange={(v) => setSpec(spec.key, v)}
              isRequired={requiredKeys.has(spec.key)}
              highlight={highlight.has(spec.key)}
              suggestion={suggestions[spec.key]}
              onAcceptSuggestion={() => onAcceptSuggestion(spec.key)}
              onRemove={!requiredKeys.has(spec.key) ? () => removeSpec(spec.key) : undefined}
            />
          ))}
        </div>
      )}

      {/* Suggestion pills + custom entry */}
      <div className="pt-3 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            Add more
          </p>
          {subcategory && subcatAdditions.length > 0 && (
            <span className="text-[11px] text-primary/80">
              Relevant to {subcategory}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {suggestedSpecs.map((spec) => {
            const isSubcatSpec = subcatAdditions.some((s) => s.key === spec.key)
            return (
              <button
                key={spec.key}
                type="button"
                onClick={() =>
                  setPromoted((p) => {
                    const next = new Set(p)
                    next.add(spec.key)
                    return next
                  })
                }
                className={cn(
                  "inline-flex items-center gap-1.5 h-9 px-3 rounded-full border text-sm",
                  "transition-colors active:scale-95",
                  isSubcatSpec
                    ? "border-primary/40 text-primary bg-primary/5 hover:bg-primary/10"
                    : "border-border text-foreground bg-background hover:border-primary/40",
                )}
              >
                <Plus className="h-3.5 w-3.5" />
                {spec.label}
              </button>
            )
          })}

          {customDraftLabel === null ? (
            <button
              type="button"
              onClick={() => setCustomDraftLabel("")}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              Custom
            </button>
          ) : null}
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
              className="h-11 text-base flex-1"
            />
            <Button
              size="sm"
              onClick={commitCustomDraft}
              disabled={!customDraftLabel.trim()}
              className="h-11 px-4"
            >
              Add
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCustomDraftLabel(null)}
              className="h-11 px-2 text-muted-foreground"
              aria-label="Cancel custom spec"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* SpecFieldRow                                                               */
/*                                                                            */
/* Renders a single active spec. Behaviour depends on whether the spec key    */
/* has preset options defined in SPEC_OPTIONS:                                */
/*   - With presets: horizontal wrap of pill options + a "Custom" fallback    */
/*     that toggles a text input, so users can always override.               */
/*   - Without presets (or in custom mode): a plain text input.               */
/* When the parent has a pending AI suggestion for this key, the row shows a  */
/* compact suggestion banner with a one-tap Accept action.                    */
/* -------------------------------------------------------------------------- */
function SpecFieldRow({
  spec,
  value,
  onChange,
  isRequired,
  highlight,
  suggestion,
  onAcceptSuggestion,
  onRemove,
}: {
  spec: SpecField
  value: string
  onChange: (v: string) => void
  isRequired: boolean
  highlight: boolean
  suggestion?: Suggestion
  onAcceptSuggestion: () => void
  onRemove?: () => void
}) {
  const options = SPEC_OPTIONS[spec.key] ?? []
  const hasOptions = options.length > 0
  const valueIsCustom = !!value && hasOptions && !options.includes(value)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const showCustom = !hasOptions || showCustomInput || valueIsCustom

  const pendingSuggestion = suggestion && !suggestion.accepted && !value

  return (
    <div
      className={cn(
        "rounded-xl border p-3 transition-colors",
        highlight
          ? "border-status-warning ring-2 ring-status-warning/30 bg-status-warning/5"
          : "border-border bg-background",
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <label className="text-sm font-medium text-foreground truncate">
            {spec.label}
          </label>
          {isRequired && (
            <span
              className="text-xs text-status-warning font-semibold"
              aria-label="Required"
            >
              *
            </span>
          )}
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 -mr-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md"
            aria-label={`Remove ${spec.label}`}
          >
            Remove
          </button>
        )}
      </div>

      {pendingSuggestion ? (
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 bg-primary/5 rounded-md border border-primary/20 px-3 py-2 text-foreground/80 italic text-sm truncate">
            {suggestion.value}
          </div>
          <button
            type="button"
            onClick={onAcceptSuggestion}
            className="shrink-0 inline-flex items-center gap-1 h-9 px-3 rounded-md bg-primary/20 hover:bg-primary/30 text-primary font-medium text-xs"
          >
            <Check className="h-3.5 w-3.5" />
            Accept
          </button>
        </div>
      ) : hasOptions && !showCustom ? (
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => {
            const selected = value === opt
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(selected ? "" : opt)}
                className={cn(
                  "inline-flex items-center justify-center h-9 px-3 rounded-full border text-sm",
                  "transition-colors active:scale-95",
                  selected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-foreground hover:border-primary/40",
                )}
              >
                {opt}
              </button>
            )
          })}
          <button
            type="button"
            onClick={() => setShowCustomInput(true)}
            className="inline-flex items-center gap-1 h-9 px-3 rounded-full border border-dashed border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pencil className="h-3 w-3" />
            Custom
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            // When the user taps "Custom" on a preset row, autoFocus drops the
            // caret straight into the field so they can start typing with no
            // extra tap. On initial mount for free-text specs we skip it so
            // the keyboard doesn't pop up unexpectedly.
            autoFocus={showCustomInput}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${spec.label.toLowerCase()}`}
            className="h-11 text-base flex-1"
          />
          {hasOptions && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCustomInput(false)
                onChange("")
              }}
              className="h-11 px-3 text-xs text-muted-foreground"
            >
              Presets
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

