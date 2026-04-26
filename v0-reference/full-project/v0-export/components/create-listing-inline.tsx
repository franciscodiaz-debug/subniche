"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import {
  ImagePlus,
  X,
  Plus,
  ChevronDown,
  Sparkles,
  Loader2,
  Check,
  ChevronUp,
  ChevronRight,
  Info,
  Package,
  Truck,
  DollarSign,
  Repeat,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" // Added Input component
import { cn } from "@/lib/utils"
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { SellerProfilePreview } from "@/components/seller-profile-preview"
import { OnboardingTooltip } from "@/components/collection/onboarding-tooltip"
import { StatusSelector } from "@/components/create-item/status-selector"
import { CollectionFields } from "@/components/create-item/collection-fields"
import { WishlistFields } from "@/components/create-item/wishlist-fields"
import { WishlistEntrySelector } from "@/components/create-item/wishlist-entry-selector" // Import WishlistEntrySelector
import type { ItemSaleStatus, ItemTradeStatus, ItemCollectionStatus, WishlistItemData } from "@/lib/types/item-status"
import { Checkbox } from "@/components/ui/checkbox"

function scrollSectionIntoView(element: HTMLElement | null) {
  if (!element) return

  // Find the parent container (the card/section)
  const container = element.closest("[data-section]") as HTMLElement
  if (container) {
    container.scrollIntoView({ behavior: "smooth", block: "nearest" })
  } else {
    // Fallback to scrolling the element itself
    element.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }
}

// Inline editable text input that looks like display text
function InlineInput({
  value,
  onChange,
  placeholder,
  className,
  inputClassName,
  as = "input",
  suggestion,
  onAcceptSuggestion,
  onFocus, // Added for tracking focus
  onBlur, // Added for tracking blur
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
  inputClassName?: string
  as?: "input" | "textarea"
  suggestion?: { value: string; confidence: "high" | "medium" | "low"; accepted: boolean }
  onAcceptSuggestion?: () => void
  onFocus?: () => void // Added for tracking focus
  onBlur?: () => void // Added for tracking blur
}) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const Component = as === "textarea" ? "textarea" : "input"
  const showSuggestion = suggestion && !suggestion.accepted && !value

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
                "w-full bg-primary/5 outline-none focus:ring-0 p-2 -mx-2 rounded border border-primary/20",
                "text-foreground/80 italic",
                as === "textarea" && "resize-none min-h-[100px]",
                inputClassName,
              )}
            />
          </div>
          <button
            onClick={onAcceptSuggestion}
            className="shrink-0 p-2 rounded-full bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
            title="Accept suggestion"
          >
            <Check className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <Component
          ref={inputRef as any}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={handleFocus} // Added for tracking focus
          onBlur={onBlur} // Added for tracking blur
          className={cn(
            "w-full bg-transparent outline-none focus:ring-0 p-0 placeholder:text-muted-foreground/50",
            "transition-all duration-200",
            "focus:bg-primary/5 px-2 -mx-2 rounded",
            as === "textarea" && "resize-none min-h-[100px] py-2",
            inputClassName,
          )}
        />
      )}
    </div>
  )
}

// Inline editable price with $ prefix
function InlinePrice({
  value,
  onChange,
  className,
  onFocus, // Added for tracking focus
  onBlur, // Added for tracking blur
}: {
  value: string
  onChange: (value: string) => void
  className?: string
  onFocus?: () => void // Added for tracking focus
  onBlur?: () => void // Added for tracking blur
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFocus = () => {
    scrollSectionIntoView(inputRef.current)
    onFocus?.()
  }

  return (
    <div className={cn("flex items-baseline gap-1 group", className)}>
      <span className="text-4xl font-bold text-primary">$</span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          const val = e.target.value.replace(/[^0-9.]/g, "")
          onChange(val)
        }}
        placeholder="0"
        onFocus={handleFocus} // Added for tracking focus
        onBlur={onBlur} // Added for tracking blur
        className={cn(
          "bg-transparent outline-none focus:ring-0 p-0 text-4xl font-bold text-primary placeholder:text-primary/40",
          "w-32 transition-all duration-200",
          "focus:bg-primary/5 px-2 -mx-2 rounded",
        )}
      />
    </div>
  )
}

// Photo upload area with inline interaction
function PhotoUploadSection({
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
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
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
    <div className="space-y-4">
      {/* Main Image Area */}
      <div
        onClick={() => images.length === 0 && fileInputRef.current?.click()}
        className={cn(
          "aspect-square relative rounded-lg overflow-hidden transition-all",
          images.length === 0
            ? // Added primary border when highlighted instead of dashed border
              isHighlighted
              ? "border-2 border-primary bg-card cursor-pointer group"
              : "border-2 border-dashed border-primary/40 hover:border-primary bg-card cursor-pointer group"
            : "bg-card",
        )}
      >
        {images.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
              <ImagePlus className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground mb-1">Add Photos</p>
            <p className="text-sm text-muted-foreground">Click to upload images of your item</p>
          </div>
        ) : (
          <Image src={images[selectedImage] || "/placeholder.svg"} alt="Listing image" fill className="object-cover" />
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <button
                onClick={() => setSelectedImage(index)}
                className={cn(
                  "w-16 h-16 relative rounded-lg overflow-hidden border-2 transition-colors",
                  selectedImage === index ? "border-primary" : "border-border hover:border-primary/50",
                )}
              >
                <Image src={image || "/placeholder.svg"} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
              </button>
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {images.length > 0 && images.length < 6 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 rounded-lg border-2 border-dashed border-border hover:border-primary flex items-center justify-center transition-colors"
            >
              <Plus className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
    </div>
  )
}

// Collapsible section for optional fields
function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onToggle,
  className,
  onFocusWithin,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  isOpen?: boolean
  onToggle?: (open: boolean) => void
  className?: string
  onFocusWithin?: () => void
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen)

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen

  const handleToggle = () => {
    const newState = !isOpen
    if (onToggle) {
      onToggle(newState)
    } else {
      setInternalIsOpen(newState)
    }
  }

  const handleFocusCapture = () => {
    if (!isOpen && onToggle) {
      onToggle(true)
    }
    onFocusWithin?.()
  }

  return (
    <div
      className={cn("bg-card rounded-lg border border-border overflow-hidden transition-all", className)}
      onFocusCapture={handleFocusCapture}
    >
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
      >
        <h2 className="text-lg font-semibold">{title}</h2>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      {isOpen && <div className="p-4 pt-0 border-t border-border">{children}</div>}
    </div>
  )
}

