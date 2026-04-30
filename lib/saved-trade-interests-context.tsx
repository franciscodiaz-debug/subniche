"use client"

/**
 * Saved Trade Interests — shared mock state.
 *
 * A Trade Interest is a REUSABLE object, independent of any specific listing.
 * Users author them once, then apply the same interest to multiple listings.
 * Two surfaces consume this store:
 *
 *   1. <TradeInterestManager /> — CRUD surface opened from the Trade tab.
 *   2. <TradeInterestSection /> — the editor panel embedded in Create Listing,
 *      which lets the user APPLY a saved interest to the listing being edited
 *      (or create a one-off that optionally gets saved via "Save as…").
 *
 * Why context and not prop-drilling: both surfaces can be open simultaneously
 * (manager modal over a listing editor), and mutations on one surface need to
 * reflect on the other without the parent re-wiring callbacks.
 *
 * Why state (not persistence): this is a prototype. All mutations live in
 * memory for the session — matches the rest of the project's mock-data
 * posture. A real backend swap would only need to change this provider's
 * internals; consumers stay untouched.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface SavedTradeInterest {
  id: string
  /** User-facing label, e.g. "Acoustic upgrade". Required — that's what
   *  distinguishes a saved interest from an inline one-off. */
  name: string
  /**
   * Authoring mode, mirroring the Create Listing → Trade Interest section.
   * `simple` means the user typed a free-text description; `advanced` means
   * they filled out the structured fields below. The mode is the source of
   * truth — consumers can ignore the other branch's fields.
   *
   * Both branches are kept in state (not wiped on toggle) so a user can
   * bounce between modes without losing work, matching the listing-editor
   * behavior.
   */
  mode: "simple" | "advanced"
  /** Free-text description, used when `mode === "simple"`. 140-char soft cap
   *  enforced by the editor UI. */
  simpleText: string
  category: string
  subcategory: string
  brand: string
  model: string
  /** One of the TRADE_CONDITIONS values, or "" for "Any". */
  condition: string
  /** Strings so the field can be cleared; coerced to numbers downstream. */
  valueMin: string
  valueMax: string
  specs: Record<string, string>
  notes: string
  /** Listing IDs where this interest is currently applied. Drives the
   *  "Applied to X listings" affordance and de-duplication in matchers. */
  appliedTo: string[]
}

interface SavedTradeInterestsContextValue {
  interests: SavedTradeInterest[]
  /** Create a new saved interest. Returns the created record (with id). */
  create: (
    /* Every field except identity is optional here so callers (e.g. the
     * "+ New" action on the manager) can spawn an interest shell with nothing
     * but a blinking name field. Missing fields are backfilled with empty
     * defaults so the editor never has to null-check. */
    data?: Partial<Omit<SavedTradeInterest, "id">>,
  ) => SavedTradeInterest
  update: (id: string, patch: Partial<Omit<SavedTradeInterest, "id">>) => void
  remove: (id: string) => void
  /** Add the listing ID to `appliedTo` if not already present. No-op otherwise. */
  applyToListing: (interestId: string, listingId: string) => void
  unapplyFromListing: (interestId: string, listingId: string) => void
  /** Convenience reads used by the manager and trade-item selector. */
  getInterestsAppliedTo: (listingId: string) => SavedTradeInterest[]
  getInterestCountFor: (listingId: string) => number
}

// -----------------------------------------------------------------------------
// Seed
// -----------------------------------------------------------------------------

/**
 * Prototype-friendly seed. IDs mirror `myTradeableItems` from market-data.ts so
 * "Applied to X listings" has something non-zero to render on mount.
 *
 * Convention: an interest with `appliedTo` covering every entry in
 * `myTradeableItems` (currently my-1..my-4) is treated as GLOBAL by
 * `isGlobalInterest()` in the view layer. The first four entries below are
 * intentionally global so the "Global" section has scannable content out of
 * the box; the trailing entries demonstrate partial reach and unbound
 * templates so each bucket has representative data on first paint.
 */
const ALL_MY_ITEMS = ["my-1", "my-2", "my-3", "my-4"]

