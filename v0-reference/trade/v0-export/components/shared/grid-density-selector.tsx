"use client"

import { useEffect } from "react"
import { Check } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  gridDensityConfig,
  gridDensityOrder,
  useGridDensity,
} from "@/hooks/use-grid-density"
import { useIsMobile } from "@/hooks/use-mobile"

interface GridDensitySelectorProps {
  id?: string
}

export function GridDensitySelector({ id }: GridDensitySelectorProps) {
  const { gridDensity, setGridDensity } = useGridDensity()
  const isMobile = useIsMobile()

  // On mobile the viewport is too narrow for the Compact layout to be
  // readable, so we restrict choices to Comfortable and Spacious. If the
  // user previously selected Compact on a larger screen and has since
  // resized down, bump them up to Comfortable automatically.
  const availableDensities = isMobile
    ? gridDensityOrder.filter((d) => d !== "compact")
    : gridDensityOrder

  useEffect(() => {
    if (isMobile && gridDensity === "compact") {
      setGridDensity("comfortable")
    }
  }, [isMobile, gridDensity, setGridDensity])

  const ActiveIcon = gridDensityConfig[gridDensity].icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          id={id}
          data-onboarding-id={id}
          aria-label={`Grid density: ${gridDensityConfig[gridDensity].label}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-secondary"
        >
          <ActiveIcon className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {availableDensities.map((density) => {
          const config = gridDensityConfig[density]
          const Icon = config.icon
          return (
            <DropdownMenuItem
              key={density}
              onClick={() => setGridDensity(density)}
              className="flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {config.label}
              </span>
              {gridDensity === density ? (
                <Check className="h-4 w-4 text-primary" />
              ) : null}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
