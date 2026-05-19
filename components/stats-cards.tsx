"use client"

import { Package, Heart } from "lucide-react"
import Link from "next/link"

interface QuickStatProps {
  icon: React.ReactNode
  label: string
  value: number
  href: string
}

function QuickStat({ icon, label, value, href }: QuickStatProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <span className="transition-colors group-hover:text-primary">
        {icon}
      </span>
      <span>{label}</span>
      <span className="text-foreground">{value}</span>
    </Link>
  )
}

export function StatsCards() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm">
      <QuickStat
        icon={<Package className="h-3.5 w-3.5" />}
        label="Items"
        value={12}
        href="/my-stuff"
      />
      <span className="text-border">·</span>
      <QuickStat
        icon={<Heart className="h-3.5 w-3.5" />}
        label="Following"
        value={28}
        href="/following"
      />
    </div>
  )
}
