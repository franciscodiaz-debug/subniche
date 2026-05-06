"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { AdminNiche } from "@/lib/admin/mock-taxonomy"

interface NicheListProps {
  niches: AdminNiche[]
  selectedId: string | null
  onSelect: (niche: AdminNiche) => void
  onUpdate: (niches: AdminNiche[]) => void
}

export function NicheList({ niches, selectedId, onSelect }: NicheListProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <p className="text-sm font-medium text-muted-foreground">Niches</p>
      </div>

      <ul className="flex-1 overflow-y-auto">
        {niches.map((niche) => (
          <li
            key={niche.id}
            className={cn(
              "flex cursor-pointer items-center gap-3 border-b border-border px-5 py-3.5 transition-colors",
              selectedId === niche.id
                ? "bg-card text-foreground"
                : "text-foreground hover:bg-card/50",
            )}
            onClick={() => onSelect(niche)}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{niche.name}</span>
                {niche.status === "inactive" ? (
                  <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">
                    inactive
                  </Badge>
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {niche.itemCount.toLocaleString()} items · {niche.categoryCount} cat
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