const DEFAULT_SEED: SavedTradeInterest[] = [
  /* ---------- Global (applied to every listing) -------------------------- */
  {
    id: "sti_premium_electrics",
    name: "Premium electric guitars",
    mode: "advanced",
    simpleText: "",
    category: "Electric Guitars",
    subcategory: "Solid Body",
    brand: "Gibson",
    model: "",
    condition: "Excellent",
    valueMin: "2500",
    valueMax: "6000",
    specs: { era: "1990–present", pickups: "Humbucker" },
    notes: "Gibson, Fender Custom Shop, or PRS Core. No relics.",
    appliedTo: [...ALL_MY_ITEMS],
  },
  {
    id: "sti_vintage_tube_amps",
    name: "Vintage tube amplifiers",
    mode: "advanced",
    simpleText: "",
    category: "Amplifiers",
    subcategory: "Tube Combos",
    brand: "",
    model: "",
    condition: "Good",
    valueMin: "1200",
    valueMax: "4500",
    specs: { wattage: "15-50W", era: "1965–1979" },
    notes: "Pre-CBS Fender, plexi-era Marshall, AC-series Vox.",
    appliedTo: [...ALL_MY_ITEMS],
  },
  {
    id: "sti_pro_studio_gear",
    name: "Pro studio gear",
    mode: "simple",
    simpleText:
      "Audio interfaces, monitors, and outboard from UAD, Apollo, Genelec, or Neumann. Mint or excellent only.",
    category: "Pro Audio",
    subcategory: "",
    brand: "",
    model: "",
    condition: "Excellent",
    valueMin: "500",
    valueMax: "5000",
    specs: {},
    notes: "Studio interfaces, monitors, or outboard. Mint/excellent only.",
    appliedTo: [...ALL_MY_ITEMS],
  },
  {
    id: "sti_rare_effects_pedals",
    name: "Rare effects pedals",
    mode: "simple",
    simpleText:
      "Discontinued or limited-run pedals — especially Klon, EHX Russian-era Big Muffs, and early-2000s Boss waza-craft prototypes.",
    category: "Effects Pedals",
    subcategory: "",
    brand: "",
    model: "",
    condition: "Good",
    valueMin: "150",
    valueMax: "3000",
    specs: {},
    notes: "Discontinued / limited-run only. Open to trades up to $3k.",
    appliedTo: [...ALL_MY_ITEMS],
  },

  /* ---------- Partial reach --------------------------------------------- */
  {
    id: "sti_acoustic_upgrade",
    name: "Acoustic upgrade",
    mode: "advanced",
    simpleText: "",
    category: "Acoustic Guitars",
    subcategory: "Dreadnought",
    brand: "Martin",
    model: "D-28",
    condition: "Good",
    valueMin: "1800",
    valueMax: "3500",
    specs: { bracing: "Scalloped X", tonewood: "Rosewood" },
    notes: "Prefer 2015+. Open to HD-28 variants.",
    appliedTo: ["my-1", "my-3"],
  },
  {
    id: "sti_vintage_tube_combo",
    name: "Vintage tube combo",
    mode: "advanced",
    simpleText: "",
    category: "Amplifiers",
    subcategory: "Tube Combos",
    brand: "Fender",
    model: "",
    condition: "Good",
    valueMin: "800",
    valueMax: "2500",
    specs: { wattage: "15-40W" },
    notes: "60s/70s Fender or Vox. No master volume preferred.",
    appliedTo: ["my-1"],
  },

  /* ---------- Templates (unbound) --------------------------------------- */
  {
    id: "sti_boutique_pedals",
    name: "Boutique pedals",
    mode: "simple",
    simpleText:
      "Any flagship reverb or delay from Strymon, Eventide, or Chase Bliss. $200–$600 range, near-mint only.",
    category: "Effects Pedals",
    subcategory: "Reverb",
    brand: "",
    model: "",
    condition: "Mint",
    valueMin: "200",
    valueMax: "600",
    specs: {},
    notes: "Strymon, Eventide, Chase Bliss — any flagship reverb/delay.",
    appliedTo: [],
  },
]

// -----------------------------------------------------------------------------
// ID generator
// -----------------------------------------------------------------------------

let idCounter = 0
function makeInterestId(): string {
  idCounter += 1
  return `sti_${Date.now().toString(36)}_${idCounter.toString(36)}`
}

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const SavedTradeInterestsContext =
  createContext<SavedTradeInterestsContextValue | null>(null)

