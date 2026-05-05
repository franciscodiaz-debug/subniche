import { notFound } from "next/navigation"
import { CollectionOwnerView } from "@/components/collection/collection-owner-view"
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

  const collection = myCollections.find((c) => c.id === id)
  if (!collection) notFound()

  const items = myItems.filter((item) => item.collection_id === id)
  const previewImages = collectionPreviewImages[id] ?? []
  const meta = collectionMeta[id] ?? {
    categories: [],
    subcategories: [],
    followingCountLabel: "",
  }

  return (
    <CollectionOwnerView
      collection={collection}
      ownedItems={items}
      previewImages={previewImages}
      followingCountLabel={meta.followingCountLabel}
      categories={meta.categories}
      subcategories={meta.subcategories}
    />
  )
}
