import { NextRequest } from "next/server"
import { adminNicheController } from "@/server/controllers/admin/niche.controller"

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params
  return adminNicheController.getOne(req, id)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  return adminNicheController.update(req, id)
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params
  return adminNicheController.delete(req, id)
}
