import { NextRequest } from "next/server"
import { adminSpecificationValueController } from "@/server/controllers/admin/specification-value.controller"

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params
  return adminSpecificationValueController.getOne(req, id)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  return adminSpecificationValueController.update(req, id)
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params
  return adminSpecificationValueController.delete(req, id)
}
