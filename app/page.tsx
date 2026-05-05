import { getAuthState } from '@/lib/auth'
import { currentUser } from '@/lib/current-user'

// Logged-in & onboarding components
import { HeroSection } from '@/components/hero-section'
import { ActionRequiredSection } from '@/components/home/action-required-section'
import type { ActionCardProps } from '@/components/home/action-card'
import { TradeMatches } from '@/components/trade-matches'
import {
  SavedSearchesSection,
  FollowedItemsSection,
  CollectionsSection,
  CommunitiesSection,
  TrendingSection,
  JustListedSection,
} from '@/components/feed-sections'
import { CaughtUpDivider } from '@/components/caught-up-divider'

// Logged-out components
import { HeroLoggedOut } from '@/components/logged-out/hero-logged-out'
import { InterstitialCard } from '@/components/logged-out/interstitial-card'
import {
  FeaturedCollectionsSection,
  FeaturedUsersSection,
  StaffPicksSection,
} from '@/components/logged-out/logged-out-sections'
import { Bookmark, Repeat2, ShieldCheck, Tag, Users } from 'lucide-react'

// Onboarding components
import { OnboardingChecklist } from '@/components/onboarding/onboarding-checklist'

const actionRequiredItems: ActionCardProps[] = [
  {
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    username: 'Julian Reed',
    actionType: 'trade',
    itemTitle: 'Gibson SG',
    description: 'Julian offered a 1974 Fender Twin Reverb for your Gibson SG.',
    timestamp: '12m ago',
  },
  {
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    username: 'Elena K.',
    actionType: 'message',
    itemTitle: 'Vintage Moog',
    description: 'Is the price negotiable on the vintage Moog?',
    timestamp: '45m ago',
  },
  {
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    username: 'Marcus Sterling',
    actionType: 'approved',
    itemTitle: 'Jazzmaster',
    description: 'Marcus Sterling approved your trade request for the Jazzmaster.',
    timestamp: '2h ago',
  },
  {
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    username: 'Dave Wilson',
    actionType: 'counter',
    itemTitle: 'Boss DD-500',
    description: 'Dave countered with $250 + shipping for the Boss DD-500.',
    timestamp: '3h ago',
  },
  {
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    username: 'Sarah Chen',
    actionType: 'trade',
    itemTitle: 'Big Sky',
    description: 'Sarah wants to trade her Strymon Timeline for your Big Sky.',
    timestamp: '4h ago',
  },
]

export default function HomePage() {
  const authState = getAuthState()

  // ── LOGGED OUT ──────────────────────────────────────────────────────────────
  if (authState === 'logged-out') {
    return (
      <>
        <HeroLoggedOut />
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

  // ── ONBOARDING (first login) ─────────────────────────────────────────────────
  if (authState === 'onboarding') {
    return (
      <>
        <HeroSection user={currentUser} />
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
          <CommunitiesSection />

          <CaughtUpDivider />

          <TrendingSection />
          <JustListedSection />
        </div>
      </>
    )
  }

  // ── LOGGED IN ───────────────────────────────────────────────────────────────
  return (
    <>
      <HeroSection user={currentUser} />
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
        <CommunitiesSection />

        <CaughtUpDivider />

        <TrendingSection />
        <JustListedSection />
      </div>
    </>
  )
}
