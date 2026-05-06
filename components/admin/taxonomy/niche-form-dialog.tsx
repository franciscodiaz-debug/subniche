"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { AdminNiche } from "@/lib/admin/mock-taxonomy"

interface NicheFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (data: Pick<AdminNiche, "name" | "tagline" | "description">) => void
  initial?: Pick<AdminNiche, "name" | "tagline" | "description">
  title?: string
  nameOnly?: boolean
}

export function NicheFormDialog({
  open,
  onClose,
  onSave,
  initial,
  title = "Add Niche",
  nameOnly = false,
}: NicheFormDialogProps) {
  const [name, setName] = useState(initial?.name ?? "")
  const [tagline, setTagline] = useState(initial?.tagline ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")

  function handleSave() {
    if (!name.trim()) return
    onSave({ name: name.trim(), tagline: tagline.trim(), description: description.trim() })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {nameOnly && (
            <p className="text-sm text-muted-foreground">
              Set a name to get started — fill in all other details in the config screen.
            </p>
          )}
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="niche-name">Name</Label>
            <Input
              id="niche-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="e.g. Guitars"
              autoFocus
            />
          </div>
          {!nameOnly && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="niche-tagline">Tagline</Label>
                <Input id="niche-tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Short niche description" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="niche-desc">Description</Label>
                <Textarea id="niche-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Longer description of the niche" rows={3} />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim()}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
