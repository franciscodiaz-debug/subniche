"use client"

import type React from "react"

import { useState } from "react"
import { X, FolderOpen, Heart, Lock, Globe, Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { Collection, CollectionVisibility } from "@/lib/types"

interface CreateCollectionModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (collection: Collection) => void
  userId: string
}

export function CreateCollectionModal({ isOpen, onClose, onCreated, userId }: CreateCollectionModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isWishlist, setIsWishlist] = useState(false)
  const [visibility, setVisibility] = useState<CollectionVisibility>("private")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const { data, error: insertError } = await supabase
        .from("collections")
        .insert({
          user_id: userId,
          name: name.trim(),
          description: description.trim() || null,
          is_wishlist: isWishlist,
          visibility,
        })
        .select()
        .single()

      if (insertError) throw insertError

      onCreated({
        ...data,
        item_count: 0,
        total_user_value: 0,
        total_ai_value: 0,
      })

      // Reset form
      setName("")
      setDescription("")
      setIsWishlist(false)
      setVisibility("private")
    } catch (err) {
      console.error("[v0] Error creating collection:", err)
      setError("Failed to create collection. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-card border border-border rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Create Collection</h2>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Collection Type */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsWishlist(false)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                  !isWishlist
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50",
                )}
              >
                <FolderOpen className={cn("h-5 w-5", !isWishlist ? "text-primary" : "")} />
                <div className="text-left">
                  <p className="font-medium text-sm">Collection</p>
                  <p className="text-xs opacity-70">Items you own</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setIsWishlist(true)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                  isWishlist
                    ? "border-chart-5 bg-chart-5/10 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-chart-5/50",
                )}
              >
                <Heart className={cn("h-5 w-5", isWishlist ? "text-chart-5" : "")} />
                <div className="text-left">
                  <p className="font-medium text-sm">Wishlist</p>
                  <p className="text-xs opacity-70">Items you want</p>
                </div>
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name" className="text-sm text-muted-foreground">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isWishlist ? "Dream Guitars" : "My Main Rig"}
              className="mt-1 bg-secondary border-border"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm text-muted-foreground">
              Description (optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              className="mt-1 bg-secondary border-border resize-none"
              rows={2}
            />
          </div>

          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">Visibility</Label>
            <div className="space-y-2">
              {[
                { value: "private" as const, icon: Lock, label: "Private", desc: "Only you can see" },
                { value: "unlisted" as const, icon: Link2, label: "Unlisted", desc: "Anyone with the link" },
                { value: "public" as const, icon: Globe, label: "Public", desc: "Visible on your profile" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setVisibility(option.value)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left",
                    visibility === option.value
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/50",
                  )}
                >
                  <option.icon className={cn("h-4 w-4", visibility === option.value ? "text-primary" : "")} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{option.label}</p>
                    <p className="text-xs opacity-70">{option.desc}</p>
                  </div>
                  {visibility === option.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground"
              disabled={!name.trim() || isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
