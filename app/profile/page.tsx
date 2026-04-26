import { PageShell } from "@/components/layout/page-shell";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import {
  getMockCollectionsForProfile,
  getMockListingsForProfile,
  getMockProfileById,
  getMockTradeInterestsForProfile,
  getMockWishlistListingsForProfile,
} from "@/data/mock";

export default function ProfilePage() {
  const profile = getMockProfileById("kyle-k");

  if (!profile) {
    return null;
  }

  const collections = getMockCollectionsForProfile(profile.id);
  const listings = getMockListingsForProfile(profile.id);
  const wantedListings = getMockWishlistListingsForProfile(profile.id);
  const tradeInterests = getMockTradeInterestsForProfile(profile.id);

  return (
    <PageShell className="space-y-8">
      <ProfileHeader
        displayName={profile.displayName}
        handle={profile.handle}
        avatarUrl={profile.avatarUrl}
        location={profile.location}
        memberSince={profile.memberSince}
        bio={profile.bio}
        stats={profile.stats}
        indicators={profile.indicators}
        ownProfile={profile.ownProfile}
      />
      <ProfileTabs
        collections={collections}
        displayName={profile.displayName}
        listings={listings}
        tradeInterests={tradeInterests}
        wantedListings={wantedListings}
      />
    </PageShell>
  );
}
