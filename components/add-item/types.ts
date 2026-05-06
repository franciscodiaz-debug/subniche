export type ItemMode = "owned" | "wanted";

export type WishlistEntryMode = "choice" | "url" | "manual";

export type OwnedStatusState = {
  forSale: boolean;
  forTrade: boolean;
  inCollection: boolean;
};

export type ItemBasicsState = {
  title: string;
  subtitle: string;
  description: string;
  nicheId: string;
  categoryId: string;
  condition: string;
  conditionDetails: string;
  brand: string;
  model: string;
  year: string;
  location: string;
};

export type SaleState = {
  price: string;
  acceptsOffers: boolean;
  fulfillment: "local" | "shipping" | "both";
};

export type TradeState = {
  acceptedCategoryIds: string[];
  notes: string;
  cashPreference:
    | "either-way"
    | "i-can-add"
    | "need-cash-added"
    | "straight-trade";
};

export type CollectionState = {
  collectionId: string;
  visibility: "public" | "profile" | "private";
  note: string;
  dateAcquired: string;
  acquisitionPrice: string;
};

export type WantedState = {
  idealCondition: string;
  sourceUrl: string;
  targetPrice: string;
  notes: string;
  visibility: "public" | "private";
};

export type PublishingState = {
  publicMarket: boolean;
  communityIds: string[];
};

export type SampleImage = {
  alt: string;
  src: string;
};
