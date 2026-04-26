import { generateObject } from "ai"
import { z } from "zod"

const tradeInterestSchema = z.object({
  tradeCriteria: z
    .array(
      z.object({
        category: z.string().describe("The category of items the user wants to trade for"),
        subcategories: z.array(z.string()).describe("Specific subcategories or types within the category"),
        conditions: z.array(z.string()).describe("Acceptable conditions: Mint, Excellent, Good, Fair, or Poor"),
        minValue: z.string().optional().describe("Minimum value in dollars, if mentioned"),
        maxValue: z.string().optional().describe("Maximum value in dollars, if mentioned"),
      }),
    )
    .describe("Array of trade interest criteria parsed from the user description"),
  reasoning: z.string().describe("Brief explanation of how you interpreted the user's request"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { description, listingCategory, listingSubcategory, listingTitle, listingPrice } = body

    if (!description) {
      return Response.json({ error: "Description is required" }, { status: 400 })
    }

    const availableCategories = ["Guitars", "Drums", "Keyboards", "Audio Equipment", "Accessories", "Other"]
    const subcategoryMap: Record<string, string[]> = {
      Guitars: ["Electric", "Acoustic", "Bass", "Classical", "Parts & Accessories"],
      Drums: ["Acoustic Kits", "Electronic Kits", "Cymbals", "Hardware", "Parts & Accessories"],
      Keyboards: ["Synthesizers", "Digital Pianos", "MIDI Controllers", "Organs", "Parts & Accessories"],
      "Audio Equipment": ["Amplifiers", "Microphones", "Interfaces", "Monitors", "Effects Pedals", "Mixers"],
      Accessories: ["Cases", "Stands", "Cables", "Straps", "Picks", "Other"],
      Other: ["Sheet Music", "Instructional", "Vintage", "Collectibles", "Other"],
    }
    const validConditions = ["Mint", "Excellent", "Good", "Fair", "Poor"]

    const result = await generateObject({
      model: "anthropic/claude-sonnet-4",
      schema: tradeInterestSchema,
      prompt: `You are helping a user set up trade interests for their marketplace listing.

The user is listing: "${listingTitle}" in category "${listingCategory}" > "${listingSubcategory}"${listingPrice ? ` valued at $${listingPrice}` : ""}.

They described what they want to trade for:
"${description}"

Parse their description and create trade interest criteria. Use ONLY these available categories and subcategories:

Categories: ${availableCategories.join(", ")}

Subcategories by category:
${Object.entries(subcategoryMap)
  .map(([cat, subs]) => `- ${cat}: ${subs.join(", ")}`)
  .join("\n")}

Valid conditions: ${validConditions.join(", ")}

Guidelines:
- Create 1-4 trade criteria based on what they mentioned
- Match their requests to the closest available categories/subcategories
- If they mention specific brands or models, include the broader category that would contain them
- If they mention value preferences, include minValue/maxValue
- If they don't specify conditions, default to ["Mint", "Excellent", "Good"] for quality items
- Be generous in interpretation - if they say "amp" include both "Amplifiers" in Audio Equipment and potentially guitar amps
- If the description is vague, create broader criteria that would match more items`,
    })

    return Response.json(result.object)
  } catch (error) {
    console.error("[v0] Process trade interest error:", error)
    return Response.json({ error: "Failed to process trade interest" }, { status: 500 })
  }
}
