import type { MockProfile } from "@/data/mock/types";

export const mockProfiles: MockProfile[] = [
  {
    id: "kyle-k",
    displayName: "Kyle K",
    handle: "@subnichefounder",
    avatarUrl: "/mock/profiles/kyle-k.jpg",
    location: "Portland, OR",
    memberSince: "Member since 2026",
    bio: "Guitar gear obsessive building a focused marketplace for people who care about provenance, condition, and trade fit.",
    stats: [
      { label: "Listings", value: "12" },
      { label: "Collection", value: "38" },
      { label: "Trade interests", value: "7" },
      { label: "Communities", value: "4" },
    ],
    indicators: ["Profile context", "Linked account", "Community member"],
    ownProfile: true,
  },
  {
    id: "mara-voss",
    displayName: "Mara Voss",
    handle: "@maraplays",
    avatarUrl: "/mock/profiles/mara-voss.jpg",
    location: "Seattle, WA",
    memberSince: "Member since 2024",
    bio: "Touring guitarist and pedal trader. Mostly interested in compact studio tools and odd modulation.",
    stats: [
      { label: "Listings", value: "18" },
      { label: "Collection", value: "24" },
      { label: "Trade interests", value: "5" },
      { label: "Communities", value: "3" },
    ],
    indicators: ["Repeat trader", "Linked account", "Local pickup friendly"],
  },
  {
    id: "tone-archive",
    displayName: "Tone Archive",
    handle: "@tonearchive",
    avatarUrl: "/mock/profiles/tone-archive.jpg",
    location: "Bend, OR",
    memberSince: "Member since 2023",
    bio: "Small collection of semi-hollow guitars, vintage amps, and clean provenance notes.",
    stats: [
      { label: "Listings", value: "9" },
      { label: "Collection", value: "51" },
      { label: "Trade interests", value: "4" },
      { label: "Communities", value: "6" },
    ],
    indicators: ["Collection notes", "Community moderator", "Verified history"],
  },
];

export function getMockProfile(profileId: string) {
  return mockProfiles.find((profile) => profile.id === profileId);
}
