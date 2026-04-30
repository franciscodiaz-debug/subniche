/**
 * Trade Interest specs catalog.
 *
 * Drives the chip-add UX inside Advanced-mode Trade Interest cards. Each
 * `SpecField` represents one matcher dimension the lister can pin for a given
 * (category, subcategory) pair. Fields are intentionally kept *coarse* and are
 * never duplicated from other card-level fields (brand / model / condition /
 * value range) so every chip stays a useful match signal.
 *
 * The catalog is also sent to the AI parser (see `parseSimpleToAdvanced`) so
 * the model only emits spec keys and option values that the UI can render
 * without extra mapping.
 */

export type SpecField = {
  /** Stable machine key. Kept short and snake-ish. */
  key: string
  /** User-facing label used by chips, dropdowns, and summaries. */
  label: string
  /** Allowed option values. First item should be the most common default. */
  options: string[]
}

/**
 * Fixed categories. Mirrors the dropdown on the Trade Interest card.
 * Keep in sync with `TRADE_CATEGORIES` in `trade-interest-section.tsx`.
 */
export const TRADE_CATEGORIES = [
  "Guitars",
  "Drums",
  "Keyboards",
  "Audio Equipment",
  "Accessories",
  "Discs",
  "Other",
] as const

export type TradeCategory = (typeof TRADE_CATEGORIES)[number]

/**
 * Subcategories scoped to each category. Shown as chips after a category is
 * picked. Values are plain strings (not keys) so we can display them verbatim.
 */
export const SUBCATEGORIES_BY_CATEGORY: Record<TradeCategory, readonly string[]> = {
  Guitars: ["Electric", "Acoustic", "Bass", "Classical", "Parts"],
  Drums: ["Acoustic Kits", "Electronic", "Cymbals", "Hardware", "Parts"],
  Keyboards: ["Synths", "Stage Pianos", "Digital Pianos", "MIDI Controllers", "Organs"],
  "Audio Equipment": ["Amps", "Pedals", "Microphones", "Monitors", "Interfaces"],
  Accessories: ["Cables", "Cases", "Strings", "Stands", "Straps"],
  Discs: ["Vinyl", "CDs", "Tapes"],
  Other: [],
}

/**
 * Allowed condition values on the Trade Interest card.
 * "Any" is the clear/no-preference option and should never be persisted as
 * a meaningful filter value downstream.
 */
export const TRADE_CONDITIONS = [
  "Any",
  "New",
  "Like New",
  "Used - Excellent",
  "Used - Good",
  "Used - Fair",
] as const

/* -------------------------------------------------------------------------- */
/* Spec catalog                                                               */
/*                                                                            */
/* Rules for authoring:                                                       */
/*  - Never duplicate card-level fields (brand, model, condition, value).     */
/*  - Prefer coarse ranges over exact values so the field stays useful as a   */
/*    matcher (`50-100 W`, not `85 W`).                                       */
/*  - First option in each `options` list is the most common/default value   */
/*    the UI can suggest.                                                    */
/* -------------------------------------------------------------------------- */
export const SPECS_BY_CATEGORY_SUBCATEGORY: Record<
  string,
  Record<string, SpecField[]>
