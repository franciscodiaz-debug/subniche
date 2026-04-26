"use client"

import { useState, useMemo } from "react"
import {
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
  ChevronDown,
  Check,
  AlertTriangle,
  ExternalLink,
  X,
  Grid3X3,
  Grid2X2,
  Grip,
  List,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { CollectionItem, Collection } from "@/lib/types"
import { TriStateFilterGroup, type FilterState } from "@/components/ui/tri-state-filter"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MasterListGridCard } from "./master-list-grid-card" // Import MasterListGridCard

interface MasterListItem extends CollectionItem {
  collection?: Collection
}

type ViewMode = "grid-big" | "grid-normal" | "grid-dense" | "list"

interface MasterListProps {
  items: MasterListItem[]
  collections: Collection[]
  onItemUpdate: (item: CollectionItem) => void
  onItemDelete: (itemId: string) => void
  isDemo?: boolean
  view?: "grid" | "list"
  onViewChange?: (view: "grid" | "list") => void
}

type SortField = "title" | "value" | "collection" | "updated"
type SortDirection = "asc" | "desc"

export function MasterList({ items, collections, onItemUpdate, onItemDelete, isDemo = false, view = "list", onViewChange }: MasterListProps) {
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "")
  const statusParam = searchParams.get("status")

  const [internalView, setInternalView] = useState<ViewMode>("grid-normal")
  const [filters, setFilters] = useState<Record<string, FilterState>>(() => {
    if (statusParam === "for-sale") {
      return { forSale: "include", forTrade: "neutral" }
    } else if (statusParam === "for-trade") {
      return { forSale: "neutral", forTrade: "include" }
    } else if (statusParam === "private") {
      return { forSale: "exclude", forTrade: "exclude" }
    }
    return { forSale: "neutral", forTrade: "neutral" }
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("updated")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null)

  const supabase = createClient()

  const handleFilterChange = (key: string, state: FilterState) => {
    setFilters((prev) => ({ ...prev, [key]: state }))
  }

  const filterConfig = [
    { key: "forSale", label: "For Sale", state: filters.forSale },
    { key: "forTrade", label: "For Trade", state: filters.forTrade },
  ]

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedCollectionId !== null) {
        if (selectedCollectionId === "uncategorized") {
          if (item.collection_id) return false
        } else {
          if (item.collection_id !== selectedCollectionId) return false
        }
      }

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

      return true
    })
  }, [items, filters, searchQuery, selectedCollectionId])

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

  const handleToggleForSale = async (item: MasterListItem): Promise<{ success: boolean; needsData: boolean }> => {
    if (!item.for_sale && !item.user_estimated_value) {
      return { success: false, needsData: true }
    }

    if (isDemo) return { success: true, needsData: false }

    setUpdatingItems((prev) => new Set(prev).add(item.id))

    const newValue = !item.for_sale
    const { error } = await supabase.from("collection_items").update({ for_sale: newValue }).eq("id", item.id)

    if (!error) {
      onItemUpdate({ ...item, for_sale: newValue })
    }

    setUpdatingItems((prev) => {
      const next = new Set(prev)
      next.delete(item.id)
      return next
    })

    return { success: !error, needsData: false }
  }

  const handleToggleForTrade = async (item: MasterListItem): Promise<{ success: boolean; needsData: boolean }> => {
    if (!item.for_trade && (!item.trade_interests || item.trade_interests.length === 0)) {
      return { success: false, needsData: true }
    }

    if (isDemo) return { success: true, needsData: false }

    setUpdatingItems((prev) => new Set(prev).add(item.id))

    const newValue = !item.for_trade
    const { error } = await supabase.from("collection_items").update({ for_trade: newValue }).eq("id", item.id)

    if (!error) {
      onItemUpdate({ ...item, for_trade: newValue })
    }

    setUpdatingItems((prev) => {
      const next = new Set(prev)
      next.delete(item.id)
      return next
    })

    return { success: !error, needsData: false }
  }

  const handleChangeCollection = async (item: MasterListItem, newCollectionId: string | null) => {
    if (isDemo) return

    setUpdatingItems((prev) => new Set(prev).add(item.id))

    const { error } = await supabase
      .from("collection_items")
      .update({ collection_id: newCollectionId })
      .eq("id", item.id)

    if (!error) {
      const newCollection = newCollectionId ? collections.find((c) => c.id === newCollectionId) : undefined
      onItemUpdate({ ...item, collection_id: newCollectionId, collection: newCollection } as MasterListItem)
    }

    setUpdatingItems((prev) => {
      const next = new Set(prev)
      next.delete(item.id)
      return next
    })
  }

  const handleDelete = async (item: MasterListItem) => {
    if (!confirm("Are you sure you want to remove this item?")) return

    const { error } = await supabase.from("collection_items").delete().eq("id", item.id)

    if (!error) {
      onItemDelete(item.id)
    }
  }

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const totalItems = items.length
  const forSaleCount = items.filter((i) => i.for_sale).length
  const forTradeCount = items.filter((i) => i.for_trade).length
  const uncategorizedCount = items.filter((i) => !i.collection_id).length

  const selectedCollectionName = useMemo(() => {
    if (selectedCollectionId === null) return "All Items"
    if (selectedCollectionId === "uncategorized") return "Uncategorized"
    const collection = collections.find((c) => c.id === selectedCollectionId)
    return collection?.name || "All Items"
  }, [selectedCollectionId, collections])

  const currentSortLabel = useMemo(() => {
    if (sortField === "title" && sortDirection === "asc") return "A → Z"
    if (sortField === "value" && sortDirection === "desc") return "Price: Highest"
    if (sortField === "value" && sortDirection === "asc") return "Price: Lowest"
    if (sortField === "updated" && sortDirection === "desc") return "Newest"
    if (sortField === "updated" && sortDirection === "asc") return "Oldest"
    return "Sort"
  }, [sortField, sortDirection])

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
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

      <div className="flex flex-col sm:flex-row gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border border-border text-foreground hover:border-muted-foreground/50 transition-all duration-200">
              <FolderOpen className="h-4 w-4 text-primary" />
              <span className="truncate max-w-[120px]">{selectedCollectionName}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem
              onClick={() => setSelectedCollectionId(null)}
              className="flex items-center justify-between"
            >
              <span>All Items</span>
              {selectedCollectionId === null && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {collections.map((collection) => (
              <DropdownMenuItem
                key={collection.id}
                onClick={() => setSelectedCollectionId(collection.id)}
                className="flex items-center justify-between"
              >
                <span className="truncate">{collection.name}</span>
                {selectedCollectionId === collection.id && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            ))}
            {collections.length > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={() => setSelectedCollectionId("uncategorized")}
              className="flex items-center justify-between"
            >
              <span className="text-muted-foreground">Uncategorized</span>
              {selectedCollectionId === "uncategorized" && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg hover:bg-muted transition-colors text-sm">
              <ArrowUpDown className="h-4 w-4" />
              <span className="hidden sm:inline">{currentSortLabel}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              onClick={() => {
                setSortField("title")
                setSortDirection("asc")
              }}
              className="flex items-center justify-between"
            >
              <span>A → Z</span>
              {sortField === "title" && sortDirection === "asc" && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setSortField("value")
                setSortDirection("desc")
              }}
              className="flex items-center justify-between"
            >
              <span>Price: Highest</span>
              {sortField === "value" && sortDirection === "desc" && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSortField("value")
                setSortDirection("asc")
              }}
              className="flex items-center justify-between"
            >
              <span>Price: Lowest</span>
              {sortField === "value" && sortDirection === "asc" && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setSortField("updated")
                setSortDirection("desc")
              }}
              className="flex items-center justify-between"
            >
              <span>Newest</span>
              {sortField === "updated" && sortDirection === "desc" && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSortField("updated")
                setSortDirection("asc")
              }}
              className="flex items-center justify-between"
            >
              <span>Oldest</span>
              {sortField === "updated" && sortDirection === "asc" && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {onViewChange && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center h-9 w-9 bg-card rounded-lg hover:bg-muted transition-colors">
                {internalView === "grid-big" && <Grid2X2 className="h-4 w-4" />}
                {internalView === "grid-normal" && <Grid3X3 className="h-4 w-4" />}
                {internalView === "grid-dense" && <Grip className="h-4 w-4" />}
                {internalView === "list" && <List className="h-4 w-4" />}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => {
                  setInternalView("grid-big")
                  onViewChange("grid")
                }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Grid2X2 className="h-4 w-4" />
                  Big
                </div>
                {internalView === "grid-big" && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setInternalView("grid-normal")
                  onViewChange("grid")
                }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Grid3X3 className="h-4 w-4" />
                  Normal
                </div>
                {internalView === "grid-normal" && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setInternalView("grid-dense")
                  onViewChange("grid")
                }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Grip className="h-4 w-4" />
                  Dense
                </div>
                {internalView === "grid-dense" && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setInternalView("list")
                  onViewChange("list")
                }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  List
                </div>
                {internalView === "list" && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="flex items-center justify-between"></div>

      {view === "list" && (
        <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b border-border">
          <button
            onClick={() => handleSort("title")}
            className="col-span-3 flex items-center gap-1 hover:text-foreground text-left"
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
          <div className="col-span-3 text-left">Status</div>
          <button
            onClick={() => handleSort("collection")}
            className="col-span-2 flex items-center gap-1 hover:text-foreground text-left"
          >
            Collection
            {sortField === "collection" && <ArrowUpDown className="h-3 w-3" />}
          </button>
          <div className="col-span-2 text-right">Actions</div>
        </div>
      )}

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
      ) : view === "grid" ? (
        <div className={cn(
          "grid gap-4",
          internalView === "grid-big" && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2",
          internalView === "grid-normal" && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          internalView === "grid-dense" && "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
        )}>
          {sortedItems.map((item) => (
            <MasterListGridCard
              key={item.id}
              item={item}
              collections={collections}
              isUpdating={updatingItems.has(item.id)}
              onToggleForSale={() => handleToggleForSale(item)}
              onToggleForTrade={() => handleToggleForTrade(item)}
              onChangeCollection={(collectionId) => handleChangeCollection(item, collectionId)}
              onDelete={() => handleDelete(item)}
              isDemo={isDemo}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedItems.map((item) => (
            <MasterListRow
              key={item.id}
              item={item}
              collections={collections}
              isUpdating={updatingItems.has(item.id)}
              onToggleForSale={() => handleToggleForSale(item)}
              onToggleForTrade={() => handleToggleForTrade(item)}
              onChangeCollection={(collectionId) => handleChangeCollection(item, collectionId)}
              onDelete={() => handleDelete(item)}
              isDemo={isDemo}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface MasterListRowProps {
  item: MasterListItem
  collections: Collection[]
  isUpdating: boolean
  onToggleForSale: () => Promise<{ success: boolean; needsData: boolean }>
  onToggleForTrade: () => Promise<{ success: boolean; needsData: boolean }>
  onChangeCollection: (collectionId: string | null) => void
  onDelete: () => void
  isDemo?: boolean
}

function MasterListRow({
  item,
  collections,
  isUpdating,
  onToggleForSale,
  onToggleForTrade,
  onChangeCollection,
  onDelete,
  isDemo,
}: MasterListRowProps) {
  const primaryImage = item.images?.[0] || "/generic-item.png"
  const [alert, setAlert] = useState<{ type: "sale" | "trade"; message: string } | null>(null)

  const handleForSaleClick = async () => {
    // If currently for sale, turn it off and clear any alert
    if (item.for_sale) {
      await onToggleForSale()
      setAlert(null)
      return
    }

    // Check for incomplete listing (missing price, description, etc.)
    const missingFields: string[] = []
    if (!item.user_estimated_value) missingFields.push("price")
    if (!item.description) missingFields.push("description")

    if (missingFields.length > 0) {
      setAlert({
        type: "sale",
        message: `This listing is incomplete. Missing: ${missingFields.join(", ")}.`,
      })
      return
    }

    const result = await onToggleForSale()
    if (result.needsData) {
      setAlert({
        type: "sale",
        message: "This listing is incomplete. Please add required details.",
      })
    } else {
      setAlert(null)
    }
  }

  const handleForTradeClick = async () => {
    // If currently for trade, turn it off and clear any alert
    if (item.for_trade) {
      await onToggleForTrade()
      setAlert(null)
      return
    }

    // Check for missing trade interests
    if (!item.trade_interests || item.trade_interests.length === 0) {
      setAlert({
        type: "trade",
        message: "This item doesn't have any trade interests.",
      })
      return
    }

    const result = await onToggleForTrade()
    if (result.needsData) {
      setAlert({
        type: "trade",
        message: "This item doesn't have any trade interests.",
      })
    } else {
      setAlert(null)
    }
  }

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-lg transition-all hover:border-primary/30 relative",
        isUpdating && "opacity-60",
      )}
    >
      <div className="grid grid-cols-12 gap-4 items-center p-4">
        <div className="col-span-12 sm:col-span-3 flex items-center gap-3">
          <div className="relative flex-shrink-0 w-12 h-12 bg-secondary rounded-lg overflow-hidden">
            <img src={primaryImage || "/placeholder.svg"} alt={item.title} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-foreground truncate">{item.title}</h3>
          </div>
        </div>

        <div className="col-span-6 sm:col-span-2 text-left">
          {item.user_estimated_value ? (
            <span className="font-medium">${item.user_estimated_value.toLocaleString()}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>

        <div className="col-span-12 sm:col-span-3 flex items-center gap-2">
          <button
            onClick={handleForSaleClick}
            disabled={isUpdating}
            className={cn(
              "inline-flex items-center justify-center gap-1 rounded-full text-xs font-medium transition-all w-[72px]",
              item.for_sale
                ? "px-2 py-1 bg-emerald-500/20 border border-emerald-500/50 text-emerald-600 dark:text-emerald-400"
                : "py-1 bg-transparent border border-border text-muted-foreground/50 hover:text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/30",
            )}
            title={item.for_sale ? "Listed for sale" : "Click to list for sale"}
          >
            <DollarSign className="h-3 w-3" />
            {item.for_sale && <span>Sale</span>}
          </button>
          <button
            onClick={handleForTradeClick}
            disabled={isUpdating}
            className={cn(
              "inline-flex items-center justify-center gap-1 rounded-full text-xs font-medium transition-all w-[72px]",
              item.for_trade
                ? "px-2 py-1 bg-sky-500/20 border border-sky-500/50 text-sky-600 dark:text-sky-400"
                : "py-1 bg-transparent border border-border text-muted-foreground/50 hover:text-sky-500 hover:bg-sky-500/10 hover:border-sky-500/30",
            )}
            title={item.for_trade ? "Listed for trade" : "Click to list for trade"}
          >
            <Repeat2 className="h-3 w-3" />
            {item.for_trade && <span>Trade</span>}
          </button>
        </div>

        <div className="col-span-12 sm:col-span-2 flex items-center gap-2 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors",
                  item.collection?.name
                    ? "bg-muted/50 border border-border text-muted-foreground hover:border-primary/50"
                    : "bg-transparent border border-dashed border-muted-foreground/30 text-muted-foreground/50 hover:border-primary/50 hover:text-muted-foreground",
                )}
              >
                <FolderOpen
                  className={cn("h-4 w-4", item.collection?.name ? "text-primary" : "text-muted-foreground/40")}
                />
                <span className="truncate max-w-[100px]">{item.collection?.name || "Uncategorized"}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {item.collection && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={`/collection/${item.collection.id}`} className="flex items-center justify-between">
                      <span>View "{item.collection.name}"</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Move to...</div>
              {collections.map((collection) => (
                <DropdownMenuItem
                  key={collection.id}
                  onClick={() => onChangeCollection(collection.id)}
                  className="flex items-center justify-between"
                  disabled={item.collection_id === collection.id}
                >
                  <span className="truncate">{collection.name}</span>
                  {item.collection_id === collection.id && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
              ))}
              {collections.length > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={() => onChangeCollection(null)}
                className="flex items-center justify-between"
                disabled={!item.collection_id}
              >
                <span className="text-muted-foreground">Remove from collection</span>
                {!item.collection_id && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="col-span-6 sm:col-span-2 flex items-center justify-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/listings/${item.id}/edit`}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Item
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/listings/${item.id}/edit?section=trade`}>
                  <Settings className="h-4 w-4 mr-2" />
                  Trade Settings
                </Link>
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

      {alert && (
        <div className="px-4 pb-4">
          <Alert className="border-amber-500/50 bg-amber-500/10 relative">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-sm">
              {alert.message}{" "}
              <Link
                href={`/item/${item.id}/edit`}
                className="text-amber-600 dark:text-amber-400 hover:underline font-medium inline-flex items-center gap-1"
              >
                Edit item
                <ExternalLink className="h-3 w-3" />
              </Link>
            </AlertDescription>
            <button
              onClick={() => setAlert(null)}
              className="absolute top-3 right-3 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
              aria-label="Close alert"
            >
              <X className="h-4 w-4" />
            </button>
          </Alert>
        </div>
      )}
    </div>
  )
}
