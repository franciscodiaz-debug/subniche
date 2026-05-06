import { PageShell } from "@/components/layout/page-shell";
import { CollectionsOverview } from "@/components/collection/collections-overview";
import {
  getMockCollectionsForProfile,
  getMockListingsForProfile,
  getMockProfileById,
} from "@/data/mock";

export function MyStuffPage() {
  const profile = getMockProfileById("kyle-k");

  if (!profile) {
    return null;
  }

  return (
    <PageShell className="lg:py-6">
      <CollectionsOverview
        collections={getMockCollectionsForProfile(profile.id)}
        listings={getMockListingsForProfile(profile.id)}
        profile={profile}
      />
    </PageShell>
  );
}
