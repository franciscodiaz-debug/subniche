"use client"

import { useState, useEffect, useCallback } from "react"
import { Grid2X2, Grid3x3, Grip } from "lucide-react"

export type GridDensity = "cozy" | "compact" | "dense"

export const gridDensityConfig: Record<GridDensity, { cols: string; label: string; icon: typeof Grid3x3 }> = {
  cozy: {
    cols: "grid-cols-2 sm:grid-cols-2 lg:grid-cols-2",
    label: "2x Photo ❤️",
    icon: Grid2X2,
  },
  compact: {
    cols: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    label: "4x Normie",
    icon: Grid3x3,
  },
  dense: {
    cols: "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6",
    label: "6x Full Nerd",
    icon: Grip,
  },
}

export const gridDensityOrder: GridDensity[] = ["cozy", "compact", "dense"]

const STORAGE_KEY = "subniche-grid-density"

export function useGridDensity() {
  const [gridDensity, setGridDensityState] = useState<GridDensity>("compact")
  const [isInitialized, setIsInitialized] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && (stored === "cozy" || stored === "compact" || stored === "dense")) {
      setGridDensityState(stored as GridDensity)
    }
    setIsInitialized(true)
  }, [])

  // Persist to localStorage when changed
  const setGridDensity = useCallback((density: GridDensity) => {
    setGridDensityState(density)
    localStorage.setItem(STORAGE_KEY, density)
    // Dispatch custom event so other components can listen for changes
    window.dispatchEvent(new CustomEvent("grid-density-change", { detail: density }))
  }, [])

  // Listen for changes from other components
  useEffect(() => {
    const handleChange = (e: CustomEvent<GridDensity>) => {
      setGridDensityState(e.detail)
    }
    window.addEventListener("grid-density-change", handleChange as EventListener)
    return () => window.removeEventListener("grid-density-change", handleChange as EventListener)
  }, [])

  return {
    gridDensity,
    setGridDensity,
    isInitialized,
    config: gridDensityConfig[gridDensity],
  }
}
