"use client"

/**
 * Watchlist — items the current user is following on other users' listings.
 *
 * NOT to be confused with the Wishlist (items the user wants but doesn't
 * own, created via Add Item with status=wishlist). The Watchlist is a
 * lightweight "follow this listing" — toggled with the eye icon on any
 * ItemCard across the app, surfaced as a list on /favorites.
 *
 * Backed by localStorage so the user's watch state survives a refresh.
 * This is the prototype's expected behavior; the back team replaces this
 * provider with real persistence when wiring the API.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

const STORAGE_KEY = "subniche.watchlist.v1"

interface WatchlistContextValue {
  /** Ordered ids of watched items, newest first. */
  watchedIds: string[]
  /** Quick lookup for `isWatched(itemId)`. */
  isWatched: (itemId: string) => boolean
  /** Toggle watch state for a single item id. */
  toggleWatch: (itemId: string) => void
  /** Explicitly add (no-op if already watched). */
  watch: (itemId: string) => void
  /** Explicitly remove (no-op if not watched). */
  unwatch: (itemId: string) => void
  /** Total count — convenient for badges. */
  count: number
}

const WatchlistContext = createContext<WatchlistContextValue | null>(null)

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchedIds, setWatchedIds] = useState<string[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage on mount. We can't read storage during the
  // initial render (it would mismatch SSR), so we do it in an effect and
  // flip a flag once the user-modified snapshot is applied.
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.every((id) => typeof id === "string")) {
          setWatchedIds(parsed)
        }
      }
    } catch (err) {
      console.warn("[watchlist] failed to hydrate from localStorage", err)
    }
    setHydrated(true)
  }, [])

  // Persist on every change after initial hydration. Skipping the first
  // run prevents writing the empty default over a fresh snapshot.
  const hasPersistedOnce = useRef(false)
  useEffect(() => {
    if (!hydrated) return
    if (typeof window === "undefined") return
    if (!hasPersistedOnce.current) {
      hasPersistedOnce.current = true
      return
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(watchedIds))
    } catch (err) {
      console.warn("[watchlist] failed to persist to localStorage", err)
    }
  }, [watchedIds, hydrated])

  const isWatched = useCallback(
    (itemId: string) => watchedIds.includes(itemId),
    [watchedIds],
  )

  const watch = useCallback((itemId: string) => {
    setWatchedIds((prev) => (prev.includes(itemId) ? prev : [itemId, ...prev]))
  }, [])

  const unwatch = useCallback((itemId: string) => {
    setWatchedIds((prev) => prev.filter((id) => id !== itemId))
  }, [])

  const toggleWatch = useCallback((itemId: string) => {
    setWatchedIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [itemId, ...prev],
    )
  }, [])

  const value = useMemo<WatchlistContextValue>(
    () => ({
      watchedIds,
      isWatched,
      toggleWatch,
      watch,
      unwatch,
      count: watchedIds.length,
    }),
    [watchedIds, isWatched, toggleWatch, watch, unwatch],
  )

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  )
}

export function useWatchlist(): WatchlistContextValue {
  const ctx = useContext(WatchlistContext)
  if (!ctx) {
    throw new Error("useWatchlist must be used inside <WatchlistProvider>")
  }
  return ctx
}
