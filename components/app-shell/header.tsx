'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, Search } from 'lucide-react'
import { Button } from '../ui/button'
import { MobileSearchPanel } from './mobile-search-panel'
import { ProfileChip } from './profile-chip'
import { SearchBar } from './search-bar'
import { SubnicheLogo } from './subniche-logo'
import { cn } from '@/lib/utils'

interface HeaderProps {
  isAuthenticated: boolean
  mobileChromeHidden?: boolean
  onMobileMenuOpen?: () => void
}

export function Header({ isAuthenticated, mobileChromeHidden = false, onMobileMenuOpen }: HeaderProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-40 bg-background/95 backdrop-blur transition-transform duration-200 will-change-transform supports-[backdrop-filter]:bg-background/80 lg:relative lg:translate-y-0 lg:bg-transparent lg:backdrop-blur-none",
        mobileChromeHidden && "-translate-y-full"
      )}
    >
      {/* Mobile header */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-4 lg:hidden">
        <button
          type="button"
          onClick={onMobileMenuOpen}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex min-w-0 flex-1 items-center justify-center">
          <SubnicheLogo width={86} height={26} priority />
        </div>

        <button
          type="button"
          onClick={() => setMobileSearchOpen(true)}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>

      <MobileSearchPanel
        open={mobileSearchOpen}
        onClose={() => setMobileSearchOpen(false)}
      />

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
