"use client"

import Link from "next/link"
import { MoreHorizontal, UserMinus, ExternalLink, Package } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface FollowedUser {
  id: string
  username: string
  display_name: string
  avatar: string
  bio: string
  followers_count: number
  items_count: number
  followed_at: string
}

interface FollowedUserCardProps {
  user: FollowedUser
}

export function FollowedUserCard({ user }: FollowedUserCardProps) {
  const handleUnfollow = () => {
    toast.success(`Unfollowed ${user.display_name}`)
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
      <Link href={`/user/${user.username}`}>
        <Avatar className="h-12 w-12 border border-border">
          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.display_name} />
          <AvatarFallback>{user.display_name.charAt(0)}</AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/user/${user.username}`} className="block group">
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
            {user.display_name}
          </h3>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
        </Link>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{user.bio}</p>
      </div>

      <div className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
        <div className="text-center">
          <p className="font-medium text-foreground">{user.items_count}</p>
          <p className="text-xs">Items</p>
        </div>
        <div className="text-center">
          <p className="font-medium text-foreground">{user.followers_count}</p>
          <p className="text-xs">Followers</p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/user/${user.username}`} className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              View Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/user/${user.username}?tab=items`} className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              View Items
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleUnfollow} className="text-destructive focus:text-destructive">
            <UserMinus className="h-4 w-4 mr-2" />
            Unfollow
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
