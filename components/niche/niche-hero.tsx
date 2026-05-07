"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAdminSettings } from "@/lib/admin-settings-context"
import type { AuthState } from "@/lib/auth"
import type { CurrentUser } from "@/lib/current-user"

interface NicheHeroProps {
  slug: string
  authState: AuthState
  user?: CurrentUser
}

export function NicheHero({ slug, authState, user }: NicheHeroProps) {
  const { niches } = useAdminSettings()
  const niche = niches.find((n) => n.slug === slug)

  if (!niche) return null

  const heroSrc = niche.heroImageUrl ?? "/hero-guitar.jpg"
  const isLoggedIn = authState === "logged-in" || authState === "onboarding"

  return (
    <section className="relative isolate overflow-hidden bg-background">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={heroSrc}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/30"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/90"
        />
      </div>

      <div className={`px-4 md:px-8 ${isLoggedIn ? "pb-10 pt-2 md:pb-12 md:pt-4" : "pb-14 pt-10 md:pb-20 md:pt-16"}`}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-lg font-semibold md:text-xl">
          <span className="text-primary">SN</span>
          <span className="text-muted-foreground/60">/</span>
          <span className="text-foreground">{niche.name}</span>
        </div>

        {isLoggedIn ? (
          <>
            <h1 className="mt-2 max-w-3xl text-balance text-2xl font-bold leading-tight tracking-tight text-foreground md:text-[2rem] md:leading-[1.15]">
              {niche.tagline || `Welcome to ${niche.name}.`}
            </h1>
            {user && (
              <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
                Welcome back, {user.displayName} &mdash; your crew&apos;s been busy.
                Fresh listings, new trade matches, and a few rare finds are waiting for you.
              </p>
            )}
          </>
        ) : (
          <>
            <h1 className="mt-4 max-w-3xl text-balance text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl md:leading-[1.1]">
              {niche.tagline || `Trade, sell, and collect ${niche.name.toLowerCase()}`}{" "}
              <span className="text-primary">with people who get it.</span>
            </h1>
            {niche.description && (
              <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
                {niche.description}
              </p>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="rounded-xl">
                <Link href="/create-listing">List your gear</Link>
              </Button>
              <Button asChild size="lg" variant="quiet_outline" className="rounded-xl border-border/50 bg-card/60 backdrop-blur">
                <Link href="/market?tab=for-sale">Browse the market</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
