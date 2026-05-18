"use client"

/**
 * Favorites — two surfaces: the user's Watchlist (items they're following)
 * and Following (users they follow). Tabs share the page; only Watchlist
 * has functional content today, Following is intentionally a placeholder
 * for a later iteration.
 */

import { useMemo } from "react"
import Link from "next/link"
import { Eye, Users } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { ItemCard } from "@/components/item-card"
import { useWatchlist } from "@/lib/watchlist-context"
import { marketListings } from "@/lib/market-data"
import { getMockListing } from "@/lib/mock-listing-detail"

interface WatchableItem {
  id: string
  title: string
  subtitle?: string
  image: string
  href: string
  price: number | null
  location?: string
  forSale?: boolean
  forTrade?: boolean
}

/**
 * Resolve a watched item id against any of the available mock sources.
 * Order matters — listing-detail mocks are the richest, so we try those
 * first; market listings fill the gap when the user watched something
 * straight from the market grid.
 */
function resolveWatchedItem(id: string): WatchableItem | null {
  const detail = getMockListing(id)
  if (detail) {
    return {
      id: detail.id,
      title: detail.title,
      subtitle: detail.subtitle ?? undefined,
      image: detail.images?.[0] ?? "/placeholder.svg",
      href: `/listings/${detail.id}`,
      price: detail.price ?? null,
      forSale: detail.availability?.includes("for-sale"),
      forTrade: detail.availability?.includes("for-trade"),
    }
  }

  const market = marketListings.find((l) => l.id === id)
  if (market) {
    return {
      id: market.id,
      title: market.title,
      subtitle: market.subtitle ?? undefined,
      image: market.images?.[0] ?? "/placeholder.svg",
      href: `/listings/${market.id}`,
      price: market.price ?? null,
      location: market.location ?? undefined,
      forSale: market.price != null,
      forTrade: market.for_trade,
    }
  }

  return null
}

export default function FavoritesPage() {
  const { watchedIds } = useWatchlist()

  const watchedItems = useMemo(
    () =>
      watchedIds
        .map(resolveWatchedItem)
        .filter((item): item is WatchableItem => item !== null),
    [watchedIds],
  )

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Favorites
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Items and people you&apos;re keeping an eye on.
        </p>
      </header>

      <Tabs defaultValue="watchlist" className="flex flex-col gap-5">
        <TabsList className="w-full justify-start sm:w-auto">
          <TabsTrigger value="watchlist" className="gap-2">
            <Eye className="h-4 w-4" />
            Watchlist
            {watchedItems.length > 0 ? (
              <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary/15 px-1.5 text-[10px] font-medium text-primary tabular-nums">
                {watchedItems.length}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="following" className="gap-2">
            <Users className="h-4 w-4" />
            Following
          </TabsTrigger>
        </TabsList>

        <TabsContent value="watchlist" className="m-0">
          {watchedItems.length === 0 ? (
            <Empty className="rounded-lg border border-dashed border-border bg-card py-16">
              <EmptyHeader>
                <EmptyTitle>Your watchlist is empty</EmptyTitle>
                <EmptyDescription>
                  Tap the eye icon on any listing to follow it. You&apos;ll
                  see it here so you can come back when you&apos;re ready.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button asChild>
                  <Link href="/market">Browse the market</Link>
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {watchedItems.map((item) => (
                <ItemCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  subtitle={item.subtitle}
                  image={item.image}
                  href={item.href}
                  price={item.price}
                  location={item.location}
                  forSale={item.forSale}
                  forTrade={item.forTrade}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="following" className="m-0">
          <Empty className="rounded-lg border border-dashed border-border bg-card py-16">
            <EmptyHeader>
              <EmptyTitle>Following users — coming soon</EmptyTitle>
              <EmptyDescription>
                Soon you&apos;ll be able to follow other collectors and see
                their new listings here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </TabsContent>
      </Tabs>
    </div>
  )
}
