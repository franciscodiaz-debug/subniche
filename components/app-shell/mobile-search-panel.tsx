"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { exploreItems } from "@/lib/explore-data"
import { searchCollections, searchUsers } from "@/lib/search-data"
import { useDebouncedValue } from "@/hooks/use-debounced-value"

interface MobileSearchPanelProps {
  open: boolean
  onClose: () => void
}

const quickSearches = ["Fender", "Gibson", "Pedals", "Vintage", "Acoustic"]

export function MobileSearchPanel({ open, onClose }: MobileSearchPanelProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const [panelVisible, setPanelVisible] = useState(false)
  // Filter runs on the debounced query so we don't rescan the mock data on
  // every keystroke. See SearchBar for the same pattern.
  const debouncedQuery = useDebouncedValue(query, 200)
  const needle = debouncedQuery.trim().toLowerCase()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let frame = 0
    let timer = 0

    if (open) {
      setShouldRender(true)
      frame = requestAnimationFrame(() => setPanelVisible(true))
    } else {
      setPanelVisible(false)
      timer = window.setTimeout(() => setShouldRender(false), 300)
    }

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [open])

  useEffect(() => {
    if (!shouldRender) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const frame = requestAnimationFrame(() => inputRef.current?.focus())

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [shouldRender, onClose])

  const itemResults = useMemo(() => {
    if (!needle) {
      return [...exploreItems]
        .sort((a, b) => (b.trendingScore ?? 0) - (a.trendingScore ?? 0))
        .slice(0, 5)
    }

    return exploreItems
      .filter(
        (item) =>
          item.title.toLowerCase().includes(needle) ||
          item.subtitle?.toLowerCase().includes(needle) ||
          item.collections?.some((collection) =>
            collection.name.toLowerCase().includes(needle),
          ),
      )
      .slice(0, 6)
  }, [needle])

  const collectionResults = useMemo(() => {
    if (!needle) return []
    return searchCollections
      .filter((collection) => collection.name.toLowerCase().includes(needle))
      .slice(0, 4)
  }, [needle])

  const userResults = useMemo(() => {
    if (!needle) return []
    return searchUsers
      .filter(
        (user) =>
          user.name.toLowerCase().includes(needle) ||
          user.username.toLowerCase().includes(needle),
      )
      .slice(0, 4)
  }, [needle])

  const closeAndNavigate = (href: string) => {
    onClose()
    router.push(href)
  }

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    closeAndNavigate(`/market?q=${encodeURIComponent(trimmed)}`)
  }

  const chooseQuickSearch = (value: string) => {
    setQuery(value)
    inputRef.current?.focus()
  }

  const panel = (
    <div
      aria-hidden={!panelVisible}
      className={cn(
        "fixed inset-0 z-[100] h-dvh w-screen overflow-hidden bg-background transition-transform duration-300 ease-out lg:hidden",
        panelVisible ? "translate-x-0" : "translate-x-full",
      )}
    >
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex flex-shrink-0 items-center gap-3 px-4 pb-3 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-card"
            aria-label="Close search"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Search</h1>
        </div>

        <form onSubmit={submitSearch} className="px-4">
          <div className="flex h-14 items-center gap-3 rounded-2xl border border-transparent bg-card px-4 focus-within:border-border">
            <Search className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              inputMode="search"
              enterKeyHint="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search gear, people, collections"
              className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  inputRef.current?.focus()
                }}
                className="-mr-1 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </form>

        <div className="scrollbar-hide flex flex-shrink-0 gap-2 overflow-x-auto px-4 py-4">
          {quickSearches.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => chooseQuickSearch(term)}
              className="flex-shrink-0 rounded-full bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {term}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto border-t border-border">
          {!needle ? (
            <section className="px-4 py-5">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-lg font-semibold text-foreground">Trending in Guitars</h2>
                <button
                  type="button"
                  onClick={() => closeAndNavigate("/market?sort=trending")}
                  className="text-sm font-medium text-primary"
                >
                  View all
                </button>
              </div>
              <ResultList items={itemResults} onClose={onClose} />
            </section>
          ) : (
            <div className="divide-y divide-border">
              <section className="px-4 py-5">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Items
                </h2>
                {itemResults.length > 0 ? (
                  <ResultList items={itemResults} onClose={onClose} />
                ) : (
                  <EmptyRow label="No items found" />
                )}
              </section>

              {collectionResults.length > 0 ? (
                <section className="px-4 py-5">
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Collections
                  </h2>
                  <div className="space-y-3">
                    {collectionResults.map((collection) => (
                      <Link
                        key={collection.id}
                        href={`/collection/${collection.id}`}
                        onClick={onClose}
                        className="flex items-center gap-3"
                      >
                        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-card text-xl">
                          {collection.icon}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-base font-medium text-foreground">
                            {collection.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {collection.memberCount.toLocaleString("en-US")} members
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}

              {userResults.length > 0 ? (
                <section className="px-4 py-5">
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    People
                  </h2>
                  <div className="space-y-3">
                    {userResults.map((user) => (
                      <Link
                        key={user.id}
                        href={`/profile/${user.username}`}
                        onClick={onClose}
                        className="flex items-center gap-3"
                      >
                        <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-full bg-card">
                          <Image
                            src={user.avatar}
                            alt={user.name}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-base font-medium text-foreground">
                            {user.name}
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            @{user.username}
                            {user.location ? ` · ${user.location}` : ""}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return mounted && shouldRender ? createPortal(panel, document.body) : null
}

function ResultList({
  items,
  onClose,
}: {
  items: typeof exploreItems
  onClose: () => void
}) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/listings/${item.id}`}
          onClick={onClose}
          className="flex items-center gap-3"
        >
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-card">
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-medium text-foreground">
              {item.title}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {item.subtitle}
              {item.location ? ` · ${item.location}` : ""}
            </p>
            {typeof item.price === "number" ? (
              <p className="mt-0.5 text-sm font-medium text-muted-foreground">
                ${item.price.toLocaleString("en-US")}
              </p>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  )
}

function EmptyRow({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/40 px-4 py-8 text-center text-sm text-muted-foreground">
      {label}
    </div>
  )
}
