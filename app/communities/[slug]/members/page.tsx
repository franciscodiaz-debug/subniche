import { notFound } from "next/navigation";
import { CommunityMembersPage } from "@/components/community/community-members-page";
import {
  getCommunityBySlug,
  getCommunityMembers,
} from "@/components/community/community-detail-data";
import { mockCommunities } from "@/data/mock";

type CommunityMembersRouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return mockCommunities.map((community) => ({ slug: community.slug }));
}

export default async function Page({ params }: CommunityMembersRouteProps) {
  const { slug } = await params;
  const community = getCommunityBySlug(slug);

  if (!community) {
    notFound();
  }

  return (
    <CommunityMembersPage
      community={community}
      members={getCommunityMembers(community)}
    />
  );
}
