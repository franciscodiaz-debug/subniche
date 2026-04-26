"use client"

import { useState, Suspense } from "react"
import { Sidebar } from "@/components/sidebar"
import { MobileMenuButton } from "@/components/mobile-menu-button"
import { DiscoverContent } from "@/components/discover/discover-content"

export default function DiscoverPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false)

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
          <DiscoverContent onFilterSidebarChange={setFilterSidebarOpen} />
        </Suspense>
      </main>
    </div>
  )
}
