"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, MoreHorizontal } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { mockReports, type AdminReport, type ReportStatus, type ReportType } from "@/lib/admin/mock-reports"
import { ReportActionDialog } from "./report-action-dialog"
import { cn } from "@/lib/utils"

function TypeBadge({ type, status }: { type: ReportType; status: ReportStatus }) {
  const cls =
    status === "open"
      ? "border-red-400/40 text-white"
      : "border-muted-foreground/30 text-muted-foreground"
  return (
    <Badge variant="outline" className={`text-[10px] ${cls}`}>
      {type}
    </Badge>
  )
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

interface SectionConfig {
  status: ReportStatus
  label: string
  defaultOpen: boolean
  countStyle: (count: number) => string
}

const sections: SectionConfig[] = [
  {
    status: "open",
    label: "Open",
    defaultOpen: true,
    countStyle: (n) => n > 0 ? "text-red-400" : "text-muted-foreground/50",
  },
  {
    status: "resolved",
    label: "Resolved",
    defaultOpen: false,
    countStyle: () => "text-muted-foreground/50",
  },
  {
    status: "dismissed",
    label: "Dismissed",
    defaultOpen: false,
    countStyle: () => "text-muted-foreground/50",
  },
]

function ReportSection({
  config,
  reports,
  onAction,
}: {
  config: SectionConfig
  reports: AdminReport[]
  onAction: (report: AdminReport) => void
}) {
  const [open, setOpen] = useState(config.defaultOpen)

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      {/* Section header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 border-b border-border bg-card/50 px-4 py-3 text-left transition-colors hover:bg-card last:border-b-0"
        style={{ borderBottom: open ? undefined : "none" }}
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/60" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/60" />
        )}
        <span className="text-sm font-medium text-foreground">{config.label}</span>
        <span className={cn("text-xs tabular-nums", config.countStyle(reports.length))}>
          {reports.length}
        </span>
      </button>

      {/* Rows */}
      {open && (
        <Table>
          {reports.length === 0 ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                  No {config.label.toLowerCase()} reports.
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Type</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Reported By</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow
                    key={report.id}
                    className="cursor-pointer"
                    onClick={() => onAction(report)}
                  >
                    <TableCell><TypeBadge type={report.type} status={config.status} /></TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="truncate text-sm text-foreground">{report.contentSummary}</p>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      @{report.reportedByUsername}
                    </TableCell>
                    <TableCell className="max-w-[240px]">
                      <p className="truncate text-sm text-muted-foreground">{report.reason}</p>
                    </TableCell>
                    <TableCell suppressHydrationWarning className="text-xs text-muted-foreground">
                      {timeAgo(report.reportedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground/40" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </>
          )}
        </Table>
      )}
    </div>
  )
}

export function ReportsTable() {
  const [reports, setReports] = useState<AdminReport[]>(mockReports)
  const [actionTarget, setActionTarget] = useState<AdminReport | null>(null)

  function handleAction(reportId: string, action: string) {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? { ...r, status: action === "dismiss" ? ("dismissed" as const) : ("resolved" as const) }
          : r
      )
    )
  }

  return (
    <>
      <div className="space-y-3">
        {sections.map((section) => (
          <ReportSection
            key={section.status}
            config={section}
            reports={reports.filter((r) => r.status === section.status)}
            onAction={setActionTarget}
          />
        ))}
      </div>

      <ReportActionDialog
        open={!!actionTarget}
        onClose={() => setActionTarget(null)}
        report={actionTarget}
        onAction={handleAction}
      />
    </>
  )
}
