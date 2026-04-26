import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Get inbound interest - items that want your items (one-way matches)
export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Step 1: Get all my tradeable items
    const [listingsResult, collectionItemsResult] = await Promise.all([
      supabase
        .from("listings")
        .select("id, seller_id, title, subtitle, images, category, subcategory, condition, price")
        .eq("seller_id", user.id),
      supabase
        .from("collection_items")
        .select(`
          id, 
          collection_id,
          title, 
          subtitle, 
          images, 
          category, 
          subcategory, 
          condition, 
          user_estimated_value,
          ai_suggested_value,
          for_trade,
          collection:collections!inner(user_id)
        `)
        .eq("for_trade", true)
        .eq("collections.user_id", user.id),
    ])

    if (listingsResult.error) throw listingsResult.error
    if (collectionItemsResult.error) throw collectionItemsResult.error

    const myListings = listingsResult.data || []
    const myCollectionItems = collectionItemsResult.data || []

    // Step 2: Get my trade criteria IDs to exclude perfect matches
    const { data: myCriteria } = await supabase
      .from("trade_criteria")
      .select("listing_id, collection_item_id")
      .eq("user_id", user.id)
      .eq("is_active", true)

    const myItemsWithCriteria = new Set([
      ...(myCriteria || []).filter((c) => c.listing_id).map((c) => c.listing_id),
      ...(myCriteria || []).filter((c) => c.collection_item_id).map((c) => c.collection_item_id),
    ])

    // Step 3: Get other users' trade criteria
    const { data: othersCriteria, error: othersCriteriaError } = await supabase
      .from("trade_criteria")
      .select(`
        *,
        listing:listings(id, seller_id, title, subtitle, images, category, subcategory, condition, price, seller:profiles(*)),
        collection_item:collection_items(
          id, 
          title, 
          subtitle, 
          images, 
          category, 
          subcategory, 
          condition, 
          user_estimated_value,
          ai_suggested_value,
          collection:collections(user_id, user:profiles(*))
        )
      `)
      .neq("user_id", user.id)
      .eq("is_active", true)

    if (othersCriteriaError) throw othersCriteriaError

    // Step 4: Find items interested in my items (excluding items I also have criteria for - those are perfect matches)
    const inboundInterest: Array<{
      id: string
      my_item: {
        id: string
        type: "listing" | "collection_item"
        title: string
        subtitle: string | null
        images: string[]
        category: string | null
        subcategory: string | null
        condition: string | null
        price: number | null
        user_id: string
      }
      their_item: {
        id: string
        type: "listing" | "collection_item"
        title: string
        subtitle: string | null
        images: string[]
        category: string | null
        subcategory: string | null
        condition: string | null
        price: number | null
        user_id: string
        user?: Record<string, unknown>
      }
      their_criteria: Record<string, unknown>
      match_score: number
      created_at: string
    }> = []

    // Combine my items
    const myItems = [
      ...myListings.map((l) => ({
        ...l,
        type: "listing" as const,
        value: l.price,
        user_id: user.id,
      })),
      ...myCollectionItems.map((c) => ({
        ...c,
        type: "collection_item" as const,
        value: c.user_estimated_value || c.ai_suggested_value,
        user_id: user.id,
      })),
    ]

    for (const theirC of othersCriteria || []) {
      const theirItem = theirC.listing || theirC.collection_item
      if (!theirItem) continue

      for (const myItem of myItems) {
        // Check if their criteria matches my item
        const matches = doesItemMatchCriteria(
          {
            category: myItem.category,
            subcategory: myItem.subcategory,
            condition: myItem.condition,
            value: myItem.value,
          },
          theirC,
        )

        if (matches) {
          // Skip if this would be a perfect match (I have criteria for this item)
          if (myItemsWithCriteria.has(myItem.id)) continue

          const theirItemValue =
            theirC.listing?.price ||
            theirC.collection_item?.user_estimated_value ||
            theirC.collection_item?.ai_suggested_value

          const theirUser =
            theirC.listing?.seller || (theirC.collection_item?.collection as { user?: Record<string, unknown> })?.user

          inboundInterest.push({
            id: `${myItem.id}-${theirItem.id}`,
            my_item: {
              id: myItem.id,
              type: myItem.type,
              title: myItem.title,
              subtitle: myItem.subtitle,
              images: myItem.images || [],
              category: myItem.category,
              subcategory: myItem.subcategory,
              condition: myItem.condition,
              price: myItem.value,
              user_id: user.id,
            },
            their_item: {
              id: theirItem.id,
              type: theirC.listing ? "listing" : "collection_item",
              title: theirItem.title,
              subtitle: theirItem.subtitle,
              images: theirItem.images || [],
              category: theirC.listing?.category || theirC.collection_item?.category,
              subcategory: theirC.listing?.subcategory || theirC.collection_item?.subcategory,
              condition: theirC.listing?.condition || theirC.collection_item?.condition,
              price: theirItemValue,
              user_id: theirC.user_id,
              user: theirUser,
            },
            their_criteria: theirC,
            match_score: calculateMatchScore(myItem, theirC),
            created_at: new Date().toISOString(),
          })
        }
      }
    }

    // Deduplicate and sort by score
    const uniqueInterest = Array.from(new Map(inboundInterest.map((i) => [i.id, i])).values()).sort(
      (a, b) => b.match_score - a.match_score,
    )

    return NextResponse.json({ interests: uniqueInterest })
  } catch (error) {
    console.error("[v0] Inbound interest error:", error)
    return NextResponse.json({ error: "Failed to fetch inbound interest" }, { status: 500 })
  }
}

