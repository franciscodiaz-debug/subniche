"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Telescope, Inbox, LogIn, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { currentUser } from "@/lib/current-user"

interface BottomNavProps {
  isAuthenticated: boolean
}

export function BottomNav({ isAuthenticated }: BottomNavProps) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" || pathname.startsWith("/niche/") : pathname === href || pathname.startsWith(href + "/")

  const leftItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/market", icon: Telescope, label: "Market" },
  ]

  const rightItems = [
    { href: isAuthenticated ? "/inbox" : "/login", icon: Inbox, label: "Inbox" },
  ]

  const profileHref = isAuthenticated ? currentUser.profileHref : "/login"
  const profileActive = isActive(profileHref)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background lg:hidden">
      <div className="flex items-center justify-around px-2 pb-2 pt-1">
        {leftItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center rounded-lg py-2 transition-colors",
              isActive(item.href) ? "text-primary" : "text-muted-foreground"
            )}
            aria-label={item.label}
          >
            <item.icon className="h-6 w-6" />
          </Link>
        ))}

        {/* Add Item button in the center */}
        <Link
          href="/create-listing"
          className="relative -top-4 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-primary shadow-lg transition-transform active:scale-95"
          aria-label="Add Item"
        >
          <Plus className="h-7 w-7 text-primary-foreground" />
        </Link>

        {rightItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center rounded-lg py-2 transition-colors",
              isActive(item.href) ? "text-primary" : "text-muted-foreground"
            )}
            aria-label={item.label}
          >
            <item.icon className="h-6 w-6" />
          </Link>
        ))}

        {/* Profile / Login */}
        <Link
          href={profileHref}
          className={cn(
            "flex flex-1 flex-col items-center rounded-lg py-2 transition-colors",
            profileActive ? "text-primary" : "text-muted-foreground"
          )}
          aria-label={isAuthenticated ? "Profile" : "Login"}
        >
          {isAuthenticated ? (
            <Avatar className={cn("h-6 w-6 border", profileActive ? "border-primary" : "border-transparent")}>
              <AvatarImage src={currentUser.avatarUrl} alt={currentUser.displayName} />
              <AvatarFallback className="text-xs">{currentUser.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
          ) : (
            <LogIn className="h-6 w-6" />
          )}
        </Link>
      </div>
    </nav>
  )
}
