import { generateObject } from "ai"
import { z } from "zod"

const valueEstimateSchema = z.object({
  estimatedValue: z.number().describe("Estimated market value in USD"),
  confidence: z.enum(["low", "medium", "high"]).describe("Confidence level of the estimate"),
  reasoning: z.string().describe("Brief explanation of how the value was determined"),
  comparables: z.array(z.string()).optional().describe("Similar items that informed the estimate"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, subtitle, description, condition, category } = body

    if (!title) {
      return Response.json({ error: "Title is required" }, { status: 400 })
    }

    const itemDescription = [
      title,
      subtitle,
      description,
      condition ? `Condition: ${condition}` : "",
      category ? `Category: ${category}` : "",
    ]
      .filter(Boolean)
      .join("\n")

    const result = await generateObject({
      model: "anthropic/claude-sonnet-4",
      schema: valueEstimateSchema,
      prompt: `You are an expert appraiser for collectibles and enthusiast gear. Estimate the fair market value of the following item.

Item Details:
${itemDescription}

Consider:
- Current market conditions and recent sales
- Condition impact on value
- Rarity and desirability
- Brand reputation and model significance

Provide a realistic market value estimate in USD. If information is limited, provide a reasonable range estimate based on the item category and description.`,
    })

    return Response.json(result.object)
  } catch (error) {
    console.error("[v0] Value estimation error:", error)
    return Response.json({ error: "Failed to estimate value" }, { status: 500 })
  }
}
