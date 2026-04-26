export type ListingStatus = {
  forSale?: boolean;
  forTrade?: boolean;
  inCollection?: boolean;
  wishlist?: boolean;
};

export type ListingPriceMode =
  | "cash"
  | "tradePreferred"
  | "cashPlusTrade"
  | "wanted";

export type ListingCardProps = {
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
