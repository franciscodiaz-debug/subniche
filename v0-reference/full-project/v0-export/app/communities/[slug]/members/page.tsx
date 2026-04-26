import { CommunityMembersContent } from "@/components/communities/community-members-content"

interface CommunityMembersPageProps {
  params: Promise<{ slug: string }>
}

export default async function CommunityMembersPage({ params }: CommunityMembersPageProps) {
  const { slug } = await params

  return <CommunityMembersContent slug={slug} />
}
