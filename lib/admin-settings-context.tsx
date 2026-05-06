"use client"

import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from "react"
import { mockNiches, mockCategories, type AdminNiche, type AdminCategory } from "@/lib/admin/mock-taxonomy"

const STORAGE_KEY = "subniche_admin_v1"

interface StoredState {
  niches: AdminNiche[]
  categories: AdminCategory[]
}

interface AdminSettingsCtx {
  niches: AdminNiche[]
  categories: AdminCategory[]
  currentNicheSlug: string
  setNiches: (niches: AdminNiche[]) => void
  setCategories: (categories: AdminCategory[]) => void
  setCurrentNicheSlug: (slug: string) => void
  resetToDefaults: () => void
}

function loadFromStorage(): StoredState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed?.niches) && Array.isArray(parsed?.categories)) {
        return parsed as StoredState
      }
    }
  } catch {}
  return null
}

function persist(niches: AdminNiche[], categories: AdminCategory[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ niches, categories }))
  } catch {}
}

const AdminSettingsContext = createContext<AdminSettingsCtx | null>(null)

export function AdminSettingsProvider({ children }: { children: ReactNode }) {
  const [niches, setNichesState] = useState<AdminNiche[]>(mockNiches)
  const [categories, setCategoriesState] = useState<AdminCategory[]>(mockCategories)
  const [currentNicheSlug, setCurrentNicheSlug] = useState<string>(
    () => mockNiches.find((n) => n.status === "active")?.slug ?? mockNiches[0]?.slug ?? ""
  )

  const nichesRef = useRef(niches)
  const categoriesRef = useRef(categories)
  nichesRef.current = niches
  categoriesRef.current = categories

  useEffect(() => {
    const saved = loadFromStorage()
    if (saved) {
      setNichesState(saved.niches)
      setCategoriesState(saved.categories)
      // If currentNicheSlug is no longer active after loading, reset to first active
      const firstActive = saved.niches.find((n) => n.status === "active")
      if (firstActive) setCurrentNicheSlug(firstActive.slug)
    }
  }, [])

  const setNiches = useCallback((next: AdminNiche[]) => {
    setNichesState(next)
    nichesRef.current = next
    persist(next, categoriesRef.current)
  }, [])

  const setCategories = useCallback((next: AdminCategory[]) => {
    setCategoriesState(next)
    categoriesRef.current = next
    persist(nichesRef.current, next)
  }, [])

  const resetToDefaults = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
    setNichesState(mockNiches)
    setCategoriesState(mockCategories)
    const firstActive = mockNiches.find((n) => n.status === "active")
    if (firstActive) setCurrentNicheSlug(firstActive.slug)
  }, [])

  return (
    <AdminSettingsContext.Provider value={{
      niches, categories, currentNicheSlug,
      setNiches, setCategories, setCurrentNicheSlug, resetToDefaults,
    }}>
      {children}
    </AdminSettingsContext.Provider>
  )
}

export function useAdminSettings(): AdminSettingsCtx {
  const ctx = useContext(AdminSettingsContext)
  if (!ctx) throw new Error("useAdminSettings must be used within AdminSettingsProvider")
  return ctx
}