export function SavedTradeInterestsProvider({
  children,
  initial = DEFAULT_SEED,
}: {
  children: ReactNode
  initial?: SavedTradeInterest[]
}) {
  const [interests, setInterests] = useState<SavedTradeInterest[]>(initial)

  const create = useCallback<SavedTradeInterestsContextValue["create"]>(
    (data) => {
      /* Build a fully-populated record: id + sensible defaults for every
       * optional field. This keeps the editor code path null-free — it can
       * always just read/write any field. */
      const next: SavedTradeInterest = {
        id: makeInterestId(),
        name: "",
        mode: "advanced",
        simpleText: "",
        category: "",
        subcategory: "",
        brand: "",
        model: "",
        condition: "",
        valueMin: "",
        valueMax: "",
        specs: {},
        notes: "",
        appliedTo: [],
        ...(data ?? {}),
      }
      setInterests((prev) => [...prev, next])
      return next
    },
    [],
  )

  const update = useCallback<SavedTradeInterestsContextValue["update"]>(
    (id, patch) => {
      setInterests((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      )
    },
    [],
  )

  const remove = useCallback<SavedTradeInterestsContextValue["remove"]>(
    (id) => {
      setInterests((prev) => prev.filter((item) => item.id !== id))
    },
    [],
  )

  const applyToListing = useCallback<
    SavedTradeInterestsContextValue["applyToListing"]
  >((interestId, listingId) => {
    setInterests((prev) =>
      prev.map((item) => {
        if (item.id !== interestId) return item
        if (item.appliedTo.includes(listingId)) return item
        return { ...item, appliedTo: [...item.appliedTo, listingId] }
      }),
    )
  }, [])

  const unapplyFromListing = useCallback<
    SavedTradeInterestsContextValue["unapplyFromListing"]
  >((interestId, listingId) => {
    setInterests((prev) =>
      prev.map((item) =>
        item.id === interestId
          ? {
              ...item,
              appliedTo: item.appliedTo.filter((id) => id !== listingId),
            }
          : item,
      ),
    )
  }, [])

  /* `interests` is the dependency behind the reads below — memoize off it so
   * selector callsites (e.g. the item selector) don't re-render on every
   * unrelated provider update. */
  const getInterestsAppliedTo = useCallback(
    (listingId: string) =>
      interests.filter((item) => item.appliedTo.includes(listingId)),
    [interests],
  )

  const getInterestCountFor = useCallback(
    (listingId: string) =>
      interests.reduce(
        (count, item) => count + (item.appliedTo.includes(listingId) ? 1 : 0),
        0,
      ),
    [interests],
  )

  const value = useMemo<SavedTradeInterestsContextValue>(
    () => ({
      interests,
      create,
      update,
      remove,
      applyToListing,
      unapplyFromListing,
      getInterestsAppliedTo,
      getInterestCountFor,
    }),
    [
      interests,
      create,
      update,
      remove,
      applyToListing,
      unapplyFromListing,
      getInterestsAppliedTo,
      getInterestCountFor,
    ],
  )

  return (
    <SavedTradeInterestsContext.Provider value={value}>
      {children}
    </SavedTradeInterestsContext.Provider>
  )
}

export function useSavedTradeInterests(): SavedTradeInterestsContextValue {
  const ctx = useContext(SavedTradeInterestsContext)
  if (!ctx) {
    throw new Error(
      "useSavedTradeInterests must be used within <SavedTradeInterestsProvider>",
    )
  }
  return ctx
}

// -----------------------------------------------------------------------------
// Display helpers
// -----------------------------------------------------------------------------

/**
 * Compact label for a saved interest — used in dropdown items and chips.
 * Ordering: `Brand Model` if both set, else `Category · Subcategory` breadcrumb.
 * Falls back to just the category when nothing else is filled.
 */
export function summarizeSavedInterest(interest: SavedTradeInterest): string {
  const brandModel = [interest.brand, interest.model].filter(Boolean).join(" ")
  if (brandModel) return brandModel

  const crumbs = [interest.category, interest.subcategory].filter(Boolean)
  if (crumbs.length > 0) return crumbs.join(" · ")

  return interest.category || "Untitled interest"
}
