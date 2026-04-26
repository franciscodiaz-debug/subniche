"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  Share2,
  MoreVertical,
  Globe,
  Lock,
  Link2,
  Plus,
  Edit2,
  Trash2,
  Settings,
  BarChart3,
  Heart,
  DollarSign,
  Repeat2,
  Eye,
  Copy,
  Check,
  Grid3X3,
  List,
  ChevronDown,
  Search,
  ArrowRightLeft,
  Archive,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { Collection, CollectionItem, Profile } from "@/lib/types"
import { AddItemModal } from "./add-item-modal"
import { ShareCollectionModal } from "./share-collection-modal"
import { CollectionAnalytics } from "./collection-analytics"
import { CollectionItemDisplayCard } from "./collection-item-display-card"

// Demo data
const demoCollections: Record<string, Collection & { owner?: Profile }> = {
  "demo-collection-1": {
    id: "demo-collection-1",
    user_id: "demo-user",
    name: "My Guitars",
    description: "My personal guitar collection featuring vintage American instruments and modern players. Focused on quality over quantity.",
    cover_image: "/electric-guitars-collection.jpg",
    is_wishlist: false,
    visibility: "public",
    share_token: "demo-token-1",
    notes: "Started collecting in 2015. Focus on vintage American guitars from the 50s-70s.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    item_count: 3,
    total_user_value: 234200,
    total_ai_value: 270800,
    owner: {
      id: "demo-user",
      username: "GuitarCollector",
      avatar_url: "/current-user-avatar.png",
      location: "Austin, TX",
      phone: null,
      created_at: new Date().toISOString(),
    },
  },
  "demo-collection-2": {
    id: "demo-collection-2",
    user_id: "demo-user",
    name: "Pedal Board",
    description: "Effects pedals I've collected over the years",
    cover_image: "/guitar-pedals-board.jpg",
    is_wishlist: false,
    visibility: "unlisted",
    share_token: "demo-token-2",
    notes: "Current board setup: Tuner > Klon > Strymon.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    item_count: 3,
    total_user_value: 4960,
    total_ai_value: 5620,
    owner: {
      id: "demo-user",
      username: "GuitarCollector",
      avatar_url: "/current-user-avatar.png",
      location: "Austin, TX",
      phone: null,
      created_at: new Date().toISOString(),
    },
  },
  "demo-wishlist-1": {
    id: "demo-wishlist-1",
    user_id: "demo-user",
    name: "Dream Guitars",
    description: "Guitars I want to own someday - the ultimate bucket list",
    cover_image: "/vintage-gibson-les-paul.jpg",
    is_wishlist: true,
    visibility: "private",
    share_token: "demo-token-3",
    notes: "The ultimate bucket list.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    item_count: 3,
    total_user_value: 603500,
    total_ai_value: 678200,
    owner: {
      id: "demo-user",
      username: "GuitarCollector",
      avatar_url: "/current-user-avatar.png",
      location: "Austin, TX",
      phone: null,
      created_at: new Date().toISOString(),
    },
  },
}

