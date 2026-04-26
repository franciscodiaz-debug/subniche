import { generateObject } from "ai"
import { z } from "zod"

const ListingEnhancementSchema = z.object({
  description: z.string().describe("A detailed, appealing product description based on the images and title"),
  condition: z.string().describe("Assessment of the item's condition based on visible wear in images"),
  brand: z.string().optional().describe("The brand/manufacturer if identifiable from images or title"),
  year: z.string().optional().describe("Estimated year or era if determinable"),
  color: z.string().describe("The primary color(s) of the item"),
  subtitle: z.string().describe("A short, catchy tagline for the listing"),
  confidence: z
    .object({
      description: z.enum(["high", "medium", "low"]),
      condition: z.enum(["high", "medium", "low"]),
      brand: z.enum(["high", "medium", "low"]),
      year: z.enum(["high", "medium", "low"]),
      color: z.enum(["high", "medium", "low"]),
      subtitle: z.enum(["high", "medium", "low"]),
    })
    .describe("Confidence levels for each field"),
})

export async function POST(request: Request) {
  try {
    const { images, title, category, subcategory } = await request.json()

    if (!images || images.length === 0) {
      return Response.json({ error: "No images provided" }, { status: 400 })
    }

    // Build the prompt with context
    const categoryContext = subcategory
      ? `Category: ${category} > ${subcategory}`
      : category
        ? `Category: ${category}`
        : ""

    const prompt = `You are helping a seller create a marketplace listing. Analyze the provided images and information to suggest details for their listing.

${title ? `Title: ${title}` : ""}
${categoryContext}

Based on the images and any provided context, generate:
1. A compelling product description (2-3 paragraphs)
2. An honest condition assessment based on what you can see
3. Brand identification if visible/identifiable
4. Year or era estimate if determinable
5. Primary color(s)
6. A catchy subtitle/tagline

Be accurate and honest. If you can't determine something with confidence, indicate that in your confidence rating. For condition, describe what you observe without making assumptions about things you can't see.`

    const imageContent = images.slice(0, 3).map((imageData: string) => ({
      type: "image" as const,
      image: imageData, // AI SDK handles both base64 data URLs and URLs
    }))

    const { object } = await generateObject({
      model: "anthropic/claude-sonnet-4.5",
      schema: ListingEnhancementSchema,
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: prompt }, ...imageContent],
        },
      ],
    })

    return Response.json(object)
  } catch (error) {
    console.error("[v0] Enhance listing error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return Response.json({ error: "Failed to enhance listing", details: errorMessage }, { status: 500 })
  }
}
