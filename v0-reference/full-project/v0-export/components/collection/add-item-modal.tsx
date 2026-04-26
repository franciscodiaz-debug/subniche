"use client"

import type React from "react"

import { useState } from "react"
import { X, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import type { CollectionItem } from "@/lib/types"

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  onAdded: (item: CollectionItem) => void
  collectionId: string
  isWishlist: boolean
}

const CONDITIONS = ["Mint", "Excellent", "Good", "Fair", "Poor"]

export function AddItemModal({ isOpen, onClose, onAdded, collectionId, isWishlist }: AddItemModalProps) {
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [description, setDescription] = useState("")
  const [condition, setCondition] = useState("Good")
  const [userValue, setUserValue] = useState("")
  const [purchasePrice, setPurchasePrice] = useState("")
  const [notes, setNotes] = useState("")
  const [priority, setPriority] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEstimatingValue, setIsEstimatingValue] = useState(false)
  const [aiSuggestedValue, setAiSuggestedValue] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const { data, error: insertError } = await supabase
        .from("collection_items")
        .insert({
          collection_id: collectionId,
          title: title.trim(),
          subtitle: subtitle.trim() || null,
          description: description.trim() || null,
          condition,
          user_estimated_value: userValue ? Number.parseFloat(userValue) : null,
          ai_suggested_value: aiSuggestedValue,
          ai_value_updated_at: aiSuggestedValue ? new Date().toISOString() : null,
          purchase_price: purchasePrice ? Number.parseFloat(purchasePrice) : null,
          notes: notes.trim() || null,
          is_owned: !isWishlist,
          priority: isWishlist ? priority : 0,
          images: [],
        })
        .select()
        .single()

      if (insertError) throw insertError

      onAdded(data)

      // Reset form
      setTitle("")
      setSubtitle("")
      setDescription("")
      setCondition("Good")
      setUserValue("")
      setPurchasePrice("")
      setNotes("")
      setPriority(0)
      setAiSuggestedValue(null)
    } catch (err) {
      console.error("[v0] Error adding item:", err)
      setError("Failed to add item. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEstimateValue = async () => {
    if (!title.trim()) return

    setIsEstimatingValue(true)
    try {
      const response = await fetch("/api/estimate-value", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          description,
          condition,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAiSuggestedValue(data.estimatedValue)
      }
    } catch (err) {
      console.error("[v0] Error estimating value:", err)
    } finally {
      setIsEstimatingValue(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-border bg-card">
          <h2 className="text-lg font-semibold text-foreground">{isWishlist ? "Add to Wishlist" : "Add Item"}</h2>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-sm text-muted-foreground">
              Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Fender Stratocaster 1962 Reissue"
              className="mt-1 bg-secondary border-border"
              required
            />
          </div>

          {/* Subtitle */}
          <div>
            <Label htmlFor="subtitle" className="text-sm text-muted-foreground">
              Subtitle
            </Label>
            <Input
              id="subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g., Sunburst, Rosewood Neck"
              className="mt-1 bg-secondary border-border"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm text-muted-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about your item..."
              className="mt-1 bg-secondary border-border resize-none"
              rows={3}
            />
          </div>

          {/* Condition */}
          <div>
            <Label className="text-sm text-muted-foreground">Condition</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {CONDITIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCondition(c)}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    condition === c
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Value Section */}
          <div className="space-y-3 p-3 bg-secondary/50 rounded-lg">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">Value</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleEstimateValue}
                disabled={!title.trim() || isEstimatingValue}
                className="text-xs"
              >
                {isEstimatingValue ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3 mr-1" />
                )}
                Get AI Estimate
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="userValue" className="text-xs text-muted-foreground">
                  Your Estimate
                </Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="userValue"
                    type="number"
                    value={userValue}
                    onChange={(e) => setUserValue(e.target.value)}
                    placeholder="0"
                    className="pl-7 bg-card border-border"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">AI Estimate</Label>
                <div className="mt-1 px-3 py-2 bg-card border border-border rounded-md flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-chart-2" />
                  <span className="text-foreground">
                    {aiSuggestedValue ? `$${aiSuggestedValue.toLocaleString()}` : "—"}
                  </span>
                </div>
              </div>
            </div>

            {!isWishlist && (
              <div>
                <Label htmlFor="purchasePrice" className="text-xs text-muted-foreground">
                  Purchase Price (optional)
                </Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="purchasePrice"
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder="0"
                    className="pl-7 bg-card border-border"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Priority (wishlist only) */}
          {isWishlist && (
            <div>
              <Label className="text-sm text-muted-foreground">Priority</Label>
              <div className="flex gap-2 mt-1">
                {[
                  { value: 0, label: "Low" },
                  { value: 1, label: "Medium" },
                  { value: 2, label: "High" },
                ].map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={`flex-1 px-3 py-1.5 text-sm rounded-md border transition-colors ${
                      priority === p.value
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-sm text-muted-foreground">
              Personal Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add private notes..."
              className="mt-1 bg-secondary border-border resize-none"
              rows={2}
            />
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
              disabled={!title.trim() || isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Item"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
