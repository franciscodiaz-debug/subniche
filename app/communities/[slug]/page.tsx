import { notFound } from "next/navigation";
import { CommunityDetailPage } from "@/components/community/community-detail-page";
import {
  getCommunityBySlug,
  getCommunityListings,
  getCommunityMembers,
  getCommunityThreads,
} from "@/components/community/community-detail-data";
import { mockCommunities } from "@/data/mock";

type CommunityPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return mockCommunities.map((community) => ({ slug: community.slug }));
}

export default async function Page({ params }: CommunityPageProps) {
  const { slug } = await params;
  const community = getCommunityBySlug(slug);

  if (!community) {
    notFound();
  }

  return (
    <CommunityDetailPage
      community={community}
      listings={getCommunityListings(community)}
      members={getCommunityMembers(community)}
      threads={getCommunityThreads(community)}
    />
  );
}
