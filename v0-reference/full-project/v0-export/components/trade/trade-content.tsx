"use client"

import { useState, useMemo, useEffect } from "react"
import { ArrowLeftRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { TradeInterestCard } from "./trade-interest-card"
import { TradeItemSelector } from "./trade-item-selector"
import { OnboardingTooltip } from "@/components/collection/onboarding-tooltip"
import { useGridDensity, gridDensityConfig } from "@/hooks/use-grid-density"
import { GridDensitySelector } from "@/components/grid-density-selector"
import { DiscoverModeToggle } from "@/components/discover-mode-toggle"
import type { PerfectMatch, InboundInterest } from "@/lib/types"

const MOCK_PERFECT_MATCHES: PerfectMatch[] = [
  {
    id: "pm-1",
    my_item: {
      id: "my-1",
      type: "listing",
      title: "Fender American Pro II Stratocaster",
      images: ["/fender-stratocaster-sunburst-electric-guitar.jpg"],
      price: 1749,
      condition: "Excellent",
    },
    their_item: {
      id: "demo-listing-1", // Use real demo listing ID
      type: "listing",
      title: "Gibson Les Paul Standard '50s",
      subtitle: "Gold Top - 2023",
      images: ["/gibson-les-paul-gold-top-electric-guitar.jpg"],
      price: 2499,
      condition: "Mint",
      user: {
        username: "vintagetone",
        avatar_url: "/male-guitarist-avatar.jpg",
        location: "Austin, TX",
      },
      niche: { name: "Austin Guitar Traders", icon: "🎸" },
    },
    my_criteria: {
      target_category: "Electric Guitars",
      target_subcategories: ["Les Paul", "SG"],
    },
    their_criteria: {
      target_category: "Electric Guitars",
      target_subcategories: ["Stratocaster", "Telecaster"],
    },
    match_score: 9.0,
  },
  {
    id: "pm-2",
    my_item: {
      id: "my-2",
      type: "listing",
      title: "Martin D-28 Acoustic Guitar",
      images: ["/martin-d28-acoustic-guitar-natural.jpg"],
      price: 3199,
      condition: "Excellent",
    },
    their_item: {
      id: "demo-listing-2", // Use real demo listing ID
      type: "listing",
      title: "Taylor 814ce Builder's Edition",
      subtitle: "V-Class Bracing - Natural",
      images: ["/taylor-814ce-acoustic-guitar.jpg"],
      price: 3999,
      condition: "Mint",
      user: {
        username: "acousticpro",
        avatar_url: "/female-musician-avatar.jpg",
        location: "Nashville, TN",
      },
      niche: { name: "Nashville Acoustics", icon: "🪕" },
    },
    my_criteria: {
      target_category: "Acoustic Guitars",
      target_subcategories: ["Taylor", "Grand Auditorium"],
    },
    their_criteria: {
      target_category: "Acoustic Guitars",
      target_subcategories: ["Martin", "Dreadnought"],
    },
    match_score: 8.0,
  },
  {
    id: "pm-3",
    my_item: {
      id: "my-3",
      type: "collection_item",
      title: "Mesa Boogie Dual Rectifier",
      images: ["/mesa-boogie-dual-rectifier-amp-head.jpg"],
      price: 1800,
      condition: "Good",
    },
    their_item: {
      id: "demo-listing-1", // Use real demo listing ID
      type: "listing",
      title: "Fender '65 Twin Reverb Reissue",
      subtitle: "85W Tube Combo",
      images: ["/fender-twin-reverb-amp.jpg"],
      price: 1699,
      condition: "Excellent",
      user: {
        username: "tubetown",
        avatar_url: "/older-man-avatar.png",
        location: "Los Angeles, CA",
      },
      niche: { name: "SoCal Amp Exchange", icon: "🔊" },
    },
    my_criteria: {
      target_category: "Amplifiers",
      target_subcategories: ["Fender", "Clean Amps"],
    },
    their_criteria: {
      target_category: "Amplifiers",
      target_subcategories: ["Mesa Boogie", "High Gain"],
    },
    match_score: 6.0,
  },
]

const MOCK_INBOUND_INTERESTS: InboundInterest[] = [
  {
    id: "ib-1",
    my_item: {
      id: "my-1",
      type: "listing",
      title: "Fender American Pro II Stratocaster",
      images: ["/fender-stratocaster-sunburst-electric-guitar.jpg"],
      price: 1749,
      condition: "Excellent",
    },
    their_item: {
      id: "demo-listing-2", // Use real demo listing ID
      type: "listing",
      title: "PRS Custom 24 10-Top",
      subtitle: "Pattern Neck - Cobalt Blue",
      images: ["/prs-custom-24-blue-electric-guitar.jpg"],
      price: 3899,
      condition: "Mint",
      user: {
        username: "prsaddict",
        avatar_url: "/young-musician-avatar.jpg",
        location: "Seattle, WA",
      },
      niche: { name: "PNW Guitar Club", icon: "🌲" },
    },
    their_criteria: {
      target_category: "Electric Guitars",
      target_subcategories: ["Stratocaster"],
    },
    match_score: 7.0,
  },
  {
    id: "ib-2",
    my_item: {
      id: "my-1",
      type: "listing",
      title: "Fender American Pro II Stratocaster",
      images: ["/fender-stratocaster-sunburst-electric-guitar.jpg"],
      price: 1749,
      condition: "Excellent",
    },
    their_item: {
      id: "demo-listing-1", // Use real demo listing ID
      type: "listing",
      title: "Gretsch G6120T-55 Vintage Select",
      subtitle: "Hollow Body - Orange Stain",
      images: ["/gretsch-orange-hollow-body-guitar.jpg"],
      price: 3299,
      condition: "Excellent",
      user: {
        username: "rockabillykid",
        avatar_url: "/rockabilly-musician-avatar.jpg",
        location: "Memphis, TN",
      },
      niche: { name: "Rockabilly Gear Swap", icon: "🎶" },
    },
    their_criteria: {
      target_category: "Electric Guitars",
      target_subcategories: ["Fender", "Stratocaster", "Telecaster"],
    },
    match_score: 5.0,
  },
  {
    id: "ib-3",
    my_item: {
      id: "my-2",
      type: "listing",
      title: "Martin D-28 Acoustic Guitar",
      images: ["/martin-d28-acoustic-guitar-natural.jpg"],
      price: 3199,
      condition: "Excellent",
    },
    their_item: {
      id: "demo-listing-2", // Use real demo listing ID
      type: "listing",
      title: "Collings OM2H",
      subtitle: "Orchestra Model - Sitka Top",
      images: ["/collings-acoustic-guitar.jpg"],
      price: 4500,
      condition: "Mint",
      user: {
        username: "fingerpicker",
        avatar_url: "/folk-musician-avatar.jpg",
        location: "Boulder, CO",
      },
      niche: { name: "Colorado Folk Circle", icon: "🏔️" },
    },
    their_criteria: {
      target_category: "Acoustic Guitars",
      target_subcategories: ["Martin", "Dreadnought"],
    },
    match_score: 10.0,
  },
  {
    id: "ib-4",
    my_item: {
      id: "my-3",
      type: "collection_item",
      title: "Mesa Boogie Dual Rectifier",
      images: ["/mesa-boogie-dual-rectifier-amp-head.jpg"],
      price: 1800,
      condition: "Good",
    },
    their_item: {
      id: "demo-listing-1", // Use real demo listing ID
      type: "listing",
      title: "Marshall JCM800 2203",
      subtitle: "100W Head - 1984",
      images: ["/marshall-jcm800-amp-head.jpg"],
      price: 2200,
      condition: "Good",
      user: {
        username: "classicrock",
        avatar_url: "/placeholder.svg?height=32&width=32",
        location: "Detroit, MI",
      },
      niche: { name: "Motor City Amps", icon: "🎛️" },
    },
    their_criteria: {
      target_category: "Amplifiers",
      target_subcategories: ["Mesa Boogie"],
    },
    match_score: 4.0,
  },
  {
    id: "ib-5",
    my_item: {
      id: "my-2",
      type: "listing",
      title: "Martin D-28 Acoustic Guitar",
      images: ["/martin-d28-acoustic-guitar-natural.jpg"],
      price: 3199,
      condition: "Excellent",
    },
    their_item: {
      id: "demo-listing-2",
      type: "collection_item",
      title: "Gibson J-45 Standard",
      subtitle: "Round Shoulder - Vintage Sunburst",
      images: ["/placeholder.svg?height=300&width=400"],
      price: 2699,
      condition: "Very Good",
      user: {
        username: "songwriter",
        avatar_url: "/placeholder.svg?height=32&width=32",
        location: "Portland, OR",
      },
      niche: { name: "PDX Singer-Songwriters", icon: "✍️" },
    },
    their_criteria: {
      target_category: "Acoustic Guitars",
      target_subcategories: ["Martin"],
    },
    match_score: 6.0,
  },
  {
    id: "ib-6",
    my_item: {
      id: "my-4",
      type: "listing",
      title: "Rickenbacker 360 Fireglo",
      images: ["/rickenbacker-360-fireglo-guitar.jpg"],
      price: 2299,
      condition: "Excellent",
    },
    their_item: {
      id: "demo-listing-3",
      type: "listing",
      title: "Gretsch White Falcon",
      subtitle: "Hollow Body - White",
      images: ["/gretsch-white-falcon-guitar.jpg"],
      price: 3499,
      condition: "Mint",
      user: {
        username: "janglepop",
        avatar_url: "/placeholder.svg?height=32&width=32",
        location: "Chicago, IL",
      },
      niche: { name: "Midwest Indie Gear", icon: "🎵" },
    },
    their_criteria: {
      target_category: "Electric Guitars",
      target_subcategories: ["Rickenbacker"],
    },
    match_score: 7.5,
  },
  {
    id: "ib-7",
    my_item: {
      id: "my-5",
      type: "collection_item",
      title: "Orange Rockerverb 50 MKIII",
      images: ["/orange-rockerverb-50-amp.jpg"],
      price: 2199,
      condition: "Excellent",
    },
    their_item: {
      id: "demo-listing-4",
      type: "listing",
      title: "Vox AC30 Hand-Wired",
      subtitle: "2x12 Combo - Alnico Blue",
      images: ["/vox-ac30-hand-wired-amp.jpg"],
      price: 2899,
      condition: "Excellent",
      user: {
        username: "britishinvasion",
        avatar_url: "/placeholder.svg?height=32&width=32",
        location: "Boston, MA",
      },
      niche: { name: "New England Tone Chasers", icon: "🔈" },
    },
    their_criteria: {
      target_category: "Amplifiers",
      target_subcategories: ["Orange", "High Gain"],
    },
    match_score: 8.0,
  },
  {
    id: "ib-8",
    my_item: {
      id: "my-6",
      type: "listing",
      title: "Epiphone Casino Worn",
      images: ["/epiphone-casino-worn-guitar.jpg"],
      price: 599,
      condition: "Good",
    },
    their_item: {
      id: "demo-listing-5",
      type: "listing",
      title: "Squier Classic Vibe Jazzmaster",
      subtitle: "Surf Green - 60s Style",
      images: ["/squier-jazzmaster-surf-green.jpg"],
      price: 449,
      condition: "Excellent",
      user: {
        username: "budgetgear",
        avatar_url: "/placeholder.svg?height=32&width=32",
        location: "Phoenix, AZ",
      },
      niche: { name: "Desert Deals", icon: "🌵" },
    },
    their_criteria: {
      target_category: "Electric Guitars",
      target_subcategories: ["Epiphone", "Semi-Hollow"],
    },
    match_score: 5.5,
  },
  {
    id: "ib-9",
    my_item: {
      id: "my-7",
      type: "listing",
      title: "Ibanez JEM7V Steve Vai",
      images: ["/ibanez-jem7v-white-guitar.jpg"],
      price: 3499,
      condition: "Mint",
    },
    their_item: {
      id: "demo-listing-6",
      type: "listing",
      title: "Jackson Soloist SL2",
      subtitle: "USA Select - Satin Black",
      images: ["/jackson-soloist-black-guitar.jpg"],
      price: 2799,
      condition: "Excellent",
      user: {
        username: "shredmaster",
        avatar_url: "/placeholder.svg?height=32&width=32",
        location: "San Diego, CA",
      },
      niche: { name: "SoCal Shred Network", icon: "⚡" },
    },
    their_criteria: {
      target_category: "Electric Guitars",
      target_subcategories: ["Ibanez", "Superstrat"],
    },
    match_score: 9.0,
  },
  {
    id: "ib-10",
    my_item: {
      id: "my-8",
      type: "collection_item",
      title: "Strymon BigSky Reverb",
      images: ["/strymon-bigsky-reverb-pedal.jpg"],
      price: 479,
      condition: "Excellent",
    },
    their_item: {
      id: "demo-listing-7",
      type: "listing",
      title: "Eventide H9 Max",
      subtitle: "Multi-Effects - All Algorithms",
      images: ["/eventide-h9-max-pedal.jpg"],
      price: 699,
      condition: "Mint",
      user: {
        username: "ambientscape",
        avatar_url: "/placeholder.svg?height=32&width=32",
        location: "Brooklyn, NY",
      },
      niche: { name: "NYC Ambient Collective", icon: "🌊" },
    },
    their_criteria: {
      target_category: "Effects Pedals",
      target_subcategories: ["Strymon", "Reverb"],
    },
    match_score: 8.5,
  },
]

// Combined type for unified list
type TradeInterestItem =
  | { type: "perfect"; data: PerfectMatch; sortKey: number }
  | { type: "inbound"; data: InboundInterest; sortKey: number }

export function TradeContent() {
  const [filterMyItem, setFilterMyItem] = useState<string>("all")
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)
  const { gridDensity } = useGridDensity()

  const perfectMatches = MOCK_PERFECT_MATCHES
  const inboundInterests = MOCK_INBOUND_INTERESTS
  const isLoading = false

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("trade-center-onboarding-complete")
    if (!hasSeenOnboarding) {
      const timer = setTimeout(() => setShowOnboarding(true), 500)
      return () => clearTimeout(timer)
    }
  }, [])

  const onboardingSteps = [
    {
      id: "trade-intro",
      targetSelector: "[data-onboarding='trade-intro']",
      title: "Welcome to Trade Matches",
      description:
        "Discover trade opportunities for your items. Browse who's interested in what you have and find perfect matches.",
      position: "center" as const,
    },
    {
      id: "item-selector",
      targetSelector: "[data-onboarding='item-selector']",
      title: "Filter by Item",
      description:
        "Select a specific item to see only its matches, or view all matches at once. You can also access trade preferences for each item from here.",
      position: "bottom" as const,
    },
    {
      id: "perfect-match-card",
      targetSelector: "[data-onboarding='perfect-match-card']",
      title: "Perfect Matches",
      description:
        "Gold-bordered cards are perfect matches - both you and the other person want what each other has. These are ready-to-trade opportunities!",
      position: "bottom" as const,
    },
    {
      id: "inbound-interest-card",
      targetSelector: "[data-onboarding='inbound-interest-card']",
      title: "Inbound Interest",
      description:
        "Standard cards show people interested in your items. You can browse their inventory and message them to explore a trade.",
      position: "bottom" as const,
    },
    {
      id: "match-score",
      targetSelector: "[data-onboarding='match-score']",
      title: "Match Score",
      description:
        "The score shows how well their item matches your preferences. Higher scores (green) mean more matching attributes.",
      position: "left" as const,
    },
  ]

  const handleOnboardingNext = () => {
    if (onboardingStep < onboardingSteps.length - 1) {
      setOnboardingStep(onboardingStep + 1)
    } else {
      setShowOnboarding(false)
      localStorage.setItem("trade-center-onboarding-complete", "true")
    }
  }

  const handleOnboardingSkip = () => {
    setShowOnboarding(false)
    localStorage.setItem("trade-center-onboarding-complete", "true")
  }

  const combinedInterests = useMemo(() => {
    const combined: TradeInterestItem[] = [
      ...perfectMatches.map((match) => ({
        type: "perfect" as const,
        data: match,
        sortKey: 100 + match.match_score,
      })),
      ...inboundInterests.map((interest) => ({
        type: "inbound" as const,
        data: interest,
        sortKey: interest.match_score,
      })),
    ]

    return combined.sort((a, b) => b.sortKey - a.sortKey)
  }, [perfectMatches, inboundInterests])

  const myItems = useMemo(() => {
    const itemsMap = new Map<
      string,
      {
        id: string
        title: string
        image?: string
        price?: number | null
        type: "listing" | "collection_item"
        matchCount: number
        perfectCount: number
      }
    >()

    perfectMatches.forEach((match) => {
      const existing = itemsMap.get(match.my_item.id)
      if (existing) {
        existing.matchCount++
        existing.perfectCount++
      } else {
        itemsMap.set(match.my_item.id, {
          id: match.my_item.id,
          title: match.my_item.title,
          image: match.my_item.images[0],
          price: match.my_item.price,
          type: match.my_item.type,
          matchCount: 1,
          perfectCount: 1,
        })
      }
    })

    inboundInterests.forEach((interest) => {
      const existing = itemsMap.get(interest.my_item.id)
      if (existing) {
        existing.matchCount++
      } else {
        itemsMap.set(interest.my_item.id, {
          id: interest.my_item.id,
          title: interest.my_item.title,
          image: interest.my_item.images[0],
          price: interest.my_item.price,
          type: interest.my_item.type,
          matchCount: 1,
          perfectCount: 0,
        })
      }
    })

    return Array.from(itemsMap.values())
  }, [perfectMatches, inboundInterests])

  const filteredInterests = useMemo(() => {
    let filtered = combinedInterests

    if (filterMyItem !== "all") {
      filtered = filtered.filter((item) => {
        const myItemId = item.type === "perfect" ? item.data.my_item.id : item.data.my_item.id
        return myItemId === filterMyItem
      })
    }

    return filtered
  }, [combinedInterests, filterMyItem])

  const handleRefresh = () => {
    // Placeholder for refresh logic
  }

  return (
    <div className="min-h-screen w-full">
      {showOnboarding && (
        <OnboardingTooltip
          steps={onboardingSteps}
          storageKey="trade-center-onboarding-complete"
          onComplete={() => setShowOnboarding(false)}
        />
      )}

      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="p-4 py-2.5 pt-4 pb-4">
          {/* Title row - fixed height of h-10 to match discover */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="lg:hidden">
                <DiscoverModeToggle showLabels={true} />
              </div>
              <div className="hidden lg:flex items-baseline gap-2" data-onboarding="trade-intro">
                <ArrowLeftRight className="text-primary w-6 h-6 self-center" />
                <h1 className="font-semibold text-foreground text-2xl">Trade Matches</h1>
                <span className="text-sm text-muted-foreground">for</span>
                <div data-onboarding="item-selector">
                  <TradeItemSelector
                    items={myItems}
                    selectedItemId={filterMyItem}
                    onSelect={setFilterMyItem}
                    totalMatches={perfectMatches.length + inboundInterests.length}
                    totalPerfect={perfectMatches.length}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <GridDensitySelector />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <BrowseContent
          interests={filteredInterests}
          isLoading={isLoading}
          totalPerfect={perfectMatches.length}
          totalInbound={inboundInterests.length}
          gridDensity={gridDensity}
        />
      </div>
    </div>
  )
}

