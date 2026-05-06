"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CategoryFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (name: string) => void
  initial?: string
  title?: string
  parentLabel?: string
}

export function CategoryFormDialog({
  open,
  onClose,
  onSave,
  initial = "",
  title = "Add Category",
  parentLabel,
}: CategoryFormDialogProps) {
  const [name, setName] = useState(initial)

  function handleSave() {
    if (!name.trim()) return
    onSave(name.trim())
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {parentLabel ? (
            <p className="text-sm text-muted-foreground">Under: {parentLabel}</p>
          ) : null}
        </DialogHeader>
        <div className="space-y-1.5 py-2">
          <Label htmlFor="cat-name">Name</Label>
          <Input
            id="cat-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim()}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
