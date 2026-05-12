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
  /**
   * "sm" → compact desktop chips (legacy look)
   * "md" → default, promoted chips used when the selector acts as the page heading
   * "lg" → thumb-sized cards for the mobile wizard
   */
  size?: "sm" | "md" | "lg"
}

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

const sizeStyles = {
  sm: {
    chip: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
    icon: "h-3.5 w-3.5",
    divider: "w-px h-4 mx-1",
    wrapper: "flex flex-wrap items-center gap-2",
  },
  md: {
    chip: "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all border",
    icon: "h-4 w-4",
    divider: "w-px h-4 mx-1",
    wrapper: "flex flex-wrap items-center gap-2",
  },
  lg: {
    // Mobile form-control sizing — ~44px tap target (accessible) without
    // feeling like four oversized CTAs stacked on the step.
    chip:
      "inline-flex items-center justify-center gap-1.5 px-3 h-11 rounded-lg text-sm font-medium transition-all border",
    icon: "h-4 w-4",
    divider: "hidden",
    wrapper: "grid grid-cols-2 gap-1.5",
  },
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
  size = "md",
}: StatusSelectorProps) {
  // Exclusion rules:
  // - For Sale + For Trade can be combined freely.
  // - Wishlist (items the user doesn't own) excludes everything else.
  // - Keeping (items the user just owns) excludes everything else.
  const ownershipLocked = isWishlist || inCollection
  const wishlistLocked = forSale || forTrade || inCollection
  const keepingLocked = forSale || forTrade || isWishlist
  const s = sizeStyles[size]

  return (
    <div className={s.wrapper}>
      <button
        type="button"
        onClick={() => !ownershipLocked && onForSaleChange(!forSale)}
        disabled={ownershipLocked}
        className={cn(
          s.chip,
          ownershipLocked && "opacity-40 cursor-not-allowed",
          forSale && !ownershipLocked ? activeStyles.sale : inactiveStyles.sale,
        )}
      >
        <DollarSign className={s.icon} />
        <span>For Sale</span>
      </button>

      <button
        type="button"
        onClick={() => !ownershipLocked && onForTradeChange(!forTrade)}
        disabled={ownershipLocked}
        className={cn(
          s.chip,
          ownershipLocked && "opacity-40 cursor-not-allowed",
          forTrade && !ownershipLocked ? activeStyles.trade : inactiveStyles.trade,
        )}
      >
        <ArrowLeftRight className={s.icon} />
        <span>For Trade</span>
      </button>

      <button
        type="button"
        onClick={() => !keepingLocked && onInCollectionChange(!inCollection)}
        disabled={keepingLocked}
        className={cn(
          s.chip,
          keepingLocked && "opacity-40 cursor-not-allowed",
          inCollection && !keepingLocked ? activeStyles.collection : inactiveStyles.collection,
        )}
      >
        <FolderOpen className={s.icon} />
        <span>Keeping</span>
      </button>

      <div className={cn(s.divider, "bg-border")} />

      <button
        type="button"
        onClick={() => !wishlistLocked && onWishlistChange(!isWishlist)}
        disabled={wishlistLocked}
        className={cn(
          s.chip,
          wishlistLocked && "opacity-40 cursor-not-allowed",
          isWishlist && !wishlistLocked ? activeStyles.wishlist : inactiveStyles.wishlist,
        )}
      >
        <Heart className={s.icon} />
        <span>Wishlist</span>
      </button>
    </div>
  )
}
