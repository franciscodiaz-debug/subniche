import type { Listing, Profile, Conversation, Message, Community, CommunityEnhanced, CommunityPost } from "./types"

export const demoCommunities: Community[] = [
  {
    id: "comm-1",
    name: "Austin Disc Golf",
    slug: "austin-disc-golf",
    description: "Local disc golfers in Austin",
    icon: "🌳",
    member_count: 342,
  },
  {
    id: "comm-2",
    name: "DFW Disc Golf",
    slug: "dfw-disc-golf",
    description: "Dallas-Fort Worth disc golf community",
    icon: "⛳",
    member_count: 256,
  },
  {
    id: "comm-3",
    name: "PDGA Members",
    slug: "pdga-members",
    description: "Professional Disc Golf Association members",
    icon: "🏆",
    member_count: 1205,
  },
  {
    id: "comm-4",
    name: "Disc Collectors",
    slug: "disc-collectors",
    description: "Rare and collectible disc enthusiasts",
    icon: "💿",
    member_count: 89,
  },
  {
    id: "comm-5",
    name: "Tournament Players",
    slug: "tournament-players",
    description: "Competitive tournament players",
    icon: "🥇",
    member_count: 178,
  },
]

export const demoCommunitiesEnhanced: CommunityEnhanced[] = [
  {
    id: "comm-1",
    name: "Austin Disc Golf",
    slug: "austin-disc-golf",
    description:
      "Local disc golfers in the Austin, TX area. Share course tips, organize meetups, and connect with fellow players in the ATX disc golf scene.",
    icon: "🌳",
    member_count: 342,
    cover_image: "/austin-texas-skyline-disc-golf-course.jpg",
    privacy: "public",
    created_by: "demo-seller-1",
    category: "geographic",
    settings: {},
    updated_at: new Date().toISOString(),
    is_member: true,
    user_role: null,
    listing_count: 24,
  },
  {
    id: "comm-2",
    name: "DFW Disc Golf",
    slug: "dfw-disc-golf",
    description:
      "Dallas-Fort Worth disc golf community. Find players, share course reviews, and stay updated on local tournaments.",
    icon: "⛳",
    member_count: 256,
    cover_image: "/dallas-fort-worth-skyline-park.jpg",
    privacy: "public",
    created_by: "demo-buyer-1",
    category: "geographic",
    settings: {},
    updated_at: new Date().toISOString(),
    is_member: true,
    user_role: null,
    listing_count: 18,
  },
  {
    id: "comm-3",
    name: "PDGA Members",
    slug: "pdga-members",
    description: "Professional Disc Golf Association members. Discuss tournament rules, ratings, and competitive play.",
    icon: "🏆",
    member_count: 1205,
    cover_image: "/disc-golf-tournament-professional-competition.jpg",
    privacy: "public",
    created_by: "demo-user-3",
    category: "organization",
    settings: {},
    updated_at: new Date().toISOString(),
    is_member: true,
    user_role: null,
    listing_count: 45,
  },
  {
    id: "comm-4",
    name: "Disc Collectors",
    slug: "disc-collectors",
    description:
      "Rare and collectible disc enthusiasts. Share your finds, discuss values, and connect with fellow collectors.",
    icon: "💿",
    member_count: 89,
    cover_image: "/rare-collectible-disc-golf-discs-collection.jpg",
    privacy: "public",
    created_by: "demo-buyer-1",
    category: "interest",
    settings: {},
    updated_at: new Date().toISOString(),
    is_member: false,
    user_role: null,
    listing_count: 67,
  },
  {
    id: "comm-5",
    name: "Tournament Players",
    slug: "tournament-players",
    description: "Competitive tournament players. Strategy discussions, form checks, and tournament prep.",
    icon: "🥇",
    member_count: 178,
    cover_image: "/disc-golf-tournament-competition-players.jpg",
    privacy: "public",
    created_by: "demo-user-3",
    category: "interest",
    settings: {},
    updated_at: new Date().toISOString(),
    is_member: true,
    user_role: "moderator",
    listing_count: 12,
  },
  {
    id: "comm-6",
    name: "Innova Fans",
    slug: "innova-fans",
    description: "Fans of Innova disc golf discs. Discuss molds, plastics, and share your Innova collection.",
    icon: "🔴",
    member_count: 423,
    cover_image: "/innova-disc-golf-discs-red-plastic.jpg",
    privacy: "public",
    created_by: "demo-seller-1",
    category: "brand",
    settings: {},
    updated_at: new Date().toISOString(),
    is_member: false,
    user_role: null,
    listing_count: 89,
  },
  {
    id: "comm-7",
    name: "Beginner Friendly",
    slug: "beginner-friendly",
    description: "New to disc golf? Ask anything here! No question is too basic. We all started somewhere.",
    icon: "🌱",
    member_count: 567,
    cover_image: "/beginner-disc-golf-learning-tutorial.jpg",
    privacy: "public",
    created_by: "demo-seller-1",
    category: "interest",
    settings: {},
    updated_at: new Date().toISOString(),
    is_member: false,
    user_role: null,
    listing_count: 34,
  },
]

