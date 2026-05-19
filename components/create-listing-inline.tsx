"use client"

import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import Image from "next/image"
import {
  ImagePlus,
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Sparkles,
  Loader2,
  Check,
  Info,
  Package,
  Truck,
  AlertCircle,
  Eye,
  Lock,
  FolderOpen,
  Tag,
  Repeat2,
  ArrowRight,
  ArrowUp,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { currentUser } from "@/lib/current-user"
import { StatusSelector } from "@/components/create-item/status-selector"
import { CollectionFields } from "@/components/create-item/collection-fields"
import { WishlistFields } from "@/components/create-item/wishlist-fields"
import { WishlistEntrySelector } from "@/components/create-item/wishlist-entry-selector"
import { SellerProfilePreview } from "@/components/create-item/seller-profile-preview"
import { MobileCreateListingWizard } from "@/components/create-item/mobile-wizard"
import {
  emptyTradeInterest,
  parseSimpleToAdvanced,
  type TradeInterestItem,
} from "@/components/create-item/trade-interest-section"
import {
  PublishConfirmScreen,
  type PublishConfirmListingSummary,
} from "@/components/create-item/publish-confirm-screen"
import { saveDraft } from "@/lib/draft-listing-storage"
import {
  OnboardingTooltip,
  type OnboardingStep,
} from "@/components/create-item/onboarding-tooltip"
import type {
  ItemCollectionStatus,
  ItemSaleStatus,
  ItemTradeStatus,
  WishlistItemData,
} from "@/lib/types/item-status"

interface CreateListingInlineProps {
  isAuthenticated?: boolean
  initialStatus?: string
  initialCollectionId?: string
  initialCollectionName?: string
}

type Suggestion = { value: string; confidence: "high" | "medium" | "low"; accepted: boolean }

const CONDITION_GRADES = [
  { value: "new", label: "New" },
  { value: "used-as-new", label: "Used – As New" },
  { value: "used", label: "Used" },
  { value: "used-as-is", label: "Used – As Is" },
] as const

export type SpecField = { key: string; label: string }

export const DEFAULT_SPEC_SCHEMA: { required: SpecField[]; optional: SpecField[] } = {
  required: [
    { key: "brand", label: "Brand" },
    { key: "year", label: "Year" },
  ],
  optional: [
    { key: "color", label: "Color" },
    { key: "material", label: "Material" },
    { key: "weight", label: "Weight" },
    { key: "dimensions", label: "Dimensions" },
  ],
}

export const SPEC_SCHEMA: Record<string, { required: SpecField[]; optional: SpecField[] }> = {
  Guitars: {
    required: [
      { key: "brand", label: "Brand" },
      { key: "year", label: "Year" },
      { key: "bodyType", label: "Body Type" },
    ],
    optional: [
      { key: "handedness", label: "Handedness" },
      { key: "color", label: "Color" },
      { key: "pickups", label: "Pickups" },
      { key: "strings", label: "Strings" },
      { key: "finish", label: "Finish" },
      { key: "fretboard", label: "Fretboard" },
      { key: "weight", label: "Weight" },
    ],
  },
  Drums: {
    required: [
      { key: "brand", label: "Brand" },
      { key: "type", label: "Type" },
    ],
    optional: [
      { key: "year", label: "Year" },
      { key: "color", label: "Color" },
      { key: "size", label: "Size" },
      { key: "shellMaterial", label: "Shell Material" },
    ],
  },
  Keyboards: {
    required: [
      { key: "brand", label: "Brand" },
      { key: "keyCount", label: "Key Count" },
    ],
    optional: [
      { key: "year", label: "Year" },
      { key: "color", label: "Color" },
      { key: "actionType", label: "Action" },
      { key: "polyphony", label: "Polyphony" },
      { key: "weight", label: "Weight" },
    ],
  },
  "Audio Equipment": {
    required: [
      { key: "brand", label: "Brand" },
      { key: "type", label: "Type" },
    ],
    optional: [
      { key: "year", label: "Year" },
      { key: "color", label: "Color" },
      { key: "connectivity", label: "Connectivity" },
      { key: "power", label: "Power" },
    ],
  },
  Accessories: {
    required: [
      { key: "brand", label: "Brand" },
      { key: "type", label: "Type" },
    ],
    optional: [
      { key: "color", label: "Color" },
      { key: "material", label: "Material" },
      { key: "size", label: "Size" },
    ],
  },
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: "status",
    targetSelector: "[data-onboarding='status']",
    title: "Item Status",
    description:
      "Choose what you want to do with your item. You can select multiple.",
    position: "bottom",
  },
  {
    id: "profile",
    targetSelector: "[data-onboarding='profile']",
    title: "Your Profile",
    description:
      "This is how your profile appears to others. A more complete profile = more trust from other users.",
    position: "bottom",
  },
  {
    id: "ai-assist",
    targetSelector: "[data-onboarding='ai-assist']",
    title: "AI Assist",
    // Tight, scannable requirement list: lead-in verb, two bullets, and a
    // closing clause — reads like a single continuous sentence.
    description: (
      <div className="space-y-2">
        <p>Add</p>
        <div className="space-y-1">
          {["Title + Subtitle", "At least one photo"].map((label) => (
            <div key={label} className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-foreground">{label}</span>
            </div>
          ))}
        </div>
        <p>and AI can help fill in the rest</p>
      </div>
    ),
    position: "bottom",
  },
]

function scrollSectionIntoView(el: HTMLElement | null) {
  if (!el) return
  const container = el.closest("[data-section]") as HTMLElement | null
  ;(container || el).scrollIntoView({ behavior: "smooth", block: "nearest" })
}

