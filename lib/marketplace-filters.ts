import type { MatchType } from "@/components/trade/trade-match-badge";
import type { MockCategory, MockListing } from "@/data/mock/types";

export type MarketplaceMode = "market" | "trade";
export type ListingStatusFilter =
  | "forSale"
  | "forTrade"
  | "inCollection"
  | "wishlist";
export type PriceRangeFilter =
  | "all"
  | "under-250"
  | "250-750"
  | "750-1500"
  | "1500-plus";
export type CommunityContextFilter = "all" | "public" | "community";
export type SortOption =
  | "relevant"
  | "newest"
  | "price-low"
  | "price-high"
  | "trade-matches";

export type MarketplaceFilters = {
  search: string;
  categoryId: string;
  statusFilters: Set<ListingStatusFilter>;
  condition: string;
  priceRange: PriceRangeFilter;
  nicheId: string;
  communityContext: CommunityContextFilter;
};

export type TradeRelevanceSource = {
  matchType: MatchType;
  userItem: string;
  otherItem: string;
};

const statusAccessors: Record<
  ListingStatusFilter,
  (listing: MockListing) => boolean
> = {
  forSale: (listing) => Boolean(listing.statuses.forSale),
  forTrade: (listing) => Boolean(listing.statuses.forTrade),
  inCollection: (listing) => Boolean(listing.statuses.inCollection),
  wishlist: (listing) => Boolean(listing.statuses.wishlist),
};

const tradeRanks: Record<MatchType, number> = {
  trueMatch: 0,
  inboundInterest: 1,
  suggested: 3,
};

export function filterListings(
  listings: MockListing[],
  filters: MarketplaceFilters,
  categories: MockCategory[],
) {
  return listings.filter((listing) => {
    if (filters.nicheId !== "all" && listing.nicheId !== filters.nicheId) {
      return false;
    }

    if (
      filters.categoryId !== "all" &&
      listing.categoryId !== filters.categoryId
    ) {
      return false;
    }

    if (
      filters.statusFilters.size > 0 &&
      !Array.from(filters.statusFilters).some((status) =>
        statusAccessors[status](listing),
      )
    ) {
      return false;
    }

    if (
      filters.condition !== "all" &&
      listing.condition !== filters.condition
    ) {
      return false;
    }

    if (!matchesPriceRange(listing, filters.priceRange)) {
      return false;
    }

    if (!matchesCommunityContext(listing, filters.communityContext)) {
      return false;
    }

    return listingMatchesSearch(listing, filters.search, categories);
  });
}

export function sortListings(
  listings: MockListing[],
  sort: SortOption,
  tradeSources: TradeRelevanceSource[],
) {
  const ranked = [...listings];

  if (sort === "newest") {
    return ranked.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  if (sort === "price-low") {
    return ranked.sort((a, b) => comparePrices(a, b, "asc"));
  }

  if (sort === "price-high") {
    return ranked.sort((a, b) => comparePrices(a, b, "desc"));
  }

  if (sort === "trade-matches") {
    return ranked.sort(
      (a, b) =>
        getTradeRelevanceRank(a, tradeSources) -
          getTradeRelevanceRank(b, tradeSources) ||
        Number(Boolean(b.statuses.forTrade)) -
          Number(Boolean(a.statuses.forTrade)),
    );
  }

  return ranked;
}

export function listingMatchesSearch(
  listing: MockListing,
  query: string,
  categories: MockCategory[],
) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const category = categories.find((item) => item.id === listing.categoryId);
  const searchable = [
    listing.title,
    listing.subtitle,
    listing.brand,
    listing.condition,
    listing.sellerName,
    listing.location,
    listing.tradeSummary,
    category?.name,
    ...(listing.communityContext ?? []),
    ...listing.attributes.map((attribute) => attribute.value),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchable.includes(normalizedQuery);
}

export function getListingPriceValue(listing: MockListing) {
  if (!listing.price) {
    return null;
  }

  const value = Number(listing.price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(value) ? value : null;
}

export function getTradeRelevanceRank(
  listing: MockListing,
  tradeSources: TradeRelevanceSource[],
) {
  const title = listing.title.toLowerCase();
  const matchedSource = tradeSources.find((source) => {
    return (
      source.userItem.toLowerCase().includes(title) ||
      title.includes(source.userItem.toLowerCase()) ||
      source.otherItem.toLowerCase().includes(title) ||
      title.includes(source.otherItem.toLowerCase())
    );
  });

  if (matchedSource) {
    return tradeRanks[matchedSource.matchType];
  }

  if (listing.statuses.forTrade) {
    return 2;
  }

  if (listing.statuses.wishlist) {
    return 4;
  }

  return 5;
}

function matchesPriceRange(listing: MockListing, range: PriceRangeFilter) {
  if (range === "all") {
    return true;
  }

  const price = getListingPriceValue(listing);

  if (price === null) {
    return false;
  }

  if (range === "under-250") {
    return price < 250;
  }

  if (range === "250-750") {
    return price >= 250 && price < 750;
  }

  if (range === "750-1500") {
    return price >= 750 && price < 1500;
  }

  return price >= 1500;
}

function matchesCommunityContext(
  listing: MockListing,
  context: CommunityContextFilter,
) {
  if (context === "all") {
    return true;
  }

  const hasPublicContext = listing.publishingContexts.some(
    (publishingContext) => publishingContext.type === "public_market",
  );
  const hasCommunityContext = listing.publishingContexts.some(
    (publishingContext) => publishingContext.type === "community_market",
  );

  if (context === "public") {
    return hasPublicContext;
  }

  return hasCommunityContext;
}

function comparePrices(
  first: MockListing,
  second: MockListing,
  direction: "asc" | "desc",
) {
  const firstPrice = getListingPriceValue(first);
  const secondPrice = getListingPriceValue(second);

  if (firstPrice === null && secondPrice === null) {
    return 0;
  }

  if (firstPrice === null) {
    return 1;
  }

  if (secondPrice === null) {
    return -1;
  }

  return direction === "asc"
    ? firstPrice - secondPrice
    : secondPrice - firstPrice;
}
