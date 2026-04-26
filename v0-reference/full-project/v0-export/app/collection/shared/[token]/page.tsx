import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { SharedCollectionView } from "@/components/collection/shared-collection-view"

interface SharedCollectionPageProps {
  params: Promise<{ token: string }>
}

export default async function SharedCollectionPage({ params }: SharedCollectionPageProps) {
  const { token } = await params
  const supabase = await createClient()

  // Fetch collection by share token
  const { data: collection } = await supabase
    .from("collections")
    .select(
      `
      *,
      profiles!collections_user_id_fkey (
        username,
        avatar_url,
        location
      )
    `,
    )
    .eq("share_token", token)
    .in("privacy", ["public", "shared"])
    .single()

  if (!collection) {
    notFound()
  }

  // Fetch collection items
  const { data: items } = await supabase
    .from("collection_items")
    .select("*")
    .eq("collection_id", collection.id)
    .order("sort_order", { ascending: true })

  // Fetch comments
  const { data: comments } = await supabase
    .from("collection_comments")
    .select(
      `
      *,
      profiles!collection_comments_user_id_fkey (
        username,
        avatar_url
      )
    `,
    )
    .eq("collection_id", collection.id)
    .order("created_at", { ascending: false })

  return (
    <SharedCollectionView
      collection={{ ...collection, owner: collection.profiles }}
      items={items || []}
      comments={comments || []}
    />
  )
}
