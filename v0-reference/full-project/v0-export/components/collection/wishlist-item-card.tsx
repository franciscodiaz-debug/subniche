"use client"

import { useState } from "react"
import {
  MoreHorizontal,
  Edit2,
  Trash2,
  ExternalLink,
  Sparkles,
  ChevronUp,
  ChevronDown,
  ShoppingCart,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { CollectionItem } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface WishlistItemCardProps {
  item: CollectionItem
  onUpdate: (item: CollectionItem) => void
  onDelete: (itemId: string) => void
  onMarkAcquired: (itemId: string) => void
}

const PRIORITY_LABELS = ["Low", "Medium", "High"]
const PRIORITY_COLORS = ["text-muted-foreground", "text-chart-4", "text-chart-5"]

export function WishlistItemCard({ item, onUpdate, onDelete, onMarkAcquired }: WishlistItemCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm("Remove this item from your wishlist?")) return

    setIsDeleting(true)
    const { error } = await supabase.from("collection_items").delete().eq("id", item.id)

    if (!error) {
      onDelete(item.id)
    } else {
      console.error("[v0] Error deleting item:", error)
      setIsDeleting(false)
    }
  }

  const handlePriorityChange = async (direction: "up" | "down") => {
    const newPriority = direction === "up" ? Math.min(2, item.priority + 1) : Math.max(0, item.priority - 1)

    if (newPriority === item.priority) return

    setIsUpdating(true)
    const { data, error } = await supabase
      .from("collection_items")
      .update({ priority: newPriority })
      .eq("id", item.id)
      .select()
      .single()

    if (!error && data) {
      onUpdate(data)
    }
    setIsUpdating(false)
  }

  const primaryImage = item.images?.[0] || "/generic-item.png"

  return (
    <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg group">
      {/* Priority Controls */}
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={() => handlePriorityChange("up")}
          disabled={item.priority >= 2 || isUpdating}
          className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <span className={cn("text-xs font-medium", PRIORITY_COLORS[item.priority])}>
          {PRIORITY_LABELS[item.priority]}
        </span>
        <button
          onClick={() => handlePriorityChange("down")}
          disabled={item.priority <= 0 || isUpdating}
          className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* Image */}
      <div className="flex-shrink-0 w-20 h-20 bg-secondary rounded-lg overflow-hidden">
        <img src={primaryImage || "/placeholder.svg"} alt={item.title} className="w-full h-full object-cover" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground truncate">{item.title}</h3>
        {item.subtitle && <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>}
        <div className="flex items-center gap-3 mt-2">
          {item.user_estimated_value && (
            <span className="text-sm font-medium text-foreground">${item.user_estimated_value.toLocaleString()}</span>
          )}
          {item.ai_suggested_value && (
            <span className="flex items-center gap-1 text-xs text-chart-2">
              <Sparkles className="h-3 w-3" />${item.ai_suggested_value.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMarkAcquired(item.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Mark Acquired
        </Button>

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
      </div>
    </div>
  )
}
