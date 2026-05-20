"use client"

import { cn } from "@/lib/utils"
import { DollarSign, ArrowLeftRight, FolderOpen } from "lucide-react"

interface StatusSelectorProps {
  forSale: boolean
  forTrade: boolean
  inCollection: boolean
  onForSaleChange: (value: boolean) => void
  onForTradeChange: (value: boolean) => void
  onInCollectionChange: (value: boolean) => void
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
} as const

const inactiveStyles = {
  sale: "bg-card border-border text-muted-foreground hover:text-foreground hover:border-emerald-500/40",
  trade: "bg-card border-border text-muted-foreground hover:text-foreground hover:border-sky-500/40",
  collection: "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40",
} as const

const sizeStyles = {
  sm: {
    chip: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
    icon: "h-3.5 w-3.5",
    wrapper: "flex flex-wrap items-center gap-2",
  },
  md: {
    chip: "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all border",
    icon: "h-4 w-4",
    wrapper: "flex flex-wrap items-center gap-2",
  },
  lg: {
    // Mobile form-control sizing — ~44px tap target (accessible) without
    // feeling like three oversized CTAs stacked on the step.
    chip:
      "inline-flex items-center justify-center gap-1.5 px-3 h-11 rounded-lg text-sm font-medium transition-all border",
    icon: "h-4 w-4",
    wrapper: "grid grid-cols-3 gap-1.5",
  },
} as const

export function StatusSelector({
  forSale,
  forTrade,
  inCollection,
  onForSaleChange,
  onForTradeChange,
  onInCollectionChange,
  size = "md",
}: StatusSelectorProps) {
  const s = sizeStyles[size]

  return (
    <div className={s.wrapper}>
      <button
        type="button"
        onClick={() => onForSaleChange(!forSale)}
        className={cn(s.chip, forSale ? activeStyles.sale : inactiveStyles.sale)}
      >
        <DollarSign className={s.icon} />
        <span>For Sale</span>
      </button>

      <button
        type="button"
        onClick={() => onForTradeChange(!forTrade)}
        className={cn(s.chip, forTrade ? activeStyles.trade : inactiveStyles.trade)}
      >
        <ArrowLeftRight className={s.icon} />
        <span>For Trade</span>
      </button>

      <button
        type="button"
        onClick={() => onInCollectionChange(!inCollection)}
        className={cn(
          s.chip,
          inCollection ? activeStyles.collection : inactiveStyles.collection,
        )}
      >
        <FolderOpen className={s.icon} />
        <span>In Collection</span>
      </button>
    </div>
  )
}