// Expands a textarea vertically to fit its content so that the surrounding card
// card grows with the text instead of scrolling inside a fixed-height box.
// minRows acts as a floor so empty textareas don't collapse to a single line
// (browsers report scrollHeight ≈ 1 line for empty <textarea>s after a
// `height: auto` reset, regardless of the `rows` attribute).
function useAutoGrowTextarea(
  ref: React.RefObject<HTMLTextAreaElement | HTMLInputElement | null>,
  value: string,
  enabled: boolean,
  minRows = 1,
) {
  useLayoutEffect(() => {
    if (!enabled) return
    const el = ref.current as HTMLTextAreaElement | null
    if (!el || el.tagName !== "TEXTAREA") return
    // Reset first so shrinking also works when text is deleted.
    el.style.height = "auto"
    const styles = window.getComputedStyle(el)
    const lineHeightRaw = parseFloat(styles.lineHeight)
    const fontSize = parseFloat(styles.fontSize) || 14
    // Fall back to 1.4× font-size when line-height is "normal" (NaN).
    const lineHeight = Number.isFinite(lineHeightRaw) ? lineHeightRaw : fontSize * 1.4
    const paddingY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom)
    const borderY = parseFloat(styles.borderTopWidth) + parseFloat(styles.borderBottomWidth)
    const minHeight = lineHeight * minRows + paddingY + borderY
    el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`
  }, [ref, value, enabled, minRows])
}

export function AutoGrowTextarea({
  value,
  onChange,
  placeholder,
  minRows = 2,
  className,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  minRows?: number
  className?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useAutoGrowTextarea(ref, value, true, minRows)
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={minRows}
      className={className}
    />
  )
}

export function InlineInput({
  value,
  onChange,
  placeholder,
  className,
  inputClassName,
  as = "input",
  suggestion,
  onAcceptSuggestion,
  onFocus,
  onBlur,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  className?: string
  inputClassName?: string
  as?: "input" | "textarea"
  suggestion?: Suggestion
  onAcceptSuggestion?: () => void
  onFocus?: () => void
  onBlur?: () => void
}) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const Component = as === "textarea" ? "textarea" : "input"
  const showSuggestion = suggestion && !suggestion.accepted && !value
  useAutoGrowTextarea(inputRef, value, as === "textarea" && !showSuggestion)

  const handleFocus = () => {
    scrollSectionIntoView(inputRef.current)
    onFocus?.()
  }

  return (
    <div className={cn("group relative", className)}>
      {showSuggestion ? (
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <Component
              value={suggestion.value}
              readOnly
              className={cn(
                "w-full bg-primary/5 outline-none p-2 -mx-2 rounded-md border border-primary/20",
                "text-foreground/80 italic",
                as === "textarea" && "resize-none min-h-[100px]",
                inputClassName,
              )}
            />
          </div>
          <button
            type="button"
            onClick={onAcceptSuggestion}
            className="shrink-0 p-2 rounded-md bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
            title="Accept suggestion"
          >
            <Check className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <Component
          ref={inputRef as any}
          value={value}
          onChange={(e: any) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={handleFocus}
          onBlur={onBlur}
          className={cn(
            "w-full bg-transparent outline-none focus:ring-0 p-0 placeholder:text-muted-foreground/50",
            "transition-colors duration-200",
            "focus:bg-primary/5 px-2 -mx-2 rounded-md",
            as === "textarea" && "resize-none min-h-[100px] py-2",
            inputClassName,
          )}
        />
      )}
    </div>
  )
}

export function InlineSpecInput({
  label,
  value,
  onChange,
  placeholder = "-",
  suggestion,
  onAcceptSuggestion,
  inputRef,
  onEnterNext,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  suggestion?: Suggestion
  onAcceptSuggestion?: () => void
  inputRef?: React.RefObject<HTMLInputElement>
  onEnterNext?: () => void
}) {
  const showSuggestion = suggestion && !suggestion.accepted && !value

  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      {showSuggestion ? (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-primary/5 rounded-md border border-primary/20 px-3 py-2 text-foreground/80 italic text-sm">
            {suggestion.value}
          </div>
          <button
            type="button"
            onClick={onAcceptSuggestion}
            className="shrink-0 p-1.5 rounded-md bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
            title="Accept suggestion"
          >
            <Check className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onEnterNext) {
              e.preventDefault()
              onEnterNext()
            }
          }}
          className={cn(
            "w-full bg-card rounded-md border border-border px-3 py-2 text-sm",
            "text-foreground placeholder:text-muted-foreground/50",
            "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all",
          )}
        />
      )}
    </div>
  )
}

export function PhotoUploadSection({
  images,
  onImagesChange,
  isHighlighted = false,
}: {
  images: string[]
  onImagesChange: (images: string[]) => void
  isHighlighted?: boolean
}) {
  const [selectedImage, setSelectedImage] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages = Array.from(files).map((f) => URL.createObjectURL(f))
      onImagesChange([...images, ...newImages])
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
    if (selectedImage >= newImages.length) {
      setSelectedImage(Math.max(0, newImages.length - 1))
    }
  }

  return (
    <div className="space-y-3">
      <div
        onClick={() => images.length === 0 && fileInputRef.current?.click()}
        className={cn(
          "aspect-square relative rounded-lg overflow-hidden transition-colors group",
          images.length === 0
            ? "border border-dashed border-border hover:border-primary/60 bg-secondary/40 cursor-pointer"
            : "bg-card",
        )}
      >
        {images.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-lg bg-muted/60 flex items-center justify-center mb-3">
              <ImagePlus className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-primary" />
            </div>
            <p className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">Add photos</p>
          </div>
        ) : (
          <Image
            src={images[selectedImage] || "/placeholder.svg"}
            alt="Listing image"
            fill
            className="object-cover"
            unoptimized
          />
        )}
      </div>

      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <button
                type="button"
                onClick={() => setSelectedImage(index)}
                className={cn(
                  "w-14 h-14 relative rounded-md overflow-hidden border transition-colors",
                  selectedImage === index ? "border-primary" : "border-border hover:border-primary/50",
                )}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </button>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
          {images.length < 6 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-14 h-14 rounded-md border border-dashed border-border hover:border-primary flex items-center justify-center transition-colors"
              aria-label="Add more photos"
            >
              <Plus className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}

function CollapsibleSection({
  title,
  children,
  isOpen,
  onToggle,
  className,
}: {
  title: string
  children: React.ReactNode
  isOpen: boolean
  onToggle: (open: boolean) => void
  className?: string
}) {
  return (
    <div className={cn("bg-card rounded-lg border border-border overflow-hidden transition-all", className)}>
      <button
        type="button"
        onClick={() => onToggle(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
      >
        <h2 className="text-sm font-semibold">{title}</h2>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && <div className="p-4 pt-0 border-t border-border">{children}</div>}
    </div>
  )
}

export function CategorySelector({
  category,
  subcategory,
  onCategoryChange,
  onSubcategoryChange,
  showLabel = true,
}: {
  category: string
  subcategory: string
  onCategoryChange: (c: string) => void
  onSubcategoryChange: (s: string) => void
  /**
   * The mobile wizard wraps this selector in its own <SectionLabel>, so it
   * passes `showLabel={false}` to suppress the internal "Category" heading
   * and avoid a duplicated label. Desktop keeps the default behavior.
   */
  showLabel?: boolean
}) {
  const categories = ["Guitars", "Drums", "Keyboards", "Audio Equipment", "Accessories", "Other"]
  const subcategoriesByCat: Record<string, string[]> = {
    Guitars: ["Electric", "Acoustic", "Bass", "Classical", "Parts & Accessories"],
    Drums: ["Acoustic Kits", "Electronic", "Cymbals", "Parts"],
    Keyboards: ["Synths", "Stage Pianos", "MIDI Controllers", "Organs"],
    "Audio Equipment": ["Amps", "Pedals", "Microphones", "Monitors"],
    Accessories: ["Cables", "Cases", "Strings", "Stands"],
    Other: ["Misc"],
  }
  const subcategories = category ? subcategoriesByCat[category] ?? [] : []

  return (
    <div className="bg-card rounded-lg border border-border p-3">
      {showLabel && (
        <label className="text-xs text-muted-foreground mb-2 block">Category</label>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        {category ? (
          <button
            type="button"
            onClick={() => {
              onCategoryChange("")
              onSubcategoryChange("")
            }}
            className="px-3 py-1.5 rounded-lg transition-all bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium"
          >
            {category}
          </button>
        ) : (
          categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                onCategoryChange(cat)
                onSubcategoryChange("")
              }}
              className="px-3 py-1.5 rounded-lg transition-all border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground text-xs"
            >
              {cat}
            </button>
          ))
        )}

        {category && (
          <>
            <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
            {subcategory ? (
              <button
                type="button"
                onClick={() => onSubcategoryChange("")}
                className="px-3 py-1.5 rounded-lg transition-all bg-primary/10 text-primary font-medium border border-primary/30 text-xs hover:bg-primary/20"
              >
                {subcategory}
              </button>
            ) : (
              subcategories.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSubcategoryChange(s)}
                  className="px-3 py-1.5 rounded-lg transition-all border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground text-xs"
                >
                  {s}
                </button>
              ))
            )}
          </>
        )}
      </div>
    </div>
  )
}

export function CreateListingInline({
  isAuthenticated = true,
  initialStatus,
  initialCollectionId,
  initialCollectionName,
}: CreateListingInlineProps) {
  const router = useRouter()
  /* `publishStage` drives the separation between the main form and the
   * Publish Confirm Screen. Desktop "Add Item" sets it to `confirm`, which
   * mounts the full-screen preview + trade editor overlay. The actual
   * persist-and-navigate step only runs when the user confirms from that
   * overlay, keeping trade authoring out of the main form. */
  const [publishStage, setPublishStage] = useState<"form" | "confirm">("form")
  /* Blocks re-entrancy into `handleConfirmPublish` while the mandatory
   * AI structuring call is in flight, and drives the loading state on the
   * publish CTA across both breakpoints. */
  const [isPublishing, setIsPublishing] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [category, setCategory] = useState("")
  const [subcategory, setSubcategory] = useState("")
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [description, setDescription] = useState("")
  const [condition, setCondition] = useState("")
  const [conditionGrade, setConditionGrade] = useState<"" | "new" | "used-as-new" | "used" | "used-as-is">("")
  const [brand, setBrand] = useState("")
  const [year, setYear] = useState("")
  const [color, setColor] = useState("")
  const [handedness, setHandedness] = useState("")
  const [extraSpecs, setExtraSpecs] = useState<Record<string, string>>({})

  const getSpec = (key: string) => {
    if (key === "brand") return brand
    if (key === "year") return year
    if (key === "color") return color
    if (key === "handedness") return handedness
    return extraSpecs[key] ?? ""
  }
  const setSpec = (key: string, v: string) => {
    if (key === "brand") return setBrand(v)
    if (key === "year") return setYear(v)
    if (key === "color") return setColor(v)
    if (key === "handedness") return setHandedness(v)
    setExtraSpecs((s) => ({ ...s, [key]: v }))
  }
  const specSchema = (category && SPEC_SCHEMA[category]) || DEFAULT_SPEC_SCHEMA
  // All specs in one flat, tab-ordered list: required first, then optional.
  const allSpecs: (SpecField & { required: boolean })[] = [
    ...specSchema.required.map((s) => ({ ...s, required: true })),
    ...specSchema.optional.map((s) => ({ ...s, required: false })),
  ]

  const [activeSection, setActiveSection] = useState<string | null>(null)

  const [forSaleActive, setForSaleActive] = useState(initialStatus === "sale")
  const [forTradeActive, setForTradeActive] = useState(initialStatus === "trade")
  const [inCollectionActive, setInCollectionActive] = useState(
    initialStatus === "collection" || !!initialCollectionId,
  )
  const [isWishlistActive, setIsWishlistActive] = useState(initialStatus === "wishlist")
  const [hasSelectedStatus, setHasSelectedStatus] = useState(!!initialStatus || !!initialCollectionId)
  const [statusFieldsAdded, setStatusFieldsAdded] = useState<string | null>(null)
  const [tradeNoticeVisible, setTradeNoticeVisible] = useState(false)
  // Only surface the "still needed" requirement list after a user attempts to publish
  // while something is still unfilled. It stays dismissed on the happy path.
  const [showMissingError, setShowMissingError] = useState(false)

  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleFieldsVisible = (label: string) => {
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current)
    setStatusFieldsAdded(label)
    statusTimerRef.current = setTimeout(() => setStatusFieldsAdded(null), 2500)
  }

  const [saleData, setSaleData] = useState<ItemSaleStatus>({
    active: initialStatus === "sale",
    price: null,
    paymentMethods: [],
    localPickup: false,
    pickupZip: null,
    shippingAvailable: false,
    shippingCost: null,
    returnPolicy: null,
    publishTo: ["marketplace"],
  })

  const [tradeData, setTradeData] = useState<ItemTradeStatus>({
    active: initialStatus === "trade",
    estimatedValue: null,
    interests: null,
    interestsData: { ...emptyTradeInterest },
    paymentMethods: [],
    localPickup: false,
    pickupZip: null,
    shippingAvailable: false,
    shippingCost: null,
    returnPolicy: null,
    publishTo: ["marketplace"],
  })

  const [collectionData, setCollectionData] = useState<ItemCollectionStatus>({
    active: inCollectionActive,
    collectionId: initialCollectionId || null,
    notes: null,
    dateAcquired: null,
    acquisitionPrice: null,
    receiptUrl: null,
  })

  const [wishlistData, setWishlistData] = useState<WishlistItemData>({
    sourceUrl: null,
    isPublic: true,
    targetPrice: null,
    notes: null,
    priority: 1,
  })

  const baseCollections = [
    { id: "demo-collection-1", name: "My Guitars", itemCount: 12 },
    { id: "demo-collection-2", name: "Pedal Board", itemCount: 7 },
    { id: "demo-wishlist-1", name: "Dream Guitars", itemCount: 3 },
  ]
  const userCollections =
    initialCollectionId && initialCollectionName && !baseCollections.some((c) => c.id === initialCollectionId)
      ? [{ id: initialCollectionId, name: initialCollectionName, itemCount: 0 }, ...baseCollections]
      : baseCollections

  // AI enhancement (frontend-only mock)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [suggestions, setSuggestions] = useState<Record<string, Suggestion>>({})
  const [enhanceError, setEnhanceError] = useState<string | null>(null)

  const brandInputRef = useRef<HTMLInputElement>(null)
  const yearInputRef = useRef<HTMLInputElement>(null)
  const handednessInputRef = useRef<HTMLInputElement>(null)
  const colorInputRef = useRef<HTMLInputElement>(null)
  const [specsOpen, setSpecsOpen] = useState(false)

  const [wishlistEntryMethod, setWishlistEntryMethod] = useState<"url" | "manual" | null>(null)
  const [showNormalFields, setShowNormalFields] = useState(!isWishlistActive)

  useEffect(() => {
    if (specsOpen) {
      const t = setTimeout(() => brandInputRef.current?.focus(), 100)
      return () => clearTimeout(t)
    }
  }, [specsOpen])

  // Silently clear the "still needed" warning once the user has filled in everything;
  // they shouldn't see a stale error after they've already addressed it.
  useEffect(() => {
    if (showMissingError && canPublish()) {
      setShowMissingError(false)
    }
  })

  const handleWishlistChange = (checked: boolean) => {
    setIsWishlistActive(checked)
    setHasSelectedStatus(true)
    if (checked) {
      setForSaleActive(false)
      setForTradeActive(false)
      setSaleData((p) => ({ ...p, active: false }))
      setTradeData((p) => ({ ...p, active: false }))
      setShowNormalFields(false)
      setWishlistEntryMethod(null)
      handleFieldsVisible("Wishlist")
    } else {
      setShowNormalFields(true)
      setWishlistEntryMethod(null)
    }
  }

  const getCurrentStep = () => {
    if (activeSection) return activeSection
    if (!hasSelectedStatus) return "status"
    if (!category || !subcategory) return "category"
    if (images.length === 0) return "photos"
    if (!title) return "title"
    if (!subtitle) return "subtitle"
    if (!description) return "description"
    if ((forSaleActive || forTradeActive || inCollectionActive) && !condition) return "condition"
    return "complete"
  }
  const currentStep = getCurrentStep()

  // AI Assist only needs the core content — title, subtitle, and at least one
  // photo. Category is no longer required; AI can suggest it along with the rest.
  const canEnhance = images.length > 0 && !!title && !!subtitle
  const enhanceRequirements = [
    { id: "photo", label: "Photo", met: images.length > 0, weight: 50 },
    { id: "title", label: "Title", met: !!title, weight: 25 },
    { id: "subtitle", label: "Subtitle", met: !!subtitle, weight: 25 },
  ]
  const fillPercentage = enhanceRequirements.filter((r) => r.met).reduce((s, r) => s + r.weight, 0)

  const getMissingRequirements = (): string[] => {
    const missing: string[] = []
    if (!title) missing.push("Title")
    if (images.length === 0) missing.push("At least one photo")
    if (forSaleActive) {
      if (!saleData.price) missing.push("Price")
      if (saleData.paymentMethods.length === 0) missing.push("At least one payment method")
      if (!saleData.localPickup && !saleData.shippingAvailable) {
        missing.push("Local pickup or shipping enabled")
      }
      if (saleData.localPickup && !saleData.pickupZip) missing.push("Pickup ZIP code")
      if (saleData.shippingAvailable && saleData.shippingCost === null) {
        missing.push("Shipping cost")
      }
    }
    if (isWishlistActive && !wishlistData.sourceUrl && !wishlistData.targetPrice) {
      missing.push("Wishlist source URL or target price")
    }
    return missing
  }

  const canPublish = () => getMissingRequirements().length === 0

  /* --------------------------------------------------------------------- */
  /* Prototype-only: one-tap autofill                                      */
  /*                                                                       */
  /* Populates every field with a realistic "vintage Strat" example so     */
  /* design reviews don't need to type a dozen inputs before seeing the    */
  /* preview/publish states. Not exposed in production builds.             */
  /* --------------------------------------------------------------------- */
  const handleAutofill = () => {
    // Category-first so downstream spec defaults resolve against Guitars.
    setCategory("Guitars")
    setSubcategory("Electric")

    setImages([
      "/autofill/guitar-1.jpg",
      "/autofill/guitar-2.jpg",
      "/autofill/guitar-3.jpg",
    ])

    setTitle("1965 Fender Stratocaster")
    setSubtitle("Three-tone Sunburst, matching headstock, original case")
    setDescription(
      "All-original 1965 Fender Stratocaster in three-tone sunburst with a rosewood fretboard. Frets were dressed in 2022 and the guitar plays effortlessly up and down the neck. Pickups read 5.8k / 5.9k / 6.1k and sound exactly as they should — glassy in position 2, vocal in 4, pure Hendrix in 5. Comes with the original tweed case, case candy, and a 2024 tech invoice. Zero issues, no breaks, no refinish. One of the cleanest 65s I've ever owned.",
    )

    setCondition("Used")
    setConditionGrade("used-as-new")
    setBrand("Fender")
    setYear("1965")
    setColor("Sunburst")
    setHandedness("Right")
    setExtraSpecs({
      bodyType: "Solid",
      pickups: "Single Coil",
      pickupConfig: "SSS",
      bridgeType: "Tremolo",
      fretboard: "Rosewood",
      finish: "Gloss",
    })

    // Flip both sale + trade on so the Trade Interests sidebar exercises too.
    setForSaleActive(true)
    setForTradeActive(true)
    setInCollectionActive(false)
    setIsWishlistActive(false)
    setHasSelectedStatus(true)
    setShowNormalFields(true)

    setSaleData({
      active: true,
      price: 28500,
      paymentMethods: ["Cash", "PayPal - Goods and Services", "Bank transfer"],
      localPickup: true,
      pickupZip: "11201",
      shippingAvailable: true,
      shippingCost: 120,
      returnPolicy: "3-day approval window. Buyer covers return shipping.",
      publishTo: ["marketplace"],
    })

    setTradeData({
      active: true,
      estimatedValue: 28500,
      interests: null,
      interestsData: {
        mode: "simple",
        simpleText:
          "Interested in pre-CBS Fenders, late-50s Gibsons, or a clean Dumble-style amp. Open to partial trade + cash on my end.",
        advanced: [],
      },
      paymentMethods: ["Cash", "PayPal - Goods and Services"],
      localPickup: true,
      pickupZip: "11201",
      shippingAvailable: true,
      shippingCost: 120,
      returnPolicy: "3-day approval window on the trade. Buyer covers return shipping.",
      publishTo: ["marketplace"],
    })

    // Wipe any stale suggestion/error chrome so the filled form looks clean.
    setSuggestions({})
    setEnhanceError(null)
    setShowMissingError(false)
    setSpecsOpen(true)
  }

  /**
   * Desktop "Add Item" now opens the Publish Confirm Screen — a dedicated
   * preview + trade-interest finalization step — instead of publishing
   * directly. Mobile wizard handles the stage transition internally (step
   * 5 → step 6 for trade flows), and only calls `handleConfirmPublish`
   * once the user is actually ready.
   */
  const handleOpenPublishConfirm = () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/create-listing')
      return
    }
    if (!canPublish()) {
      setShowMissingError(true)
      return
    }
    setShowMissingError(false)
    setPublishStage("confirm")
  }

  /** Constructs the summary shape the Publish Confirm Screen renders, so the
   * preview column reflects the exact state of the form at this moment. */
  const buildPublishSummary = (): PublishConfirmListingSummary => {
    const resolvedSpecs = allSpecs
      .map((s) => ({ label: s.label, value: getSpec(s.key) }))
      .filter((s) => s.value.trim().length > 0)

    const conditionGradeLabels: Record<string, string> = {
      new: "New",
      "used-as-new": "Used — As New",
      used: "Used",
      "used-as-is": "Used — As Is",
    }

    const statusChips: PublishConfirmListingSummary["statusChips"] = []
    if (forSaleActive) statusChips.push({ key: "sale", label: "For Sale", tone: "sale" })
    if (forTradeActive) statusChips.push({ key: "trade", label: "For Trade", tone: "trade" })
    if (inCollectionActive)
      statusChips.push({ key: "collection", label: "In Collection", tone: "collection" })
    if (isWishlistActive)
      statusChips.push({
        key: "wishlist",
        label: wishlistData.isPublic ? "Public Wishlist" : "Private Wishlist",
        tone: "wishlist",
      })

    return {
      title,
      subtitle,
      description,
      price: forSaleActive ? saleData.price : null,
      estimatedTradeValue: forTradeActive ? tradeData.estimatedValue : null,
      images,
      category,
      subcategory,
      conditionGradeLabel: conditionGrade ? conditionGradeLabels[conditionGrade] : null,
      conditionNote: condition,
      specs: resolvedSpecs,
      statusChips,
      paymentMethods: forSaleActive
        ? saleData.paymentMethods
        : forTradeActive
          ? tradeData.paymentMethods
          : [],
      localPickup: forSaleActive ? saleData.localPickup : forTradeActive ? tradeData.localPickup : false,
      pickupZip: forSaleActive ? saleData.pickupZip : forTradeActive ? tradeData.pickupZip : null,
      shippingAvailable: forSaleActive
        ? saleData.shippingAvailable
        : forTradeActive
          ? tradeData.shippingAvailable
          : false,
      shippingCost: forSaleActive
        ? saleData.shippingCost
        : forTradeActive
          ? tradeData.shippingCost
          : null,
      returnPolicy: forSaleActive
        ? saleData.returnPolicy
        : forTradeActive
          ? tradeData.returnPolicy
          : null,
      /* The confirm screen renders the real ListingDetailView for the
       * preview, which needs a full seller identity. Wiring it from
       * currentUser keeps the preview consistent with what the published
       * page would show. */
      seller: {
        id: `viewer-${currentUser.username}`,
        username: currentUser.username,
        displayName: currentUser.displayName,
        avatarUrl: currentUser.avatarUrl,
        location: "Brooklyn, NY",
        joinedYear: 2021,
        ratingAverage: 4.9,
        ratingCount: 142,
        profileHref: currentUser.profileHref,
      },
    }
  }

  const handleCancelPublishConfirm = () => {
    setPublishStage("form")
  }

  /* Actually publish — persist the draft to sessionStorage so the
   * `/listings/just-published` page can render the user's item, then route
   * there. This is the terminal step of the create flow across both
   * breakpoints.
   *
   * Before saving, run mandatory AI structuring: if the user authored
   * their trade interest in simple (free-text) mode, parse it into
   * structured category / subcategory / spec cards so the search index
   * has something to match on. The AI call is transparent — the user's
   * own prose remains the `simple` source of truth; the structured items
   * are stored alongside it for indexing only. */
  const handleConfirmPublish = async () => {
    if (!canPublish()) {
      setShowMissingError(true)
      setPublishStage("form")
      return
    }

    /* Mandatory pre-publish structuring for free-text trade interests.
     * We only call the parser when the user is on For Trade with simple
     * text authored and no structured items yet — the common "fast
     * authoring" path. Failures here are non-fatal; we still publish
     * even if the AI call bombs, because blocking publish on an
     * infrastructure hiccup would be worse UX than a listing that
     * indexes on raw text alone. */
    let structuredForIndex: TradeInterestItem[] = []
    if (forTradeActive && tradeData.interestsData) {
      const d = tradeData.interestsData
      const needsStructuring =
        d.mode === "simple" &&
        d.simpleText.trim().length > 0 &&
        d.advanced.length === 0
      if (needsStructuring) {
        setIsPublishing(true)
        try {
          structuredForIndex = await parseSimpleToAdvanced(d.simpleText)
        } catch (err) {
          console.error("[v0] Trade interest structuring failed:", err)
        } finally {
          setIsPublishing(false)
        }
      } else if (d.mode === "advanced") {
        structuredForIndex = d.advanced
      }
    }

    /* Snapshot the resolved spec entries. We only persist specs with a
     * value so the published preview stays clean. */
    const resolvedSpecs = allSpecs
      .map((s) => ({ label: s.label, value: getSpec(s.key) }))
      .filter((s) => s.value.trim().length > 0)

    const paymentMethods = forTradeActive
      ? tradeData.paymentMethods
      : forSaleActive
        ? saleData.paymentMethods
        : []

    const localPickup = forSaleActive
      ? saleData.localPickup
      : forTradeActive
        ? tradeData.localPickup
        : false
    const pickupZip = forSaleActive
      ? saleData.pickupZip
      : forTradeActive
        ? tradeData.pickupZip
        : null
    const shippingAvailable = forSaleActive
      ? saleData.shippingAvailable
      : forTradeActive
        ? tradeData.shippingAvailable
        : false
    const shippingCost = forSaleActive
      ? saleData.shippingCost
      : forTradeActive
        ? tradeData.shippingCost
        : null
    const returnPolicy = forSaleActive
      ? saleData.returnPolicy
      : forTradeActive
        ? tradeData.returnPolicy
        : null

    /* Serialize trade interest into the MockTradeInterest shape the detail
     * view renders. If the user authored in simple mode, we keep the text
     * as the display source of truth (collectors see the user's prose)
     * and stash any AI-derived structured items on the listing record
     * below for search indexing — they don't drive the rendered view. */
    const tradeInterestSnapshot = (() => {
      if (!forTradeActive) return null
      const d = tradeData.interestsData
      if (!d) return null
      if (d.mode === "advanced" && d.advanced.length > 0) {
        return {
          mode: "structured" as const,
          items: d.advanced.map((item) => ({
            id: item.id,
            label:
              [item.brand, item.model].filter(Boolean).join(" ") ||
              [item.category, item.subcategory].filter(Boolean).join(" · ") ||
              "Open trade",
            notes: item.notes || undefined,
          })),
        }
      }
      if (d.simpleText.trim().length > 0) {
        return { mode: "simple" as const, text: d.simpleText.trim() }
      }
      return null
    })()

    /* Log the AI-derived structured items so downstream tools can pick
     * them up. In a real backend this would ship as a separate
     * `search_index` payload adjacent to the listing record. */
    if (structuredForIndex.length > 0) {
      console.log(
        "[v0] Trade interest indexed via AI:",
        structuredForIndex.map((item) => ({
          category: item.category,
          subcategory: item.subcategory,
          specs: item.specs,
        })),
      )
    }

    saveDraft({
      images,
      category,
      subcategory,
      title,
      subtitle,
      description,
      condition,
      conditionGrade,
      specs: resolvedSpecs,
      forSaleActive,
      forTradeActive,
      inCollectionActive,
      isWishlistActive,
      price: forSaleActive ? saleData.price : null,
      estimatedTradeValue: forTradeActive ? tradeData.estimatedValue : null,
      paymentMethods,
      localPickup,
      pickupZip,
      shippingAvailable,
      shippingCost,
      returnPolicy,
      tradeInterestFreeText: forTradeActive ? tradeData.interests : null,
      tradeInterest: tradeInterestSnapshot,
      seller: {
        id: `viewer-${currentUser.username}`,
        username: currentUser.username,
        displayName: currentUser.displayName,
        avatarUrl: currentUser.avatarUrl,
        location: "Your city",
        joinedYear: new Date().getFullYear(),
        ratingAverage: 5,
        ratingCount: 0,
        profileHref: currentUser.profileHref,
      },
      savedAt: Date.now(),
    })

    router.push("/listings/just-published")
  }

  // Frontend-only mock AI enhance
  const handleEnhance = async () => {
    if (!canEnhance) return
    setIsEnhancing(true)
    setEnhanceError(null)
    try {
      await new Promise((r) => setTimeout(r, 1400))
      const newSuggestions: Record<string, Suggestion> = {}
      if (!description) {
        newSuggestions.description = {
          value: `A well-maintained ${title} in the ${category.toLowerCase()} category. Includes typical ${subcategory.toLowerCase()} features and pairs well with common setups.`,
          confidence: "medium",
          accepted: false,
        }
      }
      if (!condition) {
        newSuggestions.condition = {
          value: "Good condition with minor cosmetic wear consistent with normal use.",
          confidence: "medium",
          accepted: false,
        }
      }
      if (!brand) newSuggestions.brand = { value: "Unbranded", confidence: "low", accepted: false }
      if (!year) newSuggestions.year = { value: "2020", confidence: "low", accepted: false }
      if (!color) newSuggestions.color = { value: "Sunburst", confidence: "medium", accepted: false }
      setSuggestions(newSuggestions)
    } catch (err) {
      console.error("[v0] Enhancement error:", err)
      setEnhanceError("Unable to enhance listing. Please try again.")
    } finally {
      setIsEnhancing(false)
    }
  }

  const acceptSuggestion = (field: string) => {
    const s = suggestions[field]
    if (!s) return
    switch (field) {
      case "description": setDescription(s.value); break
      case "condition": setCondition(s.value); break
      case "brand": setBrand(s.value); break
      case "year": setYear(s.value); break
      case "color": setColor(s.value); break
      case "subtitle": setSubtitle(s.value); break
      case "title": setTitle(s.value); break
    }
    setSuggestions((p) => ({ ...p, [field]: { ...p[field], accepted: true } }))
  }

  const acceptAllSuggestions = () => {
    Object.keys(suggestions).forEach((f) => {
      if (!suggestions[f].accepted) acceptSuggestion(f)
    })
  }

  const hasPendingSuggestions = Object.values(suggestions).some((s) => !s.accepted)

  type PublishStatus = {
    label: string
    tone: "warning" | "info" | "success"
    Icon: React.ComponentType<{ className?: string }>
    message: string
    subMessage?: string
  }

  const getPublishStatus = (): PublishStatus => {
    // Wishlist is mutually exclusive with ownership statuses.
    if (isWishlistActive) {
      const isPublic = wishlistData.isPublic
      return {
        label: "Add to Wishlist",
        tone: "info",
        Icon: isPublic ? Eye : Lock,
        message: isPublic
          ? "Added to your public wishlist — visible to other collectors."
          : "Added to your private wishlist — only visible to you.",
      }
    }

    const nothingSelected = !forSaleActive && !forTradeActive && !inCollectionActive
    if (nothingSelected) {
      return {
        label: "Add Item",
        tone: "warning",
        Icon: AlertCircle,
        message: "No item status selected.",
        subMessage: "Item will be added to your stuff but won't be visible to other users.",
      }
    }

    // At least one of: For Sale, For Trade, In Collection.
    const parts: string[] = []
    if (inCollectionActive) parts.push("saved to your collection")
    if (forSaleActive) parts.push("visible for sale")
    if (forTradeActive) parts.push("open to trade offers")

    const joined =
      parts.length === 1
        ? parts[0]
        : parts.length === 2
          ? `${parts[0]} and ${parts[1]}`
          : `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`

    const collectionOnly = inCollectionActive && !forSaleActive && !forTradeActive

    return {
      label: "Add Item",
      tone: "success",
      Icon: collectionOnly ? Lock : Eye,
      message: joined.charAt(0).toUpperCase() + joined.slice(1) + ".",
      subMessage: forTradeActive
        ? "You'll set trade interests in the next step."
        : collectionOnly
          ? "Only visible to you."
          : undefined,
    }
  }

  const handleWishlistUrlProcessed = (data: {
    title: string
    subtitle?: string
    description?: string
    sourceUrl?: string
    specifications?: Record<string, string>
    imageUrl?: string
  }) => {
    if (data.title) setTitle(data.title)
    if (data.subtitle) setSubtitle(data.subtitle)
    if (data.description) setDescription(data.description)
    if (data.specifications?.brand) setBrand(data.specifications.brand)
    if (data.specifications?.color) setColor(data.specifications.color)
    if (data.specifications?.year) setYear(data.specifications.year)
    if (data.imageUrl) setImages([data.imageUrl])
    setWishlistData((prev) => ({ ...prev, sourceUrl: data.sourceUrl || null }))
    setShowNormalFields(true)
  }

  const handleForSaleChange = (a: boolean) => {
    setForSaleActive(a)
    setSaleData((p) => ({ ...p, active: a }))
    setHasSelectedStatus(true)
    if (a) handleFieldsVisible("For Sale")
  }
  const handleForTradeChange = (a: boolean) => {
    setForTradeActive(a)
    setTradeData((p) => ({ ...p, active: a }))
    setHasSelectedStatus(true)
    if (a) handleFieldsVisible("For Trade")
  }
  const handleInCollectionChange = (a: boolean) => {
    setInCollectionActive(a)
    setCollectionData((p) => ({ ...p, active: a }))
    setHasSelectedStatus(true)
    if (a) handleFieldsVisible("Collection")
  }

  return (
    <TooltipProvider>
      <OnboardingTooltip steps={onboardingSteps} storageKey="create-listing-onboarding-complete" />

      {/* Mobile wizard — fixed full-screen overlay, auto-hidden on md+ */}
      <MobileCreateListingWizard
        images={images}
        setImages={setImages}
        category={category}
        setCategory={setCategory}
        subcategory={subcategory}
        setSubcategory={setSubcategory}
        title={title}
        setTitle={setTitle}
        subtitle={subtitle}
        setSubtitle={setSubtitle}
        description={description}
        setDescription={setDescription}
        condition={condition}
        setCondition={setCondition}
        conditionGrade={conditionGrade}
        setConditionGrade={setConditionGrade}
        getSpec={getSpec}
        setSpec={setSpec}
        forSaleActive={forSaleActive}
        forTradeActive={forTradeActive}
        inCollectionActive={inCollectionActive}
        isWishlistActive={isWishlistActive}
        onForSaleChange={handleForSaleChange}
        onForTradeChange={handleForTradeChange}
        onInCollectionChange={handleInCollectionChange}
        onWishlistChange={handleWishlistChange}
        hasSelectedStatus={hasSelectedStatus}
        saleData={saleData}
        setSaleData={setSaleData}
        tradeData={tradeData}
        setTradeData={setTradeData}
        collectionData={collectionData}
        setCollectionData={setCollectionData}
        wishlistData={wishlistData}
        setWishlistData={setWishlistData}
        userCollections={userCollections}
        wishlistEntryMethod={wishlistEntryMethod}
        setWishlistEntryMethod={setWishlistEntryMethod}
        onWishlistUrlProcessed={handleWishlistUrlProcessed}
        suggestions={suggestions}
        onAcceptSuggestion={acceptSuggestion}
        onAcceptAllSuggestions={acceptAllSuggestions}
        hasPendingSuggestions={hasPendingSuggestions}
        onEnhance={handleEnhance}
        canEnhance={canEnhance}
        isEnhancing={isEnhancing}
        enhanceError={enhanceError}
        enhanceFillPercentage={fillPercentage}
        enhanceRequirements={enhanceRequirements}
            onPublish={handleConfirmPublish}
            publishing={isPublishing}
        canPublish={canPublish()}
        missingRequirements={getMissingRequirements()}
        onAutofill={handleAutofill}
        sellerUsername={currentUser.displayName}
        sellerAvatarUrl={currentUser.avatarUrl}
      />

      <div id="create-listing-top" className="hidden md:block px-4 py-6 md:px-6 lg:px-8">
        <div className="flex flex-col gap-4 mb-4">
          {/* Row 1: page title + action buttons */}
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-foreground">Add Item</h1>
            <div className="flex gap-2 sm:gap-3">
              <div data-onboarding="ai-assist">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        variant="quiet_outline"
                        onClick={handleEnhance}
                        disabled={!canEnhance || isEnhancing}
                        className={cn(
                          "gap-2 transition-all duration-300 min-w-[140px] relative overflow-hidden",
                          canEnhance && !isEnhancing && "border-primary/60 text-primary hover:bg-primary/10",
                        )}
                      >
                        {!canEnhance && fillPercentage > 0 && (
                          <div
                            className="absolute inset-0 bg-primary/15 transition-all duration-500 ease-out"
                            style={{ width: `${fillPercentage}%` }}
                          />
                        )}
                        <span className="flex items-center gap-2 relative z-10">
                          {isEnhancing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                          AI Assist
                        </span>
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-card border border-border text-foreground">
                    <div className="text-sm space-y-1">
                      <p className="font-medium mb-1.5">Requirements:</p>
                      {[
                        { label: "Title + Subtitle", met: !!title && !!subtitle },
                        { label: "At least 1 photo", met: images.length > 0 },
                      ].map(({ label, met }) => (
                        <div key={label} className="flex items-center gap-2">
                          <Check className={cn("h-3.5 w-3.5", met ? "text-primary" : "text-muted-foreground")} />
                          <span className={cn(met ? "text-foreground" : "text-muted-foreground")}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Publish actions — desktop only; mobile uses the sticky bottom bar.
                  "Add Item" now opens the Publish Confirm Screen overlay rather
                  than publishing directly, per the flow redesign. */}
              <Button variant="quiet_outline" className="hidden lg:inline-flex">
                Save Draft
              </Button>
              <Button
                onClick={handleOpenPublishConfirm}
                className="hidden lg:inline-flex group"
              >
                {getPublishStatus().label}
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          </div>

          {/* Row 2: status selector */}
          <div data-onboarding="status" className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-muted-foreground">Status</span>
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
              {statusFieldsAdded && (
                <>
                  <span
                    className={cn(
                      "flex items-center gap-1 font-medium",
                      statusFieldsAdded === "For Sale" && "text-emerald-400",
                      statusFieldsAdded === "For Trade" && "text-sky-400",
                      statusFieldsAdded === "Collection" && "text-primary",
                      statusFieldsAdded === "Wishlist" && "text-rose-400",
                    )}
                  >
                    <span>•</span>
                    <span>{statusFieldsAdded}</span>
                  </span>
                  <span className="text-foreground">
                    fields added
                    {statusFieldsAdded === "For Trade" && " – you'll set interests in the next step"}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusSelector
                size="md"
                forSale={forSaleActive}
                forTrade={forTradeActive}
                inCollection={inCollectionActive}
                isWishlist={isWishlistActive}
                onForSaleChange={handleForSaleChange}
                onForTradeChange={handleForTradeChange}
                onInCollectionChange={handleInCollectionChange}
                onWishlistChange={handleWishlistChange}
              />
              {initialCollectionName && (
                <span className="text-xs text-muted-foreground border border-border rounded-md px-2 py-0.5">
                  to {initialCollectionName}
                </span>
              )}
            </div>
          </div>

          {/* Missing-requirements error — only surfaces after a failed publish attempt,
              sits flush right so it appears directly under the Add Item button. */}
          {showMissingError && getMissingRequirements().length > 0 && (
            <p className="hidden lg:block text-xs text-status-warning text-right leading-snug -mt-2">
              Missing: {getMissingRequirements().join(" · ")}
            </p>
          )}

        </div>

        {hasPendingSuggestions && (
          <div className="mb-4 bg-primary/10 border border-primary/30 rounded-lg p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground text-sm">
                  AI has suggested some details for your listing
                </p>
                <p className="text-xs text-muted-foreground">
                  Review the highlighted fields below and accept the ones you like.
                </p>
              </div>
            </div>
            <Button onClick={acceptAllSuggestions} size="sm">
              Accept All
            </Button>
          </div>
        )}

        {enhanceError && (
          <div className="mb-4 bg-destructive/10 border border-destructive/30 rounded-lg p-3">
            <p className="text-destructive text-sm">{enhanceError}</p>
          </div>
        )}

        {/* Category */}
        {(!isWishlistActive || (wishlistEntryMethod !== null && showNormalFields)) && (
          <div className="mb-4" data-onboarding="category">
            <div className={cn("rounded-lg", currentStep === "category" && "ring-2 ring-primary")}>
              <CategorySelector
                category={category}
                subcategory={subcategory}
                onCategoryChange={setCategory}
                onSubcategoryChange={setSubcategory}
              />
            </div>
          </div>
        )}

        {/* Wishlist entry selector (before normal fields) */}
        {isWishlistActive && wishlistEntryMethod === null && (
          <div className="grid lg:grid-cols-2 gap-4 mb-4">
            <div>
              <WishlistEntrySelector
                onMethodSelected={(method) => {
                  setWishlistEntryMethod(method)
                  if (method === "manual") setShowNormalFields(true)
                }}
                onUrlProcessed={handleWishlistUrlProcessed}
              />
            </div>
            {inCollectionActive && (
              <div>
                <CollectionFields
                  data={collectionData}
                  onChange={setCollectionData}
                  isActive={inCollectionActive}
                  collections={userCollections}
                  isWishlistMode
                />
              </div>
            )}
          </div>
        )}

        {/* Main columns */}
        {(!isWishlistActive || (wishlistEntryMethod !== null && showNormalFields)) && (
          <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 items-start">
            {/* Left column */}
            <div className="space-y-4 order-2 lg:order-1 w-full">
              {/* Title + subtitle + price */}
              <div
                data-section="title"
                className={cn(
                  "bg-card rounded-lg border p-4 md:p-5 transition-all",
                  currentStep === "title" || currentStep === "subtitle"
                    ? "ring-2 ring-primary border-border"
                    : "border-border",
                )}
                onFocusCapture={() => setActiveSection("title")}
                onBlurCapture={() => {
                  if (!document.activeElement || !document.activeElement.closest('[data-section="title"]')) {
                    setActiveSection(null)
                  }
                }}
              >
                <div className="space-y-3">
                  <InlineInput
                    value={title}
                    onChange={setTitle}
                    placeholder="Enter item title"
                    inputClassName="text-2xl md:text-3xl font-bold"
                    suggestion={suggestions.title}
                    onAcceptSuggestion={() => acceptSuggestion("title")}
                  />
                  <InlineInput
                    value={subtitle}
                    onChange={setSubtitle}
                    placeholder="Subtitle (e.g., color, year, variant)"
                    inputClassName="text-muted-foreground"
                    suggestion={suggestions.subtitle}
                    onAcceptSuggestion={() => acceptSuggestion("subtitle")}
                  />

                  {forSaleActive && (
                    <div className="pt-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl md:text-4xl font-bold text-primary">$</span>
                        <input
                          type="text"
                          value={saleData.price ?? ""}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, "")
                            setSaleData((p) => ({ ...p, price: val ? Number(val) : null }))
                          }}
                          placeholder="0"
                          className="bg-transparent outline-none text-3xl md:text-4xl font-bold text-primary placeholder:text-primary/40 w-32 transition-colors focus:bg-primary/5 px-2 -mx-2 rounded-md"
                        />
                      </div>
                    </div>
                  )}

                </div>
              </div>

              <div data-onboarding="profile">
                <SellerProfilePreview
                  profile={{
                    id: "user-123",
                    username: currentUser.displayName,
                    avatar_url: currentUser.avatarUrl,
                    location: "San Francisco, CA",
                    created_at: new Date().toISOString(),
                    bio: "Collector and player. Into vintage gear.",
                    total_listings: 1,
                    total_collections: 0,
                  }}
                />
              </div>

              {/* Description */}
              <div
                data-section="description"
                className={cn(
                  "bg-card rounded-lg border p-4 md:p-5 transition-all",
                  currentStep === "description" ? "ring-2 ring-primary border-border" : "border-border",
                )}
                onFocusCapture={() => setActiveSection("description")}
                onBlurCapture={() => {
                  if (!document.activeElement || !document.activeElement.closest('[data-section="description"]')) {
                    setActiveSection(null)
                  }
                }}
              >
                <h2 className="text-sm font-semibold mb-3">Description</h2>
                <InlineInput
                  as="textarea"
                  value={description}
                  onChange={setDescription}
                  placeholder="Describe your item in detail..."
                  suggestion={suggestions.description}
                  onAcceptSuggestion={() => acceptSuggestion("description")}
                />
              </div>

              {/* Condition — only shown for items you own, list, or trade (not pure wishlist entries) */}
              {(forSaleActive || forTradeActive || inCollectionActive) && (
                <div
                  data-section="condition"
                  className={cn(
                    "bg-card rounded-lg border p-4 md:p-5 transition-all",
                    currentStep === "condition" ? "ring-2 ring-primary border-border" : "border-border",
                  )}
                  onFocusCapture={() => setActiveSection("condition")}
                  onBlurCapture={() => {
                    if (!document.activeElement || !document.activeElement.closest('[data-section="condition"]')) {
                      setActiveSection(null)
                    }
                  }}
                >
                  <h2 className="text-sm font-semibold mb-3">Condition</h2>
                  <div className="mb-2">
                    <ConditionGradePicker value={conditionGrade} onChange={setConditionGrade} />
                  </div>
                  <InlineInput
                    as="textarea"
                    value={condition}
                    onChange={setCondition}
                    placeholder={
                      conditionGrade
                        ? "Add notes on wear, packaging, quirks..."
                        : "Pick a grade above, then add notes on wear, packaging, quirks..."
                    }
                    suggestion={suggestions.condition}
                    onAcceptSuggestion={() => acceptSuggestion("condition")}
                  />
                </div>
              )}

              {/* Specs — auto-opens when focused; all category/sub-category fields rendered and tab-able in order */}
              <div onFocusCapture={() => setSpecsOpen(true)}>
                <CollapsibleSection title="Specifications" isOpen={specsOpen} onToggle={setSpecsOpen}>
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    {allSpecs.map((spec) => (
                      <InlineSpecInput
                        key={spec.key}
                        label={spec.label}
                        value={getSpec(spec.key)}
                        onChange={(v) => setSpec(spec.key, v)}
                        suggestion={suggestions[spec.key]}
                        onAcceptSuggestion={() => acceptSuggestion(spec.key)}
                        inputRef={
                          spec.key === "brand"
                            ? brandInputRef
                            : spec.key === "year"
                              ? yearInputRef
                              : spec.key === "color"
                                ? colorInputRef
                                : spec.key === "handedness"
                                  ? handednessInputRef
                                  : undefined
                        }
                      />
                    ))}
                  </div>
                </CollapsibleSection>
              </div>
            </div>

            {/* Right column */}
            <div className="order-1 lg:order-2 space-y-4 w-full">
              {/* Photos */}
              <div
                data-section
                data-onboarding="photos"
                className={cn(
                  "bg-card rounded-lg border p-4 transition-all",
                  currentStep === "photos" ? "ring-2 ring-primary border-border" : "border-border",
                )}
              >
                <PhotoUploadSection
                  images={images}
                  onImagesChange={setImages}
                  isHighlighted={currentStep === "photos" && images.length === 0}
                />
              </div>

              {/* Sale / Trade fields */}
              {(forSaleActive || forTradeActive) && (
                <div className="bg-card rounded-lg border border-border p-4 space-y-5">
                  {/* Payment */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-3">
                      <h3 className="text-sm font-semibold">Payment</h3>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            aria-label="Save time with default values"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Info className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-[260px] p-3">
                          <p className="text-xs leading-relaxed mb-2">
                            Save time by setting defaults for payment methods, logistics, and return
                            policy. They&apos;ll pre-fill on every new listing.
                          </p>
                          <Link
                            href="/profile/settings"
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            Go to Profile settings →
                          </Link>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="space-y-2.5">
                      {[
                        "Cash",
                        "PayPal - Friends and Family",
                        "PayPal - Goods and Services",
                        "Venmo",
                        "Cryptocurrency",
                        "Other",
                      ].map((method) => {
                        const checked =
                          saleData.paymentMethods.includes(method) ||
                          tradeData.paymentMethods.includes(method)
                        return (
                          <label key={method} className="flex items-center gap-3 cursor-pointer group">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(c) => {
                                const update = (arr: string[]) =>
                                  c ? [...arr, method] : arr.filter((m) => m !== method)
                                if (forSaleActive)
                                  setSaleData((p) => ({ ...p, paymentMethods: update(p.paymentMethods) }))
                                if (forTradeActive)
                                  setTradeData((p) => ({ ...p, paymentMethods: update(p.paymentMethods) }))
                              }}
                            />
                            <span
                              className={cn(
                                "text-sm transition-colors",
                                checked ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
                              )}
                            >
                              {method}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  {/* Logistics */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Logistics</h3>
                    <div className="space-y-2">
                      <div className="flex items-center flex-wrap gap-3">
                        <Checkbox
                          checked={saleData.localPickup || tradeData.localPickup}
                          onCheckedChange={(c) => {
                            if (forSaleActive) setSaleData((p) => ({ ...p, localPickup: !!c }))
                            if (forTradeActive) setTradeData((p) => ({ ...p, localPickup: !!c }))
                          }}
                        />
                        <Package
                          className={cn(
                            "h-4 w-4",
                            saleData.localPickup || tradeData.localPickup ? "text-primary" : "text-muted-foreground",
                          )}
                        />
                        <span
                          className={cn(
                            "text-sm",
                            saleData.localPickup || tradeData.localPickup ? "text-foreground" : "text-muted-foreground",
                          )}
                        >
                          Local Pickup
                        </span>
                        {(saleData.localPickup || tradeData.localPickup) && (
                          <div className="flex items-center gap-2 ml-2">
                            <span className="text-xs text-muted-foreground">Zip:</span>
                            <Input
                              value={saleData.pickupZip || tradeData.pickupZip || ""}
                              onChange={(e) => {
                                if (forSaleActive)
                                  setSaleData((p) => ({ ...p, pickupZip: e.target.value || null }))
                                if (forTradeActive)
                                  setTradeData((p) => ({ ...p, pickupZip: e.target.value || null }))
                              }}
                              className="w-[100px] h-8 text-sm"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center flex-wrap gap-3">
                        <Checkbox
                          checked={saleData.shippingAvailable || tradeData.shippingAvailable}
                          onCheckedChange={(c) => {
                            if (forSaleActive) setSaleData((p) => ({ ...p, shippingAvailable: !!c }))
                            if (forTradeActive) setTradeData((p) => ({ ...p, shippingAvailable: !!c }))
                          }}
                        />
                        <Truck
                          className={cn(
                            "h-4 w-4",
                            saleData.shippingAvailable || tradeData.shippingAvailable
                              ? "text-primary"
                              : "text-muted-foreground",
                          )}
                        />
                        <span
                          className={cn(
                            "text-sm",
                            saleData.shippingAvailable || tradeData.shippingAvailable
                              ? "text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          Shipping
                        </span>
                        {(saleData.shippingAvailable || tradeData.shippingAvailable) && (
                          <div className="flex items-center gap-2 ml-2">
                            <span className="text-xs text-muted-foreground">$</span>
                            <Input
                              type="number"
                              placeholder="0.00"
                              step="0.01"
                              value={saleData.shippingCost ?? tradeData.shippingCost ?? ""}
                              onChange={(e) => {
                                const cost = e.target.value ? Number.parseFloat(e.target.value) : null
                                if (forSaleActive) setSaleData((p) => ({ ...p, shippingCost: cost }))
                                if (forTradeActive) setTradeData((p) => ({ ...p, shippingCost: cost }))
                              }}
                              className="w-[100px] h-8 text-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Return Policy */}
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Return Policy</h3>
                    <AutoGrowTextarea
                      value={saleData.returnPolicy || tradeData.returnPolicy || ""}
                      onChange={(v) => {
                        if (forSaleActive)
                          setSaleData((p) => ({ ...p, returnPolicy: v || null }))
                        if (forTradeActive)
                          setTradeData((p) => ({ ...p, returnPolicy: v || null }))
                      }}
                      placeholder="Describe your return policy, if any..."
                      minRows={2}
                      className="w-full bg-card rounded-lg border border-border px-3 py-2 text-sm resize-none text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                    />
                  </div>

                  {/* Publish To */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Publish To</h3>
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={
                            saleData.publishTo.includes("marketplace") ||
                            tradeData.publishTo.includes("marketplace")
                          }
                          onCheckedChange={(c) => {
                            const update = (arr: string[]) =>
                              c
                                ? arr.includes("marketplace") ? arr : [...arr, "marketplace"]
                                : arr.filter((p) => p !== "marketplace")
                            if (forSaleActive) setSaleData((p) => ({ ...p, publishTo: update(p.publishTo) }))
                            if (forTradeActive) setTradeData((p) => ({ ...p, publishTo: update(p.publishTo) }))
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">General Niche</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="text-muted-foreground hover:text-foreground">
                                <Info className="h-3.5 w-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-[220px] p-2">
                              <p className="text-xs">
                                Publishing to the General Niche makes your listing visible to everyone in this niche.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* Trade Interest used to mount inline below Terms; it has been
                  moved into the dedicated Publish Confirm Screen so the main
                  form focuses on *describing the item* and the finalization
                  stage owns *trade preferences + publish*. If the item is
                  For Trade, we surface a compact hint instead so users know
                  the step is still coming. */}
              {forTradeActive && (
                <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-3 flex items-start gap-3">
                  <Repeat2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      Trade preferences come next
                    </p>
                    <p className="text-xs text-muted-foreground leading-snug">
                      You&apos;ll tell us what you&apos;d accept in trade
                      after tapping <strong className="text-foreground">Add Item</strong>.
                    </p>
                  </div>
                </div>
              )}

              {/* Collection (non-wishlist flow) */}
              {!isWishlistActive && (
                <CollectionFields
                  data={collectionData}
                  onChange={setCollectionData}
                  isActive={inCollectionActive}
                  collections={userCollections}
                  onFieldsVisible={() => handleFieldsVisible("Collection")}
                />
              )}

              {/* Wishlist details */}
              <WishlistFields data={wishlistData} onChange={setWishlistData} isActive={isWishlistActive} />
            </div>
          </div>
        )}

        {/* Bottom "scroll up to publish" nudge — minimal, desktop only. The actual
            publish actions live in the top-right header so the status selector pills
            right beneath them act as the visual reference for what's about to happen. */}
        {(!isWishlistActive || (wishlistEntryMethod !== null && showNormalFields)) && (
          <div className="mt-8 hidden lg:flex justify-center">
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("create-listing-top")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
              Back to top to {getPublishStatus().label.toLowerCase()}
            </button>
          </div>
        )}

        {/* Mobile sticky actions — compact status + action buttons */}
        <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-card/95 backdrop-blur-sm border-t border-border z-40">
          {(() => {
            const status = getPublishStatus()
            const missing = getMissingRequirements()
            const selectedCollection = userCollections.find(
              (c) => c.id === collectionData.collectionId,
            )
            return (
              <>
                <div className="px-3 pt-2 pb-1">
                  <PublishStatusChips
                    forSaleActive={forSaleActive}
                    forTradeActive={forTradeActive}
                    inCollectionActive={inCollectionActive}
                    isWishlistActive={isWishlistActive}
                    wishlistIsPublic={!!wishlistData.isPublic}
                    collectionName={selectedCollection?.name}
                    compact
                  />
                </div>
                <div className="p-3 flex gap-2">
                  <Button variant="ghost" className="flex-1 text-muted-foreground">
                    Save Draft
                  </Button>
                  <Button onClick={handleOpenPublishConfirm} className="flex-1">
                    {status.label}
                  </Button>
                </div>
                {showMissingError && missing.length > 0 && (
                  <p className="px-3 pb-2 text-xs text-status-warning truncate">
                    Still needed: {missing.join(", ")}
                  </p>
                )}
              </>
            )
          })()}
        </div>
        <div className="lg:hidden h-24" />
      </div>

      {/* Publish Confirm Screen.
          Desktop-only overlay that finalizes the listing: shows how the
          item will appear once published (left), lets the user author trade
          interests (right, when For Trade is on) and publishes on confirm.
          Mobile wizard handles the equivalent screen internally as its
          Step 6, so we gate this overlay to md+ breakpoints via `hidden md:block`.
          */}
      {publishStage === "confirm" && (
        /* The PublishConfirmScreen is itself breakpoint-gated (desktop
           variant uses `hidden md:flex`), so we don't need another wrapper.
           Mobile users never reach "confirm" — the wizard owns its own
           step-6 overlay on small screens. */
        <PublishConfirmScreen
          variant="desktop"
          summary={buildPublishSummary()}
          publishing={isPublishing}
          /* When the listing isn't For Trade the editor column is
             suppressed entirely — the right side collapses to a simple
             publish confirmation. */
          trade={
            forTradeActive
              ? {
                  value: tradeData.interestsData ?? emptyTradeInterest,
                  onChange: (next) =>
                    setTradeData((p) => ({ ...p, interestsData: next })),
                }
              : null
          }
          onBack={handleCancelPublishConfirm}
          onConfirm={handleConfirmPublish}
        />
      )}
    </TooltipProvider>
  )
}

// Color-coded summary of what will happen when the user submits.
// Palette matches the StatusSelector chips so users can associate the chip
// color with the corresponding status they picked up top.
function PublishStatusChips({
  forSaleActive,
  forTradeActive,
  inCollectionActive,
  isWishlistActive,
  wishlistIsPublic,
  collectionName,
  compact = false,
  stacked = false,
}: {
  forSaleActive: boolean
  forTradeActive: boolean
  inCollectionActive: boolean
  isWishlistActive: boolean
  wishlistIsPublic: boolean
  collectionName?: string | null
  compact?: boolean
  stacked?: boolean
}) {
  type Chip = {
    key: string
    label: string
    tone: string
    Icon?: React.ComponentType<{ className?: string }>
  }
  const chips: Chip[] = []

  if (isWishlistActive) {
    chips.push({
      key: "wishlist",
      label: wishlistIsPublic ? "Public wishlist" : "Private wishlist",
      tone: "bg-rose-500/10 border-rose-500/40 text-rose-400",
    })
  } else {
    const nothingSelected = !forSaleActive && !forTradeActive && !inCollectionActive
    if (nothingSelected) {
      chips.push({
        key: "hidden",
        label: "Not visible to other users",
        tone: "bg-status-warning/10 border-status-warning/40 text-status-warning",
      })
    } else {
      if (inCollectionActive) {
        chips.push({
          key: "collection",
          label: collectionName?.trim() || "Collection",
          tone: "bg-primary/10 border-primary/40 text-primary",
          Icon: FolderOpen,
        })
      }
      if (forSaleActive) {
        chips.push({
          key: "sale",
          label: "For sale",
          tone: "bg-emerald-500/10 border-emerald-500/40 text-emerald-400",
          Icon: Tag,
        })
      }
      if (forTradeActive) {
        chips.push({
          key: "trade",
          label: "Trade interests next step",
          tone: "bg-sky-500/10 border-sky-500/40 text-sky-400",
          Icon: Repeat2,
        })
      }
    }
  }

  return (
    <div
      className={cn(
        stacked
          ? "flex flex-col items-start gap-1.5"
          : cn("flex flex-wrap gap-1.5 items-center", compact ? "" : "justify-center"),
      )}
    >
      {chips.map((c) => (
        <span
          key={c.key}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border text-xs font-medium px-2.5 py-1",
            c.tone,
          )}
        >
          {c.Icon && <c.Icon className="h-3.5 w-3.5" />}
          {c.label}
        </span>
      ))}
    </div>
  )
}

type ConditionGradeValue = "" | "new" | "used-as-new" | "used" | "used-as-is"

export function ConditionGradePicker({
  value,
  onChange,
}: {
  value: ConditionGradeValue
  onChange: (v: ConditionGradeValue) => void
}) {
  const [open, setOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState<number>(() => {
    const i = CONDITION_GRADES.findIndex((g) => g.value === value)
    return i >= 0 ? i : 0
  })
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [open])

  // When opening, start the highlight on the currently selected value (or first item).
  useEffect(() => {
    if (open) {
      const i = CONDITION_GRADES.findIndex((g) => g.value === value)
      setHighlightIndex(i >= 0 ? i : 0)
    }
  }, [open, value])

  const selected = CONDITION_GRADES.find((g) => g.value === value)

  const selectIndex = (idx: number) => {
    setHighlightIndex(idx)
    const next = CONDITION_GRADES[idx]
    if (next) onChange(next.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Arrow keys open the listbox (if closed) and live-commit the value as the user navigates.
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault()
      if (!open) {
        setOpen(true)
        const currentIdx = CONDITION_GRADES.findIndex((g) => g.value === value)
        const startIdx = currentIdx >= 0 ? currentIdx : 0
        const len = CONDITION_GRADES.length
        const nextIdx = e.key === "ArrowDown" ? (startIdx + 1) % len : (startIdx - 1 + len) % len
        selectIndex(nextIdx)
        return
      }
      const len = CONDITION_GRADES.length
      const nextIdx =
        e.key === "ArrowDown" ? (highlightIndex + 1) % len : (highlightIndex - 1 + len) % len
      selectIndex(nextIdx)
      return
    }
    if (e.key === "Home" && open) {
      e.preventDefault()
      selectIndex(0)
      return
    }
    if (e.key === "End" && open) {
      e.preventDefault()
      selectIndex(CONDITION_GRADES.length - 1)
      return
    }
    if (e.key === "Enter" || e.key === " ") {
      if (open) {
        e.preventDefault()
        setOpen(false)
      }
      return
    }
    if (e.key === "Escape" && open) {
      e.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
      return
    }
  }

  return (
    <div
      ref={rootRef}
      className="relative"
      onBlur={(e) => {
        // Close when focus leaves the picker entirely (e.g., Tab to next field).
        if (!rootRef.current?.contains(e.relatedTarget as Node | null)) {
          setOpen(false)
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-activedescendant={open ? `condition-grade-${CONDITION_GRADES[highlightIndex]?.value}` : undefined}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          selected
            ? "bg-primary/10 border-primary/40 text-primary hover:bg-primary/15"
            : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/50",
        )}
      >
        <span>{selected ? selected.label : "Set grade"}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full mt-1.5 min-w-[10rem] rounded-lg border border-border bg-popover shadow-md z-20 p-1"
        >
          {CONDITION_GRADES.map((grade, idx) => {
            const isSelected = value === grade.value
            const isHighlighted = idx === highlightIndex
            return (
              <button
                key={grade.value}
                id={`condition-grade-${grade.value}`}
                type="button"
                role="option"
                aria-selected={isSelected}
                tabIndex={-1}
                onMouseEnter={() => setHighlightIndex(idx)}
                onClick={() => {
                  onChange(isSelected ? "" : grade.value)
                  setOpen(false)
                  triggerRef.current?.focus()
                }}
                className={cn(
                  "w-full flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors text-left",
                  isSelected && "text-primary",
                  isHighlighted ? "bg-muted" : !isSelected && "text-foreground",
                  isSelected && isHighlighted && "bg-primary/10",
                )}
              >
                <span>{grade.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
