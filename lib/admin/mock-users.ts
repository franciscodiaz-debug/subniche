export type UserStatus = "active" | "suspended" | "banned"

export interface AdminUser {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  status: UserStatus
  memberSince: string
  listingCount: number
  reportsAgainst: number
  email: string
}

export const mockAdminUsers: AdminUser[] = [
  {
    id: "user-001",
    username: "stratman_66",
    displayName: "Jordan K.",
    avatarUrl: "/avatar-jordan.jpg",
    status: "active",
    memberSince: "2025-11-03",
    listingCount: 12,
    reportsAgainst: 0,
    email: "jordan@example.com",
  },
  {
    id: "user-002",
    username: "lp_collector",
    displayName: "Fran M.",
    avatarUrl: null,
    status: "active",
    memberSince: "2025-12-14",
    listingCount: 7,
    reportsAgainst: 0,
    email: "fran@example.com",
  },
  {
    id: "user-003",
    username: "boutique_gear",
    displayName: "Sam R.",
    avatarUrl: null,
    status: "active",
    memberSince: "2026-01-08",
    listingCount: 23,
    reportsAgainst: 1,
    email: "sam@example.com",
  },
  {
    id: "user-004",
    username: "tone_chaser_tx",
    displayName: "Alex T.",
    avatarUrl: null,
    status: "active",
    memberSince: "2026-02-22",
    listingCount: 4,
    reportsAgainst: 0,
    email: "alex@example.com",
  },
  {
    id: "user-005",
    username: "shady_seller_99",
    displayName: "Unknown",
    avatarUrl: null,
    status: "suspended",
    memberSince: "2026-04-15",
    listingCount: 2,
    reportsAgainst: 3,
    email: "shady@example.com",
  },
  {
    id: "user-006",
    username: "moto_rider_pdx",
    displayName: "Casey L.",
    avatarUrl: null,
    status: "active",
    memberSince: "2026-01-30",
    listingCount: 8,
    reportsAgainst: 0,
    email: "casey@example.com",
  },
  {
    id: "user-007",
    username: "vintage_jp_gear",
    displayName: "Kenji S.",
    avatarUrl: null,
    status: "active",
    memberSince: "2025-10-19",
    listingCount: 31,
    reportsAgainst: 0,
    email: "kenji@example.com",
  },
  {
    id: "user-008",
    username: "spam_bot_2026",
    displayName: "Deals Daily",
    avatarUrl: null,
    status: "banned",
    memberSince: "2026-04-28",
    listingCount: 0,
    reportsAgainst: 5,
    email: "spam@example.com",
  },
  {
    id: "user-009",
    username: "acoustic_only",
    displayName: "River P.",
    avatarUrl: null,
    status: "active",
    memberSince: "2026-03-11",
    listingCount: 5,
    reportsAgainst: 0,
    email: "river@example.com",
  },
  {
    id: "user-010",
    username: "boutique_acoustic",
    displayName: "Nora W.",
    avatarUrl: null,
    status: "active",
    memberSince: "2026-02-05",
    listingCount: 9,
    reportsAgainst: 0,
    email: "nora@example.com",
  },
]
