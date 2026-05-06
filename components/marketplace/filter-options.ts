import type { MockCategory } from "@/data/mock/types";
import {
  DEFAULT_MIN_PRICE,
  DEFAULT_MAX_PRICE,
  isDefaultPriceRange,
  normalizePriceRange,
  type PriceRangeFilter,
} from "@/lib/marketplace-filters";

export const categoryTaxonomy = [
  {
    id: "electric-guitars",
    label: "Electric Guitars",
    subcategories: [
      { label: "Solid Body", count: 624 },
      { label: "Semi-Hollow", count: 218 },
      { label: "Hollow Body", count: 147 },
      { label: "Offset", count: 132 },
      { label: "Baritone", count: 72 },
      { label: "Extended Range (7/8 String)", count: 55 },
    ],
    brands: [
      { label: "Fender", count: 423 },
      { label: "Gibson", count: 387 },
      { label: "Martin", count: 156 },
      { label: "Taylor", count: 142 },
      { label: "PRS", count: 98 },
      { label: "Ibanez", count: 167 },
      { label: "Gretsch", count: 89 },
      { label: "Rickenbacker", count: 54 },
    ],
  },
  {
    id: "acoustic-guitars",
    label: "Acoustic Guitars",
    subcategories: [
      { label: "Dreadnought", count: 218 },
      { label: "Grand Auditorium", count: 156 },
      { label: "Parlor", count: 84 },
      { label: "12-String", count: 42 },
    ],
    brands: [
      { label: "Martin", count: 156 },
      { label: "Taylor", count: 142 },
      { label: "Gibson", count: 83 },
      { label: "Guild", count: 61 },
    ],
  },
  {
    id: "amplifiers",
    label: "Amplifiers",
    subcategories: [
      { label: "Combo", count: 188 },
      { label: "Heads", count: 146 },
      { label: "Cabinets", count: 92 },
      { label: "Modelers", count: 63 },
    ],
    brands: [
      { label: "Fender", count: 148 },
      { label: "Mesa Boogie", count: 89 },
      { label: "Marshall", count: 77 },
      { label: "Vox", count: 62 },
    ],
  },
  {
    id: "effects-pedals",
    label: "Effects Pedals",
    subcategories: [
      { label: "Reverb", count: 176 },
      { label: "Delay", count: 158 },
      { label: "Drive", count: 221 },
      { label: "Modulation", count: 114 },
      { label: "Utility", count: 87 },
    ],
    brands: [
      { label: "Strymon", count: 96 },
      { label: "Boss", count: 141 },
      { label: "Chase Bliss", count: 53 },
      { label: "EarthQuaker", count: 72 },
    ],
  },
] as const;

export const histogramBars = [
  18, 28, 38, 48, 56, 68, 76, 84, 92, 88, 76, 64, 52, 42, 34, 26, 20,
];

export function getCategoryCount(categories: MockCategory[], id: string) {
  return categories.find((category) => category.id === id)?.itemCount ?? 0;
}

export function getTotalCategoryCount(categories: MockCategory[]) {
  return categories.reduce((total, category) => total + category.itemCount, 0);
}

export function getCategoryTaxonomy(categoryId: string) {
  return categoryTaxonomy.find((category) => category.id === categoryId);
}

export function getPriceRangeLabel(range: PriceRangeFilter) {
  const normalizedRange = normalizePriceRange(range);

  if (isDefaultPriceRange(normalizedRange)) {
    return "Any price";
  }

  if (normalizedRange.min === DEFAULT_MIN_PRICE) {
    return `Up to ${formatCurrency(normalizedRange.max)}`;
  }

  if (normalizedRange.max === DEFAULT_MAX_PRICE) {
    return `${formatCurrency(normalizedRange.min)}+`;
  }

  return `${formatCurrency(normalizedRange.min)} - ${formatCurrency(
    normalizedRange.max,
  )}`;
}

export function priceRangeToSlider(range: PriceRangeFilter) {
  return normalizePriceRange(range);
}

export function sliderToPriceRange(min: number, max: number): PriceRangeFilter {
  return normalizePriceRange({ min, max });
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "USD",
  }).format(value);
}
