import { NextRequest } from "next/server"
import { adminSpecificationController } from "@/server/controllers/admin/specification.controller"

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params
  return adminSpecificationController.getOne(req, id)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  return adminSpecificationController.update(req, id)
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params
  return adminSpecificationController.delete(req, id)
}
