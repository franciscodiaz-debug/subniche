"use client"

import { useState } from "react"
import { GripVertical, MoreHorizontal, Plus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import type { AdminAttribute, AdminAllowedValue, AdminCategory, AdminSubcategory } from "@/lib/admin/mock-taxonomy"
import { AttributeFormDialog } from "./attribute-form-dialog"
import { AddExistingAttributeDialog } from "./add-existing-attribute-dialog"
import { CopyAttributeDialog } from "./copy-attribute-dialog"
import { MergeDialog } from "./merge-dialog"
import { ValueList } from "./value-list"

const inputTypeLabel: Record<AdminAttribute["inputType"], string> = {
  select: "select",
  "multi-select": "multi",
  number: "number",
  range: "range",
  boolean: "bool",
  string: "text",
  "user-defined": "user",
}

interface AttributeListProps {
  category: AdminCategory
  subcategory?: AdminSubcategory
  nicheId: string
  allCategories: AdminCategory[]
  onUpdateCategory: (updated: AdminCategory) => void
}

export function AttributeList({ category, subcategory, nicheId, allCategories, onUpdateCategory }: AttributeListProps) {
  const [addOpen, setAddOpen] = useState(false)
  const [addExistingOpen, setAddExistingOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AdminAttribute | null>(null)
  const [mergeTarget, setMergeTarget] = useState<AdminAttribute | null>(null)
  const [copyTarget, setCopyTarget] = useState<AdminAttribute | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  // Own attributes: subcategory-specific when subcategory selected, or category-level when at category level
  const ownAttributes = subcategory
    ? category.attributes.filter(a => a.status === "active" && a.subcategoryId === subcategory.id)
    : category.attributes.filter(a => a.status === "active" && !a.subcategoryId)

  // Inherited attributes: category-level attrs not overridden by an own attr with the same name
  const ownAttrNames = new Set(ownAttributes.map(a => a.name.toLowerCase()))
  const inheritedAttributes: AdminAttribute[] = subcategory
    ? category.attributes.filter(a =>
        a.status === "active" &&
        !a.subcategoryId &&
        !ownAttrNames.has(a.name.toLowerCase())
      )
    : []

  const isEmpty = ownAttributes.length === 0 && inheritedAttributes.length === 0

  function updateAttributes(attrs: AdminAttribute[]) {
    onUpdateCategory({ ...category, attributes: attrs })
  }

  // When all active subcategories share an attribute name, promote it to category level
  function checkAndAutoPromote(attrs: AdminAttribute[]): AdminAttribute[] {
    const activeSubs = category.subcategories.filter(s => s.status === "active")
    if (activeSubs.length < 2) return attrs

    const subAttrNameGroups = new Map<string, AdminAttribute[]>()
    for (const attr of attrs) {
      if (attr.subcategoryId && attr.status === "active") {
        const key = attr.name.toLowerCase()
        if (!subAttrNameGroups.has(key)) subAttrNameGroups.set(key, [])
        subAttrNameGroups.get(key)!.push(attr)
      }
    }

    let result = [...attrs]
    for (const [name, subAttrs] of subAttrNameGroups) {
      const coveredIds = new Set(subAttrs.map(a => a.subcategoryId!))
      const allCovered = activeSubs.every(s => coveredIds.has(s.id))
      const alreadyAtCategoryLevel = attrs.some(
        a => !a.subcategoryId && a.status === "active" && a.name.toLowerCase() === name
      )

      if (allCovered && !alreadyAtCategoryLevel) {
        const base = subAttrs[0]
        const promotedId = `attr-promoted-${Date.now()}`

        // Union allowed values from all subcategory instances (deduplicate by label)
        const seenLabels = new Set<string>()
        const unionedValues: AdminAllowedValue[] = []
        for (const sa of subAttrs) {
          for (const v of sa.allowedValues) {
            if (!seenLabels.has(v.label.toLowerCase())) {
              seenLabels.add(v.label.toLowerCase())
              unionedValues.push({ ...v, id: `${v.id}-p`, attributeId: promotedId })
            }
          }
        }

        const categoryLevelCount = result.filter(a => !a.subcategoryId && a.status === "active").length
        const promoted: AdminAttribute = {
          ...base,
          id: promotedId,
          subcategoryId: undefined,
          displayOrder: categoryLevelCount + 1,
          allowedValues: unionedValues,
        }

        const subAttrIds = new Set(subAttrs.map(a => a.id))
        result = [...result.filter(a => !subAttrIds.has(a.id)), promoted]
      }
    }
    return result
  }

  const existingAttributeNames = new Set(
    category.attributes
      .filter(a => a.status === "active")
      .map(a => a.name.toLowerCase())
  )

  function handleAddExisting(source: AdminAttribute) {
    const newId = `attr-${Date.now()}`
    const newAttr: AdminAttribute = {
      ...source,
      id: newId,
      categoryId: category.id,
      ...(subcategory ? { subcategoryId: subcategory.id } : { subcategoryId: undefined }),
      displayOrder: ownAttributes.length + 1,
      status: "active",
      allowedValues: source.allowedValues
        .filter(v => v.status === "active")
        .map((v, i) => ({ ...v, id: `${newId}-v${i}`, attributeId: newId })),
    }
    const newAttrs = [...category.attributes, newAttr]
    onUpdateCategory({ ...category, attributes: subcategory ? checkAndAutoPromote(newAttrs) : newAttrs })
  }

  function handleAdd(data: Pick<AdminAttribute, "name" | "inputType" | "required" | "prominence">) {
    const newAttr: AdminAttribute = {
      ...data,
      id: `attr-${Date.now()}`,
      categoryId: category.id,
      ...(subcategory ? { subcategoryId: subcategory.id } : {}),
      displayOrder: ownAttributes.length + 1,
      status: "active",
      allowedValues: [],
    }
    const newAttrs = [...category.attributes, newAttr]
    // Auto-promote only when adding a subcategory-specific attr
    onUpdateCategory({ ...category, attributes: subcategory ? checkAndAutoPromote(newAttrs) : newAttrs })
  }

  function handleToggleRequired(id: string, required: boolean) {
    updateAttributes(category.attributes.map(a => a.id === id ? { ...a, required } : a))
  }

  function handleArchive(id: string) {
    updateAttributes(category.attributes.map(a => a.id === id ? { ...a, status: "archived" as const } : a))
  }

  function handleUpdateAttribute(updated: AdminAttribute) {
    updateAttributes(category.attributes.map(a => a.id === updated.id ? updated : a))
  }

  // Remove a subcategory-specific attr (reveals inherited attr with same name if any)
  function handleRemoveOwnFromSub(id: string) {
    updateAttributes(category.attributes.filter(a => a.id !== id))
  }

  // Remove an inherited attr from only this subcategory: gives copies to all siblings, removes category-level
  function handleBreakInheritance(attrId: string) {
    if (!subcategory) return
    const attr = category.attributes.find(a => a.id === attrId)
    if (!attr) return

    const otherActiveSubs = category.subcategories.filter(
      s => s.status === "active" && s.id !== subcategory.id
    )

    const copies: AdminAttribute[] = otherActiveSubs.map((sub, i) => {
      const newId = `attr-${Date.now()}-${i}`
      return {
        ...attr,
        id: newId,
        subcategoryId: sub.id,
        allowedValues: attr.allowedValues.map(v => ({
          ...v,
          id: `${v.id}-cp${i}`,
          attributeId: newId,
        })),
      }
    })

    updateAttributes([
      ...category.attributes.filter(a => a.id !== attrId),
      ...copies,
    ])
  }

  // Remove a category-level attr entirely — removes it from all subcategories
  function handleRemoveFromAll(attrId: string) {
    const attr = category.attributes.find(a => a.id === attrId)
    if (!attr) return
    updateAttributes(
      category.attributes.filter(a => a.name.toLowerCase() !== attr.name.toLowerCase())
    )
  }

  function handleDragStart(id: string) { setDraggingId(id) }
  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault()
    if (id !== draggingId) setDragOverId(id)
  }
  function handleDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) return
    const attrs = [...category.attributes]
    const fromIdx = attrs.findIndex(a => a.id === draggingId)
    const toIdx = attrs.findIndex(a => a.id === targetId)
    const [removed] = attrs.splice(fromIdx, 1)
    attrs.splice(toIdx, 0, removed)
    updateAttributes(attrs.map((a, i) => ({ ...a, displayOrder: i + 1 })))
    setDraggingId(null)
    setDragOverId(null)
  }

  const mergeOptions = ownAttributes
    .filter(a => a.id !== mergeTarget?.id)
    .map(a => ({ id: a.id, label: a.name }))

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div>
          {subcategory ? (
            <>
              <p className="text-xs text-muted-foreground">{category.name} /</p>
              <p className="font-medium text-foreground">{subcategory.name}</p>
            </>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">Attributes for</p>
              <p className="font-medium text-foreground">{category.name}</p>
            </>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setAddOpen(true)}>
              New attribute
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setAddExistingOpen(true)}>
              Add existing
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            No attributes yet.{" "}
            <button onClick={() => setAddOpen(true)} className="text-primary hover:underline">
              Add one.
            </button>
          </div>
        ) : (
          <>
            {/* Own attributes — draggable, editable */}
            {ownAttributes.length > 0 && (
              <ul>
                {ownAttributes.map(attr => (
                  <li
                    key={attr.id}
                    draggable
                    onDragStart={() => handleDragStart(attr.id)}
                    onDragOver={e => handleDragOver(e, attr.id)}
                    onDrop={() => handleDrop(attr.id)}
                    onDragEnd={() => { setDraggingId(null); setDragOverId(null) }}
                    className={cn(
                      "border-b border-border transition-opacity",
                      draggingId === attr.id && "opacity-40",
                      dragOverId === attr.id && "border-t-2 border-t-primary",
                    )}
                  >
                    <div
                      className="flex cursor-pointer items-center gap-2 px-5 py-3 hover:bg-card/50"
                      onClick={() => setExpandedId(expandedId === attr.id ? null : attr.id)}
                    >
                      <GripVertical className="h-4 w-4 flex-shrink-0 cursor-grab text-muted-foreground/40" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{attr.name}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-normal">
                        {inputTypeLabel[attr.inputType]}
                      </Badge>
                      {(() => {
                        // If this subcategory attr overrides a parent attr, required is locked to parent's value
                        const parentAttr = subcategory
                          ? category.attributes.find(
                              a => !a.subcategoryId && a.status === "active" && a.name.toLowerCase() === attr.name.toLowerCase()
                            )
                          : null
                        const lockedRequired = parentAttr?.required ?? null
                        return lockedRequired !== null ? (
                          <span className="w-[38px] text-right text-[10px] text-muted-foreground/50">
                            {lockedRequired ? "Req" : "Opt"}
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                            <Switch
                              checked={attr.required}
                              onCheckedChange={v => handleToggleRequired(attr.id, v)}
                              className="scale-75"
                            />
                            <span className="text-[10px] text-muted-foreground">
                              {attr.required ? "Req" : "Opt"}
                            </span>
                          </div>
                        )
                      })()}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                          <button className="rounded p-1 text-muted-foreground hover:bg-card hover:text-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => setEditTarget(attr)}>
                            Rename / Edit
                          </DropdownMenuItem>
                          {!subcategory && (
                            <>
                              <DropdownMenuItem onSelect={() => setCopyTarget(attr)}>
                                Copy to another niche
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => setMergeTarget(attr)}>
                                Merge into…
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          {subcategory ? (
                            <DropdownMenuItem
                              onSelect={() => handleRemoveOwnFromSub(attr.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              Remove from this subcategory
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onSelect={() => handleArchive(attr.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              Archive
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {expandedId === attr.id && (
                      <div className="px-5 pb-4">
                        <ValueList
                          attribute={attr}
                          onUpdate={handleUpdateAttribute}
                          subcategory={subcategory}
                          subcategories={category.subcategories}
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {/* Inherited attributes — read from parent category, not draggable */}
            {inheritedAttributes.length > 0 && (
              <>
                {ownAttributes.length > 0 && <div className="border-t-4 border-foreground/20" />}
                <ul>
                  {inheritedAttributes.map(attr => (
                    <li key={attr.id} className="border-b border-border/50 border-l-2 border-l-primary/40 bg-primary/[0.03]">
                      <div
                        className="flex cursor-pointer items-center gap-2 px-5 py-3 hover:bg-primary/[0.06]"
                        onClick={() => setExpandedId(expandedId === attr.id ? null : attr.id)}
                      >
                        <div className="h-4 w-4 flex-shrink-0" />
                        <div className="flex min-w-0 flex-1 items-center gap-1.5">
                          <p className="text-sm font-medium text-foreground/50">{attr.name}</p>
                          <Badge className="flex-shrink-0 bg-primary/10 text-[10px] font-normal text-primary/50 hover:bg-primary/10 border-primary/15">
                            inherited
                          </Badge>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground/50">
                          {inputTypeLabel[attr.inputType]}
                        </Badge>
                        <div
                          className="flex items-center"
                          onClick={e => e.stopPropagation()}
                        >
                          <div className={`flex h-4 w-7 items-center rounded-full px-0.5 transition-colors ${attr.required ? "bg-yellow-500/20" : "bg-muted-foreground/10"}`}>
                            <div className={`h-3 w-3 rounded-full transition-colors ${attr.required ? "translate-x-3 bg-yellow-500/60" : "translate-x-0 bg-muted-foreground/20"}`} />
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                            <button className="rounded p-1 text-muted-foreground/40 hover:bg-card hover:text-foreground">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => handleBreakInheritance(attr.id)}>
                              Remove from this subcategory
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onSelect={() => handleRemoveFromAll(attr.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              Remove from all subcategories
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {expandedId === attr.id && (
                        <div className="px-5 pb-4">
                          <ValueList attribute={attr} onUpdate={handleUpdateAttribute} />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </div>

      <AttributeFormDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleAdd}
      />

      <AddExistingAttributeDialog
        open={addExistingOpen}
        onClose={() => setAddExistingOpen(false)}
        onSelect={handleAddExisting}
        allCategories={allCategories}
        currentCategoryId={category.id}
        existingAttributeNames={existingAttributeNames}
      />

      {editTarget && (
        <AttributeFormDialog
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          onSave={data => {
            handleUpdateAttribute({ ...editTarget, ...data })
            setEditTarget(null)
          }}
          initial={editTarget}
          title="Edit Attribute"
        />
      )}

      {mergeTarget && (
        <MergeDialog
          open={!!mergeTarget}
          onClose={() => setMergeTarget(null)}
          onConfirm={() => {
            handleArchive(mergeTarget.id)
            setMergeTarget(null)
          }}
          sourceLabel={mergeTarget.name}
          sourceUsageCount={mergeTarget.allowedValues.reduce((s, v) => s + v.usageCount, 0)}
          options={mergeOptions}
          entityType="attribute"
        />
      )}

      {copyTarget && (
        <CopyAttributeDialog
          open={!!copyTarget}
          onClose={() => setCopyTarget(null)}
          onConfirm={() => setCopyTarget(null)}
          attribute={copyTarget}
          sourceNicheId={nicheId}
        />
      )}
    </div>
  )
}
