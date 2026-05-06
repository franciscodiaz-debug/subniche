"use client"

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { AdminReport, ReportType } from "@/lib/admin/mock-reports"

const typeLabel: Record<ReportType, string> = {
  listing: "Listing",
  user: "User",
  message: "Message",
  collection: "Collection",
  wishlist: "Wishlist",
}

const actionsByType: Record<ReportType, { label: string; variant?: "destructive" | "outline"; action: string }[]> = {
  listing: [
    { label: "Unpublish listing", variant: "destructive", action: "unpublish" },
    { label: "Warn seller", action: "warn" },
    { label: "Suspend seller", variant: "destructive", action: "suspend" },
    { label: "Dismiss report", variant: "outline", action: "dismiss" },
  ],
  user: [
    { label: "Suspend 7 days", variant: "destructive", action: "suspend" },
    { label: "Ban permanently", variant: "destructive", action: "ban" },
    { label: "Dismiss report", variant: "outline", action: "dismiss" },
  ],
  message: [
    { label: "Remove message", variant: "destructive", action: "remove" },
    { label: "Suspend sender", variant: "destructive", action: "suspend" },
    { label: "Dismiss report", variant: "outline", action: "dismiss" },
  ],
  collection: [
    { label: "Remove collection", variant: "destructive", action: "remove" },
    { label: "Dismiss report", variant: "outline", action: "dismiss" },
  ],
  wishlist: [
    { label: "Remove wishlist item", variant: "destructive", action: "remove" },
    { label: "Dismiss report", variant: "outline", action: "dismiss" },
  ],
}

interface ReportActionDialogProps {
  open: boolean
  onClose: () => void
  report: AdminReport | null
  onAction: (reportId: string, action: string) => void
}

export function ReportActionDialog({
  open,
  onClose,
  report,
  onAction,
}: ReportActionDialogProps) {
  if (!report) return null

  const actions = actionsByType[report.type]

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Report: {typeLabel[report.type]}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-border bg-card/50 px-4 py-3 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">{typeLabel[report.type]}</Badge>
              <span className="text-sm text-foreground font-medium">{report.contentSummary}</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Reported by @{report.reportedByUsername}
              </p>
              <p className="mt-1 text-sm text-foreground">{report.reason}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</p>
            {actions.map((a) => (
              <Button
                key={a.action}
                variant={a.variant ?? "default"}
                className="w-full justify-start"
                onClick={() => {
                  onAction(report.id, a.action)
                  onClose()
                }}
              >
                {a.label}
              </Button>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
