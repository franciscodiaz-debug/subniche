import { NextRequest } from "next/server"
import { listingController } from "@/server/controllers/listing.controller"

type Params = { params: Promise<{ nicheSlug: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const { nicheSlug } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return listingController.getAll(req as any, nicheSlug)
}

export async function POST(req: NextRequest, { params }: Params) {
  const { nicheSlug } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return listingController.create(req as any, nicheSlug)
}
