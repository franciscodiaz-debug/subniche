"use client"

import { useState, useEffect } from "react"
import {
  MapPin,
  Calendar,
  FolderOpen,
  Package,
  Plus,
  Heart,
  Tag,
  Activity,
  Clock,
  Check,
  Mail,
  Phone,
  ShieldCheck,
  ExternalLink,
  Settings,
  Pencil,
  Share2,
  ChevronDown,
  Search,
  DollarSign,
  Repeat2,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Collection, CollectionItem, Profile, Verification, LinkedAccount } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ProfileCollectionCard } from "./profile-collection-card"
import { InventoryManager } from "./inventory-manager"
import { EditProfileModal } from "./edit-profile-modal"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

// Demo data
const demoProfile: Profile = {
  id: "demo-user",
  username: "guitar_collector",
  avatar_url: "/diverse-user-avatars.png",
  location: "Nashville, TN",
  phone: null,
  created_at: "2023-01-15T00:00:00Z",
  bio: "Vintage guitar enthusiast & tube amp collector. Always looking for pre-CBS Fenders and original PAF pickups.",
  total_listings: 12,
  total_sales: 8,
  total_collections: 5,
}

const demoCollections: Collection[] = [
  {
    id: "demo-collection-1",
    user_id: "demo-user",
    name: "Vintage Guitars",
    description: "Pre-1970 American classics",
    cover_image: null,
    is_wishlist: false,
    visibility: "public",
    share_token: "demo-token-1",
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    item_count: 8,
    total_user_value: 185000,
    total_ai_value: 210000,
  },
  {
    id: "demo-collection-2",
    user_id: "demo-user",
    name: "Tube Amplifiers",
    description: "Fender, Marshall, Vox",
    cover_image: null,
    is_wishlist: false,
    visibility: "public",
    share_token: "demo-token-2",
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    item_count: 5,
    total_user_value: 24500,
    total_ai_value: 28000,
  },
  {
    id: "demo-collection-3",
    user_id: "demo-user",
    name: "Pedal Board",
    description: "Current touring setup",
    cover_image: null,
    is_wishlist: false,
    visibility: "unlisted",
    share_token: "demo-token-3",
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    item_count: 12,
    total_user_value: 4800,
    total_ai_value: 5200,
  },
  {
    id: "demo-wishlist-1",
    user_id: "demo-user",
    name: "Dream Guitars",
    description: "The bucket list",
    cover_image: null,
    is_wishlist: true,
    visibility: "private",
    share_token: "demo-token-4",
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    item_count: 6,
    total_user_value: 450000,
    total_ai_value: 520000,
  },
]

const demoCollectionImages: Record<string, string[]> = {
  "demo-collection-1": [
    "/vintage-fender-stratocaster-guitar.jpg",
    "/gibson-les-paul-sunburst-guitar.jpg",
    "/fender-telecaster-butterscotch.jpg",
    "/gibson-es-335-cherry.jpg",
  ],
  "demo-collection-2": [
    "/fender-twin-reverb-amp.jpg",
    "/marshall-plexi-amp.jpg",
    "/vox-ac30-amp.jpg",
    "/fender-deluxe-reverb-amp.jpg",
  ],
  "demo-collection-3": [
    "/klon-centaur-overdrive-pedal.jpg",
    "/strymon-timeline-delay-pedal.jpg",
    "/boss-tuner-pedal.jpg",
    "/big-muff-fuzz-pedal.jpg",
  ],
  "demo-wishlist-1": [
    "/1959-gibson-les-paul-standard.jpg",
    "/1963-fender-stratocaster.jpg",
    "/1952-telecaster-butterscotch.jpg",
    "/1960-gibson-es-335.jpg",
  ],
}

