export type AttributeInputType =
  | "select"
  | "multi-select"
  | "number"
  | "range"
  | "boolean"
  | "string"
  | "user-defined"

export type AttributeProminence = "primary" | "secondary" | "hidden"
export type EntityStatus = "active" | "archived"
export type NicheStatus = "active" | "inactive"

export interface AdminAllowedValue {
  id: string
  attributeId: string
  label: string
  usageCount: number
  status: EntityStatus
  subcategoryIds?: string[]  // if set, value only appears in these subcategory contexts; absent = universal
}

export interface AdminAttribute {
  id: string
  categoryId: string
  subcategoryId?: string
  name: string
  inputType: AttributeInputType
  required: boolean
  displayOrder: number
  prominence: AttributeProminence
  status: EntityStatus
  allowedValues: AdminAllowedValue[]
}

export interface AdminSubcategory {
  id: string
  categoryId: string
  name: string
  displayOrder: number
  itemCount: number
  status: EntityStatus
}

export interface AdminCategory {
  id: string
  nicheId: string
  name: string
  displayOrder: number
  itemCount: number
  status: EntityStatus
  subcategories: AdminSubcategory[]
  attributes: AdminAttribute[]
}

export interface AdminNiche {
  id: string
  name: string
  slug: string
  status: NicheStatus
  itemCount: number
  categoryCount: number
  tagline: string
  description: string
  heroImageUrl: string | null
  iconUrl: string | null
}

export const mockNiches: AdminNiche[] = [
  {
    id: "niche-guitars",
    name: "Guitars",
    slug: "guitars",
    status: "active",
    itemCount: 1284,
    categoryCount: 6,
    tagline: "For players and collectors who know the difference.",
    description:
      "Electric, acoustic, classical, and everything in between. A marketplace for guitarists who care about the details — condition, provenance, and tone.",
    heroImageUrl: null,
    iconUrl: null,
  },
  {
    id: "niche-motorcycles",
    name: "Motorcycles",
    slug: "motorcycles",
    status: "active",
    itemCount: 432,
    categoryCount: 4,
    tagline: "Gear, parts, and bikes for riders.",
    description:
      "Motorcycles, riding gear, parts, and accessories for the serious rider.",
    heroImageUrl: null,
    iconUrl: null,
  },
  {
    id: "niche-coins",
    name: "Coins",
    slug: "coins",
    status: "inactive",
    itemCount: 89,
    categoryCount: 3,
    tagline: "Numismatics for serious collectors.",
    description:
      "A curated marketplace for coin collectors — certified, raw, and everything in between.",
    heroImageUrl: null,
    iconUrl: null,
  },
]

