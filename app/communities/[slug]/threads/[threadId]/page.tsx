import { notFound } from "next/navigation";
import { CommunityThreadPage } from "@/components/community/community-thread-page";
import {
  getCommunityBySlug,
  getThreadById,
  getThreadComments,
  mockCommunityThreads,
} from "@/components/community/community-detail-data";
import { mockCommunities, mockProfiles } from "@/data/mock";

type CommunityThreadRouteProps = {
  params: Promise<{ slug: string; threadId: string }>;
};

export function generateStaticParams() {
  return mockCommunityThreads.map((thread) => {
    const community = mockCommunities.find(
      (item) => item.id === thread.communityId,
    );

    return {
      slug: community?.slug ?? thread.communityId,
      threadId: thread.id,
    };
  });
}

export default async function Page({ params }: CommunityThreadRouteProps) {
  const { slug, threadId } = await params;
  const community = getCommunityBySlug(slug);
  const thread = getThreadById(threadId);

  if (!community || !thread || thread.communityId !== community.id) {
    notFound();
  }

  const comments = getThreadComments(thread.id).map((comment) => ({
    ...comment,
    author: mockProfiles.find((profile) => profile.id === comment.authorId),
  }));

  return (
    <CommunityThreadPage
      author={mockProfiles.find((profile) => profile.id === thread.authorId)}
      comments={comments}
      community={community}
      thread={thread}
    />
  );
}
