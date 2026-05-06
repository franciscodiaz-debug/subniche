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
import { AlertTriangle } from "lucide-react"

interface MergeOption {
  id: string
  label: string
}

interface MergeDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (targetId: string) => void
  sourceLabel: string
  sourceUsageCount: number
  options: MergeOption[]
  entityType?: string
}

export function MergeDialog({
  open,
  onClose,
  onConfirm,
  sourceLabel,
  sourceUsageCount,
  options,
  entityType = "value",
}: MergeDialogProps) {
  const [targetId, setTargetId] = useState("")
  const [step, setStep] = useState<1 | 2>(1)

  function handleClose() {
    setTargetId("")
    setStep(1)
    onClose()
  }

  function handleConfirm() {
    if (!targetId) return
    onConfirm(targetId)
    handleClose()
  }

  const targetLabel = options.find((o) => o.id === targetId)?.label

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Merge {entityType}</DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-border bg-card/50 px-4 py-3">
              <p className="text-xs text-muted-foreground">Merging</p>
              <p className="mt-0.5 font-medium text-foreground">{sourceLabel}</p>
              <p className="text-xs text-muted-foreground">{sourceUsageCount} item{sourceUsageCount !== 1 ? "s" : ""} using this {entityType}</p>
            </div>
            <div className="space-y-1.5">
              <Label>Merge into</Label>
              <Select value={targetId} onValueChange={setTargetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target…" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((o) => (
                    <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <div>
                <p className="font-medium">This cannot be undone.</p>
                <p className="mt-1 text-amber-400/80">
                  <strong>{sourceUsageCount}</strong> item{sourceUsageCount !== 1 ? "s" : ""} will be migrated from <strong>{sourceLabel}</strong> to <strong>{targetLabel}</strong>. The source {entityType} will be deactivated.
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          {step === 1 ? (
            <Button onClick={() => setStep(2)} disabled={!targetId}>Continue</Button>
          ) : (
            <Button variant="destructive" onClick={handleConfirm}>Confirm Merge</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
