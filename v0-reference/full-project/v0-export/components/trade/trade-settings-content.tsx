"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import Image from "next/image"
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { TradeCriteria } from "@/lib/types"

const CATEGORIES = ["Guitars", "Drums", "Keyboards", "Audio Equipment", "Accessories", "Other"]
const SUBCATEGORIES: Record<string, string[]> = {
  Guitars: ["Electric", "Acoustic", "Bass", "Classical", "Parts & Accessories"],
  Drums: ["Acoustic Kits", "Electronic Kits", "Cymbals", "Hardware", "Parts & Accessories"],
  Keyboards: ["Synthesizers", "Digital Pianos", "MIDI Controllers", "Organs", "Parts & Accessories"],
  "Audio Equipment": ["Amplifiers", "Microphones", "Interfaces", "Monitors", "Effects Pedals", "Mixers"],
  Accessories: ["Cases", "Stands", "Cables", "Straps", "Picks", "Other"],
  Other: ["Sheet Music", "Instructional", "Vintage", "Collectibles", "Other"],
}
const CONDITIONS = ["Mint", "Excellent", "Good", "Fair", "Poor"]

interface TradeSettingsContentProps {
  itemType: "listing" | "collection_item"
  itemId: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  return res.json()
}

export function TradeSettingsContent({ itemType, itemId }: TradeSettingsContentProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [item, setItem] = useState<{
    title: string
    images: string[]
    price: number | null
  } | null>(null)

  // Fetch existing criteria
  const { data: criteriaData, mutate } = useSWR<{ criteria: TradeCriteria[] }>(
    `/api/trade-criteria?${itemType === "listing" ? "listing_id" : "collection_item_id"}=${itemId}`,
    fetcher,
  )

  const criteria = criteriaData?.criteria || []

  // Fetch item details
  useEffect(() => {
    const fetchItem = async () => {
      const supabase = createClient()

      if (itemType === "listing") {
        const { data } = await supabase.from("listings").select("title, images, price").eq("id", itemId).single()
        if (data) setItem(data)
      } else {
        const { data } = await supabase
          .from("collection_items")
          .select("title, images, user_estimated_value, ai_suggested_value")
          .eq("id", itemId)
          .single()
        if (data) {
          setItem({
            title: data.title,
            images: data.images || [],
            price: data.user_estimated_value || data.ai_suggested_value,
          })
        }
      }
    }
    fetchItem()
  }, [itemType, itemId])

  const handleAddCriteria = async (newCriteria: Partial<TradeCriteria>) => {
    setSaving(true)
    try {
      const body = {
        ...(itemType === "listing" ? { listing_id: itemId } : { collection_item_id: itemId }),
        ...newCriteria,
      }

      const res = await fetch("/api/trade-criteria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        mutate()
      }
    } catch (error) {
      console.error("Failed to add criteria:", error)
    }
    setSaving(false)
  }

  const handleDeleteCriteria = async (criteriaId: string) => {
    try {
      await fetch(`/api/trade-criteria?id=${criteriaId}`, {
        method: "DELETE",
      })
      mutate()
    } catch (error) {
      console.error("Failed to delete criteria:", error)
    }
  }

  return (
    <div className="min-h-screen w-full">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="p-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-card rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-foreground">Trade Settings</h1>
              {item && <p className="text-sm text-muted-foreground truncate">{item.title}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        {/* Item preview */}
        {item && (
          <div className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
              <Image
                src={item.images?.[0] || "/placeholder.svg?height=80&width=80&query=item"}
                alt={item.title}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-medium text-foreground">{item.title}</h3>
              {item.price && <p className="text-lg font-bold text-primary">${item.price.toLocaleString()}</p>}
            </div>
          </div>
        )}

        {/* Existing criteria */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Trade Preferences</h2>
          <p className="text-sm text-muted-foreground">
            Define what you&apos;re looking for in exchange for this item. Add multiple criteria to increase your
            chances of finding a match.
          </p>

          {criteria.length > 0 && (
            <div className="space-y-3">
              {criteria.map((c) => (
                <CriteriaCard key={c.id} criteria={c} onDelete={() => handleDeleteCriteria(c.id)} />
              ))}
            </div>
          )}

          {/* Add new criteria form */}
          <AddCriteriaForm onAdd={handleAddCriteria} saving={saving} />
        </div>
      </div>
    </div>
  )
}

function CriteriaCard({ criteria, onDelete }: { criteria: TradeCriteria; onDelete: () => void }) {
  return (
    <div className="p-4 bg-card rounded-lg border border-border">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-1 bg-primary/20 text-primary rounded text-sm font-medium">
              {criteria.target_category}
            </span>
            {criteria.target_subcategories?.map((sub) => (
              <span key={sub} className="px-2 py-0.5 bg-secondary rounded text-xs text-muted-foreground">
                {sub}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {criteria.acceptable_conditions && criteria.acceptable_conditions.length > 0 && (
              <span>Conditions: {criteria.acceptable_conditions.join(", ")}</span>
            )}
          </div>

          {(criteria.min_value || criteria.max_value) && (
            <p className="text-sm text-muted-foreground">
              Value: ${criteria.min_value?.toLocaleString() || "0"} - ${criteria.max_value?.toLocaleString() || "Any"}
              {criteria.value_flexibility !== "exact" && (
                <span className="text-primary ml-1">({criteria.value_flexibility})</span>
              )}
            </p>
          )}

          {criteria.description && <p className="text-sm text-foreground">&quot;{criteria.description}&quot;</p>}
        </div>

        <button
          onClick={onDelete}
          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function AddCriteriaForm({
  onAdd,
  saving,
}: {
  onAdd: (criteria: Partial<TradeCriteria>) => void
  saving: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const [category, setCategory] = useState("")
  const [subcategories, setSubcategories] = useState<string[]>([])
  const [conditions, setConditions] = useState<string[]>(["Mint", "Excellent", "Good"])
  const [minValue, setMinValue] = useState("")
  const [maxValue, setMaxValue] = useState("")
  const [flexibility, setFlexibility] = useState<"exact" | "flexible" | "any">("flexible")
  const [description, setDescription] = useState("")

  const handleSubmit = () => {
    if (!category) return

    onAdd({
      target_category: category,
      target_subcategories: subcategories,
      acceptable_conditions: conditions,
      min_value: minValue ? Number.parseFloat(minValue) : null,
      max_value: maxValue ? Number.parseFloat(maxValue) : null,
      value_flexibility: flexibility,
      description: description || null,
    })

    // Reset form
    setCategory("")
    setSubcategories([])
    setConditions(["Mint", "Excellent", "Good"])
    setMinValue("")
    setMaxValue("")
    setFlexibility("flexible")
    setDescription("")
    setExpanded(false)
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
      >
        <Plus className="h-5 w-5" />
        <span>Add Trade Criteria</span>
      </button>
    )
  }

  return (
    <div className="p-4 bg-card rounded-lg border border-primary/30 space-y-4">
      <h3 className="font-medium text-foreground">New Trade Criteria</h3>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Category *</label>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value)
            setSubcategories([])
          }}
          className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Subcategories */}
      {category && SUBCATEGORIES[category] && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Subcategories (optional)</label>
          <div className="flex flex-wrap gap-2">
            {SUBCATEGORIES[category].map((sub) => (
              <button
                key={sub}
                onClick={() =>
                  setSubcategories((prev) => (prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]))
                }
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm transition-colors",
                  subcategories.includes(sub)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground",
                )}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Conditions */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Acceptable Conditions</label>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((cond) => (
            <button
              key={cond}
              onClick={() =>
                setConditions((prev) => (prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]))
              }
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm transition-colors",
                conditions.includes(cond)
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              {cond}
            </button>
          ))}
        </div>
      </div>

      {/* Value range */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Value Range (optional)</label>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <input
              type="number"
              placeholder="Min $"
              value={minValue}
              onChange={(e) => setMinValue(e.target.value)}
              className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
            />
          </div>
          <span className="text-muted-foreground">to</span>
          <div className="flex-1">
            <input
              type="number"
              placeholder="Max $"
              value={maxValue}
              onChange={(e) => setMaxValue(e.target.value)}
              className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Flexibility */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Value Flexibility</label>
        <div className="flex gap-2">
          {(["exact", "flexible", "any"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFlexibility(f)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm transition-colors capitalize",
                flexibility === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {flexibility === "exact" && "Must be within exact value range"}
          {flexibility === "flexible" && "Allow +/- 20% of value range"}
          {flexibility === "any" && "Value doesn't matter for matching"}
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Description (optional)</label>
        <textarea
          placeholder="e.g., Looking for a Les Paul style guitar in cherry sunburst..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full p-3 bg-background border border-border rounded-lg text-foreground resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSubmit}
          disabled={!category || saving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>Save Criteria</span>
        </button>
        <button
          onClick={() => setExpanded(false)}
          className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-muted transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
