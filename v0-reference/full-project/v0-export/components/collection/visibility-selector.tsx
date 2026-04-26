"use client"

import type React from "react"
import { useState } from "react"
import { Lock, Link2, Globe, ChevronDown, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { Collection, CollectionVisibility } from "@/lib/types"

interface VisibilitySelectorProps {
  collection: Collection
  onUpdate: (collection: Collection) => void
  isDemo?: boolean
  variant?: "full" | "compact" // full = dropdown with descriptions, compact = small inline
}

const visibilityOptions: {
  value: CollectionVisibility
  label: string
  description: string
  icon: typeof Lock
}[] = [
  {
    value: "private",
    label: "Private",
    description: "Only you can see this collection",
    icon: Lock,
  },
  {
    value: "unlisted",
    label: "Unlisted",
    description: "Anyone with the link can view",
    icon: Link2,
  },
  {
    value: "public",
    label: "Public",
    description: "Visible on your profile",
    icon: Globe,
  },
]

export function VisibilitySelector({ collection, onUpdate, isDemo, variant = "full" }: VisibilitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  const currentOption = visibilityOptions.find((o) => o.value === collection.visibility) || visibilityOptions[0]
  const CurrentIcon = currentOption.icon

  const handleSelect = async (value: CollectionVisibility) => {
    if (value === collection.visibility) {
      setIsOpen(false)
      return
    }

    if (isDemo) {
      onUpdate({ ...collection, visibility: value })
      setIsOpen(false)
      return
    }

    setIsUpdating(true)
    const { error } = await supabase
      .from("collections")
      .update({ visibility: value, updated_at: new Date().toISOString() })
      .eq("id", collection.id)

    if (!error) {
      onUpdate({ ...collection, visibility: value })
    }
    setIsUpdating(false)
    setIsOpen(false)
  }

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const shareUrl = `${window.location.origin}/collection/shared/${collection.share_token}`
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Compact variant - just icon button that cycles through options
  if (variant === "compact") {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isUpdating}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors",
            "bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground",
          )}
          title={`Visibility: ${currentOption.label}`}
        >
          <CurrentIcon className="h-3 w-3" />
          <span>{currentOption.label}</span>
          <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full left-0 mt-1 z-50 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[140px]">
              {visibilityOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-colors",
                      option.value === collection.visibility
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{option.label}</span>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>
    )
  }

  // Full variant - dropdown with descriptions and copy link
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={cn(
          "flex items-center justify-between gap-3 w-full px-3 py-2 rounded-lg border transition-colors text-left",
          "bg-card border-border hover:border-primary/50",
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-1.5 rounded-md",
              collection.visibility === "public"
                ? "bg-chart-2/10"
                : collection.visibility === "unlisted"
                  ? "bg-primary/10"
                  : "bg-secondary",
            )}
          >
            <CurrentIcon
              className={cn(
                "h-4 w-4",
                collection.visibility === "public"
                  ? "text-chart-2"
                  : collection.visibility === "unlisted"
                    ? "text-primary"
                    : "text-muted-foreground",
              )}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{currentOption.label}</p>
            <p className="text-xs text-muted-foreground">{currentOption.description}</p>
          </div>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
            {visibilityOptions.map((option) => {
              const Icon = option.icon
              const isSelected = option.value === collection.visibility
              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 transition-colors text-left",
                    isSelected ? "bg-primary/10" : "hover:bg-secondary",
                  )}
                >
                  <div className={cn("p-1.5 rounded-md", isSelected ? "bg-primary/20" : "bg-secondary")}>
                    <Icon className={cn("h-4 w-4", isSelected ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <div className="flex-1">
                    <p className={cn("text-sm font-medium", isSelected ? "text-foreground" : "text-foreground")}>
                      {option.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                </button>
              )
            })}

            {/* Copy link section - only show for unlisted/public */}
            {collection.visibility !== "private" && (
              <div className="border-t border-border px-3 py-2">
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-secondary rounded-md text-sm text-foreground hover:bg-secondary/80 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-chart-2" />
                      <span>Link copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy shareable link</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
