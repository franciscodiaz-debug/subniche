"use client"

import Link from "next/link"
import Image from "next/image"
import { MoreHorizontal, HeartOff, ExternalLink, TrendingDown, TrendingUp, Repeat2, CheckCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface FollowedItem {
  id: string
  title: string
  subtitle: string
  price: number
  original_price?: number
  image: string
  seller: { username: string; avatar: string }
  for_trade: boolean
  followed_at: string
  price_change?: number
  status: "active" | "sold" | "removed"
}

interface FollowedItemCardProps {
  item: FollowedItem
}

export function FollowedItemCard({ item }: FollowedItemCardProps) {
  const handleUnfollow = () => {
    toast.success(`Removed ${item.title} from watchlist`)
  }

  const isSold = item.status === "sold"
  const priceDropped = item.price_change && item.price_change < 0
  const priceIncreased = item.price_change && item.price_change > 0

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 bg-secondary/30 rounded-lg transition-colors",
        isSold ? "opacity-60" : "hover:bg-secondary/50"
      )}
    >
      {/* Image */}
      <Link href={`/listings/${item.id}`} className="flex-shrink-0">
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary relative">
          <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
          {isSold && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-chart-2" />
            </div>
          )}
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/listings/${item.id}`} className="block group">
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                "font-medium truncate transition-colors",
                isSold ? "text-muted-foreground line-through" : "text-foreground group-hover:text-primary"
              )}
            >
              {item.title}
            </h3>
            {item.for_trade && !isSold && <Repeat2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
          </div>
        </Link>
        <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>
        <div className="flex items-center gap-2 mt-1">
          <Avatar className="h-4 w-4">
            <AvatarImage src={item.seller.avatar || "/placeholder.svg"} />
            <AvatarFallback className="text-[8px]">{item.seller.username.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">@{item.seller.username}</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        {isSold ? (
          <Badge variant="secondary" className="bg-chart-2/10 text-chart-2 border-chart-2/20">
            Sold
          </Badge>
        ) : (
          <>
            <p className="font-semibold text-foreground">${item.price.toLocaleString()}</p>
            {priceDropped && (
              <div className="flex items-center gap-1 text-xs text-chart-2">
                <TrendingDown className="h-3 w-3" />
                <span>${Math.abs(item.price_change!).toLocaleString()} drop</span>
              </div>
            )}
            {priceIncreased && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <TrendingUp className="h-3 w-3" />
                <span>${item.price_change!.toLocaleString()} increase</span>
              </div>
            )}
          </>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/listings/${item.id}`} className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              View Listing
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/user/${item.seller.username}`} className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              View Seller
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleUnfollow} className="text-destructive focus:text-destructive">
            <HeartOff className="h-4 w-4 mr-2" />
            Remove from Following
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
