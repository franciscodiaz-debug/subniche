"use client"

import { useState } from "react"

import { mockNiches, mockCategories, type AdminNiche, type AdminCategory, type AdminSubcategory } from "@/lib/admin/mock-taxonomy"
import { NicheList } from "./niche-list"
import { CategoryTree } from "./category-tree"
import { AttributeList } from "./attribute-list"

export function TaxonomyPage() {
  const [niches, setNiches] = useState<AdminNiche[]>(mockNiches)
  const [categories, setCategories] = useState<AdminCategory[]>(mockCategories)
  const [selectedNiche, setSelectedNiche] = useState<AdminNiche | null>(mockNiches[0] ?? null)
  const [selectedCategory, setSelectedCategory] = useState<AdminCategory | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<AdminSubcategory | null>(null)

  const nicheCategories = categories.filter(
    (c) => c.nicheId === selectedNiche?.id
  )

  function handleSelectNiche(niche: AdminNiche) {
    setSelectedNiche(niche)
    setSelectedCategory(null)
    setSelectedSubcategory(null)
  }

  function handleSelectCategory(cat: AdminCategory) {
    setSelectedCategory(cat)
    setSelectedSubcategory(null)
  }

  function handleSelectSubcategory(sub: AdminSubcategory, parent: AdminCategory) {
    setSelectedCategory(parent)
    setSelectedSubcategory(sub)
  }

  function handleUpdateNicheCategories(updated: AdminCategory[]) {
    setCategories((prev) => [
      ...prev.filter((c) => c.nicheId !== selectedNiche?.id),
      ...updated,
    ])
    if (selectedCategory) {
      const refreshed = updated.find((c) => c.id === selectedCategory.id)
      setSelectedCategory(refreshed ?? null)
    }
  }

  function handleUpdateCategory(updated: AdminCategory) {
    setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
    if (selectedCategory?.id === updated.id) {
      setSelectedCategory(updated)
      // Keep selectedSubcategory in sync if it still exists in the updated category
      if (selectedSubcategory) {
        const stillExists = updated.subcategories.find((s) => s.id === selectedSubcategory.id)
        if (!stillExists) setSelectedSubcategory(null)
      }
    }
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] divide-x divide-border overflow-hidden rounded-xl border border-border">
      {/* Left: niche list */}
      <div className="w-[240px] flex-shrink-0">
        <NicheList
          niches={niches}
          selectedId={selectedNiche?.id ?? null}
          onSelect={handleSelectNiche}
          onUpdate={setNiches}
        />
      </div>

      {/* Center: category tree */}
      <div className="flex w-[300px] flex-shrink-0 flex-col">
        {selectedNiche ? (
          <CategoryTree
            categories={nicheCategories}
            selectedCategoryId={selectedCategory?.id ?? null}
            selectedSubcategoryId={selectedSubcategory?.id ?? null}
            onSelectCategory={handleSelectCategory}
            onSelectSubcategory={handleSelectSubcategory}
            onUpdateCategories={handleUpdateNicheCategories}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Select a niche
          </div>
        )}
      </div>

      {/* Right: attribute list */}
      <div className="flex flex-1 flex-col">
        {selectedCategory ? (
          <AttributeList
            category={selectedCategory}
            subcategory={selectedSubcategory ?? undefined}
            nicheId={selectedNiche?.id ?? ""}
            allCategories={categories}
            onUpdateCategory={handleUpdateCategory}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {selectedNiche ? "Select a category or subcategory to manage attributes" : "Select a niche first"}
          </div>
        )}
      </div>
    </div>
  )
}
