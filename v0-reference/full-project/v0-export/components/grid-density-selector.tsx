"use client"

import { Check } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useGridDensity, gridDensityConfig, gridDensityOrder } from "@/hooks/use-grid-density"

export function GridDensitySelector() {
  const { gridDensity, setGridDensity } = useGridDensity()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-center h-9 w-9 bg-card rounded-lg hover:bg-muted transition-colors">
          {(() => {
            const Icon = gridDensityConfig[gridDensity].icon
            return <Icon className="h-4 w-4" />
          })()}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {gridDensityOrder.map((density) => {
          const config = gridDensityConfig[density]
          const Icon = config.icon
          return (
            <DropdownMenuItem
              key={density}
              onClick={() => setGridDensity(density)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {config.label}
              </div>
              {gridDensity === density && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