function CategorySelector({
  category,
  subcategory,
  onCategoryChange,
  onSubcategoryChange,
}: {
  category: string
  subcategory: string
  onCategoryChange: (cat: string) => void
  onSubcategoryChange: (subcat: string) => void
}) {
  const categories = ["Guitars", "Drums", "Keyboards", "Audio Equipment", "Accessories", "Other"]
  const subcategories = category ? ["Electric", "Acoustic", "Bass", "Classical", "Parts & Accessories"] : []

  return (
    <div className="bg-card rounded-lg border border-border p-3">
      <label className="text-xs text-muted-foreground mb-2 block">Category</label>

      {/* Breadcrumb-style selection */}
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Category selection */}
        {category ? (
          // Selected category - clickable to deselect
          <button
            onClick={() => {
              onCategoryChange("")
              onSubcategoryChange("")
            }}
            className="px-3 py-1.5 rounded-full transition-all bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-normal"
          >
            {category}
          </button>
        ) : (
          // Category options
          categories.map((cat, index) => (
            <button
              key={cat}
              onClick={() => {
                onCategoryChange(cat)
                onSubcategoryChange("")
              }}
              tabIndex={index === 0 ? 0 : undefined}
              className="px-3 py-1.5 rounded-full transition-all border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground text-xs"
            >
              {cat}
            </button>
          ))
        )}

        {/* Arrow and subcategory - only show when category is selected */}
        {category && (
          <>
            <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />

            {subcategory ? (
              // Selected subcategory - clickable to deselect
              <button
                onClick={() => onSubcategoryChange("")}
                className="px-3 py-1.5 rounded-full transition-all bg-primary/10 text-primary font-medium hover:bg-primary/20 border border-primary/20 text-xs"
              >
                {subcategory}
              </button>
            ) : (
              // Subcategory options
              subcategories.map((subcat) => (
                <button
                  key={subcat}
                  onClick={() => onSubcategoryChange(subcat)}
                  className="px-3 py-1.5 rounded-full transition-all border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground text-xs"
                >
                  {subcat}
                </button>
              ))
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Inline editable specification input with AI suggestion support
function InlineSpecInput({
  label,
  value,
  onChange,
  placeholder = "-",
  suggestion,
  onAcceptSuggestion,
  onFocus, // Added for tracking focus
  onBlur, // Added for tracking blur
  inputRef, // Added ref for external access
  onEnterNext, // Added for Enter key navigation
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  suggestion?: { value: string; confidence: "high" | "medium" | "low"; accepted: boolean }
  onAcceptSuggestion?: () => void
  onFocus?: () => void // Added for tracking focus
  onBlur?: () => void // Added for tracking blur
  inputRef?: React.RefObject<HTMLInputElement> // Added ref type
  onEnterNext?: () => void // Added type for Enter key navigation
}) {
  const showSuggestion = suggestion && !suggestion.accepted && !value

  const handleFocus = () => {
    scrollSectionIntoView(inputRef?.current || null)
    onFocus?.()
  }

  return (
    <div className="space-y-1">
      <label className="text-sm text-muted-foreground">{label}</label>
      {showSuggestion ? (
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex-1 bg-primary/5 rounded-lg border border-primary/20 px-3 py-2",
              "text-foreground/80 italic text-sm",
            )}
          >
            {suggestion.value}
          </div>
          <button
            onClick={onAcceptSuggestion}
            className="shrink-0 p-1.5 rounded-full bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
            title="Accept suggestion"
          >
            <Check className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <input
          ref={inputRef} // Applied ref here
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={handleFocus} // Added for tracking focus
          onBlur={onBlur} // Added for tracking blur
          onKeyDown={(e) => {
            if (e.key === "Enter" && onEnterNext) {
              e.preventDefault()
              onEnterNext()
            }
          }}
          className={cn(
            "w-full bg-card rounded-lg border border-border px-3 py-2",
            "text-foreground placeholder:text-muted-foreground/40",
            "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-primary/5 transition-all", // Updated focus styles
          )}
        />
      )}
    </div>
  )
}

// Helper function to convert blob URL to base64
async function blobUrlToBase64(blobUrl: string): Promise<string> {
  const response = await fetch(blobUrl)
  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// Mock user object for SellerProfilePreview
const user = {
  id: "user-123",
  email: "testuser@example.com",
  created_at: new Date().toISOString(),
  user_metadata: {
    username: "TestUser",
    avatar_url: null,
    location: "San Francisco, CA",
    bio: "Passionate collector and seller of vintage gear.",
  },
}

// CHANGE: Changed photos position from "right" to "left" so tooltip appears beside the photo section instead of covering it
const createListingOnboardingSteps = [
  // Added new onboarding step for status selection
  {
    id: "status",
    targetSelector: "[data-onboarding='status']",
    title: "Choose what to do with your item",
    description:
      "Select one or more options. You can list for sale, for trade, or just add to your collection. Each option has its own settings.",
    position: "bottom" as const,
  },
  {
    id: "category",
    targetSelector: "[data-onboarding='category']",
    title: "Select a category",
    description:
      "Choose a category for your item. This helps buyers find your listing and enables AI-powered suggestions.",
    position: "bottom" as const,
  },
  {
    id: "photos",
    targetSelector: "[data-onboarding='photos']",
    title: "Add photos",
    description: "Upload clear photos of your item. Good photos help buyers see exactly what they're getting.",
    position: "left" as const,
  },
  {
    id: "ai-assist",
    targetSelector: "[data-onboarding='ai-assist']",
    title: "Use AI Assist",
    description:
      "Once you've added a category, photo, and title, AI Assist can help fill in the details automatically.",
    position: "bottom" as const,
  },
]

interface CreateListingInlineProps {
  initialStatus?: string
  initialCollectionId?: string
  initialCollectionName?: string
}

export function CreateListingInline({ 
  initialStatus, 
  initialCollectionId, 
  initialCollectionName 
}: CreateListingInlineProps) {
  const [images, setImages] = useState<string[]>([])
  const [category, setCategory] = useState("")
  const [subcategory, setSubcategory] = useState("")
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [description, setDescription] = useState("")
  const [condition, setCondition] = useState("")
  const [brand, setBrand] = useState("")
  const [year, setYear] = useState("")
  const [color, setColor] = useState("")
  const [handedness, setHandedness] = useState("")

  const [activeSection, setActiveSection] = useState<string | null>(null)

  // Initialize status states based on URL params
  const [forSaleActive, setForSaleActive] = useState(initialStatus === "sale")
  const [forTradeActive, setForTradeActive] = useState(initialStatus === "trade")
  const [inCollectionActive, setInCollectionActive] = useState(initialStatus === "collection")
  const [isWishlistActive, setIsWishlistActive] = useState(initialStatus === "wishlist")

  const [hasSelectedStatus, setHasSelectedStatus] = useState(!!initialStatus)

  const [statusFieldsAdded, setStatusFieldsAdded] = useState<string | null>(null)

  const handleFieldsVisible = (type: string) => {
    setStatusFieldsAdded(type)
    setTimeout(() => setStatusFieldsAdded(null), 2000)
  }

  const [saleData, setSaleData] = useState<ItemSaleStatus>({
    active: false,
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
    active: false,
    estimatedValue: null,
    interests: null,
    paymentMethods: [],
    localPickup: false,
    pickupZip: null,
    shippingAvailable: false,
    shippingCost: null,
    returnPolicy: null,
    publishTo: ["marketplace"],
  })

  const [collectionData, setCollectionData] = useState<ItemCollectionStatus>({
    active: initialStatus === "collection",
    collectionId: initialCollectionId || null,
    notes: null,
    dateAcquired: null,
    receiptUrl: null,
  })

  const [wishlistData, setWishlistData] = useState<WishlistItemData>({
    sourceUrl: null,
    isPublic: true,
    targetPrice: null,
    notes: null,
    priority: 1, // Default to medium
  })

  // Mock collections for the collection selector
  // Include passed collection if provided, plus demo collections
  const baseCollections = [
    { id: "demo-collection-1", name: "My Guitars" },
    { id: "demo-collection-2", name: "Pedal Board" },
    { id: "demo-wishlist-1", name: "Dream Guitars" },
  ]
  
  // Add the passed collection if it's not already in the list
  const userCollections = initialCollectionId && initialCollectionName && 
    !baseCollections.some(c => c.id === initialCollectionId)
    ? [{ id: initialCollectionId, name: initialCollectionName }, ...baseCollections]
    : baseCollections

  // Mock user communities for Publish To section
  const userCommunities: { id: string; name: string; icon?: string }[] = []

  // AI enhancement state
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [suggestions, setSuggestions] = useState<
    Record<string, { value: string; confidence: "high" | "medium" | "low"; accepted: boolean }>
  >({})
  const [enhanceError, setEnhanceError] = useState<string | null>(null)

  const [onboardingComplete, setOnboardingComplete] = useState(false)

  const brandInputRef = useRef<HTMLInputElement>(null)
  const yearInputRef = useRef<HTMLInputElement>(null)
  const handednessInputRef = useRef<HTMLInputElement>(null)
  const colorInputRef = useRef<HTMLInputElement>(null)

  const [specsOpen, setSpecsOpen] = useState(false)

  // CHANGE: Added state for wishlist entry method
  const [wishlistEntryMethod, setWishlistEntryMethod] = useState<"url" | "manual" | null>(null)
  const [showNormalFields, setShowNormalFields] = useState(true)

  // Removed unused states:
  // const [collectorNotes, setCollectorNotes] = useState("")
  // const [dateAcquired, setDateAcquired] = useState("")
  // const [acquisitionPrice, setAcquisitionPrice] = useState("")
  // const [receiptImage, setReceiptImage] = useState<string | null>(null) // Added receipt image state
  // const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null)
  // const [collectionSearch, setCollectionSearch] = useState("")
  // const [showCollectionDropdown, setShowCollectionDropdown] = useState(false)

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("create-listing-onboarding-complete")
    if (hasSeenOnboarding) {
      setOnboardingComplete(true)
    }
  }, [])

  useEffect(() => {
    if (specsOpen && brandInputRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        brandInputRef.current?.focus()
      }, 100)
    }
  }, [specsOpen])

  // Handle status changes for the StatusSelector
  const handleForSaleChange = (checked: boolean) => {
    setForSaleActive(checked)
    setHasSelectedStatus(true)
    // Update sale data active state
    setSaleData((prev) => ({ ...prev, active: checked }))
    // Clear sale data if deactivated
    if (!checked) {
      setSaleData((prev) => ({ ...prev, active: false, price: null }))
    }
    // Show indicator when status fields are added
    if (checked) handleFieldsVisible("For Sale")
  }

  const handleForTradeChange = (checked: boolean) => {
    setForTradeActive(checked)
    setHasSelectedStatus(true)
    // Update trade data active state
    setTradeData((prev) => ({ ...prev, active: checked }))
    // Clear trade data if deactivated
    if (!checked) {
      setTradeData((prev) => ({ ...prev, active: false, estimatedValue: null }))
    }
    // Show indicator when status fields are added
    if (checked) handleFieldsVisible("For Trade")
  }

  const handleInCollectionChange = (checked: boolean) => {
    setInCollectionActive(checked)
    setHasSelectedStatus(true)
    // Update collection data active state
    setCollectionData((prev) => ({ ...prev, active: checked }))
    // Clear collection data if deactivated
    if (!checked) {
      setCollectionData((prev) => ({ ...prev, active: false, collectionId: null }))
    }
    // Show indicator when status fields are added
    if (checked) handleFieldsVisible("Collection")
  }

  // CHANGE: Call handleWishlistChange instead of directly setting state to ensure wishlistEntryMethod is reset
  const handleWishlistChange = (checked: boolean) => {
    setIsWishlistActive(checked)
    setHasSelectedStatus(true)

    if (checked) {
      // When wishlist is activated, deactivate owned-item statuses
      setForSaleActive(false)
      setForTradeActive(false)
      setSaleData((prev) => ({ ...prev, active: false }))
      setTradeData((prev) => ({ ...prev, active: false }))
      setShowNormalFields(false)
      setWishlistEntryMethod(null)
    } else {
      setShowNormalFields(true)
      setWishlistEntryMethod(null)
    }
    // Show indicator when status fields are added
    if (checked) handleFieldsVisible("Wishlist")
  }

  // Determine which section should be highlighted for the user to fill next
  const getCurrentStep = () => {
    // If user is actively working on a section, keep highlight there
    if (activeSection) return activeSection

    if (!hasSelectedStatus) return "status"

    // Otherwise, progress to next incomplete section
    if (!category || !subcategory) return "category"
    if (images.length === 0) return "photos"
    if (!title) return "title" // Changed to track title individually
    if (!subtitle) return "subtitle" // Changed to track subtitle individually
    if (!description) return "description"
    if (!condition) return "condition"
    return "complete"
  }

  const currentStep = getCurrentStep()

  const canEnhance = category && subcategory && images.length > 0 && title && subtitle

  // but display them combined in the tooltip
  const enhanceRequirements = [
    { id: "category", label: "Category", met: !!category && !!subcategory, weight: 37.5 },
    { id: "photo", label: "Photo", met: images.length > 0, weight: 37.5 },
    { id: "title", label: "Title", met: !!title, weight: 12.5 },
    { id: "subtitle", label: "Subtitle", met: !!subtitle, weight: 12.5 },
  ]
  // FIX: Use actual weights for fill percentage calculation
  const fillPercentage = enhanceRequirements.filter((r) => r.met).reduce((sum, r) => sum + r.weight, 0)

  const canPublish = () => {
    // Basic requirements for all items
    if (!title || images.length === 0) return false

    // If for sale, need price and payment/logistics
    if (forSaleActive) {
      if (!saleData.price) return false
      if (saleData.paymentMethods.length === 0) return false
      if (!saleData.localPickup && !saleData.shippingAvailable) return false
      // Add check for pickupZip if localPickup is true
      if (saleData.localPickup && !saleData.pickupZip) return false
      // Add check for shippingCost if shippingAvailable is true
      if (saleData.shippingAvailable && saleData.shippingCost === null) return false
    }

    // If for trade, need trade value and interests
    if (forTradeActive) {
      if (!tradeData.estimatedValue) return false
      if (!tradeData.interests) return false
      // Add check for pickupZip if localPickup is true
      if (tradeData.localPickup && !tradeData.pickupZip) return false
      // Add check for shippingCost if shippingAvailable is true
      if (tradeData.shippingAvailable && tradeData.shippingCost === null) return false
    }

    // If wishlist, need source URL or target price
    if (isWishlistActive) {
      if (!wishlistData.sourceUrl && !wishlistData.targetPrice) return false
    }

    return true
  }

  const handlePublish = () => {
    console.log("Publishing item...", {
      images,
      category,
      subcategory,
      title,
      subtitle,
      description,
      condition,
      brand,
      year,
      color,
      forSale: forSaleActive,
      saleData: forSaleActive ? saleData : null,
      forTrade: forTradeActive,
      tradeData: forTradeActive ? tradeData : null,
      inCollection: inCollectionActive,
      collectionData: inCollectionActive ? collectionData : null,
      isWishlistActive,
      wishlistData: isWishlistActive ? wishlistData : null,
    })
  }

  const handleEnhance = async () => {
    if (!canEnhance) return

    setIsEnhancing(true)
    setEnhanceError(null)

    try {
      const imagesToSend = images.slice(0, 3)
      const base64Images = await Promise.all(
        imagesToSend.map(async (img) => {
          // If it's already a data URL or regular URL, use as-is
          if (img.startsWith("data:") || img.startsWith("http")) {
            return img
          }
          // Convert blob URL to base64
          if (img.startsWith("blob:")) {
            return await blobUrlToBase64(img)
          }
          return img
        }),
      )

      const response = await fetch("/api/enhance-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.JSON.stringify({
          images: base64Images,
          title,
          category,
          subcategory,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to enhance listing")
      }

      const data = await response.json()

      // Map AI suggestions to our format
      const newSuggestions: Record<
        string,
        { value: string; confidence: "high" | "medium" | "low"; accepted: boolean }
      > = {}

      if (data.description && !description) {
        newSuggestions.description = {
          value: data.description,
          confidence: data.confidence?.description || "medium",
          accepted: false,
        }
      }
      if (data.condition && !condition) {
        newSuggestions.condition = {
          value: data.condition,
          confidence: data.confidence?.condition || "medium",
          accepted: false,
        }
      }
      if (data.brand && !brand) {
        newSuggestions.brand = { value: data.brand, confidence: data.confidence?.brand || "medium", accepted: false }
      }
      if (data.year && !year) {
        newSuggestions.year = { value: data.year, confidence: data.confidence?.year || "low", accepted: false }
      }
      if (data.color && !color) {
        newSuggestions.color = { value: data.color, confidence: data.confidence?.color || "high", accepted: false }
      }
      if (data.subtitle && !subtitle) {
        newSuggestions.subtitle = {
          value: data.subtitle,
          confidence: data.confidence?.subtitle || "medium",
          accepted: false,
        }
      }
      // Added suggestion for title
      if (data.title && !title) {
        newSuggestions.title = {
          value: data.title,
          confidence: data.confidence?.title || "medium",
          accepted: false,
        }
      }

      setSuggestions(newSuggestions)
    } catch (error) {
      console.error("[v0] Enhancement error:", error)
      setEnhanceError("Unable to enhance listing. Please try again.")
    } finally {
      setIsEnhancing(false)
    }
  }

  const acceptSuggestion = (field: string) => {
    const suggestion = suggestions[field]
    if (!suggestion) return

    // Apply the suggestion to the actual field
    switch (field) {
      case "description":
        setDescription(suggestion.value)
        break
      case "condition":
        setCondition(suggestion.value)
        break
      case "brand":
        setBrand(suggestion.value)
        break
      case "year":
        setYear(suggestion.value)
        break
      case "color":
        setColor(suggestion.value)
        break
      case "subtitle":
        setSubtitle(suggestion.value)
        break
      // Handle title suggestion
      case "title":
        setTitle(suggestion.value)
        break
    }

    // Mark as accepted
    setSuggestions((prev) => ({
      ...prev,
      [field]: { ...prev[field], accepted: true },
    }))
  }

  const acceptAllSuggestions = () => {
    Object.keys(suggestions).forEach((field) => {
      if (!suggestions[field].accepted) {
        acceptSuggestion(field)
      }
    })
  }

  const hasPendingSuggestions = Object.values(suggestions).some((s) => !s.accepted)

  // Get action button text based on active statuses
  const getActionButtonText = () => {
    if (isWishlistActive) {
      return "Add Item"
    }
    if (forSaleActive || forTradeActive) {
      return "Publish Listing"
    }
    return "Add Item"
  }

  const handleWishlistUrlProcessed = (data: any) => {
    if (data.title) setTitle(data.title)
    if (data.subtitle) setSubtitle(data.subtitle)
    if (data.description) setDescription(data.description)
    if (data.specifications) {
      if (data.specifications.brand) setBrand(data.specifications.brand)
      if (data.specifications.color) setColor(data.specifications.color)
      if (data.specifications.year) setYear(data.specifications.year)
    }
    if (data.imageUrl) {
      setImages([data.imageUrl])
    }
    setWishlistData((prev) => ({ ...prev, sourceUrl: data.sourceUrl || null }))
    setShowNormalFields(true)
  }

  return (
    <TooltipProvider>
      <OnboardingTooltip
        steps={createListingOnboardingSteps}
        storageKey="create-listing-onboarding-complete"
        onComplete={() => setOnboardingComplete(true)}
      />

      {/* Adjust main container for padding */}
      <div className="min-h-screen bg-background px-3 py-4 sm:px-4 md:px-6 lg:px-8">
        <div className="flex flex-col gap-4 mb-6 md:mb-0">
          {/* Top row: Title and actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Add Item</h1>
            </div>
            <div className="flex gap-2 sm:gap-3">
              {/* AI Assist button - always visible in header */}
              <div className="flex flex-col items-center relative" data-onboarding="ai-assist">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        variant="outline"
                        onClick={handleEnhance}
                        disabled={!canEnhance || isEnhancing}
                        className={cn(
                          "gap-2 transition-all duration-300 min-w-[140px] relative overflow-hidden",
                          canEnhance && !isEnhancing && "border-primary text-primary hover:bg-primary/10",
                          !canEnhance && "border-border text-muted-foreground",
                        )}
                      >
                        {!canEnhance && fillPercentage > 0 && (
                          <div
                            className="absolute inset-0 bg-primary/20 transition-all duration-500 ease-out"
                            style={{ width: `${fillPercentage}%` }}
                          />
                        )}
                        <span className="flex items-center gap-2 relative z-10 text-foreground">
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
                      <p className="font-medium mb-2">Requirements:</p>
                      {[
                        { label: "Category", met: !!category && !!subcategory },
                        { label: "At least 1 photo", met: images.length > 0 },
                        { label: "Title + Subtitle", met: !!title && !!subtitle },
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
              <Button variant="outline" className="hidden lg:inline-flex bg-transparent">
                Save Draft
              </Button>
              <Button onClick={handlePublish} disabled={!canPublish()} className="hidden lg:inline-flex">
                {getActionButtonText()}
              </Button>
            </div>
          </div>

          <div data-onboarding="status" className="inline-block mb-6">
            <div className={cn("w-fit p-3 rounded-lg", currentStep === "status" && "ring-2 ring-primary")}>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Status</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                        <Info className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[300px] p-3">
                      <div className="text-xs space-y-2 leading-relaxed">
                        <p className="font-semibold">{"Tip → Items can have multiple states."}</p>
                        <p className="text-muted-foreground">
                          {"For example, an item can be in a collectio and also marked for sale or trade."}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {statusFieldsAdded && (
                  <span className="text-xs text-primary animate-in fade-in slide-in-from-left-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    {statusFieldsAdded} fields added below
                  </span>
                )}
              </div>
              <StatusSelector
                forSale={forSaleActive}
                forTrade={forTradeActive}
                inCollection={inCollectionActive}
                isWishlist={isWishlistActive}
                onForSaleChange={(active) => {
                  setForSaleActive(active)
                  setSaleData((prev) => ({ ...prev, active }))
                  if (!hasSelectedStatus) setHasSelectedStatus(true)
                  // Show indicator when status fields are added
                  if (active) handleFieldsVisible("For Sale")
                }}
                onForTradeChange={(active) => {
                  setForTradeActive(active)
                  setTradeData((prev) => ({ ...prev, active }))
                  if (!hasSelectedStatus) setHasSelectedStatus(true)
                  // Show indicator when status fields are added
                  if (active) handleFieldsVisible("For Trade")
                }}
                onInCollectionChange={(active) => {
                  setInCollectionActive(active)
                  setCollectionData((prev) => ({ ...prev, active }))
                  if (!hasSelectedStatus) setHasSelectedStatus(true)
                  // Show indicator when status fields are added
                  if (active) handleFieldsVisible("Collection")
                }}
                onWishlistChange={(active) => {
                  handleWishlistChange(active)
                  if (!hasSelectedStatus) setHasSelectedStatus(true)
                  // Show indicator when status fields are added
                  if (active) handleFieldsVisible("Wishlist")
                }}
              />
            </div>
          </div>
        </div>

        {hasPendingSuggestions && (
          <div className="mb-6 bg-primary/10 border border-primary/30 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">AI has suggested some details for your listing</p>
                <p className="text-sm text-muted-foreground">
                  Review the highlighted fields below and accept the ones you like
                </p>
              </div>
            </div>
            <Button
              onClick={acceptAllSuggestions}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Accept All
            </Button>
          </div>
        )}

        {enhanceError && (
          <div className="mb-6 bg-destructive/10 border border-destructive/30 rounded-lg p-4">
            <p className="text-destructive">{enhanceError}</p>
          </div>
        )}

        {/* Category selector with onboarding - Add data-onboarding attribute and remove old tooltip */}
        {(!isWishlistActive || (wishlistEntryMethod !== null && showNormalFields)) && (
          <div className="relative mb-6" data-onboarding="category">
            <div className={cn(currentStep === "category" && "ring-2 ring-primary rounded-lg")}>
              <CategorySelector
                category={category}
                subcategory={subcategory}
                onCategoryChange={setCategory}
                onSubcategoryChange={setSubcategory}
              />
            </div>
          </div>
        )}

        {/* CHANGE: Two-column layout for wishlist entry selector + collection fields */}
        {isWishlistActive && wishlistEntryMethod === null && (
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Left column: Wishlist entry selector */}
            <div>
              <WishlistEntrySelector
                onMethodSelected={(method) => {
                  setWishlistEntryMethod(method)
                  if (method === "manual") {
                    setShowNormalFields(true)
                  }
                  // Note: For URL method, fields will show after handleWishlistUrlProcessed is called
                }}
                onUrlProcessed={handleWishlistUrlProcessed}
              />
            </div>

            {/* Right column: Collection fields (if active) */}
            {inCollectionActive && (
              <div>
                <CollectionFields
                  data={collectionData}
                  onChange={setCollectionData}
                  isActive={inCollectionActive}
                  collections={userCollections}
                  onFieldsVisible={() => handleFieldsVisible("Collection")}
                  isWishlistMode={isWishlistActive}
                />
              </div>
            )}
          </div>
        )}

        {(!isWishlistActive || (isWishlistActive && wishlistEntryMethod !== null && showNormalFields)) && (
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-start">
            {/* Left column - Core item details */}
            {/* CHANGE: Added w-full to ensure column fills its grid cell */}
            <div className="space-y-6 order-2 lg:order-1 w-full">
              {/* Title and Price Section */}
              <div
                data-section // Added data-section attribute
                data-onboarding="title" // Added for onboarding
                className={cn(
                  "bg-card rounded-lg border p-4 md:p-6 transition-all",
                  // Adjusted highlighting to cover Title, Subtitle, and Price
                  currentStep === "title" || currentStep === "subtitle" ? "ring-2 ring-primary" : "border-border",
                )}
                // Track when user starts/finishes editing title/price
                onFocusCapture={() => setActiveSection("title")}
                onBlurCapture={() => {
                  // Check if focus left the entire titlePrice section, not just one element
                  // Use a broader check for focus leaving the section
                  if (!document.activeElement || !document.activeElement.closest('[data-section="title"]')) {
                    setActiveSection(null)
                  }
                }}
              >
                <div className="space-y-4">
                  <InlineInput
                    value={title}
                    onChange={setTitle}
                    placeholder="Enter item title"
                    className="text-3xl font-bold"
                    suggestion={suggestions.title}
                    onAcceptSuggestion={() => acceptSuggestion("title")}
                    onFocus={() => setActiveSection("title")}
                    onBlur={() => setActiveSection(null)}
                  />

                  <InlineInput
                    value={subtitle}
                    onChange={setSubtitle}
                    placeholder="Subtitle (e.g., color, year, variant)"
                    className="text-muted-foreground"
                    suggestion={suggestions.subtitle}
                    onAcceptSuggestion={() => acceptSuggestion("subtitle")}
                    onFocus={() => setActiveSection("title")}
                    onBlur={() => setActiveSection(null)}
                  />

                  {(forSaleActive || forTradeActive) && (
                    <div className="pt-2 space-y-4">
                      {forSaleActive && (
                        <div>
                          {forTradeActive && null}
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-primary">$</span>
                            <input
                              type="text"
                              value={saleData.price ?? ""}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9.]/g, "")
                                setSaleData((prev) => ({ ...prev, price: val ? Number(val) : null }))
                              }}
                              placeholder="0"
                              className="bg-transparent outline-none focus:ring-0 text-4xl font-bold text-primary placeholder:text-primary/40 w-32 transition-all focus:bg-primary/5 px-2 -mx-2 rounded"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <SellerProfilePreview
                profile={{
                  id: user?.id || "demo",
                  username: user?.user_metadata?.username || user?.email?.split("@")[0] || "Your Profile",
                  avatar_url: user?.user_metadata?.avatar_url || null,
                  location: user?.user_metadata?.location || "Add your location",
                  created_at: user?.created_at || new Date().toISOString(),
                  bio: user?.user_metadata?.bio || null,
                  total_listings: 1, // This will be their first if new
                  total_collections: 0,
                  linked_accounts: [],
                }}
              />

              {/* Description Section */}
              <div
                data-section // Added data-section attribute
                className={cn(
                  "bg-card rounded-lg border p-4 md:p-6 transition-all",
                  currentStep === "description" ? "ring-2 ring-primary" : "border-border",
                )}
                onFocusCapture={() => setActiveSection("description")}
                onBlurCapture={() => {
                  if (!document.activeElement || !document.activeElement.closest('[data-section="description"]')) {
                    setActiveSection(null)
                  }
                }}
              >
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <InlineInput
                  as="textarea"
                  value={description}
                  onChange={setDescription}
                  placeholder="Describe your item in detail..."
                  suggestion={suggestions.description}
                  onAcceptSuggestion={() => acceptSuggestion("description")}
                  onFocus={() => setActiveSection("description")}
                  onBlur={() => setActiveSection(null)}
                />
              </div>

              {/* Condition Section */}
              <div
                data-section // Added data-section attribute
                className={cn(
                  "bg-card rounded-lg border p-4 md:p-6 transition-all",
                  currentStep === "condition" ? "ring-2 ring-primary" : "border-border",
                )}
                onFocusCapture={() => setActiveSection("condition")}
                onBlurCapture={() => {
                  if (!document.activeElement || !document.activeElement.closest('[data-section="condition"]')) {
                    setActiveSection(null)
                  }
                }}
              >
                <h2 className="text-xl font-semibold mb-4">Condition</h2>
                <InlineInput
                  as="textarea"
                  value={condition}
                  onChange={setCondition}
                  placeholder="Describe the condition of your item..."
                  suggestion={suggestions.condition}
                  onAcceptSuggestion={() => acceptSuggestion("condition")}
                  onFocus={() => setActiveSection("condition")}
                  onBlur={() => setActiveSection(null)}
                />
              </div>

              {/* Specs Section - Added wrapper div for focus capture */}
              <div
                data-section // Added data-section attribute
                data-onboarding="ai-assist" // Added for onboarding
                className={cn(specsOpen && "ring-2 ring-primary rounded-lg")}
              >
                <CollapsibleSection
                  title="Specifications"
                  isOpen={specsOpen}
                  onToggle={(isOpen) => {
                    setSpecsOpen(isOpen)
                    if (isOpen) setActiveSection("specs")
                    else setActiveSection(null)
                  }}
                  // Pass down onFocusWithin handler to parent for focus tracking
                  onFocusWithin={() => setActiveSection("specs")}
                >
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <InlineSpecInput
                      label="Brand"
                      value={brand}
                      onChange={setBrand}
                      suggestion={suggestions.brand}
                      onAcceptSuggestion={() => acceptSuggestion("brand")}
                      inputRef={brandInputRef}
                      onFocus={() => setActiveSection("specs")}
                      onBlur={() => setActiveSection(null)}
                      onEnterNext={() => yearInputRef.current?.focus()}
                    />
                    <InlineSpecInput
                      label="Year"
                      value={year}
                      onChange={setYear}
                      suggestion={suggestions.year}
                      onAcceptSuggestion={() => acceptSuggestion("year")}
                      inputRef={yearInputRef}
                      onFocus={() => setActiveSection("specs")}
                      onBlur={() => setActiveSection(null)}
                      onEnterNext={() => handednessInputRef.current?.focus()}
                    />
                    <InlineSpecInput
                      label="Handedness"
                      value={handedness}
                      onChange={setHandedness}
                      inputRef={handednessInputRef}
                      onFocus={() => setActiveSection("specs")}
                      onBlur={() => setActiveSection(null)}
                      onEnterNext={() => colorInputRef.current?.focus()}
                    />
                    <InlineSpecInput
                      label="Color"
                      value={color}
                      onChange={setColor}
                      suggestion={suggestions.color}
                      onAcceptSuggestion={() => acceptSuggestion("color")}
                      inputRef={colorInputRef}
                      onFocus={() => setActiveSection("specs")}
                      onBlur={() => setActiveSection(null)}
                    />
                  </div>
                </CollapsibleSection>
              </div>
            </div>

            {/* Right column - Photos and Status-specific fields */}
            {/* CHANGE: Added w-full to ensure column fills its grid cell and doesn't shrink */}
            <div className="order-1 lg:order-2 lg:col-start-2 space-y-6 w-full">
              {/* Photos section - Add data-onboarding attribute */}
              <div
                className={cn(
                  "bg-card rounded-lg border border-border p-4 transition-all",
                  currentStep === "photos" && "ring-2 ring-primary",
                )}
                data-section
                data-onboarding="photos"
              >
                <PhotoUploadSection
                  images={images}
                  onImagesChange={setImages}
                  isHighlighted={currentStep === "photos" && images.length === 0}
                />
              </div>

              {/* For Sale / For Trade Fields - Merged Container */}
              {(forSaleActive || forTradeActive) && (
                <div className="bg-card rounded-lg border border-border p-4">
                  {/* Payment Section */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Payment</h3>
                        {/* Seller defaults nudge tooltip */}
                        {(!saleData.paymentMethods.length && !tradeData.paymentMethods.length) ||
                        (!saleData.localPickup &&
                          !saleData.shippingAvailable &&
                          !tradeData.localPickup &&
                          !tradeData.shippingAvailable) ||
                        (!saleData.returnPolicy && !tradeData.returnPolicy) ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                                <Info className="h-3.5 w-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-[260px] p-3">
                              <div className="space-y-2">
                                <p className="font-medium text-sm">Save time with Seller Defaults</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  Set up your default payment methods, logistics, and return policy in Settings to
                                  auto-fill these fields when creating listings.
                                </p>
                                <a
                                  href="/settings/seller-defaults"
                                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                >
                                  Go to Settings
                                  <ChevronRight className="h-3 w-3" />
                                </a>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        {forSaleActive && <DollarSign className="h-4 w-4 text-green-500" />}
                        {forTradeActive && <Repeat className="h-4 w-4 text-blue-500" />}
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        "Cash",
                        "PayPal - Friends and Family",
                        "PayPal - Goods and Services",
                        "Venmo",
                        "Cryptocurrency",
                        "Other",
                      ].map((method) => (
                        <label key={method} className="flex items-center gap-3 cursor-pointer group">
                          <Checkbox
                            checked={
                              saleData.paymentMethods.includes(method) || tradeData.paymentMethods.includes(method)
                            }
                            onCheckedChange={(checked) => {
                              const updatePayment = (methods: string[]) =>
                                checked ? [...methods, method] : methods.filter((m) => m !== method)
                              if (forSaleActive)
                                setSaleData((prev) => ({ ...prev, paymentMethods: updatePayment(prev.paymentMethods) }))
                              if (forTradeActive)
                                setTradeData((prev) => ({
                                  ...prev,
                                  paymentMethods: updatePayment(prev.paymentMethods),
                                }))
                            }}
                          />
                          <span
                            className={cn(
                              "text-sm transition-colors",
                              saleData.paymentMethods.includes(method) || tradeData.paymentMethods.includes(method)
                                ? "text-foreground"
                                : "text-muted-foreground group-hover:text-foreground",
                            )}
                          >
                            {method}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Logistics Section */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-4">Logistics</h3>
                    <div className="space-y-1.5">
                      {/* Local Pickup */}
                      <div className="flex items-center min-h-[28px] gap-3">
                        <Checkbox
                          checked={saleData.localPickup || tradeData.localPickup}
                          onCheckedChange={(checked) => {
                            if (forSaleActive) setSaleData((prev) => ({ ...prev, localPickup: !!checked }))
                            if (forTradeActive) setTradeData((prev) => ({ ...prev, localPickup: !!checked }))
                          }}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-muted-foreground/30"
                        />
                        <Package
                          className={cn(
                            "h-4 w-4 transition-colors",
                            saleData.localPickup || tradeData.localPickup ? "text-primary" : "text-primary/40",
                          )}
                        />
                        <span
                          className={cn(
                            "text-sm transition-colors",
                            saleData.localPickup || tradeData.localPickup
                              ? "text-foreground"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          Local Pickup
                        </span>
                        {(saleData.localPickup || tradeData.localPickup) && (
                          <>
                            <span className="text-sm text-muted-foreground ml-2">Zip:</span>
                            <Input
                              placeholder="84532"
                              value={saleData.pickupZip || tradeData.pickupZip || ""}
                              onChange={(e) => {
                                if (forSaleActive)
                                  setSaleData((prev) => ({ ...prev, pickupZip: e.target.value || null }))
                                if (forTradeActive)
                                  setTradeData((prev) => ({ ...prev, pickupZip: e.target.value || null }))
                              }}
                              className="w-[100px] h-7 text-sm"
                            />
                          </>
                        )}
                      </div>

                      {/* Shipping */}
                      <div className="flex items-center min-h-[28px] gap-3">
                        <Checkbox
                          checked={saleData.shippingAvailable || tradeData.shippingAvailable}
                          onCheckedChange={(checked) => {
                            if (forSaleActive) setSaleData((prev) => ({ ...prev, shippingAvailable: !!checked }))
                            if (forTradeActive) setTradeData((prev) => ({ ...prev, shippingAvailable: !!checked }))
                          }}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-muted-foreground/30"
                        />
                        <Truck
                          className={cn(
                            "h-4 w-4 transition-colors",
                            saleData.shippingAvailable || tradeData.shippingAvailable
                              ? "text-primary"
                              : "text-primary/40",
                          )}
                        />

                        <span
                          className={cn(
                            "text-sm transition-colors",
                            saleData.shippingAvailable || tradeData.shippingAvailable
                              ? "text-foreground"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          Shipping
                        </span>
                        {(saleData.shippingAvailable || tradeData.shippingAvailable) && (
                          <>
                            <span className="text-sm text-muted-foreground ml-2">$</span>
                            <Input
                              type="number"
                              placeholder="0.00"
                              step="0.01"
                              value={saleData.shippingCost || tradeData.shippingCost || ""}
                              onChange={(e) => {
                                const cost = e.target.value ? Number.parseFloat(e.target.value) : null
                                if (forSaleActive) setSaleData((prev) => ({ ...prev, shippingCost: cost }))
                                if (forTradeActive) setTradeData((prev) => ({ ...prev, shippingCost: cost }))
                              }}
                              className="w-[100px] h-7 text-sm [&::-webkit-outer-spin-button]:hidden [&::-webkit-inner-spin-button]:hidden [&::-moz-number-spin-button]:hidden"
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Return Policy Section */}
                  <div onFocus={() => setActiveSection("returnPolicy")} onBlur={() => setActiveSection(null)}>
                    <h3 className="font-semibold mb-2">Return Policy</h3>
                    <div
                      className={cn(
                        "rounded-lg transition-all p-2 -m-2",
                        activeSection === "returnPolicy" && "bg-primary/5",
                      )}
                    >
                      <textarea
                        value={saleData.returnPolicy || tradeData.returnPolicy || ""}
                        onChange={(e) => {
                          if (forSaleActive) setSaleData((prev) => ({ ...prev, returnPolicy: e.target.value || null }))
                          if (forTradeActive)
                            setTradeData((prev) => ({ ...prev, returnPolicy: e.target.value || null }))
                        }}
                        placeholder="Describe your return policy, if any..."
                        className="w-full bg-transparent border-0 outline-none resize-none min-h-[60px] text-sm placeholder:text-muted-foreground/50 h-auto mb-0"
                      />
                    </div>
                  </div>

                  {/* Publish To Section */}
                  <div>
                    <h3 className="font-semibold mb-4">Publish To</h3>

                    <div className="space-y-3">
                      {/* General Niche */}
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={
                            saleData.publishTo?.includes("marketplace") || tradeData.publishTo?.includes("marketplace")
                          }
                          onCheckedChange={(checked) => {
                            const updatePublishTo = (current: string[] | undefined) => {
                              const arr = current || []
                              if (checked) {
                                return arr.includes("marketplace") ? arr : [...arr, "marketplace"]
                              } else {
                                return arr.filter((p) => p !== "marketplace")
                              }
                            }
                            if (forSaleActive)
                              setSaleData((prev) => ({ ...prev, publishTo: updatePublishTo(prev.publishTo) }))
                            if (forTradeActive)
                              setTradeData((prev) => ({ ...prev, publishTo: updatePublishTo(prev.publishTo) }))
                          }}
                          className="border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">General Niche</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="text-muted-foreground hover:text-foreground">
                                <Info className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-[200px] p-2">
                              <p className="text-xs">
                                Publishing to the General Niche makes your listing visible to everyone in this niche.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                      {/* Communities - shown inline as additional publish destinations */}
                      {userCommunities.length > 0 ? (
                        userCommunities.map((community) => (
                          <div key={community.id} className="flex items-center gap-3">
                            <Checkbox
                              checked={
                                saleData.publishTo?.includes(community.id) ||
                                tradeData.publishTo?.includes(community.id)
                              }
                              onCheckedChange={(checked) => {
                                const updatePublishTo = (current: string[] | undefined) => {
                                  const arr = current || []
                                  if (checked) {
                                    return arr.includes(community.id) ? arr : [...arr, community.id]
                                  } else {
                                    return arr.filter((p) => p !== community.id)
                                  }
                                }
                                if (forSaleActive)
                                  setSaleData((prev) => ({ ...prev, publishTo: updatePublishTo(prev.publishTo) }))
                                if (forTradeActive)
                                  setTradeData((prev) => ({ ...prev, publishTo: updatePublishTo(prev.publishTo) }))
                              }}
                              className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <span className="text-sm">{community.name}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground pl-7">
                          Join communities to publish listings directly to them
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Collection Fields - only when In Collection is active */}
              <CollectionFields
                data={collectionData}
                onChange={setCollectionData}
                isActive={inCollectionActive}
                collections={userCollections}
                onFieldsVisible={() => handleFieldsVisible("Collection")}
                isWishlistMode={isWishlistActive}
              />

              <WishlistFields data={wishlistData} onChange={setWishlistData} isActive={isWishlistActive} />
            </div>
          </div>
        )}

        {/* CHANGE: Removed duplicate CollectionFields section - now handled in two-column layout above */}

        {/* Conditional rendering for mobile buttons based on availability toggles */}
        <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-card/95 backdrop-blur-sm border-t border-border p-3 flex gap-2 z-50">
          <Button variant="outline" className="flex-1 bg-transparent">
            Save Draft
          </Button>
          <Button onClick={handlePublish} disabled={!canPublish()} className="flex-1">
            {getActionButtonText()}
          </Button>
        </div>

        <div className="lg:hidden h-20" />
      </div>
    </TooltipProvider>
  )
}
