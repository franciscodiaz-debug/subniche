'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CirclePlay, Heart, Package, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OnboardingStep {
  id: string
  icon: React.ElementType
  title: string
  description: string
  href: string
  current: number
  target: number | null
  totalForPercent?: number
}

const steps: OnboardingStep[] = [
  {
    id: 'listings',
    icon: Package,
    title: 'List 3 items',
    description: 'Show the community what you are bringing to the table.',
    href: '/create-listing',
    current: 1,
    target: 3,
  },
  {
    id: 'trade',
    icon: Heart,
    title: 'Set 3 trade interests',
    description: 'Tell other collectors what you are looking for.',
    href: '/my-stuff',
    current: 0,
    target: 3,
  },
  {
    id: 'profile',
    icon: User,
    title: 'Complete profile',
    description: 'A few details help buyers and traders know who you are.',
    href: '/profile/edit',
    current: 0,
    target: null,
    totalForPercent: 5,
  },
]

function getProgressLabel(step: OnboardingStep): string {
  if (step.target !== null) return `${step.current}/${step.target}`
  const pct = step.totalForPercent
    ? Math.round((step.current / step.totalForPercent) * 100)
    : 0
  return `${pct}%`
}

export function OnboardingChecklist({ className }: { className?: string }) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <section className={cn('space-y-3', className)}>
      {steps.map((step) => {
        const active = step.current > 0
        const Icon = step.icon

        return (
          <Link
            key={step.id}
            href={step.href}
            className={cn(
              'flex items-center gap-4 rounded-xl border bg-card px-5 py-4 transition-colors hover:border-primary/50',
              active ? 'border-primary/50' : 'border-border',
            )}
          >
            {/* Step icon */}
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                active ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground',
              )}
            >
              <Icon className="h-5 w-5" />
            </div>

            {/* Text content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{step.title}</span>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-1.5 py-0.5 text-[11px] font-medium',
                    active
                      ? 'bg-primary/15 text-primary'
                      : 'bg-secondary text-muted-foreground',
                  )}
                >
                  {getProgressLabel(step)}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
            </div>

            {/* Video play trigger — own fixed-width zone so it sits
                visually between the text and the nav arrow */}
            <div className="flex w-14 shrink-0 items-center justify-center">
              <CirclePlay className="h-7 w-7 text-muted-foreground/40 transition-colors hover:text-primary" />
            </div>

            {/* Nav arrow */}
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        )
      })}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          I'll do this later
        </button>
      </div>
    </section>
  )
}
