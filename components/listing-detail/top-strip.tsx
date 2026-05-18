"use client"

/**
 * Top strip for the listing detail page.
 *
 * Stacks three pieces — category breadcrumb, availability badges, and an
 * optional mutual match banner — in a full-width zone above the two-column
 * layout so the most-important buying signal (mutual match) never gets
 * buried inside the right sidebar.
 */

import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Repeat2, ShoppingBag, BookOpen, Sparkles } from "lucide-react"

import type { AvailabilityType, MockMutualMatch } from "@/lib/mock-listing-detail"
import { cn } from "@/lib/utils"

interface TopStripProps {
  categoryPath: string[]
  availability: AvailabilityType[]
  mutualMatch: MockMutualMatch | null
}

const AVAILABILITY_CONFIG: Record<
  AvailabilityType,
  { label: string; icon: React.ComponentType<{ className?: string }>; tone: string }
> = {
  "for-sale": {
    label: "For Sale",
    icon: ShoppingBag,
    tone: "bg-primary/10 text-primary border-primary/30",
  },
  "for-trade": {
    label: "Open to Trade",
    icon: Repeat2,
    tone: "bg-info/10 text-info border-info/30",
  },
  collection: {
    label: "Keeping",
    icon: BookOpen,
    tone: "bg-secondary text-secondary-foreground border-border",
  },
}

export function TopStrip({ categoryPath, availability, mutualMatch }: TopStripProps) {
  return (
    <div className="space-y-4">
      {/* Breadcrumb + availability row. On mobile we stack; on sm+ they
          sit on one line with breadcrumb truncating before the badges. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Category" className="min-w-0">
          <ol className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <li className="flex-shrink-0">
              <Link
                href="/"
                className="transition-colors hover:text-foreground"
              >
                Marketplace
              </Link>
            </li>
            {categoryPath.map((segment, index) => {
              const href = `/browse/${categoryPath
                .slice(0, index + 1)
                .map((s) => s.toLowerCase().replace(/\s+/g, "-"))
                .join("/")}`
              const isLast = index === categoryPath.length - 1
              return (
                <li key={segment} className="flex min-w-0 items-center gap-1.5">
                  <ChevronRight className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                  {isLast ? (
                    <span className="truncate text-foreground">{segment}</span>
                  ) : (
                    <Link
                      href={href}
                      className="truncate transition-colors hover:text-foreground"
                    >
                      {segment}
                    </Link>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          {availability.map((type) => {
            const config = AVAILABILITY_CONFIG[type]
            const Icon = config.icon
            return (
              <span
                key={type}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                  config.tone,
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {config.label}
              </span>
            )
          })}
        </div>
      </div>

      {mutualMatch ? <MutualMatchBanner match={mutualMatch} /> : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Mutual match banner                                                        */
/* -------------------------------------------------------------------------- */

function MutualMatchBanner({ match }: { match: MockMutualMatch }) {
  return (
    <div
      className="flex items-center gap-3 rounded-card border border-primary/40 bg-primary/10 p-3 md:gap-4 md:p-4"
      role="status"
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary md:h-11 md:w-11">
        <Sparkles className="h-5 w-5" aria-hidden="true" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Mutual Match
          </p>
          <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary tabular-nums">
            {match.matchScore.toFixed(1)}
          </span>
        </div>
        <p className="truncate text-sm text-foreground">{match.summary}</p>
      </div>

      <Link
        href={match.viewerListingHref}
        className="group flex flex-shrink-0 items-center gap-2 rounded-md border border-border bg-card px-2 py-1.5 transition-colors hover:border-primary/60"
      >
        <div className="relative h-9 w-9 overflow-hidden rounded-sm bg-muted md:h-10 md:w-10">
          <Image
            src={match.viewerListingImage || "/placeholder.svg"}
            alt={match.viewerListingTitle}
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
        <div className="hidden min-w-0 flex-col pr-1 md:flex">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Your listing
          </span>
          <span className="max-w-[180px] truncate text-xs font-medium text-foreground">
            {match.viewerListingTitle}
          </span>
        </div>
      </Link>
    </div>
  )
}
