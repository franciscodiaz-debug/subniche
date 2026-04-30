/**
 * Brand & model index scoped to Trade Interest categories.
 *
 * This is a deliberately small, hand-picked index — enough to power the
 * combobox autocomplete in the Trade Interest card end-to-end without
 * pretending to be comprehensive. Free typing is always allowed on the card;
 * any unmatched input is flagged `unverifiedBrand`/`unverifiedModel`.
 */

export type BrandEntry = {
  /** Display name — used verbatim in the combobox and summaries. */
  name: string
  /** Popular models for quick autocomplete. Not exhaustive. */
  models: string[]
}

export const BRANDS_BY_CATEGORY: Record<string, BrandEntry[]> = {
  Guitars: [
    {
      name: "Fender",
      models: [
        "Stratocaster",
        "Telecaster",
        "Jazzmaster",
        "Jaguar",
        "Mustang",
        "Precision Bass",
        "Jazz Bass",
      ],
    },
    {
      name: "Gibson",
      models: ["Les Paul", "SG", "ES-335", "Flying V", "Explorer", "Firebird"],
    },
    {
      name: "Martin",
      models: ["D-28", "D-18", "000-28", "OM-28", "HD-28"],
    },
    {
      name: "Taylor",
      models: ["814ce", "814", "214ce", "324ce", "GS Mini"],
    },
    {
      name: "Gretsch",
      models: ["White Falcon", "Country Gentleman", "Streamliner", "Electromatic"],
    },
    {
      name: "Rickenbacker",
      models: ["330", "360", "4003"],
    },
    {
      name: "PRS",
      models: ["Custom 24", "McCarty", "SE Standard", "Silver Sky"],
    },
    {
      name: "Ibanez",
      models: ["RG", "S Series", "AZ", "Talman", "Artcore"],
    },
    {
      name: "Jackson",
      models: ["Soloist", "Dinky", "Rhoads", "Kelly"],
    },
    {
      name: "ESP / LTD",
      models: ["EC-1000", "M-II", "Eclipse", "Horizon"],
    },
    {
      name: "Epiphone",
      models: ["Casino", "Les Paul Standard", "SG Standard", "Sheraton"],
    },
    {
      name: "Yamaha",
      models: ["Pacifica", "Revstar", "FG Series", "LL Series"],
    },
    {
      name: "Guild",
      models: ["D-40", "F-50", "Starfire"],
    },
    {
      name: "Rickenbacker",
      models: ["330", "360", "4003"],
    },
    {
      name: "Squier",
      models: ["Classic Vibe", "Contemporary", "Affinity"],
    },
  ],

  "Audio Equipment": [
    {
      name: "Fender",
      models: [
        "Deluxe Reverb",
        "Twin Reverb",
        "Princeton Reverb",
        "Blues Junior",
        "Hot Rod Deluxe",
        "Bassman",
      ],
    },
    {
      name: "Marshall",
      models: ["JCM800", "JCM900", "JTM45", "Plexi", "Bluesbreaker", "DSL40"],
    },
    {
      name: "Vox",
      models: ["AC15", "AC30", "AC4"],
    },
    {
      name: "Mesa/Boogie",
      models: ["Rectifier", "Mark V", "Lone Star", "Fillmore"],
    },
    {
      name: "Orange",
      models: ["Rockerverb", "Tiny Terror", "Crush", "TH30"],
    },
    {
      name: "Boss",
      models: ["DS-1", "DD-8", "RV-6", "BD-2", "OC-5", "RC-500"],
    },
    {
      name: "Strymon",
      models: ["BigSky", "TimeLine", "Mobius", "Volante", "Iridium", "Deco"],
    },
    {
      name: "Electro-Harmonix",
      models: ["Big Muff", "Memory Man", "POG", "Pitch Fork", "Holy Grail"],
    },
    {
      name: "MXR",
      models: ["Dyna Comp", "Phase 90", "Carbon Copy", "Micro Amp"],
    },
    {
      name: "Ibanez",
      models: ["Tube Screamer TS9", "Tube Screamer TS808"],
    },
    {
      name: "Shure",
      models: ["SM57", "SM58", "SM7B", "Beta 52A"],
    },
    {
      name: "Neumann",
      models: ["U 87", "TLM 103", "KM 184"],
    },
    {
      name: "Audio-Technica",
      models: ["AT2020", "AT4040", "AT2035"],
    },
    {
      name: "Yamaha",
      models: ["HS5", "HS7", "HS8"],
    },
    {
      name: "KRK",
      models: ["Rokit 5", "Rokit 7", "Rokit 8"],
    },
    {
      name: "Focusrite",
      models: ["Scarlett 2i2", "Scarlett 4i4", "Scarlett 8i6"],
    },
    {
      name: "Universal Audio",
      models: ["Apollo Twin", "Apollo x4", "Volt 2"],
    },
  ],

  Drums: [
    {
      name: "Ludwig",
      models: ["Classic Maple", "Black Beauty", "Supraphonic", "Keystone"],
    },
    {
      name: "DW",
      models: ["Collector's Series", "Design Series", "Performance Series"],
    },
    {
      name: "Pearl",
      models: ["Masters Maple", "Reference", "Masterworks", "Export"],
    },
    {
      name: "Tama",
      models: ["Starclassic", "Superstar", "Imperialstar", "SLP"],
    },
    {
      name: "Gretsch",
      models: ["USA Custom", "Brooklyn", "Catalina Maple"],
    },
    {
      name: "Yamaha",
      models: ["Recording Custom", "Stage Custom", "Absolute Hybrid Maple"],
    },
    {
      name: "Zildjian",
      models: ["A Custom", "K Custom", "K Constantinople", "A Series"],
    },
    {
      name: "Sabian",
      models: ["HHX", "AAX", "HH Vanguard"],
    },
    {
      name: "Meinl",
      models: ["Byzance", "Classics Custom", "Pure Alloy"],
    },
  ],

  Keyboards: [
    {
      name: "Nord",
      models: ["Stage 4", "Electro 6", "Piano 5", "Lead A1"],
    },
    {
      name: "Korg",
      models: ["Minilogue", "Monologue", "Prologue", "Kronos", "SV-2"],
    },
    {
      name: "Moog",
      models: ["Subsequent 37", "Matriarch", "Grandmother", "One"],
    },
    {
      name: "Roland",
      models: ["Juno-DS", "Fantom", "RD-2000", "Jupiter-X"],
    },
    {
      name: "Yamaha",
      models: ["Montage", "MODX", "CP88", "P-125"],
    },
    {
      name: "Kurzweil",
      models: ["PC4", "SP6", "K2700"],
    },
    {
      name: "Sequential",
      models: ["Prophet-6", "OB-6", "Take 5", "Prophet-10"],
    },
    {
      name: "Arturia",
      models: ["KeyLab 61", "KeyLab 88", "MiniLab", "MicroFreak"],
    },
    {
      name: "Native Instruments",
      models: ["Komplete Kontrol S61", "Komplete Kontrol M32"],
    },
    {
      name: "Hammond",
      models: ["B-3", "C-3", "SK Pro", "XK-5"],
    },
  ],

  Accessories: [],
  Discs: [],
  Other: [],
}

/**
 * Returns the brand index for a given category.
 * Empty array (not undefined) when the category is unknown, so callers can
 * mount the combobox unconditionally.
 */
export function getBrandsFor(category: string): BrandEntry[] {
  if (!category) return []
  return BRANDS_BY_CATEGORY[category] ?? []
}

/**
 * Returns the models for a given (category, brand). Case-insensitive brand
 * match because users may free-type in different casing before picking from
 * the suggestions.
 */
export function getModelsFor(category: string, brand: string): string[] {
  if (!category || !brand) return []
  const brands = getBrandsFor(category)
  const match = brands.find(
    (b) => b.name.toLowerCase() === brand.trim().toLowerCase(),
  )
  return match?.models ?? []
}
