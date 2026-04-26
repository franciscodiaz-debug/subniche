"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  ArrowLeft,
  Settings,
  Share2,
  LogOut,
  LogIn,
  ShoppingBag,
  MessageSquare,
  Grid3X3,
  LayoutList,
  Plus,
  Shield,
  ArrowUpDown,
  Check,
  Clock,
  Flame,
  TrendingUp,
  Home,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getDemoCommunity, getDemoCommunityPosts, getDemoCommunityListings, demoProfiles } from "@/lib/demo-data"
import { ThreadCard } from "./thread-card"
import { CommunityListingCard } from "./community-listing-card"
import { CreatePostDialog } from "./create-post-dialog"
import type { CommunityPost, Profile } from "@/lib/types"

interface CommunityContentProps {
  slug: string
}

type DiscussionSort = "hot" | "new" | "top"
type ListingSort = "newest" | "price-low" | "price-high"

export function CommunityContent({ slug }: CommunityContentProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("main")
  const [isMember, setIsMember] = useState(false)
  const [listingViewMode, setListingViewMode] = useState<"grid" | "list">("grid")
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [discussionSort, setDiscussionSort] = useState<DiscussionSort>("hot")
  const [listingSort, setListingSort] = useState<ListingSort>("newest")

  // Get community data
  const community = getDemoCommunity(slug)

  // Initialize member state from community data
  useState(() => {
    if (community) {
      setIsMember(community.is_member || false)
    }
  })

  // Get posts and listings for this community
  const posts = community ? getDemoCommunityPosts(community.id) : []
  const listings = community ? getDemoCommunityListings(community.id) : []

  // Demo members
  const members: Profile[] = useMemo(() => {
    if (!community) return []
    return demoProfiles.slice(0, Math.min(community.member_count, 3))
  }, [community])

  // Sort discussions
  const sortedPosts = useMemo(() => {
    const pinned = posts.filter((p) => p.is_pinned)
    const unpinned = posts.filter((p) => !p.is_pinned)

    let sorted: CommunityPost[]
    switch (discussionSort) {
      case "new":
        sorted = unpinned.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case "top":
        sorted = unpinned.sort((a, b) => b.like_count - a.like_count)
        break
      case "hot":
      default:
        sorted = unpinned.sort((a, b) => {
          const aScore = a.like_count + a.comment_count * 2
          const bScore = b.like_count + b.comment_count * 2
          const aAge = (Date.now() - new Date(a.created_at).getTime()) / (1000 * 60 * 60)
          const bAge = (Date.now() - new Date(b.created_at).getTime()) / (1000 * 60 * 60)
          return bScore / Math.max(bAge, 1) - aScore / Math.max(aAge, 1)
        })
    }

    return [...pinned, ...sorted]
  }, [posts, discussionSort])

  // Sort listings
  const sortedListings = useMemo(() => {
    const sorted = [...listings]
    switch (listingSort) {
      case "price-low":
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0))
      case "price-high":
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0))
      case "newest":
      default:
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
  }, [listings, listingSort])

  const digestThreads = useMemo(() => {
    return sortedPosts.slice(0, 3)
  }, [sortedPosts])

  const digestListings = useMemo(() => {
    return sortedListings.slice(0, 3)
  }, [sortedListings])

  if (!community) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <h1 className="text-2xl font-bold mb-2">Community not found</h1>
        <p className="text-muted-foreground mb-4">
          The community you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button onClick={() => router.push("/communities")}>Browse Communities</Button>
      </div>
    )
  }

  const handleJoinLeave = () => {
    setIsMember(!isMember)
  }

  const getCategoryLabel = (category: string | null) => {
    switch (category) {
      case "geographic":
        return "Local"
      case "interest":
        return "Interest"
      case "brand":
        return "Brand"
      case "organization":
        return "Organization"
      default:
        return null
    }
  }

  const categoryLabel = getCategoryLabel(community.category)

  const discussionSortOptions = [
    { value: "hot", label: "Hot", icon: Flame },
    { value: "new", label: "New", icon: Clock },
    { value: "top", label: "Top", icon: TrendingUp },
  ]

  const listingSortOptions = [
    { value: "newest", label: "Newest" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
  ]

  return (
    <div className="min-h-screen">
      <div className="relative">
        {/* Cover Image */}
        <div className="relative h-48 md:h-64 lg:h-80 bg-gradient-to-br from-primary/20 via-primary/10 to-background overflow-hidden">
          {community.cover_image ? (
            <Image
              src={community.cover_image || "/placeholder.svg"}
              alt={community.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/20 to-transparent" />
          )}
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

          {/* Back button overlay */}
          <div className="absolute top-4 left-4">
            <Button
              variant="ghost"
              size="icon"
              className="bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={() => router.push("/communities")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Community Info Card - overlaps cover image */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
          <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Icon and basic info */}
              <div className="flex gap-4 items-start">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/20 flex items-center justify-center text-4xl shrink-0 shadow-md">
                  {community.icon}
                </div>
                <div className="flex-1 md:flex-none">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">{community.name}</h1>
                    {categoryLabel && (
                      <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md font-medium">
                        {categoryLabel}
                      </span>
                    )}
                    {community.user_role && (
                      <span className="px-2 py-1 text-xs bg-primary/20 text-primary rounded-md flex items-center gap-1 font-medium">
                        <Shield className="h-3 w-3" />
                        {community.user_role}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm md:text-base max-w-2xl leading-relaxed">
                    {community.description}
                  </p>
                </div>
              </div>

              {/* Stats and Actions */}
              <div className="flex-1 flex flex-col md:items-end justify-between gap-4">
                {/* Stats */}
                <div className="flex gap-6">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{community.member_count.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Members</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{posts.length}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Threads</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{listings.length}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Listings</div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  {community.user_role && (
                    <Button variant="ghost" size="icon" className="h-10 w-10">
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant={isMember ? "outline" : "default"}
                    size="lg"
                    onClick={handleJoinLeave}
                    className="min-w-[120px]"
                  >
                    {isMember ? (
                      <>
                        <LogOut className="h-4 w-4 mr-2" />
                        Leave
                      </>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4 mr-2" />
                        Join
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="h-12 w-full md:w-auto justify-start gap-1 bg-muted/30 p-1 rounded-lg">
            <TabsTrigger
              value="main"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-6 h-10 rounded-md"
            >
              <Home className="h-4 w-4 mr-2" />
              Main
            </TabsTrigger>
            <TabsTrigger
              value="talk"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-6 h-10 rounded-md"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Talk
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">{posts.length}</span>
            </TabsTrigger>
            <TabsTrigger
              value="market"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-6 h-10 rounded-md"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Market
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">{listings.length}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="main" className="mt-6">
            <div className="flex gap-6">
              {/* Main content */}
              <div className="flex-1 min-w-0">
                {/* Welcome banner for non-members */}
                {!isMember && (
                  <div className="mb-8 p-6 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-primary/20">
                        <Sparkles className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">Welcome to {community.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{community.description}</p>
                        <Button onClick={handleJoinLeave} className="h-10">
                          <LogIn className="h-4 w-4 mr-2" />
                          Join Community
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hot Threads Section */}
                <section className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-orange-500/10">
                        <Flame className="h-5 w-5 text-orange-500" />
                      </div>
                      Hot Threads
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab("talk")}
                      className="text-primary hover:text-primary/80"
                    >
                      View all
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="rounded-xl border border-border overflow-hidden bg-card divide-y divide-border">
                    {digestThreads.length === 0 ? (
                      <div className="text-center py-12 text-sm text-muted-foreground">
                        No threads yet. Be the first to start a discussion!
                      </div>
                    ) : (
                      digestThreads.map((post) => <ThreadCard key={post.id} post={post} communitySlug={slug} compact />)
                    )}
                  </div>
                  {isMember && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="mt-4 w-full h-12 text-base bg-transparent"
                      onClick={() => setShowCreatePost(true)}
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Start a Thread
                    </Button>
                  )}
                </section>

                {/* New Listings Section */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                      </div>
                      New in Marketplace
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab("market")}
                      className="text-primary hover:text-primary/80"
                    >
                      Browse all
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  {digestListings.length === 0 ? (
                    <div className="text-center py-12 text-sm text-muted-foreground rounded-xl border border-border bg-card">
                      No listings yet in this community.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {digestListings.map((listing) => (
                        <CommunityListingCard key={listing.id} listing={listing} variant="grid" />
                      ))}
                    </div>
                  )}
                </section>
              </div>

              {/* Sidebar - About & Members */}
              <aside className="hidden lg:block w-80 shrink-0">
                <div className="sticky top-24 space-y-6">
                  <div className="p-6 rounded-xl bg-card border border-border">
                    <h3 className="text-lg font-semibold mb-4">About</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{community.description}</p>
                  </div>

                  <div className="p-6 rounded-xl bg-card border border-border">
                    <h3 className="text-lg font-semibold mb-4">Members</h3>
                    <div className="space-y-3 mb-4">
                      {members.slice(0, 5).map((member) => (
                        <div key={member.id} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-sm font-semibold">
                            {member.display_name?.charAt(0) || member.username.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{member.display_name || member.username}</div>
                            <div className="text-xs text-muted-foreground">@{member.username}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                      onClick={() => router.push(`/communities/${slug}/members`)}
                    >
                      View all {community.member_count.toLocaleString()} members
                    </Button>
                  </div>
                </div>
              </aside>
            </div>
          </TabsContent>

          {/* Talk Tab */}
          <TabsContent value="talk" className="mt-6">
            <div className="flex gap-6">
              {/* Main content */}
              <div className="flex-1 min-w-0">
                {/* Sort bar */}
                <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-2">
                    {discussionSortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setDiscussionSort(option.value as DiscussionSort)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                          discussionSort === option.value
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted",
                        )}
                      >
                        <option.icon className="h-4 w-4" />
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {isMember && (
                    <Button onClick={() => setShowCreatePost(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Thread
                    </Button>
                  )}
                </div>

                {/* Threads list */}
                <div className="rounded-xl border border-border overflow-hidden bg-card divide-y divide-border">
                  {sortedPosts.length === 0 ? (
                    <div className="text-center py-16">
                      <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No threads yet</h3>
                      <p className="text-sm text-muted-foreground">Start the conversation!</p>
                    </div>
                  ) : (
                    sortedPosts.map((post) => <ThreadCard key={post.id} post={post} communitySlug={slug} />)
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <aside className="hidden lg:block w-80 shrink-0">
                <div className="sticky top-24 p-6 rounded-xl bg-card border border-border">
                  <h3 className="text-lg font-semibold mb-4">About</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">{community.description}</p>

                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Threads</span>
                      <span className="font-semibold">{posts.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Members</span>
                      <span className="font-semibold">{community.member_count.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </TabsContent>

          {/* Market Tab */}
          <TabsContent value="market" className="mt-6">
            <div className="flex gap-6">
              {/* Main content */}
              <div className="flex-1 min-w-0">
                {/* Controls bar */}
                <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-card border border-border">
                  <div className="text-sm text-muted-foreground">
                    {sortedListings.length} {sortedListings.length === 1 ? "listing" : "listings"}
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Sort dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2 bg-transparent">
                          <ArrowUpDown className="h-4 w-4" />
                          {listingSortOptions.find((o) => o.value === listingSort)?.label}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {listingSortOptions.map((option) => (
                          <DropdownMenuItem
                            key={option.value}
                            onClick={() => setListingSort(option.value as ListingSort)}
                            className="flex items-center justify-between"
                          >
                            {option.label}
                            {listingSort === option.value && <Check className="h-4 w-4 text-primary" />}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* View mode toggle */}
                    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                      <button
                        onClick={() => setListingViewMode("grid")}
                        className={cn(
                          "p-2 rounded-md transition-colors",
                          listingViewMode === "grid"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setListingViewMode("list")}
                        className={cn(
                          "p-2 rounded-md transition-colors",
                          listingViewMode === "list"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <LayoutList className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Listings */}
                {sortedListings.length === 0 ? (
                  <div className="text-center py-16 rounded-xl border border-border bg-card">
                    <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
                    <p className="text-sm text-muted-foreground">Members haven&apos;t published any listings here.</p>
                  </div>
                ) : (
                  <div
                    className={cn(
                      listingViewMode === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                        : "flex flex-col gap-2 max-w-3xl",
                    )}
                  >
                    {sortedListings.map((listing) => (
                      <CommunityListingCard
                        key={listing.id}
                        listing={listing}
                        variant={listingViewMode === "grid" ? "grid" : "list"}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <aside className="hidden lg:block w-80 shrink-0">
                <div className="sticky top-24 p-6 rounded-xl bg-card border border-border">
                  <h3 className="text-lg font-semibold mb-4">About</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">{community.description}</p>

                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Listings</span>
                      <span className="font-semibold">{listings.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Members</span>
                      <span className="font-semibold">{community.member_count.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Post Dialog */}
      <CreatePostDialog open={showCreatePost} onOpenChange={setShowCreatePost} communityId={community.id} />
    </div>
  )
}
