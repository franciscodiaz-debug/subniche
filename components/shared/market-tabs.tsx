"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

interface MarketTabsProps {
  className?: string
  id?: string
  /**
   * Optional right-side content rendered inline with the tabs. Used by the
   * Trade page to dock the "Trade Interests" gear button next to the tab
   * it belongs to, without pushing it into a separate toolbar row.
   */
  trailing?: React.ReactNode
}

// Routes adapted to the project's federated module layout: both For Sale and
// Trade live under their own top-level routes so the Market module is a
// standalone spoke (it does not hijack `/`).
const tabs = [
  { href: "/market", label: "For Sale" },
  { href: "/trade", label: "Trade" },
]

export function MarketTabs({ className, id, trailing }: MarketTabsProps) {
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
          const isActive =
            pathname === href || pathname.startsWith(href + "/")
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
        {/* Trailing cluster lives on the baseline (pb-3 ≈ visual center of
            the tab labels) rather than stretched to the right edge — the
            gear should feel attached to the Trade tab, not floated. */}
        {trailing ? (
          <div className="ml-1 flex items-center pb-3 pt-2">{trailing}</div>
        ) : null}
      </div>
    </nav>
  )
}
