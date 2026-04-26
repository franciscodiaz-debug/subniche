"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Globe, Search, Guitar, Bike, Disc3, Wine, Plus, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Niche {
  id: string
  name: string
  icon: React.ReactNode
}

const platformNiches: Niche[] = [
  { id: "guitars", name: "Guitars", icon: <Guitar className="h-4 w-4" /> },
  { id: "motorcycles", name: "Motorcycles", icon: <Bike className="h-4 w-4" /> },
  { id: "disc-golf", name: "Disc Golf", icon: <Disc3 className="h-4 w-4" /> },
  { id: "wines", name: "Wines", icon: <Wine className="h-4 w-4" /> },
]

interface NicheSwitcherProps {
  collapsed?: boolean
}

export function NicheSwitcher({ collapsed = false }: NicheSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentNiche, setCurrentNiche] = useState<Niche>(platformNiches[0])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const filteredNiches = platformNiches.filter((niche) => niche.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleNicheSelect = (niche: Niche) => {
    setCurrentNiche(niche)
    setIsOpen(false)
    setSearchQuery("")
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-2 px-2 py-2 rounded-md transition-colors hover:bg-muted/50",
          collapsed ? "justify-center" : "",
          isOpen && "bg-muted/50",
        )}
        title={collapsed ? currentNiche.name : undefined}
      >
        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
          <Globe className="h-5 w-5 text-muted-foreground" />
        </div>
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute left-full bottom-0 ml-2 w-52 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50",
          )}
        >
          {/* Search input */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Find niche..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 bg-muted/30 border-0 rounded text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Niches list */}
          <div className="py-1 max-h-48 overflow-y-auto">
            {filteredNiches.map((niche) => {
              const isSelected = niche.id === currentNiche.id
              return (
                <button
                  key={niche.id}
                  onClick={() => handleNicheSelect(niche)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-1.5 transition-colors text-left",
                    isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-foreground/80",
                  )}
                >
                  <span className={cn("flex-shrink-0", isSelected ? "text-primary" : "text-muted-foreground")}>
                    {niche.icon}
                  </span>
                  <span className="flex-1 text-xs font-medium truncate">{niche.name}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
                </button>
              )
            })}

            {filteredNiches.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted-foreground text-center">No niches found</p>
            )}
          </div>

          {/* Suggest new niche */}
          <div className="border-t border-border">
            <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
              <Plus className="h-3.5 w-3.5" />
              Suggest a Niche
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
