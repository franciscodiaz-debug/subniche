'use client'

import Link from 'next/link'
import { Button } from '../ui/button'
import { ProfileChip } from './profile-chip'
import { SearchBar } from './search-bar'

interface HeaderProps {
  isAuthenticated: boolean
}

export function Header({ isAuthenticated }: HeaderProps) {
  return (
    <header className="relative z-40 bg-transparent">
      <div className="flex items-center gap-4 px-4 py-3 pl-16 md:px-6 md:py-4 lg:pl-6">
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
