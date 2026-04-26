import { PageShell } from "@/components/layout/page-shell";
import { CommunitiesPage as CommunitiesExperience } from "@/components/communities/communities-page";
import { mockCommunities, mockCommunityMemberships, mockListings } from "@/data/mock";

export default function CommunitiesPage() {
  return (
    <PageShell>
      <CommunitiesExperience
        communities={mockCommunities}
        listings={mockListings}
        memberships={mockCommunityMemberships}
        profileId="kyle-k"
      />
    </PageShell>
  );
}
