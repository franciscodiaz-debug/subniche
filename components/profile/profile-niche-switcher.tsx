"use client"

import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { Bike, Disc3, Globe, Guitar, Wine } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface UserNiche {
  id: string
  name: string
  icon: ReactNode
}

interface ProfileNicheSwitcherProps {
  username: string
  activeNicheName: string
  isOwnProfile?: boolean
  buttonClassName?: string
}

export const userNiches: UserNiche[] = [
  { id: "guitar_collector", name: "guitar_collector", icon: <Guitar className="h-3.5 w-3.5" /> },
  { id: "moto_jek", name: "moto_jek", icon: <Bike className="h-3.5 w-3.5" /> },
  { id: "disc_jek", name: "disc_jek", icon: <Disc3 className="h-3.5 w-3.5" /> },
  { id: "wine_jek", name: "wine_jek", icon: <Wine className="h-3.5 w-3.5" /> },
]

export function ProfileNicheSwitcher({
  username,
  activeNicheName,
  isOwnProfile = true,
  buttonClassName,
}: ProfileNicheSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const tooltip = isOwnProfile ? "View your niches" : `View ${username}'s niches`

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="quiet_outline"
        size="icon-sm"
        className={buttonClassName}
        aria-label={tooltip}
        title={tooltip}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
      >
        <Globe className="h-4 w-4" />
      </Button>
      {isOpen ? (
        <div
          role="menu"
          aria-label={tooltip}
          className="absolute right-0 top-full z-50 mt-2 min-w-[200px] overflow-hidden rounded-lg border border-border bg-card shadow-lg"
        >
          <ul className="py-1">
            {userNiches.map((niche) => {
              const isActive = niche.name === activeNicheName
              return (
                <li key={niche.id}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex w-full items-center gap-2.5 border-l-2 px-3 py-2 text-left transition-colors",
                      isActive
                        ? "border-primary bg-primary/10"
                        : "border-transparent hover:bg-muted/40",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-border bg-muted/60",
                        isActive ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {niche.icon}
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                      <span
                        className={cn(
                          "block truncate text-sm font-medium",
                          isActive ? "text-foreground" : "text-foreground/90",
                        )}
                      >
                        {niche.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        @{username}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
