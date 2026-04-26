import { mockListings } from "@/data/mock/listings";
import type { MockCollection } from "@/data/mock/types";

const listingImage = (listingId: string) => {
  const listing = mockListings.find((item) => item.id === listingId);
  return listing?.imageUrl ?? "/mock/listings/fender-stratocaster-sunburst.jpg";
};

export const mockCollections: MockCollection[] = [
  {
    id: "collection-studio-workhorses",
    ownerId: "kyle-k",
    nicheId: "music-gear",
    title: "Studio Workhorses",
    description: "Pieces that actually stay wired into the working studio.",
    images: [
      listingImage("listing-strat-pro-ii"),
      listingImage("listing-fender-twin"),
      listingImage("listing-les-paul-goldtop"),
      "/mock/listings/gretsch-6120-orange.jpg",
    ],
    itemCount: 18,
    estimatedValue: "$62,000",
    aiEstimate: "$64,500",
    visibility: "Public collection",
    href: "/collections/collection-studio-workhorses",
  },
  {
    id: "collection-semi-hollow-watchlist",
    ownerId: "kyle-k",
    nicheId: "music-gear",
    title: "Dream Guitars",
    description: "Semi-hollows, clean Rickenbackers, and other guitars Kyle is hunting.",
    images: [
      listingImage("listing-rickenbacker-360"),
      "/mock/listings/gretsch-6120-orange.jpg",
      listingImage("listing-les-paul-goldtop"),
    ],
    itemCount: 9,
    estimatedValue: "$38,400",
    aiEstimate: "$40,100",
    visibility: "Unlisted collection",
    href: "/collections/collection-semi-hollow-watchlist",
  },
  {
    id: "collection-acoustic-shortlist",
    ownerId: "kyle-k",
    nicheId: "music-gear",
    title: "Pedal Board",
    description: "Current pedalboard gear, ambient tools, and tradeable utility pedals.",
    images: [
      listingImage("listing-martin-d28"),
      listingImage("listing-taylor-814ce"),
      listingImage("listing-strat-pro-ii"),
    ],
    itemCount: 7,
    estimatedValue: "$12,900",
    aiEstimate: "$13,700",
    visibility: "Unlisted collection",
    href: "/collections/collection-acoustic-shortlist",
  },
];
