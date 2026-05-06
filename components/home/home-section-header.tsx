import type { ReactNode } from 'react'
import Link from 'next/link'

interface HomeSectionHeaderProps {
  icon?: ReactNode
  title: string
  href?: string
  ctaLabel?: string
}

export function HomeSectionHeader({ icon, title, href, ctaLabel }: HomeSectionHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      </div>
      {href && ctaLabel ? (
        <Link
          href={href}
          className="text-sm text-primary transition-colors hover:text-primary/80"
        >
          {ctaLabel} →
        </Link>
      ) : null}
    </div>
  )
}
