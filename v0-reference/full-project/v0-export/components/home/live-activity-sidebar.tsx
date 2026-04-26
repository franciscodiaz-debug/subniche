"use client"

import { useState, useEffect } from "react"
import { TrendingDown, Sparkles, FolderPlus, Bell, Eye, Search } from "lucide-react"
import Link from "next/link"

interface ActivityItem {
  id: string
  type: "price-drop" | "new-match" | "collection-item" | "watchlist-update" | "saved-search-hit"
  message: string
  linkText: string
  href: string
  timestamp: Date
}

const activityTypes = [
  {
    type: "price-drop" as const,
    icon: TrendingDown,
    items: [
      { message: "MXR Carbon Copy dropped to $89", linkText: "View deal", href: "/listings/1" },
      { message: "Boss Katana 50 now $299 (-$50)", linkText: "View deal", href: "/listings/2" },
      { message: "Sequential Prophet 6 reduced $200", linkText: "View deal", href: "/listings/3" },
      { message: "Strymon Timeline dropped to $350", linkText: "View deal", href: "/listings/4" },
    ],
  },
  {
    type: "new-match" as const,
    icon: Sparkles,
    items: [
      { message: "New match: MIJ Telecaster in your range", linkText: "See match", href: "/listings/5" },
      { message: "Trade match found for your Jazzmaster", linkText: "See match", href: "/listings/6" },
      { message: "Perfect match: ES-335 under $2k", linkText: "See match", href: "/listings/7" },
      { message: "3 new items match your criteria", linkText: "See all", href: "/explore" },
    ],
  },
  {
    type: "collection-item" as const,
    icon: FolderPlus,
    items: [
      { message: "New in Vintage Pedals: Boss CE-1", linkText: "View item", href: "/listings/8" },
      { message: "Added to '70s Japanese Guitars", linkText: "View collection", href: "/collection" },
      { message: "Rare find added to Boutique Amps", linkText: "View item", href: "/listings/9" },
    ],
  },
  {
    type: "watchlist-update" as const,
    icon: Eye,
    items: [
      { message: "Price changed on watched Fender Twin", linkText: "View update", href: "/watchlist" },
      { message: "Watched item has new offer pending", linkText: "View item", href: "/listings/10" },
      { message: "Seller responded on watched item", linkText: "View message", href: "/messages" },
    ],
  },
  {
    type: "saved-search-hit" as const,
    icon: Search,
    items: [
      { message: "New listing matches 'Telecaster under $1,200'", linkText: "View listing", href: "/listings/11" },
      { message: "2 new hits for 'Tube screamer variants'", linkText: "See results", href: "/explore" },
      { message: "Rare find in 'Vintage Klon clones'", linkText: "View listing", href: "/listings/12" },
    ],
  },
]

const iconColors = {
  "price-drop": "text-orange-500 bg-orange-500/10",
  "new-match": "text-emerald-500 bg-emerald-500/10",
  "collection-item": "text-blue-500 bg-blue-500/10",
  "watchlist-update": "text-purple-500 bg-purple-500/10",
  "saved-search-hit": "text-amber-500 bg-amber-500/10",
}

function generateRandomActivity(): ActivityItem {
  const typeData = activityTypes[Math.floor(Math.random() * activityTypes.length)]
  const item = typeData.items[Math.floor(Math.random() * typeData.items.length)]
  return {
    id: Math.random().toString(36).substring(7),
    type: typeData.type,
    message: item.message,
    linkText: item.linkText,
    href: item.href,
    timestamp: new Date(),
  }
}

function formatTime(date: Date): string {
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return "Just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

export function LiveActivitySidebar() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const initial = Array.from({ length: 8 }, generateRandomActivity)
    setActivities(initial)

    const interval = setInterval(
      () => {
        const newActivity = generateRandomActivity()
        setActivities((prev) => [newActivity, ...prev].slice(0, 15))
      },
      4000 + Math.random() * 4000,
    )

    return () => clearInterval(interval)
  }, [])

  if (!isVisible) return null

  return (
    <div className="hidden xl:block w-72 shrink-0">
      <div className="sticky top-4 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-sm font-semibold text-foreground">Live Activity</span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bell className="h-4 w-4" />
          </button>
        </div>

        {/* Activity Feed */}
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="divide-y divide-border">
            {activities.map((activity, index) => {
              const IconComponent = activityTypes.find((t) => t.type === activity.type)?.icon || Sparkles
              return (
                <Link
                  key={activity.id}
                  href={activity.href}
                  className={`block px-4 py-3 hover:bg-muted/50 transition-colors ${
                    index === 0 ? "animate-in slide-in-from-top-2 fade-in duration-500 bg-muted/30" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`p-1.5 rounded-md shrink-0 ${iconColors[activity.type]}`}>
                      <IconComponent className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground leading-relaxed">{activity.message}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-muted-foreground">{formatTime(activity.timestamp)}</span>
                        <span className="text-[10px] font-medium text-primary">{activity.linkText}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border bg-muted/30">
          <p className="text-[10px] text-muted-foreground text-center">Updates based on your activity</p>
        </div>
      </div>
    </div>
  )
}
