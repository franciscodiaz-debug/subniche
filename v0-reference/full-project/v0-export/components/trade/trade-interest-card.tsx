"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRightFromLineIcon, Repeat2Icon, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PerfectMatch, InboundInterest, Community } from "@/lib/types"
import { useState } from "react"

type TradeInterestCardProps = ({ type: "perfect"; data: PerfectMatch } | { type: "inbound"; data: InboundInterest }) & {
  showScoreOnboarding?: boolean
}

function getScoreColor(score: number): string {
  if (score >= 8) return "text-emerald-600 bg-emerald-500/10"
  if (score >= 5) return "text-amber-600 bg-amber-500/10"
  return "text-muted-foreground bg-secondary"
}

export function TradeInterestCard(props: TradeInterestCardProps) {
  const isPerfect = props.type === "perfect"
  const showScoreOnboarding = props.showScoreOnboarding ?? false

  if (isPerfect) {
    return <PerfectMatchLayout match={props.data} showScoreOnboarding={showScoreOnboarding} />
  }

  return <InboundInterestLayout interest={props.data} showScoreOnboarding={showScoreOnboarding} />
}

function PerfectMatchLayout({ match, showScoreOnboarding }: { match: PerfectMatch; showScoreOnboarding: boolean }) {
  const { my_item, their_item, match_score } = match
  const user = their_item.user as { username?: string; avatar_url?: string; id?: string; location?: string } | undefined
  const niche = (their_item as { niche?: { name: string; icon?: string } }).niche
  const groups = (their_item as { published_groups?: Community[] }).published_groups || []
  const [groupsExpanded, setGroupsExpanded] = useState(false)
  const hasMoreGroups = groups.length > 2
  const visibleGroups = groupsExpanded ? groups : groups.slice(0, 2)

  return (
    <div
      className={cn(
        "group relative bg-card rounded-lg overflow-hidden transition-all",
        "border border-border hover:border-primary/50",
      )}
    >
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

      <div className="p-3 space-y-1.5">
        {/* Title and subtitle */}
        <div>
          <Link href={`/${their_item.type === "listing" ? "listings" : "collection"}/${their_item.id}`}>
            <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
              {their_item.title}
            </h3>
            {(their_item as { subtitle?: string }).subtitle && (
              <p className="text-xs text-muted-foreground truncate">{(their_item as { subtitle?: string }).subtitle}</p>
            )}
          </Link>
        </div>

        {/* Price and location row - matches discover-listing-card */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {their_item.price && (
              <p className="text-sm font-semibold text-primary">${their_item.price.toLocaleString()}</p>
            )}
            <Repeat2Icon className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          {user?.location && <p className="text-[10px] text-muted-foreground">{user.location}</p>}
        </div>

        {/* Published groups - matches discover-listing-card */}
        {groups.length > 0 && (
          <div className="pt-1">
            <div className={cn("flex items-center gap-1", groupsExpanded ? "flex-wrap" : "flex-nowrap")}>
              {visibleGroups.map((group, index) => (
                <span
                  key={group.id}
                  className={cn(
                    "inline-flex items-center gap-1 px-1.5 py-0.5 bg-secondary rounded text-[10px] text-muted-foreground",
                    !groupsExpanded && index === 0 && "flex-shrink-0 max-w-[45%]",
                    !groupsExpanded && index === 1 && hasMoreGroups && "flex-shrink min-w-0 max-w-[30%]",
                    !groupsExpanded && index === 1 && !hasMoreGroups && "flex-1 min-w-0",
                    groupsExpanded && "flex-shrink-0",
                  )}
                >
                  {group.icon && <span className="flex-shrink-0">{group.icon}</span>}
                  <span className="truncate">{group.name}</span>
                </span>
              ))}
              {hasMoreGroups && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    setGroupsExpanded(!groupsExpanded)
                  }}
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-secondary hover:bg-muted rounded text-[10px] text-muted-foreground transition-colors flex-shrink-0 ml-auto"
                >
                  {groupsExpanded ? (
                    <>
                      <span>Less</span>
                      <ChevronUp className="h-2.5 w-2.5" />
                    </>
                  ) : (
                    <>
                      <span>+{groups.length - 2}</span>
                      <ChevronDown className="h-2.5 w-2.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Fallback: show niche if no groups */}
        {groups.length === 0 && niche && (
          <div className="pt-0">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-secondary rounded text-[10px] text-muted-foreground">
              {niche.icon && <span>{niche.icon}</span>}
              <span className="truncate max-w-[120px]">{niche.name}</span>
            </span>
          </div>
        )}

        <div className="relative flex items-center gap-2 px-2 py-1.5 bg-primary/10 rounded border border-primary mt-2">
          <div
            className={cn(
              "absolute top-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-semibold",
              getScoreColor(match_score),
            )}
            data-onboarding={showScoreOnboarding ? "match-score" : undefined}
          >
            {match_score.toFixed(1)}
          </div>
          <Repeat2Icon className="h-4 w-4 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0 pr-8">
            <p className="text-[10px] text-muted-foreground leading-tight">Trade match for your</p>
            <p className="text-xs font-medium text-foreground truncate">{my_item.title}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function InboundInterestLayout({
  interest,
  showScoreOnboarding,
}: { interest: InboundInterest; showScoreOnboarding: boolean }) {
  const { my_item, their_item, match_score } = interest
  const user = their_item.user as { username?: string; avatar_url?: string; id?: string; location?: string } | undefined
  const niche = (their_item as { niche?: { name: string; icon?: string } }).niche
  const groups = (their_item as { published_groups?: Community[] }).published_groups || []
  const [groupsExpanded, setGroupsExpanded] = useState(false)
  const hasMoreGroups = groups.length > 2
  const visibleGroups = groupsExpanded ? groups : groups.slice(0, 2)

  return (
    <div
      className={cn(
        "group relative bg-card rounded-lg overflow-hidden transition-all",
        "border border-border hover:border-primary/50",
      )}
    >
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

      <div className="p-3 space-y-1.5">
        {/* Title and subtitle */}
        <div>
          <Link href={`/${their_item.type === "listing" ? "listings" : "collection"}/${their_item.id}`}>
            <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
              {their_item.title}
            </h3>
            {(their_item as { subtitle?: string }).subtitle && (
              <p className="text-xs text-muted-foreground truncate">{(their_item as { subtitle?: string }).subtitle}</p>
            )}
          </Link>
        </div>

        {/* Price and location row - matches discover-listing-card */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {their_item.price && (
              <p className="text-sm font-semibold text-primary">${their_item.price.toLocaleString()}</p>
            )}
            <Repeat2Icon className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          {user?.location && <p className="text-[10px] text-muted-foreground">{user.location}</p>}
        </div>

        {/* Published groups - matches discover-listing-card */}
        {groups.length > 0 && (
          <div className="pt-1">
            <div className={cn("flex items-center gap-1", groupsExpanded ? "flex-wrap" : "flex-nowrap")}>
              {visibleGroups.map((group, index) => (
                <span
                  key={group.id}
                  className={cn(
                    "inline-flex items-center gap-1 px-1.5 py-0.5 bg-secondary rounded text-[10px] text-muted-foreground",
                    !groupsExpanded && index === 0 && "flex-shrink-0 max-w-[45%]",
                    !groupsExpanded && index === 1 && hasMoreGroups && "flex-shrink min-w-0 max-w-[30%]",
                    !groupsExpanded && index === 1 && !hasMoreGroups && "flex-1 min-w-0",
                    groupsExpanded && "flex-shrink-0",
                  )}
                >
                  {group.icon && <span className="flex-shrink-0">{group.icon}</span>}
                  <span className="truncate">{group.name}</span>
                </span>
              ))}
              {hasMoreGroups && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    setGroupsExpanded(!groupsExpanded)
                  }}
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-secondary hover:bg-muted rounded text-[10px] text-muted-foreground transition-colors flex-shrink-0 ml-auto"
                >
                  {groupsExpanded ? (
                    <>
                      <span>Less</span>
                      <ChevronUp className="h-2.5 w-2.5" />
                    </>
                  ) : (
                    <>
                      <span>+{groups.length - 2}</span>
                      <ChevronDown className="h-2.5 w-2.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Fallback: show niche if no groups */}
        {groups.length === 0 && niche && (
          <div className="pt-1">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-secondary rounded text-[10px] text-muted-foreground">
              {niche.icon && <span>{niche.icon}</span>}
              <span className="truncate max-w-[120px]">{niche.name}</span>
            </span>
          </div>
        )}

        <div className="relative flex items-center gap-2 px-2 py-1.5 bg-secondary rounded mt-2">
          <div
            className={cn(
              "absolute top-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-semibold",
              getScoreColor(match_score),
            )}
            data-onboarding={showScoreOnboarding ? "match-score" : undefined}
          >
            {match_score.toFixed(1)}
          </div>
          <ArrowRightFromLineIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0 pr-8">
            <p className="text-[10px] text-muted-foreground leading-tight">Interested in your</p>
            <p className="text-xs font-medium text-foreground truncate">{my_item.title}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
