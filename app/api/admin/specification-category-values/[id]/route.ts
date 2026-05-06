import { NextRequest } from "next/server"
import { adminSpecificationCategoryValueController } from "@/server/controllers/admin/specification-category-value.controller"

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params
  return adminSpecificationCategoryValueController.getOne(req, id)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  return adminSpecificationCategoryValueController.update(req, id)
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params
  return adminSpecificationCategoryValueController.delete(req, id)
}
