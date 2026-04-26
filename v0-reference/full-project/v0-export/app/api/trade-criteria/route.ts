import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Create trade criteria for a listing or collection item
export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      listing_id,
      collection_item_id,
      target_category,
      target_subcategories,
      acceptable_conditions,
      min_value,
      max_value,
      value_flexibility,
      description,
    } = body

    // Validate that either listing_id or collection_item_id is provided
    if (!listing_id && !collection_item_id) {
      return NextResponse.json({ error: "Either listing_id or collection_item_id is required" }, { status: 400 })
    }

    if (listing_id && collection_item_id) {
      return NextResponse.json(
        { error: "Only one of listing_id or collection_item_id should be provided" },
        { status: 400 },
      )
    }

    if (!target_category) {
      return NextResponse.json({ error: "target_category is required" }, { status: 400 })
    }

    // Verify ownership
    if (listing_id) {
      const { data: listing, error } = await supabase.from("listings").select("seller_id").eq("id", listing_id).single()

      if (error || !listing || listing.seller_id !== user.id) {
        return NextResponse.json({ error: "Listing not found or not owned by user" }, { status: 404 })
      }
    }

    if (collection_item_id) {
      const { data: item, error } = await supabase
        .from("collection_items")
        .select("collection:collections!inner(user_id)")
        .eq("id", collection_item_id)
        .single()

      if (error || !item || (item.collection as { user_id: string }).user_id !== user.id) {
        return NextResponse.json({ error: "Collection item not found or not owned by user" }, { status: 404 })
      }
    }

    // Create the trade criteria
    const { data: criteria, error: insertError } = await supabase
      .from("trade_criteria")
      .insert({
        listing_id,
        collection_item_id,
        user_id: user.id,
        target_category,
        target_subcategories: target_subcategories || [],
        acceptable_conditions: acceptable_conditions || [],
        min_value,
        max_value,
        value_flexibility: value_flexibility || "flexible",
        description,
      })
      .select()
      .single()

    if (insertError) throw insertError

    return NextResponse.json({ criteria })
  } catch (error) {
    console.error("[v0] Create trade criteria error:", error)
    return NextResponse.json({ error: "Failed to create trade criteria" }, { status: 500 })
  }
}

// Get trade criteria for current user
export async function GET(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get("listing_id")
    const collectionItemId = searchParams.get("collection_item_id")

    let query = supabase
      .from("trade_criteria")
      .select(`
        *,
        listing:listings(id, title, images, price),
        collection_item:collection_items(id, title, images, user_estimated_value)
      `)
      .eq("user_id", user.id)

    if (listingId) {
      query = query.eq("listing_id", listingId)
    }

    if (collectionItemId) {
      query = query.eq("collection_item_id", collectionItemId)
    }

    const { data: criteria, error } = await query

    if (error) throw error

    return NextResponse.json({ criteria })
  } catch (error) {
    console.error("[v0] Get trade criteria error:", error)
    return NextResponse.json({ error: "Failed to fetch trade criteria" }, { status: 500 })
  }
}

// Delete trade criteria
export async function DELETE(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const criteriaId = searchParams.get("id")

    if (!criteriaId) {
      return NextResponse.json({ error: "Criteria ID is required" }, { status: 400 })
    }

    const { error } = await supabase.from("trade_criteria").delete().eq("id", criteriaId).eq("user_id", user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete trade criteria error:", error)
    return NextResponse.json({ error: "Failed to delete trade criteria" }, { status: 500 })
  }
}
