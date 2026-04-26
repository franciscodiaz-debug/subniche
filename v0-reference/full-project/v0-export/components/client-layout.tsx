"use client"

import type React from "react"

import { useState, Suspense } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"
import { MobileMenuButton } from "./mobile-menu-button"
import { Header } from "./header"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isInboxPage = pathname === "/inbox" || pathname.startsWith("/inbox/")
  const sidebarCollapsed = isInboxPage

  return (
    <div className="flex min-h-screen w-full">
      <Suspense fallback={<div className="hidden lg:block lg:w-[220px] bg-sidebar" />}>
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
          collapsed={sidebarCollapsed}
        />
      </Suspense>
      <MobileMenuButton onClick={() => setMobileMenuOpen(true)} />
      <main className={`flex-1 w-full min-w-0 ${sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[220px]"}`}>
        <Header />
        {children}
      </main>
    </div>
  )
}
