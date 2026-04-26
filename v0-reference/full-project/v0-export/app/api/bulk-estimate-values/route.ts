import { generateObject } from "ai"
import { z } from "zod"

const bulkEstimateSchema = z.object({
  estimates: z.array(
    z.object({
      itemId: z.string().describe("The item ID this estimate is for"),
      estimatedValue: z.number().describe("Estimated market value in USD"),
      confidence: z.enum(["low", "medium", "high"]).describe("Confidence level"),
    }),
  ),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: "Items array is required" }, { status: 400 })
    }

    // Limit to 10 items per request
    const itemsToEstimate = items.slice(0, 10)

    const itemDescriptions = itemsToEstimate
      .map(
        (item: { id: string; title: string; subtitle?: string; condition?: string; category?: string }, i: number) =>
          `${i + 1}. ID: ${item.id}
   Title: ${item.title}
   ${item.subtitle ? `Subtitle: ${item.subtitle}` : ""}
   ${item.condition ? `Condition: ${item.condition}` : ""}
   ${item.category ? `Category: ${item.category}` : ""}`,
      )
      .join("\n\n")

    const result = await generateObject({
      model: "anthropic/claude-sonnet-4",
      schema: bulkEstimateSchema,
      prompt: `You are an expert appraiser for collectibles and enthusiast gear. Estimate the fair market value for each of the following items.

Items to estimate:
${itemDescriptions}

For each item, provide:
- The item ID (exactly as given)
- A realistic market value estimate in USD
- Your confidence level (low/medium/high)

Consider current market conditions, condition impact, rarity, and brand reputation.`,
    })

    return Response.json(result.object)
  } catch (error) {
    console.error("[v0] Bulk value estimation error:", error)
    return Response.json({ error: "Failed to estimate values" }, { status: 500 })
  }
}
