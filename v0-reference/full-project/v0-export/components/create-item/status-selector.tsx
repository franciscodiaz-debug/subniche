"use client"

import { cn } from "@/lib/utils"
import { DollarSign, ArrowLeftRight, FolderOpen, Heart } from "lucide-react"

interface StatusSelectorProps {
  forSale: boolean
  forTrade: boolean
  inCollection: boolean
  isWishlist: boolean
  onForSaleChange: (value: boolean) => void
  onForTradeChange: (value: boolean) => void
  onInCollectionChange: (value: boolean) => void
  onWishlistChange: (value: boolean) => void
}

export function StatusSelector({
  forSale,
  forTrade,
  inCollection,
  isWishlist,
  onForSaleChange,
  onForTradeChange,
  onInCollectionChange,
  onWishlistChange,
}: StatusSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => !isWishlist && onForSaleChange(!forSale)}
        disabled={isWishlist}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
          isWishlist && "opacity-40 cursor-not-allowed",
          forSale && !isWishlist
            ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30"
            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <DollarSign className="h-3.5 w-3.5" />
        <span>For Sale</span>
      </button>

      <button
        onClick={() => !isWishlist && onForTradeChange(!forTrade)}
        disabled={isWishlist}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
          isWishlist && "opacity-40 cursor-not-allowed",
          forTrade && !isWishlist
            ? "bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/30"
            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <ArrowLeftRight className="h-3.5 w-3.5" />
        <span>For Trade</span>
      </button>

      <button
        onClick={() => onInCollectionChange(!inCollection)}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
          inCollection
            ? "bg-primary/15 text-primary ring-1 ring-primary/30"
            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <FolderOpen className="h-3.5 w-3.5" />
        <span>In Collection</span>
      </button>

      {/* Divider */}
      <div className="w-px h-4 bg-border mx-1" />

      {/* Wishlist Toggle */}
      <button
        onClick={() => !(forSale || forTrade) && onWishlistChange(!isWishlist)}
        disabled={forSale || forTrade}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
          (forSale || forTrade) && "opacity-40 cursor-not-allowed",
          isWishlist && !(forSale || forTrade)
            ? "bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30"
            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <Heart className="h-3.5 w-3.5" />
        <span>Wishlist</span>
      </button>
    </div>
  )
}
