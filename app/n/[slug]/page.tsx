import { getAuthState } from '@/lib/auth'
import { currentUser } from '@/lib/current-user'
import { NicheHero } from '@/components/niche/niche-hero'

import { ActionRequiredSection } from '@/components/home/action-required-section'
import type { ActionCardProps } from '@/components/home/action-card'
import { TradeMatches } from '@/components/trade-matches'
import {
  SavedSearchesSection,
  FollowedItemsSection,
  CollectionsSection,
  TrendingSection,
  JustListedSection,
} from '@/components/feed-sections'
import { CaughtUpDivider } from '@/components/caught-up-divider'

import { InterstitialCard } from '@/components/logged-out/interstitial-card'
import {
  FeaturedCollectionsSection,
  FeaturedUsersSection,
  StaffPicksSection,
} from '@/components/logged-out/logged-out-sections'
import { Bookmark, Repeat2, ShieldCheck, Tag, Users } from 'lucide-react'

import { OnboardingChecklist } from '@/components/onboarding/onboarding-checklist'

interface PageProps {
  params: Promise<{ slug: string }>
}

const actionRequiredItems: ActionCardProps[] = [
  {
    avatar: 'https://i.pravatar.cc/150?img=1',
    username: 'johnsmith',
    actionType: 'offer',
    itemTitle: 'Gibson SG',
    description: '@johnsmith offered a 1974 Fender Twin Reverb for your Gibson SG.',
    timestamp: '12m ago',
  },
  {
    avatar: 'https://i.pravatar.cc/150?img=5',
    username: 'maria_g',
    actionType: 'message',
    itemTitle: 'Vintage Moog',
    description: 'Is the price negotiable on the vintage Moog?',
    timestamp: '45m ago',
  },
  {
    avatar: 'https://i.pravatar.cc/150?img=3',
    username: 'guitar_collector',
    actionType: 'offer_accepted',
    itemTitle: 'Jazzmaster',
    description: '@guitar_collector accepted your trade offer for the Jazzmaster.',
    timestamp: '2h ago',
  },
  {
    avatar: 'https://i.pravatar.cc/150?img=6',
    username: 'dpark_music',
    actionType: 'counter',
    itemTitle: 'Boss DD-500',
    description: '@dpark_music countered with $250 + shipping for the Boss DD-500.',
    timestamp: '3h ago',
  },
]

export default async function NichePage({ params }: PageProps) {
  const { slug } = await params
  const authState = await getAuthState()

  // ── LOGGED OUT ───────────────────────────────────────────────────────────────
  if (authState === 'logged-out') {
    return (
      <>
        <NicheHero slug={slug} authState={authState} />
        <div className="px-4 py-6 md:px-8">
          <TrendingSection />
          <InterstitialCard
            eyebrow="Got gear to move?"
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
            title="You're specific? We are too."
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
            ctaHref={`/signup?niche=${slug}`}
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

  // ── ONBOARDING ───────────────────────────────────────────────────────────────
  if (authState === 'onboarding') {
    return (
      <>
        <NicheHero slug={slug} authState={authState} user={currentUser} />
        <div className="px-4 pb-6 md:px-8">
          <OnboardingChecklist className="mb-8" />
          <div className="mb-8">
            <ActionRequiredSection items={actionRequiredItems} />
          </div>
          <div className="mb-8">
            <TradeMatches showScoreOnboarding />
          </div>
          <SavedSearchesSection />
          <FollowedItemsSection />
          <CollectionsSection />
          <TrendingSection />
          <JustListedSection />
          <CaughtUpDivider />
        </div>
      </>
    )
  }

  // ── LOGGED IN ────────────────────────────────────────────────────────────────
  return (
    <>
      <NicheHero slug={slug} authState={authState} user={currentUser} />
      <div className="px-4 py-6 md:px-8">
        <div className="mb-8">
          <ActionRequiredSection items={actionRequiredItems} />
        </div>
        <div className="mb-8">
          <TradeMatches />
        </div>
        <SavedSearchesSection />
        <FollowedItemsSection />
        <CollectionsSection />
        <TrendingSection />
        <JustListedSection />
        <CaughtUpDivider />
      </div>
    </>
  )
}
