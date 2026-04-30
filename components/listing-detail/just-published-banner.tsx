"use client"

/**
 * Confirmation banner shown above the detail view when the user has
 * just finished creating a listing. Dismissible, and dismissing also
 * clears the cached draft so refreshing the page lands on the empty
 * state (the user has acknowledged the confirmation).
 */

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, X } from "lucide-react"

interface JustPublishedBannerProps {
  /** Invoked when the user dismisses the banner — the parent wires this to
   * `clearDraft` so the cached form state goes away too. */
  onClearDraft: () => void
}

export function JustPublishedBanner({ onClearDraft }: JustPublishedBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    onClearDraft()
  }

  return (
    <div
      /* Full-bleed band at the very top of the listing so the win moment
         is unmissable. The soft green mirrors the status-success token so
         it reads as celebratory without clashing with the primary brand. */
      role="status"
      aria-live="polite"
      className="border-b border-status-success/30 bg-status-success/10"
    >
      <div className="mx-auto flex w-full max-w-[1280px] items-start gap-3 px-4 py-3 md:px-6 lg:px-8">
        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-status-success" />
        <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Your listing is live.
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              This is exactly how other collectors will see it. You can keep
              editing from the actions panel.
            </p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <Link
              href="/create-listing"
              className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              Add another
            </Link>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="-mr-1 -mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
