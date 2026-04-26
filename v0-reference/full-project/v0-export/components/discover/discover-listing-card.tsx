"use client"

import Link from "next/link"
import Image from "next/image"
import { Repeat2Icon, Lock, ChevronDown, ChevronUp, Search, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Listing, Community } from "@/lib/types"
import { useState } from "react"

interface DiscoverListing extends Listing {
  for_trade?: boolean
  is_private?: boolean
  published_groups?: Community[]
  matched_saved_search?: string
}

interface DiscoverListingCardProps {
  listing: DiscoverListing
  viewMode?: "grid" | "list"
  isFollowing?: boolean
}

export function DiscoverListingCard({ listing, viewMode = "grid", isFollowing: initialIsFollowing = false }: DiscoverListingCardProps) {
  const [groupsExpanded, setGroupsExpanded] = useState(false)
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)

  const groups = listing.published_groups || []
  const hasMoreGroups = groups.length > 2
  const visibleGroups = groupsExpanded ? groups : groups.slice(0, 2)

  if (viewMode === "list") {
    return (
      <div
        className={cn(
          "group relative bg-card rounded-lg overflow-hidden border border-border transition-all",
          listing.is_private ? "opacity-80 hover:opacity-100" : "hover:border-primary/50",
        )}
      >
        <div className="flex">
          {/* Image - fixed width on left */}
          <Link href={`/listings/${listing.id}`} className="block flex-shrink-0">
            <div className="w-28 sm:w-32 aspect-[4/3] relative">
              <Image
                src={
                  listing.images[0] ||
                  "/placeholder.svg?height=300&width=400&query=disc golf equipment" ||
                  "/placeholder.svg" ||
                  "/placeholder.svg" ||
                  "/placeholder.svg" ||
                  "/placeholder.svg" ||
                  "/placeholder.svg" ||
                  "/placeholder.svg"
                 || "/placeholder.svg"}
                alt={listing.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />

              {/* Private badge */}
              {listing.is_private && (
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 bg-background/90 backdrop-blur-sm rounded text-[10px] text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  <span>Private</span>
                </div>
              )}
            </div>
          </Link>

          {/* Content */}
          <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
            <div className="space-y-1">
              <Link href={`/listings/${listing.id}`}>
                <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                  {listing.title}
                </h3>
                {(listing.matched_saved_search || listing.subtitle) && (
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                    {listing.matched_saved_search ? (
                      <>
                        <Search className="h-3 w-3 flex-shrink-0" />
                        <span className="text-foreground/70">{listing.matched_saved_search}</span>
                      </>
                    ) : (
                      listing.subtitle
                    )}
                  </p>
                )}
              </Link>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-primary">${listing.price}</p>
                  {listing.for_trade && <Repeat2Icon className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
                {listing.location && <p className="text-[10px] text-muted-foreground">{listing.location}</p>}
              </div>
            </div>

            {groups.length > 0 && (
              <div className="pt-1.5 mt-auto">
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
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "group relative bg-card rounded-lg overflow-hidden transition-all flex flex-col", // Added flex flex-col for consistent height
        "border border-border hover:border-primary/50",
        listing.is_private && "opacity-80 hover:opacity-100",
      )}
    >
      {/* Image */}
      <Link href={`/listings/${listing.id}`}>
        <div className="aspect-[4/3] relative">
          <Image
            src={
              listing.images[0] ||
              "/placeholder.svg?height=300&width=400&query=disc golf equipment" ||
              "/placeholder.svg" ||
              "/placeholder.svg" ||
              "/placeholder.svg" ||
              "/placeholder.svg" ||
              "/placeholder.svg" ||
              "/placeholder.svg" ||
              "/placeholder.svg"
             || "/placeholder.svg"}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />

          {/* Follow button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsFollowing(!isFollowing)
            }}
            className={cn(
              "absolute top-2 right-2 p-1.5 rounded-full transition-all",
              "bg-background/80 backdrop-blur-sm hover:bg-background/90",
              isFollowing ? "opacity-100" : "opacity-0 group-hover:opacity-100",
              isFollowing ? "text-chart-5" : "text-muted-foreground hover:text-foreground"
            )}
            title={isFollowing ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={cn("h-4 w-4", isFollowing && "fill-current")} />
          </button>

          {/* Private badge */}
          {listing.is_private && (
            <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 bg-background/90 backdrop-blur-sm rounded text-[10px] text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>Private</span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 space-y-1.5 flex-1 flex flex-col">
        {" "}
        {/* Added flex-1 flex flex-col to fill available space */}
        <div>
          <Link href={`/listings/${listing.id}`}>
            <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
              {listing.title}
            </h3>
            {(listing.matched_saved_search || listing.subtitle) && (
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                {listing.matched_saved_search ? (
                  <>
                    <Search className="h-3 w-3 flex-shrink-0" />
                    <span className="text-foreground/70">{listing.matched_saved_search}</span>
                  </>
                ) : (
                  listing.subtitle
                )}
              </p>
            )}
          </Link>
        </div>
        {/* Price and location row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-primary">${listing.price}</p>
            {listing.for_trade && <Repeat2Icon className="h-3.5 w-3.5 text-muted-foreground" />}
          </div>
          {listing.location && <p className="text-[10px] text-muted-foreground">{listing.location}</p>}
        </div>
        <div className="pt-1 mt-auto min-h-[26px]">
          {" "}
          {/* Added min-h-[26px] to reserve space even when empty */}
          {groups.length > 0 && (
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
          )}
        </div>
      </div>
    </div>
  )
}
