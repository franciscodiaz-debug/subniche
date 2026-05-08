"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ArrowRight, Search, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SubnicheLogo } from "@/components/app-shell/subniche-logo"

const availableNiches = [
  {
    slug: "music-gear",
    name: "Music Gear",
    description: "Guitars, amps, pedals, synths, and more",
    image: "https://picsum.photos/seed/music-gear-hero/80/80",
    href: "/",
  },
]

const comingSoonNiches = [
  "Vintage Watches",
  "Vinyl Records",
  "Vintage Cameras",
  "Motorcycles",
  "Sneakers",
  "Trading Cards",
  "Board Games",
  "Fine Wine",
  "Typewriters",
  "Bicycles",
]

export function NicheSelector() {
  const [search, setSearch] = useState("")
  const [suggestion, setSuggestion] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!suggestion.trim()) return
    setSubmitted(true)
    setSuggestion("")
  }

  const filteredAvailable = availableNiches.filter(
    (n) =>
      !search ||
      n.name.toLowerCase().includes(search.toLowerCase()) ||
      n.description.toLowerCase().includes(search.toLowerCase()),
  )

  const filteredComingSoon = comingSoonNiches.filter(
    (n) => !search || n.toLowerCase().includes(search.toLowerCase()),
  )

  const noResults = search && filteredAvailable.length === 0 && filteredComingSoon.length === 0

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left — selector */}
      <div className="w-full lg:w-[55%]">
        {/* Top bar */}
        <div className="flex h-16 items-center justify-between px-6 md:px-10">
          <Link href="/welcome" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <SubnicheLogo width={100} height={31} />
          <div className="w-16" />
        </div>

        {/* Content */}
        <div className="px-6 pb-16 pt-8 md:px-10 md:py-12">
          <div className="mx-auto w-full max-w-md">
            <h1 className="mb-1 text-3xl font-bold text-foreground md:text-4xl">
              Find your niche<span className="text-primary">.</span>
            </h1>
            <p className="mb-8 text-muted-foreground">
              Choose a community to get started.
            </p>

            {/* Search */}
            <div className="relative mb-8">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for a niche..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-card py-0 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {noResults ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No niches found for <strong className="text-foreground">&ldquo;{search}&rdquo;</strong>
                </p>
                <button
                  onClick={() => setSearch("")}
                  className="mt-2 text-sm text-primary underline-offset-2 hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <>
                {/* Available now */}
                {filteredAvailable.length > 0 && (
                  <div className="mb-8">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Available now
                    </p>
                    <div className="space-y-2">
                      {filteredAvailable.map((niche) => (
                        <Link
                          key={niche.slug}
                          href={niche.href}
                          className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:bg-card/80 hover:shadow-md"
                        >
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-secondary">
                            <Image
                              src={niche.image}
                              alt={niche.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-foreground">{niche.name}</p>
                            <p className="text-sm text-muted-foreground">{niche.description}</p>
                          </div>
                          <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Coming soon */}
                {filteredComingSoon.length > 0 && (
                  <div className="mb-8">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Coming soon
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {filteredComingSoon.map((name) => (
                        <span
                          key={name}
                          className="cursor-default rounded-full border border-border/60 bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground/70"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Suggest a niche */}
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3 border-b border-border px-4 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base">
                  💡
                </div>
                <div>
                  <p className="font-medium text-foreground">Suggest a niche</p>
                  <p className="text-sm text-muted-foreground">Don&apos;t see your community? Let us know.</p>
                </div>
              </div>

              <div className="p-4">
                {submitted ? (
                  <div className="py-4 text-center">
                    <p className="font-medium text-foreground">Thanks for the suggestion!</p>
                    <p className="mt-1 text-sm text-muted-foreground">We&apos;ll consider it for a future niche.</p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="mt-3 text-sm text-primary underline-offset-2 hover:underline"
                    >
                      Suggest another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                      type="text"
                      placeholder="e.g., Vintage Cameras, Board Games..."
                      value={suggestion}
                      onChange={(e) => setSuggestion(e.target.value)}
                      className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <Button type="submit" className="w-full gap-2" disabled={!suggestion.trim()}>
                      <Send className="h-4 w-4" />
                      Submit Suggestion
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right — image (desktop only) */}
      <div className="sticky top-0 hidden h-screen lg:block lg:w-[45%]">
        <Image
          src="https://picsum.photos/seed/music-gear-niche/900/1200"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-background/60" />
        <div className="absolute bottom-12 left-8 right-8">
          <blockquote className="text-xl font-medium leading-relaxed text-white md:text-2xl">
            &ldquo;The best communities are built around shared passion. SubNiche makes that connection frictionless.&rdquo;
          </blockquote>
          <p className="mt-4 text-sm text-white/70">— Kyle K, Founder</p>
        </div>
      </div>
    </div>
  )
}
