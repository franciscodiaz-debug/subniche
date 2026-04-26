// Hierarchical filter configuration for the Discover screen
// Filters are inherited from parent categories and extended by subcategories

export interface FilterOption {
  value: string
  label: string
  count?: number // Optional count for histogram display
}

export interface FilterDefinition {
  id: string
  label: string
  type: "chips" | "range" | "toggle"
  options?: FilterOption[]
  min?: number
  max?: number
  step?: number
  unit?: string
}

export interface CategoryConfig {
  id: string
  label: string
  icon?: string
  filters: FilterDefinition[]
  subcategories: SubcategoryConfig[]
}

export interface SubcategoryConfig {
  id: string
  label: string
  // Additional filters specific to this subcategory (inherits parent filters)
  additionalFilters: FilterDefinition[]
}

// Brand options shared across categories
const discBrands: FilterOption[] = [
  { value: "innova", label: "Innova" },
  { value: "discraft", label: "Discraft" },
  { value: "dynamic-discs", label: "Dynamic Discs" },
  { value: "latitude-64", label: "Latitude 64" },
  { value: "westside", label: "Westside" },
  { value: "mvp", label: "MVP" },
  { value: "axiom", label: "Axiom" },
  { value: "streamline", label: "Streamline" },
  { value: "kastaplast", label: "Kastaplast" },
  { value: "prodigy", label: "Prodigy" },
  { value: "discmania", label: "Discmania" },
  { value: "thought-space", label: "Thought Space Athletics" },
  { value: "clash", label: "Clash Discs" },
  { value: "lone-star", label: "Lone Star" },
]

const plasticTypes: FilterOption[] = [
  { value: "premium", label: "Premium" },
  { value: "base", label: "Base" },
  { value: "glow", label: "Glow" },
  { value: "lightweight", label: "Lightweight" },
]

const conditionOptions: FilterOption[] = [
  { value: "new", label: "New" },
  { value: "like-new", label: "Like New" },
  { value: "used", label: "Used" },
  { value: "well-used", label: "Well Used" },
]

// Flight number filters for discs
const flightFilters: FilterDefinition[] = [
  {
    id: "speed",
    label: "Speed",
    type: "range",
    min: 1,
    max: 15,
    step: 0.5,
  },
  {
    id: "glide",
    label: "Glide",
    type: "range",
    min: 1,
    max: 7,
    step: 0.5,
  },
  {
    id: "turn",
    label: "Turn",
    type: "range",
    min: -5,
    max: 1,
    step: 0.5,
  },
  {
    id: "fade",
    label: "Fade",
    type: "range",
    min: 0,
    max: 5,
    step: 0.5,
  },
]

