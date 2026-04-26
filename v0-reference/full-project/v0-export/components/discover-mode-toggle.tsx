"use client"

import { useRouter, usePathname } from "next/navigation"
import { Telescope, Repeat2 } from "lucide-react"
import { cn } from "@/lib/utils"

type DiscoverMode = "browse" | "trade"

interface DiscoverModeToggleProps {
  className?: string
  showLabels?: boolean
}

export function DiscoverModeToggle({ className, showLabels = true }: DiscoverModeToggleProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Determine current mode from pathname
  const currentMode: DiscoverMode = pathname.startsWith("/trade") ? "trade" : "browse"

  const modes: { value: DiscoverMode; label: string; icon: typeof Telescope; href: string }[] = [
    { value: "browse", label: "Browse", icon: Telescope, href: "/discover" },
    { value: "trade", label: "Trade", icon: Repeat2, href: "/trade" },
  ]

  const handleModeChange = (mode: DiscoverMode) => {
    if (mode !== currentMode) {
      router.push(mode === "browse" ? "/discover" : "/trade")
    }
  }

  return (
    <div className={cn("flex items-center gap-1 p-1 bg-card rounded-lg border border-border", className)}>
      {modes.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => handleModeChange(value)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
            currentMode === value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          )}
        >
          <Icon className="h-4 w-4" />
          {showLabels && <span>{label}</span>}
        </button>
      ))}
    </div>
  )
}
