"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface FilterChipProps {
  label: string
  selected: boolean
  onClick: () => void
  count?: number
}

export function FilterChip({ label, selected, onClick, count }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all",
        "border",
        selected
          ? "bg-primary/20 border-primary text-foreground"
          : "bg-card border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground",
      )}
    >
      {selected && <Check className="h-3 w-3" />}
      <span>{label}</span>
      {count !== undefined && <span className="text-xs text-muted-foreground">({count})</span>}
    </button>
  )
}
