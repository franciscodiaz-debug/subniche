import type {
  MockCommunity,
  MockCommunityMembership,
} from "@/data/mock/types";

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

export const mockCommunityMemberships: MockCommunityMembership[] = [
  {
    id: "membership-kyle-vintage-amp-circle",
    communityId: "vintage-amp-circle",
    profileId: "kyle-k",
    role: "member",
    joinedAt: "2026-01-09T18:00:00.000Z",
  },
  {
    id: "membership-kyle-pedal-builders-guild",
    communityId: "pedal-builders-guild",
    profileId: "kyle-k",
    role: "member",
    joinedAt: "2026-02-14T18:00:00.000Z",
  },
  {
    id: "membership-mara-pedal-builders-guild",
    communityId: "pedal-builders-guild",
    profileId: "mara-voss",
    role: "moderator",
    joinedAt: "2024-07-22T18:00:00.000Z",
  },
  {
    id: "membership-mara-acoustic-corner",
    communityId: "acoustic-corner",
    profileId: "mara-voss",
    role: "member",
    joinedAt: "2025-03-11T18:00:00.000Z",
  },
  {
    id: "membership-tone-semi-hollow-club",
    communityId: "semi-hollow-club",
    profileId: "tone-archive",
    role: "owner",
    joinedAt: "2023-10-02T18:00:00.000Z",
  },
  {
    id: "membership-tone-vintage-amp-circle",
    communityId: "vintage-amp-circle",
    profileId: "tone-archive",
    role: "moderator",
    joinedAt: "2024-04-18T18:00:00.000Z",
  },
];
