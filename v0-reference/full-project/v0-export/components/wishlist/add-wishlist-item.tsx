"use client"

import type React from "react"

import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { Link2, Loader2, Sparkles, X, ChevronDown, FolderOpen, Plus, ImagePlus, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface AddWishlistItemProps {
  onClose?: () => void
  onSuccess?: () => void
}

const PRIORITY_OPTIONS = [
  { value: 0, label: "Low", color: "text-muted-foreground" },
  { value: 1, label: "Medium", color: "text-amber-500" },
  { value: 2, label: "High", color: "text-red-500" },
]

export function AddWishlistItem({ onClose, onSuccess }: AddWishlistItemProps) {
  const [mode, setMode] = useState<"url" | "manual">("url")
  const [url, setUrl] = useState("")
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractError, setExtractError] = useState<string | null>(null)

  // Manual entry fields
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [description, setDescription] = useState("")
  const [targetPrice, setTargetPrice] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [priority, setPriority] = useState(1)
  const [notes, setNotes] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null)
  const [showCollectionDropdown, setShowCollectionDropdown] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  // Mock collections - would be fetched from DB
  const wishlists = [
    { id: "wishlist-1", name: "My Wishlist", itemCount: 12 },
    { id: "wishlist-2", name: "Dream Guitars", itemCount: 5 },
    { id: "wishlist-3", name: "Gear to Watch", itemCount: 8 },
  ]

  const handleExtractFromUrl = async () => {
    if (!url.trim()) return

    setIsExtracting(true)
    setExtractError(null)

    try {
      const response = await fetch("/api/extract-listing-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) throw new Error("Failed to extract data")

      const data = await response.json()

      // Populate fields with extracted data
      if (data.title) setTitle(data.title)
      if (data.subtitle) setSubtitle(data.subtitle)
      if (data.description) setDescription(data.description)
      if (data.price) setTargetPrice(data.price.toString())
      if (data.images) setImages(data.images.slice(0, 4))

      // Switch to manual mode to let user review/edit
      setMode("manual")
    } catch (error) {
      console.error("[v0] URL extraction error:", error)
      setExtractError("Could not extract data from this URL. Try manual entry instead.")
    } finally {
      setIsExtracting(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
      setImages((prev) => [...prev, ...newImages].slice(0, 4))
    }
  }

  const handleSubmit = async () => {
    if (!title.trim()) return

    setIsSubmitting(true)

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error("Not authenticated")

      // Get or create default wishlist if none selected
      let collectionId = selectedCollectionId
      if (!collectionId) {
        const { data: defaultWishlist } = await supabase
          .from("collections")
          .select("id")
          .eq("user_id", userData.user.id)
          .eq("is_wishlist", true)
          .single()

        if (defaultWishlist) {
          collectionId = defaultWishlist.id
        } else {
          // Create default wishlist
          const { data: newWishlist } = await supabase
            .from("collections")
            .insert({
              user_id: userData.user.id,
              name: "My Wishlist",
              is_wishlist: true,
              is_wishlist_type: true,
              privacy: "private",
            })
            .select()
            .single()

          collectionId = newWishlist?.id
        }
      }

      // Create wishlist item
      await supabase.from("collection_items").insert({
        collection_id: collectionId,
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        description: description.trim() || null,
        images,
        is_owned: false,
        priority,
        source_url: url || null,
        target_price: targetPrice ? Number.parseFloat(targetPrice) : null,
        wishlist_notes: notes.trim() || null,
        is_public_wishlist: isPublic,
      })

      onSuccess?.()
      onClose?.()
    } catch (error) {
      console.error("[v0] Error creating wishlist item:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedWishlist = wishlists.find((w) => w.id === selectedCollectionId)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Add to Wishlist</h1>
            <p className="text-sm text-muted-foreground mt-1">Track items you want to acquire</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-card rounded-lg transition-colors">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 bg-card rounded-lg p-1 mb-6">
          <button
            onClick={() => setMode("url")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
              mode === "url" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Link2 className="h-4 w-4" />
            Paste URL
          </button>
          <button
            onClick={() => setMode("manual")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
              mode === "manual" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Plus className="h-4 w-4" />
            Manual Entry
          </button>
        </div>

        {/* URL Mode */}
        {mode === "url" && (
          <div className="space-y-4">
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste a link to the item (eBay, Reverb, Mercari, etc.)"
                className={cn(
                  "w-full bg-card rounded-lg border border-border pl-11 pr-4 py-3 text-foreground",
                  "placeholder:text-muted-foreground/50",
                  "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all",
                )}
              />
            </div>

            {extractError && <p className="text-sm text-destructive">{extractError}</p>}

            <Button onClick={handleExtractFromUrl} disabled={!url.trim() || isExtracting} className="w-full">
              {isExtracting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Extract Item Details
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              We'll try to extract the title, price, and images from the URL
            </p>
          </div>
        )}

        {/* Manual Mode */}
        {mode === "manual" && (
          <div className="space-y-4">
            {/* Images */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Images</label>
              <div className="flex gap-2 flex-wrap">
                {images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden group">
                    <img src={img || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
                {images.length < 4 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary flex items-center justify-center transition-colors"
                  >
                    <ImagePlus className="h-5 w-5 text-muted-foreground" />
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Title */}
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Fender American Professional II Stratocaster"
                className={cn(
                  "w-full bg-card rounded-lg border border-border px-3 py-2.5 text-foreground",
                  "placeholder:text-muted-foreground/50",
                  "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all",
                )}
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Subtitle</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g., Olympic White, Maple Neck"
                className={cn(
                  "w-full bg-card rounded-lg border border-border px-3 py-2.5 text-foreground",
                  "placeholder:text-muted-foreground/50",
                  "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all",
                )}
              />
            </div>

            {/* Target Price */}
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Target Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <input
                  type="text"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                  placeholder="0.00"
                  className={cn(
                    "w-full bg-card rounded-lg border border-border pl-7 pr-3 py-2.5 text-foreground",
                    "placeholder:text-muted-foreground/50",
                    "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all",
                  )}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Price you're willing to pay</p>
            </div>

            {/* Priority */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Priority</label>
              <div className="flex gap-2">
                {PRIORITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPriority(option.value)}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                      priority === option.value
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-primary/30",
                    )}
                  >
                    <span className={priority === option.value ? option.color : ""}>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Collection Selector */}
            <div className="relative">
              <label className="text-sm text-muted-foreground mb-1.5 block">Add to Wishlist</label>
              <button
                onClick={() => setShowCollectionDropdown(!showCollectionDropdown)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-colors",
                  "bg-card text-foreground",
                  showCollectionDropdown ? "border-primary" : "border-border hover:border-primary/50",
                )}
              >
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-primary" />
                  <span>{selectedWishlist?.name || "My Wishlist"}</span>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    showCollectionDropdown && "rotate-180",
                  )}
                />
              </button>

              {showCollectionDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 overflow-hidden">
                  {wishlists.map((wishlist) => (
                    <button
                      key={wishlist.id}
                      onClick={() => {
                        setSelectedCollectionId(wishlist.id)
                        setShowCollectionDropdown(false)
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 hover:bg-muted transition-colors text-left",
                        selectedCollectionId === wishlist.id && "bg-primary/10",
                      )}
                    >
                      <span className="text-sm">{wishlist.name}</span>
                      <span className="text-xs text-muted-foreground">{wishlist.itemCount} items</span>
                    </button>
                  ))}
                  <button className="w-full flex items-center gap-2 px-3 py-2 border-t border-border text-primary hover:bg-primary/10 transition-colors">
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">Create New Wishlist</span>
                  </button>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Why do you want this? Any specific details to look for?"
                className={cn(
                  "w-full bg-card rounded-lg border border-border px-3 py-2.5 text-foreground",
                  "placeholder:text-muted-foreground/50 resize-none",
                  "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all",
                )}
                rows={2}
              />
            </div>

            {/* Public Toggle */}
            <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
              <div className="flex items-center gap-2">
                {isPublic ? (
                  <Eye className="h-4 w-4 text-primary" />
                ) : (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">Show on Profile</p>
                  <p className="text-xs text-muted-foreground">Let others know you're looking for this</p>
                </div>
              </div>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={cn("w-11 h-6 rounded-full transition-colors relative", isPublic ? "bg-primary" : "bg-muted")}
              >
                <div
                  className={cn(
                    "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
                    isPublic ? "translate-x-5" : "translate-x-0.5",
                  )}
                />
              </button>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              {onClose && (
                <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                  Cancel
                </Button>
              )}
              <Button onClick={handleSubmit} disabled={!title.trim() || isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add to Wishlist"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
