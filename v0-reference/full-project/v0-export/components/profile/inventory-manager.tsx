"use client"

import { useState, useMemo } from "react"
import {
  ArrowLeft,
  DollarSign,
  Repeat2,
  FolderOpen,
  MoreHorizontal,
  Edit2,
  Trash2,
  Settings,
  Package,
  ArrowUpDown,
  Search,
  Grid3X3,
  List,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { CollectionItem, Collection } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { TriStateFilterGroup, type FilterState } from "@/components/ui/tri-state-filter"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface InventoryItem extends CollectionItem {
  collection?: Collection
}

interface InventoryManagerProps {
  items: InventoryItem[]
  collections: Collection[]
  onBack: () => void
  isDemo?: boolean
}

type SortField = "title" | "value" | "collection" | "updated"
type SortDirection = "asc" | "desc"

export function InventoryManager({ items, collections, onBack, isDemo = false }: InventoryManagerProps) {
  const [filters, setFilters] = useState<Record<string, FilterState>>({
    forSale: "neutral",
    forTrade: "neutral",
    inCollection: "neutral",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("updated")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [view, setView] = useState<"list" | "grid">("list")

  const supabase = createClient()

  const handleFilterChange = (key: string, state: FilterState) => {
    setFilters((prev) => ({ ...prev, [key]: state }))
  }

  const filterConfig = [
    { key: "forSale", label: "For Sale", state: filters.forSale },
    { key: "forTrade", label: "For Trade", state: filters.forTrade },
    { key: "inCollection", label: "In Collection", state: filters.inCollection },
  ]

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          item.title.toLowerCase().includes(query) ||
          item.subtitle?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query) ||
          item.collection?.name.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      if (filters.forSale === "include" && !item.for_sale) return false
      if (filters.forSale === "exclude" && item.for_sale) return false
      if (filters.forTrade === "include" && !item.for_trade) return false
      if (filters.forTrade === "exclude" && item.for_trade) return false

      const hasCollection = !!item.collection_id
      if (filters.inCollection === "include" && !hasCollection) return false
      if (filters.inCollection === "exclude" && hasCollection) return false

      return true
    })
  }, [items, filters, searchQuery])

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
        case "value":
          comparison = (a.user_estimated_value || 0) - (b.user_estimated_value || 0)
          break
        case "collection":
          comparison = (a.collection?.name || "").localeCompare(b.collection?.name || "")
          break
        case "updated":
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
          break
      }

      return sortDirection === "asc" ? comparison : -comparison
    })
  }, [filteredItems, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleDelete = async (item: InventoryItem) => {
    if (!confirm("Are you sure you want to remove this item?")) return
    if (isDemo) return

    await supabase.from("collection_items").delete().eq("id", item.id)
  }

  // Stats
  const totalItems = items.length
  const forSaleCount = items.filter((i) => i.for_sale).length
  const forTradeCount = items.filter((i) => i.for_trade).length
  const uncategorizedCount = items.filter((i) => !i.collection_id).length

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Inventory</h1>
          <p className="text-muted-foreground">View and manage all your items</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total</span>
          </div>
          <p className="text-xl font-bold mt-1">{totalItems}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            <span className="text-sm text-muted-foreground">For Sale</span>
          </div>
          <p className="text-xl font-bold mt-1">{forSaleCount}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Repeat2 className="h-4 w-4 text-sky-500" />
            <span className="text-sm text-muted-foreground">For Trade</span>
          </div>
          <p className="text-xl font-bold mt-1">{forTradeCount}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-muted-foreground">Uncategorized</span>
          </div>
          <p className="text-xl font-bold mt-1">{uncategorizedCount}</p>
        </div>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <TriStateFilterGroup filters={filterConfig} onChange={handleFilterChange} className="flex-wrap" />
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50"
          />
        </div>
        <div className="flex gap-1 p-1 bg-card border border-border rounded-lg">
          <button
            onClick={() => setView("list")}
            className={cn(
              "p-2 rounded transition-colors",
              view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("grid")}
            className={cn(
              "p-2 rounded transition-colors",
              view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Results info */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {sortedItems.length} of {totalItems} items
        </p>
      </div>

      {/* Items */}
      {sortedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No items found</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            {totalItems === 0
              ? "Start adding items to your collections to see them here"
              : "Try adjusting your filters or search query"}
          </p>
        </div>
      ) : view === "list" ? (
        <div className="space-y-2">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b border-border">
            <button
              onClick={() => handleSort("title")}
              className="col-span-4 flex items-center gap-1 hover:text-foreground text-left"
            >
              Item
              {sortField === "title" && <ArrowUpDown className="h-3 w-3" />}
            </button>
            <button
              onClick={() => handleSort("value")}
              className="col-span-2 flex items-center gap-1 hover:text-foreground text-left"
            >
              Value
              {sortField === "value" && <ArrowUpDown className="h-3 w-3" />}
            </button>
            <div className="col-span-2 text-left">Status</div>
            <button
              onClick={() => handleSort("collection")}
              className="col-span-2 flex items-center gap-1 hover:text-foreground text-left"
            >
              Collection
              {sortField === "collection" && <ArrowUpDown className="h-3 w-3" />}
            </button>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {sortedItems.map((item) => (
            <InventoryListRow key={item.id} item={item} onDelete={() => handleDelete(item)} isDemo={isDemo} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedItems.map((item) => (
            <InventoryGridCard key={item.id} item={item} onDelete={() => handleDelete(item)} isDemo={isDemo} />
          ))}
        </div>
      )}
    </div>
  )
}

function InventoryListRow({
  item,
  onDelete,
  isDemo,
}: {
  item: InventoryItem
  onDelete: () => void
  isDemo?: boolean
}) {
  const primaryImage = item.images?.[0] || "/generic-item.png"

  return (
    <div className="grid grid-cols-12 gap-4 items-center p-4 bg-card border border-border rounded-lg transition-all hover:border-primary/30">
      <div className="col-span-12 sm:col-span-4 flex items-center gap-3">
        <div className="flex-shrink-0 w-12 h-12 bg-secondary rounded-lg overflow-hidden">
          <img src={primaryImage || "/placeholder.svg"} alt={item.title} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <h3 className="font-medium text-foreground truncate">{item.title}</h3>
          {item.subtitle && <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>}
        </div>
      </div>

      <div className="col-span-6 sm:col-span-2 text-left">
        {item.user_estimated_value ? (
          <span className="font-medium">${item.user_estimated_value.toLocaleString()}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>

      <div className="col-span-12 sm:col-span-2 flex items-center gap-2 flex-wrap">
        {item.for_sale && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-medium">
            <DollarSign className="h-3 w-3" />
            Sale
          </span>
        )}
        {item.for_trade && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-sky-500/10 text-sky-600 text-xs font-medium">
            <Repeat2 className="h-3 w-3" />
            Trade
          </span>
        )}
      </div>

      <div className="col-span-12 sm:col-span-2">
        {item.collection ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted/50 border border-border text-muted-foreground text-xs font-medium truncate max-w-full">
            <FolderOpen className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{item.collection.name}</span>
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Uncategorized</span>
        )}
      </div>

      <div className="col-span-6 sm:col-span-2 flex items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Item
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Trade Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FolderOpen className="h-4 w-4 mr-2" />
              Move to Collection
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function InventoryGridCard({
  item,
  onDelete,
  isDemo,
}: {
  item: InventoryItem
  onDelete: () => void
  isDemo?: boolean
}) {
  const primaryImage = item.images?.[0] || "/generic-item.png"

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-colors">
      <div className="aspect-square bg-secondary overflow-hidden relative">
        <img src={primaryImage || "/placeholder.svg"} alt={item.title} className="w-full h-full object-cover" />

        {(item.for_sale || item.for_trade) && (
          <div className="absolute top-2 left-2 flex gap-1">
            {item.for_sale && (
              <span className="p-1.5 bg-emerald-500 rounded-full">
                <DollarSign className="h-3 w-3 text-white" />
              </span>
            )}
            {item.for_trade && (
              <span className="p-1.5 bg-sky-500 rounded-full">
                <Repeat2 className="h-3 w-3 text-white" />
              </span>
            )}
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur-sm rounded-md text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FolderOpen className="h-4 w-4 mr-2" />
              Move
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="p-3">
        <h3 className="font-medium text-foreground truncate">{item.title}</h3>
        {item.user_estimated_value ? (
          <p className="text-sm font-medium text-foreground mt-1">${item.user_estimated_value.toLocaleString()}</p>
        ) : (
          <p className="text-sm text-muted-foreground mt-1">No value set</p>
        )}
      </div>
    </div>
  )
}
