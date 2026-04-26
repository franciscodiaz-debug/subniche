"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, ArrowRight } from "lucide-react"
import { demoCommunitiesEnhanced, getDemoCommunityListings } from "@/lib/demo-data"

export function CommunitiesModule() {
  const [activeTab, setActiveTab] = useState("new")

  // Get user's communities
  const myCommunities = demoCommunitiesEnhanced.filter((c) => c.is_member)

  // Get listings from user's communities
  const communityListings = myCommunities.flatMap((community) => {
    const listings = getDemoCommunityListings(community.id)
    return listings.map((listing) => ({
      ...listing,
      community,
    }))
  })

  // Remove duplicates by listing id
  const uniqueListings = communityListings.filter(
    (listing, index, self) => index === self.findIndex((l) => l.id === listing.id),
  )

  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            From your communities
          </CardTitle>
          <Link href="/communities" className="text-sm text-primary hover:underline flex items-center gap-1">
            See all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 h-8">
            <TabsTrigger value="new" className="text-xs">
              New Listings
            </TabsTrigger>
            <TabsTrigger value="communities" className="text-xs">
              Your Communities
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="mt-0">
            {uniqueListings.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <p>No listings from your communities yet.</p>
                <Link href="/communities" className="text-primary hover:underline mt-2 block">
                  Discover communities to join
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {uniqueListings.slice(0, 8).map((listing) => (
                  <Link key={listing.id} href={`/listings/${listing.id}`} className="group flex flex-col">
                    <div className="relative aspect-square rounded-md overflow-hidden bg-secondary">
                      <Image
                        src={listing.images?.[0] || "/placeholder.svg"}
                        alt={listing.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-background/80 backdrop-blur-sm rounded text-[10px] font-medium text-primary">
                        ${listing.price}
                      </div>
                    </div>
                    <p className="text-xs text-foreground truncate mt-1">{listing.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{listing.community.name}</p>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="communities" className="mt-0">
            {myCommunities.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <p>You haven&apos;t joined any communities yet.</p>
                <Link href="/communities" className="text-primary hover:underline mt-2 block">
                  Discover communities
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {myCommunities.slice(0, 5).map((community) => (
                  <Link
                    key={community.id}
                    href={`/communities/${community.slug}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl">
                      {community.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{community.name}</p>
                      <p className="text-xs text-muted-foreground">{community.member_count.toLocaleString()} members</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
