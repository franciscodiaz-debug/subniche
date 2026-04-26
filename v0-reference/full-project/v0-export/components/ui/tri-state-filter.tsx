"use client"

import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type FilterState = "neutral" | "include" | "exclude"

interface TriStateFilterProps {
  label: string
  state: FilterState
  onChange: (state: FilterState) => void
  className?: string
  colorVariant?: "default" | "green" | "blue"
}

export function TriStateFilter({ label, state, onChange, className, colorVariant = "default" }: TriStateFilterProps) {
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
    <button
      onClick={cycleState}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
        // Neutral state
        state === "neutral" &&
          "border border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground",
        // Include state - green variant (For Sale)
        state === "include" &&
          colorVariant === "green" &&
          "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20",
        // Include state - blue variant (For Trade)
        state === "include" &&
          colorVariant === "blue" &&
          "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
        // Include state - default (primary)
        state === "include" && colorVariant === "default" && "bg-primary text-primary-foreground border border-primary",
        // Exclude state
        state === "exclude" && "border border-destructive text-destructive line-through decoration-destructive/70",
        className,
      )}
    >
      {state === "include" && <Check className="h-3.5 w-3.5" />}
      {state === "exclude" && <X className="h-3.5 w-3.5" />}
      {label}
    </button>
  )
}

interface TriStateFilterGroupProps {
  filters: {
    key: string
    label: string
    state: FilterState
  }[]
  onChange: (key: string, state: FilterState) => void
  className?: string
}

export function TriStateFilterGroup({ filters, onChange, className }: TriStateFilterGroupProps) {
  const getColorVariant = (key: string): "default" | "green" | "blue" => {
    if (key === "forSale") return "green"
    if (key === "forTrade") return "blue"
    return "default"
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {filters.map((filter) => (
        <TriStateFilter
          key={filter.key}
          label={filter.label}
          state={filter.state}
          onChange={(state) => onChange(filter.key, state)}
          colorVariant={getColorVariant(filter.key)}
        />
      ))}
    </div>
  )
}
