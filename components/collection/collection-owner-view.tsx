"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Collection, CollectionVisibility } from "@/lib/types"
import { type MyItem } from "@/lib/mock/my-stuff"
import { isUserWishlist, useCollections } from "@/lib/collections-context"
import { currentUser } from "@/lib/current-user"
import { ItemCard } from "@/components/item-card"
import { ItemActionsMenu } from "@/components/my-stuff/owner-item-controls"

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
  const router = useRouter()
  const {
    items: storeItems,
    moveItemsToCollection,
    deleteCollection,
  } = useCollections()
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const visibility = collection.visibility ?? "private"
  const vis = visibilityConfig[visibility]
  const VisibilityIcon = vis.icon
  const isWishlist = isUserWishlist(collection, currentUser.username)

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

  // Items not already in this collection — available to add. Reads from
  // the store so newly-moved items disappear from this list immediately
  // and new items pulled in via create-listing show up without a refresh.
  const availableItems = useMemo(
    () => storeItems.filter((item) => item.collection_id !== collection.id),
    [storeItems, collection.id],
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
    moveItemsToCollection(collection.id, [...selectedIds])
    setSelectedIds(new Set())
    setPickerOpen(false)
  }

  const handleConfirmDelete = () => {
    deleteCollection(collection.id)
    router.push("/my-stuff?tab=collections")
  }

  const AddItemDropdown = ({
    align = "start",
    discreet = false,
  }: {
    align?: "start" | "center" | "end"
    /** Quieter visual treatment for the trailing affordance — used at the
     *  end of an already-populated list where a full CTA would feel pushy. */
    discreet?: boolean
  }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {discreet ? (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            Add items to this collection
          </Button>
        ) : (
          <Button size="sm" variant="quiet_outline" className="h-9 gap-1.5">
            <Plus className="h-4 w-4" />
            Add Item
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        )}
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

      {/* Header — minimal: status chip on top, then title + actions, then
          inline stats and description. No gallery: previews belong on the
          collection cards in feeds, not inside the collection itself. */}
      <div className="mb-8">
        {/* Visibility chip — the only chrome above the title. */}
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
        </div>

        {/* Title + action buttons. Share lives inside the three-dots menu
            now so the row stays compact and consistent with the visitor
            view (which puts Follow in Share's old slot). */}
        <div className="mb-2 flex items-center gap-2">
          <h1 className="min-w-0 text-balance text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
            {collection.name}
          </h1>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                Manage collection
              </DropdownMenuLabel>
              {!isWishlist && (
                <DropdownMenuItem asChild>
                  <Link href={`/collection/${collection.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={handleShare}>
                {copied ? (
                  <Check className="mr-2 h-4 w-4 text-primary" />
                ) : (
                  <Share2 className="mr-2 h-4 w-4" />
                )}
                {copied ? "Link copied" : "Share"}
              </DropdownMenuItem>
              {!isWishlist && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault()
                      setDeleteOpen(true)
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete collection
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Inline stats — one line, dot-separated. */}
        <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span>
            {ownedItems.length}{" "}
            {ownedItems.length === 1 ? "item" : "items"}
          </span>
          {totalValue > 0 && (
            <>
              <span aria-hidden>·</span>
              <span>
                $
                {totalValue >= 1000
                  ? `${Math.round(totalValue / 1000)}K`
                  : totalValue.toLocaleString("en-US")}{" "}
                total
              </span>
            </>
          )}
        </div>

        {collection.description && (
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {collection.description}
          </p>
        )}
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
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {ownedItems.map((item) => (
              <ItemCard
                key={item.id}
                id={item.id}
                title={item.title}
                subtitle={item.subtitle ?? undefined}
                image={item.images[0] || "/placeholder.svg"}
                href={`/listings/${item.id}`}
                price={item.price ?? null}
                forSale={item.for_sale}
                forTrade={item.for_trade}
                dimmed={item.sold}
                alwaysShowPrice
                actions={<ItemActionsMenu item={item} variant="overlay" />}
              />
            ))}
          </div>

          {/* Discreet "+ Add items" affordance at the end of the list —
              the only way to add items from inside the collection page now
              that the prominent Add Item button is gone from the header. */}
          <div className="mt-6 flex justify-center">
            <AddItemDropdown align="center" discreet />
          </div>
        </>
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
              <div className="flex-1 overflow-y-auto py-4 pb-[72px] lg:pb-4">
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

      {/* Delete confirmation. Items in the collection don't disappear when
          the collection is deleted — they become unassigned (see store). */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{collection.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the collection. Items inside it stay in your
              inventory but become unassigned — you can move them to another
              collection later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete collection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
