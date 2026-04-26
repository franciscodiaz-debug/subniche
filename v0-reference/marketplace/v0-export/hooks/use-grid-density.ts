"use client"

import { useSyncExternalStore } from "react"
import { Grid2x2, Grid3x3, LayoutGrid, type LucideIcon } from "lucide-react"

export type GridDensity = "compact" | "comfortable" | "spacious"

export const gridDensityOrder: GridDensity[] = [
  "compact",
  "comfortable",
  "spacious",
]

export const gridDensityConfig: Record<
  GridDensity,
  { label: string; icon: LucideIcon; gridClass: string }
> = {
  compact: {
    label: "Compact",
    icon: Grid3x3,
    // Denser grid for scanning many listings quickly
    gridClass:
      "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
  },
  comfortable: {
    label: "Comfortable",
    icon: Grid2x2,
    // Default, balanced layout
    gridClass:
      "grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4",
  },
  spacious: {
    label: "Spacious",
    icon: LayoutGrid,
    // Fewer columns for larger visual focus
    gridClass:
      "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3",
  },
}

const STORAGE_KEY = "subniche.grid-density"
const DEFAULT_DENSITY: GridDensity = "comfortable"

// Module-level store so every consumer shares the same density and
// re-renders together when it changes.
let currentDensity: GridDensity = DEFAULT_DENSITY
let hasHydrated = false
const listeners = new Set<() => void>()

function hydrateIfNeeded() {
  if (hasHydrated || typeof window === "undefined") return
  hasHydrated = true
  const saved = window.localStorage.getItem(STORAGE_KEY) as GridDensity | null
  if (saved && gridDensityOrder.includes(saved)) {
    currentDensity = saved
  }
}

function subscribe(listener: () => void) {
  hydrateIfNeeded()
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): GridDensity {
  return currentDensity
}

function getServerSnapshot(): GridDensity {
  return DEFAULT_DENSITY
}

export function setGridDensity(density: GridDensity) {
  if (currentDensity === density) return
  currentDensity = density
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, density)
  }
  listeners.forEach((listener) => listener())
}

export function useGridDensity() {
  const gridDensity = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  )
  return { gridDensity, setGridDensity }
}
