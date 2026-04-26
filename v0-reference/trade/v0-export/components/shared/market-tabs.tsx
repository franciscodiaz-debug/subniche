"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

interface MarketTabsProps {
  className?: string
  id?: string
}

const tabs = [
  { href: "/", label: "For Sale" },
  { href: "/trade", label: "Trade" },
]

export function MarketTabs({ className, id }: MarketTabsProps) {
  const pathname = usePathname()

  return (
    <nav
      id={id}
      data-onboarding-id={id}
      className={cn("border-b border-border", className)}
      role="tablist"
      aria-label="Market sections"
    >
      <div className="flex items-center gap-8">
        {tabs.map(({ href, label }) => {
          // The "For Sale" tab lives at `/` now, so `startsWith("/" + "/")`
          // would never fire. Match exact path for root, and prefix-match
          // for the trade tab.
          const isActive =
            href === "/"
              ? pathname === "/" ||
                pathname === "/market" ||
                pathname.startsWith("/market/")
              : pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "-mb-px inline-flex items-center border-b-2 px-1 pb-4 pt-2 text-xl font-semibold tracking-tight transition-colors",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