> = {
  Guitars: {
    Electric: [
      {
        key: "bodyStyle",
        label: "Body style",
        options: ["Solid", "Semi-Hollow", "Hollow", "Chambered"],
      },
      {
        key: "pickups",
        label: "Pickups",
        options: ["Humbucker", "Single Coil", "P90", "Active", "Piezo"],
      },
      { key: "strings", label: "Strings", options: ["6", "7", "8", "12"] },
      {
        key: "neckShape",
        label: "Neck shape",
        options: ["C", "D", "U", "V", "Slim C", "Modern"],
      },
      {
        key: "frets",
        label: "Frets",
        options: ["21", "22", "24"],
      },
      {
        key: "scaleLength",
        label: "Scale length",
        options: ['24.75"', '25"', '25.5"', "Multi-scale"],
      },
      {
        key: "tremolo",
        label: "Tremolo",
        options: ["Hardtail", "Vintage Tremolo", "Floyd Rose", "Bigsby"],
      },
      {
        key: "handedness",
        label: "Handedness",
        options: ["Right", "Left"],
      },
    ],
    Acoustic: [
      {
        key: "bodySize",
        label: "Body size",
        options: ["Parlor", "Concert", "Grand Concert", "Dreadnought", "Jumbo"],
      },
      {
        key: "topWood",
        label: "Top wood",
        options: ["Spruce", "Cedar", "Mahogany", "Koa"],
      },
      {
        key: "backSides",
        label: "Back/sides",
        options: ["Rosewood", "Mahogany", "Maple", "Sapele", "Ovangkol"],
      },
      {
        key: "electronics",
        label: "Electronics",
        options: ["None", "Under-saddle", "Magnetic", "Internal mic"],
      },
      { key: "cutaway", label: "Cutaway", options: ["Yes", "No"] },
      { key: "strings", label: "Strings", options: ["6", "12"] },
      {
        key: "handedness",
        label: "Handedness",
        options: ["Right", "Left"],
      },
    ],
    Bass: [
      { key: "strings", label: "Strings", options: ["4", "5", "6"] },
      {
        key: "activePassive",
        label: "Electronics",
        options: ["Passive", "Active", "Active/Passive switch"],
      },
      {
        key: "scaleLength",
        label: "Scale length",
        options: ["Short", "Medium", "Long", "Extra-long"],
      },
      {
        key: "bodyStyle",
        label: "Body style",
        options: ["Solid", "Semi-Hollow", "Hollow"],
      },
      {
        key: "handedness",
        label: "Handedness",
        options: ["Right", "Left"],
      },
    ],
    Classical: [
      {
        key: "topWood",
        label: "Top wood",
        options: ["Spruce", "Cedar"],
      },
      {
        key: "backSides",
        label: "Back/sides",
        options: ["Rosewood", "Mahogany", "Cypress", "Maple"],
      },
      {
        key: "size",
        label: "Size",
        options: ["Full", "7/8", "3/4", "1/2"],
      },
    ],
    Parts: [
      {
        key: "partType",
        label: "Part type",
        options: ["Neck", "Body", "Pickups", "Bridge", "Tuners", "Electronics"],
      },
    ],
  },

  "Audio Equipment": {
    Amps: [
      {
        key: "type",
        label: "Type",
        options: ["Tube", "Solid state", "Modeling", "Hybrid"],
      },
      {
        key: "wattage",
        label: "Wattage",
        options: ["<15 W", "15-50 W", "50-100 W", ">100 W"],
      },
      {
        key: "format",
        label: "Format",
        options: ["Combo", "Head", "Cabinet", "Stack"],
      },
      {
        key: "speakerSize",
        label: "Speaker size",
        options: ['8"', '10"', '12"', '15"', "Multi"],
      },
      {
        key: "channels",
        label: "Channels",
        options: ["1", "2", "3+"],
      },
      {
        key: "builtInEffects",
        label: "Built-in effects",
        options: ["Yes", "No"],
      },
    ],
    Pedals: [
      {
        key: "type",
        label: "Type",
        options: [
          "Overdrive",
          "Distortion",
          "Fuzz",
          "Delay",
          "Reverb",
          "Modulation",
          "Multi-FX",
          "Looper",
          "EQ",
          "Compressor",
          "Wah",
        ],
      },
      {
        key: "trueBypass",
        label: "True bypass",
        options: ["Yes", "No"],
      },
      {
        key: "power",
        label: "Power",
        options: ["9V DC", "12V DC", "18V DC", "Battery"],
      },
      {
        key: "format",
        label: "Format",
        options: ["Standard", "Mini", "Rackmount"],
      },
    ],
    Microphones: [
      {
        key: "micType",
        label: "Type",
        options: ["Dynamic", "Condenser", "Ribbon", "USB"],
      },
      {
        key: "polarPattern",
        label: "Polar pattern",
        options: ["Cardioid", "Omni", "Figure-8", "Shotgun", "Multi-pattern"],
      },
      {
        key: "connection",
        label: "Connection",
        options: ["XLR", "USB", "XLR/USB"],
      },
    ],
    Monitors: [
      {
        key: "driver",
        label: "Driver size",
        options: ['3"', '5"', '6.5"', '8"', '10"'],
      },
      {
        key: "powered",
        label: "Powered",
        options: ["Active", "Passive"],
      },
      {
        key: "connections",
        label: "Connections",
        options: ["XLR", "TRS", "RCA", "Bluetooth"],
      },
    ],
    Interfaces: [
      {
        key: "inputs",
        label: "Inputs",
        options: ["1-2", "3-4", "5-8", "9+"],
      },
      {
        key: "connection",
        label: "Connection",
        options: ["USB-C", "USB-B", "Thunderbolt", "FireWire"],
      },
      {
        key: "phantomPower",
        label: "Phantom power",
        options: ["Yes", "No"],
      },
    ],
  },

  Keyboards: {
    Synths: [
      {
        key: "type",
        label: "Type",
        options: ["Analog", "Digital", "FM", "Wavetable", "Hybrid"],
      },
      {
        key: "keys",
        label: "Keys",
        options: ["25", "37", "49", "61", "76", "88"],
      },
      {
        key: "polyphony",
        label: "Polyphony",
        options: ["Mono", "Duo", "Paraphonic", "Polyphonic"],
      },
      {
        key: "aftertouch",
        label: "Aftertouch",
        options: ["Yes", "No"],
      },
      {
        key: "action",
        label: "Action",
        options: ["Synth", "Semi-weighted", "Weighted"],
      },
    ],
    "Stage Pianos": [
      {
        key: "keys",
        label: "Keys",
        options: ["73", "76", "88"],
      },
      {
        key: "action",
        label: "Action",
        options: ["Hammer weighted", "Semi-weighted"],
      },
      {
        key: "soundEngine",
        label: "Sound engine",
        options: ["Sampled", "Modeled", "Hybrid"],
      },
    ],
    "Digital Pianos": [
      {
        key: "keys",
        label: "Keys",
        options: ["88"],
      },
      {
        key: "cabinet",
        label: "Cabinet",
        options: ["Slab", "Console", "Upright-style"],
      },
    ],
    "MIDI Controllers": [
      {
        key: "keys",
        label: "Keys",
        options: ["25", "37", "49", "61", "88"],
      },
      {
        key: "pads",
        label: "Pads",
        options: ["None", "8", "16"],
      },
      {
        key: "knobsSliders",
        label: "Knobs/sliders",
        options: ["None", "Few", "Many"],
      },
    ],
    Organs: [
      {
        key: "type",
        label: "Type",
        options: ["Tonewheel", "Clonewheel", "Combo", "Pipe"],
      },
      {
        key: "keys",
        label: "Keys",
        options: ["Single manual", "Dual manual", "With pedals"],
      },
    ],
  },

  Drums: {
    "Acoustic Kits": [
      {
        key: "configuration",
        label: "Configuration",
        options: ["3-piece", "4-piece", "5-piece", "6-piece+", "Jazz", "Fusion", "Rock"],
      },
      {
        key: "shellWood",
        label: "Shell wood",
        options: ["Maple", "Birch", "Mahogany", "Poplar", "Oak"],
      },
      {
        key: "finish",
        label: "Finish",
        options: ["Lacquer", "Wrap", "Satin", "Stain"],
      },
      {
        key: "bassDrumSize",
        label: "Bass drum size",
        options: ['18"', '20"', '22"', '24"', '26"'],
      },
      {
        key: "hardwareIncluded",
        label: "Hardware included",
        options: ["Yes", "No"],
      },
      {
        key: "cymbalsIncluded",
        label: "Cymbals included",
        options: ["Yes", "No"],
      },
    ],
    Electronic: [
      {
        key: "padType",
        label: "Pad type",
        options: ["Rubber", "Mesh", "Silicone"],
      },
      {
        key: "kitSize",
        label: "Kit size",
        options: ["Compact", "Standard", "Expanded"],
      },
    ],
    Cymbals: [
      {
        key: "cymbalType",
        label: "Type",
        options: ["Hi-hat", "Crash", "Ride", "Splash", "China", "Effect"],
      },
      {
        key: "size",
        label: "Size",
        options: ['10"', '14"', '16"', '18"', '20"', '22"'],
      },
      {
        key: "weight",
        label: "Weight",
        options: ["Thin", "Medium", "Heavy"],
      },
    ],
    Hardware: [
      {
        key: "hardwareType",
        label: "Type",
        options: [
          "Snare stand",
          "Cymbal stand",
          "Hi-hat stand",
          "Kick pedal",
          "Throne",
          "Rack",
        ],
      },
    ],
    Parts: [
      {
        key: "partType",
        label: "Part type",
        options: ["Heads", "Lugs", "Hoops", "Dampening"],
      },
    ],
  },

  Accessories: {
    Cables: [
      {
        key: "cableType",
        label: "Type",
        options: ["Instrument", "Speaker", "XLR", "Patch", "MIDI", "USB"],
      },
      {
        key: "length",
        label: "Length",
        options: ["<10 ft", "10-20 ft", "20-50 ft", ">50 ft"],
      },
    ],
    Cases: [
      {
        key: "caseType",
        label: "Type",
        options: ["Hardshell", "Soft bag", "Flight case", "Gig bag"],
      },
      {
        key: "fit",
        label: "Fit",
        options: ["Universal", "Model-specific"],
      },
    ],
    Strings: [
      {
        key: "instrument",
        label: "Instrument",
        options: ["Electric", "Acoustic", "Bass", "Classical"],
      },
      {
        key: "gauge",
        label: "Gauge",
        options: ["Extra light", "Light", "Medium", "Heavy"],
      },
    ],
    Stands: [
      {
        key: "standType",
        label: "Type",
        options: ["Guitar", "Keyboard", "Mic", "Speaker", "Multi"],
      },
    ],
    Straps: [
      {
        key: "material",
        label: "Material",
        options: ["Leather", "Nylon", "Cotton", "Woven"],
      },
    ],
  },

  Discs: {
    Vinyl: [
      {
        key: "size",
        label: "Size",
        options: ['7"', '10"', '12"'],
      },
      {
        key: "speed",
        label: "Speed",
        options: ["33 1/3", "45", "78"],
      },
      {
        key: "pressing",
        label: "Pressing",
        options: ["Original", "Reissue", "Coloured", "Limited"],
      },
    ],
    CDs: [
      {
        key: "format",
        label: "Format",
        options: ["Standard", "Digipak", "Boxset", "Promo"],
      },
    ],
    Tapes: [
      {
        key: "tapeType",
        label: "Type",
        options: ["Cassette", "Reel-to-reel", "8-track"],
      },
    ],
  },

  Other: {},
}

/**
 * Returns the spec list for a given (category, subcategory) pair.
 * Always returns an array (possibly empty) so callers can render the chip-add
 * block unconditionally without a fallback branch.
 */
export function getSpecsFor(category: string, subcategory: string): SpecField[] {
  if (!category) return []
  const bucket = SPECS_BY_CATEGORY_SUBCATEGORY[category]
  if (!bucket) return []
  if (!subcategory) return []
  return bucket[subcategory] ?? []
}
