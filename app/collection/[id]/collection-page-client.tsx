"use client"

/**
 * Client wrapper for the collection detail page. Picks between the owner
 * view (the default) and the visitor view when `?as=visitor` is present.
 *
 * The query-param toggle is a stand-in for real auth: the back team
 * replaces it with a check against the current user when this lands in
 * their codebase. Keeping it as a query-param means a designer or
 * reviewer can verify both surfaces without setting up multiple accounts.
 *
 * Mutable data (the collection itself and its items) resolves from the
 * local store so create/edit/delete/add-items all reflect immediately.
 * Static fallbacks (preview images, category meta) come from the server
 * page so demo links to seeded collections keep working.
 */

import { notFound, useSearchParams } from "next/navigation"
import type { Collection } from "@/lib/types"
import type { MyItem } from "@/lib/mock/my-stuff"
import { useCollections } from "@/lib/collections-context"
import { currentUser } from "@/lib/current-user"
import { CollectionOwnerView } from "@/components/collection/collection-owner-view"
import { CollectionVisitorView } from "@/components/collection/collection-visitor-view"

interface CollectionPageClientProps {
  id: string
  fallbackCollection: Collection | null
  fallbackItems: MyItem[]
  previewImages: string[]
  followingCountLabel: string
  categories: string[]
  subcategories: string[]
}

export function CollectionPageClient({
  id,
  fallbackCollection,
  fallbackItems,
  previewImages,
  followingCountLabel,
  categories,
  subcategories,
}: CollectionPageClientProps) {
  const { getCollection, getItemsForCollection } = useCollections()
  const searchParams = useSearchParams()

  const collection = getCollection(id) ?? fallbackCollection
  if (!collection) notFound()

  const storeItems = getItemsForCollection(id)
  const items = storeItems.length > 0 ? storeItems : fallbackItems

  // Auth-substitute: the visitor view shows when the collection's owner
  // isn't the current user. `?as=visitor` is a manual override that lets
  // designers and reviewers preview the visitor surface on their own
  // collections without juggling fake accounts. When real auth lands the
  // back team replaces the owner_id comparison with the real user check
  // and the query param can be removed.
  const ownerMatches =
    !collection.owner_id || collection.owner_id === currentUser.username
  const forceVisitor = searchParams.get("as") === "visitor"
  const showVisitorView = forceVisitor || !ownerMatches

  if (showVisitorView) {
    return (
      <CollectionVisitorView
        collection={collection}
        ownedItems={items}
        categories={categories}
      />
    )
  }

  return (
    <CollectionOwnerView
      collection={collection}
      ownedItems={items}
      previewImages={previewImages}
      followingCountLabel={followingCountLabel}
      categories={categories}
      subcategories={subcategories}
    />
  )
}
