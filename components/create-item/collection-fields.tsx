"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { FolderOpen, Plus, Upload, X, ChevronDown } from "lucide-react"
import type { ItemCollectionStatus } from "@/lib/types/item-status"

interface CollectionFieldsProps {
  data: ItemCollectionStatus
  onChange: (data: ItemCollectionStatus) => void
  isActive: boolean
  collections: Array<{ id: string; name: string; itemCount?: number }>
  onFieldsVisible?: () => void
  isWishlistMode?: boolean
}

export function CollectionFields({
  data,
  onChange,
  isActive,
  collections,
  onFieldsVisible,
  isWishlistMode = false,
}: CollectionFieldsProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Keep the latest onFieldsVisible in a ref so the activation effect below
  // doesn't re-run every time the parent re-creates the callback inline.
  const onFieldsVisibleRef = useRef(onFieldsVisible)
  useEffect(() => {
    onFieldsVisibleRef.current = onFieldsVisible
  }, [onFieldsVisible])

  useEffect(() => {
    if (!isActive) return
    setIsAnimating(true)
    onFieldsVisibleRef.current?.()
    const timer = setTimeout(() => setIsAnimating(false), 400)
    return () => clearTimeout(timer)
  }, [isActive])

  if (!isActive) return null

  const filteredCollections = collections.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )
  const selectedCollection = collections.find((c) => c.id === data.collectionId)

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      onChange({ ...data, receiptUrl: url })
    }
  }

  return (
    <div
      data-section
      className={cn(
        "bg-card rounded-lg border border-border p-4 md:p-5 transition-all duration-300",
        isAnimating && "animate-in fade-in slide-in-from-top-2",
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-foreground">Collection</h2>
        <FolderOpen className="h-4 w-4 text-primary" />
      </div>

      <div className="space-y-4">
        <div className="relative">
          <label className="text-xs text-muted-foreground mb-1.5 block">
            Add to Collection <span className="text-primary">*</span>
          </label>
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors bg-card",
              showDropdown ? "border-border" : "border-border hover:border-primary/50",
            )}
          >
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <span className={cn(selectedCollection ? "text-foreground" : "text-muted-foreground")}>
                {selectedCollection?.name || "Select a collection..."}
              </span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                showDropdown && "rotate-180",
              )}
            />
          </button>

          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 overflow-hidden">
              <div className="p-2 border-b border-border">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search collections..."
                  className="w-full bg-secondary rounded-md px-3 py-1.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/40"
                  autoFocus
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredCollections.map((collection) => (
                  <button
                    key={collection.id}
                    type="button"
                    onClick={() => {
                      onChange({ ...data, collectionId: collection.id })
                      setShowDropdown(false)
                      setSearchQuery("")
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 hover:bg-muted transition-colors text-left",
                      data.collectionId === collection.id && "bg-primary/10",
                    )}
                  >
                    <span className="text-sm">{collection.name}</span>
                    {!isWishlistMode && collection.itemCount != null && (
                      <span className="text-xs text-muted-foreground">{collection.itemCount} items</span>
                    )}
                  </button>
                ))}
                {filteredCollections.length === 0 && (
                  <div className="px-3 py-3 text-xs text-muted-foreground">No collections match.</div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowDropdown(false)}
                className="w-full flex items-center gap-2 px-3 py-2 border-t border-border text-foreground hover:bg-muted transition-colors"
              >
                <Plus className="h-4 w-4 text-primary" />
                <span className="text-sm">Create New Collection</span>
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Item Notes</label>
          <textarea
            value={data.notes || ""}
            onChange={(e) => onChange({ ...data, notes: e.target.value || null })}
            placeholder="Personal notes about this item in your collection..."
            rows={2}
            className={cn(
              "w-full bg-card rounded-lg border border-border px-3 py-2 text-sm resize-none",
              "text-foreground placeholder:text-muted-foreground/50",
              "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all",
            )}
          />
        </div>

        {!isWishlistMode && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Date Acquired</label>
                <input
                  type="date"
                  value={data.dateAcquired || ""}
                  onChange={(e) => onChange({ ...data, dateAcquired: e.target.value || null })}
                  className={cn(
                    "w-full bg-card rounded-lg border border-border px-3 py-2 text-sm text-foreground",
                    "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all",
                  )}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Acquisition Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={data.acquisitionPrice || ""}
                    onChange={(e) => onChange({ ...data, acquisitionPrice: e.target.value || null })}
                    className={cn(
                      "w-full bg-card rounded-lg border border-border pl-7 pr-3 py-2 text-sm",
                      "text-foreground placeholder:text-muted-foreground/50",
                      "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all",
                    )}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">
                Receipt / Proof of Purchase
              </label>
              {data.receiptUrl ? (
                <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border border-border">
                  <img
                    src={data.receiptUrl || "/placeholder.svg"}
                    alt="Receipt"
                    className="w-14 h-14 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">Receipt uploaded</p>
                    <button
                      type="button"
                      onClick={() => onChange({ ...data, receiptUrl: null })}
                      className="text-xs text-destructive hover:underline flex items-center gap-1 mt-1"
                    >
                      <X className="h-3 w-3" />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed transition-colors",
                    "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Upload className="h-4 w-4" />
                  <span className="text-sm">Upload receipt (optional)</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleReceiptUpload}
                className="hidden"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
