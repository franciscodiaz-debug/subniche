"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeftRight, MessageCircle, Sparkles } from "lucide-react"
import type { PerfectMatch } from "@/lib/types"

interface PerfectMatchCardProps {
  match: PerfectMatch
}

export function PerfectMatchCard({ match }: PerfectMatchCardProps) {
  const { my_item, their_item, match_score } = match

  return (
    <div className="bg-card rounded-lg border border-primary/30 overflow-hidden hover:border-primary/50 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-primary/10 border-b border-primary/20">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">Perfect Match</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/20 rounded text-xs text-primary">
          <span>{match_score}% match</span>
        </div>
      </div>

      {/* Items comparison */}
      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* My item */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-2">Your Item</p>
            <Link
              href={`/${my_item.type === "listing" ? "listings" : "collection"}/${my_item.id}`}
              className="block group"
            >
              <div className="aspect-square relative rounded-lg overflow-hidden bg-secondary mb-2">
                <Image
                  src={my_item.images[0] || "/placeholder.svg?height=200&width=200&query=item"}
                  alt={my_item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <h4 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                {my_item.title}
              </h4>
              {my_item.price && <p className="text-sm text-primary">${my_item.price.toLocaleString()}</p>}
            </Link>
          </div>

          {/* Trade arrow */}
          <div className="flex flex-col items-center gap-2 px-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <ArrowLeftRight className="h-5 w-5 text-primary" />
            </div>
          </div>

          {/* Their item */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-2">Their Item</p>
            <Link
              href={`/${their_item.type === "listing" ? "listings" : "collection"}/${their_item.id}`}
              className="block group"
            >
              <div className="aspect-square relative rounded-lg overflow-hidden bg-secondary mb-2">
                <Image
                  src={their_item.images[0] || "/placeholder.svg?height=200&width=200&query=item"}
                  alt={their_item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <h4 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                {their_item.title}
              </h4>
              {their_item.price && <p className="text-sm text-primary">${their_item.price.toLocaleString()}</p>}
            </Link>
          </div>
        </div>

        {/* Criteria summary */}
        <div className="mt-4 pt-4 border-t border-border space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-0.5 bg-secondary rounded">{their_item.category}</span>
            {their_item.subcategory && (
              <span className="px-2 py-0.5 bg-secondary rounded">{their_item.subcategory}</span>
            )}
            {their_item.condition && <span className="px-2 py-0.5 bg-secondary rounded">{their_item.condition}</span>}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          <Link
            href={`/${their_item.type === "listing" ? "listings" : "collection"}/${their_item.id}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            View Match
          </Link>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors text-sm">
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Message</span>
          </button>
        </div>
      </div>
    </div>
  )
}
