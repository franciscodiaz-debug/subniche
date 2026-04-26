"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getDemoCommunity, demoProfiles } from "@/lib/demo-data"
import { CommunityMemberCard } from "./community-member-card"

interface CommunityMembersContentProps {
  slug: string
}

export function CommunityMembersContent({ slug }: CommunityMembersContentProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const community = getDemoCommunity(slug)

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

  // Use demo profiles as members
  const members = demoProfiles.slice(0, Math.min(community.member_count, 20))

  const filteredMembers = members.filter(
    (member) =>
      member.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="flex items-center gap-4 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/communities/${slug}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-xl">
              {community.icon}
            </div>
            <div>
              <h1 className="font-semibold text-foreground">{community.name}</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                {community.member_count.toLocaleString()} members
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-4">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Members grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <CommunityMemberCard key={member.id} member={member} />
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-16">
            <Users className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="text-sm font-medium mb-1">No members found</h3>
            <p className="text-xs text-muted-foreground">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  )
}
