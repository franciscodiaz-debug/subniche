import { CreateListingInline } from "@/components/create-listing-inline"
import { getAuthState } from "@/lib/auth"

interface CreateListingPageProps {
  searchParams: Promise<{
    status?: string
    collectionId?: string
    collectionName?: string
  }>
}

export default async function CreateListingPage({ searchParams }: CreateListingPageProps) {
  const [params, authState] = await Promise.all([searchParams, getAuthState()])

  return (
    <CreateListingInline
      isAuthenticated={authState !== 'logged-out'}
      initialStatus={params.status}
      initialCollectionId={params.collectionId}
      initialCollectionName={params.collectionName}
    />
  )
}