function doesItemMatchCriteria(
  item: { category: string | null; subcategory: string | null; condition: string | null; value: number | null },
  criteria: {
    target_category: string
    target_subcategories: string[] | null
    acceptable_conditions: string[] | null
    min_value: number | null
    max_value: number | null
    value_flexibility: string
  },
): boolean {
  // Category must match
  if (item.category?.toLowerCase() !== criteria.target_category?.toLowerCase()) {
    return false
  }

  // Subcategory check
  if (criteria.target_subcategories && criteria.target_subcategories.length > 0 && item.subcategory) {
    const matchesSubcategory = criteria.target_subcategories.some(
      (sub) => sub.toLowerCase() === item.subcategory?.toLowerCase(),
    )
    if (!matchesSubcategory) return false
  }

  // Condition check
  if (criteria.acceptable_conditions && criteria.acceptable_conditions.length > 0 && item.condition) {
    const matchesCondition = criteria.acceptable_conditions.some(
      (cond) => cond.toLowerCase() === item.condition?.toLowerCase(),
    )
    if (!matchesCondition) return false
  }

  // Value check
  if (item.value && criteria.value_flexibility !== "any") {
    if (criteria.min_value && item.value < criteria.min_value * 0.8) return false
    if (criteria.max_value && item.value > criteria.max_value * 1.2) return false
  }

  return true
}

function calculateMatchScore(
  myItem: { category: string | null; subcategory: string | null; condition: string | null; value: number | null },
  criteria: Record<string, unknown>,
): number {
  let score = 50

  // Subcategory match bonus
  const targetSubcats = criteria.target_subcategories as string[] | null
  if (targetSubcats && targetSubcats.length > 0 && myItem.subcategory) {
    if (targetSubcats.includes(myItem.subcategory)) score += 15
  }

  // Condition match bonus
  const acceptableConditions = criteria.acceptable_conditions as string[] | null
  if (acceptableConditions && acceptableConditions.length > 0 && myItem.condition) {
    if (acceptableConditions.includes(myItem.condition)) score += 10
  }

  // Value alignment bonus
  const minVal = criteria.min_value as number | null
  const maxVal = criteria.max_value as number | null
  if (myItem.value && (minVal || maxVal)) {
    const targetMid = ((minVal || 0) + (maxVal || minVal || 0)) / 2
    if (targetMid > 0) {
      const ratio = Math.min(myItem.value, targetMid) / Math.max(myItem.value, targetMid)
      score += Math.round(ratio * 25)
    }
  }

  return Math.min(100, score)
}
