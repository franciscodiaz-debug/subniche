import { CommunityContent } from "@/components/communities/community-content"

interface CommunityPageProps {
  params: Promise<{ slug: string }>
}

export default async function CommunityPage({ params }: CommunityPageProps) {
  const { slug } = await params

  return (
    <div className="min-h-screen bg-background">
      <CommunityContent slug={slug} />
    </div>
  )
}
