/**
 * POST /api/trade-interest/parse
 *
 * Turns the Simple-mode free-text trade description into an array of partial
 * `TradeInterestItem` shapes. The client-side `parseSimpleToAdvanced` helper
 * (in `components/create-item/trade-interest-section.tsx`) calls this route,
 * normalizes/validates the result against the specs catalog, and then switches
 * the section into Advanced mode with pre-filled cards.
 *
 * We route through the Vercel AI Gateway (zero-config for Anthropic) using the
 * AI SDK's `generateText` rather than calling `api.anthropic.com` directly.
 * That keeps API keys off the client, matches the rest of this app's server
 * conventions, and lets us swap model providers by changing one string.
 */

import { generateText } from "ai"

import {
  SPECS_BY_CATEGORY_SUBCATEGORY,
  SUBCATEGORIES_BY_CATEGORY,
  TRADE_CATEGORIES,
  TRADE_CONDITIONS,
} from "@/lib/trade-specs"

// The AI SDK does NOT support Edge runtime — keep on Node.
export const runtime = "nodejs"

function buildSystemPrompt(): string {
  // Serialize the specs catalog compactly so the model knows exactly which
  // spec keys and option values are legal. We stringify it rather than
  // describing it in prose to avoid drift between the prompt and the runtime
  // catalog.
  const catalog = JSON.stringify(SPECS_BY_CATEGORY_SUBCATEGORY, null, 2)
  const subcats = JSON.stringify(SUBCATEGORIES_BY_CATEGORY, null, 2)

  return `You convert a lister's free-text description of what they'd accept in trade into structured trade-interest items.

Return a JSON array (and NOTHING else — no preamble, no Markdown fences). Each element is a partial TradeInterestItem with this shape:

{
  "category": "<one of the allowed categories>",
  "subcategory": "<one of the allowed subcategories for that category, or empty string>",
  "brand": "<brand name, or empty string>",
  "model": "<model name, or empty string>",
  "condition": "<one of the allowed condition values, or empty string>",
  "valueMin": "<number as string, or empty string>",
  "valueMax": "<number as string, or empty string>",
  "notes": "<free text under 140 chars, or empty string>",
  "specs": { "<specKey>": "<option value>" }
}

Allowed categories (use EXACTLY these strings, case-sensitive):
${TRADE_CATEGORIES.map((c) => `- ${c}`).join("\n")}

Allowed subcategories by category:
${subcats}

Allowed condition values (use EXACTLY these strings):
${TRADE_CONDITIONS.map((c) => `- ${c}`).join("\n")}

Allowed specs by (category, subcategory). Only emit keys and option values that appear below; drop anything else:
${catalog}

Rules:
- Split distinct things the user mentions into separate items. "60s Fender strats or a tube amp under $1500" → two items.
- Prefer coarse spec values when the user is vague (e.g. wattage "50-100 W" rather than a specific watt).
- If you cannot confidently fill a field, leave it as an empty string (or an empty object for specs).
- Never invent categories, subcategories, conditions, spec keys, or spec values that aren't in the lists above.
- If the text is empty or gives you nothing to extract, return [].
- Output ONLY the JSON array. No prose, no code fences.`
}

type ParsedBody = {
  text?: unknown
}

export async function POST(req: Request) {
  let body: ParsedBody
  try {
    body = (await req.json()) as ParsedBody
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const text = typeof body.text === "string" ? body.text.trim() : ""
  if (!text) {
    // Empty input is a client-side disable case; return an empty array so the
    // UI can still handle it gracefully without a "retry" branch.
    return Response.json({ items: [] })
  }

  try {
    const { text: raw } = await generateText({
      // Anthropic is zero-config in the Vercel AI Gateway.
      model: "anthropic/claude-sonnet-4-20250514",
      maxOutputTokens: 1000,
      system: buildSystemPrompt(),
      prompt: text,
    })

    // Defensive strip: some models occasionally wrap output in ```json fences
    // despite the system prompt forbidding it. Strip before JSON.parse.
    const cleaned = raw
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim()

    let parsed: unknown
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      // If the model returned prose anyway, treat it as an empty-result case
      // so the UI can show the friendly helper instead of a scary error.
      return Response.json({ items: [] })
    }

    if (!Array.isArray(parsed)) {
      return Response.json({ items: [] })
    }

    // Pass the raw items through — client-side normalizer is the single source
    // of truth for filling defaults, assigning ids, and dropping orphan specs.
    return Response.json({ items: parsed })
  } catch (error) {
    console.error("[v0] trade-interest parse error:", error)
    return Response.json(
      { error: "Failed to parse trade interest" },
      { status: 500 },
    )
  }
}
