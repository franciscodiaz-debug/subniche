"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Search, Plus, Users, MapPin, Sparkles, TrendingUp, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { demoCommunitiesEnhanced } from "@/lib/demo-data"
import { CommunityPreviewCard } from "./community-preview-card"
import { CreateCommunityDialog } from "./create-community-dialog"
import { MyCommunitiesFeed } from "./my-communities-feed"
import { CommunitiesDirectory } from "./communities-directory"

type Tab = "my-communities" | "discover" | "directory"
type CategoryFilter = "all" | "geographic" | "interest" | "brand" | "organization"
type UpdateTypeFilter = "all" | "recent" | "active"

export function CommunitiesHubContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  
  // Valid tabs
  const validTabs: Tab[] = ["my-communities", "discover", "directory"]
  const initialTab = tabParam && validTabs.includes(tabParam as Tab) ? (tabParam as Tab) : "my-communities"
  
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const discoverCommunities = demoCommunitiesEnhanced.filter((c) => !c.is_member)

  const filteredDiscover = useMemo(() => {
    return discoverCommunities.filter((community) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = community.name.toLowerCase().includes(query)
        const matchesDescription = community.description?.toLowerCase().includes(query)
        if (!matchesName && !matchesDescription) return false
      }

      // Category filter
      if (categoryFilter !== "all" && community.category !== categoryFilter) {
        return false
      }

      return true
    })
  }, [discoverCommunities, searchQuery, categoryFilter])

  const popularCommunities = [...demoCommunitiesEnhanced].sort((a, b) => b.member_count - a.member_count).slice(0, 3)

  const categoryOptions: { value: CategoryFilter; label: string; icon: React.ReactNode }[] = [
    { value: "all", label: "All", icon: null },
    { value: "geographic", label: "Local", icon: <MapPin className="h-4 w-4" /> },
    { value: "interest", label: "Interest", icon: <Sparkles className="h-4 w-4" /> },
    { value: "brand", label: "Brand", icon: null },
    { value: "organization", label: "Organization", icon: null },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto lg:py-4">
      {/* Page Title */}
      <h1 className="font-bold text-foreground text-2xl mb-5">Communities</h1>

      {/* Tab Navigation - matching Following page style */}
      <div className="mb-4">
        <div className="flex items-center gap-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("my-communities")}
            className={cn(
              "text-xl font-semibold transition-colors whitespace-nowrap pb-2",
              activeTab === "my-communities" ? "text-foreground border-b-2 border-b-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            My Communities
          </button>
          <button
            onClick={() => setActiveTab("discover")}
            className={cn(
              "text-xl font-semibold transition-colors whitespace-nowrap pb-2",
              activeTab === "discover" ? "text-foreground border-b-2 border-b-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Discover
          </button>
          <button
            onClick={() => setActiveTab("directory")}
            className={cn(
              "text-xl font-semibold transition-colors whitespace-nowrap pb-2",
              activeTab === "directory" ? "text-foreground border-b-2 border-b-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Directory
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "my-communities" && <MyCommunitiesFeed />}

      {activeTab === "discover" && (
        <>
          {/* Popular Communities */}
          <section className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Popular Communities
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularCommunities.map((community) => (
                <CommunityPreviewCard key={community.id} community={community} />
              ))}
            </div>
          </section>

          {/* Discover Section */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Discover Communities
              </h2>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search communities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
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

            {/* Results */}
            {filteredDiscover.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No communities found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
                <Button variant="outline" onClick={() => setShowCreateDialog(true)}>
                  Create a new community
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDiscover.map((community) => (
                  <CommunityPreviewCard key={community.id} community={community} />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {activeTab === "directory" && <CommunitiesDirectory />}

      {/* Create Community Dialog */}
      <CreateCommunityDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </div>
  )
}
