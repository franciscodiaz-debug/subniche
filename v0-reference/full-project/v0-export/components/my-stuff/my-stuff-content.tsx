"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { CollectionsTab } from "./collections-tab"
import { AllItemsTab } from "./all-items-tab"

interface MyStuffContentProps {
  tab?: string
}

export function MyStuffContent({ tab = "collections" }: MyStuffContentProps) {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  
  // Valid tabs are: collections, all-items
  const validTabs = ["collections", "all-items"]
  const initialTab = tabParam && validTabs.includes(tabParam) ? tabParam : tab
  
  const [activeTab, setActiveTab] = useState(initialTab)

  // Sync activeTab with URL param changes
  useEffect(() => {
    const newTab = tabParam && validTabs.includes(tabParam) ? tabParam : tab
    setActiveTab(newTab)
  }, [tabParam, tab])

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto lg:py-4">
      {/* Page Title */}
      <h1 className="font-bold text-foreground text-2xl mb-5">My Stuff</h1>

      {/* Simple Tab Navigation - matching Following page style */}
      <div className="mb-8">
        <div className="flex items-center gap-8">
          <button
            onClick={() => setActiveTab("collections")}
            className={cn(
              "text-xl font-semibold transition-colors whitespace-nowrap pb-2",
              activeTab === "collections" ? "text-foreground border-b-2 border-b-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Collections
          </button>
          <button
            onClick={() => setActiveTab("all-items")}
            className={cn(
              "text-xl font-semibold transition-colors whitespace-nowrap pb-2",
              activeTab === "all-items" ? "text-foreground border-b-2 border-b-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Items
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "collections" && <CollectionsTab />}
      {activeTab === "all-items" && <AllItemsTab />}
    </div>
  )
}
