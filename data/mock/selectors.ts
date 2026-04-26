import { mockCategories, mockNiches } from "@/data/mock/niches";
import { mockCollections } from "@/data/mock/collections";
import { mockCommunities } from "@/data/mock/communities";
import { mockListings } from "@/data/mock/listings";
import { getMockProfile, mockProfiles } from "@/data/mock/profiles";
import {
  mockTradeInterests,
  mockTradeOpportunities,
} from "@/data/mock/trade";
import type { MockListing } from "@/data/mock/types";

export function getMockListingById(id: string) {
  return mockListings.find((listing) => listing.id === id || listing.slug === id);
}

export function getMockProfileById(id: string) {
  return getMockProfile(id);
}

export function getMockCategoryById(id: string) {
  return mockCategories.find((category) => category.id === id);
}

export function getMockNicheById(id: string) {
  return mockNiches.find((niche) => niche.id === id);
}

export function getMockCommunityById(id: string) {
  return mockCommunities.find((community) => community.id === id);
}

export function getMockCommunityContextsForListing(id: string) {
  const listing = getMockListingById(id);
  return listing?.publishingContexts ?? [];
}

export function getMockTradeInterestsForListing(id: string) {
  const listing = getMockListingById(id);

  if (!listing?.statuses.forTrade) {
    return [];
  }

  return mockTradeInterests.filter(
    (interest) => interest.profileId === listing.sellerId,
  );
}

export function getMockTradeOpportunitiesForListing(id: string) {
  const listing = getMockListingById(id);

  if (!listing) {
    return [];
  }

  return mockTradeOpportunities.filter((opportunity) => {
    const title = listing.title.toLowerCase();
    return (
      opportunity.userItem.toLowerCase().includes(title) ||
      title.includes(opportunity.userItem.toLowerCase()) ||
      opportunity.otherItem.toLowerCase().includes(title) ||
      title.includes(opportunity.otherItem.toLowerCase())
    );
  });
}

export function getRelatedMockListings(listing: MockListing, limit = 4) {
  return mockListings
    .filter((candidate) => candidate.id !== listing.id)
    .map((candidate) => ({
      listing: candidate,
      score:
        Number(candidate.categoryId === listing.categoryId) * 4 +
        Number(candidate.nicheId === listing.nicheId) * 2 +
        Number(candidate.statuses.forTrade === listing.statuses.forTrade) +
        Number(candidate.sellerId === listing.sellerId),
    }))
    .sort((first, second) => second.score - first.score)
    .slice(0, limit)
    .map((item) => item.listing);
}

export function getSellerListingStats(profileId: string) {
  const listings = mockListings.filter((listing) => listing.sellerId === profileId);
  const profile = mockProfiles.find((item) => item.id === profileId);

  return {
    listings,
    listingCount: listings.length,
    tradeReadyCount: listings.filter((listing) => listing.statuses.forTrade)
      .length,
    profileStatCount:
      profile?.stats.find((stat) => stat.label === "Collection")?.value ?? "0",
  };
}

export function getMockCollectionsForProfile(profileId: string) {
  return mockCollections.filter((collection) => collection.ownerId === profileId);
}

export function getMockListingsForProfile(profileId: string) {
  return mockListings.filter((listing) => listing.sellerId === profileId);
}

export function getMockWishlistListingsForProfile(profileId: string) {
  return mockListings.filter(
    (listing) => listing.sellerId === profileId && listing.statuses.wishlist,
  );
}

export function getMockTradeInterestsForProfile(profileId: string) {
  return mockTradeInterests.filter((interest) => interest.profileId === profileId);
}
