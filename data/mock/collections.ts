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
      listingImage("listing-mesa-dual-rectifier"),
      listingImage("listing-fender-twin"),
    ],
    itemCount: 18,
    visibility: "Public collection",
    href: "/collections/collection-studio-workhorses",
  },
  {
    id: "collection-semi-hollow-watchlist",
    ownerId: "tone-archive",
    nicheId: "music-gear",
    title: "Semi-Hollow Watchlist",
    description: "335-style guitars and clean Gretsch examples worth tracking.",
    images: [
      listingImage("listing-rickenbacker-360"),
      "/mock/listings/gretsch-6120-orange.jpg",
      listingImage("listing-les-paul-goldtop"),
    ],
    itemCount: 9,
    visibility: "Public collection",
    href: "/collections/collection-semi-hollow-watchlist",
  },
  {
    id: "collection-acoustic-shortlist",
    ownerId: "mara-voss",
    nicheId: "music-gear",
    title: "Acoustic Shortlist",
    description: "Modern stage-ready acoustics with reliable pickup systems.",
    images: [
      listingImage("listing-martin-d28"),
      listingImage("listing-taylor-814ce"),
      listingImage("listing-strat-pro-ii"),
    ],
    itemCount: 7,
    visibility: "Unlisted collection",
    href: "/collections/collection-acoustic-shortlist",
  },
];
