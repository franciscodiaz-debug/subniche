"use client"

import { useState } from "react"

import Link from "next/link"
import Image from "next/image"
import {
  MoreVertical,
  Edit2,
  DollarSign,
  Repeat2,
  Search,
  ArrowRightIcon,ArrowRightLeft,
  Archive,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { CollectionItem } from "@/lib/types"

// Available collections for move functionality
const availableCollections = [
  { id: "demo-collection-1", name: "My Guitars" },
  { id: "demo-collection-2", name: "Pedal Board" },
  { id: "demo-wishlist-1", name: "Dream Guitars" },
]

interface CollectionItemDisplayCardProps {
  item: CollectionItem
  view: "grid" | "list"
  isOwner: boolean
  isWishlistItem?: boolean
  currentCollectionId: string
  currentCollectionName?: string
  onMoveToCollection?: (itemId: string, collectionId: string) => void
  onRemoveFromCollection?: (itemId: string) => void
  onArchiveItem?: (itemId: string) => void
}

export function CollectionItemDisplayCard({ 
  item, 
  view, 
  isOwner, 
  isWishlistItem,
  currentCollectionId,
  onMoveToCollection,
  onArchiveItem,
}: CollectionItemDisplayCardProps) {
  const primaryImage = item.images?.[0] || "/generic-item.png"

  if (view === "list") {
    return (
      <div className={cn(
        "group relative rounded-lg overflow-hidden transition-all",
        isWishlistItem 
          ? "bg-secondary/30 border border-dashed border-border hover:border-chart-5/50" 
          : "bg-card border border-border hover:border-primary/50"
      )}>
        <div className="flex">
          <Link href={item.listing_id ? `/listings/${item.listing_id}` : "#"} className="block flex-shrink-0">
            <div className={cn(
              "w-28 sm:w-32 aspect-[4/3] relative",
              isWishlistItem && "opacity-50"
            )}>
              <Image
                src={primaryImage || "/placeholder.svg"}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
            </div>
          </Link>

          <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
            <div className="flex items-start justify-between gap-2">
              <Link href={item.listing_id ? `/listings/${item.listing_id}` : "#"} className="flex-1 min-w-0">
                <h3 className={cn(
                  "font-semibold text-sm truncate transition-colors",
                  isWishlistItem 
                    ? "text-muted-foreground group-hover:text-chart-5" 
                    : "text-foreground group-hover:text-primary"
                )}>
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                )}
              </Link>
              
              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-transparent">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href={`/create-listing?itemId=${item.id}`}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <ArrowRightLeft className="h-4 w-4 mr-2" />
                        Move to
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-56">
                        <div className="max-h-48 overflow-y-auto">
                          <DropdownMenuItem
                            onClick={() => onMoveToCollection?.(item.id, "uncategorized")}
                          >
                            Uncategorized
                          </DropdownMenuItem>
                          
                          {availableCollections
                            .filter(col => col.id !== currentCollectionId)
                            .map((col) => (
                              <DropdownMenuItem
                                key={col.id}
                                onClick={() => onMoveToCollection?.(item.id, col.id)}
                              >
                                {col.name}
                              </DropdownMenuItem>
                            ))}
                        </div>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    
                    <DropdownMenuItem onClick={() => onArchiveItem?.(item.id)}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="flex items-center justify-end gap-1.5">
              {isWishlistItem && <Search className="h-3.5 w-3.5 text-chart-5" />}
              {!isWishlistItem && item.for_sale && <DollarSign className="h-3.5 w-3.5 text-emerald-500" />}
              {!isWishlistItem && item.for_trade && <Repeat2 className="h-3.5 w-3.5 text-sky-500" />}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "group relative rounded-lg overflow-hidden transition-all flex flex-col",
      isWishlistItem 
        ? "bg-secondary/30 border border-dashed border-border hover:border-chart-5/50" 
        : "bg-card border border-border hover:border-primary/50"
    )}>
      <Link href={item.listing_id ? `/listings/${item.listing_id}` : "#"}>
        <div className={cn("aspect-[4/3] relative", isWishlistItem && "opacity-50")}>
          <Image
            src={primaryImage || "/placeholder.svg"}
            alt={item.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        </div>
      </Link>

      <div className="p-3 space-y-1.5 flex-1 flex flex-col relative">
        <div className="flex items-start justify-between gap-2">
          <Link href={item.listing_id ? `/listings/${item.listing_id}` : "#"} className="flex-1 min-w-0">
            <h3 className={cn(
              "font-semibold text-sm truncate transition-colors",
              isWishlistItem 
                ? "text-muted-foreground group-hover:text-chart-5" 
                : "text-foreground group-hover:text-primary"
            )}>
              {item.title}
            </h3>
            {item.subtitle && (
              <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
            )}
          </Link>
          
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-transparent">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={`/create-listing?itemId=${item.id}`}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <ArrowRightIcon className="h-4 w-4 mr-2" />
                    Move to
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-56">
                    <div className="max-h-48 overflow-y-auto">
                      <DropdownMenuItem className="text-muted-foreground"
                        onClick={() => onMoveToCollection?.(item.id, "uncategorized")}
                      >
                        Uncategorized
                      </DropdownMenuItem>
                      
                      {availableCollections
                        .filter(col => col.id !== currentCollectionId)
                        .map((col) => (
                          <DropdownMenuItem
                            key={col.id}
                            onClick={() => onMoveToCollection?.(item.id, col.id)}
                          >
                            {col.name}
                          </DropdownMenuItem>
                        ))}
                    </div>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                    
                    <DropdownMenuItem onClick={() => onArchiveItem?.(item.id)}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="flex items-center justify-end gap-1.5">
          {isWishlistItem && <Search className="h-3.5 w-3.5 text-chart-5" />}
          {!isWishlistItem && item.for_sale && <DollarSign className="h-3.5 w-3.5 text-emerald-500" />}
          {!isWishlistItem && item.for_trade && <Repeat2 className="h-3.5 w-3.5 text-sky-500" />}
        </div>
      </div>
    </div>
  )
}
