import { NextRequest } from "next/server"
import { categoryController } from "@/server/controllers/category.controller"

type Params = { params: Promise<{ nicheSlug: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { nicheSlug } = await params
  return categoryController.getByNiche(nicheSlug)
}
