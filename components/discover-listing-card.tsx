"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ChevronDown,
  ChevronUp,
  Heart,
  Lock,
  Repeat2Icon,
  Search,
} from "lucide-react"

import { cn } from "@/lib/utils"
import type { Community, DiscoverListing } from "@/lib/types"

interface DiscoverListingCardProps {
  listing: DiscoverListing
  viewMode?: "grid" | "list"
  isFollowing?: boolean
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

  if (groups.length === 0) {
    return null
  }

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

export function DiscoverListingCard({
  listing,
  viewMode = "grid",
  isFollowing: initialIsFollowing = false,
}: DiscoverListingCardProps) {
  const [groupsExpanded, setGroupsExpanded] = useState(false)
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const groups = listing.published_groups ?? []
  const href = `/listings/${listing.id}`
  const imageSrc = listing.images[0] || "/placeholder.svg"

  if (viewMode === "list") {
    return (
      <div
        className={cn(
          "group relative overflow-hidden rounded-lg border border-border bg-card transition-all",
          listing.is_private ? "opacity-80 hover:opacity-100" : "hover:border-primary/50",
        )}
      >
        <div className="flex">
          <Link href={href} className="block flex-shrink-0">
            <div className="relative aspect-[4/3] w-28 sm:w-32">
              <Image
                src={imageSrc}
                alt={listing.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />

              {listing.is_private ? (
                <div className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded bg-background/90 px-1.5 py-0.5 text-[10px] text-muted-foreground backdrop-blur-sm">
                  <Lock className="h-3 w-3" />
                  <span>Private</span>
                </div>
              ) : null}
            </div>
          </Link>

          <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
            <div className="space-y-1">
              <Link href={href}>
                <h3 className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                  {listing.title}
                </h3>
                {listing.matched_saved_search || listing.subtitle ? (
                  <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    {listing.matched_saved_search ? (
                      <>
                        <Search className="h-3 w-3 flex-shrink-0" />
                        <span className="text-foreground/70">{listing.matched_saved_search}</span>
                      </>
                    ) : (
                      listing.subtitle
                    )}
                  </p>
                ) : null}
              </Link>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-primary">
                    ${listing.price.toLocaleString('en-US')}
                  </p>
                  {listing.for_trade ? (
                    <Repeat2Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : null}
                </div>
                {listing.location ? (
                  <p className="text-[10px] text-muted-foreground">{listing.location}</p>
                ) : null}
              </div>
            </div>

            <div className="mt-auto pt-1.5">
              <GroupChips
                groups={groups}
                expanded={groupsExpanded}
                onToggle={() => setGroupsExpanded((value) => !value)}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all",
        "hover:border-primary/50",
        listing.is_private && "opacity-80 hover:opacity-100",
      )}
    >
      <Link href={href}>
        <div className="relative aspect-[4/3]">
          <Image
            src={imageSrc}
            alt={listing.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              setIsFollowing((value) => !value)
            }}
            className={cn(
              "absolute right-2 top-2 rounded-full p-1.5 backdrop-blur-sm transition-all",
              "bg-background/80 hover:bg-background/90",
              isFollowing
                ? "opacity-100 text-chart-5"
                : "opacity-0 text-muted-foreground group-hover:opacity-100 hover:text-foreground",
            )}
            title={isFollowing ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={cn("h-4 w-4", isFollowing && "fill-current")} />
          </button>

          {listing.is_private ? (
            <div className="absolute left-2 top-2 flex items-center gap-1 rounded bg-background/90 px-1.5 py-0.5 text-[10px] text-muted-foreground backdrop-blur-sm">
              <Lock className="h-3 w-3" />
              <span>Private</span>
            </div>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col space-y-1.5 p-3">
        <div>
          <Link href={href}>
            <h3 className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
              {listing.title}
            </h3>
            {listing.matched_saved_search || listing.subtitle ? (
              <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                {listing.matched_saved_search ? (
                  <>
                    <Search className="h-3 w-3 flex-shrink-0" />
                    <span className="text-foreground/70">{listing.matched_saved_search}</span>
                  </>
                ) : (
                  listing.subtitle
                )}
              </p>
            ) : null}
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-primary">
              ${listing.price.toLocaleString('en-US')}
            </p>
            {listing.for_trade ? (
              <Repeat2Icon className="h-3.5 w-3.5 text-muted-foreground" />
            ) : null}
          </div>
          {listing.location ? (
            <p className="text-[10px] text-muted-foreground">{listing.location}</p>
          ) : null}
        </div>

        <div className="mt-auto min-h-[26px] pt-1">
          <GroupChips
            groups={groups}
            expanded={groupsExpanded}
            onToggle={() => setGroupsExpanded((value) => !value)}
          />
        </div>
      </div>
    </div>
  )
}
