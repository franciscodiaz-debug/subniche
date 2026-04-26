"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, Settings, Check, Sparkles, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface TradeableItemOption {
  id: string
  title: string
  image?: string
  price?: number | null
  type: "listing" | "collection_item"
  matchCount: number
  perfectCount: number
}

interface TradeItemSelectorProps {
  items: TradeableItemOption[]
  selectedItemId: string
  onSelect: (itemId: string) => void
  totalMatches: number
  totalPerfect: number
}

export function TradeItemSelector({
  items,
  selectedItemId,
  onSelect,
  totalMatches,
  totalPerfect,
}: TradeItemSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const selectedItem = selectedItemId === "all" ? null : items.find((item) => item.id === selectedItemId)

  const filteredItems = items.filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()))

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery("") // Clear search when closing
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

  return (
    <div className="relative flex items-center gap-1" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors border border-border pl-2",
          "hover:bg-secondary/80 text-left",
          isOpen && "bg-secondary",
        )}
      >
        {selectedItem ? (
          <span className="text-sm font-medium text-foreground max-w-[180px] truncate">{selectedItem.title}</span>
        ) : (
          <>
            <span className="font-medium text-foreground text-sm">All</span>
            {isOpen && <span className="text-muted-foreground text-sm">({totalMatches})</span>}
          </>
        )}
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
      </button>

      {selectedItem && (
        <Link
          href={`/trade/settings/${selectedItem.type}/${selectedItem.id}`}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
          title="Trade preferences"
        >
          <Settings className="h-4 w-4" />
        </Link>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-72 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {items.length > 5 && (
            <>
              <div className="p-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-sm bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <div className="border-t border-border" />
            </>
          )}

          {!searchQuery && (
            <>
              <button
                onClick={() => {
                  onSelect("all")
                  setIsOpen(false)
                  setSearchQuery("")
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors",
                  selectedItemId === "all" ? "bg-primary/10" : "hover:bg-secondary",
                )}
              >
                <Sparkles className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-medium text-foreground flex-1">All Items</span>
                <span className="text-xs text-muted-foreground">{totalMatches} matches</span>
                {selectedItemId === "all" && <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
              </button>
              <div className="border-t border-border" />
            </>
          )}

          <div className="max-h-64 overflow-y-auto">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 transition-colors group",
                  selectedItemId === item.id ? "bg-primary/10" : "hover:bg-secondary",
                )}
              >
                <button
                  onClick={() => {
                    onSelect(item.id)
                    setIsOpen(false)
                    setSearchQuery("")
                  }}
                  className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                >
                  <div className="w-7 h-7 rounded overflow-hidden bg-secondary flex-shrink-0">
                    <Image
                      src={item.image || "/placeholder.svg?height=28&width=28&query=item"}
                      alt={item.title}
                      width={28}
                      height={28}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                    <span className="text-xs text-muted-foreground">
                      {item.matchCount} {item.matchCount === 1 ? "match" : "matches"}
                    </span>
                  </div>
                  {selectedItemId === item.id && <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
                </button>

                <Link
                  href={`/trade/settings/${item.type}/${item.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                  title="Trade preferences"
                >
                  <Settings className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && searchQuery && (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">No items matching "{searchQuery}"</div>
          )}

          {items.length === 0 && (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">No tradeable items</div>
          )}
        </div>
      )}
    </div>
  )
}
