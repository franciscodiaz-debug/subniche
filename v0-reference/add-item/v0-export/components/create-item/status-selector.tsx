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

const baseChip =
  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"

// Each status gets its own accent so users can tell them apart at a glance.
// Kept calm and consistent with the dark theme: soft tinted background + matching border/text.
const activeStyles = {
  sale: "bg-emerald-500/10 border-emerald-500/60 text-emerald-400",
  trade: "bg-sky-500/10 border-sky-500/60 text-sky-400",
  collection: "bg-primary/10 border-primary text-primary",
  wishlist: "bg-rose-500/10 border-rose-500/60 text-rose-400",
} as const

const inactiveStyles = {
  sale: "bg-card border-border text-muted-foreground hover:text-foreground hover:border-emerald-500/40",
  trade: "bg-card border-border text-muted-foreground hover:text-foreground hover:border-sky-500/40",
  collection: "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40",
  wishlist: "bg-card border-border text-muted-foreground hover:text-foreground hover:border-rose-500/40",
} as const

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
  const ownershipLocked = isWishlist
  const wishlistLocked = forSale || forTrade

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => !ownershipLocked && onForSaleChange(!forSale)}
        disabled={ownershipLocked}
        className={cn(
          baseChip,
          ownershipLocked && "opacity-40 cursor-not-allowed",
          forSale && !ownershipLocked ? activeStyles.sale : inactiveStyles.sale,
        )}
      >
        <DollarSign className="h-3.5 w-3.5" />
        <span>For Sale</span>
      </button>

      <button
        type="button"
        onClick={() => !ownershipLocked && onForTradeChange(!forTrade)}
        disabled={ownershipLocked}
        className={cn(
          baseChip,
          ownershipLocked && "opacity-40 cursor-not-allowed",
          forTrade && !ownershipLocked ? activeStyles.trade : inactiveStyles.trade,
        )}
      >
        <ArrowLeftRight className="h-3.5 w-3.5" />
        <span>For Trade</span>
      </button>

      <button
        type="button"
        onClick={() => onInCollectionChange(!inCollection)}
        className={cn(
          baseChip,
          inCollection ? activeStyles.collection : inactiveStyles.collection,
        )}
      >
        <FolderOpen className="h-3.5 w-3.5" />
        <span>In Collection</span>
      </button>

      <div className="w-px h-4 bg-border mx-1" />

      <button
        type="button"
        onClick={() => !wishlistLocked && onWishlistChange(!isWishlist)}
        disabled={wishlistLocked}
        className={cn(
          baseChip,
          wishlistLocked && "opacity-40 cursor-not-allowed",
          isWishlist && !wishlistLocked ? activeStyles.wishlist : inactiveStyles.wishlist,
        )}
      >
        <Heart className="h-3.5 w-3.5" />
        <span>Wishlist</span>
      </button>
    </div>
  )
}