const demoWishlistItems: CollectionItem[] = [
  {
    id: "demo-wish-1",
    collection_id: "demo-wishlist-1",
    listing_id: null,
    title: "1958 Gibson Explorer",
    subtitle: "Korina - Original",
    description: "Only 22 made in 1958. The ultimate grail guitar.",
    images: ["/1958-gibson-explorer-korina-vintage-guitar.jpg"],
    category: "Guitars",
    subcategory: "Electric",
    condition: "Excellent",
    user_estimated_value: 450000,
    ai_suggested_value: 500000,
    ai_value_updated_at: new Date().toISOString(),
    purchase_price: null,
    purchase_date: null,
    is_owned: false,
    priority: 3,
    notes: "Keep watching Heritage Auctions and Gruhn.",
    custom_attributes: {},
    sort_order: 0,
    for_sale: false,
    for_trade: false,
    asking_price: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-wish-2",
    collection_id: "demo-wishlist-1",
    listing_id: null,
    title: "1954 Fender Stratocaster",
    subtitle: "First Year - Contour Body",
    description: "The first year of the Stratocaster.",
    images: ["/1954-fender-stratocaster-vintage-guitar.jpg"],
    category: "Guitars",
    subcategory: "Electric",
    condition: "Very Good",
    user_estimated_value: 150000,
    ai_suggested_value: 175000,
    ai_value_updated_at: new Date().toISOString(),
    purchase_price: null,
    purchase_date: null,
    is_owned: false,
    priority: 2,
    notes: null,
    custom_attributes: {},
    sort_order: 1,
    for_sale: false,
    for_trade: false,
    asking_price: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-wish-3",
    collection_id: "demo-wishlist-1",
    listing_id: null,
    title: "Pre-War Martin D-45",
    subtitle: "1942 - Brazilian Rosewood",
    description: "The most desirable acoustic guitar ever made.",
    images: ["/martin-d45-acoustic-guitar-vintage.jpg"],
    category: "Guitars",
    subcategory: "Acoustic",
    condition: "Excellent",
    user_estimated_value: 3500,
    ai_suggested_value: 3200,
    ai_value_updated_at: new Date().toISOString(),
    purchase_price: null,
    purchase_date: null,
    is_owned: false,
    priority: 1,
    notes: null,
    custom_attributes: {},
    sort_order: 2,
    for_sale: false,
    for_trade: false,
    asking_price: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const demoGuitarItems: CollectionItem[] = [
  {
    id: "demo-item-1",
    collection_id: "demo-collection-1",
    listing_id: null,
    title: "1959 Gibson Les Paul Standard",
    subtitle: "Sunburst - Original PAFs",
    description: "One of the holy grail guitars. Original finish, original pickups, incredible flame top.",
    images: ["/vintage-gibson-les-paul-sunburst-guitar.jpg"],
    category: "Guitars",
    subcategory: "Electric",
    condition: "Excellent",
    user_estimated_value: 185000,
    ai_suggested_value: 225000,
    ai_value_updated_at: new Date().toISOString(),
    purchase_price: 125000,
    purchase_date: "2019-03-15",
    is_owned: true,
    priority: 0,
    notes: "Insurance policy updated 2024. Kept in climate-controlled case.",
    custom_attributes: { year: 1959, serial: "9-1234" },
    sort_order: 0,
    for_sale: false,
    for_trade: false,
    asking_price: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-item-2",
    collection_id: "demo-collection-1",
    listing_id: null,
    title: "1962 Fender Stratocaster",
    subtitle: "Olympic White - Slab Board",
    description: "Pre-CBS Strat with the desirable slab rosewood fingerboard. Refin but all original electronics.",
    images: ["/fender-stratocaster-white-vintage-guitar.jpg"],
    category: "Guitars",
    subcategory: "Electric",
    condition: "Very Good",
    user_estimated_value: 45000,
    ai_suggested_value: 42000,
    ai_value_updated_at: new Date().toISOString(),
    purchase_price: 32000,
    purchase_date: "2020-11-22",
    is_owned: true,
    priority: 0,
    notes: null,
    custom_attributes: { year: 1962, serial: "L12345" },
    sort_order: 1,
    for_sale: true,
    for_trade: true,
    asking_price: 48000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-item-3",
    collection_id: "demo-collection-1",
    listing_id: null,
    title: "PRS McCarty 594",
    subtitle: "Charcoal Burst - 10 Top",
    description: "Modern workhorse with vintage soul. Beautiful 10-top flame maple.",
    images: ["/prs-mccarty-guitar-charcoal-burst.jpg"],
    category: "Guitars",
    subcategory: "Electric",
    condition: "Mint",
    user_estimated_value: 4200,
    ai_suggested_value: 3800,
    ai_value_updated_at: new Date().toISOString(),
    purchase_price: 4100,
    purchase_date: "2023-06-10",
    is_owned: true,
    priority: 0,
    notes: null,
    custom_attributes: { year: 2023, serial: "23-123456" },
    sort_order: 2,
    for_sale: true,
    for_trade: true,
    asking_price: 3900,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Wishlist items for My Guitars collection
  {
    id: "demo-guitar-wish-1",
    collection_id: "demo-collection-1",
    listing_id: null,
    title: "1959 Gibson ES-335",
    subtitle: "Cherry Red - Stop Tail",
    description: "The first commercially successful semi-hollow guitar.",
    images: ["/1960-gibson-es-335.jpg"],
    category: "Guitars",
    subcategory: "Semi-Hollow",
    condition: "Excellent",
    user_estimated_value: 85000,
    ai_suggested_value: 92000,
    ai_value_updated_at: new Date().toISOString(),
    purchase_price: null,
    purchase_date: null,
    is_owned: false,
    priority: 2,
    notes: "Looking for one with the stop tailpiece, not the Bigsby.",
    custom_attributes: {},
    sort_order: 3,
    for_sale: false,
    for_trade: false,
    asking_price: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-guitar-wish-2",
    collection_id: "demo-collection-1",
    listing_id: null,
    title: "1952 Fender Telecaster",
    subtitle: "Butterscotch Blonde - Blackguard",
    description: "An early Blackguard Tele with the original bridge cover.",
    images: ["/1952-telecaster-butterscotch.jpg"],
    category: "Guitars",
    subcategory: "Electric",
    condition: "Very Good",
    user_estimated_value: 55000,
    ai_suggested_value: 62000,
    ai_value_updated_at: new Date().toISOString(),
    purchase_price: null,
    purchase_date: null,
    is_owned: false,
    priority: 1,
    notes: null,
    custom_attributes: {},
    sort_order: 4,
    for_sale: false,
    for_trade: false,
    asking_price: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const demoPedalItems: CollectionItem[] = [
  {
    id: "demo-pedal-1",
    collection_id: "demo-collection-2",
    listing_id: null,
    title: "Klon Centaur Gold",
    subtitle: "Original Long-Tail",
    description: "The legendary transparent overdrive.",
    images: ["/klon-centaur-gold-overdrive-pedal.jpg"],
    category: "Pedals",
    subcategory: "Overdrive",
    condition: "Excellent",
    user_estimated_value: 4500,
    ai_suggested_value: 5200,
    ai_value_updated_at: new Date().toISOString(),
    purchase_price: 1800,
    purchase_date: "2015-08-20",
    is_owned: true,
    priority: 0,
    notes: null,
    custom_attributes: {},
    sort_order: 0,
    for_sale: false,
    for_trade: false,
    asking_price: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-pedal-2",
    collection_id: "demo-collection-2",
    listing_id: null,
    title: "Strymon Timeline",
    subtitle: "Delay Workstation",
    description: "12 delay machines in one.",
    images: ["/strymon-timeline-delay-pedal.jpg"],
    category: "Pedals",
    subcategory: "Delay",
    condition: "Very Good",
    user_estimated_value: 380,
    ai_suggested_value: 350,
    ai_value_updated_at: new Date().toISOString(),
    purchase_price: 449,
    purchase_date: "2018-01-15",
    is_owned: true,
    priority: 0,
    notes: null,
    custom_attributes: {},
    sort_order: 1,
    for_sale: true,
    for_trade: false,
    asking_price: 350,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-pedal-3",
    collection_id: "demo-collection-2",
    listing_id: null,
    title: "Boss TU-3 Tuner",
    subtitle: "Chromatic Tuner",
    description: "The industry standard.",
    images: ["/boss-tu3-tuner-pedal.jpg"],
    category: "Pedals",
    subcategory: "Utility",
    condition: "Good",
    user_estimated_value: 80,
    ai_suggested_value: 70,
    ai_value_updated_at: new Date().toISOString(),
    purchase_price: 99,
    purchase_date: "2014-03-01",
    is_owned: true,
    priority: 0,
    notes: null,
    custom_attributes: {},
    sort_order: 2,
    for_sale: false,
    for_trade: true,
    asking_price: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Wishlist items for Pedal Board collection
  {
    id: "demo-pedal-wish-1",
    collection_id: "demo-collection-2",
    listing_id: null,
    title: "Analogman King of Tone",
    subtitle: "V4 - Red Side High Gain",
    description: "The legendary dual overdrive with 4+ year wait list.",
    images: ["/analogman-king-of-tone-overdrive-pedal.jpg"],
    category: "Pedals",
    subcategory: "Overdrive",
    condition: "Mint",
    user_estimated_value: 850,
    ai_suggested_value: 950,
    ai_value_updated_at: new Date().toISOString(),
    purchase_price: null,
    purchase_date: null,
    is_owned: false,
    priority: 3,
    notes: "On the wait list since 2021.",
    custom_attributes: {},
    sort_order: 3,
    for_sale: false,
    for_trade: false,
    asking_price: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-pedal-wish-2",
    collection_id: "demo-collection-2",
    listing_id: null,
    title: "Strymon BigSky",
    subtitle: "Reverb Workstation",
    description: "Premium reverb with 12 studio-quality machines.",
    images: ["/strymon-bigsky-reverb-pedal.jpg"],
    category: "Pedals",
    subcategory: "Reverb",
    condition: "Excellent",
    user_estimated_value: 400,
    ai_suggested_value: 380,
    ai_value_updated_at: new Date().toISOString(),
    purchase_price: null,
    purchase_date: null,
    is_owned: false,
    priority: 1,
    notes: null,
    custom_attributes: {},
    sort_order: 4,
    for_sale: false,
    for_trade: false,
    asking_price: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

interface IndividualCollectionPageProps {
  collectionId: string
}

export function IndividualCollectionPage({ collectionId }: IndividualCollectionPageProps) {
  const [collection, setCollection] = useState<(Collection & { owner?: Profile }) | null>(null)
  const [items, setItems] = useState<CollectionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [isDemo, setIsDemo] = useState(false)
  const [view, setView] = useState<"grid" | "list">("grid")
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [copied, setCopied] = useState(false)
  const [ownedExpanded, setOwnedExpanded] = useState(true)
  const [wishlistExpanded, setWishlistExpanded] = useState(false)
  const conditions = ["Excellent", "Very Good", "Good", "Mint"]

  const supabase = createClient()

  useEffect(() => {
    const loadCollection = async () => {
      // Check for demo collection first
      if (demoCollections[collectionId]) {
        setCollection(demoCollections[collectionId])
        const demoItems = 
          collectionId === "demo-collection-1" ? demoGuitarItems : 
          collectionId === "demo-collection-2" ? demoPedalItems :
          collectionId === "demo-wishlist-1" ? demoWishlistItems : []
        setItems(demoItems)
        setIsOwner(true)
        setIsDemo(true)
        setIsLoading(false)
        return
      }

      // Load real collection from Supabase
      const { data: { user } } = await supabase.auth.getUser()

      const { data: collectionData } = await supabase
        .from("collections")
        .select(`
          *,
          profiles!collections_user_id_fkey (
            id,
            username,
            avatar_url,
            location
          )
        `)
        .eq("id", collectionId)
        .single()

      if (collectionData) {
        const collectionWithOwner = {
          ...collectionData,
          owner: collectionData.profiles,
        }
        setCollection(collectionWithOwner)
        setIsOwner(user?.id === collectionData.user_id)

        // Load items
        const { data: itemsData } = await supabase
          .from("collection_items")
          .select("*")
          .eq("collection_id", collectionId)
          .order("sort_order", { ascending: true })

        if (itemsData) {
          setItems(itemsData)
        }
      }

      setIsLoading(false)
    }

    loadCollection()
  }, [collectionId, supabase])

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/collection/${collectionId}`
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleItemAdded = (item: CollectionItem) => {
    setItems((prev) => [...prev, item])
    setIsAddItemModalOpen(false)
  }

  const handleRemoveFromCollection = (itemId: string) => {
    setItems((prev) => prev.filter(item => item.id !== itemId))
  }

  const handleMoveToCollection = (itemId: string, collectionId: string) => {
    // Placeholder function for moving item to another collection
    console.log(`Move item ${itemId} to collection ${collectionId}`)
  }

  const handleArchiveItem = (itemId: string) => {
    // Placeholder function for archiving an item
    console.log(`Archive item ${itemId}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">Loading collection...</div>
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-xl font-semibold text-foreground">Collection not found</h2>
        <Link href="/collection" className="text-primary hover:underline">
          Back to collections
        </Link>
      </div>
    )
  }

  const visibility = collection.visibility || "private"
  const visibilityConfig = {
    private: { icon: Lock, label: "Private", color: "text-muted-foreground", bgColor: "bg-muted" },
    unlisted: { icon: Link2, label: "Unlisted", color: "text-primary", bgColor: "bg-primary/10" },
    public: { icon: Globe, label: "Public", color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  }
  const { icon: VisibilityIcon, label: visibilityLabel, color: visibilityColor, bgColor: visibilityBgColor } = visibilityConfig[visibility]

  // Split items into owned and wishlist
  const ownedItems = items.filter((item) => item.is_owned !== false)
  const wishlistItems = items.filter((item) => item.is_owned === false)

  // Get first 4 images for the gallery (only from owned items)
  const galleryImages = ownedItems.slice(0, 4).map((item) => item.images?.[0]).filter(Boolean) as string[]
  const mainImage = galleryImages[0] || collection.cover_image || "/generic-item.png"
  const thumbnailImages = galleryImages.slice(1, 3)
  
  // Calculate stats (only for owned items)
  const totalUserValue = ownedItems.reduce((sum, item) => sum + (item.user_estimated_value || 0), 0)
  const totalAiValue = ownedItems.reduce((sum, item) => sum + (item.ai_suggested_value || 0), 0)

  // Get unique categories and subcategories from items
  const categories = [...new Set(items.map((item) => item.category).filter(Boolean))]
  const subcategories = [...new Set(items.map((item) => item.subcategory).filter(Boolean))]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back link and actions */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/collection"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Collections
          </Link>

          <div className="flex items-center gap-2">
            {isOwner && (
              <>
                <Button asChild variant="outline" size="sm" className="bg-transparent">
                  <Link href={`/create-listing?status=collection&collectionId=${collection.id}&collectionName=${encodeURIComponent(collection.name)}`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="bg-transparent">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Collection
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Collection
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mb-8">
          {/* Image Gallery - 2x2 Grid */}
          <div className="lg:w-[280px] flex-shrink-0">
            <div className="grid grid-cols-2 gap-[1px] border border-border rounded-md overflow-hidden bg-border">
              {galleryImages.length > 0 ? (
                galleryImages.map((image, index) => (
                  <div key={index} className="aspect-square overflow-hidden bg-secondary">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${collection.name} item ${index + 1}`}
                      width={140}
                      height={140}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              ) : (
                // Fallback if no images
                <div className="aspect-square overflow-hidden bg-secondary">
                  <Image
                    src={collection.cover_image || "/placeholder.svg"}
                    alt={collection.name}
                    width={140}
                    height={140}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Collection Info */}
          <div className="flex-1 min-w-0">
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {/* Visibility Badge */}
              <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", visibilityBgColor, visibilityColor)}>
                <VisibilityIcon className="h-3 w-3" />
                {visibilityLabel}
              </span>
              
              {/* Category Tags */}
              {categories.slice(0, 2).map((category) => (
                <span
                  key={category}
                  className="px-2.5 py-1 bg-secondary rounded-full text-xs font-medium text-muted-foreground"
                >
                  {category}
                </span>
              ))}
              {/* Subcategory Tags */}
              {subcategories.slice(0, 3).map((subcategory) => (
                <span
                  key={subcategory}
                  className="px-2.5 py-1 bg-secondary rounded-full text-xs font-medium text-muted-foreground"
                >
                  {subcategory}
                </span>
              ))}
            </div>

            {/* Title */}
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {collection.is_wishlist && <Heart className="inline h-6 w-6 text-chart-5 fill-chart-5 mr-2" />}
                {collection.name}
              </h1>
              {isOwner && (
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleCopyLink} 
                  className="bg-transparent hover:bg-secondary font-medium w-8 h-8"
                  title={copied ? "Copied!" : "Share"}
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
                </Button>
              )}
            </div>

            {/* Collection Stats */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
              <span>{ownedItems.length} items</span>
              <span>·</span>
              <span>1.2K following</span>
              {totalUserValue > 0 && (
                <>
                  <span>·</span>
                  <span>${(totalUserValue / 1000).toFixed(0)}k value</span>
                </>
              )}
            </div>

            {/* Description */}
            {collection.description && (
              <p className="text-muted-foreground mb-6 text-sm sm:text-base leading-relaxed">
                {collection.description}
              </p>
            )}

            {/* Curator Info */}
            <div className="flex items-center gap-3 mb-6">
              <Avatar className="h-10 w-10">
                <AvatarImage src={collection.owner?.avatar_url || "/default-avatar.png"} />
                <AvatarFallback>{collection.owner?.username?.[0]?.toUpperCase() || "?"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs text-muted-foreground">Curated by</p>
                <p className="font-medium text-foreground">{collection.owner?.username || "Unknown"}</p>
              </div>
            </div>

            {/* Follow button for non-owners */}
            {!isOwner && (
              <Button variant="outline" className="bg-transparent border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Follow Collection
              </Button>
            )}
          </div>
        </div>

        {/* Owned Items Section */}
        <div className="space-y-6">
          {/* Empty State */}
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-card border border-border rounded-lg">
              <div className="p-4 bg-secondary rounded-full mb-4">
                <Eye className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No items yet</h3>
              <p className="text-muted-foreground mb-4">
                {isOwner ? "Start adding items to your collection" : "This collection is empty"}
              </p>
              {isOwner && (
                <Button asChild>
                  <Link href={`/create-listing?status=collection&collectionId=${collection.id}&collectionName=${encodeURIComponent(collection.name)}`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Item
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Owned Items Section - Collapsible */}
              {ownedItems.length > 0 && (
                <div>
                  {/* Owned Items Header */}
                  <button
                    onClick={() => setOwnedExpanded(!ownedExpanded)}
                    className="w-full flex items-center gap-3 py-3 mb-4 border-b border-border hover:bg-secondary/30 transition-colors rounded-t-lg"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      
                      <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                        {ownedItems.length} {ownedItems.length === 1 ? "collection item" : "collection items"}
                      </span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        ownedExpanded && "rotate-180"
                      )}
                    />
                  </button>

                  {/* Owned Items Grid */}
                  {ownedExpanded && (
                    <div
                      className={cn(
                        view === "grid"
                          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                          : "flex flex-col gap-3"
                      )}
                    >
                      {ownedItems.map((item) => (
                        <CollectionItemDisplayCard
                          key={item.id}
                          item={item}
                          view={view}
                          isOwner={isOwner}
                          currentCollectionId={collection.id}
                          onMoveToCollection={handleMoveToCollection}
                          onArchiveItem={handleArchiveItem}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Wishlist Section - Collapsible */}
              {wishlistItems.length > 0 && (
                <div className="mt-8">
                  {/* Wishlist Header */}
                  <button
                    onClick={() => setWishlistExpanded(!wishlistExpanded)}
                    className="w-full flex items-center gap-3 py-3 mb-4 border-t border-b border-dashed border-border hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      
                      
                      <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                        {wishlistItems.length} {wishlistItems.length === 1 ? "wishlist item" : "wishlist items"}
                      </span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        wishlistExpanded && "rotate-180"
                      )}
                    />
                  </button>

                  {/* Wishlist Items Grid */}
                  {wishlistExpanded && (
                    <div
                      className={cn(
                        view === "grid"
                          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                          : "flex flex-col gap-3"
                      )}
                    >
                      {wishlistItems.map((item) => (
                        <CollectionItemDisplayCard
                          key={item.id}
                          item={item}
                          view={view}
                          isOwner={isOwner}
                          isWishlistItem
                          currentCollectionId={collection.id}
                          onMoveToCollection={handleMoveToCollection}
                          onArchiveItem={handleArchiveItem}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {isOwner && (
        <>
          <AddItemModal
            isOpen={isAddItemModalOpen}
            onClose={() => setIsAddItemModalOpen(false)}
            collectionId={collection.id}
            onAdded={handleItemAdded}
            isWishlist={collection.is_wishlist || false}
          />
          <ShareCollectionModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            collection={collection}
            onUpdate={(updatedCollection) => setCollection(updatedCollection)}
          />
        </>
      )}
    </div>
  )
}

// Available collections for move functionality
const availableCollections = [
  { id: "demo-collection-1", name: "My Guitars" },
  { id: "demo-collection-2", name: "Pedal Board" },
  { id: "demo-wishlist-1", name: "Dream Guitars" },
]
