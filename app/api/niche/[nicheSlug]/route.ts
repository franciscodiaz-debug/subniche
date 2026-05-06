import { NextRequest } from "next/server"
import { nicheController } from "@/server/controllers/niche.controller"

type Params = { params: Promise<{ nicheSlug: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { nicheSlug } = await params
  return nicheController.getBySlug(nicheSlug)
}
