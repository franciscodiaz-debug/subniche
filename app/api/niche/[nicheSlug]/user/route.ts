import { NextRequest } from "next/server"
import { nicheProfileController } from "@/server/controllers/niche-profile.controller"

type Params = { params: Promise<{ nicheSlug: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { nicheSlug } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return nicheProfileController.update(req as any, nicheSlug)
}
