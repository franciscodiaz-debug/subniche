"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface DiscoveryCollection {
  id: string
  name: string
  description: string
  item_count: number
  total_value: number
  images: string[]
  user: {
    username: string
    avatar: string
  }
  likes: number
}

interface DiscoveryCollectionCardProps {
  collection: DiscoveryCollection
}

export function DiscoveryCollectionCard({ collection }: DiscoveryCollectionCardProps) {
  const gridImages = collection.images.slice(0, 4)

  return (
    <Link
      href={`/collections/${collection.id}`}
      className="flex-shrink-0 w-72 bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all group"
    >
      {/* Image Grid */}
      <div className="aspect-[4/3] bg-secondary overflow-hidden relative">
        <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-0.5">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="bg-secondary overflow-hidden">
              {gridImages[index] ? (
                <img
                  src={gridImages[index] || "/placeholder.svg"}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-secondary/50" />
              )}
            </div>
          ))}
        </div>

        {/* Item count */}
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-md">
          <span className="text-xs font-medium text-foreground">{collection.item_count} items</span>
        </div>

        {/* Likes */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-md">
          <Heart className="h-3 w-3 text-rose-500" />
          <span className="text-xs font-medium text-foreground">{collection.likes}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-foreground truncate">{collection.name}</h3>
        <p className="text-sm text-muted-foreground truncate mt-0.5">{collection.description}</p>

        {/* User & Value */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={collection.user.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-xs">{collection.user.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">@{collection.user.username}</span>
          </div>
          <span className="text-sm font-medium text-foreground">${collection.total_value.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  )
}
