"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ProposalSheet, type ProposalListingPreview } from "@/components/proposal/proposal-sheet"
import type { Offer } from "@/lib/inbox-types"

const otherParty = {
  username: "vintagegearnyc",
  avatarUrl: "/profile/avatar-guitar-collector.jpg",
}

const targetListing: ProposalListingPreview = {
  id: "listing-target-1",
  title: "1965 Fender Stratocaster",
  image: "https://images.unsplash.com/photo-1550985616-10810253b84d?w=400&h=400&fit=crop",
  price: 18500,
  subtitle: "Pre-CBS, original pickups",
}

const targetListingNoPrice: ProposalListingPreview = {
  id: "listing-target-2",
  title: "1969 Marshall Plexi Super Lead",
  image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop",
  price: null,
  subtitle: "Open to trades for vintage Fender combos",
}

const availableItems: ProposalListingPreview[] = [
  {
    id: "my-1",
    title: "1959 Gibson Les Paul",
    image: "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=400&h=400&fit=crop",
    price: 15000,
  },
  {
    id: "my-2",
    title: "Boss CE-2 Chorus",
    image: "https://images.unsplash.com/photo-1558098329-a11cff621064?w=400&h=400&fit=crop",
    price: 275,
  },
  {
    id: "my-3",
    title: "Tube Screamer TS808",
    image: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&h=400&fit=crop",
    price: 450,
  },
  {
    id: "my-4",
    title: "1971 Fender Twin Reverb",
    image: "https://images.unsplash.com/photo-1605020420620-20c943cc4669?w=400&h=400&fit=crop",
    price: null,
  },
]

const originalOffer: Offer = {
  id: "offer-existing-1",
  conversation_id: "conv-1",
  sender_id: "user-1",
  status: "pending",
  their_items: [
    {
      id: "my-1",
      title: "1959 Gibson Les Paul",
      image: "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=400&h=400&fit=crop",
      price: 15000,
    },
  ],
  your_items: [
    {
      id: "listing-target-1",
      title: "1965 Fender Stratocaster",
      image: "https://images.unsplash.com/photo-1550985616-10810253b84d?w=400&h=400&fit=crop",
      price: 18500,
    },
  ],
  cash_adjustment: 4000,
  expires_at: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(),
  created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
}

const counterHistory: Offer[] = [
  {
    id: "history-1",
    conversation_id: "conv-1",
    sender_id: "user-1",
    status: "countered",
    their_items: originalOffer.their_items,
    your_items: originalOffer.your_items,
    cash_adjustment: 3000,
    expires_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "history-2",
    conversation_id: "conv-1",
    sender_id: "current-user",
    status: "countered",
    their_items: [
      {
        id: "my-1",
        title: "1959 Gibson Les Paul",
        image: "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=400&h=400&fit=crop",
        price: 15000,
      },
      {
        id: "my-2",
        title: "Boss CE-2 Chorus",
        image: "https://images.unsplash.com/photo-1558098329-a11cff621064?w=400&h=400&fit=crop",
        price: 275,
      },
    ],
    your_items: originalOffer.your_items,
    cash_adjustment: 3500,
    expires_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
]

type SceneKey = "initiate-priced" | "initiate-unpriced" | "counter" | "counter-with-history"

const SCENES: Array<{ key: SceneKey; label: string; description: string }> = [
  {
    key: "initiate-priced",
    label: "Initiate · all priced",
    description: "Targeting a listing with a price. Balance section computes numbers.",
  },
  {
    key: "initiate-unpriced",
    label: "Initiate · target without price",
    description: "Targeting a listing the owner left price-open. Balance falls back to text.",
  },
  {
    key: "counter",
    label: "Counter · no history",
    description: "Responding to the first offer in a thread.",
  },
  {
    key: "counter-with-history",
    label: "Counter · with history",
    description: "Responding after 2 prior rounds. \"View history\" link appears.",
  },
]

export default function ProposalSheetPreview() {
  const [scene, setScene] = useState<SceneKey | null>(null)
  const [lastSent, setLastSent] = useState<Offer | null>(null)

  const sceneProps = scene ? buildSceneProps(scene) : null

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="space-y-1.5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">/dev preview</p>
        <h1 className="text-2xl font-semibold">ProposalSheet</h1>
        <p className="text-sm text-muted-foreground">
          Isolated preview of the new unified proposal flow. Each scene mounts the same component
          with different inputs to verify all rendering paths.
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Scenes
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {SCENES.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setScene(s.key)}
              className="rounded-lg border border-border bg-card/40 p-4 text-left transition-colors hover:border-primary/60 hover:bg-card/60"
            >
              <p className="text-sm font-semibold">{s.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>
            </button>
          ))}
        </div>
      </section>

      {lastSent ? (
        <section className="space-y-2 rounded-lg border border-border bg-card/30 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Last proposal sent (mock)
          </p>
          <pre className="overflow-auto text-[11px] leading-relaxed text-muted-foreground">
            {JSON.stringify(lastSent, null, 2)}
          </pre>
          <Button variant="ghost" size="sm" onClick={() => setLastSent(null)}>
            Clear
          </Button>
        </section>
      ) : null}

      {sceneProps ? (
        <ProposalSheet
          {...sceneProps}
          open={true}
          onClose={() => setScene(null)}
          onSend={(offer) => {
            setLastSent(offer)
            setScene(null)
          }}
        />
      ) : null}
    </div>
  )
}

function buildSceneProps(scene: SceneKey) {
  switch (scene) {
    case "initiate-priced":
      return {
        mode: "initiate" as const,
        otherParty,
        targetListing,
        availableItems,
      }
    case "initiate-unpriced":
      return {
        mode: "initiate" as const,
        otherParty,
        targetListing: targetListingNoPrice,
        availableItems,
      }
    case "counter":
      return {
        mode: "counter" as const,
        otherParty,
        originalOffer,
        history: [],
        availableItems,
      }
    case "counter-with-history":
      return {
        mode: "counter" as const,
        otherParty,
        originalOffer,
        history: counterHistory,
        availableItems,
      }
  }
}
