import type {
  ListingCardProps,
  ListingPriceMode,
  ListingStatus,
} from "@/components/listing/types";
import type { MatchType } from "@/components/trade/trade-match-badge";

export type MockNiche = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

export type MockCategory = {
  id: string;
  nicheId: string;
  parentCategoryId?: string;
  name: string;
  slug: string;
  itemCount: number;
};

export type MockProfile = {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl?: string;
  location: string;
  memberSince: string;
  bio: string;
  stats: Array<{ label: string; value: string }>;
  indicators: string[];
  ownProfile?: boolean;
};

export type MockCommunity = {
  id: string;
  nicheId: string;
  name: string;
  slug: string;
  description: string;
  memberCount: string;
  listingCount: string;
  visibility: string;
};

export type MockCommunityMembership = {
  id: string;
  communityId: string;
  profileId: string;
  role: "member" | "moderator" | "owner";
  joinedAt: string;
};

export type MockPublishingContext = {
  type: "public_market" | "community_market" | "profile_only";
  label: string;
  communityId?: string;
};

export type MockListingAttribute = {
  label: string;
  value: string;
};

export type MockListing = ListingCardProps & {
  slug: string;
  nicheId: string;
  categoryId: string;
  sellerId: string;
  brand: string;
  description: string;
  condition: string;
  images: string[];
  attributes: MockListingAttribute[];
  publishingContexts: MockPublishingContext[];
  savedSearchMatch?: string;
  createdAt: string;
};

export type MockCollection = {
  id: string;
  ownerId: string;
  nicheId: string;
  title: string;
  description: string;
  images: string[];
  itemCount: number;
  estimatedValue?: string;
  aiEstimate?: string;
  visibility: string;
  href: string;
};

export type MockTradeInterest = {
  id: string;
  profileId: string;
  title: string;
  description: string;
  criteria: MockListingAttribute[];
};

export type MockTradeOpportunity = {
  id: string;
  matchType: MatchType;
  userItem: string;
  otherItem: string;
  cashAdjustment?: string;
  reason: string;
};

export type MockOffer = {
  id: string;
  threadId: string;
  listingId: string;
  fromProfileId: string;
  toProfileId: string;
  state: "draft" | "pending" | "countered" | "accepted";
  offeredListingIds: string[];
  cashAdjustment?: string;
  note: string;
  updatedAt: string;
};

export type MockMessageThread = {
  id: string;
  participantId: string;
  listingId: string;
  subject: string;
  lastMessage: string;
  updatedAt: string;
  unread: boolean;
  offerState?: "draft" | "pending" | "countered" | "accepted";
};

export type ListingSummaryForCard = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  price?: string;
  priceMode?: ListingPriceMode;
  location?: string;
  sellerName: string;
  statuses: ListingStatus;
  condition?: string;
  href?: string;
  communityContext?: string[];
  tradeSummary?: string;
  isSaved?: boolean;
};