export const mockCategories: AdminCategory[] = [
  {
    id: "cat-electric",
    nicheId: "niche-guitars",
    name: "Electric Guitars",
    displayOrder: 1,
    itemCount: 568,
    status: "active",
    subcategories: [
      { id: "sub-solid", categoryId: "cat-electric", name: "Solid Body", displayOrder: 1, itemCount: 312, status: "active" },
      { id: "sub-hollow", categoryId: "cat-electric", name: "Hollow / Semi-hollow", displayOrder: 2, itemCount: 134, status: "active" },
      { id: "sub-baritone", categoryId: "cat-electric", name: "Baritone", displayOrder: 3, itemCount: 34, status: "active" },
      { id: "sub-bass", categoryId: "cat-electric", name: "Electric Bass", displayOrder: 4, itemCount: 88, status: "active" },
    ],
    attributes: [
      {
        id: "attr-brand",
        categoryId: "cat-electric",
        name: "Brand",
        inputType: "user-defined",
        required: true,
        displayOrder: 1,
        prominence: "primary",
        status: "active",
        allowedValues: [
          // Universal — span all electric guitar subcategories
          { id: "val-fender",      attributeId: "attr-brand", label: "Fender",      usageCount: 189, status: "active" },
          { id: "val-gibson",      attributeId: "attr-brand", label: "Gibson",      usageCount: 143, status: "active" },
          { id: "val-prs",         attributeId: "attr-brand", label: "PRS",         usageCount: 67,  status: "active" },
          { id: "val-epiphone",    attributeId: "attr-brand", label: "Epiphone",    usageCount: 39,  status: "active" },
          { id: "val-rickenbacker",attributeId: "attr-brand", label: "Rickenbacker",usageCount: 21,  status: "active" },
          // Solid Body scoped
          { id: "val-esp",    attributeId: "attr-brand", label: "ESP",     usageCount: 18, status: "active", subcategoryIds: ["sub-solid"] },
          { id: "val-bcrich", attributeId: "attr-brand", label: "BC Rich", usageCount: 9,  status: "active", subcategoryIds: ["sub-solid"] },
          // Hollow / Semi-hollow scoped
          { id: "val-gretsch",   attributeId: "attr-brand", label: "Gretsch",    usageCount: 44, status: "active", subcategoryIds: ["sub-hollow"] },
          { id: "val-dangelico", attributeId: "attr-brand", label: "D'Angelico", usageCount: 22, status: "active", subcategoryIds: ["sub-hollow"] },
          { id: "val-heritage",  attributeId: "attr-brand", label: "Heritage",   usageCount: 11, status: "active", subcategoryIds: ["sub-hollow"] },
          // Electric Bass scoped
          { id: "val-musicman", attributeId: "attr-brand", label: "Music Man", usageCount: 22, status: "active", subcategoryIds: ["sub-bass"] },
          { id: "val-lakland",  attributeId: "attr-brand", label: "Lakland",   usageCount: 14, status: "active", subcategoryIds: ["sub-bass"] },
          { id: "val-warwick",  attributeId: "attr-brand", label: "Warwick",   usageCount: 11, status: "active", subcategoryIds: ["sub-bass"] },
          { id: "val-spector",  attributeId: "attr-brand", label: "Spector",   usageCount: 7,  status: "active", subcategoryIds: ["sub-bass"] },
          { id: "val-sadowsky", attributeId: "attr-brand", label: "Sadowsky",  usageCount: 6,  status: "active", subcategoryIds: ["sub-bass"] },
        ],
      },
      {
        id: "attr-year",
        categoryId: "cat-electric",
        name: "Year",
        inputType: "number",
        required: true,
        displayOrder: 2,
        prominence: "primary",
        status: "active",
        allowedValues: [],
      },
      {
        id: "attr-condition",
        categoryId: "cat-electric",
        name: "Condition",
        inputType: "select",
        required: true,
        displayOrder: 3,
        prominence: "primary",
        status: "active",
        allowedValues: [
          { id: "val-mint", attributeId: "attr-condition", label: "Mint", usageCount: 78, status: "active" },
          { id: "val-exc", attributeId: "attr-condition", label: "Excellent", usageCount: 201, status: "active" },
          { id: "val-vgood", attributeId: "attr-condition", label: "Very Good", usageCount: 167, status: "active" },
          { id: "val-good", attributeId: "attr-condition", label: "Good", usageCount: 89, status: "active" },
          { id: "val-fair", attributeId: "attr-condition", label: "Fair", usageCount: 33, status: "active" },
        ],
      },
      {
        id: "attr-color",
        categoryId: "cat-electric",
        name: "Color / Finish",
        inputType: "multi-select",
        required: false,
        displayOrder: 4,
        prominence: "secondary",
        status: "active",
        allowedValues: [
          { id: "val-sunburst", attributeId: "attr-color", label: "Sunburst", usageCount: 134, status: "active" },
          { id: "val-black", attributeId: "attr-color", label: "Black", usageCount: 98, status: "active" },
          { id: "val-natural", attributeId: "attr-color", label: "Natural", usageCount: 77, status: "active" },
          { id: "val-white", attributeId: "attr-color", label: "White / Aged White", usageCount: 55, status: "active" },
          { id: "val-blond", attributeId: "attr-color", label: "Blonde", usageCount: 34, status: "active" },
          { id: "val-red", attributeId: "attr-color", label: "Red / Cherry", usageCount: 29, status: "active" },
        ],
      },
      {
        id: "attr-series",
        categoryId: "cat-electric",
        name: "Series / Model",
        inputType: "string",
        required: false,
        displayOrder: 5,
        prominence: "secondary",
        status: "active",
        allowedValues: [],
      },
      {
        id: "attr-mods",
        categoryId: "cat-electric",
        name: "Modifications",
        inputType: "boolean",
        required: false,
        displayOrder: 6,
        prominence: "hidden",
        status: "active",
        allowedValues: [],
      },
      // --- Hollow / Semi-hollow subcategory attributes ---
      {
        id: "attr-hollow-body-style",
        categoryId: "cat-electric",
        subcategoryId: "sub-hollow",
        name: "Body Style",
        inputType: "select",
        required: false,
        displayOrder: 2,
        prominence: "secondary",
        status: "active",
        allowedValues: [
          { id: "val-hollow-full", attributeId: "attr-hollow-body-style", label: "Full hollow (archtop)", usageCount: 67, status: "active" },
          { id: "val-hollow-semi", attributeId: "attr-hollow-body-style", label: "Semi-hollow (335-style)", usageCount: 54, status: "active" },
          { id: "val-hollow-thin", attributeId: "attr-hollow-body-style", label: "Thinline", usageCount: 13, status: "active" },
        ],
      },
      // --- Electric Bass subcategory attributes ---
      {
        id: "attr-bass-strings",
        categoryId: "cat-electric",
        subcategoryId: "sub-bass",
        name: "String Count",
        inputType: "select",
        required: true,
        displayOrder: 2,
        prominence: "primary",
        status: "active",
        allowedValues: [
          { id: "val-bass-4", attributeId: "attr-bass-strings", label: "4-string", usageCount: 56, status: "active" },
          { id: "val-bass-5", attributeId: "attr-bass-strings", label: "5-string", usageCount: 24, status: "active" },
          { id: "val-bass-6", attributeId: "attr-bass-strings", label: "6-string", usageCount: 8, status: "active" },
        ],
      },
    ],
  },
  {
    id: "cat-acoustic",
    nicheId: "niche-guitars",
    name: "Acoustic Guitars",
    displayOrder: 2,
    itemCount: 312,
    status: "active",
    subcategories: [
      { id: "sub-steel", categoryId: "cat-acoustic", name: "Steel String", displayOrder: 1, itemCount: 198, status: "active" },
      { id: "sub-classical", categoryId: "cat-acoustic", name: "Classical / Nylon", displayOrder: 2, itemCount: 67, status: "active" },
      { id: "sub-resonator", categoryId: "cat-acoustic", name: "Resonator / Dobro", displayOrder: 3, itemCount: 47, status: "active" },
    ],
    attributes: [
      {
        id: "attr-ac-brand",
        categoryId: "cat-acoustic",
        name: "Brand",
        inputType: "user-defined",
        required: true,
        displayOrder: 1,
        prominence: "primary",
        status: "active",
        allowedValues: [
          // Universal — makers spanning multiple acoustic types
          { id: "val-martin",    attributeId: "attr-ac-brand", label: "Martin", usageCount: 112, status: "active" },
          { id: "val-taylor",    attributeId: "attr-ac-brand", label: "Taylor", usageCount: 98,  status: "active" },
          { id: "val-gibson-ac", attributeId: "attr-ac-brand", label: "Gibson", usageCount: 54,  status: "active" },
          { id: "val-yamaha",    attributeId: "attr-ac-brand", label: "Yamaha", usageCount: 33,  status: "active" },
          // Steel String scoped
          { id: "val-collings",   attributeId: "attr-ac-brand", label: "Collings",   usageCount: 23, status: "active", subcategoryIds: ["sub-steel"] },
          { id: "val-santa-cruz", attributeId: "attr-ac-brand", label: "Santa Cruz", usageCount: 14, status: "active", subcategoryIds: ["sub-steel"] },
          { id: "val-bourgeois",  attributeId: "attr-ac-brand", label: "Bourgeois",  usageCount: 9,  status: "active", subcategoryIds: ["sub-steel"] },
          { id: "val-guild",      attributeId: "attr-ac-brand", label: "Guild",      usageCount: 7,  status: "active", subcategoryIds: ["sub-steel"] },
          // Classical / Nylon scoped
          { id: "val-smallman", attributeId: "attr-ac-brand", label: "Smallman", usageCount: 8,  status: "active", subcategoryIds: ["sub-classical"] },
          { id: "val-ramirez",  attributeId: "attr-ac-brand", label: "Ramírez",  usageCount: 12, status: "active", subcategoryIds: ["sub-classical"] },
          { id: "val-cordoba",  attributeId: "attr-ac-brand", label: "Córdoba",  usageCount: 15, status: "active", subcategoryIds: ["sub-classical"] },
        ],
      },
      {
        id: "attr-ac-year",
        categoryId: "cat-acoustic",
        name: "Year",
        inputType: "number",
        required: true,
        displayOrder: 2,
        prominence: "primary",
        status: "active",
        allowedValues: [],
      },
      {
        id: "attr-ac-condition",
        categoryId: "cat-acoustic",
        name: "Condition",
        inputType: "select",
        required: true,
        displayOrder: 3,
        prominence: "primary",
        status: "active",
        allowedValues: [
          { id: "val-ac-mint", attributeId: "attr-ac-condition", label: "Mint", usageCount: 34, status: "active" },
          { id: "val-ac-exc", attributeId: "attr-ac-condition", label: "Excellent", usageCount: 89, status: "active" },
          { id: "val-ac-vgood", attributeId: "attr-ac-condition", label: "Very Good", usageCount: 77, status: "active" },
          { id: "val-ac-good", attributeId: "attr-ac-condition", label: "Good", usageCount: 43, status: "active" },
        ],
      },
    ],
  },
  {
    id: "cat-amps",
    nicheId: "niche-guitars",
    name: "Amps & Effects",
    displayOrder: 3,
    itemCount: 234,
    status: "active",
    subcategories: [
      { id: "sub-tube-amp", categoryId: "cat-amps", name: "Tube Amplifiers", displayOrder: 1, itemCount: 134, status: "active" },
      { id: "sub-solid-amp", categoryId: "cat-amps", name: "Solid State Amps", displayOrder: 2, itemCount: 56, status: "active" },
      { id: "sub-pedals", categoryId: "cat-amps", name: "Pedals & Effects", displayOrder: 3, itemCount: 44, status: "active" },
    ],
    attributes: [
      {
        id: "attr-amp-brand",
        categoryId: "cat-amps",
        name: "Brand",
        inputType: "user-defined",
        required: true,
        displayOrder: 1,
        prominence: "primary",
        status: "active",
        allowedValues: [
          { id: "val-fender-amp", attributeId: "attr-amp-brand", label: "Fender", usageCount: 67, status: "active" },
          { id: "val-marshall", attributeId: "attr-amp-brand", label: "Marshall", usageCount: 54, status: "active" },
          { id: "val-vox", attributeId: "attr-amp-brand", label: "Vox", usageCount: 33, status: "active" },
          { id: "val-orange", attributeId: "attr-amp-brand", label: "Orange", usageCount: 28, status: "active" },
          { id: "val-mesa", attributeId: "attr-amp-brand", label: "Mesa/Boogie", usageCount: 22, status: "active" },
        ],
      },
      {
        id: "attr-amp-watts",
        categoryId: "cat-amps",
        name: "Wattage",
        inputType: "number",
        required: false,
        displayOrder: 2,
        prominence: "secondary",
        status: "active",
        allowedValues: [],
      },
    ],
  },
  {
    id: "cat-cases",
    nicheId: "niche-guitars",
    name: "Cases & Accessories",
    displayOrder: 4,
    itemCount: 98,
    status: "active",
    subcategories: [
      { id: "sub-hardcases", categoryId: "cat-cases", name: "Hard Cases", displayOrder: 1, itemCount: 56, status: "active" },
      { id: "sub-gigbags", categoryId: "cat-cases", name: "Gig Bags", displayOrder: 2, itemCount: 42, status: "active" },
    ],
    attributes: [
      {
        id: "attr-case-fit",
        categoryId: "cat-cases",
        name: "Fits",
        inputType: "multi-select",
        required: false,
        displayOrder: 1,
        prominence: "primary",
        status: "active",
        allowedValues: [
          { id: "val-fit-strat", attributeId: "attr-case-fit", label: "Stratocaster", usageCount: 34, status: "active" },
          { id: "val-fit-les-paul", attributeId: "attr-case-fit", label: "Les Paul", usageCount: 28, status: "active" },
          { id: "val-fit-tele", attributeId: "attr-case-fit", label: "Telecaster", usageCount: 21, status: "active" },
          { id: "val-fit-dread", attributeId: "attr-case-fit", label: "Dreadnought", usageCount: 19, status: "active" },
        ],
      },
    ],
  },
  {
    id: "cat-moto-gear",
    nicheId: "niche-motorcycles",
    name: "Riding Gear",
    displayOrder: 1,
    itemCount: 189,
    status: "active",
    subcategories: [
      { id: "sub-helmets", categoryId: "cat-moto-gear", name: "Helmets", displayOrder: 1, itemCount: 89, status: "active" },
      { id: "sub-jackets", categoryId: "cat-moto-gear", name: "Jackets", displayOrder: 2, itemCount: 67, status: "active" },
      { id: "sub-boots", categoryId: "cat-moto-gear", name: "Boots & Gloves", displayOrder: 3, itemCount: 33, status: "active" },
    ],
    attributes: [
      {
        id: "attr-gear-brand",
        categoryId: "cat-moto-gear",
        name: "Brand",
        inputType: "user-defined",
        required: true,
        displayOrder: 1,
        prominence: "primary",
        status: "active",
        allowedValues: [
          { id: "val-shoei", attributeId: "attr-gear-brand", label: "Shoei", usageCount: 44, status: "active" },
          { id: "val-arai", attributeId: "attr-gear-brand", label: "Arai", usageCount: 38, status: "active" },
          { id: "val-agv", attributeId: "attr-gear-brand", label: "AGV", usageCount: 27, status: "active" },
          { id: "val-icon", attributeId: "attr-gear-brand", label: "Icon", usageCount: 19, status: "active" },
        ],
      },
      {
        id: "attr-gear-size",
        categoryId: "cat-moto-gear",
        name: "Size",
        inputType: "select",
        required: true,
        displayOrder: 2,
        prominence: "primary",
        status: "active",
        allowedValues: [
          { id: "val-xs", attributeId: "attr-gear-size", label: "XS", usageCount: 12, status: "active" },
          { id: "val-s", attributeId: "attr-gear-size", label: "S", usageCount: 34, status: "active" },
          { id: "val-m", attributeId: "attr-gear-size", label: "M", usageCount: 56, status: "active" },
          { id: "val-l", attributeId: "attr-gear-size", label: "L", usageCount: 48, status: "active" },
          { id: "val-xl", attributeId: "attr-gear-size", label: "XL", usageCount: 29, status: "active" },
          { id: "val-xxl", attributeId: "attr-gear-size", label: "XXL", usageCount: 10, status: "active" },
        ],
      },
    ],
  },
  {
    id: "cat-moto-parts",
    nicheId: "niche-motorcycles",
    name: "Parts & Spares",
    displayOrder: 2,
    itemCount: 143,
    status: "active",
    subcategories: [
      { id: "sub-exhaust", categoryId: "cat-moto-parts", name: "Exhaust Systems", displayOrder: 1, itemCount: 44, status: "active" },
      { id: "sub-suspension", categoryId: "cat-moto-parts", name: "Suspension", displayOrder: 2, itemCount: 38, status: "active" },
      { id: "sub-electrical", categoryId: "cat-moto-parts", name: "Electrical", displayOrder: 3, itemCount: 61, status: "active" },
    ],
    attributes: [
      {
        id: "attr-parts-brand",
        categoryId: "cat-moto-parts",
        name: "Brand",
        inputType: "user-defined",
        required: false,
        displayOrder: 1,
        prominence: "primary",
        status: "active",
        allowedValues: [
          { id: "val-akrapovic", attributeId: "attr-parts-brand", label: "Akrapovič", usageCount: 22, status: "active" },
          { id: "val-yoshimura", attributeId: "attr-parts-brand", label: "Yoshimura", usageCount: 18, status: "active" },
          { id: "val-oem", attributeId: "attr-parts-brand", label: "OEM", usageCount: 67, status: "active" },
        ],
      },
    ],
  },
  {
    id: "cat-coins-us",
    nicheId: "niche-coins",
    name: "US Coins",
    displayOrder: 1,
    itemCount: 54,
    status: "active",
    subcategories: [
      { id: "sub-morgan", categoryId: "cat-coins-us", name: "Morgan Dollars", displayOrder: 1, itemCount: 23, status: "active" },
      { id: "sub-peace", categoryId: "cat-coins-us", name: "Peace Dollars", displayOrder: 2, itemCount: 14, status: "active" },
      { id: "sub-large-cents", categoryId: "cat-coins-us", name: "Large Cents", displayOrder: 3, itemCount: 17, status: "active" },
    ],
    attributes: [
      {
        id: "attr-coin-grade",
        categoryId: "cat-coins-us",
        name: "Grade",
        inputType: "select",
        required: true,
        displayOrder: 1,
        prominence: "primary",
        status: "active",
        allowedValues: [
          { id: "val-ms65", attributeId: "attr-coin-grade", label: "MS-65", usageCount: 8, status: "active" },
          { id: "val-ms64", attributeId: "attr-coin-grade", label: "MS-64", usageCount: 12, status: "active" },
          { id: "val-ms63", attributeId: "attr-coin-grade", label: "MS-63", usageCount: 9, status: "active" },
          { id: "val-vf", attributeId: "attr-coin-grade", label: "VF", usageCount: 14, status: "active" },
          { id: "val-f", attributeId: "attr-coin-grade", label: "F", usageCount: 11, status: "active" },
        ],
      },
      {
        id: "attr-coin-certified",
        categoryId: "cat-coins-us",
        name: "Certified",
        inputType: "boolean",
        required: false,
        displayOrder: 2,
        prominence: "secondary",
        status: "active",
        allowedValues: [],
      },
    ],
  },
]
