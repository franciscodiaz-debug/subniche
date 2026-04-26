"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowDownLeft, Send } from "lucide-react"
import type { InboundInterest } from "@/lib/types"

interface InboundInterestCardProps {
  interest: InboundInterest
}

export function InboundInterestCard({ interest }: InboundInterestCardProps) {
  const { their_item, their_criteria, match_score } = interest
  const user = their_item.user as { username?: string; avatar_url?: string } | undefined

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden hover:border-primary/50 transition-colors group">
      {/* Header badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 border-b border-border">
        <ArrowDownLeft className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Wants your item</span>
        <span className="ml-auto text-xs text-primary">{match_score}%</span>
      </div>

      {/* Item image */}
      <Link href={`/${their_item.type === "listing" ? "listings" : "collection"}/${their_item.id}`}>
        <div className="aspect-[4/3] relative">
          <Image
            src={their_item.images[0] || "/placeholder.svg?height=300&width=400&query=trade item"}
            alt={their_item.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 space-y-2">
        <Link href={`/${their_item.type === "listing" ? "listings" : "collection"}/${their_item.id}`}>
          <h4 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
            {their_item.title}
          </h4>
        </Link>

        <div className="flex items-center justify-between">
          {their_item.price && <p className="text-lg font-bold text-primary">${their_item.price.toLocaleString()}</p>}
          {their_item.condition && <span className="text-xs text-muted-foreground">{their_item.condition}</span>}
        </div>

        {/* Looking for */}
        {their_criteria.description && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">Looking for:</p>
            <p className="text-sm text-foreground line-clamp-2">&quot;{their_criteria.description}&quot;</p>
          </div>
        )}

        {/* User info */}
        {user && (
          <div className="flex items-center gap-2 pt-2">
            <div className="w-6 h-6 rounded-full bg-secondary overflow-hidden">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url || "/placeholder.svg"}
                  alt={user.username || "User"}
                  width={24}
                  height={24}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                  {user.username?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{user.username}</span>
          </div>
        )}

        {/* Propose trade button */}
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium mt-2">
          <Send className="h-4 w-4" />
          <span>Propose Trade</span>
        </button>
      </div>
    </div>
  )
}
