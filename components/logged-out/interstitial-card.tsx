import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface InterstitialCardProps {
  eyebrow: string
  title: string
  description: string
  icon: LucideIcon
  ctaLabel: string
  ctaHref: string
}

export function InterstitialCard({
  eyebrow,
  title,
  description,
  icon: Icon,
  ctaLabel,
  ctaHref,
}: InterstitialCardProps) {
  return (
    <div className="my-10 rounded-2xl border border-border bg-card px-6 py-8 md:px-10 md:py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-10">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="mb-1 text-xs font-medium uppercase tracking-widest text-primary">
            {eyebrow}
          </p>
          <h2 className="text-lg font-bold text-foreground md:text-xl">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>

        <Button asChild className="shrink-0 rounded-xl" size="default">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      </div>
    </div>
  )
}
