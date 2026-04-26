"use client"

import { useState } from "react"
import { MoreHorizontal, Edit2, Trash2, ExternalLink, Heart, DollarSign, Repeat2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { CollectionItem } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CollectionItemCardProps {
  item: CollectionItem
  view: "grid" | "list"
  onUpdate: (item: CollectionItem) => void
  onDelete: (itemId: string) => void
  isViewOnly?: boolean
}

export function CollectionItemCard({ item, view, onUpdate, onDelete, isViewOnly = false }: CollectionItemCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove this item?")) return

    setIsDeleting(true)
    const { error } = await supabase.from("collection_items").delete().eq("id", item.id)

    if (!error) {
      onDelete(item.id)
    } else {
      console.error("[v0] Error deleting item:", error)
      setIsDeleting(false)
    }
  }

  const primaryImage = item.images?.[0] || "/generic-item.png"
  const hasAvailability = item.for_sale || item.for_trade

  const getAvailabilityText = () => {
    const parts = []
    if (item.for_sale) {
      parts.push(item.asking_price ? `For sale • $${item.asking_price.toLocaleString()}` : "For sale")
    }
    if (item.for_trade) {
      parts.push("Open to trades")
    }
    return parts.join(" · ")
  }

  if (view === "list") {
    return (
      <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg group">
        <div className="relative flex-shrink-0 w-16 h-16 bg-secondary rounded-lg overflow-hidden">
          <img src={primaryImage || "/placeholder.svg"} alt={item.title} className="w-full h-full object-cover" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-foreground truncate">{item.title}</h3>
            {!item.is_owned && <Heart className="h-3.5 w-3.5 text-chart-5 fill-chart-5 flex-shrink-0" />}
          </div>
          {item.subtitle && <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>}
          <p className="text-xs text-muted-foreground mt-1">
            {item.condition} {item.category && `• ${item.category}`}
          </p>
        </div>

        <div className="flex-shrink-0 text-right">
          {item.user_estimated_value ? (
            <p className="font-medium text-foreground">${item.user_estimated_value.toLocaleString()}</p>
          ) : (
            <p className="text-sm text-muted-foreground">—</p>
          )}
        </div>

        {hasAvailability && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {item.for_sale && <DollarSign className="h-3.5 w-3.5 text-emerald-500" />}
                  {item.for_trade && <Repeat2 className="h-3.5 w-3.5 text-sky-500" />}
                </div>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p className="text-xs">{getAvailabilityText()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Actions */}
        {!isViewOnly && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {item.listing_id && (
                <DropdownMenuItem>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Listing
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleDelete} disabled={isDeleting}>
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? "Removing..." : "Remove"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    )
  }

  return (
    <DropdownMenu>
      <div className="group bg-card border border-border rounded-lg overflow-hidden transition-all duration-200 hover:border-primary/50 hover:ring-1 hover:ring-primary/20">
        <DropdownMenuTrigger asChild disabled={isViewOnly}>
          <div className="cursor-pointer">
            <div className="aspect-square bg-secondary overflow-hidden relative">
              <img src={primaryImage || "/placeholder.svg"} alt={item.title} className="w-full h-full object-cover" />

              {/* Wishlist badge */}
              {!item.is_owned && (
                <div className="absolute top-2 left-2 p-1.5 bg-chart-5/90 rounded-full">
                  <Heart className="h-3.5 w-3.5 text-background fill-background" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-3">
              <h3 className="font-medium text-foreground truncate">{item.title}</h3>
              {item.subtitle && <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>}

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                <div>
                  {item.user_estimated_value ? (
                    <p className="font-medium text-foreground">${item.user_estimated_value.toLocaleString()}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No value set</p>
                  )}
                </div>

                {/* Availability icons in bottom right of card info */}
                {hasAvailability && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5">
                          {item.for_sale && <DollarSign className="h-4 w-4 text-emerald-500" />}
                          {item.for_trade && <Repeat2 className="h-4 w-4 text-sky-500" />}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{getAvailabilityText()}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </div>
        </DropdownMenuTrigger>

        {!isViewOnly && (
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            {item.listing_id && (
              <DropdownMenuItem>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Listing
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleDelete} disabled={isDeleting}>
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Removing..." : "Remove"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        )}
      </div>
    </DropdownMenu>
  )
}
