import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Fetch the URL content
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; WishlistBot/1.0)",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch URL")
    }

    const html = await response.text()

    // Use AI to extract product information from the HTML
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `Extract product information from this HTML content and return it as JSON with the following structure:
{
  "title": "product title",
  "subtitle": "variant, color, or model info if available",
  "description": "product description",
  "specifications": {
    "brand": "brand name",
    "color": "color",
    "year": "year if applicable"
  },
  "imageUrl": "main product image URL (full URL, not relative)"
}

HTML Content:
${html.slice(0, 10000)}

Return ONLY valid JSON, no additional text.`,
    })

    // Parse the AI response
    const productData = JSON.parse(text)

    return NextResponse.json(productData)
  } catch (error) {
    console.error("[v0] Error processing wishlist URL:", error)
    return NextResponse.json({ error: "Failed to process URL" }, { status: 500 })
  }
}
