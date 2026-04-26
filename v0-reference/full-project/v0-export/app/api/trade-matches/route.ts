import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Get perfect matches - where both parties have mutual trade interest
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
    // Step 1: Get all my tradeable items (listings + collection items marked for_trade)
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

    // Step 2: Get my trade criteria
    const { data: myCriteria, error: criteriaError } = await supabase
      .from("trade_criteria")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)

    if (criteriaError) throw criteriaError

    // Step 3: Get other users' trade criteria that might match my items
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

    // Step 4: Find perfect matches
    const perfectMatches: Array<{
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
      my_criteria: Record<string, unknown>
      their_criteria: Record<string, unknown>
      match_score: number
      created_at: string
    }> = []

    // For each of my criteria, find items that match AND whose owner has criteria matching my items
    for (const myC of myCriteria || []) {
      // Find other items that match my criteria
      for (const theirC of othersCriteria || []) {
        const theirItem = theirC.listing || theirC.collection_item
        if (!theirItem) continue

        // Check if their item matches my criteria
        const theirItemCategory = theirC.listing?.category || theirC.collection_item?.category
        const theirItemSubcategory = theirC.listing?.subcategory || theirC.collection_item?.subcategory
        const theirItemCondition = theirC.listing?.condition || theirC.collection_item?.condition
        const theirItemValue =
          theirC.listing?.price ||
          theirC.collection_item?.user_estimated_value ||
          theirC.collection_item?.ai_suggested_value

        const myItemMatchesTheirCriteria = doesItemMatchCriteria(
          {
            category: theirItemCategory,
            subcategory: theirItemSubcategory,
            condition: theirItemCondition,
            value: theirItemValue,
          },
          myC,
        )

        if (!myItemMatchesTheirCriteria) continue

        // Now check if my items match their criteria
        const myItems = [
          ...myListings.map((l) => ({ ...l, type: "listing" as const, value: l.price })),
          ...myCollectionItems.map((c) => ({
            ...c,
            type: "collection_item" as const,
            value: c.user_estimated_value || c.ai_suggested_value,
            user_id: (c.collection as { user_id: string })?.user_id,
          })),
        ]

        for (const myItem of myItems) {
          // Skip if this isn't the item my criteria is for
          if (myC.listing_id && myC.listing_id !== myItem.id && myItem.type === "listing") continue
          if (myC.collection_item_id && myC.collection_item_id !== myItem.id && myItem.type === "collection_item")
            continue

          const theirCriteriaMatchesMyItem = doesItemMatchCriteria(
            {
              category: myItem.category,
              subcategory: myItem.subcategory,
              condition: myItem.condition,
              value: myItem.value,
            },
            theirC,
          )

          if (theirCriteriaMatchesMyItem) {
            // Calculate match score
            const score = calculateMatchScore(myC, theirC, myItem, theirItem)

            const theirUser =
              theirC.listing?.seller || (theirC.collection_item?.collection as { user?: Record<string, unknown> })?.user

            perfectMatches.push({
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
                category: theirItemCategory,
                subcategory: theirItemSubcategory,
                condition: theirItemCondition,
                price: theirItemValue,
                user_id: theirC.user_id,
                user: theirUser,
              },
              my_criteria: myC,
              their_criteria: theirC,
              match_score: score,
              created_at: new Date().toISOString(),
            })
          }
        }
      }
    }

    // Deduplicate matches
    const uniqueMatches = Array.from(new Map(perfectMatches.map((m) => [m.id, m])).values()).sort(
      (a, b) => b.match_score - a.match_score,
    )

    return NextResponse.json({ matches: uniqueMatches })
  } catch (error) {
    console.error("[v0] Trade matches error:", error)
    return NextResponse.json({ error: "Failed to fetch trade matches" }, { status: 500 })
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

  // Subcategory check (if criteria specifies subcategories)
  if (criteria.target_subcategories && criteria.target_subcategories.length > 0 && item.subcategory) {
    const matchesSubcategory = criteria.target_subcategories.some(
      (sub) => sub.toLowerCase() === item.subcategory?.toLowerCase(),
    )
    if (!matchesSubcategory) return false
  }

  // Condition check (if criteria specifies acceptable conditions)
  if (criteria.acceptable_conditions && criteria.acceptable_conditions.length > 0 && item.condition) {
    const matchesCondition = criteria.acceptable_conditions.some(
      (cond) => cond.toLowerCase() === item.condition?.toLowerCase(),
    )
    if (!matchesCondition) return false
  }

  // Value check based on flexibility
  if (item.value && criteria.value_flexibility !== "any") {
    if (criteria.min_value && item.value < criteria.min_value) {
      if (criteria.value_flexibility === "exact") return false
      // For flexible, allow 20% below
      if (item.value < criteria.min_value * 0.8) return false
    }
    if (criteria.max_value && item.value > criteria.max_value) {
      if (criteria.value_flexibility === "exact") return false
      // For flexible, allow 20% above
      if (item.value > criteria.max_value * 1.2) return false
    }
  }

  return true
}

function calculateMatchScore(
  myCriteria: Record<string, unknown>,
  theirCriteria: Record<string, unknown>,
  myItem: Record<string, unknown>,
  theirItem: Record<string, unknown>,
): number {
  let score = 50 // Base score for a match

  // Bonus for subcategory match
  const mySubcats = myCriteria.target_subcategories as string[] | null
  const theirSubcat = (theirItem as { subcategory?: string }).subcategory
  if (mySubcats && mySubcats.length > 0 && theirSubcat) {
    if (mySubcats.includes(theirSubcat)) score += 15
  }

  // Bonus for condition match
  const myConditions = myCriteria.acceptable_conditions as string[] | null
  const theirCondition = (theirItem as { condition?: string }).condition
  if (myConditions && myConditions.length > 0 && theirCondition) {
    if (myConditions.includes(theirCondition)) score += 10
  }

  // Bonus for value alignment
  const myValue = (myItem as { value?: number }).value
  const theirValue = (theirItem as { price?: number; value?: number }).price || (theirItem as { value?: number }).value
  if (myValue && theirValue) {
    const ratio = Math.min(myValue, theirValue) / Math.max(myValue, theirValue)
    score += Math.round(ratio * 25) // Up to 25 points for value match
  }

  return Math.min(100, score)
}
