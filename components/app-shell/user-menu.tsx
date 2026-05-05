"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { LogOut, Package, Settings, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { currentUser } from "@/lib/current-user"

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const initials = currentUser.displayName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const close = () => setIsOpen(false)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-card",
          isOpen && "bg-card",
        )}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <Avatar className="h-9 w-9 border border-border">
          <AvatarImage src={currentUser.avatarUrl} alt={currentUser.displayName} />
          <AvatarFallback className="bg-card text-xs text-muted-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="hidden min-w-0 flex-col leading-tight sm:flex">
          <span className="truncate text-sm font-semibold text-foreground">
            {currentUser.displayName}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            @{currentUser.username}
          </span>
        </div>
      </button>

      {isOpen ? (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-lg border border-border bg-card shadow-lg"
          role="menu"
        >
          <div className="border-b border-border px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-foreground">
              {currentUser.displayName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              @{currentUser.username}
            </p>
          </div>

          <div className="py-1">
            <Link
              href={currentUser.profileHref}
              onClick={close}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/50"
              role="menuitem"
            >
              <User className="h-4 w-4 text-muted-foreground" />
              View Profile
            </Link>
            <Link
              href="/my-stuff"
              onClick={close}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/50"
              role="menuitem"
            >
              <Package className="h-4 w-4 text-muted-foreground" />
              My Stuff
            </Link>
            <Link
              href="/settings"
              onClick={close}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/50"
              role="menuitem"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              Settings
            </Link>
          </div>

          <div className="border-t border-border py-1">
            <button
              type="button"
              onClick={() => { close(); console.log("[stub] sign out") }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
              role="menuitem"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
