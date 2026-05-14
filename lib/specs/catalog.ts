/**
 * Specs catalog — single source of truth for what specifications apply to a
 * listing based on its category and subcategory.
 *
 * Replaces three legacy systems that coexisted in the codebase:
 *  - `SPEC_SCHEMA` (desktop): which specs are required/optional per category
 *  - `SUBCATEGORY_SPEC_ADDITIONS` (mobile): extra specs contributed by a subcategory
 *  - `SPEC_OPTIONS` (mobile): preset values per spec key
 *
 * Brand suggestions are sourced from `lib/trade-brands.ts` at lookup time so
 * the two systems stay in sync without duplicating the brand list. Trade
 * Interest still owns its own UI flow; this catalog is currently only
 * consumed by create-listing.
 */

import { BRANDS_BY_CATEGORY } from "@/lib/trade-brands"

/** How the field should be rendered when the user activates the spec. */
export type SpecInputType = "text" | "number" | "select-with-custom"

export interface SpecDefinition {
  /** Stable identifier used as the storage key. */
  key: string
  /** Human-readable label shown in the UI. */
  label: string
  /** True when the spec must be filled to publish the listing. */
  required?: boolean
  /** Controls which editor component renders for this spec. */
  inputType: SpecInputType
  /**
   * Suggested values for `select-with-custom` inputs. Users can always type
   * a value not in this list — suggestions never gate the input.
   */
  options?: string[]
  /** Optional placeholder shown when the input is empty. */
  placeholder?: string
}

export interface CategorySpecCatalog {
  /** Specs that apply to every item in this category. */
  baseSpecs: SpecDefinition[]
  /**
   * Specs that only apply when the user picks a specific subcategory.
   * These are added on top of `baseSpecs`.
   */
  bySubcategory: Record<string, SpecDefinition[]>
}

/* -------------------------------------------------------------------------- */
/* Shared option pools                                                        */
/*                                                                            */
/* Pulled out so the same option list isn't repeated across categories. Keep  */
/* these consistent with the rest of the platform's vocabulary.               */
/* -------------------------------------------------------------------------- */
const HANDEDNESS = ["Right", "Left"]
const FRETBOARD_WOODS = ["Maple", "Rosewood", "Ebony", "Pau Ferro"]
const FINISH = ["Gloss", "Satin", "Matte", "Relic"]
const GENERIC_COLORS = ["Black", "White", "Natural", "Sunburst", "Red", "Blue", "Sparkle"]

/* -------------------------------------------------------------------------- */
/* Default catalog                                                            */
/*                                                                            */
/* Applied when the user picks a category that doesn't have its own catalog   */
/* entry. Intentionally conservative — just brand + year as required.         */
/* -------------------------------------------------------------------------- */
export const DEFAULT_SPEC_CATALOG: CategorySpecCatalog = {
  baseSpecs: [
    { key: "brand", label: "Brand", inputType: "select-with-custom" },
    { key: "model", label: "Model", inputType: "select-with-custom" },
    { key: "year", label: "Year", inputType: "number", placeholder: "e.g. 2020" },
    { key: "color", label: "Color", inputType: "select-with-custom", options: GENERIC_COLORS },
    { key: "material", label: "Material", inputType: "select-with-custom", options: ["Wood", "Metal", "Plastic", "Composite"] },
    { key: "weight", label: "Weight", inputType: "text" },
    { key: "dimensions", label: "Dimensions", inputType: "text" },
  ],
  bySubcategory: {},
}