export const demoProfiles: Profile[] = [
  {
    id: "demo-seller-1",
    username: "6th_Street_Blues",
    avatar_url: "/disc-golf-player-avatar.jpg",
    location: "Austin, TX",
    phone: "555-555-5555",
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year ago
    communities: [demoCommunities[0], demoCommunities[2], demoCommunities[4]], // Austin, PDGA, Tournament
    bio: "Longtime disc golfer and collector. Happy to help new players find the right gear!",
    response_rate: 95,
    avg_response_time: "within hours",
    total_listings: 12,
    total_sales: 47,
  },
  {
    id: "demo-buyer-1",
    username: "DiscGolfFan42",
    avatar_url: "/casual-gamer-avatar.png",
    location: "Dallas, TX",
    phone: null,
    created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months ago
    communities: [demoCommunities[1], demoCommunities[2], demoCommunities[3], demoCommunities[4]], // DFW, PDGA, Disc Collectors, Tournament
    bio: "Looking to grow my collection!",
    response_rate: 88,
    avg_response_time: "within a day",
    total_listings: 3,
    total_sales: 8,
  },
  {
    id: "demo-user-3",
    username: "ChainSeeker",
    avatar_url: "/outdoor-enthusiast-avatar.jpg",
    location: "Houston, TX",
    phone: null,
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 3 months ago
    communities: [demoCommunities[2], demoCommunities[4]], // PDGA, Tournament
    bio: "Tournament player always looking for quality plastic.",
    response_rate: 100,
    avg_response_time: "within hours",
    total_listings: 5,
    total_sales: 15,
  },
]

