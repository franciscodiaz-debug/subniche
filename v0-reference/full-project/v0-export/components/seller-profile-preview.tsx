"use client"

import { TooltipTrigger } from "@/components/ui/tooltip"

import { useState } from "react"
import { MapPin, Package, FolderOpen, ChevronRight, ShieldCheck, AlertCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { Profile } from "@/lib/types"

interface SellerProfilePreviewProps {
  profile: Profile
  className?: string
}

// Calculate profile health score (0-100)
function calculateProfileHealth(profile: Profile): { score: number; suggestions: string[] } {
  let score = 0
  const suggestions: string[] = []

  // Avatar (20 points)
  if (profile.avatar_url) {
    score += 20
  } else {
    suggestions.push("Add a profile photo")
  }

  // Location (15 points)
  if (profile.location) {
    score += 15
  } else {
    suggestions.push("Add your location")
  }

  // Bio (15 points)
  if (profile.bio && profile.bio.length > 20) {
    score += 15
  } else {
    suggestions.push("Write a bio to tell others about yourself")
  }

  // Listings (15 points)
  if ((profile.total_listings || 0) > 0) {
    score += 15
  } else {
    suggestions.push("Create your first listing")
  }

  // Collections (15 points)
  if ((profile.total_collections || 0) > 0) {
    score += 15
  } else {
    suggestions.push("Create a collection to showcase your gear")
  }

  return { score, suggestions }
}

// Get health indicator color and label
function getHealthIndicator(score: number): { color: string; bgColor: string; label: string } {
  if (score >= 80) {
    return { color: "text-emerald-400", bgColor: "bg-emerald-400", label: "Excellent" }
  } else if (score >= 60) {
    return { color: "text-sky-400", bgColor: "bg-sky-400", label: "Good" }
  } else if (score >= 40) {
    return { color: "text-muted-foreground", bgColor: "bg-muted-foreground", label: "Building" }
  } else {
    return { color: "text-muted-foreground", bgColor: "bg-muted-foreground", label: "New" }
  }
}

export function SellerProfilePreview({ profile, className }: SellerProfilePreviewProps) {
  const [isHovered, setIsHovered] = useState(false)

  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  })

  const { score, suggestions } = calculateProfileHealth(profile)
  const healthIndicator = getHealthIndicator(score)

  return (
    <TooltipProvider>
      <div
        className={cn(
          "bg-card rounded-lg border border-border p-4 transition-all cursor-pointer",
          isHovered && "border-primary/50",
          className,
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header label */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Your Profile</span>

          {/* Profile Health Indicator */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 cursor-help">
                <div className="flex items-center gap-1">
                  {/* Mini progress bar */}
                  <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all bg-yellow-500/50"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className="text-xs text-yellow-500/70">{score}%</span>
                </div>
                {score < 80 ? (
                  <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-[240px] p-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Profile Health</span>
                  <span className={cn("text-sm font-medium", healthIndicator.color)}>{healthIndicator.label}</span>
                </div>
                {suggestions.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Boost your credibility:</p>
                    <ul className="text-xs space-y-0.5">
                      {suggestions.slice(0, 3).map((suggestion, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Main profile row */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <Avatar className="h-12 w-12 border-2 border-border">
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
            <AvatarFallback className="bg-muted text-muted-foreground">
              {profile.username?.slice(0, 2).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Username */}
            <h3 className="font-semibold text-foreground truncate">{profile.username}</h3>

            {/* Subtitle under username */}
            {profile.bio && <p className="text-xs text-muted-foreground truncate">{profile.bio}</p>}

            {/* Stats row */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 flex-wrap">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>{profile.location}</span>
                </span>
              )}
              <span>Joined {memberSince}</span>
            </div>
          </div>

          {/* Chevron */}
          <ChevronRight
            className={cn("h-5 w-5 text-muted-foreground transition-all", isHovered && "text-primary translate-x-0.5")}
          />
        </div>

        {/* Stats row - compact inline version */}
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
