'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, Search, X } from 'lucide-react'
import { Button } from '../ui/button'
import { ProfileChip } from './profile-chip'
import { SearchBar } from './search-bar'

interface HeaderProps {
  isAuthenticated: boolean
  onMobileMenuOpen?: () => void
}

export function Header({ isAuthenticated, onMobileMenuOpen }: HeaderProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  return (
    <header className="relative z-40 bg-transparent">
      {/* Mobile header */}
      <div className="flex items-center justify-between px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={onMobileMenuOpen}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {mobileSearchOpen ? (
          <div className="flex flex-1 items-center gap-2 pl-2">
            <div className="flex-1">
              <SearchBar autoFocus />
            </div>
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
              aria-label="Close search"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setMobileSearchOpen(true)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Desktop header */}
      <div className="hidden items-center gap-4 px-4 py-3 lg:flex lg:px-6 lg:py-4">
        <SearchBar />
        <div className="flex flex-shrink-0 items-center gap-2">
          {isAuthenticated ? (
            <ProfileChip />
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="rounded-lg text-muted-foreground hover:text-foreground"
              >
                <Link href="/login">Sign in</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="rounded-lg border border-primary/50 bg-card text-foreground hover:bg-card/80 hover:text-foreground"
              >
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
