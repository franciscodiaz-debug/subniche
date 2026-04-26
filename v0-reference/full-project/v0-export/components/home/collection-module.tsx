"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, ArrowRight } from "lucide-react"
import Link from "next/link"

const collectionItems = [
  {
    id: "1",
    thumbnail: "/vintage-gibson-les-paul-sunburst-guitar.jpg",
    title: "1959 Gibson Les Paul",
    status: "Not listed" as const,
    collectionId: "demo-collection-1",
  },
  {
    id: "2",
    thumbnail: "/fender-stratocaster-white-vintage-guitar.jpg",
    title: "1962 Fender Stratocaster",
    status: "Listed" as const,
    collectionId: "demo-collection-1",
  },
  {
    id: "3",
    thumbnail: "/klon-centaur-gold-overdrive-pedal.jpg",
    title: "Klon Centaur Gold",
    status: "Not listed" as const,
    collectionId: "demo-collection-2",
  },
  {
    id: "4",
    thumbnail: "/strymon-timeline-delay-pedal.jpg",
    title: "Strymon Timeline",
    status: "Trade OK" as const,
    collectionId: "demo-collection-2",
  },
]

const statusStyles = {
  "Not listed": "bg-muted text-muted-foreground",
  Listed: "bg-green-500/10 text-green-400",
  "Trade OK": "bg-primary/10 text-primary",
}

export function CollectionModule() {
  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">Your collection</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary */}
        <p className="text-sm text-muted-foreground mb-3">6 items in 2 collections</p>

        {/* CTAs */}
        <div className="flex gap-2 mb-4">
          <Button size="sm" className="flex-1">
            <Plus className="h-4 w-4 mr-1" />
            Add 1 item
          </Button>
          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
            <ArrowRight className="h-4 w-4 mr-1" />
            Make items available
          </Button>
        </div>

        {/* Collection items preview */}
        <div className="space-y-2">
          {collectionItems.map((item) => (
            <Link
              key={item.id}
              href={`/collection/${item.collectionId}`}
              className="flex items-center gap-3 hover:bg-secondary/50 rounded-md p-1 -m-1 transition-colors"
            >
              <Image
                src={item.thumbnail || "/placeholder.svg"}
                alt={item.title}
                width={48}
                height={48}
                className="rounded-md object-cover shrink-0"
              />
              <p className="text-sm text-foreground flex-1 truncate">{item.title}</p>
              <Badge variant="secondary" className={`text-xs ${statusStyles[item.status]}`}>
                {item.status}
              </Badge>
            </Link>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-border">
          <Link href="/collection" className="text-sm text-primary hover:underline">
            Manage collection
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
