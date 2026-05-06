"use client"

import Link from "next/link"
import { Sparkles, Shield, RotateCcw } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  adminStats,
  adminActivityLog,
  type ActivityLogEntry,
} from "@/lib/admin/mock-admin-dashboard"
import { useAdminSettings } from "@/lib/admin-settings-context"

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const activityIcon: Record<ActivityLogEntry["type"], React.ReactNode> = {
  moderation: <Shield className="h-3.5 w-3.5 text-red-400" />,
  review: <Sparkles className="h-3.5 w-3.5 text-amber-400" />,
}

export function AdminDashboard() {
  const { niches, resetToDefaults } = useAdminSettings()
  const activeNicheCount = niches.filter((n) => n.status === "active").length

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform overview and recent activity.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={resetToDefaults}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset to defaults
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Open Reports"
          value={adminStats.openReports}
          trend="need attention"
          urgent={adminStats.openReports > 0}
          urgentColor="red"
          href="/admin/moderation"
        />
        <StatCard
          label="Pending Review"
          value={adminStats.pendingReview}
          trend="user-defined values"
          urgent={adminStats.pendingReview > 0}
          href="/admin/review"
        />
        <StatCard
          label="Active Niches"
          value={activeNicheCount}
          trend="+1 this month"
          href="/admin/niche-config"
        />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Incoming Activity
        </h2>
        <div className="overflow-hidden rounded-xl border border-border">
          <ul className="divide-y divide-border">
            {adminActivityLog.map((entry) => (
              <li key={entry.id} className="flex items-start gap-3 px-4 py-3">
                <span className="mt-0.5 flex-shrink-0">{activityIcon[entry.type]}</span>
                <p className="flex-1 text-sm text-foreground">{entry.description}</p>
                <span suppressHydrationWarning className="flex-shrink-0 text-xs text-muted-foreground/60">
                  {timeAgo(entry.timestamp)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  trend,
  urgent,
  urgentColor = "amber",
  href,
}: {
  label: string
  value: number
  trend: string
  urgent?: boolean
  urgentColor?: "amber" | "red"
  href: string
}) {
  const numberColor = urgent
    ? urgentColor === "red" ? "text-red-400" : "text-amber-400"
    : "text-foreground"

  return (
    <Link href={href} className="group block">
      <Card className="border-border bg-card transition-colors group-hover:border-primary/40 group-hover:bg-card/70">
        <CardContent className="pt-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className={`mt-1 text-3xl font-semibold tabular-nums ${numberColor}`}>
            {value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">{trend}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

