"use client"

import { useState } from "react"
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  DollarSign,
  Folder,
  Heart,
  MoreHorizontal,
  Pencil,
  Repeat2,
  Share2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { type MyItem } from "@/lib/mock/my-stuff"
import { useCollections } from "@/lib/collections-context"
import { currentUser } from "@/lib/current-user"

function DollarSignOffIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      <line x1="4" y1="20" x2="20" y2="4" />
    </svg>
  )
}

/**
 * Inline chip that shows the collection an item belongs to and lets the
 * owner move it to a different one. Sourced from the local collections
 * store so the list of options stays in sync with create/edit/delete.
 */
export function CollectionChip({
  item,
  muted = false,
}: {
  item: MyItem
  muted?: boolean
}) {
  const { collections, moveItemsToCollection } = useCollections()
  const myCollections = collections.filter(
    (c) => !c.owner_id || c.owner_id === currentUser.username,
  )
  const collection = myCollections.find((c) => c.id === item.collection_id)
  // Per product rule, every owned item must belong to a collection. If we
  // hit this fallback, something upstream is wrong — but keep the UI
  // legible by prompting the user to pick a destination.
  const label = collection?.name ?? "Choose collection"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center gap-1 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          muted
            ? "border-border/70 bg-transparent px-2 py-0.5 text-[11px] font-normal text-muted-foreground hover:border-border hover:text-foreground"
            : "border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-xs hover:bg-accent hover:text-accent-foreground",
        )}
      >
        <Folder
          className={cn(
            "h-3 w-3",
            muted ? "text-muted-foreground/80" : "text-muted-foreground",
          )}
        />
        <span className="max-w-[10rem] truncate">{label}</span>
        <ChevronDown className="h-3 w-3 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Move to collection
        </DropdownMenuLabel>
        {myCollections.map((c) => (
          <DropdownMenuCheckboxItem
            key={c.id}
            checked={c.id === item.collection_id}
            onCheckedChange={() => moveItemsToCollection(c.id, [item.id])}
          >
            {c.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Owner-only actions menu — the three-dots overlay shown on top-right of
 * each owned card. Per product decision, deleting an item from inventory
 * isn't allowed; the destructive action is moving to another collection.
 */
export function ItemActionsMenu({
  item,
  variant = "overlay",
}: {
  item: MyItem
  variant?: "default" | "overlay"
}) {
  const log = (action: string) =>
    console.log("[stub] my-stuff action:", action, item.id)
  const { collections, moveItemsToCollection } = useCollections()
  const myCollections = collections.filter(
    (c) => !c.owner_id || c.owner_id === currentUser.username,
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          variant === "overlay"
            ? "h-7 w-7 rounded-md border border-border/60 bg-background/70 text-muted-foreground backdrop-blur-sm hover:bg-background/90 hover:text-foreground"
            : "h-9 w-full rounded-md border border-border/60 bg-secondary/40 text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
        aria-label={variant === "overlay" ? "Item actions" : "Edit item"}
        onClick={(e) => e.stopPropagation()}
      >
        {variant === "overlay" ? (
          <MoreHorizontal className="h-3.5 w-3.5" strokeWidth={1.75} />
        ) : (
          <Pencil className="h-4 w-4" strokeWidth={2} />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Manage listing
        </DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => log("edit")}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit listing
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => log("stats")}>
          <BarChart3 className="mr-2 h-4 w-4" />
          View stats
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {!item.sold && (
          <DropdownMenuItem onSelect={() => log("mark_sold")}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark as sold
          </DropdownMenuItem>
        )}
        {item.for_sale ? (
          <DropdownMenuItem onSelect={() => log("unlist_sale")}>
            <DollarSignOffIcon className="mr-2 h-4 w-4" />
            Unlist
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onSelect={() => log("list_sale")}>
            <DollarSign className="mr-2 h-4 w-4" />
            List for sale
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={() => log("toggle_trade")}>
          <Repeat2 className="mr-2 h-4 w-4" />
          {item.for_trade ? "Remove from trade" : "Open to trades"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Move to collection
        </DropdownMenuLabel>
        {myCollections.map((c) => (
          <DropdownMenuCheckboxItem
            key={c.id}
            checked={c.id === item.collection_id}
            onCheckedChange={() => moveItemsToCollection(c.id, [item.id])}
          >
            {c.name}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => log("share")}>
          <Share2 className="mr-2 h-4 w-4" />
          Share link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Visitor-mode replacement for ItemActionsMenu — toggles local watchlist
 * state. Back team will swap this for the real API; UI surface stays.
 */
export function WatchlistHeart({
  itemId,
  variant = "overlay",
}: {
  itemId: string
  variant?: "default" | "overlay"
}) {
  const [watched, setWatched] = useState(false)
  void itemId
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        setWatched((w) => !w)
      }}
      className={cn(
        "inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        variant === "overlay"
          ? "h-7 w-7 rounded-md border border-border/60 bg-background/70 backdrop-blur-sm hover:bg-background/90"
          : "h-9 w-full rounded-md border border-border/60 bg-secondary/40 hover:bg-muted",
        watched
          ? "text-rose-500"
          : "text-muted-foreground hover:text-foreground",
      )}
      aria-label={watched ? "Remove from watchlist" : "Add to watchlist"}
      aria-pressed={watched}
    >
      <Heart
        className="h-3.5 w-3.5"
        strokeWidth={1.75}
        fill={watched ? "currentColor" : "none"}
      />
    </button>
  )
}
