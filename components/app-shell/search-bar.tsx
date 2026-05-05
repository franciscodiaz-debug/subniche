"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { exploreItems } from "@/lib/explore-data"
import { searchCollections, searchUsers } from "@/lib/search-data"

export function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const needle = query.trim().toLowerCase()

  const itemResults = needle
    ? exploreItems
        .filter(
          (i) =>
            i.title.toLowerCase().includes(needle) ||
            i.subtitle?.toLowerCase().includes(needle),
        )
        .slice(0, 4)
    : []

  const collectionResults = needle
    ? searchCollections
        .filter((c) => c.name.toLowerCase().includes(needle))
        .slice(0, 3)
    : []

  const userResults = needle
    ? searchUsers
        .filter(
          (u) =>
            u.name.toLowerCase().includes(needle) ||
            u.username.toLowerCase().includes(needle),
        )
        .slice(0, 3)
    : []

  const hasResults =
    itemResults.length > 0 ||
    collectionResults.length > 0 ||
    userResults.length > 0

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    setOpen(false)
    router.push(`/market?q=${encodeURIComponent(trimmed)}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setQuery("")
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  const close = () => setOpen(false)

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-xl flex-1">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search gear, musicians, communities..."
            className="w-full rounded-lg border border-transparent bg-card/60 py-2 pl-4 pr-10 text-sm backdrop-blur placeholder:text-muted-foreground hover:bg-card/80 focus:border-border focus:bg-card focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("")
                setOpen(false)
                inputRef.current?.focus()
              }}
              className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
        </div>
      </form>

      {open && needle && hasResults ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-border bg-card shadow-xl">
          {itemResults.length > 0 ? (
            <div>
              <p className="px-3 pb-1 pt-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Items
              </p>
              {itemResults.map((item) => (
                <Link
                  key={item.id}
                  href={`/listings/${item.id}`}
                  onClick={close}
                  className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-foreground/5"
                >
                  <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded bg-secondary">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.title}
                    </p>
                    {item.subtitle ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {item.subtitle}
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          ) : null}

          {collectionResults.length > 0 ? (
            <div className={cn(itemResults.length > 0 && "border-t border-border/40")}>
              <p className="px-3 pb-1 pt-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Collections
              </p>
              {collectionResults.map((c) => (
                <Link
                  key={c.id}
                  href={`/collection/${c.id}`}
                  onClick={close}
                  className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-foreground/5"
                >
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-secondary text-base">
                    {c.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {c.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.memberCount.toLocaleString()} members
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}

          {userResults.length > 0 ? (
            <div
              className={cn(
                (itemResults.length > 0 || collectionResults.length > 0) &&
                  "border-t border-border/40",
              )}
            >
              <p className="px-3 pb-1 pt-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Users
              </p>
              {userResults.map((u) => (
                <Link
                  key={u.id}
                  href={`/profile/${u.username}`}
                  onClick={close}
                  className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-foreground/5"
                >
                  <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-secondary">
                    <Image
                      src={u.avatar}
                      alt={u.name}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {u.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      @{u.username}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}

          <div className="border-t border-border/60">
            <button
              type="button"
              onClick={() => {
                close()
                router.push(`/market?q=${encodeURIComponent(query.trim())}`)
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <Search className="h-4 w-4 flex-shrink-0" />
              <span>
                See all results for{" "}
                <span className="font-medium text-foreground">
                  &ldquo;{query.trim()}&rdquo;
                </span>
              </span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