export const categoryConfig: CategoryConfig[] = [
  {
    id: "discs",
    label: "Discs",
    icon: "💿",
    filters: [
      {
        id: "brand",
        label: "Brand",
        type: "chips",
        options: discBrands,
      },
      {
        id: "plastic",
        label: "Plastic Type",
        type: "chips",
        options: plasticTypes,
      },
      {
        id: "weight",
        label: "Weight (g)",
        type: "range",
        min: 130,
        max: 180,
        step: 1,
        unit: "g",
      },
      {
        id: "condition",
        label: "Condition",
        type: "chips",
        options: conditionOptions,
      },
    ],
    subcategories: [
      {
        id: "distance-drivers",
        label: "Distance Drivers",
        additionalFilters: flightFilters,
      },
      {
        id: "fairway-drivers",
        label: "Fairway Drivers",
        additionalFilters: flightFilters,
      },
      {
        id: "midranges",
        label: "Midranges",
        additionalFilters: flightFilters,
      },
      {
        id: "putters",
        label: "Putters",
        additionalFilters: flightFilters,
      },
    ],
  },
  {
    id: "accessories",
    label: "Accessories",
    icon: "🎒",
    filters: [
      {
        id: "brand",
        label: "Brand",
        type: "chips",
        options: [
          { value: "dynamic-discs", label: "Dynamic Discs" },
          { value: "innova", label: "Innova" },
          { value: "grip-eq", label: "GRIPeq" },
          { value: "pound", label: "Pound" },
          { value: "squatch", label: "Squatch" },
          { value: "upper-park", label: "Upper Park" },
        ],
      },
      {
        id: "condition",
        label: "Condition",
        type: "chips",
        options: conditionOptions,
      },
    ],
    subcategories: [
      {
        id: "bags",
        label: "Bags",
        additionalFilters: [
          {
            id: "capacity",
            label: "Disc Capacity",
            type: "chips",
            options: [
              { value: "small", label: "Under 15" },
              { value: "medium", label: "15-25" },
              { value: "large", label: "25+" },
            ],
          },
          {
            id: "strap-type",
            label: "Strap Type",
            type: "chips",
            options: [
              { value: "backpack", label: "Backpack" },
              { value: "shoulder", label: "Shoulder" },
              { value: "cart", label: "Cart Bag" },
            ],
          },
        ],
      },
      {
        id: "markers-minis",
        label: "Markers & Minis",
        additionalFilters: [
          {
            id: "material",
            label: "Material",
            type: "chips",
            options: [
              { value: "rubber", label: "Rubber" },
              { value: "plastic", label: "Plastic" },
              { value: "metal", label: "Metal" },
            ],
          },
        ],
      },
      {
        id: "towels-gear",
        label: "Towels & Gear",
        additionalFilters: [],
      },
      {
        id: "carts",
        label: "Carts",
        additionalFilters: [
          {
            id: "wheels",
            label: "Wheel Type",
            type: "chips",
            options: [
              { value: "all-terrain", label: "All-Terrain" },
              { value: "standard", label: "Standard" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "apparel",
    label: "Apparel",
    icon: "👕",
    filters: [
      {
        id: "brand",
        label: "Brand",
        type: "chips",
        options: [
          { value: "discmania", label: "Discmania" },
          { value: "innova", label: "Innova" },
          { value: "discraft", label: "Discraft" },
          { value: "dynamic-discs", label: "Dynamic Discs" },
        ],
      },
      {
        id: "size",
        label: "Size",
        type: "chips",
        options: [
          { value: "xs", label: "XS" },
          { value: "s", label: "S" },
          { value: "m", label: "M" },
          { value: "l", label: "L" },
          { value: "xl", label: "XL" },
          { value: "xxl", label: "2XL" },
        ],
      },
      {
        id: "condition",
        label: "Condition",
        type: "chips",
        options: conditionOptions,
      },
    ],
    subcategories: [
      {
        id: "shirts",
        label: "Shirts",
        additionalFilters: [
          {
            id: "sleeve",
            label: "Sleeve Length",
            type: "chips",
            options: [
              { value: "short", label: "Short" },
              { value: "long", label: "Long" },
              { value: "sleeveless", label: "Sleeveless" },
            ],
          },
        ],
      },
      {
        id: "hats",
        label: "Hats",
        additionalFilters: [
          {
            id: "style",
            label: "Style",
            type: "chips",
            options: [
              { value: "snapback", label: "Snapback" },
              { value: "fitted", label: "Fitted" },
              { value: "trucker", label: "Trucker" },
              { value: "beanie", label: "Beanie" },
            ],
          },
        ],
      },
      {
        id: "footwear",
        label: "Footwear",
        additionalFilters: [
          {
            id: "shoe-size",
            label: "Shoe Size",
            type: "chips",
            options: [
              { value: "7-8", label: "7-8" },
              { value: "8-9", label: "8-9" },
              { value: "9-10", label: "9-10" },
              { value: "10-11", label: "10-11" },
              { value: "11-12", label: "11-12" },
              { value: "12+", label: "12+" },
            ],
          },
        ],
      },
    ],
  },
]

// Helper to get all filters for a category + subcategory combination
export function getFiltersForSelection(categoryId: string | null, subcategoryId: string | null): FilterDefinition[] {
  if (!categoryId) return []

  const category = categoryConfig.find((c) => c.id === categoryId)
  if (!category) return []

  const baseFilters = [...category.filters]

  if (subcategoryId) {
    const subcategory = category.subcategories.find((s) => s.id === subcategoryId)
    if (subcategory) {
      return [...baseFilters, ...subcategory.additionalFilters]
    }
  }

  return baseFilters
}

// Get subcategories for a category
export function getSubcategoriesForCategory(categoryId: string): SubcategoryConfig[] {
  const category = categoryConfig.find((c) => c.id === categoryId)
  return category?.subcategories || []
}
