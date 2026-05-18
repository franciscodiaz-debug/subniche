"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Repeat2, Send, LogIn, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { currentUser } from "@/lib/current-user"

interface BottomNavProps {
  isAuthenticated: boolean
  mobileChromeHidden?: boolean
}

export function BottomNav({ isAuthenticated, mobileChromeHidden = false }: BottomNavProps) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" || pathname.startsWith("/niche/") : pathname === href || pathname.startsWith(href + "/")

  const leftItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: isAuthenticated ? "/inbox" : "/login", icon: Send, label: "Inbox" },
  ]

  const rightItems = [
    { href: "/market", icon: Repeat2, label: "Market" },
  ]

  const profileHref = isAuthenticated ? currentUser.profileHref : "/login"
  const profileActive = isActive(profileHref)

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur transition-transform duration-200 will-change-transform lg:hidden",
        mobileChromeHidden && "translate-y-full"
      )}
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-around gap-1 px-5 pb-2 pt-2">
        {leftItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex h-11 flex-1 items-center justify-center rounded-lg transition-colors",
              isActive(item.href)
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={item.label}
          >
            <item.icon className="h-6 w-6 stroke-[2.25]" />
          </Link>
        ))}

        <Link
          href="/create-listing"
          className="mx-3 flex h-12 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
          aria-label="Create listing"
        >
          <Plus className="h-7 w-7 stroke-[2.15] text-muted-foreground" />
        </Link>

        {rightItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex h-11 flex-1 items-center justify-center rounded-lg transition-colors",
              isActive(item.href)
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={item.label}
          >
            <item.icon className="h-6 w-6 stroke-[2.25]" />
          </Link>
        ))}

        {/* Profile / Login */}
        <Link
          href={profileHref}
          className={cn(
            "flex h-11 flex-1 items-center justify-center rounded-lg transition-colors",
            profileActive
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label={isAuthenticated ? "Profile" : "Login"}
        >
          {isAuthenticated ? (
            <Avatar className={cn("h-7 w-7 border", profileActive ? "border-primary" : "border-transparent")}>
              <AvatarImage src={currentUser.avatarUrl} alt={currentUser.displayName} />
              <AvatarFallback className="text-xs">{currentUser.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
          ) : (
            <LogIn className="h-7 w-7 stroke-[2.1]" />
          )}
        </Link>
      </div>
    </nav>
  )
}
