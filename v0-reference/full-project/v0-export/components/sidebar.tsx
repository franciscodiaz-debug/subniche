"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Home, Telescope, Repeat2, Users, Plus, Package, X, Inbox, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { demoCommunitiesEnhanced } from "@/lib/demo-data"
import { NicheSwitcher } from "@/components/niche-switcher"

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
  collapsed?: boolean
}

export function Sidebar({ mobileOpen = false, onMobileClose, collapsed = false }: SidebarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [communitiesExpanded, setCommunitiesExpanded] = useState(false)
  const [isDiscoverOrTradeArea, setIsDiscoverOrTradeArea] = useState(false)

  const tradeCounts = { perfect_matches: 3, inbound_interest: 5 }
  const hasPerfectMatches = tradeCounts.perfect_matches > 0
  const hasInboundOnly = !hasPerfectMatches && tradeCounts.inbound_interest > 0

  const unreadMessages = 3

  const isMyStuffArea = pathname === "/my-stuff" || pathname.startsWith("/my-stuff/")
  const isCommunitiesArea = pathname === "/communities" || pathname.startsWith("/communities/")

  const isMarketArea = pathname === "/market" || pathname.startsWith("/market/")
  const isDiscoverArea = isMarketArea && searchParams?.get("tab") === "for-sale"
  const isTradeArea = isMarketArea && searchParams?.get("tab") === "trade-matches"
  const isFavoritesArea = pathname === "/favorites" || pathname.startsWith("/favorites/")

  const myCommunities = demoCommunitiesEnhanced.filter((c) => c.is_member).slice(0, 5)

  const isCollectionsArea = pathname === "/collections" || pathname.startsWith("/collections/")
  const isCollectionsActive = pathname === "/collections?tab=collections"
  const isAllItemsActive = pathname === "/collections?tab=collections&view=all-items"

  useEffect(() => {
    setIsDiscoverOrTradeArea(isDiscoverArea || isTradeArea)
    if (isCommunitiesArea) {
      setCommunitiesExpanded(true)
    } else {
      setCommunitiesExpanded(false)
    }
  }, [isCommunitiesArea, isDiscoverArea, isTradeArea])

  useEffect(() => {
    if (mobileOpen && onMobileClose) {
      onMobileClose()
    }
  }, [pathname])

  const desktopNavItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/market?tab=for-sale", icon: Telescope, label: "Market" },
    {
      href: "/market?tab=trade-matches",
      icon: Repeat2,
      label: "Trade",
      perfectDot: hasPerfectMatches,
      inboundDot: hasInboundOnly,
    },
  ]

  const mobileNavItems = [
    { href: "/", icon: Home, label: "Home" },
    {
      href: "/market?tab=for-sale",
      icon: Telescope,
      label: "Market",
      perfectDot: hasPerfectMatches,
      inboundDot: hasInboundOnly,
    },
  ]

  const isProfileActive = pathname === "/profile" || pathname.startsWith("/profile/")

  const renderNavItems = (items: typeof desktopNavItems, isMobileOnly = false) => {
    return items.map((item) => {
      let isActive = false
      
      if (item.label === "Market") {
        isActive = isDiscoverArea
      } else if (item.label === "Trade") {
        isActive = isTradeArea
      } else if (isMobileOnly && item.label === "Market") {
        isActive = isMarketArea
      } else {
        isActive = pathname === item.href || pathname.startsWith(item.href.split("?")[0] + "/")
      }

      return (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg mb-1 transition-colors relative",
            collapsed ? "px-0 py-3 justify-center" : "px-4 py-3",
            isActive ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-card/50",
          )}
          title={collapsed ? item.label : undefined}
        >
          <span className="relative flex-shrink-0">
            <item.icon className="h-5 w-5" />
            {item.perfectDot && (
              <span className="absolute -top-1 -right-1 bg-amber-500 rounded-full ring-1 ring-background w-2 h-2" />
            )}
            {item.inboundDot && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500/60 rounded-full ring-2 ring-background" />
            )}
          </span>
          {!collapsed && (
            <>
              <span className="flex-1">{item.label}</span>
            </>
          )}
        </Link>
      )
    })
  }

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onMobileClose} />}

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-background border-r border-border flex flex-col z-50 transition-all duration-300",
          collapsed ? "w-[72px]" : "w-[220px]",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className={cn("flex items-center p-4", collapsed ? "justify-center" : "justify-between px-6")}>
          {collapsed ? (
            <Link href="/" className="text-xl font-bold text-primary">
              M
            </Link>
          ) : (
            <>
              <Link href="/" className="text-2xl font-bold text-foreground">
                SubNiche
              </Link>
              <button
                onClick={onMobileClose}
                className="lg:hidden p-2 hover:bg-card rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        <div className={cn("mb-6", collapsed ? "px-2" : "px-4")}>
          <Link
            href="/create-listing"
            className={cn(
              "flex items-center justify-center gap-2 py-3 bg-card border border-primary/50 rounded-lg text-foreground hover:bg-card/80 transition-colors w-full",
              collapsed ? "px-0" : "px-4",
            )}
            title={collapsed ? "Add Item" : undefined}
          >
            <Plus className="h-5 w-5 text-primary" />
            {!collapsed && <span>Add Item  </span>}
          </Link>
        </div>

        <nav className="flex-1 px-2 overflow-y-auto">
          <div className="hidden lg:block">{renderNavItems(desktopNavItems)}</div>

          <div className="lg:hidden">{renderNavItems(mobileNavItems, true)}</div>

          <Link
            href="/communities"
            className={cn(
              "flex items-center gap-3 rounded-lg mb-1 transition-colors relative",
              collapsed ? "px-0 py-3 justify-center" : "px-4 py-3",
              isCommunitiesArea
                ? "bg-card text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-card/50",
            )}
            title={collapsed ? "Communities" : undefined}
          >
            <Users className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="flex-1 text-left">Communities</span>}
          </Link>

          <Link
            href="/favorites"
            className={cn(
              "flex items-center gap-3 rounded-lg mb-1 transition-colors relative",
              collapsed ? "px-0 py-3 justify-center" : "px-4 py-3",
              isFavoritesArea
                ? "bg-card text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-card/50",
            )}
            title={collapsed ? "Following" : undefined}
          >
            <Heart className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="flex-1 text-left">Following</span>}
          </Link>

          <Link
            href="/my-stuff"
            className={cn(
              "flex items-center gap-3 rounded-lg mb-1 transition-colors relative",
              collapsed ? "px-0 py-3 justify-center" : "px-4 py-3",
              isMyStuffArea
                ? "bg-card text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-card/50",
            )}
            title={collapsed ? "My Stuff" : undefined}
          >
            <Package className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="flex-1 text-left">My Stuff</span>}
          </Link>

          <Link
            href="/inbox"
            className={cn(
              "flex items-center gap-3 rounded-lg mb-1 transition-colors relative",
              collapsed ? "px-0 py-3 justify-center" : "px-4 py-3",
              pathname === "/inbox" || pathname.startsWith("/inbox/")
                ? "bg-card text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-card/50",
            )}
            title={collapsed ? "Inbox" : undefined}
          >
            <Inbox className="h-5 w-5 flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">Inbox</span>
                {unreadMessages > 0 && (
                  <span className="bg-amber-500 text-black text-[10px] font-bold min-w-[18px] h-[18px] px-1.5 rounded-full flex items-center justify-center">
                    {unreadMessages > 99 ? "99+" : unreadMessages}
                  </span>
                )}
              </>
            )}
          </Link>

          <Link
            href="/profile"
            className={cn(
              "flex items-center gap-3 rounded-lg mb-1 transition-colors",
              collapsed ? "px-0 py-3 justify-center" : "px-4 py-3",
              isProfileActive
                ? "bg-card text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-card/50",
            )}
            title={collapsed ? "Profile" : undefined}
          >
            <Avatar className={cn("h-5 w-5 border", isProfileActive ? "border-primary" : "border-transparent")}>
              <AvatarImage src="/diverse-user-avatars.png" />
              <AvatarFallback className="text-[10px]">U</AvatarFallback>
            </Avatar>
            {!collapsed && <span>Profile</span>}
          </Link>
        </nav>

        <div className={cn("border-t border-border", collapsed ? "px-2 py-2" : "px-2 py-2")}>
          <NicheSwitcher collapsed={collapsed} />
        </div>
      </aside>
    </>
  )
}
