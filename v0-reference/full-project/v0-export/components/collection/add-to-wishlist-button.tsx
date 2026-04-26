"use client"

import { useState, useEffect } from "react"
import { Heart, Plus, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import type { Collection, Listing } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AddToWishlistButtonProps {
  listing: Listing
  variant?: "icon" | "button"
  className?: string
}

export function AddToWishlistButton({ listing, variant = "icon", className }: AddToWishlistButtonProps) {
  const [wishlists, setWishlists] = useState<Collection[]>([])
  const [addedToWishlists, setAddedToWishlists] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [isAdding, setIsAdding] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (!isOpen) return

    async function fetchWishlists() {
      setIsLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }

      const { data: wishlistData } = await supabase
        .from("collections")
        .select("id, name")
        .eq("user_id", user.id)
        .eq("is_wishlist", true)
        .order("name")

      if (wishlistData) {
        setWishlists(wishlistData as Collection[])
      }

      const { data: existingItems } = await supabase
        .from("collection_items")
        .select("collection_id")
        .eq("listing_id", listing.id)

      if (existingItems) {
        setAddedToWishlists(new Set(existingItems.map((item) => item.collection_id)))
      }

      setIsLoading(false)
    }

    fetchWishlists()
  }, [isOpen, listing.id, supabase])

  const handleAddToWishlist = async (wishlistId: string) => {
    setIsAdding(wishlistId)

    try {
      if (addedToWishlists.has(wishlistId)) {
        await supabase.from("collection_items").delete().eq("collection_id", wishlistId).eq("listing_id", listing.id)

        setAddedToWishlists((prev) => {
          const next = new Set(prev)
          next.delete(wishlistId)
          return next
        })
      } else {
        await supabase.from("collection_items").insert({
          collection_id: wishlistId,
          listing_id: listing.id,
          title: listing.title,
          subtitle: listing.subtitle,
          description: listing.description,
          images: listing.images,
          category: listing.category,
          subcategory: listing.subcategory,
          condition: listing.condition,
          user_estimated_value: listing.price,
          is_owned: false,
          priority: 1,
        })

        setAddedToWishlists((prev) => new Set([...prev, wishlistId]))
      }
    } catch (error) {
      console.error("[v0] Error updating wishlist:", error)
    } finally {
      setIsAdding(null)
    }
  }

  const handleCreateWishlist = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const name = prompt("Enter wishlist name:")
    if (!name?.trim()) return

    const { data, error } = await supabase
      .from("collections")
      .insert({
        user_id: user.id,
        name: name.trim(),
        is_wishlist: true,
        privacy: "private",
      })
      .select()
      .single()

    if (!error && data) {
      setWishlists((prev) => [...prev, data as Collection])
      handleAddToWishlist(data.id)
    }
  }

  const isInAnyWishlist = addedToWishlists.size > 0

  if (variant === "icon") {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className={`p-2 rounded-full transition-colors ${
              isInAnyWishlist
                ? "bg-chart-5/20 text-chart-5"
                : "bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground"
            } ${className}`}
          >
            <Heart className={`h-5 w-5 ${isInAnyWishlist ? "fill-current" : ""}`} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 text-sm font-medium text-foreground">Add to Wishlist</div>
          <DropdownMenuSeparator />

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : wishlists.length === 0 ? (
            <div className="px-2 py-3 text-sm text-muted-foreground text-center">No wishlists yet</div>
          ) : (
            wishlists.map((wishlist) => (
              <DropdownMenuItem
                key={wishlist.id}
                onClick={() => handleAddToWishlist(wishlist.id)}
                disabled={isAdding === wishlist.id}
                className="flex items-center justify-between"
              >
                <span>{wishlist.name}</span>
                {isAdding === wishlist.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : addedToWishlists.has(wishlist.id) ? (
                  <Check className="h-4 w-4 text-chart-2" />
                ) : null}
              </DropdownMenuItem>
            ))
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCreateWishlist}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Wishlist
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={className}>
          <Heart className={`h-4 w-4 mr-2 ${isInAnyWishlist ? "fill-chart-5 text-chart-5" : ""}`} />
          {isInAnyWishlist ? "In Wishlist" : "Add to Wishlist"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-medium text-foreground">Add to Wishlist</div>
        <DropdownMenuSeparator />

        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : wishlists.length === 0 ? (
          <div className="px-2 py-3 text-sm text-muted-foreground text-center">No wishlists yet</div>
        ) : (
          wishlists.map((wishlist) => (
            <DropdownMenuItem
              key={wishlist.id}
              onClick={() => handleAddToWishlist(wishlist.id)}
              disabled={isAdding === wishlist.id}
              className="flex items-center justify-between"
            >
              <span>{wishlist.name}</span>
              {isAdding === wishlist.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : addedToWishlists.has(wishlist.id) ? (
                <Check className="h-4 w-4 text-chart-2" />
              ) : null}
            </DropdownMenuItem>
          ))
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCreateWishlist}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Wishlist
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
