import { NextRequest } from "next/server"
import { userController } from "@/server/controllers/user.controller"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  return userController.getOne(id)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  return userController.update(req, id)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  return userController.delete(id)
}
