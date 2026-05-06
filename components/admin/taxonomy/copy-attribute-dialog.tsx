"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { mockNiches, mockCategories, type AdminAttribute } from "@/lib/admin/mock-taxonomy"

interface CopyAttributeDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (targetNicheId: string, targetCategoryId: string) => void
  attribute: AdminAttribute
  sourceNicheId: string
}

export function CopyAttributeDialog({
  open,
  onClose,
  onConfirm,
  attribute,
  sourceNicheId,
}: CopyAttributeDialogProps) {
  const [targetNicheId, setTargetNicheId] = useState("")
  const [targetCategoryId, setTargetCategoryId] = useState("")

  const otherNiches = mockNiches.filter((n) => n.id !== sourceNicheId)
  const categoriesForNiche = mockCategories.filter((c) => c.nicheId === targetNicheId)

  function handleNicheChange(nicheId: string) {
    setTargetNicheId(nicheId)
    setTargetCategoryId("")
  }

  function handleClose() {
    setTargetNicheId("")
    setTargetCategoryId("")
    onClose()
  }

  function handleConfirm() {
    if (!targetNicheId || !targetCategoryId) return
    onConfirm(targetNicheId, targetCategoryId)
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Copy Attribute to Another Niche</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-border bg-card/50 px-4 py-3">
            <p className="text-xs text-muted-foreground">Copying</p>
            <p className="mt-0.5 font-medium text-foreground">{attribute.name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {attribute.inputType} · {attribute.allowedValues.length} allowed value{attribute.allowedValues.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Target niche</Label>
            <Select value={targetNicheId} onValueChange={handleNicheChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select niche…" />
              </SelectTrigger>
              <SelectContent>
                {otherNiches.map((n) => (
                  <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Target category</Label>
            <Select
              value={targetCategoryId}
              onValueChange={setTargetCategoryId}
              disabled={!targetNicheId}
            >
              <SelectTrigger>
                <SelectValue placeholder={targetNicheId ? "Select category…" : "Select a niche first"} />
              </SelectTrigger>
              <SelectContent>
                {categoriesForNiche.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="text-xs text-muted-foreground">
            A new attribute with a new stable ID will be created. Allowed values are copied; they will not be shared with the source.
          </p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!targetNicheId || !targetCategoryId}>
            Copy Attribute
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
