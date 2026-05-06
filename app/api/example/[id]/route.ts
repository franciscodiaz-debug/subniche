// Route Handler — entry point for /api/example/[id]

import { NextRequest } from "next/server"
import { exampleController } from "@/server/controllers/example.controller"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  return exampleController.getOne(id)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  return exampleController.update(req, id)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  return exampleController.delete(id)
}
