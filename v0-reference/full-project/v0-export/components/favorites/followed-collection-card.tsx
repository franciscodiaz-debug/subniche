"use client"

import Link from "next/link"
import { MoreHorizontal, FolderMinus, ExternalLink, Clock, FolderOpen } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface FollowedCollection {
  id: string
  name: string
  description: string
  owner: { username: string; avatar: string }
  item_count: number
  total_value: number
  cover_images: string[]
  followed_at: string
  last_updated: string
}

interface FollowedCollectionCardProps {
  collection: FollowedCollection
}

export function FollowedCollectionCard({ collection }: FollowedCollectionCardProps) {
  const handleUnfollow = () => {
    toast.success(`Unfollowed ${collection.name}`)
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
      {/* Cover image grid */}
      <Link href={`/collection/${collection.id}`} className="flex-shrink-0">
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary">
          {collection.cover_images.length > 0 ? (
            <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-0.5">
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="bg-secondary overflow-hidden">
                  {collection.cover_images[index] ? (
                    <img
                      src={collection.cover_images[index] || "/placeholder.svg"}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary/50" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FolderOpen className="h-6 w-6 text-primary/50" />
            </div>
          )}
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/collection/${collection.id}`} className="block group">
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
            {collection.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-0.5">
          <Avatar className="h-4 w-4">
            <AvatarImage src={collection.owner.avatar || "/placeholder.svg"} />
            <AvatarFallback className="text-[8px]">{collection.owner.username.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">@{collection.owner.username}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{collection.description}</p>
      </div>

      <div className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
        <div className="text-center">
          <p className="font-medium text-foreground">{collection.item_count}</p>
          <p className="text-xs">Items</p>
        </div>
        <div className="text-center">
          <p className="font-medium text-foreground">${collection.total_value.toLocaleString()}</p>
          <p className="text-xs">Value</p>
        </div>
        <div className="text-center">
          <p className="font-medium text-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {collection.last_updated}
          </p>
          <p className="text-xs">Updated</p>
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
            <Link href={`/collection/${collection.id}`} className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              View Collection
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/user/${collection.owner.username}`} className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              View Owner
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleUnfollow} className="text-destructive focus:text-destructive">
            <FolderMinus className="h-4 w-4 mr-2" />
            Unfollow
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
