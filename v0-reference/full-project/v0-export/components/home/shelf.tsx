"use client"

import type React from "react"

import { ChevronRight } from "lucide-react"
import Link from "next/link"

interface ShelfProps {
  title: string
  linkHref?: string
  linkLabel?: string
  children: React.ReactNode
}

export function Shelf({ title, linkHref, linkLabel, children }: ShelfProps) {
  return (
    <section className="bg-card rounded-xl p-4 border-border shadow-sm border-0">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {linkHref && (
          <Link
            href={linkHref}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            See more
            <ChevronRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      <div
        className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-4 sm:overflow-visible sm:pb-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>
    </section>
  )
}
