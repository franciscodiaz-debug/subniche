"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRightFromLineIcon,
  ChevronDown,
  ChevronUp,
  Repeat2Icon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import type { Community, InboundInterest, PerfectMatch } from "@/lib/types"

type TradeInterestCardProps =
  | {
      type: "perfect"
      data: PerfectMatch
      showScoreOnboarding?: boolean
    }
  | {
      type: "inbound"
      data: InboundInterest
      showScoreOnboarding?: boolean
    }

function getScoreColor(score: number): string {
  if (score >= 8) return "bg-emerald-500/10 text-emerald-600"
  if (score >= 5) return "bg-primary/10 text-primary"
  return "bg-secondary text-muted-foreground"
}

function GroupChips({
  groups,
  expanded,
  onToggle,
}: {
  groups: Community[]
  expanded: boolean
  onToggle: () => void
}) {
  const hasMoreGroups = groups.length > 2
  const visibleGroups = expanded ? groups : groups.slice(0, 2)

  return (
    <div className={cn("flex items-center gap-1", expanded ? "flex-wrap" : "flex-nowrap")}>
      {visibleGroups.map((group, index) => (
        <span
          key={group.id}
          className={cn(
            "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground bg-secondary",
            !expanded && index === 0 && "max-w-[45%] flex-shrink-0",
            !expanded && index === 1 && hasMoreGroups && "max-w-[30%] min-w-0 flex-shrink",
            !expanded && index === 1 && !hasMoreGroups && "min-w-0 flex-1",
            expanded && "flex-shrink-0",
          )}
        >
          {group.icon ? <span className="flex-shrink-0">{group.icon}</span> : null}
          <span className="truncate">{group.name}</span>
        </span>
      ))}

      {hasMoreGroups ? (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault()
            onToggle()
          }}
          className="ml-auto inline-flex flex-shrink-0 items-center gap-0.5 rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-muted"
        >
          {expanded ? (
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
      ) : null}
    </div>
  )
}

export function TradeInterestCard(props: TradeInterestCardProps) {
  if (props.type === "perfect") {
    return (
      <PerfectMatchLayout
        match={props.data}
        showScoreOnboarding={props.showScoreOnboarding ?? false}
      />
    )
  }

  return (
    <InboundInterestLayout
      interest={props.data}
      showScoreOnboarding={props.showScoreOnboarding ?? false}
    />
  )
}

function PerfectMatchLayout({
  match,
  showScoreOnboarding,
}: {
  match: PerfectMatch
  showScoreOnboarding: boolean
}) {
  const [groupsExpanded, setGroupsExpanded] = useState(false)
  const groups = match.their_item.published_groups ?? []
  const niche = match.their_item.niche
  const href = `/${match.their_item.type === "listing" ? "listings" : "collection"}/${match.their_item.id}`

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/50">
      <Link href={href}>
        <div className="relative aspect-[4/3]">
          <Image
            src={match.their_item.images[0] || "/placeholder.svg"}
            alt={match.their_item.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="space-y-1.5 p-3">
        <div>
          <Link href={href}>
            <h3 className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
              {match.their_item.title}
            </h3>
            {match.their_item.subtitle ? (
              <p className="truncate text-xs text-muted-foreground">
                {match.their_item.subtitle}
              </p>
            ) : null}
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {typeof match.their_item.price === "number" ? (
              <p className="text-sm font-semibold text-primary">
                ${match.their_item.price.toLocaleString()}
              </p>
            ) : null}
            <Repeat2Icon className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          {match.their_item.user?.location ? (
            <p className="text-[10px] text-muted-foreground">
              {match.their_item.user.location}
            </p>
          ) : null}
        </div>

        {groups.length > 0 ? (
          <div className="pt-1">
            <GroupChips
              groups={groups}
              expanded={groupsExpanded}
              onToggle={() => setGroupsExpanded((value) => !value)}
            />
          </div>
        ) : niche ? (
          <div className="pt-0">
            <span className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {niche.icon ? <span>{niche.icon}</span> : null}
              <span className="max-w-[120px] truncate">{niche.name}</span>
            </span>
          </div>
        ) : null}

        <div className="relative mt-2 flex items-center gap-2 rounded border border-primary bg-primary/10 px-2 py-1.5">
          <div
            className={cn(
              "absolute right-1 top-1 rounded px-1.5 py-0.5 text-[10px] font-semibold",
              getScoreColor(match.match_score),
            )}
            data-onboarding={showScoreOnboarding ? "match-score" : undefined}
          >
            {match.match_score.toFixed(1)}
          </div>
          <Repeat2Icon className="h-4 w-4 flex-shrink-0 text-primary" />
          <div className="@container min-w-0 flex-1">
            <p className="truncate whitespace-nowrap pr-8 text-[10px] leading-tight text-muted-foreground">
              <span className="@[9rem]:hidden">Trade match for</span>
              <span className="hidden @[9rem]:inline">
                Trade match for your
              </span>
            </p>
            <p className="truncate text-xs font-medium text-foreground">
              {match.my_item.title}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function InboundInterestLayout({
  interest,
  showScoreOnboarding,
}: {
  interest: InboundInterest
  showScoreOnboarding: boolean
}) {
  const [groupsExpanded, setGroupsExpanded] = useState(false)
  const groups = interest.their_item.published_groups ?? []
  const niche = interest.their_item.niche
  const href = `/${interest.their_item.type === "listing" ? "listings" : "collection"}/${interest.their_item.id}`

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/50">
      <Link href={href}>
        <div className="relative aspect-[4/3]">
          <Image
            src={interest.their_item.images[0] || "/placeholder.svg"}
            alt={interest.their_item.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="space-y-1.5 p-3">
        <div>
          <Link href={href}>
            <h3 className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
              {interest.their_item.title}
            </h3>
            {interest.their_item.subtitle ? (
              <p className="truncate text-xs text-muted-foreground">
                {interest.their_item.subtitle}
              </p>
            ) : null}
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {typeof interest.their_item.price === "number" ? (
              <p className="text-sm font-semibold text-primary">
                ${interest.their_item.price.toLocaleString()}
              </p>
            ) : null}
            <Repeat2Icon className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          {interest.their_item.user?.location ? (
            <p className="text-[10px] text-muted-foreground">
              {interest.their_item.user.location}
            </p>
          ) : null}
        </div>

        {groups.length > 0 ? (
          <div className="pt-1">
            <GroupChips
              groups={groups}
              expanded={groupsExpanded}
              onToggle={() => setGroupsExpanded((value) => !value)}
            />
          </div>
        ) : niche ? (
          <div className="pt-1">
            <span className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {niche.icon ? <span>{niche.icon}</span> : null}
              <span className="max-w-[120px] truncate">{niche.name}</span>
            </span>
          </div>
        ) : null}

        <div className="relative mt-2 flex items-center gap-2 rounded bg-secondary px-2 py-1.5">
          <div
            className={cn(
              "absolute right-1 top-1 rounded px-1.5 py-0.5 text-[10px] font-semibold",
              getScoreColor(interest.match_score),
            )}
            data-onboarding={showScoreOnboarding ? "match-score" : undefined}
          >
            {interest.match_score.toFixed(1)}
          </div>
          <ArrowRightFromLineIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="truncate pr-8 text-[10px] leading-tight text-muted-foreground">
              Interested in your
            </p>
            <p className="truncate text-xs font-medium text-foreground">
              {interest.my_item.title}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
