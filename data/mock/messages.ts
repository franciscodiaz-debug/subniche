import type { MockMessageThread } from "@/data/mock/types";

export const mockMessageThreads: MockMessageThread[] = [
  {
    id: "thread-mara-strat",
    participantId: "mara-voss",
    listingId: "listing-strat-pro-ii",
    subject: "PRS Custom 24 for your Strat?",
    lastMessage:
      "I can add cash if the Strat includes the original case and paperwork.",
    updatedAt: "2026-04-12T18:24:00.000Z",
    unread: true,
    offerState: "countered",
  },
  {
    id: "thread-tone-mesa",
    participantId: "tone-archive",
    listingId: "listing-mesa-dual-rectifier",
    subject: "Twin Reverb trade fit",
    lastMessage:
      "The Twin was serviced last winter. I uploaded the receipt notes to the listing.",
    updatedAt: "2026-04-11T09:35:00.000Z",
    unread: false,
    offerState: "pending",
  },
  {
    id: "thread-acoustic-corner",
    participantId: "mara-voss",
    listingId: "listing-martin-d28",
    subject: "D-28 humidity history",
    lastMessage:
      "It has lived in a case humidifier setup since I bought it in 2021.",
    updatedAt: "2026-04-08T21:10:00.000Z",
    unread: false,
  },
];
