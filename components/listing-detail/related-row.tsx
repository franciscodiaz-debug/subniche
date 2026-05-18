"use client"

/**
 * Horizontal scroller for the two bottom discovery rows — "More from seller"
 * and "You might also like". Reused so the two rows stay visually identical
 * (same card shape, same scroll behavior). Each row accepts a trailing link
 * (e.g. "View store", "See all") rendered in the heading.
 */

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Repeat2 } from "lucide-react"

import {
  resolveListingHref,
  type MockRelatedCard,
} from "@/lib/mock-listing-detail"

interface RelatedRowProps {
  title: string
  items: MockRelatedCard[]
  trailingLink?: { href: string; label: string }
}

export function RelatedRow({ title, items, trailingLink }: RelatedRowProps) {
  if (items.length === 0) return null

  return (
    <section aria-label={title} className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {trailingLink ? (
          <Link
            href={trailingLink.href}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {trailingLink.label}
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        ) : null}
      </div>

      <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
        {items.map((item) => (
          <RelatedCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

function RelatedCard({ item }: { item: MockRelatedCard }) {
  // Re-route to a real demo mock when item.href points at a prototype id
  // that has no detail page (e.g. /listings/rel-1, /listings/jill-2).
  return (
    <Link
      href={resolveListingHref(item.id)}
      className="group flex w-[180px] flex-shrink-0 flex-col overflow-hidden rounded-card border border-border bg-card transition-colors hover:border-primary/50 md:w-[200px]"
    >
      <div className="relative aspect-[4/3] w-full bg-muted">
        <Image
          src={item.imageUrl || "/placeholder.svg"}
          alt={item.title}
          fill
          sizes="200px"
          className="object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between gap-1.5 p-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-primary">
            {item.title}
          </h3>
          {item.subtitle ? (
            <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
          ) : null}
        </div>
        <div className="flex items-center justify-between">
          {typeof item.price === "number" ? (
            <span className="text-sm font-semibold text-primary">
              ${item.price.toLocaleString('en-US')}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Collection</span>
          )}
          {item.forTrade ? (
            <Repeat2 className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          ) : null}
        </div>
      </div>
    </Link>
  )
}
