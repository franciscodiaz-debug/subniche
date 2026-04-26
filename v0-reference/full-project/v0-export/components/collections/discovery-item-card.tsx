"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface DiscoveryItem {
  id: string
  title: string
  price: number
  image: string
  user: {
    username: string
    avatar: string
  }
  collection: string | null
}

interface DiscoveryItemCardProps {
  item: DiscoveryItem
}

export function DiscoveryItemCard({ item }: DiscoveryItemCardProps) {
  return (
    <Link
      href={`/items/${item.id}`}
      className="flex-shrink-0 w-48 bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all group"
    >
      {/* Image */}
      <div className="aspect-square bg-secondary overflow-hidden">
        <img
          src={item.image || "/placeholder.svg"}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-foreground text-sm truncate">{item.title}</h3>
        <p className="text-sm font-semibold text-foreground mt-1">${item.price.toLocaleString()}</p>

        {/* User */}
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
          <Avatar className="h-5 w-5">
            <AvatarImage src={item.user.avatar || "/placeholder.svg"} />
            <AvatarFallback className="text-[10px]">{item.user.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate">@{item.user.username}</span>
        </div>
      </div>
    </Link>
  )
}