/* -------------------------------------------------------------------------- */
/* Per-category catalog                                                       */
/* -------------------------------------------------------------------------- */
export const SPEC_CATALOG: Record<string, CategorySpecCatalog> = {
  Guitars: {
    baseSpecs: [
      { key: "brand", label: "Brand", inputType: "select-with-custom" },
      { key: "model", label: "Model", inputType: "select-with-custom" },
      { key: "year", label: "Year", inputType: "number", placeholder: "e.g. 1965" },
      {
        key: "bodyType",
        label: "Body Type",
        inputType: "select-with-custom",
        options: ["Solid", "Semi-Hollow", "Hollow", "Chambered"],
      },
      {
        key: "handedness",
        label: "Handedness",
        inputType: "select-with-custom",
        options: HANDEDNESS,
      },
      { key: "color", label: "Color", inputType: "select-with-custom", options: GENERIC_COLORS },
      {
        key: "finish",
        label: "Finish",
        inputType: "select-with-custom",
        options: FINISH,
      },
      {
        key: "fretboard",
        label: "Fretboard",
        inputType: "select-with-custom",
        options: FRETBOARD_WOODS,
      },
      { key: "weight", label: "Weight", inputType: "text" },
    ],
    bySubcategory: {
      Electric: [
        {
          key: "pickups",
          label: "Pickups",
          inputType: "select-with-custom",
          options: ["Single Coil", "Humbucker", "P90", "Active"],
        },
        {
          key: "pickupConfig",
          label: "Pickup Config",
          inputType: "select-with-custom",
          options: ["HSS", "HSH", "SSS", "HH", "SS"],
        },
        {
          key: "bridgeType",
          label: "Bridge",
          inputType: "select-with-custom",
          options: ["Tremolo", "Hardtail", "Floyd Rose", "Bigsby"],
        },
        {
          key: "strings",
          label: "Strings",
          inputType: "select-with-custom",
          options: ["6", "7", "8", "12"],
        },
      ],
      Acoustic: [
        {
          key: "topWood",
          label: "Top Wood",
          inputType: "select-with-custom",
          options: ["Spruce", "Cedar", "Mahogany", "Koa"],
        },
        {
          key: "backWood",
          label: "Back Wood",
          inputType: "select-with-custom",
          options: ["Rosewood", "Mahogany", "Maple", "Sapele"],
        },
        {
          key: "cutaway",
          label: "Cutaway",
          inputType: "select-with-custom",
          options: ["Yes", "No"],
        },
      ],
      Bass: [
        {
          key: "strings",
          label: "Strings",
          inputType: "select-with-custom",
          options: ["4", "5", "6"],
        },
        {
          key: "activePassive",
          label: "Active/Passive",
          inputType: "select-with-custom",
          options: ["Active", "Passive"],
        },
      ],
    },
  },
  Drums: {
    baseSpecs: [
      { key: "brand", label: "Brand", inputType: "select-with-custom" },
      { key: "model", label: "Model", inputType: "select-with-custom" },
      {
        key: "type",
        label: "Type",
        inputType: "select-with-custom",
        options: ["Studio", "Stage", "Touring", "Vintage"],
      },
      { key: "year", label: "Year", inputType: "number" },
      { key: "color", label: "Color", inputType: "select-with-custom", options: GENERIC_COLORS },
      {
        key: "size",
        label: "Size",
        inputType: "select-with-custom",
        options: ["Small", "Medium", "Large"],
      },
      {
        key: "shellMaterial",
        label: "Shell Material",
        inputType: "select-with-custom",
        options: ["Maple", "Birch", "Mahogany", "Poplar"],
      },
    ],
    bySubcategory: {},
  },
  Keyboards: {
    baseSpecs: [
      { key: "brand", label: "Brand", inputType: "select-with-custom" },
      { key: "model", label: "Model", inputType: "select-with-custom" },
      { key: "keyCount", label: "Key Count", inputType: "number", placeholder: "e.g. 88" },
      { key: "year", label: "Year", inputType: "number" },
      { key: "color", label: "Color", inputType: "select-with-custom", options: GENERIC_COLORS },
      {
        key: "actionType",
        label: "Action",
        inputType: "select-with-custom",
        options: ["Weighted", "Semi-weighted", "Synth-action"],
      },
      { key: "polyphony", label: "Polyphony", inputType: "number" },
      { key: "weight", label: "Weight", inputType: "text" },
    ],
    bySubcategory: {
      "Stage Pianos": [
        {
          key: "hammerAction",
          label: "Hammer Action",
          inputType: "select-with-custom",
          options: ["Weighted", "Semi-weighted", "Synth-action"],
        },
      ],
      Synths: [
        {
          key: "synthType",
          label: "Synth Type",
          inputType: "select-with-custom",
          options: ["Analog", "Digital", "FM", "Wavetable", "Hybrid"],
        },
        { key: "voices", label: "Voices", inputType: "number" },
      ],
    },
  },
  "Audio Equipment": {
    baseSpecs: [
      { key: "brand", label: "Brand", inputType: "select-with-custom" },
      { key: "model", label: "Model", inputType: "select-with-custom" },
      {
        key: "type",
        label: "Type",
        inputType: "select-with-custom",
        options: ["Studio", "Stage", "Touring", "Vintage"],
      },
      { key: "year", label: "Year", inputType: "number" },
      { key: "color", label: "Color", inputType: "select-with-custom", options: GENERIC_COLORS },
      {
        key: "connectivity",
        label: "Connectivity",
        inputType: "select-with-custom",
        options: ["USB", "XLR", '1/4"', "MIDI", "Bluetooth"],
      },
      { key: "power", label: "Power", inputType: "text" },
    ],
    bySubcategory: {
      Pedals: [
        {
          key: "effectType",
          label: "Effect Type",
          inputType: "select-with-custom",
          options: ["Overdrive", "Distortion", "Delay", "Reverb", "Chorus", "Fuzz"],
        },
        {
          key: "powerSupply",
          label: "Power Supply",
          inputType: "select-with-custom",
          options: ["9V", "12V", "18V", "Battery"],
        },
      ],
      Microphones: [
        {
          key: "micType",
          label: "Mic Type",
          inputType: "select-with-custom",
          options: ["Dynamic", "Condenser", "Ribbon", "USB"],
        },
        {
          key: "polarPattern",
          label: "Polar Pattern",
          inputType: "select-with-custom",
          options: ["Cardioid", "Omni", "Figure-8", "Shotgun"],
        },
      ],
    },
  },
  Accessories: {
    baseSpecs: [
      { key: "brand", label: "Brand", inputType: "select-with-custom" },
      { key: "model", label: "Model", inputType: "select-with-custom" },
      {
        key: "type",
        label: "Type",
        inputType: "select-with-custom",
        options: ["Studio", "Stage", "Touring", "Vintage"],
      },
      { key: "color", label: "Color", inputType: "select-with-custom", options: GENERIC_COLORS },
      {
        key: "material",
        label: "Material",
        inputType: "select-with-custom",
        options: ["Wood", "Metal", "Plastic", "Composite"],
      },
      {
        key: "size",
        label: "Size",
        inputType: "select-with-custom",
        options: ["Small", "Medium", "Large"],
      },
    ],
    bySubcategory: {},
  },
}

