import { notFound } from "next/navigation"
import { NewCollectionForm } from "@/components/my-stuff/new-collection-form"
import { myCollections } from "@/lib/mock/my-stuff"

interface EditCollectionPageProps {
  params: Promise<{ id: string }>
}

export default async function EditCollectionPage({ params }: EditCollectionPageProps) {
  const { id } = await params
  const collection = myCollections.find((c) => c.id === id)
  if (!collection) notFound()

  return <NewCollectionForm initialData={collection} />
}
