"use client"

import { usePathname } from "next/navigation"
import { Shield } from "lucide-react"

const labels: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/taxonomy": "Niches & Categories",
  "/admin/review": "Review Queue",
  "/admin/moderation": "Moderation",
  "/admin/niche-config": "Niche Config",
}

function getLabel(pathname: string): string {
  if (labels[pathname]) return labels[pathname]
  for (const [prefix, label] of Object.entries(labels)) {
    if (pathname.startsWith(prefix + "/")) return label
  }
  return "Admin"
}

export function AdminTopbar() {
  const pathname = usePathname()
  const label = getLabel(pathname)

  return (
    <header className="flex h-12 flex-shrink-0 items-center justify-between border-b border-border px-6">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Shield className="h-3.5 w-3.5" />
        <span>super-admin</span>
      </div>
    </header>
  )
}
