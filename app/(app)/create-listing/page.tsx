import { CreateListingInline } from "@/components/create-listing-inline"

interface CreateListingPageProps {
  searchParams: Promise<{
    status?: string
    collectionId?: string
    collectionName?: string
  }>
}

export default async function CreateListingPage({ searchParams }: CreateListingPageProps) {
  const params = await searchParams

  return (
    <CreateListingInline
      initialStatus={params.status}
      initialCollectionId={params.collectionId}
      initialCollectionName={params.collectionName}
    />
  )
}
