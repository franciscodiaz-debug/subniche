"use client"

import { useState } from "react"
import { MapPin, Package, FolderOpen, ChevronRight, ShieldCheck, AlertCircle } from "lucide-react"
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

function calculateProfileHealth(profile: SellerProfile): {
  score: number
  suggestions: string[]
} {
  let score = 0
  const suggestions: string[] = []

  if (profile.avatar_url) score += 20
  else suggestions.push("Add a profile photo")

  if (profile.location) score += 15
  else suggestions.push("Add your location")

  if (profile.bio && profile.bio.length > 20) score += 15
  else suggestions.push("Write a short bio")

  if ((profile.total_listings || 0) > 0) score += 25
  else suggestions.push("Create your first listing")

  if ((profile.total_collections || 0) > 0) score += 25
  else suggestions.push("Create a collection")

  return { score, suggestions }
}

export function SellerProfilePreview({ profile, className }: SellerProfilePreviewProps) {
  const [isHovered, setIsHovered] = useState(false)

  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  })

  const { score, suggestions } = calculateProfileHealth(profile)
  const isStrong = score >= 80

  return (
    <TooltipProvider>
      <div
        className={cn(
          "bg-card rounded-lg border border-border p-4 transition-colors cursor-pointer",
          isHovered && "border-primary/50",
          className,
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wide">
            Your Profile
          </span>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 cursor-help">
                <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/70 transition-all"
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{score}%</span>
                {isStrong ? (
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-[240px] p-3">
              <div className="space-y-2">
                <div className="flex flex-col">
                  <span className="font-medium text-sm">Profile Health</span>
                  <span className={cn("text-xs font-medium", isStrong ? "text-primary" : "text-muted-foreground")}>
                    {isStrong ? "Great" : "Building"}
                  </span>
                </div>
                {suggestions.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Boost your credibility:</p>
                    <ul className="text-xs space-y-0.5">
                      {suggestions.slice(0, 3).map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 border border-border">
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
            <AvatarFallback className="bg-muted text-muted-foreground">
              {profile.username?.slice(0, 2).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate text-sm">{profile.username}</h3>
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

          <ChevronRight
            className={cn(
              "h-4 w-4 text-muted-foreground transition-all",
              isHovered && "text-primary translate-x-0.5",
            )}
          />
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
