'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChecklistItem {
  id: string
  label: string
  href: string
  done: boolean
}

const defaultItems: ChecklistItem[] = [
  { id: 'profile', label: 'Complete your profile', href: '/profile/edit', done: false },
  { id: 'listing', label: 'Create your first listing', href: '/create-listing', done: false },
  { id: 'trade', label: 'Set trade interests on a listing', href: '/my-stuff', done: false },
  { id: 'community', label: 'Join a community', href: '/communities', done: false },
  { id: 'collection', label: 'Start a collection', href: '/my-stuff?tab=collections', done: false },
]

interface OnboardingChecklistProps {
  className?: string
}

export function OnboardingChecklist({ className }: OnboardingChecklistProps) {
  const [items, setItems] = useState(defaultItems)
  const [expanded, setExpanded] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const doneCount = items.filter((i) => i.done).length
  const total = items.length

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    )
  }

  return (
    <section
      className={cn(
        'rounded-xl border border-primary/30 bg-card p-4 md:p-5',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary text-sm font-bold">
            {doneCount}/{total}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Get started with SubNiche
            </h2>
            <p className="text-xs text-muted-foreground">
              {doneCount === total
                ? "You're all set! 🎉"
                : `${total - doneCount} step${total - doneCount !== 1 ? 's' : ''} left`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {expanded ? (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-secondary/50"
                onClick={(e) => {
                  e.preventDefault()
                  toggleItem(item.id)
                }}
              >
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                )}
                <span
                  className={cn(
                    'text-sm',
                    item.done
                      ? 'text-muted-foreground line-through'
                      : 'text-foreground'
                  )}
                >
                  {item.label}
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
