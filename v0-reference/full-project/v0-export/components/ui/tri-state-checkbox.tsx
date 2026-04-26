"use client"

import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type TriState = "neutral" | "include" | "exclude"

interface TriStateCheckboxProps {
  state: TriState
  onChange: (state: TriState) => void
  label: string
  count?: number
  className?: string
}

export function TriStateCheckbox({ state, onChange, label, count, className }: TriStateCheckboxProps) {
  const cycleState = () => {
    if (state === "neutral") {
      onChange("include")
    } else if (state === "include") {
      onChange("exclude")
    } else {
      onChange("neutral")
    }
  }

  return (
    <label className={cn("flex items-center gap-2 py-0.5 cursor-pointer group", className)} onClick={cycleState}>
      <div className="relative">
        <div
          className={cn(
            "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
            state === "neutral" && "border-muted-foreground/30 bg-transparent group-hover:border-muted-foreground/50",
            state === "include" && "border-primary bg-primary",
            state === "exclude" && "border-destructive bg-destructive",
          )}
        >
          {state === "include" && <Check className="h-3 w-3 text-primary-foreground" />}
          {state === "exclude" && <X className="h-3 w-3 text-destructive-foreground" />}
        </div>
      </div>
      <span
        className={cn(
          "text-sm transition-colors flex-1",
          state === "neutral" && "text-muted-foreground group-hover:text-foreground",
          state === "include" && "text-foreground font-medium",
          state === "exclude" && "text-destructive line-through",
        )}
      >
        {label}
      </span>
      {count !== undefined && <span className="text-xs text-muted-foreground">({count.toLocaleString()})</span>}
    </label>
  )
}