function BrowseContent({
  interests,
  isLoading,
  totalPerfect,
  totalInbound,
  gridDensity,
}: {
  interests: TradeInterestItem[]
  isLoading: boolean
  totalPerfect: number
  totalInbound: number
  gridDensity: "cozy" | "compact" | "dense"
}) {
  if (isLoading) {
    return (
      <div className={cn("grid gap-3", gridDensityConfig[gridDensity].cols)}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-64 bg-card rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  const noResults = interests.length === 0
  const hasAnyInterests = totalPerfect > 0 || totalInbound > 0

  const firstPerfectIndex = interests.findIndex((item) => item.type === "perfect")
  const firstInboundIndex = interests.findIndex((item) => item.type === "inbound")

  return (
    <>
      {noResults && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center mb-3">
            <ArrowLeftRight className="h-6 w-6 text-muted-foreground" />
          </div>
          {hasAnyInterests ? (
            <>
              <h3 className="text-sm font-semibold text-foreground mb-1">No Results</h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                No trade interests match your filters. Try selecting a different item.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-sm font-semibold text-foreground mb-1">No Trade Interest Yet</h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                Set trade preferences on your listings to find matches.
              </p>
            </>
          )}
        </div>
      )}

      {!noResults && (
        <div className={cn("grid gap-3", gridDensityConfig[gridDensity].cols)}>
          {interests.map((item, index) => (
            <div
              key={item.type === "perfect" ? `perfect-${item.data.id}` : `inbound-${item.data.id}`}
              data-onboarding={
                index === firstPerfectIndex
                  ? "perfect-match-card"
                  : index === firstInboundIndex
                    ? "inbound-interest-card"
                    : undefined
              }
            >
              <TradeInterestCard
                type={item.type}
                data={item.data as PerfectMatch & InboundInterest}
                showScoreOnboarding={index === 0}
              />
            </div>
          ))}
        </div>
      )}
    </>
  )
}
