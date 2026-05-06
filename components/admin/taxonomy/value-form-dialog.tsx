"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ValueFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (label: string, subcategoryIds?: string[]) => void
  initial?: string
  title?: string
  attributeName?: string
  subcategories?: Array<{ id: string; name: string }>
  defaultSubcategoryIds?: string[]
}

export function ValueFormDialog({
  open,
  onClose,
  onSave,
  initial = "",
  title = "Add Allowed Value",
  attributeName,
  subcategories,
  defaultSubcategoryIds,
}: ValueFormDialogProps) {
  const [label, setLabel] = useState(initial)
  const [selectedIds, setSelectedIds] = useState<string[]>(defaultSubcategoryIds ?? [])

  useEffect(() => {
    if (open) {
      setLabel(initial)
      setSelectedIds(defaultSubcategoryIds ?? [])
    }
  }, [open, initial, defaultSubcategoryIds])

  function toggleId(id: string) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function handleSave() {
    if (!label.trim()) return
    onSave(label.trim(), selectedIds.length > 0 ? selectedIds : undefined)
    onClose()
  }

  const showScopeSelector = subcategories && subcategories.length > 0

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {attributeName ? (
            <p className="text-sm text-muted-foreground">For attribute: {attributeName}</p>
          ) : null}
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="val-label">Value label</Label>
            <Input
              id="val-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Fender"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>

          {showScopeSelector && (
            <div className="space-y-2">
              <div>
                <Label>Applies to</Label>
                <p className="text-xs text-muted-foreground">
                  Leave all unchecked to apply to every subcategory.
                </p>
              </div>
              <div className="space-y-1.5 rounded-md border border-border p-3">
                {subcategories.map((sub) => (
                  <label
                    key={sub.id}
                    className="flex cursor-pointer items-center gap-2.5 rounded px-1 py-0.5 hover:bg-card/60"
                  >
                    <Checkbox
                      checked={selectedIds.includes(sub.id)}
                      onCheckedChange={() => toggleId(sub.id)}
                    />
                    <span className="text-sm">{sub.name}</span>
                  </label>
                ))}
              </div>
              {selectedIds.length === 0 && (
                <p className="text-xs text-muted-foreground/60">
                  Currently universal — visible in all subcategories.
                </p>
              )}
              {selectedIds.length > 0 && (
                <p className="text-xs text-muted-foreground/60">
                  Scoped to {selectedIds.length} subcategor{selectedIds.length === 1 ? "y" : "ies"}.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!label.trim()}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
