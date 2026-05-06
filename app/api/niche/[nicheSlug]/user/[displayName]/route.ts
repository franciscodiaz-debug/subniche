import { NextRequest } from "next/server"
import { nicheProfileController } from "@/server/controllers/niche-profile.controller"

type Params = { params: Promise<{ nicheSlug: string; displayName: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const { nicheSlug, displayName } = await params
  return nicheProfileController.getByDisplayName(req, nicheSlug, displayName)
}
