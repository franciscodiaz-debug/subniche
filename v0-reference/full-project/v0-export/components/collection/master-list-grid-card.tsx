"use client"

import { useState } from "react"
import Link from "next/link"
import {
  DollarSign,
  Repeat2,
  MoreHorizontal,
  Edit2,
  Trash2,
  Settings,
  AlertTriangle,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { CollectionItem, Collection } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MasterListItem extends CollectionItem {
  collection?: Collection
}

interface MasterListGridCardProps {
  item: MasterListItem
  collections: Collection[]
  isUpdating: boolean
  onToggleForSale: () => Promise<{ success: boolean; needsData: boolean }>
  onToggleForTrade: () => Promise<{ success: boolean; needsData: boolean }>
  onChangeCollection: (collectionId: string | null) => void
  onDelete: () => void
  isDemo?: boolean
}

export function MasterListGridCard({
  item,
  collections,
  isUpdating,
  onToggleForSale,
  onToggleForTrade,
  onChangeCollection,
  onDelete,
  isDemo,
}: MasterListGridCardProps) {
  const primaryImage = item.images?.[0] || "/generic-item.png"
  const [alert, setAlert] = useState<{ type: "sale" | "trade"; message: string } | null>(null)

  const handleForSaleClick = async () => {
    if (item.for_sale) {
      await onToggleForSale()
      setAlert(null)
      return
    }

    const missingFields: string[] = []
    if (!item.user_estimated_value) missingFields.push("price")
    if (!item.description) missingFields.push("description")

    if (missingFields.length > 0) {
      setAlert({
        type: "sale",
        message: `Missing: ${missingFields.join(", ")}.`,
      })
      return
    }

    const result = await onToggleForSale()
    if (result.needsData) {
      setAlert({
        type: "sale",
        message: "Please add required details.",
      })
    } else {
      setAlert(null)
    }
  }

  const handleForTradeClick = async () => {
    if (item.for_trade) {
      await onToggleForTrade()
      setAlert(null)
      return
    }

    if (!item.trade_interests || item.trade_interests.length === 0) {
      setAlert({
        type: "trade",
        message: "No trade interests set.",
      })
      return
    }

    const result = await onToggleForTrade()
    if (result.needsData) {
      setAlert({
        type: "trade",
        message: "No trade interests set.",
      })
    } else {
      setAlert(null)
    }
  }

  return (
    <div
      className={cn(
        "group relative rounded-lg overflow-hidden transition-all flex flex-col bg-card border border-border hover:border-primary/50",
        isUpdating && "opacity-60",
      )}
    >
      <Link href={`/listings/${item.id}`}>
        <div className="aspect-[4/3] relative bg-secondary">
          <img
            src={primaryImage || "/placeholder.svg"}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
      </Link>

      <div className="p-3 space-y-1.5 flex-1 flex flex-col relative">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/listings/${item.id}`} className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate transition-colors text-foreground group-hover:text-primary">
              {item.title}
            </h3>
            {item.subtitle && <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>}
          </Link>

          {/* Actions dropdown - visible on hover */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md hover:bg-secondary">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href={`/listings/${item.id}/edit`}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/listings/${item.id}/edit?section=trade`}>
                  <Settings className="h-4 w-4 mr-2" />
                  Trade Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status icons at bottom right */}
        <div className="flex items-center justify-end gap-1.5">
          {item.for_sale && (
            <button
              onClick={handleForSaleClick}
              disabled={isUpdating}
              className="h-3.5 w-3.5 text-emerald-500"
              title="Listed for sale"
            >
              <DollarSign className="h-3.5 w-3.5" />
            </button>
          )}
          {item.for_trade && (
            <button
              onClick={handleForTradeClick}
              disabled={isUpdating}
              className="h-3.5 w-3.5 text-sky-500"
              title="Listed for trade"
            >
              <Repeat2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Alert */}
        {alert && (
          <div className="mt-2 flex items-center gap-2 px-2 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-md">
            <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span className="text-xs text-amber-600 dark:text-amber-400">{alert.message}</span>
            <button
              onClick={() => setAlert(null)}
              className="ml-auto text-amber-600 dark:text-amber-400 hover:text-amber-700"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
