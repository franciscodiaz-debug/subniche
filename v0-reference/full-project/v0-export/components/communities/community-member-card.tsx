"use client"

import Image from "next/image"
import Link from "next/link"
import { MapPin, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Profile } from "@/lib/types"

interface CommunityMemberCardProps {
  member: Profile
  role?: "owner" | "admin" | "moderator" | null
}

export function CommunityMemberCard({ member, role }: CommunityMemberCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:border-border/80 transition-colors">
      {/* Avatar */}
      <Link href={`/profile/${member.username}`} className="shrink-0">
        <div className="w-12 h-12 rounded-full bg-muted overflow-hidden">
          {member.avatar_url ? (
            <Image
              src={member.avatar_url || "/placeholder.svg"}
              alt={member.username}
              width={48}
              height={48}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg font-semibold text-muted-foreground">
              {member.username?.[0]?.toUpperCase() || "?"}
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link href={`/profile/${member.username}`} className="font-medium text-foreground hover:underline truncate">
            {member.username}
          </Link>
          {role && (
            <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full capitalize">{role}</span>
          )}
        </div>

        {member.location && (
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3" />
            {member.location}
          </p>
        )}

        {member.bio && <p className="text-sm text-muted-foreground truncate mt-0.5">{member.bio}</p>}
      </div>

      {/* Actions */}
      <Button variant="outline" size="sm" className="shrink-0 bg-transparent">
        <MessageSquare className="h-4 w-4 mr-2" />
        Message
      </Button>
    </div>
  )
}
