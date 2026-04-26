"use client"

import { useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Eye, Lock, Heart, Link2 } from "lucide-react"
import type { WishlistItemData } from "@/lib/types/item-status"

interface WishlistFieldsProps {
  data: WishlistItemData
  onChange: (data: WishlistItemData) => void
  isActive: boolean
}

export function WishlistFields({ data, onChange, isActive }: WishlistFieldsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isActive && !hasAnimated) {
      setIsAnimating(true)
      setHasAnimated(true)
      const timer = setTimeout(() => setIsAnimating(false), 500)
      return () => clearTimeout(timer)
    }
    if (!isActive) {
      setHasAnimated(false)
    }
  }, [isActive, hasAnimated])

  if (!isActive) {
    return null
  }

  return (
    <div
      ref={containerRef}
      data-section
      className={cn(
        "bg-card rounded-lg border border-border p-4 md:p-6 transition-all duration-300",
        isAnimating && "animate-in fade-in slide-in-from-top-2",
        "focus-within:ring-2 focus-within:ring-primary",
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Wishlist Details</h2>
        <Heart className="h-5 w-5 text-primary" />
      </div>

      <div className="space-y-4">
        {/* Source URL */}
        <div>
          <label className="text-sm text-muted-foreground mb-1.5 block">Source URL</label>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="url"
              value={data.sourceUrl || ""}
              onChange={(e) => onChange({ ...data, sourceUrl: e.target.value || null })}
              placeholder="https://example.com/product-link"
              className={cn(
                "w-full bg-card rounded-lg border border-border pl-10 pr-3 py-2.5 text-sm",
                "text-foreground placeholder:text-muted-foreground/40",
                "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all",
              )}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Link to where you found this item</p>
        </div>

        {/* Visibility Toggle */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Visibility</label>
          <div className="flex items-center gap-2 p-1 bg-muted rounded-lg w-fit">
            <button
              type="button"
              onClick={() => onChange({ ...data, isPublic: true })}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                data.isPublic
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Eye className="h-4 w-4" />
              Public
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...data, isPublic: false })}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                !data.isPublic
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Lock className="h-4 w-4" />
              Private
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {data.isPublic 
              ? "This wishlist item will be visible to anyone viewing your profile or collections."
              : "This wishlist item will only be visible to you."
            }
          </p>
        </div>
      </div>
    </div>
  )
}