export const demoListings: Listing[] = [
  {
    id: "1", // simplified ID from "demo-listing-1" to "1"
    seller_id: "demo-seller-1",
    title: "Dynamic Discs Mini Marker Set",
    subtitle: "Tournament Legal Mini Markers",
    description:
      "Dynamic Discs mini marker set includes 5 tournament-legal markers in different colors. These rubber mini markers meet PDGA regulations and provide excellent grip on any surface. Brand new in original packaging. Features the Dynamic Discs logo and various color options for easy identification during rounds. Perfect for marking lie positions accurately and professionally. Durable construction will last for years.",
    price: 15,
    category: "Accessories",
    subcategory: "Markers & Minis",
    condition: "Brand new in original packaging. All 5 markers unused. Rubber material perfect. Tournament legal.",
    payment_methods: ["Cash"],
    logistics: "Local pickup in Austin",
    images: [
      "/colorful-disc-golf-mini-markers-set-on-grass.jpg",
      "/close-up-of-colorful-rubber-disc-golf-mini-markers.jpg",
      "/disc-golf-mini-marker-being-used-to-mark-lie-on-fa.jpg",
      "/five-disc-golf-mini-markers-arranged-in-a-row-show.jpg",
      "/disc-golf-mini-marker-next-to-disc-on-putting-gree.jpg",
      "/hand-holding-disc-golf-mini-marker-showing-size-an.jpg",
    ],
    location: "Austin, TX",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    seller: undefined,
  },
  {
    id: "2", // simplified ID from "demo-listing-2" to "2"
    seller_id: "demo-seller-1",
    title: "Innova Champion Destroyer",
    subtitle: "Distance Driver - 175g",
    description:
      "Lightly used Innova Champion Destroyer in excellent condition. Great for long distance drives with reliable fade. Perfect for intermediate to advanced players looking to add distance to their game.",
    price: 12,
    category: "Discs",
    subcategory: "Distance Drivers",
    condition: "Lightly used, minimal wear, no ink",
    payment_methods: ["Cash", "Venmo"],
    logistics: "Local pickup or shipping available",
    images: ["/red-innova-champion-destroyer-disc.jpg"],
    location: "Austin, TX",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    seller: undefined,
  },
  {
    id: "3", // simplified ID from "discover-1" to "3"
    seller_id: "demo-seller-1",
    title: "Discraft Z Luna",
    subtitle: "Paul McBeth Signature Putter",
    description:
      "Great throwing putter with excellent glide and a reliable fade. Perfect for approach shots and putting.",
    price: 18,
    category: "Discs",
    subcategory: "Putters",
    condition: "New",
    payment_methods: ["Cash", "Venmo"],
    logistics: "Shipping available",
    images: ["/blue-discraft-luna-putter-disc.jpg"],
    location: "Dallas, TX",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    seller: undefined,
  },
  {
    id: "4", // simplified ID from "discover-2" to "4"
    seller_id: "demo-user-3",
    title: "MVP Axiom Envy",
    subtitle: "Eclipse Glow - 175g",
    description:
      "Great approach disc with reliable flight. The Eclipse Glow plastic charges in sunlight and glows bright for night rounds.",
    price: 22,
    category: "Discs",
    subcategory: "Putters",
    condition: "Like New",
    payment_methods: ["Cash"],
    logistics: "Local pickup",
    images: ["/glow-mvp-envy-disc-golf-disc.jpg"],
    location: "Houston, TX",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    seller: undefined,
  },
  {
    id: "5", // simplified ID from "discover-3" to "5"
    seller_id: "demo-buyer-1",
    title: "GRIPeq BX3 Bag",
    subtitle: "30+ Disc Capacity",
    description:
      "Premium disc golf bag with excellent storage and comfort. Holds 30+ discs with room for accessories, water bottles, and more.",
    price: 280,
    category: "Accessories",
    subcategory: "Bags",
    condition: "Used",
    payment_methods: ["Cash", "PayPal"],
    logistics: "Shipping available",
    images: ["/gripeq-disc-golf-bag-backpack.jpg"],
    location: "Austin, TX",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    seller: undefined,
  },
  {
    id: "6", // simplified ID from "discover-4" to "6"
    seller_id: "demo-seller-1",
    title: "Kastaplast K1 Lots",
    subtitle: "Fairway Driver - 174g",
    description: "Great fairway driver for beginners and intermediate players. The K1 plastic is durable and grippy.",
    price: 16,
    category: "Discs",
    subcategory: "Fairway Drivers",
    condition: "New",
    payment_methods: ["Cash"],
    logistics: "Local pickup",
    images: ["/kastaplast-lots-fairway-driver-disc.jpg"],
    location: "Austin, TX",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    seller: undefined,
  },
  {
    id: "7", // simplified ID from "discover-5" to "7"
    seller_id: "demo-user-3",
    title: "Innova Star Wraith",
    subtitle: "Distance Driver - 170g",
    description:
      "Reliable high-speed driver with excellent distance potential. Star plastic provides great grip and durability.",
    price: 14,
    category: "Discs",
    subcategory: "Distance Drivers",
    condition: "Used",
    payment_methods: ["Venmo"],
    logistics: "Shipping available",
    images: ["/innova-star-wraith-disc-golf.jpg"],
    location: "Houston, TX",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    seller: undefined,
  },
  {
    id: "8", // simplified ID from "discover-6" to "8"
    seller_id: "demo-buyer-1",
    title: "Discmania Tournament Hat",
    subtitle: "Snapback - Black/Gold",
    description: "Official Discmania tournament hat in black with gold accents. Snapback style fits most head sizes.",
    price: 28,
    category: "Apparel",
    subcategory: "Hats",
    condition: "New",
    payment_methods: ["Cash", "Venmo"],
    logistics: "Shipping available",
    images: ["/discmania-snapback-hat-black-gold.jpg"],
    location: "Dallas, TX",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    seller: undefined,
  },
]

