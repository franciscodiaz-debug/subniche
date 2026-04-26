"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

const tradeMatches = [
  {
    id: "1",
    thumbnail: "/vintage-guitar-pedal.jpg",
    title: "Keeley Compressor Plus",
    value: "$180",
    reason: "Matches your trade interest: 'Keeley pedals'",
  },
  {
    id: "2",
    thumbnail: "/analog-synthesizer.jpg",
    title: "Korg Volca Keys",
    value: "$140",
    reason: "Matches your trade interest: 'Volca series'",
  },
  {
    id: "3",
    thumbnail: "/drum-machine.jpg",
    title: "Roland TR-08",
    value: "$320",
    reason: "Matches your trade interest: '808-style drum machines'",
  },
  {
    id: "4",
    thumbnail: "/guitar-effects-pedal.jpg",
    title: "EHX Small Stone",
    value: "$85",
    reason: "Matches your trade interest: 'Phaser pedals'",
  },
]

const buyMatches = [
  {
    id: "1",
    thumbnail: "/fender-jazzmaster-guitar.jpg",
    title: "MIJ Fender Jazzmaster '62 RI",
    value: "$1,350",
    reason: "Matches saved search: 'MIJ Jazzmaster under $1,500'",
  },
  {
    id: "2",
    thumbnail: "/guitar-amplifier.jpg",
    title: "Fender Blues Jr. IV",
    value: "$550",
    reason: "Matches saved search: 'Fender tube amps under $600'",
  },
  {
    id: "3",
    thumbnail: "/acoustic-guitar.png",
    title: "Martin D-15M",
    value: "$1,200",
    reason: "Matches saved search: 'Martin dreadnought'",
  },
]

export function MatchesModule() {
  const [activeTab, setActiveTab] = useState("trade")

  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">Matches</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="trade">Trade Matches</TabsTrigger>
            <TabsTrigger value="buy">Buy Matches</TabsTrigger>
          </TabsList>

          <TabsContent value="trade" className="space-y-3 mt-0">
            {tradeMatches.map((match) => (
              <MatchRow key={match.id} match={match} actionLabel="Propose trade" />
            ))}
          </TabsContent>

          <TabsContent value="buy" className="space-y-3 mt-0">
            {buyMatches.map((match) => (
              <MatchRow key={match.id} match={match} actionLabel="Make offer" />
            ))}
          </TabsContent>
        </Tabs>

        <div className="mt-4 pt-3 border-t border-border">
          <Link href="/trade" className="text-sm text-primary hover:underline">
            View all matches
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

interface MatchRowProps {
  match: {
    id: string
    thumbnail: string
    title: string
    value: string
    reason: string
  }
  actionLabel: string
}

function MatchRow({ match, actionLabel }: MatchRowProps) {
  return (
    <div className="flex items-start gap-3">
      <Image
        src={match.thumbnail || "/placeholder.svg"}
        alt={match.title}
        width={60}
        height={60}
        className="rounded-md object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{match.title}</p>
        <p className="text-sm text-primary font-semibold">{match.value}</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{match.reason}</p>
      </div>
      <Button size="sm" variant="secondary" className="shrink-0 text-xs">
        {actionLabel}
      </Button>
    </div>
  )
}
