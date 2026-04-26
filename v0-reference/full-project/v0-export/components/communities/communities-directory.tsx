"use client"

import React from "react"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Users, MapPin, Sparkles, Building2, ArrowUpDown, Check, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { demoCommunitiesEnhanced } from "@/lib/demo-data"

type CategoryFilter = "all" | "geographic" | "interest" | "brand" | "organization"
type SortOption = "active" | "members" | "newest" | "alphabetical"

const categoryOptions: { value: CategoryFilter; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "All", icon: null },
  { value: "geographic", label: "Local", icon: <MapPin className="h-4 w-4" /> },
  { value: "interest", label: "Interest", icon: <Sparkles className="h-4 w-4" /> },
  { value: "brand", label: "Brand", icon: <Building2 className="h-4 w-4" /> },
  { value: "organization", label: "Organization", icon: <Users className="h-4 w-4" /> },
]

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "active", label: "Most Active" },
  { value: "members", label: "Most Members" },
  { value: "newest", label: "Newest" },
  { value: "alphabetical", label: "A-Z" },
]

export function CommunitiesDirectory() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all")
  const [sortBy, setSortBy] = useState<SortOption>("active")

  const filteredCommunities = useMemo(() => {
    let communities = [...demoCommunitiesEnhanced]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      communities = communities.filter((community) => {
        const matchesName = community.name.toLowerCase().includes(query)
        const matchesDescription = community.description?.toLowerCase().includes(query)
        return matchesName || matchesDescription
      })
    }

    // Category filter
    if (categoryFilter !== "all") {
      communities = communities.filter((c) => c.category === categoryFilter)
    }

    // Sort
    switch (sortBy) {
      case "active":
        // In production, sort by recent activity metrics (posts, trades, engagement)
        // For demo, use member_count as proxy for activity
        communities.sort((a, b) => b.member_count - a.member_count)
        break
      case "members":
        communities.sort((a, b) => b.member_count - a.member_count)
        break
      case "newest":
        // In production, sort by created_at
        communities.sort((a, b) => b.id.localeCompare(a.id))
        break
      case "alphabetical":
        communities.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return communities
  }, [searchQuery, categoryFilter, sortBy])

  const currentSortLabel = sortOptions.find((opt) => opt.value === sortBy)?.label || "Sort"

  return (
    <div>
      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg hover:bg-muted transition-colors text-sm">
              <ArrowUpDown className="h-4 w-4" />
              <span>{currentSortLabel}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className="flex items-center justify-between"
              >
                {option.label}
                {sortBy === option.value && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {categoryOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setCategoryFilter(option.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors flex items-center gap-1.5",
              categoryFilter === option.value
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border hover:border-primary/50",
            )}
          >
            {option.icon}
            {option.label}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <span className="text-sm text-muted-foreground">{filteredCommunities.length} communities</span>
      </div>

      {/* Directory List */}
      {filteredCommunities.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No communities found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCommunities.map((community) => (
            <Link
              key={community.id}
              href={`/communities/${community.slug}`}
              className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors group"
            >
              {/* Avatar */}
              <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                {community.avatar_url ? (
                  <Image src={community.avatar_url || "/placeholder.svg"} alt={community.name} fill className="object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground truncate">{community.name}</h3>
                  {community.is_member && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">Joined</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{community.description}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {community.member_count.toLocaleString()} members
                  </span>
                  {community.category && (
                    <span className="capitalize">{community.category}</span>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
