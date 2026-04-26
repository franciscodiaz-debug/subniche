"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeft, Store, Bell, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

const settingsNav = [
  {
    section: "Selling",
    items: [
      {
        label: "Seller defaults",
        href: "/settings/seller-defaults",
        icon: Store,
      },
    ],
  },
  {
    section: "Preferences",
    items: [
      {
        label: "Notifications",
        href: "/settings/notifications",
        icon: Bell,
        disabled: true,
      },
      {
        label: "Privacy & security",
        href: "/settings/privacy",
        icon: Shield,
        disabled: true,
      },
    ],
  },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const isSettingsRoot = pathname === "/settings"
  const showSidebar = !isMobile || isSettingsRoot

  return (
    <div className="min-h-screen bg-background flex">
      {/* Secondary Sidebar - Instagram style */}
      {showSidebar && (
        <aside
          className={cn(
            "border-r border-border bg-background",
            isMobile ? "w-full" : "w-[240px] flex-shrink-0 sticky top-0 h-screen",
          )}
        >
          {/* Header */}
          <div className="px-4 py-5 border-b border-border">
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Profile
            </Link>
            <h1 className="text-lg font-semibold text-foreground">Settings</h1>
          </div>

          {/* Navigation - grouped like Instagram */}
          <nav className="py-2">
            {settingsNav.map((group) => (
              <div key={group.section} className="mb-2">
                <p className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {group.section}
                </p>
                {group.items.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon

                  if (item.disabled) {
                    return (
                      <div
                        key={item.href}
                        className="flex items-center gap-3 px-4 py-2.5 text-muted-foreground/40 cursor-not-allowed"
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-sm">{item.label}</span>
                      </div>
                    )
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 transition-colors",
                        isActive
                          ? "bg-card text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-card/50",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            ))}
          </nav>
        </aside>
      )}

      {/* Main Content */}
      {(!isMobile || !isSettingsRoot) && (
        <main className={cn("flex-1 min-h-screen", isMobile ? "w-full" : "")}>
          {isMobile && !isSettingsRoot && (
            <div className="p-4 border-b border-border">
              <Link
                href="/settings"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Settings
              </Link>
            </div>
          )}
          {children}
        </main>
      )}
    </div>
  )
}
