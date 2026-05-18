import { notFound, redirect } from "next/navigation"
import { NewCollectionForm } from "@/components/my-stuff/new-collection-form"
import { myCollections, wishlistIdFor } from "@/lib/mock/my-stuff"
import { currentUser } from "@/lib/current-user"

interface EditCollectionPageProps {
  params: Promise<{ id: string }>
}

export default async function EditCollectionPage({ params }: EditCollectionPageProps) {
  const { id } = await params

  // The default Wishlist is immutable — no edit page; bounce back to its detail.
  if (id === wishlistIdFor(currentUser.username)) {
    redirect(`/collection/${id}`)
  }

  const collection = myCollections.find((c) => c.id === id)
  if (!collection) notFound()

  return <NewCollectionForm initialData={collection} />
}
