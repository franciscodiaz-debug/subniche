import { ThreadDetailContent } from "@/components/communities/thread-detail-content"

interface ThreadDetailPageProps {
  params: Promise<{
    slug: string
    threadId: string
  }>
}

export default async function ThreadDetailPage({ params }: ThreadDetailPageProps) {
  const { slug, threadId } = await params

  return <ThreadDetailContent communitySlug={slug} threadId={threadId} />
}
