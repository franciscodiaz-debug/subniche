import type { LucideIcon } from "lucide-react"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { Button } from "../ui/button"

export interface InterstitialCardProps {
  eyebrow: string
  title: string
  description: string
  icon: LucideIcon
  ctaLabel: string
  ctaHref: string
}

/**
 * Full-width marketing banner used between feed sections on the
 * logged-out home. Matches the calm dark + gold system: bg-card surface,
 * border-border, rounded-lg, muted supporting copy, primary gold CTA.
 */
export function InterstitialCard({
  eyebrow,
  title,
  description,
  icon: Icon,
  ctaLabel,
  ctaHref,
}: InterstitialCardProps) {
  return (
    <section className="my-6 md:my-8">
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40 md:flex-row md:items-center md:gap-6 md:p-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            {eyebrow}
          </p>
          <h3 className="mt-1 text-balance text-base font-semibold text-foreground md:text-lg">
            {title}
          </h3>
          <p className="mt-1 text-pretty text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="shrink-0 md:pl-2">
          <Button
            asChild
            size="sm"
            className="h-9 gap-1.5 rounded-lg px-4"
          >
            <Link href={ctaHref}>
              {ctaLabel}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
