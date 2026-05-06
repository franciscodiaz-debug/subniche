"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, GripVertical, MoreHorizontal, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import type { AdminCategory, AdminSubcategory } from "@/lib/admin/mock-taxonomy"
import { CategoryFormDialog } from "./category-form-dialog"
import { MergeDialog } from "./merge-dialog"

interface CategoryTreeProps {
  categories: AdminCategory[]
  selectedCategoryId: string | null
  selectedSubcategoryId: string | null
  onSelectCategory: (cat: AdminCategory) => void
  onSelectSubcategory: (sub: AdminSubcategory, parent: AdminCategory) => void
  onUpdateCategories: (cats: AdminCategory[]) => void
}

export function CategoryTree({
  categories,
  selectedCategoryId,
  selectedSubcategoryId,
  onSelectCategory,
  onSelectSubcategory,
  onUpdateCategories,
}: CategoryTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(categories.slice(0, 1).map((c) => c.id))
  )
  const [addCatOpen, setAddCatOpen] = useState(false)
  const [addSubTarget, setAddSubTarget] = useState<AdminCategory | null>(null)
  const [renameTarget, setRenameTarget] = useState<{ type: "cat" | "sub"; item: AdminCategory | AdminSubcategory; parentCat?: AdminCategory } | null>(null)
  const [mergeCatTarget, setMergeCatTarget] = useState<AdminCategory | null>(null)
  const [draggingCatId, setDraggingCatId] = useState<string | null>(null)
  const [dragOverCatId, setDragOverCatId] = useState<string | null>(null)

  const activeCategories = categories.filter((c) => c.status === "active")

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleAddCategory(name: string) {
    const newCat: AdminCategory = {
      id: `cat-${Date.now()}`,
      nicheId: categories[0]?.nicheId ?? "",
      name,
      displayOrder: activeCategories.length + 1,
      itemCount: 0,
      status: "active",
      subcategories: [],
      attributes: [],
    }
    onUpdateCategories([...categories, newCat])
  }

  function handleAddSubcategory(parent: AdminCategory, name: string) {
    const newSub: AdminSubcategory = {
      id: `sub-${Date.now()}`,
      categoryId: parent.id,
      name,
      displayOrder: parent.subcategories.length + 1,
      itemCount: 0,
      status: "active",
    }
    onUpdateCategories(
      categories.map((c) =>
        c.id === parent.id
          ? { ...c, subcategories: [...c.subcategories, newSub] }
          : c
      )
    )
  }

  function handleRenameCategory(id: string, name: string) {
    onUpdateCategories(categories.map((c) => (c.id === id ? { ...c, name } : c)))
  }

  function handleRenameSubcategory(catId: string, subId: string, name: string) {
    onUpdateCategories(
      categories.map((c) =>
        c.id === catId
          ? { ...c, subcategories: c.subcategories.map((s) => (s.id === subId ? { ...s, name } : s)) }
          : c
      )
    )
  }

  function handleArchiveCategory(id: string) {
    onUpdateCategories(
      categories.map((c) => (c.id === id ? { ...c, status: "archived" as const } : c))
    )
  }

  function handleDragStart(id: string) { setDraggingCatId(id) }
  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault()
    if (id !== draggingCatId) setDragOverCatId(id)
  }
  function handleDrop(targetId: string) {
    if (!draggingCatId || draggingCatId === targetId) return
    const cats = [...categories]
    const fromIdx = cats.findIndex((c) => c.id === draggingCatId)
    const toIdx = cats.findIndex((c) => c.id === targetId)
    const [removed] = cats.splice(fromIdx, 1)
    cats.splice(toIdx, 0, removed)
    onUpdateCategories(cats.map((c, i) => ({ ...c, displayOrder: i + 1 })))
    setDraggingCatId(null)
    setDragOverCatId(null)
  }

  const mergeCatOptions = activeCategories
    .filter((c) => c.id !== mergeCatTarget?.id)
    .map((c) => ({ id: c.id, label: c.name }))

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <p className="text-sm font-medium text-muted-foreground">Categories</p>
        <Button size="sm" variant="outline" onClick={() => setAddCatOpen(true)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeCategories.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            No categories yet.
          </div>
        ) : (
          <ul>
            {activeCategories.map((cat) => {
              const isExpanded = expandedIds.has(cat.id)
              const isSelected = selectedCategoryId === cat.id && !selectedSubcategoryId
              const activeSubs = cat.subcategories.filter((s) => s.status === "active")

              return (
                <li
                  key={cat.id}
                  draggable
                  onDragStart={() => handleDragStart(cat.id)}
                  onDragOver={(e) => handleDragOver(e, cat.id)}
                  onDrop={() => handleDrop(cat.id)}
                  onDragEnd={() => { setDraggingCatId(null); setDragOverCatId(null) }}
                  className={cn(
                    "border-b border-border transition-opacity",
                    draggingCatId === cat.id && "opacity-40",
                    dragOverCatId === cat.id && "border-t-2 border-t-primary",
                  )}
                >
                  <div
                    className={cn(
                      "flex cursor-pointer items-center gap-2 px-4 py-3 transition-colors",
                      isSelected ? "bg-card text-foreground" : "hover:bg-card/50 text-foreground",
                    )}
                    onClick={() => {
                      if (isSelected) {
                        toggleExpand(cat.id)
                      } else {
                        onSelectCategory(cat)
                      }
                    }}
                  >
                    <GripVertical className="h-4 w-4 flex-shrink-0 cursor-grab text-muted-foreground/40" />
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleExpand(cat.id) }}
                      className="flex-shrink-0 text-muted-foreground"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <span className="flex-1 text-sm font-medium">{cat.name}</span>
                    <span className="text-xs text-muted-foreground/60">
                      ({cat.itemCount})
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <button className="rounded p-1 text-muted-foreground hover:bg-card hover:text-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setRenameTarget({ type: "cat", item: cat })}>
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setAddSubTarget(cat)}>
                          Add subcategory
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setMergeCatTarget(cat)}>
                          Merge into…
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => handleArchiveCategory(cat.id)}
                          className="text-destructive focus:text-destructive"
                          disabled={cat.itemCount > 0}
                        >
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {isExpanded && activeSubs.length > 0 ? (
                    <ul className="border-t border-border/50">
                      {activeSubs.map((sub) => {
                        const isSubSelected = selectedSubcategoryId === sub.id
                        return (
                          <li
                            key={sub.id}
                            onClick={() => onSelectSubcategory(sub, cat)}
                            className={cn(
                              "flex cursor-pointer items-center gap-2 border-b border-border/50 py-2 pl-10 pr-4 text-sm transition-colors",
                              isSubSelected
                                ? "bg-primary/10 text-foreground"
                                : "text-muted-foreground hover:bg-card/30",
                            )}
                          >
                            <span className="mr-1 flex-shrink-0 text-muted-foreground/40">└</span>
                            <span className="flex-1">{sub.name}</span>
                            <span className="text-xs text-muted-foreground/60">({sub.itemCount})</span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <button className="rounded p-0.5 text-muted-foreground/40 hover:text-muted-foreground">
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onSelect={() =>
                                    setRenameTarget({ type: "sub", item: sub, parentCat: cat })
                                  }
                                >
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:text-destructive" disabled={sub.itemCount > 0}>
                                  Archive
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </li>
                        )
                      })}
                    </ul>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Add category dialog */}
      <CategoryFormDialog
        open={addCatOpen}
        onClose={() => setAddCatOpen(false)}
        onSave={handleAddCategory}
        title="Add Category"
      />

      {/* Add subcategory dialog */}
      {addSubTarget ? (
        <CategoryFormDialog
          open={!!addSubTarget}
          onClose={() => setAddSubTarget(null)}
          onSave={(name) => { handleAddSubcategory(addSubTarget, name); setAddSubTarget(null) }}
          title="Add Subcategory"
          parentLabel={addSubTarget.name}
        />
      ) : null}

      {/* Rename dialog */}
      {renameTarget ? (
        <CategoryFormDialog
          open={!!renameTarget}
          onClose={() => setRenameTarget(null)}
          onSave={(name) => {
            if (renameTarget.type === "cat") {
              handleRenameCategory((renameTarget.item as AdminCategory).id, name)
            } else {
              const sub = renameTarget.item as AdminSubcategory
              handleRenameSubcategory(renameTarget.parentCat!.id, sub.id, name)
            }
            setRenameTarget(null)
          }}
          initial={renameTarget.item.name}
          title={`Rename ${renameTarget.type === "cat" ? "Category" : "Subcategory"}`}
        />
      ) : null}

      {/* Merge dialog */}
      {mergeCatTarget ? (
        <MergeDialog
          open={!!mergeCatTarget}
          onClose={() => setMergeCatTarget(null)}
          onConfirm={() => {
            handleArchiveCategory(mergeCatTarget.id)
            setMergeCatTarget(null)
          }}
          sourceLabel={mergeCatTarget.name}
          sourceUsageCount={mergeCatTarget.itemCount}
          options={mergeCatOptions}
          entityType="category"
        />
      ) : null}
    </div>
  )
}
