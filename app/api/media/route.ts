import { NextRequest } from "next/server"
import { mediaController } from "@/server/controllers/media.controller"

/*
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  if (searchParams.has("mediable_type") || searchParams.has("mediable_id")) {
    return mediaController.getByMorphable(req)
  }
  return mediaController.getAll()
}
*/

export async function POST(req: NextRequest) {
  return mediaController.create(req)
}
