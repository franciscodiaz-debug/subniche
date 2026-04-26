import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Get trade match counts for notifications
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
    // Fetch both counts in parallel
    const [matchesRes, interestRes] = await Promise.all([
      fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL ? "" : ""}${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/api/trade-matches`,
        {
          headers: { cookie: "" }, // Will be handled by the request context
        },
      ).catch(() => null),
      fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL ? "" : ""}${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/api/inbound-interest`,
        {
          headers: { cookie: "" },
        },
      ).catch(() => null),
    ])

    // For now, do a simplified count query
    // Get my items
    const [listingsResult, collectionItemsResult] = await Promise.all([
      supabase.from("listings").select("id, category, subcategory, condition, price").eq("seller_id", user.id),
      supabase
        .from("collection_items")
        .select("id, category, subcategory, condition, user_estimated_value, collection:collections!inner(user_id)")
        .eq("for_trade", true)
        .eq("collections.user_id", user.id),
    ])

    const myItemCount = (listingsResult.data?.length || 0) + (collectionItemsResult.data?.length || 0)

    // Get criteria that might match my items
    const { data: othersCriteria } = await supabase
      .from("trade_criteria")
      .select("id")
      .neq("user_id", user.id)
      .eq("is_active", true)

    // Simplified counts - in production, you'd cache these
    return NextResponse.json({
      perfect_matches: 0, // Will be calculated properly when we have data
      inbound_interest: othersCriteria?.length || 0,
      my_tradeable_items: myItemCount,
    })
  } catch (error) {
    console.error("[v0] Trade counts error:", error)
    return NextResponse.json({
      perfect_matches: 0,
      inbound_interest: 0,
      my_tradeable_items: 0,
    })
  }
}
