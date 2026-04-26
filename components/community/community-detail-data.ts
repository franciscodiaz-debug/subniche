import {
  mockCommunities,
  mockCommunityMemberships,
  mockListings,
  mockProfiles,
} from "@/data/mock";
import type { MockCommunity } from "@/data/mock/types";

export type MockCommunityThread = {
  id: string;
  communityId: string;
  title: string;
  body: string;
  authorId: string;
  type: "discussion" | "question" | "show_and_tell";
  pinned?: boolean;
  score: number;
  commentCount: number;
  createdAt: string;
};

export type MockCommunityComment = {
  id: string;
  threadId: string;
  authorId: string;
  body: string;
  score: number;
  createdAt: string;
};

export const mockCommunityThreads: MockCommunityThread[] = [
  {
    id: "thread-serviced-deluxe-reverbs",
    communityId: "vintage-amp-circle",
    title: "What makes a serviced Deluxe Reverb worth the premium?",
    body: "Trying to separate useful service records from generic recap claims. What documentation would make you comfortable trading into one?",
    authorId: "tone-archive",
    type: "question",
    pinned: true,
    score: 42,
    commentCount: 18,
    createdAt: "2026-04-24T19:00:00.000Z",
  },
  {
    id: "thread-speaker-swap-notes",
    communityId: "vintage-amp-circle",
    title: "Jensen versus Oxford speaker swap notes",
    body: "Collected a few clips from recent repairs. The clean headroom difference is bigger than I expected.",
    authorId: "kyle-k",
    type: "discussion",
    score: 24,
    commentCount: 9,
    createdAt: "2026-04-22T17:30:00.000Z",
  },
  {
    id: "thread-delay-stack",
    communityId: "pedal-builders-guild",
    title: "Show your compact delay stack",
    body: "Looking for small board examples that cover slapback, ambient wash, and a dotted eighth without menu diving.",
    authorId: "mara-voss",
    type: "show_and_tell",
    score: 36,
    commentCount: 14,
    createdAt: "2026-04-23T14:10:00.000Z",
  },
  {
    id: "thread-switch-noise",
    communityId: "pedal-builders-guild",
    title: "Quiet relay bypass switches that still feel solid",
    body: "I am comparing a few builds and want real-world notes from people who gig these circuits.",
    authorId: "kyle-k",
    type: "question",
    score: 17,
    commentCount: 6,
    createdAt: "2026-04-21T21:45:00.000Z",
  },
  {
    id: "thread-335-neck-profiles",
    communityId: "semi-hollow-club",
    title: "Late sixties 335 neck profile notes",
    body: "A few recent listings are using broad profile language. Add measurements here if you have them.",
    authorId: "tone-archive",
    type: "discussion",
    score: 29,
    commentCount: 11,
    createdAt: "2026-04-20T11:20:00.000Z",
  },
  {
    id: "thread-humidity-routines",
    communityId: "acoustic-corner",
    title: "Case humidifier routines that actually hold steady",
    body: "What is working for winter storage without making every listing sound over-managed?",
    authorId: "mara-voss",
    type: "question",
    score: 31,
    commentCount: 13,
    createdAt: "2026-04-19T16:15:00.000Z",
  },
];

export const mockCommunityComments: MockCommunityComment[] = [
  {
    id: "comment-service-records",
    threadId: "thread-serviced-deluxe-reverbs",
    authorId: "kyle-k",
    body: "Receipts matter, but I also want clear gut shots and a list of replaced parts. A vague serviced note does not change trade confidence much.",
    score: 12,
    createdAt: "2026-04-24T20:05:00.000Z",
  },
  {
    id: "comment-transformer-question",
    threadId: "thread-serviced-deluxe-reverbs",
    authorId: "mara-voss",
    body: "Original transformers are the line for me. I am fine with caps and a grounded cable, but transformer swaps need to be priced clearly.",
    score: 9,
    createdAt: "2026-04-24T21:15:00.000Z",
  },
  {
    id: "comment-delay-stack",
    threadId: "thread-delay-stack",
    authorId: "tone-archive",
    body: "The smaller Strymon units plus an analog delay cover a lot. The trick is keeping power quiet on a compact board.",
    score: 7,
    createdAt: "2026-04-23T17:15:00.000Z",
  },
];

export function getCommunityBySlug(slug: string) {
  return mockCommunities.find(
    (community) => community.slug === slug || community.id === slug,
  );
}

export function getCommunityListings(community: MockCommunity) {
  return mockListings.filter((listing) =>
    listing.publishingContexts.some(
      (context) => context.communityId === community.id,
    ),
  );
}

export function getCommunityThreads(community: MockCommunity) {
  return mockCommunityThreads.filter(
    (thread) => thread.communityId === community.id,
  );
}

export function getCommunityMembers(community: MockCommunity) {
  const memberships = mockCommunityMemberships.filter(
    (membership) => membership.communityId === community.id,
  );

  return memberships
    .map((membership) => ({
      membership,
      profile: mockProfiles.find((profile) => profile.id === membership.profileId),
    }))
    .filter((item) => item.profile);
}

export function getThreadById(threadId: string) {
  return mockCommunityThreads.find((thread) => thread.id === threadId);
}

export function getThreadComments(threadId: string) {
  return mockCommunityComments.filter((comment) => comment.threadId === threadId);
}
