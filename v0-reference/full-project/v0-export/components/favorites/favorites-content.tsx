"use client"

import { useSearchParams } from "next/navigation"
import { FollowingSection } from "./following-section"

export function FavoritesContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  
  // Valid tabs are: feed, items, collections, users, searches
  const validTabs = ["feed", "items", "collections", "users", "searches"]
  const tab = tabParam && validTabs.includes(tabParam) ? tabParam : "feed"

  return (
    <div className="min-h-screen w-full">
      <FollowingSection tab={tab} />
    </div>
  )
}
