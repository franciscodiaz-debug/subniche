"use client"

import Image from "next/image"
import Link from "next/link"
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  DollarSign,
  Folder,
  MoreHorizontal,
  Pencil,
  Repeat2,
  Share2,
  Tag,
  Trash2,
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
import { myItemCollections, type MyItem } from "@/lib/mock/my-stuff"

export type { MyItem } from "@/lib/mock/my-stuff"

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

export function SalePill({ active, iconOnly = false }: { active: boolean; iconOnly?: boolean }) {
  if (!active) return null
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-status-success/30 bg-status-success/10 font-medium text-status-success",
        iconOnly ? "h-5 w-5 justify-center p-0" : "gap-1 px-2 py-0.5 text-[11px]",
      )}
      title="Listed for sale"
      aria-label="Listed for sale"
    >
      <DollarSign className="h-3 w-3" strokeWidth={2.25} />
      {iconOnly ? <span className="sr-only">Sale</span> : "Sale"}
    </span>
  )
}

export function TradePill({ active, iconOnly = false }: { active: boolean; iconOnly?: boolean }) {
  if (!active) return null
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-status-info/30 bg-status-info/10 font-medium text-status-info",
        iconOnly ? "h-5 w-5 justify-center p-0" : "gap-1 px-2 py-0.5 text-[11px]",
      )}
      title="Open to trades"
      aria-label="Open to trades"
    >
      <Repeat2 className="h-3 w-3" strokeWidth={2.25} />
      {iconOnly ? <span className="sr-only">Trade</span> : "Trade"}
    </span>
  )
}