/**
 * Resolve the spec definitions applicable to a given category + subcategory.
 * Brand spec gets its options injected dynamically from BRANDS_BY_CATEGORY
 * so the brand suggestions stay in sync with the trade-interest flow.
 */
export function getSpecsFor(category: string, subcategory: string): SpecDefinition[] {
  const catalog = SPEC_CATALOG[category] ?? DEFAULT_SPEC_CATALOG
  const subcategorySpecs = subcategory ? catalog.bySubcategory[subcategory] ?? [] : []
  const allSpecs = [...catalog.baseSpecs, ...subcategorySpecs]

  // Inject brand suggestions from the trade-brands index. Doing this at
  // lookup time keeps the brand list as a single source of truth without
  // copying it into the catalog.
  const brandSuggestions = BRANDS_BY_CATEGORY[category]?.map((b) => b.name) ?? []
  return allSpecs.map((spec) =>
    spec.key === "brand" && brandSuggestions.length > 0
      ? { ...spec, options: brandSuggestions }
      : spec,
  )
}

/**
 * Required specs subset — used by the form's validation to enforce that the
 * user fills brand/year/etc. before publishing.
 */
export function getRequiredSpecsFor(category: string, subcategory: string): SpecDefinition[] {
  return getSpecsFor(category, subcategory).filter((s) => s.required)
}

/**
 * Model suggestions for a category given the currently selected brand. When
 * the brand is known and listed in `BRANDS_BY_CATEGORY`, returns that brand's
 * popular models. Otherwise returns a flat union of every model across all
 * known brands for the category so the user still gets some completion.
 */
export function getModelOptionsFor(category: string, brand: string): string[] {
  const brands = BRANDS_BY_CATEGORY[category] ?? []
  if (brand) {
    const match = brands.find(
      (b) => b.name.toLowerCase() === brand.trim().toLowerCase(),
    )
    if (match) return match.models
  }
  const all = new Set<string>()
  for (const b of brands) {
    for (const m of b.models) all.add(m)
  }
  return Array.from(all)
}
