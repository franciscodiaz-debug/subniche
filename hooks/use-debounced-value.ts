"use client"

import { useEffect, useState } from "react"

/**
 * Returns a debounced version of `value` that only updates after the
 * caller has stopped changing the input for `delay` ms.
 *
 * Used by the search surfaces (header search bar, mobile search panel)
 * to avoid running the mock filter on every keystroke — it kept up while
 * the data was a small array in memory, but it'll feel rough once the
 * back team swaps the filter for a real fetch.
 */
export function useDebouncedValue<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(handle)
  }, [value, delay])

  return debounced
}
