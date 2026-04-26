import type { MockOffer } from "@/data/mock/types";

export const mockOffers: MockOffer[] = [
  {
    id: "offer-prs-for-strat",
    threadId: "thread-mara-strat",
    listingId: "listing-strat-pro-ii",
    fromProfileId: "mara-voss",
    toProfileId: "kyle-k",
    state: "countered",
    offeredListingIds: ["listing-prs-custom-24"],
    cashAdjustment: "$250 from Mara",
    note: "PRS Custom 24 plus cash for the Strat if original paperwork is included.",
    updatedAt: "2026-04-12T18:24:00.000Z",
  },
  {
    id: "offer-twin-for-mesa",
    threadId: "thread-tone-mesa",
    listingId: "listing-mesa-dual-rectifier",
    fromProfileId: "tone-archive",
    toProfileId: "kyle-k",
    state: "pending",
    offeredListingIds: ["listing-fender-twin-reverb"],
    cashAdjustment: "$100 from Kyle",
    note: "Serviced Twin Reverb for the Dual Rectifier with cash adjustment.",
    updatedAt: "2026-04-11T09:35:00.000Z",
  },
];