// Attach sellers to listings
demoListings.forEach((listing) => {
  listing.seller = demoProfiles.find((p) => p.id === listing.seller_id)
})

export const demoConversations: Conversation[] = [
  {
    id: "demo-conv-1",
    participant_1: "demo-buyer-1", // Alphabetically first
    participant_2: "demo-seller-1",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-conv-2",
    participant_1: "demo-buyer-1",
    participant_2: "demo-user-3",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
  },
]

export const demoMessages: Message[] = [
  // Conversation 1 - started about the mini marker set
  {
    id: "demo-msg-1",
    conversation_id: "demo-conv-1",
    sender_id: "demo-buyer-1",
    content: "Hey! I'm interested in this listing:",
    listing_id: "1", // updated from "demo-listing-1" to "1"
    read: true,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    sender: demoProfiles[1],
    listing: demoListings[0],
  },
  {
    id: "demo-msg-2",
    conversation_id: "demo-conv-1",
    sender_id: "demo-seller-1",
    content: "Hey! Yes it's still available. Are you local to Austin?",
    listing_id: null,
    read: true,
    created_at: new Date(Date.now() - 3500000).toISOString(),
    sender: demoProfiles[0],
  },
  {
    id: "demo-msg-3",
    conversation_id: "demo-conv-1",
    sender_id: "demo-buyer-1",
    content: "I'm in Dallas but I'll be in Austin this weekend. Could we meet up Saturday?",
    listing_id: null,
    read: true,
    created_at: new Date(Date.now() - 3400000).toISOString(),
    sender: demoProfiles[1],
  },
  {
    id: "demo-msg-4",
    conversation_id: "demo-conv-1",
    sender_id: "demo-seller-1",
    content: "Saturday works! Want to meet at Circle C disc golf course around 2pm?",
    listing_id: null,
    read: false,
    created_at: new Date(Date.now() - 1800000).toISOString(),
    sender: demoProfiles[0],
  },
  // Conversation 2 - general chat
  {
    id: "demo-msg-5",
    conversation_id: "demo-conv-2",
    sender_id: "demo-user-3",
    content: "Hey, saw you're from Dallas! Have you played Lester Lorch Park?",
    listing_id: null,
    read: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    sender: demoProfiles[2],
  },
  {
    id: "demo-msg-6",
    conversation_id: "demo-conv-2",
    sender_id: "demo-buyer-1",
    content: "Yeah it's my home course! Great layout. You should check it out if you're ever in town.",
    listing_id: null,
    read: true,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    sender: demoProfiles[1],
  },
]

