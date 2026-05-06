"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { mockReviewQueue, type ReviewQueueItem, type ReviewStatus } from "@/lib/admin/mock-review-queue"
import { ReviewActionDialog } from "./review-action-dialog"

type FilterTab = "all" | "pending" | "approved" | "rejected"

function ConfidenceBar({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100)
  const color =
    confidence >= 0.8
      ? "bg-emerald-500"
      : confidence >= 0.5
      ? "bg-amber-500"
      : "bg-red-500"
  const textColor =
    confidence >= 0.8
      ? "text-emerald-400"
      : confidence >= 0.5
      ? "text-amber-400"
      : "text-red-400"

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-border">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-semibold tabular-nums ${textColor}`}>{pct}%</span>
    </div>
  )
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const statusBadge: Record<ReviewStatus, React.ReactNode> = {
  pending: <Badge variant="outline" className="text-amber-400 border-amber-400/30">Pending</Badge>,
  approved: <Badge variant="outline" className="text-emerald-400 border-emerald-400/30">Approved</Badge>,
  normalized: <Badge variant="outline" className="text-emerald-400 border-emerald-400/30">Normalized</Badge>,
  rejected: <Badge variant="outline" className="text-red-400 border-red-400/30">Rejected</Badge>,
}

export function ReviewQueuePage() {
  const [items, setItems] = useState<ReviewQueueItem[]>(mockReviewQueue)
  const [tab, setTab] = useState<FilterTab>("pending")
  const [reviewTarget, setReviewTarget] = useState<ReviewQueueItem | null>(null)
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false)

  const HIGH_CONFIDENCE = 0.85

  const filtered = items.filter((item) => {
    if (tab === "all") return true
    if (tab === "pending") return item.status === "pending"
    if (tab === "approved") return item.status === "approved" || item.status === "normalized"
    if (tab === "rejected") return item.status === "rejected"
    return true
  })

  const pendingCount = items.filter((i) => i.status === "pending").length
  const highConfidencePending = items.filter(
    (i) => i.status === "pending" && i.aiConfidence >= HIGH_CONFIDENCE
  )

  function handleResolve(id: string, status: ReviewStatus) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)))
  }

  function handleBulkApprove() {
    setItems((prev) =>
      prev.map((i) =>
        i.status === "pending" && i.aiConfidence >= HIGH_CONFIDENCE
          ? { ...i, status: "approved" as ReviewStatus }
          : i
      )
    )
    setBulkConfirmOpen(false)
  }

  function handleQuickApprove(id: string) {
    handleResolve(id, "approved")
  }

  function handleQuickReject(id: string) {
    handleResolve(id, "rejected")
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Review Queue</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            User-defined taxonomy values awaiting validation.
          </p>
        </div>
        {highConfidencePending.length > 0 ? (
          <Button
            variant="outline"
            onClick={() => setBulkConfirmOpen(true)}
            className="gap-2 text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10"
          >
            <Sparkles className="h-4 w-4" />
            Bulk approve high-confidence ({highConfidencePending.length})
          </Button>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        {(["all", "pending", "approved", "rejected"] as FilterTab[]).map((t) => {
          const label =
            t === "all" ? `All (${items.length})`
            : t === "pending" ? `Pending (${pendingCount})`
            : t === "approved" ? "Approved"
            : "Rejected"
          const isActive = tab === t
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-foreground/20 text-foreground border border-foreground/20"
                  : "bg-card text-muted-foreground hover:bg-card/80 hover:text-foreground border border-border"
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Submitted Value</TableHead>
              <TableHead>AI Suggestion</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Attribute</TableHead>
              <TableHead>By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                  Nothing here.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm font-medium">
                    {item.submittedValue}
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.aiSuggestion ? (
                      <span className="text-foreground">{item.aiSuggestion}</span>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <ConfidenceBar confidence={item.aiConfidence} />
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>
                      <p className="text-foreground">{item.attributeName}</p>
                      <p className="text-xs text-muted-foreground">{item.nicheName}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    @{item.submittedByUsername}
                  </TableCell>
                  <TableCell suppressHydrationWarning className="text-xs text-muted-foreground">
                    {timeAgo(item.submittedAt)}
                  </TableCell>
                  <TableCell>{statusBadge[item.status]}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1.5">
                      {item.status === "pending" ? (
                        <>
                          {item.aiConfidence >= HIGH_CONFIDENCE ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10"
                              onClick={() => handleQuickApprove(item.id)}
                            >
                              Approve
                            </Button>
                          ) : null}
                          {item.aiConfidence < 0.5 ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs text-red-400 border-red-400/30 hover:bg-red-400/10"
                              onClick={() => handleQuickReject(item.id)}
                            >
                              Reject
                            </Button>
                          ) : null}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => setReviewTarget(item)}
                          >
                            Review
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-muted-foreground"
                          onClick={() => setReviewTarget(item)}
                        >
                          View
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ReviewActionDialog
        open={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
        item={reviewTarget}
        onResolve={handleResolve}
      />

      <AlertDialog open={bulkConfirmOpen} onOpenChange={setBulkConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bulk approve {highConfidencePending.length} values?</AlertDialogTitle>
            <AlertDialogDescription>
              All pending values with AI confidence above {Math.round(HIGH_CONFIDENCE * 100)}% will be approved and added to shared taxonomy. This cannot be undone automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkApprove}>
              Approve {highConfidencePending.length} values
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
