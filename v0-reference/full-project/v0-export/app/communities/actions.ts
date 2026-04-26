"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface CreateCommunityInput {
  name: string
  description: string
  icon: string
  category: "geographic" | "interest" | "brand" | "organization"
  privacy: "public" | "private" | "invite_only"
}

export async function createCommunity(input: CreateCommunityInput) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to create a community" }
  }

  // Generate slug from name
  const slug = input.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  // Check if slug already exists
  const { data: existing } = await supabase.from("communities").select("id").eq("slug", slug).single()

  if (existing) {
    return { error: "A community with this name already exists" }
  }

  // Create the community
  const { data: community, error } = await supabase
    .from("communities")
    .insert({
      name: input.name,
      slug,
      description: input.description,
      icon: input.icon,
      category: input.category,
      privacy: input.privacy,
      created_by: user.id,
      member_count: 1,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Add creator as owner
  await supabase.from("community_roles").insert({
    community_id: community.id,
    user_id: user.id,
    role: "owner",
    granted_by: user.id,
  })

  // Add creator as member
  await supabase.from("user_communities").insert({
    community_id: community.id,
    user_id: user.id,
  })

  revalidatePath("/communities")

  return { community }
}

export async function joinCommunity(communityId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to join a community" }
  }

  const { error } = await supabase.from("user_communities").insert({
    community_id: communityId,
    user_id: user.id,
  })

  if (error) {
    if (error.code === "23505") {
      return { error: "You are already a member of this community" }
    }
    return { error: error.message }
  }

  revalidatePath("/communities")
  revalidatePath(`/communities/[slug]`)

  return { success: true }
}

export async function leaveCommunity(communityId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to leave a community" }
  }

  // Check if user is the owner
  const { data: role } = await supabase
    .from("community_roles")
    .select("role")
    .eq("community_id", communityId)
    .eq("user_id", user.id)
    .single()

  if (role?.role === "owner") {
    return { error: "Owners cannot leave their community. Transfer ownership first." }
  }

  // Remove any roles
  await supabase.from("community_roles").delete().eq("community_id", communityId).eq("user_id", user.id)

  // Remove membership
  const { error } = await supabase
    .from("user_communities")
    .delete()
    .eq("community_id", communityId)
    .eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/communities")
  revalidatePath(`/communities/[slug]`)

  return { success: true }
}

export interface CreatePostInput {
  communityId: string
  postType: "discussion" | "question" | "show_and_tell"
  title: string
  content: string
  images?: string[]
}

export async function createPost(input: CreatePostInput) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to create a post" }
  }

  // Check if user is a member
  const { data: membership } = await supabase
    .from("user_communities")
    .select("user_id")
    .eq("community_id", input.communityId)
    .eq("user_id", user.id)
    .single()

  if (!membership) {
    return { error: "You must be a member of this community to post" }
  }

  const { data: post, error } = await supabase
    .from("community_posts")
    .insert({
      community_id: input.communityId,
      author_id: user.id,
      post_type: input.postType,
      title: input.title,
      content: input.content,
      images: input.images || [],
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/communities/[slug]`)

  return { post }
}

export async function likePost(postId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to like a post" }
  }

  const { error } = await supabase.from("community_post_likes").insert({
    post_id: postId,
    user_id: user.id,
  })

  if (error) {
    if (error.code === "23505") {
      // Already liked, so unlike
      await supabase.from("community_post_likes").delete().eq("post_id", postId).eq("user_id", user.id)
      return { liked: false }
    }
    return { error: error.message }
  }

  return { liked: true }
}

export async function createComment(postId: string, content: string, parentId?: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to comment" }
  }

  const { data: comment, error } = await supabase
    .from("community_post_comments")
    .insert({
      post_id: postId,
      author_id: user.id,
      content,
      parent_id: parentId || null,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { comment }
}

export async function publishListingToCommunity(listingId: string, communityId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in" }
  }

  // Verify user owns the listing
  const { data: listing } = await supabase.from("listings").select("seller_id").eq("id", listingId).single()

  if (!listing || listing.seller_id !== user.id) {
    return { error: "You can only publish your own listings" }
  }

  // Verify user is a member of the community
  const { data: membership } = await supabase
    .from("user_communities")
    .select("user_id")
    .eq("community_id", communityId)
    .eq("user_id", user.id)
    .single()

  if (!membership) {
    return { error: "You must be a member of this community" }
  }

  const { error } = await supabase.from("community_listings").insert({
    community_id: communityId,
    listing_id: listingId,
    added_by: user.id,
  })

  if (error) {
    if (error.code === "23505") {
      return { error: "This listing is already published to this community" }
    }
    return { error: error.message }
  }

  // Update the listing's community_ids array
  const { data: currentListing } = await supabase.from("listings").select("community_ids").eq("id", listingId).single()

  const currentIds = currentListing?.community_ids || []
  if (!currentIds.includes(communityId)) {
    await supabase
      .from("listings")
      .update({ community_ids: [...currentIds, communityId] })
      .eq("id", listingId)
  }

  revalidatePath(`/communities/[slug]`)

  return { success: true }
}
