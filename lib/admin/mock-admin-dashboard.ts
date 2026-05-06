export interface AdminStats {
  niches: number
  categories: number
  pendingReview: number
  openReports: number
  totalUsers: number
  activeListings: number
}

export interface ActivityLogEntry {
  id: string
  timestamp: string
  type: "moderation" | "review"
  description: string
}

export const adminStats: AdminStats = {
  niches: 3,
  categories: 7,
  pendingReview: 12,
  openReports: 4,
  totalUsers: 10,
  activeListings: 284,
}

export const adminActivityLog: ActivityLogEntry[] = [
  {
    id: "log-001",
    timestamp: "2026-05-04T08:12:00Z",
    type: "moderation",
    description: "@concerned_buyer reported listing \"1965 Fender Stratocaster — $18,500\" for suspected fraud",
  },
  {
    id: "log-002",
    timestamp: "2026-05-04T07:30:00Z",
    type: "review",
    description: "@boutique_acoustic submitted \"Collings\" for Acoustic Guitars / Brand",
  },
  {
    id: "log-003",
    timestamp: "2026-05-03T21:44:00Z",
    type: "moderation",
    description: "@tone_chaser_tx reported user @shady_seller_99 for harassment",
  },
  {
    id: "log-004",
    timestamp: "2026-05-03T18:10:00Z",
    type: "review",
    description: "@stratman_66 submitted \"Fano\" for Electric Guitars / Brand",
  },
  {
    id: "log-005",
    timestamp: "2026-05-03T16:30:00Z",
    type: "moderation",
    description: "@tele_guy_pdx reported message thread \"'63 Telecaster Relic inquiry\" for threatening language",
  },
  {
    id: "log-006",
    timestamp: "2026-05-03T14:55:00Z",
    type: "review",
    description: "@vintage_jp_gear submitted \"Teisco\" for Electric Guitars / Brand",
  },
  {
    id: "log-007",
    timestamp: "2026-05-02T14:05:00Z",
    type: "moderation",
    description: "@another_user reported collection \"My Guitar Arsenal\" for stolen photos",
  },
  {
    id: "log-008",
    timestamp: "2026-05-02T11:20:00Z",
    type: "review",
    description: "@lp_collector submitted \"Bourgeois\" for Acoustic Guitars / Brand",
  },
]
