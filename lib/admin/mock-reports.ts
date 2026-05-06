export type ReportType = "listing" | "user" | "message" | "collection" | "wishlist"
export type ReportStatus = "open" | "resolved" | "dismissed"

export interface AdminReport {
  id: string
  type: ReportType
  contentSummary: string
  contentId: string
  reportedByUsername: string
  reason: string
  reportedAt: string
  status: ReportStatus
}

export const mockReports: AdminReport[] = [
  {
    id: "rpt-001",
    type: "listing",
    contentSummary: "1965 Fender Stratocaster — $18,500",
    contentId: "listing-strat-1965",
    reportedByUsername: "concerned_buyer",
    reason: "Price seems fraudulent. Photos appear to be stock images from another site.",
    reportedAt: "2026-05-04T08:12:00Z",
    status: "open",
  },
  {
    id: "rpt-002",
    type: "user",
    contentSummary: "@shady_seller_99",
    contentId: "user-shady-seller",
    reportedByUsername: "tone_chaser_tx",
    reason: "User is harassing me in messages after I declined their offer. Multiple unsolicited follow-ups.",
    reportedAt: "2026-05-03T21:44:00Z",
    status: "open",
  },
  {
    id: "rpt-003",
    type: "message",
    contentSummary: "Thread: '63 Telecaster Relic inquiry",
    contentId: "thread-tele-relic",
    reportedByUsername: "tele_guy_pdx",
    reason: "Buyer is using threatening language and demanding my address.",
    reportedAt: "2026-05-03T16:30:00Z",
    status: "open",
  },
  {
    id: "rpt-004",
    type: "collection",
    contentSummary: "Collection: “My Guitar Arsenal” — @boutique_gear",
    contentId: "collection-arsenal",
    reportedByUsername: "another_user",
    reason: "Collection contains photos stolen from my Instagram. Reported the specific item separately.",
    reportedAt: "2026-05-02T14:05:00Z",
    status: "open",
  },
  {
    id: "rpt-005",
    type: "wishlist",
    contentSummary: "Wishlist: 1959 Les Paul (any condition)",
    contentId: "wishlist-les-paul-59",
    reportedByUsername: "lp_collector",
    reason: "This wishlist looks like it was created to scout for underpriced items to flip. Not sure if that's a violation.",
    reportedAt: "2026-05-01T19:22:00Z",
    status: "dismissed",
  },
  {
    id: "rpt-006",
    type: "listing",
    contentSummary: "Shoei RF-1400 — $180",
    contentId: "listing-shoei-rf1400",
    reportedByUsername: "moto_rider_pdx",
    reason: "This helmet was listed as 'never dropped' but I can see damage in the interior photos. Misleading listing.",
    reportedAt: "2026-04-30T11:55:00Z",
    status: "resolved",
  },
]
