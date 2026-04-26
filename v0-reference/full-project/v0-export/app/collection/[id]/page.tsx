import { IndividualCollectionPage } from "@/components/collection/individual-collection-page"

interface CollectionPageProps {
  params: Promise<{ id: string }>
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { id } = await params
  
  return <IndividualCollectionPage collectionId={id} />
}
