"use client"

/**
 * Collections store — local-only, Context + localStorage.
 *
 * The backend lives in a separate project; this store exists so the UI can
 * be demonstrated end-to-end against local state. The back team copies the
 * approved flows into their own codebase and replaces this with real
 * persistence.
 *
 * Initial state seeds from `lib/mock/my-stuff.ts` so existing screens keep
 * rendering the same fixtures on first load. Once the user mutates anything,
 * the local copy diverges from the mock and is persisted to localStorage.
 *
 * Why localStorage instead of sessionStorage:
 *   - the user can create a collection, refresh, and still see it
 *   - feels closer to how a real backend would behave
 *   - the only cost is a small JSON serialize/deserialize on each write
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
import type { Collection, CollectionVisibility } from "@/lib/types"
import {
  myItems as MOCK_ITEMS,
  myCollections as MOCK_COLLECTIONS,
  type MyItem,
} from "@/lib/mock/my-stuff"
import { currentUser } from "@/lib/current-user"

/* -------------------------------------------------------------------------- */
/* Storage key — bump the version suffix if the persisted shape changes so   */
/* old clients don't try to deserialize an incompatible snapshot.            */
/* -------------------------------------------------------------------------- */
const STORAGE_KEY = "subniche.collections.v3"

interface PersistedState {
  collections: Collection[]
  items: MyItem[]
  /** Ids of collections the current user has chosen to follow. */
  followedCollectionIds?: string[]
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

export interface CreateCollectionInput {
  name: string
  description?: string | null
  visibility?: CollectionVisibility
  tags?: string[]
  cover_image?: string | null
}

export interface UpdateCollectionInput {
  name?: string
  description?: string | null
  visibility?: CollectionVisibility
  tags?: string[]
  cover_image?: string | null
}

interface CollectionsContextValue {
  collections: Collection[]
  items: MyItem[]
  /** Look up a single collection by id (returns `null` if not found). */
  getCollection: (id: string) => Collection | null
  /** Items currently assigned to a given collection. */
  getItemsForCollection: (collectionId: string) => MyItem[]
  /** Items NOT in any collection — useful for "items available to add". */
  getUnassignedItems: () => MyItem[]
  createCollection: (input: CreateCollectionInput) => Collection
  updateCollection: (id: string, patch: UpdateCollectionInput) => void
  deleteCollection: (id: string) => void
  /**
   * Move the listed items into the target collection. Items already in the
   * collection are skipped. Items in another collection are reassigned.
   */
  moveItemsToCollection: (collectionId: string, itemIds: string[]) => void
  /** Remove a single item from a collection (sets `collection_id` to null). */
  removeItemFromCollection: (itemId: string) => void
  /** Is the current user following this collection? */
  isFollowingCollection: (collectionId: string) => boolean
  /** Toggle follow state for a collection. */
  toggleFollowCollection: (collectionId: string) => void
}

const CollectionsContext = createContext<CollectionsContextValue | null>(null)

/* -------------------------------------------------------------------------- */
/* ID generation                                                              */
/*                                                                            */
/* Stable enough for the prototype — timestamp + counter so two collections   */
/* created in the same tick still get distinct ids.                           */
/* -------------------------------------------------------------------------- */
let idCounter = 0
function nextId(prefix: string): string {
  idCounter += 1
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`
}

/* -------------------------------------------------------------------------- */
/* Item-count recomputation                                                   */
/*                                                                            */
/* Keep `item_count` on each collection in sync with the underlying items     */
/* array so consumers (cards, tabs) don't need to recount themselves.         */
/* -------------------------------------------------------------------------- */
function withRecomputedCounts(
  collections: Collection[],
  items: MyItem[],
): Collection[] {
  const counts = new Map<string, number>()
  for (const item of items) {
    if (!item.collection_id) continue
    counts.set(item.collection_id, (counts.get(item.collection_id) ?? 0) + 1)
  }
  return collections.map((c) => ({ ...c, item_count: counts.get(c.id) ?? 0 }))
}

/* -------------------------------------------------------------------------- */
/* Provider                                                                   */
/* -------------------------------------------------------------------------- */

export function CollectionsProvider({ children }: { children: ReactNode }) {
  const [collections, setCollections] = useState<Collection[]>(() =>
    withRecomputedCounts(MOCK_COLLECTIONS, MOCK_ITEMS),
  )
  const [items, setItems] = useState<MyItem[]>(MOCK_ITEMS)
  const [followedCollectionIds, setFollowedCollectionIds] = useState<string[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage on mount. We can't read storage during the
  // initial render (it would mismatch SSR), so we do it in an effect and
  // flip a flag once we know the user-modified snapshot has been applied.
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed: PersistedState = JSON.parse(raw)
        if (Array.isArray(parsed.collections) && Array.isArray(parsed.items)) {
          setCollections(withRecomputedCounts(parsed.collections, parsed.items))
          setItems(parsed.items)
        }
        if (Array.isArray(parsed.followedCollectionIds)) {
          setFollowedCollectionIds(parsed.followedCollectionIds)
        }
      }
    } catch (err) {
      // Corrupted snapshot — drop it and fall back to the mock defaults.
      console.warn("[collections] failed to hydrate from localStorage", err)
    }
    setHydrated(true)
  }, [])

  // Persist on every change after the initial hydration. Skipping the first
  // run prevents us from writing the mock defaults over a fresh snapshot.
  const hasPersistedOnce = useRef(false)
  useEffect(() => {
    if (!hydrated) return
    if (typeof window === "undefined") return
    if (!hasPersistedOnce.current) {
      hasPersistedOnce.current = true
      return
    }
    try {
      const snapshot: PersistedState = {
        collections,
        items,
        followedCollectionIds,
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
    } catch (err) {
      console.warn("[collections] failed to persist to localStorage", err)
    }
  }, [collections, items, followedCollectionIds, hydrated])

  const getCollection = useCallback(
    (id: string) => collections.find((c) => c.id === id) ?? null,
    [collections],
  )

  const getItemsForCollection = useCallback(
    (collectionId: string) =>
      items.filter((item) => item.collection_id === collectionId),
    [items],
  )

  const getUnassignedItems = useCallback(
    () => items.filter((item) => !item.collection_id),
    [items],
  )

  const createCollection = useCallback(
    (input: CreateCollectionInput): Collection => {
      const created: Collection = {
        id: nextId("col"),
        // Always created as the current user — the back team will swap this
        // for the authenticated user id once auth is real.
        owner_id: currentUser.username,
        name: input.name.trim(),
        description: input.description?.trim() || null,
        visibility: input.visibility ?? "private",
        tags: input.tags ?? [],
        cover_image: input.cover_image ?? null,
        item_count: 0,
        total_user_value: 0,
        total_ai_value: 0,
      }
      setCollections((prev) => [created, ...prev])
      return created
    },
    [],
  )

  const updateCollection = useCallback(
    (id: string, patch: UpdateCollectionInput) => {
      setCollections((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c
          return {
            ...c,
            ...patch,
            // Normalize undefined back to the prior value so a partial
            // patch doesn't accidentally clear fields the caller didn't
            // intend to touch.
            name: patch.name !== undefined ? patch.name.trim() : c.name,
            description:
              patch.description !== undefined
                ? patch.description?.trim() || null
                : c.description,
          }
        }),
      )
    },
    [],
  )

  const deleteCollection = useCallback((id: string) => {
    setCollections((prev) => prev.filter((c) => c.id !== id))
    // Items in the deleted collection become unassigned rather than vanishing
    // — the user keeps their items, they just need a new home.
    setItems((prev) =>
      prev.map((item) =>
        item.collection_id === id ? { ...item, collection_id: null } : item,
      ),
    )
  }, [])

  const moveItemsToCollection = useCallback(
    (collectionId: string, itemIds: string[]) => {
      if (itemIds.length === 0) return
      const idSet = new Set(itemIds)
      setItems((prev) =>
        prev.map((item) =>
          idSet.has(item.id) ? { ...item, collection_id: collectionId } : item,
        ),
      )
    },
    [],
  )

  const removeItemFromCollection = useCallback((itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, collection_id: null } : item,
      ),
    )
  }, [])

  const isFollowingCollection = useCallback(
    (collectionId: string) => followedCollectionIds.includes(collectionId),
    [followedCollectionIds],
  )

  const toggleFollowCollection = useCallback((collectionId: string) => {
    setFollowedCollectionIds((prev) =>
      prev.includes(collectionId)
        ? prev.filter((id) => id !== collectionId)
        : [...prev, collectionId],
    )
  }, [])

  // Keep `item_count` derived whenever items shift, so consumers reading
  // straight off `collections` always see fresh numbers.
  const collectionsWithCounts = useMemo(
    () => withRecomputedCounts(collections, items),
    [collections, items],
  )

  const value = useMemo<CollectionsContextValue>(
    () => ({
      collections: collectionsWithCounts,
      items,
      getCollection,
      getItemsForCollection,
      getUnassignedItems,
      createCollection,
      updateCollection,
      deleteCollection,
      moveItemsToCollection,
      removeItemFromCollection,
      isFollowingCollection,
      toggleFollowCollection,
    }),
    [
      collectionsWithCounts,
      items,
      getCollection,
      getItemsForCollection,
      getUnassignedItems,
      createCollection,
      updateCollection,
      deleteCollection,
      moveItemsToCollection,
      removeItemFromCollection,
      isFollowingCollection,
      toggleFollowCollection,
    ],
  )

  return (
    <CollectionsContext.Provider value={value}>
      {children}
    </CollectionsContext.Provider>
  )
}

/* -------------------------------------------------------------------------- */
/* Consumer hook                                                              */
/* -------------------------------------------------------------------------- */

export function useCollections(): CollectionsContextValue {
  const ctx = useContext(CollectionsContext)
  if (!ctx) {
    throw new Error("useCollections must be used inside <CollectionsProvider>")
  }
  return ctx
}
