import { NextRequest } from "next/server"
import { listingController } from "@/server/controllers/listing.controller"

type Params = { params: Promise<{ nicheSlug: string; listingSlug: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { nicheSlug, listingSlug } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return listingController.publish(req as any, nicheSlug, listingSlug)
}
