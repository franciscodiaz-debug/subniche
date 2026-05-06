import { NextRequest } from "next/server"
import { mediaController } from "@/server/controllers/media.controller"

type Params = { params: Promise<{ id: string }> }

/*
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  return mediaController.getOne(id)
}
*/

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params
  return mediaController.delete(req, id)
}