export const demoCommunityPosts: CommunityPost[] = [
  {
    id: "post-1",
    community_id: "comm-1",
    author_id: "demo-seller-1",
    post_type: "discussion",
    title: "Best courses for beginners in Austin?",
    content:
      "Hey everyone! I'm trying to get some friends into disc golf. What are the most beginner-friendly courses around Austin? Looking for shorter holes and not too much elevation change.",
    images: [],
    is_pinned: false,
    is_locked: false,
    like_count: 12,
    comment_count: 8,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    has_liked: false,
  },
  {
    id: "post-2",
    community_id: "comm-1",
    author_id: "demo-buyer-1",
    post_type: "show_and_tell",
    title: "Finally completed my Innova Champion collection!",
    content:
      "After 2 years of hunting, I finally got every Champion plastic mold Innova makes. Here's the full collection! The last one I needed was a 2019 Sexton Firebird.",
    images: ["/disc-golf-collection-innova-champion-discs.jpg"],
    is_pinned: false,
    is_locked: false,
    like_count: 45,
    comment_count: 23,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    has_liked: true,
  },
  {
    id: "post-3",
    community_id: "comm-1",
    author_id: "demo-user-3",
    post_type: "question",
    title: "Circle C course conditions after the rain?",
    content:
      "Planning to play Circle C tomorrow morning. Anyone been out there since the storms? Wondering how muddy it is and if any holes are flooded.",
    images: [],
    is_pinned: false,
    is_locked: false,
    like_count: 3,
    comment_count: 5,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    has_liked: false,
  },
  {
    id: "post-4",
    community_id: "comm-1",
    author_id: "demo-seller-1",
    post_type: "discussion",
    title: "Weekly doubles league starting up - who's interested?",
    content:
      "Thinking about organizing a weekly doubles league at Roy G on Tuesday evenings. $10 buy-in, random draw partners. Would run from 6pm until dark. Comment if you'd be interested and what day works best for you!",
    images: [],
    is_pinned: true,
    is_locked: false,
    like_count: 28,
    comment_count: 15,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    has_liked: true,
  },
  {
    id: "post-5",
    community_id: "comm-4",
    author_id: "demo-buyer-1",
    post_type: "question",
    title: "How do you authenticate rare discs?",
    content:
      "I'm new to collecting and want to make sure I don't get scammed. What should I look for when buying rare/collectible discs? Any red flags to watch out for?",
    images: [],
    is_pinned: false,
    is_locked: false,
    like_count: 19,
    comment_count: 12,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    has_liked: false,
  },
  {
    id: "post-6",
    community_id: "comm-3",
    author_id: "demo-user-3",
    post_type: "discussion",
    title: "New PDGA rule changes for 2025 - thoughts?",
    content:
      "Just read through the new rule changes for the upcoming season. The biggest one seems to be the updated OB relief procedures. What does everyone think about these changes?",
    images: [],
    is_pinned: false,
    is_locked: false,
    like_count: 67,
    comment_count: 42,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    has_liked: false,
  },
]

// Attach authors to posts
demoCommunityPosts.forEach((post) => {
  post.author = demoProfiles.find((p) => p.id === post.author_id)
})

export function getDemoListing(id: string): Listing | undefined {
  return demoListings.find((l) => l.id === id)
}

export function getDemoProfile(id: string): Profile | undefined {
  return demoProfiles.find((p) => p.id === id)
}

export function getDemoConversation(id: string): Conversation | undefined {
  return demoConversations.find((c) => c.id === id)
}

export function getDemoMessagesForConversation(conversationId: string): Message[] {
  return demoMessages.filter((m) => m.conversation_id === conversationId)
}

export function findDemoConversation(userId1: string, userId2: string): Conversation | undefined {
  return demoConversations.find(
    (c) =>
      (c.participant_1 === userId1 && c.participant_2 === userId2) ||
      (c.participant_1 === userId2 && c.participant_2 === userId1),
  )
}

export function getDemoCommunity(slug: string): CommunityEnhanced | undefined {
  return demoCommunitiesEnhanced.find((c) => c.slug === slug)
}

export function getDemoCommunityPosts(communityId: string): CommunityPost[] {
  return demoCommunityPosts.filter((p) => p.community_id === communityId)
}

export function getDemoCommunityListings(communityId: string): Listing[] {
  // Return a subset of listings for the community
  const listingsPerCommunity: Record<string, string[]> = {
    "comm-1": ["1", "2", "5", "6"],
    "comm-2": ["3", "8"],
    "comm-3": ["2", "4", "7"],
    "comm-4": ["1", "3", "5", "7"],
    "comm-5": ["2", "4", "6"],
  }
  const listingIds = listingsPerCommunity[communityId] || []
  return demoListings.filter((l) => listingIds.includes(l.id))
}