function CollectionChip({ item, muted = false }: { item: MyItem; muted?: boolean }) {
  const collection = myItemCollections.find((c) => c.id === item.collection_id)
  const label = collection?.name ?? "Uncategorized"
  const uncategorized = !collection

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center gap-1 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          muted
            ? "border-border/70 bg-transparent px-2 py-0.5 text-[11px] font-normal text-muted-foreground hover:border-border hover:text-foreground"
            : cn(
                "px-2.5 py-1 text-xs font-medium",
                uncategorized
                  ? "border-border bg-secondary/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  : "border-primary/25 bg-primary/5 text-primary hover:border-primary/50",
              ),
        )}
      >
        <Folder
          className={cn(
            "h-3 w-3",
            muted ? "text-muted-foreground/80" : uncategorized ? "text-muted-foreground" : "text-primary",
          )}
        />
        <span className="max-w-[10rem] truncate">{label}</span>
        <ChevronDown className="h-3 w-3 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Move to collection
        </DropdownMenuLabel>
        {myItemCollections.map((c) => (
          <DropdownMenuCheckboxItem
            key={c.id}
            checked={c.id === item.collection_id}
            onCheckedChange={() => console.log("[stub] move", item.id, "->", c.id)}
          >
            {c.name}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={!item.collection_id}
          onCheckedChange={() => console.log("[stub] move", item.id, "-> uncategorized")}
        >
          Uncategorized
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ActionsMenu({ item, variant = "default" }: { item: MyItem; variant?: "default" | "overlay" }) {
  const log = (action: string) => console.log("[stub] my-stuff action:", action, item.id)
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
        <DropdownMenuItem onSelect={() => log("share")}>
          <Share2 className="mr-2 h-4 w-4" />
          Share link
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => log("delete")}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function MyItemListHeader() {
  return (
    <div className="hidden grid-cols-12 items-center gap-4 px-4 pb-3 text-xs uppercase tracking-wider text-muted-foreground @2xl/list:grid">
      <span className="col-span-4">Item</span>
      <span className="col-span-2">Value</span>
      <span className="col-span-2">Status</span>
      <span className="col-span-3">Collection</span>
      <span className="col-span-1 sr-only text-right">Actions</span>
    </div>
  )
}

export function MyItemRow({ item }: { item: MyItem }) {
  const href = `/listings/${item.id}`
  const imageSrc = item.images[0] || "/placeholder.svg"
  const priceLabel = item.price != null ? `$${item.price.toLocaleString('en-US')}` : "—"
  const hasStatus = item.for_sale || item.for_trade

  return (
    <div className={cn("group rounded-lg border border-border bg-card transition-colors hover:border-primary/40", item.sold && "opacity-70")}>
      {/* Mobile layout */}
      <div className="flex items-center gap-3 px-3 py-3.5 @2xl/list:hidden">
        <Link href={href} className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-secondary" aria-label={item.title}>
          <Image src={imageSrc} alt={item.title} fill className="object-cover" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <Link href={href} className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
                {item.title}
              </h3>
            </Link>
            <span className={cn("shrink-0 text-sm font-semibold leading-tight tabular-nums", item.price != null ? "text-foreground" : "text-muted-foreground")}>
              {priceLabel}
            </span>
          </div>
          {item.subtitle && (
            <p className="mt-0.5 truncate text-xs leading-snug text-muted-foreground">{item.subtitle}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1">
            {hasStatus ? (
              <>
                <SalePill active={item.for_sale} />
                <TradePill active={item.for_trade} />
              </>
            ) : (
              <span className="inline-flex items-center rounded-full border border-border/70 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                Private
              </span>
            )}
          </div>
          <div className="mt-1 flex">
            <CollectionChip item={item} muted />
          </div>
        </div>
        <div className="self-center opacity-100 transition-opacity focus-within:opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
          <ActionsMenu item={item} variant="overlay" />
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden grid-cols-12 items-center gap-4 px-4 py-4 @2xl/list:grid">
        <Link href={href} className="col-span-4 flex min-w-0 items-center gap-3">
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
            <Image src={imageSrc} alt={item.title} fill className="object-cover" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">{item.title}</h3>
            {item.subtitle && <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>}
          </div>
        </Link>
        <div className="col-span-2 text-sm font-semibold text-foreground">
          {item.price != null ? `$${item.price.toLocaleString('en-US')}` : <span className="text-muted-foreground">—</span>}
        </div>
        <div className="col-span-2 flex flex-wrap items-center gap-1.5">
          {hasStatus ? (
            <>
              <SalePill active={item.for_sale} />
              <TradePill active={item.for_trade} />
            </>
          ) : (
            <span className="text-xs text-muted-foreground/70">Private</span>
          )}
        </div>
        <div className="col-span-3 flex items-center">
          <CollectionChip item={item} />
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <div className="w-full max-w-[2.75rem] opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
            <ActionsMenu item={item} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function MyItemGridCard({ item }: { item: MyItem }) {
  const href = `/listings/${item.id}`
  const imageSrc = item.images[0] || "/placeholder.svg"
  const hasStatus = item.for_sale || item.for_trade

  return (
    <div className={cn("group rounded-lg border border-border bg-card transition-all hover:border-primary/50", item.sold && "opacity-75")}>
      <div className="relative aspect-[4/3] rounded-t-lg">
        <Link href={href} className="absolute inset-0 block overflow-hidden rounded-t-lg">
          <Image src={imageSrc} alt={item.title} fill className="object-cover transition-transform group-hover:scale-105" />
        </Link>
        <div className="absolute right-2 top-2 z-20 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
          <ActionsMenu item={item} variant="overlay" />
        </div>
      </div>

      <div className="space-y-1.5 p-3">
        <Link href={href} className="block">
          <h3 className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
            {item.title}
          </h3>
          {item.subtitle ? (
            <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
          ) : null}
        </Link>

        <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <CollectionChip item={item} />
        </div>

        <div className="flex items-center gap-2">
          {hasStatus ? (
            <span className="inline-flex items-center gap-1">
              {item.for_sale ? (
                <span title="For Sale" aria-label="For Sale" className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-status-success/15 text-status-success">
                  <Tag className="h-2.5 w-2.5" />
                </span>
              ) : null}
              {item.for_trade ? (
                <span title="For Trade" aria-label="For Trade" className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-status-info/15 text-status-info">
                  <Repeat2 className="h-2.5 w-2.5" />
                </span>
              ) : null}
            </span>
          ) : null}
          {item.price != null ? (
            <p className="text-sm font-semibold text-primary">${item.price.toLocaleString('en-US')}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
