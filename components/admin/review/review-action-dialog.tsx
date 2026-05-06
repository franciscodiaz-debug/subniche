"use client"

import { useState } from "react"
import { ExternalLink } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ReviewQueueItem, ReviewStatus } from "@/lib/admin/mock-review-queue"

type ReviewAction = "approve" | "normalize" | "merge" | "reject"

interface ReviewActionDialogProps {
  open: boolean
  onClose: () => void
  item: ReviewQueueItem | null
  onResolve: (id: string, status: ReviewStatus) => void
  existingValues?: { id: string; label: string }[]
}

export function ReviewActionDialog({
  open,
  onClose,
  item,
  onResolve,
  existingValues = [],
}: ReviewActionDialogProps) {
  const [action, setAction] = useState<ReviewAction>("approve")
  const [normalizedValue, setNormalizedValue] = useState("")
  const [mergeTargetId, setMergeTargetId] = useState("")
  const [rejectReason, setRejectReason] = useState("")

  if (!item) return null

  const confidencePct = Math.round(item.aiConfidence * 100)
  const confidenceColor =
    item.aiConfidence >= 0.8
      ? "text-emerald-400"
      : item.aiConfidence >= 0.5
      ? "text-amber-400"
      : "text-red-400"

  function handleConfirm() {
    const statusMap: Record<ReviewAction, ReviewStatus> = {
      approve: "approved",
      normalize: "normalized",
      merge: "approved",
      reject: "rejected",
    }
    onResolve(item!.id, statusMap[action])
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Review Submission</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Submitted value card */}
          <div className="rounded-lg border border-border bg-card/50 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Submitted value</p>
                <p className="mt-0.5 font-mono text-lg font-semibold text-foreground">
                  {item.submittedValue}
                </p>
                <p className="text-xs text-muted-foreground">
                  by @{item.submittedByUsername} · {item.attributeName} · {item.nicheName}
                </p>
              </div>
              {item.aiSuggestion ? (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">AI suggestion</p>
                  <p className="font-medium text-foreground">{item.aiSuggestion}</p>
                  <p className={`text-sm font-semibold ${confidenceColor}`}>
                    {confidencePct}%
                  </p>
                </div>
              ) : (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className={`text-sm font-semibold ${confidenceColor}`}>
                    {confidencePct}%
                  </p>
                </div>
              )}
            </div>

            <div className="mt-3 border-t border-border/60 pt-3">
              <p className="text-xs text-muted-foreground">AI reasoning</p>
              <p className="mt-1 text-sm text-foreground/80">{item.aiReasoning}</p>
            </div>

            {item.originatingListingId ? (
              <a
                href={`/listings/${item.originatingListingId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                See originating listing
              </a>
            ) : null}
          </div>

          {/* Action selector */}
          <div className="space-y-1.5">
            <Label>Action</Label>
            <Select value={action} onValueChange={(v) => setAction(v as ReviewAction)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approve">Approve as-is</SelectItem>
                <SelectItem value="normalize">
                  Normalize to correct form
                </SelectItem>
                <SelectItem value="merge">Merge into existing value</SelectItem>
                <SelectItem value="reject">Reject</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional fields */}
          {action === "normalize" ? (
            <div className="space-y-1.5">
              <Label>Normalized form</Label>
              <Input
                value={normalizedValue}
                onChange={(e) => setNormalizedValue(e.target.value)}
                placeholder={item.aiSuggestion ?? "Corrected value"}
              />
            </div>
          ) : null}

          {action === "merge" ? (
            <div className="space-y-1.5">
              <Label>Merge into</Label>
              <Select value={mergeTargetId} onValueChange={setMergeTargetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select existing value…" />
                </SelectTrigger>
                <SelectContent>
                  {existingValues.length > 0
                    ? existingValues.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.label}
                        </SelectItem>
                      ))
                    : <SelectItem value="__none" disabled>No values available</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {action === "reject" ? (
            <div className="space-y-1.5">
              <Label>Reason (optional)</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Spam, irrelevant, unclear…"
                rows={2}
              />
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            variant={action === "reject" ? "destructive" : "default"}
            disabled={action === "merge" && !mergeTargetId}
          >
            {action === "approve" && "Approve"}
            {action === "normalize" && "Normalize & Approve"}
            {action === "merge" && "Merge"}
            {action === "reject" && "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
