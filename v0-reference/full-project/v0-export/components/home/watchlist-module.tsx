"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const watchlistItems = [
  {
    id: "1",
    thumbnail: "/vintage-electric-guitar.png",
    title: "Gibson Les Paul Standard '59",
    change: "Price dropped",
    changeType: "positive" as const,
  },
  {
    id: "2",
    thumbnail: "/guitar-pedal-overdrive.jpg",
    title: "Analogman King of Tone",
    change: "Now open to trades",
    changeType: "info" as const,
  },
  {
    id: "3",
    thumbnail: "/bass-guitar-fender.jpg",
    title: "Fender P-Bass '75 RI",
    change: "Seller replied in Q&A",
    changeType: "neutral" as const,
  },
  {
    id: "4",
    thumbnail: "/synthesizer-keyboard.jpg",
    title: "Sequential Prophet 6",
    change: "Availability updated",
    changeType: "neutral" as const,
  },
  {
    id: "5",
    thumbnail: "/guitar-amplifier-marshall.jpg",
    title: "Marshall JCM800 2203",
    change: "Price dropped",
    changeType: "positive" as const,
  },
]

const changeStyles = {
  positive: "bg-green-500/10 text-green-400 border-green-500/20",
  info: "bg-primary/10 text-primary border-primary/20",
  neutral: "bg-secondary text-secondary-foreground border-border",
}

export function WatchlistModule() {
  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">Watchlist</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {watchlistItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <Image
                src={item.thumbnail || "/placeholder.svg"}
                alt={item.title}
                width={48}
                height={48}
                className="rounded-md object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{item.title}</p>
                <Badge variant="outline" className={`mt-1 text-xs ${changeStyles[item.changeType]}`}>
                  {item.change}
                </Badge>
              </div>
              <Button size="sm" variant="ghost" className="shrink-0 text-xs">
                Open
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-border">
          <Link href="/collection" className="text-sm text-primary hover:underline">
            View watchlist
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
