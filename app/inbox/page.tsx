import { PageShell } from "@/components/layout/page-shell";
import { InboxPage as InboxExperience } from "@/components/inbox/inbox-page";
import { mockListings, mockMessageThreads, mockOffers, mockProfiles } from "@/data/mock";

export default function InboxPage() {
  return (
    <PageShell>
      <InboxExperience
        listings={mockListings}
        offers={mockOffers}
        profiles={mockProfiles}
        threads={mockMessageThreads}
      />
    </PageShell>
  );
}
