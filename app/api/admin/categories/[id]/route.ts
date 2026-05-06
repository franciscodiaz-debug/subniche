import { NextRequest } from "next/server"
import { adminCategoryController } from "@/server/controllers/admin/category.controller"

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params
  return adminCategoryController.getOne(req, id)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  return adminCategoryController.update(req, id)
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params
  return adminCategoryController.delete(req, id)
}