const demoItems: (CollectionItem & { collection?: Collection })[] = [
  {
    id: "item-1",
    collection_id: "demo-collection-1",
    listing_id: null,
    title: "1962 Fender Stratocaster",
    subtitle: "Sunburst, all original",
    description: null,
    images: ["/vintage-fender-stratocaster-guitar.jpg"],
    category: "Guitars",
    subcategory: "Electric",
    condition: "Excellent",
    user_estimated_value: 45000,
    ai_suggested_value: 52000,
    ai_value_updated_at: new Date().toISOString(),
    purchase_price: 35000,
    purchase_date: "2020-03-15",
    is_owned: true,
    priority: 1,
    notes: null,
    custom_attributes: {},
    sort_order: 1,
    for_sale: true,
    for_trade: true,
    asking_price: 48000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    collection: demoCollections[0],
  },
  {
    id: "item-2",
    collection_id: "demo-collection-1",
    listing_id: null,
    title: "1959 Gibson Les Paul",
    subtitle: "Burst, PAFs",
    description: null,
    images: ["/gibson-les-paul-sunburst-guitar.jpg"],
    category: "Guitars",
    subcategory: "Electric",
    condition: "Very Good",
    user_estimated_value: 125000,
    ai_suggested_value: 145000,
    ai_value_updated_at: new Date().toISOString(),
    purchase_price: 95000,
    purchase_date: "2018-11-20",
    is_owned: true,
    priority: 1,
    notes: null,
    custom_attributes: {},
    sort_order: 2,
    for_sale: false,
    for_trade: false,
    asking_price: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    collection: demoCollections[0],
  },
  {
    id: "item-3",
    collection_id: null,
    listing_id: null,
    title: "Vintage Tube Amp",
    subtitle: "Needs restoration",
    description: null,
    images: ["/vintage-tube-amp.jpg"],
    category: "Amplifiers",
    subcategory: "Tube",
    condition: "Fair",
    user_estimated_value: 800,
    ai_suggested_value: null,
    ai_value_updated_at: null,
    purchase_price: 200,
    purchase_date: "2024-01-15",
    is_owned: true,
    priority: 0,
    notes: "Needs new caps",
    custom_attributes: {},
    sort_order: 0,
    for_sale: false,
    for_trade: false,
    asking_price: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "item-4",
    collection_id: null,
    listing_id: null,
    title: "Mystery Pickup Set",
    subtitle: "Unmarked humbuckers",
    description: null,
    images: ["/guitar-humbucker-pickups.jpg"],
    category: "Parts",
    subcategory: "Pickups",
    condition: "Good",
    user_estimated_value: null,
    ai_suggested_value: null,
    ai_value_updated_at: null,
    purchase_price: null,
    purchase_date: null,
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
]

const demoForSaleItems = [
  {
    id: "sale-1",
    title: "1962 Fender Stratocaster",
    subtitle: "Sunburst, all original",
    images: ["/vintage-fender-stratocaster-sunburst-guitar.jpg"],
    asking_price: 48000,
    condition: "Excellent",
    listed_at: "2024-01-10T00:00:00Z",
    for_sale: true,
    for_trade: true,
  },
  {
    id: "sale-2",
    title: "Marshall JCM800 2203",
    subtitle: "1982, fully serviced",
    images: ["/marshall-jcm800-tube-amplifier.jpg"],
    asking_price: 2800,
    condition: "Very Good",
    listed_at: "2024-01-08T00:00:00Z",
    for_sale: true,
    for_trade: false,
  },
  {
    id: "sale-3",
    title: "Klon Centaur Gold",
    subtitle: "Original, with box",
    images: ["/klon-centaur-overdrive-pedal-gold.jpg"],
    asking_price: 4500,
    condition: "Excellent",
    listed_at: "2024-01-05T00:00:00Z",
    for_sale: true,
    for_trade: true,
  },
]

const demoPublicWishlistItems = [
  {
    id: "wish-1",
    title: "1959 Gibson Les Paul Standard",
    subtitle: "Sunburst, original PAFs",
    images: ["/1959-gibson-les-paul-standard.jpg"],
    condition: null,
    listed_at: "2024-01-12T00:00:00Z",
  },
  {
    id: "wish-2",
    title: "Dumble Overdrive Special",
    subtitle: "Any year, working condition",
    images: ["/dumble-overdrive-special-amp.jpg"],
    condition: null,
    listed_at: "2024-01-10T00:00:00Z",
  },
  {
    id: "wish-3",
    title: "Original Klon Centaur",
    subtitle: "Silver or gold",
    images: ["/klon-centaur-overdrive-pedal.jpg"],
    condition: null,
    listed_at: "2024-01-08T00:00:00Z",
  },
  {
    id: "wish-4",
    title: "1963 Fender Stratocaster",
    subtitle: "Pre-CBS, original finish",
    images: ["/1963-fender-stratocaster.jpg"],
    condition: null,
    listed_at: "2024-01-05T00:00:00Z",
  },
]

const demoActivity = [
  {
    id: "act-1",
    type: "listing",
    description: "Listed 1962 Fender Stratocaster for sale",
    timestamp: "2024-01-10T14:30:00Z",
  },
  {
    id: "act-2",
    type: "trade",
    description: "Completed trade with @vintagegearnyc",
    timestamp: "2024-01-08T10:15:00Z",
  },
  {
    id: "act-3",
    type: "collection",
    description: "Added Marshall JCM800 to Tube Amplifiers collection",
    timestamp: "2024-01-07T16:45:00Z",
  },
  {
    id: "act-4",
    type: "offer",
    description: "Made offer on Gibson ES-335",
    timestamp: "2024-01-05T09:20:00Z",
  },
  {
    id: "act-5",
    type: "follow",
    description: "Started following @tubescreamer_fan",
    timestamp: "2024-01-03T11:00:00Z",
  },
]

const demoVerification: Verification = {
  email: true,
  phone: true,
  id: false,
}

const demoLinkedAccounts: LinkedAccount[] = [
  { platform: "reddit", username: "guitar_collector_92", verified: true },
  { platform: "ebay", username: "vintageguitars_nash", verified: true },
  { platform: "reverb", username: "NashvilleVintage", verified: true },
  { platform: "facebook", username: null, verified: false },
]

export function ProfileContent() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [collections, setCollections] = useState<Collection[]>([])
  const [collectionImages, setCollectionImages] = useState<Record<string, string[]>>({})
  const [allItems, setAllItems] = useState<(CollectionItem & { collection?: Collection })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)
  const [showInventory, setShowInventory] = useState(false)
  const [activeTab, setActiveTab] = useState<"collections" | "for-sale" | "looking-for" | "activity">("collections")
  const [verification, setVerification] = useState<Verification | null>(null)
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [wishlistExpanded, setWishlistExpanded] = useState(false)

  useEffect(() => {
    const loadProfileData = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setIsDemo(false)

        // Load profile
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (profileData) {
          setProfile(profileData)
        }

        // Load collections with item counts
        const { data: collectionsData } = await supabase
          .from("collections")
          .select(
            `
            *,
            collection_items (
              id,
              images,
              user_estimated_value,
              ai_suggested_value,
              is_owned
            )
          `,
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (collectionsData) {
          const collectionsWithStats: Collection[] = collectionsData.map((collection: any) => {
            const items = collection.collection_items || []
            const ownedItems = items.filter((item: any) => item.is_owned)

            return {
              ...collection,
              item_count: items.length,
              total_user_value: ownedItems.reduce(
                (sum: number, item: any) => sum + (item.user_estimated_value || 0),
                0,
              ),
              total_ai_value: ownedItems.reduce((sum: number, item: any) => sum + (item.ai_suggested_value || 0), 0),
              collection_items: undefined,
            }
          })
          setCollections(collectionsWithStats)

          // Build images map
          const imagesMap: Record<string, string[]> = {}
          collectionsData.forEach((collection: any) => {
            const items = collection.collection_items || []
            const images = items
              .flatMap((item: any) => item.images || [])
              .filter((img: string) => img)
              .slice(0, 4)
            imagesMap[collection.id] = images
          })
          setCollectionImages(imagesMap)
        }

        // Load all items
        const { data: allItemsData } = await supabase
          .from("collection_items")
          .select(
            `
            *,
            collection:collections (
              id,
              name,
              is_wishlist,
              visibility
            )
          `,
          )
          .order("updated_at", { ascending: false })

        if (allItemsData) {
          setAllItems(allItemsData as any)
        }

        // Load verification data
        const { data: verificationData } = await supabase
          .from("verifications")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (verificationData) {
          setVerification(verificationData)
        }

        // Load linked accounts data
        const { data: linkedAccountsData } = await supabase.from("linked_accounts").select("*").eq("user_id", user.id)

        if (linkedAccountsData) {
          setLinkedAccounts(linkedAccountsData)
        }
      } else {
        setIsDemo(true)
        setProfile(demoProfile)
        setCollections(demoCollections)
        setCollectionImages(demoCollectionImages)
        setAllItems(demoItems)
        setVerification(demoVerification)
        setLinkedAccounts(demoLinkedAccounts)
      }

      setIsLoading(false)
    }

    loadProfileData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-muted-foreground">Profile not found</div>
      </div>
    )
  }

  const ownedCollections = collections.filter((c) => !c.is_wishlist)
  const wishlistCollections = collections.filter((c) => c.is_wishlist)
  const totalItems = allItems.filter((i) => i.is_owned).length
  const totalTrades = 12 // Demo value
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  if (showInventory) {
    return (
      <InventoryManager
        items={allItems}
        collections={collections}
        onBack={() => setShowInventory(false)}
        isDemo={isDemo}
      />
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-card">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback className="text-2xl">{profile.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <h1 className="text-2xl font-bold text-foreground">{profile.username}</h1>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                  onClick={() => setShowEditModal(true)}
                >
                  <Pencil className="h-4 w-4" />
                  Edit Profile
                </Button>
                <Link href="/settings">
                  <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" title="Settings">
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-transparent"
                  title="Share Profile"
                  onClick={() => {
                    const profileUrl = `${window.location.origin}/profile/${profile.username}`
                    if (navigator.share) {
                      navigator.share({
                        title: `${profile.username}'s Profile`,
                        url: profileUrl,
                      })
                    } else {
                      navigator.clipboard.writeText(profileUrl)
                      // Could add a toast notification here
                    }
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {profile.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Member since {memberSince}
              </span>
            </div>

            {profile.bio && <p className="mt-3 text-muted-foreground leading-relaxed text-sm">{profile.bio}</p>}

            {/* Verification & Trust section */}
            <div className="mt-4 space-y-3">
              {/* Verification Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground mr-1">Verified:</span>
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                    verification?.email ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Mail className="h-3 w-3" />
                  {verification?.email && <Check className="h-3 w-3" />}
                </div>
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                    verification?.phone ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Phone className="h-3 w-3" />
                  {verification?.phone && <Check className="h-3 w-3" />}
                </div>
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                    verification?.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <ShieldCheck className="h-3 w-3" />
                  {verification?.id && <Check className="h-3 w-3" />}
                </div>
              </div>

              {/* Linked Social Accounts */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground mr-1">Linked:</span>
                {linkedAccounts
                  .filter((a) => a.verified)
                  .map((account) => (
                    <a
                      key={account.platform}
                      href="#"
                      className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                    >
                      {account.platform === "reddit" && (
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                        </svg>
                      )}
                      {account.platform === "ebay" && (
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M5.939 13.315c0 1.449.738 2.64 2.558 2.64 1.252 0 2.022-.547 2.402-1.25h.035v1.099h1.611v-4.522c0-2.026-1.15-2.791-3.01-2.791-1.252 0-2.596.481-3.053 1.82l1.575.336c.215-.575.749-.975 1.5-.975.856 0 1.377.42 1.377 1.162v.246l-1.861.113c-1.752.105-3.134.687-3.134 2.122zm2.68.89c-.82 0-1.232-.388-1.232-.89 0-.582.508-.853 1.33-.904l1.78-.106v.439c0 .925-.785 1.461-1.878 1.461zM0 9.638h1.663v1.074h.035c.384-.733 1.205-1.221 2.326-1.221 1.68 0 2.882 1.251 2.882 3.134 0 1.988-1.135 3.304-2.918 3.304-1.1 0-1.89-.495-2.29-1.199H1.663v3.242H0V9.638zm3.627 4.909c1.092 0 1.737-.876 1.737-1.911 0-1.036-.645-1.856-1.737-1.856-1.085 0-1.786.806-1.786 1.856 0 1.05.7 1.911 1.786 1.911zM22.337 9.491c-1.96 0-3.177 1.316-3.177 3.304 0 2.01 1.253 3.134 3.177 3.134 1.596 0 2.764-.827 3.045-2.087h-1.645c-.19.568-.7.91-1.4.91-.94 0-1.54-.608-1.603-1.555h4.718c.022-.176.035-.36.035-.537 0-1.918-1.1-3.169-3.15-3.169zm-1.54 2.557c.1-.862.722-1.393 1.54-1.393.813 0 1.4.538 1.46 1.393h-3zM17.84 15.929h-1.663v-1.075h-.035c-.385.733-1.206 1.222-2.326 1.222-1.681 0-2.883-1.252-2.883-3.134 0-1.989 1.135-3.305 2.918-3.305 1.1 0 1.891.496 2.29 1.2h.036V6.594h1.663v9.335zm-3.627-4.908c-1.092 0-1.737.876-1.737 1.911 0 1.035.645 1.855 1.737 1.855 1.085 0 1.786-.805 1.786-1.855 0-1.05-.7-1.911-1.786-1.911z" />
                        </svg>
                      )}
                      {account.platform === "reverb" && (
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                          <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      )}
                      {account.platform === "facebook" && (
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      )}
                      <span className="capitalize">{account.platform}</span>
                      <ExternalLink className="h-2.5 w-2.5 opacity-50" />
                    </a>
                  ))}
                {linkedAccounts.filter((a) => a.verified).length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ({linkedAccounts.filter((a) => a.verified).length} linked)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-4">
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{totalItems}</p>
              <p className="text-xs text-muted-foreground">Items</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{ownedCollections.length}</p>
              <p className="text-xs text-muted-foreground">Collections</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{totalTrades}</p>
              <p className="text-xs text-muted-foreground">Trades</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveTab("collections")}
              className={`text-xl font-semibold transition-colors ${
                activeTab === "collections" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Collections
            </button>
            <button
              onClick={() => setActiveTab("for-sale")}
              className={`text-xl font-semibold transition-colors ${
                activeTab === "for-sale" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              For Sale/Trade
            </button>
            <button
              onClick={() => setActiveTab("looking-for")}
              className={`text-xl font-semibold transition-colors ${
                activeTab === "looking-for" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Looking For
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`text-xl font-semibold transition-colors ${
                activeTab === "activity" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Activity
            </button>
          </div>
          {/* Action button based on active tab */}
          {activeTab === "collections" && <Link href="/collections"></Link>}
          {activeTab === "for-sale" && <Link href="/collections?view=master-list"></Link>}
        </div>
      </div>

      {/* Collections Tab Content */}
      {activeTab === "collections" && (
        <>
          {/* Collections Section */}
          <div className="mb-8">
            {ownedCollections.length === 0 ? (
              <div className="bg-card border border-dashed border-border rounded-lg p-8 text-center">
                <FolderOpen className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground mb-3">No collections yet</p>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Plus className="h-4 w-4" />
                  Create Collection
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ownedCollections.map((collection) => (
                  <ProfileCollectionCard
                    key={collection.id}
                    collection={collection}
                    images={collectionImages[collection.id] || []}
                  />
                ))}
              </div>
            )}
          </div>

        </>
      )}

      {/* For Sale Tab Content */}
      {activeTab === "for-sale" && (
        <div className="space-y-4">
          {demoForSaleItems.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-lg p-8 text-center">
              <Tag className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground mb-3">No items for sale</p>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Plus className="h-4 w-4" />
                List an Item
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {demoForSaleItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-lg overflow-hidden transition-all bg-card border border-border hover:border-primary/50"
                >
                  <Link href={`/listings/${item.id}`}>
                    <div className="aspect-[4/3] relative bg-secondary">
                      <Image
                        src={item.images[0] || "/placeholder.svg"}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  </Link>
                  <div className="p-3 space-y-1.5">
                    <Link href={`/listings/${item.id}`}>
                      <h3 className="font-semibold text-sm truncate transition-colors text-foreground group-hover:text-primary">
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                      )}
                    </Link>
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-semibold">${item.asking_price?.toLocaleString()}</span>
                      <div className="flex items-center justify-end gap-1.5">
                        {item.for_sale && <DollarSign className="h-3.5 w-3.5 text-emerald-500" />}
                        {item.for_trade && <Repeat2 className="h-3.5 w-3.5 text-sky-500" />}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Looking For Tab Content */}
      {activeTab === "looking-for" && (
        <div className="space-y-4">
          {demoPublicWishlistItems.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-lg p-8 text-center">
              <Heart className="h-10 w-10 text-chart-5/50 mx-auto mb-3" />
              <p className="text-muted-foreground mb-3">No wishlist items</p>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Plus className="h-4 w-4" />
                Add Wishlist Item
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {demoPublicWishlistItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-lg overflow-hidden transition-all bg-secondary/30 border border-dashed border-border hover:border-chart-5/50"
                >
                  <Link href={`/listings/${item.id}`}>
                    <div className="aspect-[4/3] relative opacity-50">
                      <Image
                        src={item.images[0] || "/placeholder.svg"}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  </Link>
                  <div className="p-3 space-y-1.5">
                    <Link href={`/listings/${item.id}`}>
                      <h3 className="font-semibold text-sm truncate transition-colors text-muted-foreground group-hover:text-chart-5">
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                      )}
                    </Link>
                    <div className="flex items-center justify-end gap-1.5">
                      <Search className="h-3.5 w-3.5 text-chart-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Activity Tab Content */}
      {activeTab === "activity" && (
        <div className="space-y-4">
          {demoActivity.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-lg p-8 text-center">
              <Activity className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {demoActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-4 bg-card border border-border rounded-lg">
                  <div className="p-2 bg-muted rounded-full">
                    {activity.type === "listing" && <Tag className="h-4 w-4 text-primary" />}
                    {activity.type === "trade" && <Package className="h-4 w-4 text-emerald-500" />}
                    {activity.type === "collection" && <FolderOpen className="h-4 w-4 text-blue-500" />}
                    {activity.type === "offer" && <Tag className="h-4 w-4 text-amber-500" />}
                    {activity.type === "follow" && <Heart className="h-4 w-4 text-rose-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {new Date(activity.timestamp).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      {profile && (
        <EditProfileModal
          profile={profile}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={(updatedProfile) => setProfile(updatedProfile)}
          isDemo={isDemo}
        />
      )}
    </div>
  )
}
