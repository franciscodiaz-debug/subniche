"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Check,
  ChevronDown,
  FolderInput,
  FolderOpen,
  Globe,
  Heart,
  Link2,
  Lock,
  MoreHorizontal,
  Pencil,
  Plus,
  Share2,
  Trash2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { Collection, CollectionVisibility } from "@/lib/types"
import { myItems, type MyItem } from "@/lib/mock/my-stuff"
import { MyItemGridCard } from "@/components/my-stuff/my-item-card"

interface CollectionOwnerViewProps {
  collection: Collection
  ownedItems: MyItem[]
  previewImages: string[]
  followingCountLabel: string
  categories: string[]
  subcategories: string[]
}

const visibilityConfig: Record<
  CollectionVisibility,
  { label: string; icon: typeof Lock; className: string }
> = {
  private: {
    label: "Private",
    icon: Lock,
    className: "border-border bg-secondary/50 text-muted-foreground",
  },
  unlisted: {
    label: "Unlisted",
    icon: Link2,
    className: "border-primary/25 bg-primary/10 text-primary",
  },
  public: {
    label: "Public",
    icon: Globe,
    className: "border-green-500/25 bg-green-500/10 text-green-600 dark:text-green-400",
  },
}

export function CollectionOwnerView({
  collection,
  ownedItems,
  previewImages,
  followingCountLabel,
  categories,
  subcategories,
}: CollectionOwnerViewProps) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const visibility = collection.visibility ?? "private"
  const vis = visibilityConfig[visibility]
  const VisibilityIcon = vis.icon

  const totalValue = useMemo(
    () =>
      collection.total_user_value ??
      ownedItems.reduce((sum, item) => sum + (item.price ?? 0), 0),
    [ownedItems, collection.total_user_value],
  )

  const gallery = useMemo(() => {
    const sourced = previewImages.length
      ? previewImages
      : ownedItems.flatMap((item) => item.images)
    return [0, 1, 2, 3].map((i) => sourced[i] ?? null)
  }, [previewImages, ownedItems])

  // Items not already in this collection — available to add
  const availableItems = useMemo(
    () => myItems.filter((item) => item.collection_id !== collection.id),
    [collection.id],
  )

  const handleShare = async () => {
    try {
      if (typeof window !== "undefined" && navigator?.clipboard) {
        await navigator.clipboard.writeText(
          `${window.location.origin}/collection/${collection.id}`,
        )
      }
    } catch {
      // ignore
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  const toggleItem = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const handleAddSelected = () => {
    console.log("[todo] add items to collection", collection.id, [...selectedIds])
    setSelectedIds(new Set())
    setPickerOpen(false)
  }

  const AddItemDropdown = ({ align = "start" }: { align?: "start" | "center" | "end" }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" className="h-9 gap-1.5">
          <Plus className="h-4 w-4" />
          Add Item
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-52">
        <DropdownMenuItem asChild>
          <Link
            href={`/create-listing?collectionId=${collection.id}&collectionName=${encodeURIComponent(collection.name)}`}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create new listing
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setPickerOpen(true)}>
          <FolderInput className="mr-2 h-4 w-4" />
          Add existing item
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <div className="px-4 pb-8 pt-6 md:px-8">
      {/* Back nav */}
      <div className="mb-6">
        <Link
          href="/my-stuff?tab=collections"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          My Collections
        </Link>
      </div>

      {/* Hero */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6 lg:gap-8">
        {/* 2×2 gallery */}
        <div className="w-full shrink-0 sm:w-56 md:w-64">
          <div className="grid aspect-square grid-cols-2 grid-rows-2 gap-[2px] overflow-hidden rounded-xl border border-border bg-border">
            {gallery.map((src, i) => (
              <GalleryTile
                key={i}
                src={src}
                fallback={collection.is_wishlist ? "heart" : "folder"}
              />
            ))}
          </div>
        </div>

        {/* Meta */}
        <div className="min-w-0 flex-1">
          {/* Pills */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                vis.className,
              )}
            >
              <VisibilityIcon className="h-3 w-3" />
              {vis.label}
            </span>
            {collection.is_wishlist && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-pink-400/30 bg-pink-400/10 px-2.5 py-1 text-xs font-medium text-pink-500">
                <Heart className="h-3 w-3 fill-current" />
                Wishlist
              </span>
            )}
            {categories.slice(0, 2).map((tag) => (
              <TagPill key={tag}>{tag}</TagPill>
            ))}
            {subcategories.slice(0, 3).map((tag) => (
              <TagPill key={tag}>{tag}</TagPill>
            ))}
          </div>

          {/* Title row */}
          <div className="mb-2 flex items-center gap-2">
            <h1 className="min-w-0 text-balance text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
              {collection.name}
            </h1>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              title={copied ? "Copied" : "Copy link"}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-primary" />
              ) : (
                <Share2 className="h-3.5 w-3.5" />
              )}
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  Manage collection
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={`/collection/${collection.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() =>
                    console.log("[todo] delete collection", collection.id)
                  }
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete collection
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Stats */}
          <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span>
              {ownedItems.length}{" "}
              {ownedItems.length === 1 ? "item" : "items"}
            </span>
            {followingCountLabel && (
              <>
                <span aria-hidden>·</span>
                <span>{followingCountLabel}</span>
              </>
            )}
            {totalValue > 0 && (
              <>
                <span aria-hidden>·</span>
                <span>
                  $
                  {totalValue >= 1000
                    ? `${Math.round(totalValue / 1000)}k`
                    : totalValue.toLocaleString('en-US')}{" "}
                  value
                </span>
              </>
            )}
          </div>

          {collection.description && (
            <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {collection.description}
            </p>
          )}

          <AddItemDropdown align="start" />
        </div>
      </div>

      {/* Items grid */}
      {ownedItems.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card py-16 text-center">
          <div className="mx-auto mb-4 inline-flex rounded-full bg-secondary p-4 text-primary">
            <FolderOpen className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-medium text-foreground">No items yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Start adding items to your collection.
          </p>
          <div className="mt-4 flex justify-center">
            <AddItemDropdown align="center" />
          </div>
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mb-4 flex w-full items-center gap-3 border-b border-border py-3 text-left transition-colors hover:border-primary/40"
            aria-expanded={expanded}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {ownedItems.length}{" "}
              {ownedItems.length === 1 ? "item" : "items"}
            </span>
            <span className="flex-1" />
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                expanded && "rotate-180",
              )}
            />
          </button>

          {expanded && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {ownedItems.map((item) => (
                <MyItemGridCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add existing item sheet */}
      <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
          <SheetHeader className="border-b border-border pb-4">
            <SheetTitle>Add existing item</SheetTitle>
          </SheetHeader>

          {availableItems.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                All your items are already in this collection.
              </p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-4">
                <div className="space-y-2">
                  {availableItems.map((item) => {
                    const selected = selectedIds.has(item.id)
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                          selected
                            ? "border-primary bg-primary/5"
                            : "border-border bg-card hover:border-primary/40",
                        )}
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-secondary">
                          {item.images[0] && (
                            <Image
                              src={item.images[0]}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {item.title}
                          </p>
                          {item.subtitle && (
                            <p className="truncate text-xs text-muted-foreground">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                        <div
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                            selected
                              ? "border-primary bg-primary"
                              : "border-border",
                          )}
                        >
                          {selected && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <Button
                  className="w-full"
                  disabled={selectedIds.size === 0}
                  onClick={handleAddSelected}
                >
                  Add {selectedIds.size > 0 ? `${selectedIds.size} ` : ""}
                  {selectedIds.size === 1 ? "item" : "items"}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function GalleryTile({
  src,
  fallback,
}: {
  src: string | null
  fallback: "heart" | "folder"
}) {
  if (src) {
    return (
      <div className="relative overflow-hidden bg-secondary">
        <Image src={src} alt="" fill sizes="140px" className="object-cover" />
      </div>
    )
  }
  return (
    <div className="flex items-center justify-center bg-secondary/60">
      {fallback === "heart" ? (
        <Heart className="h-6 w-6 text-pink-400/50" />
      ) : (
        <FolderOpen className="h-6 w-6 text-primary/50" />
      )}
    </div>
  )
}

function TagPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border bg-secondary/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      {children}
    </span>
  )
}
