import { CollectionPageClient } from "./collection-page-client"
import {
  myCollections,
  myItems,
  collectionPreviewImages,
  collectionMeta,
} from "@/lib/mock/my-stuff"

interface CollectionPageProps {
  params: Promise<{ id: string }>
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { id } = await params

  // The mock arrays are the static fallback — the client wrapper layers the
  // local store on top so user-created/edited collections take precedence.
  const fallbackCollection = myCollections.find((c) => c.id === id) ?? null
  const fallbackItems = myItems.filter((item) => item.collection_id === id)
  const previewImages = collectionPreviewImages[id] ?? []
  const meta = collectionMeta[id] ?? {
    categories: [],
    subcategories: [],
    followingCountLabel: "",
  }

  return (
    <CollectionPageClient
      id={id}
      fallbackCollection={fallbackCollection}
      fallbackItems={fallbackItems}
      previewImages={previewImages}
      followingCountLabel={meta.followingCountLabel}
      categories={meta.categories}
      subcategories={meta.subcategories}
    />
  )
}
