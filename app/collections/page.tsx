import { PageShell } from "@/components/layout/page-shell";
import { CollectionsOverview } from "@/components/collection/collections-overview";
import {
  getMockCollectionsForProfile,
  getMockListingsForProfile,
  getMockProfileById,
} from "@/data/mock";

export default function CollectionsPage() {
  const profile = getMockProfileById("kyle-k");

  if (!profile) {
    return null;
  }

  return (
    <PageShell>
      <CollectionsOverview
        collections={getMockCollectionsForProfile(profile.id)}
        listings={getMockListingsForProfile(profile.id)}
        profile={profile}
      />
    </PageShell>
  );
}
