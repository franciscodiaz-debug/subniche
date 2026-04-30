"use client"

import Link from "next/link"
import { MapPin, Package, FolderOpen, ArrowRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export interface SellerProfile {
  id: string
  username: string
  avatar_url?: string | null
  location?: string | null
  bio?: string | null
  created_at: string
  total_listings?: number
  total_collections?: number
}

interface SellerProfilePreviewProps {
  profile: SellerProfile
  className?: string
}

function calculateProfileHealth(profile: SellerProfile): number {
  let score = 0
  if (profile.avatar_url) score += 20
  if (profile.location) score += 15
  if (profile.bio && profile.bio.length > 20) score += 15
  if ((profile.total_listings || 0) > 0) score += 25
  if ((profile.total_collections || 0) > 0) score += 25
  return score
}

export function SellerProfilePreview({ profile, className }: SellerProfilePreviewProps) {
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  })

  const score = calculateProfileHealth(profile)
  const isStrong = score >= 80
  const profileHref = `/profile/${profile.username}`

  return (
    <TooltipProvider>
      <div
        className={cn(
          "bg-card rounded-lg border border-border p-4",
          className,
        )}
      >
        {/* Single row: avatar + identity on the left, progress pill on the
            right. Removed the separate header row and the trailing chevron —
            the username and avatar are the explicit entry points into the
            profile page. */}
        <div className="flex items-center gap-3">
          <Link
            href={profileHref}
            aria-label={`Open ${profile.username}'s profile`}
            className="shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Avatar className="h-11 w-11 border border-border transition-colors hover:border-primary/60">
              <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
              <AvatarFallback className="bg-muted text-muted-foreground">
                {profile.username?.slice(0, 2).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <Link
              href={profileHref}
              className="inline-block max-w-full font-semibold text-foreground text-sm truncate hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
            >
              {profile.username}
            </Link>
            {profile.bio && (
              <p className="text-xs text-muted-foreground truncate">{profile.bio}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span>{profile.location}</span>
                </span>
              )}
              <span>Joined {memberSince}</span>
            </div>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "group/progress inline-flex items-center gap-2 cursor-help rounded-full shrink-0",
                  "px-2 py-1 transition-all",
                  "hover:bg-primary/5",
                )}
              >
                <div className="relative w-14 h-1.5 bg-muted rounded-full overflow-hidden">
                  {/* Subtle glow behind the fill for extra emphasis on hover */}
                  <div
                    className="absolute inset-y-0 left-0 bg-primary/30 blur-sm transition-opacity duration-300 opacity-0 group-hover/progress:opacity-100"
                    style={{ width: `${score}%` }}
                  />
                  <div
                    className={cn(
                      "relative h-full rounded-full transition-all",
                      isStrong
                        ? "bg-primary shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                        : "bg-primary shadow-[0_0_8px_rgba(234,179,8,0.35)]",
                    )}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span
                  className={cn(
                    "text-xs font-medium tabular-nums transition-colors",
                    isStrong ? "text-primary" : "text-foreground",
                  )}
                >
                  {score}%
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="left"
              className="p-0 overflow-hidden border border-border bg-popover"
            >
              <div className="px-3 py-2.5 space-y-2 w-[200px]">
                <p className="text-sm font-semibold text-foreground">Boost Your Credibility</p>
                <Link
                  href="/profile/settings"
                  className="group inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  Complete Your Profile
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center gap-4 mt-3 pt-2 border-t border-border text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            <span className="text-foreground font-medium">{profile.total_listings || 0}</span> listings
          </span>
          <span className="flex items-center gap-1">
            <FolderOpen className="h-3 w-3" />
            <span className="text-foreground font-medium">{profile.total_collections || 0}</span> collections
          </span>
        </div>
      </div>
    </TooltipProvider>
  )
}
