import type { MockCategory, MockNiche } from "@/data/mock/types";

export const mockNiches: MockNiche[] = [
  {
    id: "music-gear",
    name: "Music Gear",
    slug: "music-gear",
    description:
      "A niche market for instruments, amps, pedals, studio gear, and collector-grade provenance.",
  },
];

export const mockCategories: MockCategory[] = [
  {
    id: "electric-guitars",
    nicheId: "music-gear",
    name: "Electric Guitars",
    slug: "electric-guitars",
    itemCount: 1248,
  },
  {
    id: "acoustic-guitars",
    nicheId: "music-gear",
    name: "Acoustic Guitars",
    slug: "acoustic-guitars",
    itemCount: 642,
  },
  {
    id: "amplifiers",
    nicheId: "music-gear",
    name: "Amplifiers",
    slug: "amplifiers",
    itemCount: 489,
  },
  {
    id: "effects-pedals",
    nicheId: "music-gear",
    name: "Effects Pedals",
    slug: "effects-pedals",
    itemCount: 936,
  },
];
