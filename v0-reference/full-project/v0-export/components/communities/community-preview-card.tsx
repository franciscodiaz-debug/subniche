"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Users, ShoppingBag, LogIn, Check, MapPin, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CommunityEnhanced } from "@/lib/types"

interface CommunityPreviewCardProps {
  community: CommunityEnhanced
  variant?: "default" | "compact" | "popular"
}

export function CommunityPreviewCard({ community, variant = "default" }: CommunityPreviewCardProps) {
  const [isMember, setIsMember] = useState(community.is_member || false)

  const handleJoinClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsMember(!isMember)
  }

  const getCategoryIcon = () => {
    switch (community.category) {
      case "geographic":
        return <MapPin className="h-3 w-3" />
      case "interest":
        return <Sparkles className="h-3 w-3" />
      default:
        return null
    }
  }

  if (variant === "compact") {
    return (
      <Link href={`/communities/${community.slug}`}>
        <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors">
          {/* Icon */}
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl shrink-0">
            {community.icon}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{community.name}</h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {community.member_count.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <ShoppingBag className="h-3 w-3" />
                {community.listing_count}
              </span>
            </div>
          </div>

          {/* Member badge */}
          {isMember && (
            <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full flex items-center gap-1">
              <Check className="h-3 w-3" />
              Joined
            </span>
          )}
        </div>
      </Link>
    )
  }

  if (variant === "popular") {
    return (
      <Link href={`/communities/${community.slug}`}>
        <div className="relative bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors group">
          {/* Cover Image */}
          <div className="h-24 relative bg-gradient-to-br from-primary/20 to-primary/5">
            {community.cover_image && (
              <Image
                src={community.cover_image || "/placeholder.svg"}
                alt={community.name}
                fill
                className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />

            {/* Icon overlay */}
            <div className="absolute bottom-2 left-3 flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-card/90 backdrop-blur-sm flex items-center justify-center text-xl border border-border">
                {community.icon}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 pt-2">
            <h3 className="font-semibold text-foreground truncate">{community.name}</h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {community.member_count.toLocaleString()}
              </span>
              {community.category && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-muted rounded">
                  {getCategoryIcon()}
                  {community.category === "geographic"
                    ? "Local"
                    : community.category.charAt(0).toUpperCase() + community.category.slice(1)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // Default variant
  return (
    <Link href={`/communities/${community.slug}`}>
      <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors group">
        {/* Cover Image */}
        <div className="h-28 relative bg-gradient-to-br from-primary/20 to-primary/5">
          {community.cover_image && (
            <Image
              src={community.cover_image || "/placeholder.svg"}
              alt={community.name}
              fill
              className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="p-4 -mt-6 relative">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center text-2xl mb-2 shadow-sm">
            {community.icon}
          </div>

          <h3 className="font-semibold text-foreground truncate">{community.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1 min-h-[40px]">{community.description}</p>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {community.member_count.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <ShoppingBag className="h-3 w-3" />
                {community.listing_count}
              </span>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={handleJoinClick}
              className="h-8 text-xs text-foreground/70 hover:text-foreground"
            >
              {isMember ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Joined
                </>
              ) : (
                <>
                  <LogIn className="h-3 w-3 mr-1" />
                  Join
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )
}
