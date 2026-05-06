"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { AdminAttribute, AttributeInputType, AttributeProminence } from "@/lib/admin/mock-taxonomy"

const inputTypes: { value: AttributeInputType; label: string }[] = [
  { value: "select", label: "Select (single)" },
  { value: "multi-select", label: "Multi-select" },
  { value: "number", label: "Number" },
  { value: "range", label: "Range" },
  { value: "boolean", label: "Yes / No" },
  { value: "string", label: "Text (free)" },
  { value: "user-defined", label: "User-defined (with review)" },
]

interface AttributeFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (data: Pick<AdminAttribute, "name" | "inputType" | "required" | "prominence">) => void
  initial?: Pick<AdminAttribute, "name" | "inputType" | "required" | "prominence">
  title?: string
}

export function AttributeFormDialog({
  open,
  onClose,
  onSave,
  initial,
  title = "Add Attribute",
}: AttributeFormDialogProps) {
  const [name, setName] = useState(initial?.name ?? "")
  const [inputType, setInputType] = useState<AttributeInputType>(initial?.inputType ?? "select")
  const [required, setRequired] = useState(initial?.required ?? false)
  const [prominence, setProminence] = useState<AttributeProminence>(initial?.prominence ?? "secondary")

  function handleSave() {
    if (!name.trim()) return
    onSave({ name: name.trim(), inputType, required, prominence })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="attr-name">Name</Label>
            <Input id="attr-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Brand" />
          </div>
          <div className="space-y-1.5">
            <Label>Input Type</Label>
            <Select value={inputType} onValueChange={(v) => setInputType(v as AttributeInputType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {inputTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Prominence</Label>
            <Select value={prominence} onValueChange={(v) => setProminence(v as AttributeProminence)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary (shown first)</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
                <SelectItem value="hidden">Hidden (admin only)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="attr-required">Required for publishing</Label>
            <Switch id="attr-required" checked={required} onCheckedChange={setRequired} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim()}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
