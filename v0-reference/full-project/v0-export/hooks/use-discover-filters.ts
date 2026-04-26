"use client"

import { useCallback, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { TriState } from "@/components/ui/tri-state-checkbox"

export interface FilterState {
  category: string | null
  subcategory: string | null
  brands: string[]
  plastics: string[]
  conditions: string[]
  conditionStates: Record<string, TriState>
  excludeConditions: string[]
  minPrice: number | null
  maxPrice: number | null
  minWeight: number | null
  maxWeight: number | null
  forTrade: boolean | null
  // Flight numbers for discs
  minSpeed: number | null
  maxSpeed: number | null
  minGlide: number | null
  maxGlide: number | null
  minTurn: number | null
  maxTurn: number | null
  minFade: number | null
  maxFade: number | null
  // Other dynamic filters stored as key-value
  [key: string]: string | string[] | number | boolean | null | Record<string, TriState>
}

const defaultState: FilterState = {
  category: null,
  subcategory: null,
  brands: [],
  plastics: [],
  conditions: [],
  conditionStates: {},
  excludeConditions: [],
  minPrice: null,
  maxPrice: null,
  minWeight: null,
  maxWeight: null,
  forTrade: null,
  minSpeed: null,
  maxSpeed: null,
  minGlide: null,
  maxGlide: null,
  minTurn: null,
  maxTurn: null,
  minFade: null,
  maxFade: null,
}

export function useDiscoverFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Parse current filter state from URL
  const filters: FilterState = useMemo(() => {
    const parseArray = (key: string): string[] => {
      const value = searchParams.get(key)
      return value ? value.split(",").filter(Boolean) : []
    }

    const parseNumber = (key: string): number | null => {
      const value = searchParams.get(key)
      return value ? Number.parseFloat(value) : null
    }

    const parseBool = (key: string): boolean | null => {
      const value = searchParams.get(key)
      if (value === "true") return true
      if (value === "false") return false
      return null
    }

    const includeConditions = parseArray("conditions")
    const excludeConditions = parseArray("excludeConditions")
    const conditionStates: Record<string, TriState> = {}
    includeConditions.forEach((c) => (conditionStates[c] = "include"))
    excludeConditions.forEach((c) => (conditionStates[c] = "exclude"))

    return {
      category: searchParams.get("category"),
      subcategory: searchParams.get("subcategory"),
      brands: parseArray("brands"),
      plastics: parseArray("plastics"),
      conditions: includeConditions,
      conditionStates,
      excludeConditions,
      minPrice: parseNumber("minPrice"),
      maxPrice: parseNumber("maxPrice"),
      minWeight: parseNumber("minWeight"),
      maxWeight: parseNumber("maxWeight"),
      forTrade: parseBool("forTrade"),
      minSpeed: parseNumber("minSpeed"),
      maxSpeed: parseNumber("maxSpeed"),
      minGlide: parseNumber("minGlide"),
      maxGlide: parseNumber("maxGlide"),
      minTurn: parseNumber("minTurn"),
      maxTurn: parseNumber("maxTurn"),
      minFade: parseNumber("minFade"),
      maxFade: parseNumber("maxFade"),
    }
  }, [searchParams])

  // Update URL with new filter state
  const updateFilters = useCallback(
    (updates: Partial<FilterState>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        // Skip conditionStates as it's derived
        if (key === "conditionStates") return

        if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
          params.delete(key)
        } else if (Array.isArray(value)) {
          params.set(key, value.join(","))
        } else if (typeof value !== "object") {
          params.set(key, String(value))
        }
      })

      // If category changes, clear subcategory and category-specific filters
      if ("category" in updates && updates.category !== filters.category) {
        params.delete("subcategory")
        params.delete("brands")
        params.delete("plastics")
        params.delete("minWeight")
        params.delete("maxWeight")
        params.delete("minSpeed")
        params.delete("maxSpeed")
        params.delete("minGlide")
        params.delete("maxGlide")
        params.delete("minTurn")
        params.delete("maxTurn")
        params.delete("minFade")
        params.delete("maxFade")
      }

      router.replace(`/discover?${params.toString()}`, { scroll: false })
    },
    [router, searchParams, filters.category],
  )

  // Toggle a value in an array filter
  const toggleArrayFilter = useCallback(
    (key: keyof FilterState, value: string) => {
      const current = filters[key] as string[]
      const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
      updateFilters({ [key]: updated })
    },
    [filters, updateFilters],
  )

  const setConditionState = useCallback(
    (condition: string, state: TriState) => {
      const newInclude = filters.conditions.filter((c) => c !== condition)
      const newExclude = filters.excludeConditions.filter((c) => c !== condition)

      if (state === "include") {
        newInclude.push(condition)
      } else if (state === "exclude") {
        newExclude.push(condition)
      }

      updateFilters({
        conditions: newInclude,
        excludeConditions: newExclude,
      })
    },
    [filters.conditions, filters.excludeConditions, updateFilters],
  )

  // Set a range filter
  const setRangeFilter = useCallback(
    (minKey: string, maxKey: string, min: number | null, max: number | null) => {
      updateFilters({ [minKey]: min, [maxKey]: max })
    },
    [updateFilters],
  )

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    router.replace("/discover", { scroll: false })
  }, [router])

  // Clear a specific filter
  const clearFilter = useCallback(
    (key: keyof FilterState) => {
      updateFilters({ [key]: Array.isArray(defaultState[key]) ? [] : null })
    },
    [updateFilters],
  )

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.category !== null ||
      filters.brands.length > 0 ||
      filters.plastics.length > 0 ||
      filters.conditions.length > 0 ||
      filters.excludeConditions.length > 0 ||
      filters.minPrice !== null ||
      filters.maxPrice !== null ||
      filters.forTrade !== null
    )
  }, [filters])

  // Get count of active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.category) count++
    if (filters.subcategory) count++
    count += filters.brands.length
    count += filters.plastics.length
    count += filters.conditions.length
    count += filters.excludeConditions.length
    if (filters.minPrice !== null || filters.maxPrice !== null) count++
    if (filters.minWeight !== null || filters.maxWeight !== null) count++
    if (filters.forTrade !== null) count++
    return count
  }, [filters])

  return {
    filters,
    updateFilters,
    toggleArrayFilter,
    setConditionState,
    setRangeFilter,
    clearAllFilters,
    clearFilter,
    hasActiveFilters,
    activeFilterCount,
  }
}
