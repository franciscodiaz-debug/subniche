import { HeroSection } from "@/components/hero-section"
import { ActionRequiredSection } from "@/components/home/action-required-section"
import type { ActionCardProps } from "@/components/home/action-card"
import { TradeMatches } from "@/components/trade-matches"
import {
  SavedSearchesSection,
  FollowedItemsSection,
  CollectionsSection,
  CommunitiesSection,
  TrendingSection,
  JustListedSection,
} from "@/components/feed-sections"
import { CaughtUpDivider } from "@/components/caught-up-divider"

const actionRequiredItems: ActionCardProps[] = [
  {
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    username: "Julian Reed",
    actionType: "trade",
    itemTitle: "Gibson SG",
    description:
      "Julian offered a 1974 Fender Twin Reverb for your Gibson SG.",
    timestamp: "12m ago",
  },
  {
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    username: "Elena K.",
    actionType: "message",
    itemTitle: "Vintage Moog",
    description: "Is the price negotiable on the vintage Moog?",
    timestamp: "45m ago",
  },
  {
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    username: "Marcus Sterling",
    actionType: "approved",
    itemTitle: "Jazzmaster",
    description:
      "Marcus Sterling approved your trade request for the Jazzmaster.",
    timestamp: "2h ago",
  },
  {
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    username: "Dave Wilson",
    actionType: "counter",
    itemTitle: "Boss DD-500",
    description: "Dave countered with $250 + shipping for the Boss DD-500.",
    timestamp: "3h ago",
  },
  {
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    username: "Sarah Chen",
    actionType: "trade",
    itemTitle: "Big Sky",
    description: "Sarah wants to trade her Strymon Timeline for your Big Sky.",
    timestamp: "4h ago",
  },
]

export default function HomePage() {
  return (
    <>
      <HeroSection />

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
