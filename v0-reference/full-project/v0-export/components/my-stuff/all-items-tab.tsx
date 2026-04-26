"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Collection, CollectionItem } from "@/lib/types"
import { MasterList } from "@/components/collection/master-list"

const demoCollections: Collection[] = [
  {
    id: "demo-collection-1",
    user_id: "demo-user",
    name: "My Guitars",
    description: "My personal guitar collection",
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
  },
  {
    id: "demo-collection-2",
    user_id: "demo-user",
    name: "Pedal Board",
    description: "Effects pedals I've collected",
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
  },
  {
    id: "demo-wishlist-1",
    user_id: "demo-user",
    name: "Dream Guitars",
    description: "Guitars I want to own someday",
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
  },
]

const demoMasterListItems: (CollectionItem & { collection?: Collection })[] = [
  {
    id: "demo-item-1",
    collection_id: "demo-collection-1",
    listing_id: null,
    title: "1962 Fender Stratocaster",
    subtitle: "Sunburst finish, all original",
    description: "Amazing vintage strat",
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
    id: "demo-item-2",
    collection_id: "demo-collection-1",
    listing_id: null,
    title: "Gibson Les Paul Standard",
    subtitle: "Cherry Sunburst, 2019",
    description: "Modern classic",
    images: ["/gibson-les-paul-sunburst-guitar.jpg"],
    category: "Guitars",
    subcategory: "Electric",
    condition: "Mint",
    user_estimated_value: 2800,
    ai_suggested_value: 2600,
    ai_value_updated_at: new Date().toISOString(),
    purchase_price: 2500,
    purchase_date: "2019-06-20",
    is_owned: true,
    priority: 2,
    notes: null,
    custom_attributes: {},
    sort_order: 2,
    for_sale: false,
    for_trade: true,
    asking_price: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    collection: demoCollections[0],
  },
  {
    id: "demo-item-3",
    collection_id: "demo-collection-2",
    listing_id: null,
    title: "Klon Centaur Overdrive",
    subtitle: "Gold horsie, original",
    description: "The holy grail of overdrives",
    images: ["/klon-centaur-overdrive-pedal.jpg"],
    category: "Pedals",
    subcategory: "Overdrive",
    condition: "Excellent",
    user_estimated_value: 3500,
    ai_suggested_value: 4200,
    ai_value_updated_at: new Date().toISOString(),
    purchase_price: 1800,
    purchase_date: "2015-09-10",
    is_owned: true,
    priority: 1,
    notes: null,
    custom_attributes: {},
    sort_order: 1,
    for_sale: true,
    for_trade: false,
    asking_price: 3800,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    collection: demoCollections[1],
  },
  {
    id: "demo-item-4",
    collection_id: null,
    listing_id: null,
    title: "Vintage Tube Amp",
    subtitle: "Needs restoration",
    description: "Found at estate sale",
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
    notes: "Needs new caps and tubes",
    custom_attributes: {},
    sort_order: 0,
    for_sale: false,
    for_trade: false,
    asking_price: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    collection: undefined,
  },
  {
    id: "demo-item-5",
    collection_id: null,
    listing_id: null,
    title: "Mystery Pickup Set",
    subtitle: "Unmarked humbuckers",
    description: "Acquired in trade",
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
    notes: "Need to test and identify",
    custom_attributes: {},
    sort_order: 0,
    for_sale: false,
    for_trade: false,
    asking_price: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    collection: undefined,
  },
]

export function AllItemsTab() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [allItems, setAllItems] = useState<(CollectionItem & { collection?: Collection })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)
  const [itemsView, setItemsView] = useState<"grid" | "list">("grid")

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setIsDemo(false)

        // Load collections
        const { data: collectionsData } = await supabase
          .from("collections")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (collectionsData) {
          setCollections(collectionsData)
        }

        // Load all items
        const { data: allItemsData } = await supabase
          .from("collection_items")
          .select(`
            *,
            collection:collections (
              id,
              name,
              is_wishlist,
              visibility
            )
          `)
          .order("updated_at", { ascending: false })

        if (allItemsData) {
          setAllItems(allItemsData as any)
        }
      } else {
        setIsDemo(true)
        setCollections(demoCollections)
        setAllItems(demoMasterListItems)
      }
      setIsLoading(false)
    }

    loadData()
  }, [])

  const handleItemUpdate = (updatedItem: CollectionItem) => {
    setAllItems((prev) => prev.map((item) => (item.id === updatedItem.id ? { ...item, ...updatedItem } : item)))
  }

  const handleItemDelete = (itemId: string) => {
    setAllItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[40vh]">
        <div className="text-muted-foreground">Loading items...</div>
      </div>
    )
  }

  return (
    <div>
      
      <MasterList
        items={allItems}
        collections={collections}
        onItemUpdate={handleItemUpdate}
        onItemDelete={handleItemDelete}
        view={itemsView}
        onViewChange={setItemsView}
        isDemo={isDemo}
      />
    </div>
  )
}
