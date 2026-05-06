"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowLeft,
  FolderTree,
  LayoutDashboard,
  Settings,
  Shield,
  Sparkles,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { SubnicheLogo } from "@/components/app-shell/subniche-logo"
import { pendingReviewCount } from "@/lib/admin/mock-review-queue"

interface NavItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  exact?: boolean
  badge?: number
}

interface NavSection {
  label: string
  items: NavItem[]
}

const sections: NavSection[] = [
  {
    label: "Overview",
    items: [
      { href: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
    ],
  },
  {
    label: "Taxonomy",
    items: [
      { href: "/admin/taxonomy", icon: FolderTree, label: "Niches & Categories" },
      { href: "/admin/review", icon: Sparkles, label: "Review Queue", badge: pendingReviewCount },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/admin/moderation", icon: Shield, label: "Moderation" },
    ],
  },
  {
    label: "Configuration",
    items: [
      { href: "/admin/niche-config", icon: Settings, label: "Niche Config" },
    ],
  },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-[240px] flex-shrink-0 flex-col border-r border-border bg-background">
      <div className="flex items-center gap-2 px-5 py-4">
        <SubnicheLogo width={90} height={28} light priority />
        <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Admin
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {sections.map((section) => (
          <div key={section.label} className="mb-1">
            <p className="px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              {section.label}
            </p>
            {section.items.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-card text-foreground"
                      : "text-muted-foreground hover:bg-card/50 hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge != null && item.badge > 0 ? (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/15 px-1.5 text-[11px] font-semibold text-primary">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-border px-3 py-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground/60 transition-colors hover:bg-card/50 hover:text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to SubNiche</span>
        </Link>
      </div>
    </aside>
  )
}
