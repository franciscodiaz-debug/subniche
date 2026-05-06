import type {
  MockTradeInterest,
  MockTradeOpportunity,
} from "@/data/mock/types";

export const mockTradeInterests: MockTradeInterest[] = [
  {
    id: "trade-interest-vintage-fender",
    profileId: "kyle-k",
    title: "Vintage Fender combos",
    description:
      "Open to serviced Princeton, Deluxe, and Vibrolux combos with documented maintenance.",
    criteria: [
      { label: "Category", value: "Amplifiers" },
      { label: "Brand", value: "Fender" },
      { label: "Era", value: "1964 to 1972" },
      { label: "Condition", value: "Working, serviced" },
    ],
  },
  {
    id: "trade-interest-boutique-modulation",
    profileId: "mara-voss",
    title: "Boutique modulation",
    description:
      "Looking for Fairfield, Asheville Music Tools, EAE, and compact stereo modulation.",
    criteria: [
      { label: "Category", value: "Effects Pedals" },
      { label: "Condition", value: "Very Good or better" },
      { label: "Trade range", value: "$250 to $650" },
    ],
  },
  {
    id: "trade-interest-semi-hollow",
    profileId: "tone-archive",
    title: "Clean semi-hollows",
    description:
      "Interested in Rickenbacker, Gretsch, Gibson ES, and Collings semi-hollow guitars.",
    criteria: [
      { label: "Category", value: "Electric Guitars" },
      { label: "Body", value: "Semi-hollow or hollow" },
      { label: "Documentation", value: "Repair history preferred" },
    ],
  },
];

export const mockTradeOpportunities: MockTradeOpportunity[] = [
  {
    id: "trade-true-match-1",
    matchType: "trueMatch",
    userItem: "Mesa Boogie Dual Rectifier",
    otherItem: "Fender '65 Twin Reverb Reissue",
    cashAdjustment: "$100 from you",
    reason:
      "Both sides match explicit trade interests: Kyle wants clean Fender combos and Tone Archive is open to higher-gain heads.",
  },
  {
    id: "trade-inbound-interest-1",
    matchType: "inboundInterest",
    userItem: "Fender American Pro II Stratocaster",
    otherItem: "PRS Custom 24 10-Top",
    reason:
      "Mara saved Kyle's Strat as a possible match, but Kyle has not marked PRS as an active target.",
  },
  {
    id: "trade-true-match-2",
    matchType: "trueMatch",
    userItem: "Martin D-28",
    otherItem: "Taylor 814ce Builder's Edition",
    cashAdjustment: "$300 from them",
    reason:
      "Both sides have acoustic trade criteria that overlap on dreadnought and grand auditorium stage instruments.",
  },
  {
    id: "trade-suggested-1",
    matchType: "suggested",
    userItem: "Strymon BigSky Reverb",
    otherItem: "Boutique modulation shortlist",
    reason:
      "Suggested because pedal category, price band, and condition overlap, but no exact brand criterion matched.",
  },
];
