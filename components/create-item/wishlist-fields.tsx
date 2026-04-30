"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Eye, Lock, Heart, Link2 } from "lucide-react"
import type { WishlistItemData } from "@/lib/types/item-status"

interface WishlistFieldsProps {
  data: WishlistItemData
  onChange: (data: WishlistItemData) => void
  isActive: boolean
}

export function WishlistFields({ data, onChange, isActive }: WishlistFieldsProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (!isActive) return
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 400)
    return () => clearTimeout(timer)
  }, [isActive])

  if (!isActive) return null

  return (
    <div
      data-section
      className={cn(
        "bg-card rounded-lg border border-border p-4 md:p-5 transition-all duration-300",
        isAnimating && "animate-in fade-in slide-in-from-top-2",
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-foreground">Wishlist Details</h2>
        <Heart className="h-4 w-4 text-primary" />
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Source URL</label>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="url"
              value={data.sourceUrl || ""}
              onChange={(e) => onChange({ ...data, sourceUrl: e.target.value || null })}
              placeholder="https://example.com/product-link"
              className={cn(
                "w-full bg-card rounded-lg border border-border pl-9 pr-3 py-2 text-sm",
                "text-foreground placeholder:text-muted-foreground/50",
                "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all",
              )}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Link to where you found this item</p>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Target Price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
            <input
              type="number"
              step="0.01"
              value={data.targetPrice ?? ""}
              onChange={(e) =>
                onChange({
                  ...data,
                  targetPrice: e.target.value ? Number(e.target.value) : null,
                })
              }
              placeholder="0.00"
              className={cn(
                "w-full bg-card rounded-lg border border-border pl-7 pr-3 py-2 text-sm",
                "text-foreground placeholder:text-muted-foreground/50",
                "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all",
              )}
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Visibility</label>
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit">
            <button
              type="button"
              onClick={() => onChange({ ...data, isPublic: true })}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                data.isPublic
                  ? "bg-card text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Eye className="h-3.5 w-3.5" />
              Public
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...data, isPublic: false })}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                !data.isPublic
                  ? "bg-card text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Lock className="h-3.5 w-3.5" />
              Private
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {data.isPublic
              ? "Visible to anyone viewing your profile or collections."
              : "Only visible to you."}
          </p>
        </div>
      </div>
    </div>
  )
}
