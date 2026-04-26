import type { MockCommunity } from "@/data/mock/types";

export const mockCommunities: MockCommunity[] = [
  {
    id: "vintage-amp-circle",
    nicheId: "music-gear",
    name: "Vintage Amp Circle",
    slug: "vintage-amp-circle",
    description:
      "A focused space for serviced tube amps, speaker swaps, circuit history, and local audition notes.",
    memberCount: "1.8k members",
    listingCount: "214",
    visibility: "Request-only",
  },
  {
    id: "pedal-builders-guild",
    nicheId: "music-gear",
    name: "Pedal Builders Guild",
    slug: "pedal-builders-guild",
    description:
      "Boutique pedal builders, collectors, and repeat traders sharing releases, demos, and trade context.",
    memberCount: "842 members",
    listingCount: "126",
    visibility: "Public",
  },
  {
    id: "semi-hollow-club",
    nicheId: "music-gear",
    name: "Semi-Hollow Club",
    slug: "semi-hollow-club",
    description:
      "A narrower market for 335-style guitars, old Gretsch hollow bodies, and clean repair histories.",
    memberCount: "619 members",
    listingCount: "88",
    visibility: "Request-only",
  },
  {
    id: "acoustic-corner",
    nicheId: "music-gear",
    name: "Acoustic Corner",
    slug: "acoustic-corner",
    description:
      "A community for flat-top guitars, bracing details, humidity care, and honest condition notes.",
    memberCount: "1.1k members",
    listingCount: "157",
    visibility: "Public",
  },
];
