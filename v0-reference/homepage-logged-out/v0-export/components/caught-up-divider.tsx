"use client"

import { CheckCircle } from "lucide-react"

export function CaughtUpDivider() {
  return (
    <div className="-mx-4 mb-8 px-4 py-8 md:-mx-8 md:px-8">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-card/50">
          <CheckCircle className="h-6 w-6 text-muted-foreground/60" />
        </div>
        <h3 className="text-base font-medium text-foreground">You&apos;re all caught up</h3>
        <p className="mt-1 text-sm text-muted-foreground/70">
          Your personalized feed ends here. Keep scrolling to explore more.
        </p>
      </div>
    </div>
  )
}
