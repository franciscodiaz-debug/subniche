"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { MobileMenuButton } from "@/components/mobile-menu-button"
import { MarketContent } from "@/components/market/market-content"

export default function MarketPage() {
  const searchParams = useSearchParams()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false)
  
  // Get the tab from the URL, default to "for-sale"
  const initialTab = searchParams?.get("tab") || "for-sale"

  return (
    <div className="flex min-h-screen w-full">
      <Suspense fallback={<div className="hidden lg:block w-[72px] flex-shrink-0" />}>
        {!filterSidebarOpen && (
          <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} collapsed={false} />
        )}
      </Suspense>

      {/* Mobile menu button */}
      <MobileMenuButton onClick={() => setMobileMenuOpen(true)} />

      {/* Main content area */}
      <main className="flex-1 w-full min-w-0">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-screen">
              <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
          }
        >
          <MarketContent 
            initialTab={initialTab as "for-sale" | "trade-matches"}
            onFilterSidebarChange={setFilterSidebarOpen} 
          />
        </Suspense>
      </main>
    </div>
  )
}
