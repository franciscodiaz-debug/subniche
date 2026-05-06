"use client"

import { useState, useMemo } from "react"
import { Search, ArrowLeft } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { AdminAttribute, AdminCategory } from "@/lib/admin/mock-taxonomy"

const inputTypeLabel: Record<AdminAttribute["inputType"], string> = {
  select: "select",
  "multi-select": "multi",
  number: "number",
  range: "range",
  boolean: "bool",
  string: "text",
  "user-defined": "user",
}

interface AttributeCandidate {
  attribute: AdminAttribute
  sourceCategoryName: string
}

interface AddExistingAttributeDialogProps {
  open: boolean
  onClose: () => void
  onSelect: (attribute: AdminAttribute) => void
  allCategories: AdminCategory[]
  currentCategoryId: string
  existingAttributeNames: Set<string>
}

export function AddExistingAttributeDialog({
  open,
  onClose,
  onSelect,
  allCategories,
  currentCategoryId,
  existingAttributeNames,
}: AddExistingAttributeDialogProps) {
  const [search, setSearch] = useState("")
  const [picked, setPicked] = useState<AttributeCandidate | null>(null)
  const [checkedValueIds, setCheckedValueIds] = useState<Set<string>>(new Set())

  function handleClose() {
    setSearch("")
    setPicked(null)
    setCheckedValueIds(new Set())
    onClose()
  }

  function handlePickAttribute(candidate: AttributeCandidate) {
    setPicked(candidate)
    setCheckedValueIds(new Set())
  }

  function handleBack() {
    setPicked(null)
    setCheckedValueIds(new Set())
  }

  function toggleValue(id: string) {
    setCheckedValueIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleConfirm() {
    if (!picked) return
    const activeValues = picked.attribute.allowedValues.filter((v) => v.status === "active")
    const filtered = activeValues.filter((v) => checkedValueIds.has(v.id))
    onSelect({ ...picked.attribute, allowedValues: filtered })
    handleClose()
  }

  const candidates = useMemo<AttributeCandidate[]>(() => {
    const results: AttributeCandidate[] = []
    for (const cat of allCategories) {
      for (const attr of cat.attributes) {
        if (attr.status !== "active") continue
        if (existingAttributeNames.has(attr.name.toLowerCase())) continue
        results.push({ attribute: attr, sourceCategoryName: cat.name })
      }
    }
    results.sort((a, b) => {
      const aOwn = a.attribute.categoryId === currentCategoryId
      const bOwn = b.attribute.categoryId === currentCategoryId
      if (aOwn !== bOwn) return aOwn ? 1 : -1
      return a.attribute.name.localeCompare(b.attribute.name)
    })
    return results
  }, [allCategories, existingAttributeNames, currentCategoryId])

  const filtered = search.trim()
    ? candidates.filter(
        (c) =>
          c.attribute.name.toLowerCase().includes(search.toLowerCase()) ||
          c.sourceCategoryName.toLowerCase().includes(search.toLowerCase())
      )
    : candidates

  const activeValues = picked?.attribute.allowedValues.filter((v) => v.status === "active") ?? []

  // Step 2: value selection
  if (picked) {
    return (
      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
        <DialogContent className="max-w-md p-0">
          <DialogHeader className="px-5 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleBack}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <DialogTitle>{picked.attribute.name}</DialogTitle>
              <Badge variant="outline" className="text-[10px] font-normal">
                {inputTypeLabel[picked.attribute.inputType]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Choose which values to bring over. Leave all unchecked to start with a blank value list.
            </p>
          </DialogHeader>

          <div className="border-t border-border">
            {activeValues.length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted-foreground">
                No values defined in {picked.sourceCategoryName} — the attribute will be added with an empty value list.
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-border px-5 py-2.5">
                  <p className="text-xs text-muted-foreground">
                    From <span className="text-foreground">{picked.sourceCategoryName}</span>
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCheckedValueIds(new Set(activeValues.map((v) => v.id)))}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Select all
                    </button>
                    <button
                      onClick={() => setCheckedValueIds(new Set())}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <ul className="max-h-[280px] overflow-y-auto divide-y divide-border">
                  {activeValues.map((value) => (
                    <li key={value.id}>
                      <label className="flex cursor-pointer items-center gap-3 px-5 py-2.5 hover:bg-card/60 transition-colors">
                        <Checkbox
                          checked={checkedValueIds.has(value.id)}
                          onCheckedChange={() => toggleValue(value.id)}
                        />
                        <span className="flex-1 text-sm text-foreground">{value.label}</span>
                        {value.usageCount > 0 && (
                          <span className="text-xs text-muted-foreground/50">
                            {value.usageCount} uses
                          </span>
                        )}
                      </label>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <p className="text-xs text-muted-foreground">
              {checkedValueIds.size > 0
                ? `${checkedValueIds.size} value${checkedValueIds.size === 1 ? "" : "s"} selected`
                : "No values — blank slate"}
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleClose}>Cancel</Button>
              <Button size="sm" onClick={handleConfirm}>Add Attribute</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Step 1: attribute picker
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle>Add Existing Attribute</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Pick an attribute to add. You'll choose which values to bring over in the next step.
          </p>
        </DialogHeader>

        <div className="border-t border-border px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Search attributes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-sm"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-[360px] overflow-y-auto border-t border-border">
          {filtered.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              {search ? "No matching attributes." : "No attributes available to add."}
            </p>
          ) : (
            <ul>
              {filtered.map((c) => (
                <li key={`${c.attribute.id}-${c.sourceCategoryName}`}>
                  <button
                    onClick={() => handlePickAttribute(c)}
                    className="flex w-full items-center gap-3 border-b border-border px-5 py-3 text-left last:border-b-0 hover:bg-card/60 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{c.attribute.name}</p>
                      <p className="text-xs text-muted-foreground">
                        from {c.sourceCategoryName}
                        {c.attribute.allowedValues.filter((v) => v.status === "active").length > 0
                          ? ` · ${c.attribute.allowedValues.filter((v) => v.status === "active").length} values`
                          : ""}
                      </p>
                    </div>
                    <Badge variant="outline" className="flex-shrink-0 text-[10px] font-normal">
                      {inputTypeLabel[c.attribute.inputType]}
                    </Badge>
                    {c.attribute.required && (
                      <span className="flex-shrink-0 text-[10px] text-muted-foreground/60">req</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
