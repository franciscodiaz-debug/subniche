import { Bookmark, Repeat2, ShieldCheck, Tag, Users } from "lucide-react"

import { HeroLoggedOut } from "@/components/logged-out/hero-logged-out"
import { InterstitialCard } from "@/components/logged-out/interstitial-card"
import {
  FeaturedCollectionsSection,
  FeaturedUsersSection,
  StaffPicksSection,
} from "@/components/logged-out/logged-out-sections"
import {
  JustListedSection,
  TrendingSection,
} from "@/components/feed-sections"

export default function HomePage() {
  return (
    <>
      {/* Why SN / MusicGear lives inside HeroLoggedOut */}
      <HeroLoggedOut />

      <div className="px-4 py-6 md:px-8">
        <TrendingSection />

        <InterstitialCard
          eyebrow="Got gear to move ?"
          title="The hard part should be letting gear go – not listing it."
          description="List without the hassle. Start with a photo and a few details — we'll help with the rest."
          icon={Tag}
          ctaLabel="Start listing"
          ctaHref="/create-listing"
        />

        <JustListedSection />

        <InterstitialCard
          eyebrow="Native trade matching"
          title="Trade like never before."
          description="Set specific trade interests for your items to experience our unique trade matching engine."
          icon={Repeat2}
          ctaLabel="Start trading"
          ctaHref="/market?tab=trade-matches"
        />

        <FeaturedCollectionsSection />

        <InterstitialCard
          eyebrow="More signal, less noise"
          title="You're specific ? We are too."
          description="Better categories, better filters, better listings – built for when details matter."
          icon={Bookmark}
          ctaLabel="Explore listings"
          ctaHref="/market?tab=for-sale"
        />

        <FeaturedUsersSection />

        <InterstitialCard
          eyebrow="Trust is built in"
          title="More than just a listing."
          description="Context matters – see shared collections, trade interests, profiles, and verified reputation before you ever reach out."
          icon={ShieldCheck}
          ctaLabel="Build your profile"
          ctaHref="/signup"
        />

        <StaffPicksSection />

        <InterstitialCard
          eyebrow="Find your people"
          title="Explore collections and talk shop with musicians who get it."
          description="Whatever your obsession, there's a place for it here. Curate your own collections, trade interests, and profile to show what you're about."
          icon={Users}
          ctaLabel="Explore collections"
          ctaHref="/communities"
        />
      </div>
    </>
  )
}
